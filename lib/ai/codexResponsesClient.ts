import { resolveCodexAuth } from "@/lib/ai/codexAuth";

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

function resolveEndpointUrl(env: NodeJS.ProcessEnv): string {
  const endpointUrl = env.STORY_COACH_CODEX_RESPONSES_URL?.trim() || env.CODEX_RESPONSES_URL?.trim();

  if (!endpointUrl) {
    throw new CodexResponsesConfigurationError(
      "Codex Responses endpoint is not configured. Set STORY_COACH_CODEX_RESPONSES_URL on the server, or use the stub image provider.",
    );
  }

  return endpointUrl;
}

export function createCodexResponsesClient(
  config?: Partial<CodexResponsesClientConfig>,
  env: NodeJS.ProcessEnv = process.env,
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        const safeDetail = responseText.slice(0, 500);
        throw new CodexResponsesRequestError(
          `Codex Responses request failed with status ${response.status}: ${safeDetail}`,
        );
      }

      return response.json();
    },
  };
}
