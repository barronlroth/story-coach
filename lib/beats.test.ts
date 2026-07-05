import { describe, expect, it } from "vitest";
import { STORY_BEATS } from "@/lib/beats";

describe("STORY_BEATS", () => {
  it("keeps the six-beat story grammar in order", () => {
    expect(STORY_BEATS.map((beat) => beat.beatId)).toEqual([
      "main-character",
      "special",
      "want",
      "problem",
      "try",
      "ending",
    ]);
  });

  it("uses describe-only mode for the want beat", () => {
    const wantBeat = STORY_BEATS.find((beat) => beat.beatId === "want");

    expect(wantBeat).toMatchObject({
      mode: "describe",
      describePrompt: "What do they want most?",
      describeHelperText: "Tell us what they are hoping for, why they want it, and how it would feel to get it.",
      generatingTitle: "Imagining their dreams...",
    });
    expect(wantBeat).not.toHaveProperty("drawPrompt");
  });

  it("has section-specific loading copy for every beat", () => {
    expect(STORY_BEATS.map((beat) => beat.generatingTitle)).toEqual([
      "Bringing them to life...",
      "Finding their sparkle...",
      "Imagining their dreams...",
      "Building the tricky part...",
      "Trying their big idea...",
      "Making the ending shine...",
    ]);
  });
});
