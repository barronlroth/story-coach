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

    expect(builtPrompt.prompt).toContain("Story prompt: Draw what gets in their way");
    expect(builtPrompt.prompt).toContain(
      "Child transcript: A giant windy cloud blocks Nora from the moon kite.",
    );
    expect(builtPrompt.prompt).toContain("1. Make the storm bigger.");
    expect(builtPrompt.prompt).toContain("2. Nora should still look brave.");
    expect(builtPrompt.prompt).toContain("1. Child's current drawing for this beat.");
    expect(builtPrompt.prompt).toContain("2. Current generated image for this beat, to revise.");
    expect(builtPrompt.prompt).toContain("3. Previously accepted illustration from the main character beat.");
    expect(builtPrompt.prompt).toContain("4. Previously accepted illustration from the special beat.");
    expect(builtPrompt.prompt).toContain("1. Accepted illustration from the main character beat.");
    expect(builtPrompt.prompt).toContain("2. Accepted illustration from the special beat.");
    expect(builtPrompt.prompt).toContain("Keep recurring characters");
    expect(builtPrompt.prompt).not.toContain("Beat id:");
    expect(builtPrompt.prompt).not.toContain("beatId=");
    expect(builtPrompt.prompt).not.toContain("imageUrl=");
    expect(builtPrompt.prompt).not.toContain("data:image/png;base64,drawing");
    expect(builtPrompt.prompt).not.toContain("/generated/nora.png");

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
