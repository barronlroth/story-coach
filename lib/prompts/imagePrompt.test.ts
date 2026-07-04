import { describe, expect, it } from "vitest";
import { buildImageGenerationPrompt } from "@/lib/prompts/imagePrompt";

describe("buildImageGenerationPrompt", () => {
  it("includes transcript, corrections, drawing, and continuity references from raw beat artifacts", () => {
    const builtPrompt = buildImageGenerationPrompt({
      intent: "correction",
      beat: {
        beatId: "problem",
        prompt: "Draw what gets in their way",
        drawingImageUrl: "data:image/png;base64,drawing",
        generatedImageUrl: "/generated/problem-v1.png",
        transcript: "A giant windy cloud blocks Nora from the moon kite.",
        correctionTranscripts: ["Make the storm bigger.", "Nora should still look brave."],
      },
      previousAcceptedImages: [
        { beatId: "main-character", imageUrl: "/generated/nora.png" },
        { beatId: "special", imageUrl: "/generated/moon-kite.png" },
      ],
    });

    expect(builtPrompt.prompt).toContain("Beat prompt: Draw what gets in their way");
    expect(builtPrompt.prompt).toContain(
      "Child transcript: A giant windy cloud blocks Nora from the moon kite.",
    );
    expect(builtPrompt.prompt).toContain("1. Make the storm bigger.");
    expect(builtPrompt.prompt).toContain("2. Nora should still look brave.");
    expect(builtPrompt.prompt).toContain("Drawing image: data:image/png;base64,drawing");
    expect(builtPrompt.prompt).toContain("beatId=main-character; imageUrl=/generated/nora.png");
    expect(builtPrompt.prompt).toContain("beatId=special; imageUrl=/generated/moon-kite.png");
    expect(builtPrompt.prompt).toContain("Keep recurring characters");

    expect(builtPrompt.imageReferences).toEqual([
      {
        kind: "drawing",
        beatId: "problem",
        url: "data:image/png;base64,drawing",
      },
      {
        kind: "current_generated",
        beatId: "problem",
        url: "/generated/problem-v1.png",
      },
      {
        kind: "previous_accepted",
        beatId: "main-character",
        url: "/generated/nora.png",
      },
      {
        kind: "previous_accepted",
        beatId: "special",
        url: "/generated/moon-kite.png",
      },
    ]);
  });
});
