import { describe, expect, it } from "vitest";
import { writeFinalBookStub } from "@/lib/ai/storyWriterStub";
import type { StoryBeatState } from "@/lib/story-state";

function beat(overrides: Partial<StoryBeatState> & Pick<StoryBeatState, "beatId" | "prompt" | "transcript">): StoryBeatState {
  return {
    mode: "drawThenDescribe",
    correctionTranscripts: [],
    accepted: true,
    generatedImageUrl: `/generated/${overrides.beatId}.png`,
    ...overrides,
  };
}

describe("writeFinalBookStub", () => {
  it("returns a deterministic six-page book from raw transcripts and accepted images", () => {
    const book = writeFinalBookStub([
      beat({
        beatId: "main-character",
        prompt: "Draw your main character",
        transcript: "His name is Jesse Marsh. He is a brave green dragon.",
      }),
      beat({
        beatId: "special",
        prompt: "Draw what makes them special",
        transcript: "Jesse has purple wings that sparkle.",
        correctionTranscripts: ["The wings sparkle when he tells the truth."],
      }),
      beat({
        beatId: "want",
        prompt: "What do they want most?",
        mode: "describe",
        transcript: "Jesse wants to find the moon kite before bedtime.",
      }),
      beat({
        beatId: "problem",
        prompt: "Draw what gets in their way",
        transcript: "A windy cloud maze gets in the way.",
      }),
      beat({
        beatId: "try",
        prompt: "Draw what they try",
        transcript: "Jesse asks fireflies to light the path.",
        accepted: false,
      }),
      beat({
        beatId: "ending",
        prompt: "Draw the ending",
        transcript: "Jesse catches the kite and shares its glow.",
      }),
    ]);

    expect(book.title).toBe("Jesse Marsh and the Moon Kite");
    expect(book.pages).toHaveLength(6);
    expect(book.pages[0]).toMatchObject({
      pageNumber: 1,
      beatId: "main-character",
      imageUrl: "/generated/main-character.png",
      text: "His name is Jesse Marsh. He is a brave green dragon.",
    });
    expect(book.pages[1].text).toContain("The wings sparkle when he tells the truth.");
    expect(book.pages[4].imageUrl).toBe("");
    expect(book.narrationText).toContain("Jesse catches the kite and shares its glow.");
  });
});
