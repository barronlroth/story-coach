// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveCodexAuth } from "@/lib/ai/codexAuth";

const tempDirs: string[] = [];

function createTempDir(): string {
  const tempDir = mkdtempSync(path.join(tmpdir(), "story-coach-codex-auth-"));
  tempDirs.push(tempDir);

  return tempDir;
}

function fakeJwt(exp: number, suffix = "sig"): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");

  return `${header}.${payload}.${suffix}`;
}

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("resolveCodexAuth", () => {
  it("prefers the Story Coach env token", () => {
    const resolution = resolveCodexAuth({
      STORY_COACH_CODEX_ACCESS_TOKEN: fakeJwt(4_102_444_800),
      CODEX_ACCESS_TOKEN: "fallback-token",
    });

    expect(resolution.source).toBe("STORY_COACH_CODEX_ACCESS_TOKEN");
    expect(resolution.accessToken).toContain(".");
    expect(resolution.expiresAt?.toISOString()).toBe("2100-01-01T00:00:00.000Z");
  });

  it("reads a local Codex auth file when env tokens are absent", () => {
    const tempDir = createTempDir();
    const authPath = path.join(tempDir, "auth.json");
    const accessToken = fakeJwt(4_102_444_800);

    writeFileSync(
      authPath,
      JSON.stringify({
        tokens: {
          access_token: accessToken,
          refresh_token: "refresh-token-that-must-stay-server-side",
        },
      }),
    );

    expect(resolveCodexAuth({ STORY_COACH_CODEX_AUTH_PATH: authPath })).toMatchObject({
      accessToken,
      authPath,
      source: "STORY_COACH_CODEX_AUTH_PATH",
    });
  });

  it("rejects expired OAuth tokens without exposing the token", () => {
    const expiredToken = fakeJwt(1, "secret-token-that-must-not-leak");

    expect(() => resolveCodexAuth({ STORY_COACH_CODEX_ACCESS_TOKEN: expiredToken })).toThrow(
      /Codex OAuth token from STORY_COACH_CODEX_ACCESS_TOKEN is expired/,
    );

    try {
      resolveCodexAuth({ STORY_COACH_CODEX_ACCESS_TOKEN: expiredToken });
    } catch (error) {
      expect(String(error)).not.toContain(expiredToken);
      expect(String(error)).not.toContain("secret-token-that-must-not-leak");
    }
  });

  it("fails clearly when neither env nor file credentials are available", () => {
    const missingAuthPath = path.join(createTempDir(), "missing-auth.json");

    expect(() => resolveCodexAuth({ STORY_COACH_CODEX_AUTH_PATH: missingAuthPath })).toThrow(
      "Codex OAuth is not configured",
    );
  });
});
