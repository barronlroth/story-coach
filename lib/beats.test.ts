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
    });
    expect(wantBeat).not.toHaveProperty("drawPrompt");
  });
});
