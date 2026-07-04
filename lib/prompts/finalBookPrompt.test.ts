import { describe, expect, it } from "vitest";
import { buildFinalBookPrompt, buildFinalBookPromptBeats } from "@/lib/prompts/finalBookPrompt";
import type { StoryBeatState } from "@/lib/story-state";

function beat(overrides: Partial<StoryBeatState> & Pick<StoryBeatState, "beatId" | "prompt">): StoryBeatState {
  return {
    mode: "drawThenDescribe",
    correctionTranscripts: [],
    accepted: true,
    ...overrides,
  };
}

describe("buildFinalBookPrompt", () => {
  it("includes prompts, transcripts, correction transcripts, and accepted image URLs", () => {
    const beats: StoryBeatState[] = [
      beat({
        beatId: "main-character",
        prompt: "Draw your main character",
        transcript: "His name is Jesse Marsh.",
        correctionTranscripts: ["Make the wings purple."],
        generatedImageUrl: "/generated/main.png",
      }),
      beat({
        beatId: "special",
        prompt: "Draw what makes them special",
        transcript: "His wings sparkle when he tells the truth.",
        generatedImageUrl: "/generated/special.png",
      }),
      beat({
        beatId: "want",
        prompt: "What do they want most?",
        mode: "describe",
        transcript: "Jesse wants to find the moon kite.",
        generatedImageUrl: "/generated/want.png",
      }),
      beat({
        beatId: "problem",
        prompt: "Draw what gets in their way",
        transcript: "A cloud maze blocks the path.",
        generatedImageUrl: "/generated/problem.png",
      }),
      beat({
        beatId: "try",
        prompt: "Draw what they try",
        transcript: "Jesse asks fireflies to help.",
        generatedImageUrl: "/generated/try.png",
      }),
      beat({
        beatId: "ending",
        prompt: "Draw the ending",
        transcript: "Jesse catches the kite.",
        accepted: false,
        generatedImageUrl: "/generated/not-accepted.png",
      }),
    ];

    const prompt = buildFinalBookPrompt(beats);
    const promptBeats = buildFinalBookPromptBeats(beats);

    expect(prompt.user).toContain("Draw your main character");
    expect(prompt.user).toContain("His name is Jesse Marsh.");
    expect(prompt.user).toContain("Make the wings purple.");
    expect(prompt.user).toContain("/generated/main.png");
    expect(prompt.user).toContain("What do they want most?");
    expect(prompt.user).not.toContain("/generated/not-accepted.png");
    expect(promptBeats).toHaveLength(6);
    expect(promptBeats[5].acceptedImageUrl).toBeNull();
  });
});
