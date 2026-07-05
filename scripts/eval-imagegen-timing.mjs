import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

const DEFAULT_ENDPOINT = "https://chatgpt.com/backend-api/codex/responses";
const DEFAULT_PROMPT =
  "Draw a polished children's book illustration of a small red dragon named Jesse Marsh standing proudly beside a messy crayon sketch on warm paper. Keep it friendly, readable, and suitable for a tablet story-building app.";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value.startsWith("--")) {
      continue;
    }

    const key = value.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

async function readEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    const values = {};

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const equalsIndex = line.indexOf("=");

      if (equalsIndex === -1) {
        continue;
      }

      const key = line.slice(0, equalsIndex).trim();
      const value = line
        .slice(equalsIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      values[key] = value;
    }

    return values;
  } catch {
    return {};
  }
}

function expandHome(filePath) {
  if (filePath === "~") {
    return os.homedir();
  }

  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }

  return filePath;
}

async function resolveAccessToken(env) {
  if (env.STORY_COACH_CODEX_ACCESS_TOKEN) {
    return env.STORY_COACH_CODEX_ACCESS_TOKEN;
  }

  if (env.CODEX_ACCESS_TOKEN) {
    return env.CODEX_ACCESS_TOKEN;
  }

  const authPath = expandHome(env.STORY_COACH_CODEX_AUTH_PATH || path.join(os.homedir(), ".codex/auth.json"));
  const authPayload = JSON.parse(await readFile(authPath, "utf8"));
  const accessToken = authPayload?.tokens?.access_token;

  if (!accessToken) {
    throw new Error(`Could not find a Codex access token in ${authPath}`);
  }

  return accessToken;
}

function parseCsv(value, fallback) {
  return (value || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeErrorPayload(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const error = value.error;

  if (!error || typeof error !== "object") {
    return value;
  }

  return {
    message: error.message,
    type: error.type,
    param: error.param,
    code: error.code,
  };
}

function parseEventData(block) {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim())
    .join("\n");

  if (!data) {
    return undefined;
  }

  try {
    return JSON.parse(data);
  } catch {
    return undefined;
  }
}

function createStreamSummary() {
  const timings = {};
  const summary = {
    responseId: undefined,
    responseModel: undefined,
    reasoning: undefined,
    revisedPromptLength: undefined,
    finalStatus: undefined,
    imageBytes: 0,
    imageBase64: undefined,
    eventTypes: [],
  };

  return {
    ingest(event, elapsedMs) {
      if (!event || typeof event !== "object") {
        return;
      }

      const type = event.type;

      if (typeof type === "string") {
        summary.eventTypes.push(type);
        timings[type] ??= elapsedMs;
      }

      if (type === "response.created") {
        summary.responseId = event.response?.id;
        summary.responseModel = event.response?.model;
        summary.reasoning = event.response?.reasoning;
      }

      if (type === "response.image_generation_call.partial_image" && typeof event.partial_image_b64 === "string") {
        summary.imageBytes = Math.max(summary.imageBytes, Buffer.byteLength(event.partial_image_b64, "base64"));
        summary.imageBase64 = event.partial_image_b64;
      }

      if (type === "response.output_item.done") {
        if (typeof event.item?.revised_prompt === "string") {
          summary.revisedPromptLength = event.item.revised_prompt.length;
        }

        if (typeof event.item?.result === "string") {
          summary.imageBytes = Math.max(summary.imageBytes, Buffer.byteLength(event.item.result, "base64"));
          summary.imageBase64 = event.item.result;
        }
      }

      if (type === "response.completed") {
        summary.finalStatus = event.response?.status;
        summary.responseId = summary.responseId || event.response?.id;
        summary.responseModel = summary.responseModel || event.response?.model;
        summary.reasoning = summary.reasoning || event.response?.reasoning;
      }
    },
    result() {
      return {
        ...summary,
        firstImageMs: timings["response.image_generation_call.partial_image"],
        generatingMs: timings["response.image_generation_call.generating"],
        outputDoneMs: timings["response.output_item.done"],
        streamCompletedEventMs: timings["response.completed"],
      };
    },
  };
}

async function summarizeStream(response, startedAt) {
  if (!response.body) {
    throw new Error("Codex response did not include a readable stream body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const summary = createStreamSummary();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    buffer += decoder.decode(value, { stream: !done });

    while (true) {
      const separatorMatch = buffer.match(/\r?\n\r?\n/);

      if (!separatorMatch || separatorMatch.index === undefined) {
        break;
      }

      const eventBlock = buffer.slice(0, separatorMatch.index);
      buffer = buffer.slice(separatorMatch.index + separatorMatch[0].length);
      summary.ingest(parseEventData(eventBlock), Math.round(performance.now() - startedAt));
    }

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    summary.ingest(parseEventData(buffer), Math.round(performance.now() - startedAt));
  }

  return summary.result();
}

function summarizeBufferedStream(responseText) {
  const summary = createStreamSummary();
  const eventTypes = [];

  for (const block of responseText.split(/\r?\n\r?\n/)) {
    const event = parseEventData(block);

    if (!event || typeof event !== "object") {
      continue;
    }

    eventTypes.push(event.type);
    summary.ingest(event, undefined);
  }

  return { ...summary.result(), eventTypes };
}

async function runCase({ endpoint, token, responseModel, imageModel, reasoningEffort, prompt, quality, size, outputFormat }) {
  const payload = {
    model: responseModel,
    store: false,
    reasoning: { effort: reasoningEffort },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: prompt,
          },
        ],
      },
    ],
    tools: [
      {
        type: "image_generation",
        model: imageModel,
        quality,
        size,
        output_format: outputFormat,
      },
    ],
    tool_choice: { type: "image_generation" },
    stream: true,
  };

  const startedAt = performance.now();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();
    const completedMs = Math.round(performance.now() - startedAt);
    let parsed;

    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { message: responseText.slice(0, 500) };
    }

    return {
      quality,
      size,
      outputFormat,
      ok: false,
      status: response.status,
      completedMs,
      error: safeErrorPayload(parsed),
    };
  }

  const streamSummary = await summarizeStream(response, startedAt);
  const completedMs = Math.round(performance.now() - startedAt);

  return {
    quality,
    size,
    outputFormat,
    ok: true,
    status: response.status,
    ...streamSummary,
    completedMs,
  };
}

