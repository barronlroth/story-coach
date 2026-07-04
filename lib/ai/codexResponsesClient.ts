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
