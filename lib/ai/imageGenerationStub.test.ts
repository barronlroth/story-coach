import { describe, expect, it } from "vitest";
import { generateImageStub, getStubImageUrl } from "@/lib/ai/imageGenerationStub";

describe("image generation stub", () => {
  it("returns a deterministic storyboard image URL for a known beat", async () => {
    const first = await generateImageStub({
      intent: "first_generation",
      beat: {
        beatId: "problem",
        prompt: "Draw what gets in their way",
        transcript: "A huge storm blocks the kite.",
      },
      previousAcceptedImages: [],
    });
    const second = await generateImageStub({
      intent: "regenerate",
      beat: {
        beatId: "problem",
        prompt: "Draw what gets in their way",
        transcript: "A huge storm blocks the kite.",
      },
      previousAcceptedImages: [],
    });

    expect(first.imageUrl).toBe("/storyboard/12-step-4c-confirm-problem.png");
    expect(second.imageUrl).toBe(first.imageUrl);
  });

  it("falls back to a demo storyboard image for unknown beat ids", () => {
    expect(getStubImageUrl("unknown-beat")).toBe("/storyboard/03-step-1c-generating-character.png");
  });
});
