import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export class CodexAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexAuthConfigurationError";
  }
}

export type CodexAuthTokenSource =
  | "STORY_COACH_CODEX_ACCESS_TOKEN"
  | "CODEX_ACCESS_TOKEN"
  | "STORY_COACH_CODEX_AUTH_PATH"
  | "CODEX_AUTH_PATH"
  | "CODEX_HOME"
  | "default_codex_auth_file";

export type CodexAuthResolution = {
  accessToken: string;
  source: CodexAuthTokenSource;
  authPath?: string;
  expiresAt?: Date;
};

export type CodexAuthEnv = Partial<NodeJS.ProcessEnv>;

function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new CodexAuthConfigurationError("Codex OAuth credentials can only be resolved on the server.");
  }
}

function expandHome(filePath: string): string {
  if (filePath === "~") {
    return homedir();
  }

  if (filePath.startsWith("~/")) {
    return path.join(homedir(), filePath.slice(2));
  }

  return filePath;
}

function resolveAuthPath(env: CodexAuthEnv): { authPath: string; source: CodexAuthTokenSource } {
  const storyCoachAuthPath = env.STORY_COACH_CODEX_AUTH_PATH?.trim();
  if (storyCoachAuthPath) {
    return {
      authPath: path.resolve(expandHome(storyCoachAuthPath)),
      source: "STORY_COACH_CODEX_AUTH_PATH",
    };
  }

  const codexAuthPath = env.CODEX_AUTH_PATH?.trim();
  if (codexAuthPath) {
    return {
      authPath: path.resolve(expandHome(codexAuthPath)),
      source: "CODEX_AUTH_PATH",
    };
  }

  const codexHome = env.CODEX_HOME?.trim();
  if (codexHome) {
    return {
      authPath: path.join(path.resolve(expandHome(codexHome)), "auth.json"),
      source: "CODEX_HOME",
    };
  }

  return {
    authPath: path.join(homedir(), ".codex", "auth.json"),
    source: "default_codex_auth_file",
  };
}

function parseJwtExpiration(accessToken: string): Date | undefined {
  const [, payload] = accessToken.split(".");

  if (!payload) {
    return undefined;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: unknown;
    };

    return typeof decoded.exp === "number" ? new Date(decoded.exp * 1000) : undefined;
  } catch {
    return undefined;
  }
}

function assertTokenFresh(accessToken: string, source: CodexAuthTokenSource, authPath?: string): Date | undefined {
  const expiresAt = parseJwtExpiration(accessToken);

  if (!expiresAt) {
    return undefined;
  }

  const expirationGraceMs = 60_000;
  if (expiresAt.getTime() <= Date.now() + expirationGraceMs) {
    const location = authPath ? ` at ${authPath}` : "";
    throw new CodexAuthConfigurationError(
      `Codex OAuth token from ${source}${location} is expired. Run codex login again or provide a fresh STORY_COACH_CODEX_ACCESS_TOKEN.`,
    );
  }

  return expiresAt;
}

function resolveEnvToken(
  source: Extract<CodexAuthTokenSource, "STORY_COACH_CODEX_ACCESS_TOKEN" | "CODEX_ACCESS_TOKEN">,
  accessToken: string,
): CodexAuthResolution {
  return {
    accessToken,
    source,
    expiresAt: assertTokenFresh(accessToken, source),
  };
}

function readCodexAuthFile(authPath: string, source: CodexAuthTokenSource): CodexAuthResolution | undefined {
  if (!existsSync(authPath)) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(readFileSync(authPath, "utf8"));
  } catch {
    throw new CodexAuthConfigurationError(`Could not read Codex OAuth credentials from ${authPath}.`);
  }

  const accessToken =
    typeof parsed === "object" &&
    parsed !== null &&
    "tokens" in parsed &&
    typeof parsed.tokens === "object" &&
    parsed.tokens !== null &&
    "access_token" in parsed.tokens &&
    typeof parsed.tokens.access_token === "string"
      ? parsed.tokens.access_token.trim()
      : "";

  if (!accessToken) {
    throw new CodexAuthConfigurationError(`Codex OAuth credentials at ${authPath} do not include tokens.access_token.`);
  }

  return {
    accessToken,
    source,
    authPath,
    expiresAt: assertTokenFresh(accessToken, source, authPath),
  };
}

export function resolveCodexAuth(env: CodexAuthEnv = process.env): CodexAuthResolution {
  assertServerRuntime();

  const storyCoachToken = env.STORY_COACH_CODEX_ACCESS_TOKEN?.trim();
  if (storyCoachToken) {
    return resolveEnvToken("STORY_COACH_CODEX_ACCESS_TOKEN", storyCoachToken);
  }

  const fallbackToken = env.CODEX_ACCESS_TOKEN?.trim();
  if (fallbackToken) {
    return resolveEnvToken("CODEX_ACCESS_TOKEN", fallbackToken);
  }

  const { authPath, source } = resolveAuthPath(env);
  const fileAuth = readCodexAuthFile(authPath, source);

  if (fileAuth) {
    return fileAuth;
  }

  throw new CodexAuthConfigurationError(
    "Codex OAuth is not configured. Set STORY_COACH_CODEX_ACCESS_TOKEN, set STORY_COACH_CODEX_AUTH_PATH, or sign in with Codex so ~/.codex/auth.json exists.",
  );
}
