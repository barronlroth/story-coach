import { resolveCodexAuth, type CodexAuthEnv } from "@/lib/ai/codexAuth";

export const DEFAULT_CODEX_RESPONSES_ENDPOINT = "https://chatgpt.com/backend-api/codex/responses";

export class CodexResponsesConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexResponsesConfigurationError";
  }
}

export class CodexResponsesRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexResponsesRequestError";
  }
}

export type CodexResponsesClientConfig = {
  endpointUrl: string;
  accessToken: string;
  fetchFn?: typeof fetch;
};

export type CodexResponsesClient = {
  createResponse(payload: Record<string, unknown>): Promise<unknown>;
};

function resolveEndpointUrl(env: CodexAuthEnv): string {
  const endpointUrl = env.STORY_COACH_CODEX_RESPONSES_URL?.trim() || env.CODEX_RESPONSES_URL?.trim();

  return endpointUrl || DEFAULT_CODEX_RESPONSES_ENDPOINT;
}

function parseJsonPayload(value: string): unknown | undefined {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function parseCodexEventStream(value: string): unknown {
  const events: unknown[] = [];
  const doneTexts: string[] = [];
  const deltaTexts: string[] = [];
  const imageBase64Values: string[] = [];
  let completedResponse: unknown;

  for (const eventBlock of value.split(/\r?\n\r?\n/)) {
    const dataLines = eventBlock
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trim());

    if (dataLines.length === 0) {
      continue;
    }

    const parsed = parseJsonPayload(dataLines.join("\n"));
    if (!parsed || typeof parsed !== "object") {
      continue;
    }

    const event = parsed as Record<string, unknown>;

    if (event.type === "response.output_text.done" && typeof event.text === "string") {
      doneTexts.push(event.text);
    }

    if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
      deltaTexts.push(event.delta);
    }

    if (event.type === "response.image_generation_call.partial_image" && typeof event.partial_image_b64 === "string") {
      imageBase64Values.push(event.partial_image_b64);
    }

    if (event.type === "response.completed") {
      completedResponse = event.response;
    }

    events.push(
      typeof event.partial_image_b64 === "string"
        ? {
            ...event,
            partial_image_b64: "[image omitted]",
          }
        : event,
    );
  }

  const outputText = doneTexts.length > 0 ? doneTexts.join("\n") : deltaTexts.join("");

  return {
    output_text: outputText,
    image_b64: imageBase64Values.at(-1),
    response: completedResponse,
    events,
  };
}

async function parseCodexResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();
  const jsonPayload = parseJsonPayload(responseText);

  if (jsonPayload) {
    return jsonPayload;
  }

  return parseCodexEventStream(responseText);
}

export function createCodexResponsesClient(
  config?: Partial<CodexResponsesClientConfig>,
  env: CodexAuthEnv = process.env,
): CodexResponsesClient {
  const auth = config?.accessToken
    ? { accessToken: config.accessToken }
    : resolveCodexAuth(env);
  const endpointUrl = config?.endpointUrl?.trim() || resolveEndpointUrl(env);
  const fetchFn = config?.fetchFn ?? fetch;

  return {
    async createResponse(payload: Record<string, unknown>): Promise<unknown> {
      const response = await fetchFn(endpointUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          stream: true,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        const safeDetail = responseText.slice(0, 500);
        throw new CodexResponsesRequestError(
          `Codex Responses request failed with status ${response.status}: ${safeDetail}`,
        );
      }

      return parseCodexResponse(response);
    },
  };
}
