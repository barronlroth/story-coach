// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { extractTextFromCodexResponse, writeFinalBookWithCodex } from "@/lib/ai/codexStoryWriter";
import { createSeedSession } from "@/lib/seed-data";
import type { StoryBeatState } from "@/lib/story-state";

function acceptedSeedBeats(): StoryBeatState[] {
  return createSeedSession().beats.map((beat) => ({
    ...beat,
    accepted: true,
  }));
}

function finalBookResponseText(): string {
  return JSON.stringify({
    title: "Jesse Marsh and the Moon Kite",
    pages: [
      { pageNumber: 1, beatId: "main-character", text: "Jesse was a brave dragon." },
      { pageNumber: 2, beatId: "special", text: "His wings sparkled when he told the truth." },
      { pageNumber: 3, beatId: "want", text: "He wanted to find the moon kite." },
      { pageNumber: 4, beatId: "problem", text: "A cloud maze got in the way." },
      { pageNumber: 5, beatId: "try", text: "He built a ladder with firefly lights." },
      { pageNumber: 6, beatId: "ending", text: "He shared the moon kite with the stars." },
    ],
    narrationText:
      "Jesse was a brave dragon. His wings sparkled when he told the truth. He wanted to find the moon kite. A cloud maze got in the way. He built a ladder with firefly lights. He shared the moon kite with the stars.",
  });
}

describe("writeFinalBookWithCodex", () => {
  it("fails clearly when Codex credentials are not configured", async () => {
    await expect(
      writeFinalBookWithCodex([], {
        env: {
          STORY_COACH_CODEX_AUTH_PATH: "/tmp/story-coach-missing-codex-auth.json",
        },
      }),
    ).rejects.toThrow(
      "Codex OAuth is not configured. Set STORY_COACH_CODEX_ACCESS_TOKEN, set STORY_COACH_CODEX_AUTH_PATH, or sign in with Codex so ~/.codex/auth.json exists.",
    );
  });

  it("sends the final-book JSON schema request through the shared Codex client", async () => {
    const createResponse = vi.fn().mockResolvedValue({
      output: [
        {
          content: [{ type: "output_text", text: finalBookResponseText() }],
        },
      ],
    });
    const beats = acceptedSeedBeats();
    const book = await writeFinalBookWithCodex(beats, {
      client: { createResponse },
      env: {
        STORY_COACH_CODEX_STORY_MODEL: "gpt-story-test",
      },
    });

    expect(createResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-story-test",
        store: false,
        text: {
          format: expect.objectContaining({
            type: "json_schema",
            name: "final_book",
            strict: true,
          }),
        },
      }),
    );
    expect(book.title).toBe("Jesse Marsh and the Moon Kite");
    expect(book.pages[0].imageUrl).toBe("/generated/demo/main-character.png");
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
