import {
  createCodexResponsesClient,
  type CodexResponsesClient,
} from "@/lib/ai/codexResponsesClient";
import type { CodexAuthEnv } from "@/lib/ai/codexAuth";
import { buildFinalBookPrompt, FINAL_BOOK_JSON_SCHEMA } from "@/lib/prompts/finalBookPrompt";
import type { FinalBook, StoryBeatState } from "@/lib/story-state";

type CodexFinalBookPage = {
  pageNumber: number;
  beatId: string;
  text: string;
};

type CodexFinalBookPayload = {
  title: string;
  pages: CodexFinalBookPage[];
  narrationText: string;
};

export type CodexStoryWriterOptions = {
  client?: CodexResponsesClient;
  env?: CodexAuthEnv;
};

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error("codexStoryWriter can only be used on the server.");
  }
}

function resolveStoryWriterModel(env: CodexAuthEnv): string {
  return (
    env.STORY_COACH_CODEX_STORY_MODEL?.trim() ||
    env.CODEX_STORY_WRITER_MODEL?.trim() ||
    env.STORY_COACH_CODEX_RESPONSE_MODEL?.trim() ||
    "gpt-5.4"
  );
}

function textFromContentItem(item: unknown): string {
  if (!item || typeof item !== "object") {
    return "";
  }

  const record = item as Record<string, unknown>;
  const text = record.text ?? record.output_text;

  return typeof text === "string" ? text : "";
}

export function extractTextFromCodexResponse(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["output_text", "text", "response"]) {
    const value = record[key];

    if (typeof value === "string") {
      return value;
    }
  }

  if (Array.isArray(record.output)) {
    return record.output
      .flatMap((item) => {
        if (!item || typeof item !== "object") {
          return [];
        }

        const content = (item as Record<string, unknown>).content;

        return Array.isArray(content) ? content.map(textFromContentItem) : [textFromContentItem(item)];
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function stripCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseCodexFinalBook(value: string): CodexFinalBookPayload {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripCodeFence(value));
  } catch {
    throw new Error("Codex story writer returned text that was not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Codex story writer returned an invalid final book payload.");
  }

  const payload = parsed as Partial<CodexFinalBookPayload>;

  if (typeof payload.title !== "string" || typeof payload.narrationText !== "string" || !Array.isArray(payload.pages)) {
    throw new Error("Codex story writer response is missing title, pages, or narrationText.");
  }

  if (payload.pages.length !== 6) {
    throw new Error(`Codex story writer returned ${payload.pages.length} pages; expected 6.`);
  }

  payload.pages.forEach((page, index) => {
    if (
      !page ||
      typeof page !== "object" ||
      page.pageNumber !== index + 1 ||
      typeof page.beatId !== "string" ||
      typeof page.text !== "string"
    ) {
      throw new Error("Codex story writer returned an invalid page entry.");
    }
  });

  return payload as CodexFinalBookPayload;
}

function imageUrlForBeat(beats: StoryBeatState[], beatId: string): string {
  const beat = beats.find((item) => item.beatId === beatId);

  return beat?.accepted && beat.generatedImageUrl ? beat.generatedImageUrl : "";
}

export async function writeFinalBookWithCodex(
  beats: StoryBeatState[],
  options: CodexStoryWriterOptions = {},
): Promise<FinalBook> {
  assertServerOnly();

  const env = options.env ?? process.env;
  const model = resolveStoryWriterModel(env);
  const client = options.client ?? createCodexResponsesClient(undefined, env);
  const prompt = buildFinalBookPrompt(beats);
  const rawPayload = await client.createResponse({
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: prompt.system }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: prompt.user }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "final_book",
        schema: FINAL_BOOK_JSON_SCHEMA,
        strict: true,
      },
    },
  });
  const text = extractTextFromCodexResponse(rawPayload);

  if (!text) {
    throw new Error("Codex story writer response did not contain output text.");
  }

  const finalBook = parseCodexFinalBook(text);

  return {
    title: finalBook.title,
    narrationText: finalBook.narrationText,
    pages: finalBook.pages.map((page) => ({
      ...page,
      imageUrl: imageUrlForBeat(beats, page.beatId),
    })),
  };
}