function formatMs(ms) {
  if (typeof ms !== "number") {
    return "-";
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

function imageExtensionForFormat(outputFormat) {
  return outputFormat === "jpeg" ? "jpg" : outputFormat;
}

function safeFilePart(value) {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-|-$/g, "");
}

function toMarkdown(report) {
  const rows = report.results.map((result) => {
    const imageKb = result.imageBytes ? `${Math.round(result.imageBytes / 1024)} KB` : "-";
    const imageCell = result.imagePath ? `![${result.size} ${result.quality}](${result.imagePath})` : "-";

    return [
      imageCell,
      result.size,
      result.quality,
      result.ok ? "ok" : `error ${result.status}`,
      formatMs(result.firstImageMs),
      formatMs(result.completedMs),
      imageKb,
      result.error?.message || "",
    ];
  });

  return [
    "# Image Generation Timing Eval",
    "",
    `- Ran at: ${report.ranAt}`,
    `- Response model: \`${report.config.responseModel}\``,
    `- Reasoning effort: \`${report.config.reasoningEffort}\``,
    `- Image model: \`${report.config.imageModel}\``,
    `- Output format: \`${report.config.outputFormat}\``,
    `- Trials per combo: \`${report.config.trials}\``,
    "",
    "Prompt:",
    "",
    `> ${report.config.prompt}`,
    "",
    "| Image | Resolution | Quality | Status | First image | Complete | Image bytes | Error |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | --- |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
    "Notes:",
    "",
    "- Results are sequential single-run timings, so they are useful for directional comparison rather than statistical certainty.",
    "- `Resolution` is the Codex image generation `size` parameter.",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fileEnv = {
    ...(await readEnvFile(".env.local")),
    ...(await readEnvFile(".env")),
  };
  const env = { ...process.env, ...fileEnv };
  const token = await resolveAccessToken(env);
  const endpoint = args.endpoint || env.STORY_COACH_CODEX_RESPONSES_URL || env.CODEX_RESPONSES_URL || DEFAULT_ENDPOINT;
  const responseModel = args["response-model"] || env.STORY_COACH_CODEX_IMAGE_RESPONSE_MODEL || env.STORY_COACH_CODEX_RESPONSE_MODEL || "gpt-5.5";
  const imageModel = args["image-model"] || env.STORY_COACH_CODEX_IMAGE_MODEL || "gpt-image-2";
  const reasoningEffort = args.reasoning || "none";
  const outputFormat = args["output-format"] || "png";
  const saveImages = args["save-images"] !== "false";
  const prompt = args.prompt || DEFAULT_PROMPT;
  const qualities = parseCsv(args.qualities, "low,medium,high");
  const sizes = parseCsv(args.sizes, "1024x1024,1536x1024");
  const trials = Number.parseInt(args.trials || "1", 10);
  const ranAt = new Date().toISOString();
  const results = [];

  if (!Number.isFinite(trials) || trials < 1) {
    throw new Error("--trials must be a positive integer");
  }

  const stamp = ranAt.replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const outDir = path.join("docs", "evals");
  const imageDir = path.join(outDir, `imagegen-timing-${stamp}-images`);

  if (saveImages) {
    await mkdir(imageDir, { recursive: true });
  }

  for (let trial = 1; trial <= trials; trial += 1) {
    for (const size of sizes) {
      for (const quality of qualities) {
        process.stdout.write(`Running trial ${trial}/${trials}: size=${size} quality=${quality}... `);
        const result = await runCase({
          endpoint,
          token,
          responseModel,
          imageModel,
          reasoningEffort,
          prompt,
          quality,
          size,
          outputFormat,
        });

        if (saveImages && result.ok && result.imageBase64) {
          const imageName = [
            `trial-${trial}`,
            safeFilePart(size),
            safeFilePart(quality),
          ].join("-");
          const imagePath = path.join(imageDir, `${imageName}.${imageExtensionForFormat(outputFormat)}`);

          await writeFile(imagePath, Buffer.from(result.imageBase64, "base64"));
          result.imagePath = imagePath;
        }

        delete result.imageBase64;
        results.push({ trial, ...result });
        process.stdout.write(`${result.ok ? "ok" : "error"} complete=${formatMs(result.completedMs)} first=${formatMs(result.firstImageMs)}\n`);
      }
    }
  }

  const report = {
    ranAt,
    config: {
      endpoint,
      responseModel,
      imageModel,
      reasoningEffort,
      outputFormat,
      prompt,
      qualities,
      sizes,
      trials,
    },
    results,
  };
  const jsonPath = path.join(outDir, `imagegen-timing-${stamp}.json`);
  const markdownPath = path.join(outDir, `imagegen-timing-${stamp}.md`);

  await mkdir(outDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, `${toMarkdown(report)}\n`);

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${markdownPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
