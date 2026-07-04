export class CodexAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexAuthConfigurationError";
  }
}

export type CodexAuthTokenSource = "STORY_COACH_CODEX_ACCESS_TOKEN" | "CODEX_ACCESS_TOKEN";

export type CodexAuthResolution = {
  accessToken: string;
  source: CodexAuthTokenSource;
};

function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new CodexAuthConfigurationError("Codex OAuth credentials can only be resolved on the server.");
  }
}

export function resolveCodexAuth(env: NodeJS.ProcessEnv = process.env): CodexAuthResolution {
  assertServerRuntime();

  const storyCoachToken = env.STORY_COACH_CODEX_ACCESS_TOKEN?.trim();
  if (storyCoachToken) {
    return {
      accessToken: storyCoachToken,
      source: "STORY_COACH_CODEX_ACCESS_TOKEN",
    };
  }

  const fallbackToken = env.CODEX_ACCESS_TOKEN?.trim();
  if (fallbackToken) {
    return {
      accessToken: fallbackToken,
      source: "CODEX_ACCESS_TOKEN",
    };
  }

  throw new CodexAuthConfigurationError(
    "Codex OAuth is not configured. Set STORY_COACH_CODEX_ACCESS_TOKEN on the server, or use the stub image provider.",
  );
}
