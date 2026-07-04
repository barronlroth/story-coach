// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import { extractTextFromCodexResponse, writeFinalBookWithCodex } from "@/lib/ai/codexStoryWriter";

const originalAccessToken = process.env.CODEX_ACCESS_TOKEN;
const originalModel = process.env.CODEX_STORY_WRITER_MODEL;

afterEach(() => {
  process.env.CODEX_ACCESS_TOKEN = originalAccessToken;
  process.env.CODEX_STORY_WRITER_MODEL = originalModel;
});

describe("writeFinalBookWithCodex", () => {
  it("fails clearly when Codex credentials are not configured", async () => {
    delete process.env.CODEX_ACCESS_TOKEN;
    delete process.env.CODEX_STORY_WRITER_MODEL;

    await expect(writeFinalBookWithCodex([])).rejects.toThrow(
      "Codex story writer is not configured. Set CODEX_ACCESS_TOKEN and CODEX_STORY_WRITER_MODEL, or use the local stub writer.",
    );
  });
});

describe("extractTextFromCodexResponse", () => {
  it("reads text from a Responses-style output payload", () => {
    expect(
      extractTextFromCodexResponse({
        output: [
          {
            content: [{ type: "output_text", text: "{\"title\":\"Jesse\"}" }],
          },
        ],
      }),
    ).toBe("{\"title\":\"Jesse\"}");
  });
});
