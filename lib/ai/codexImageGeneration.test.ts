// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { generateCodexImage } from "@/lib/ai/codexImageGeneration";

describe("generateCodexImage", () => {
  it("sends a Codex image tool request without unsupported metadata", async () => {
    const createResponse = vi.fn().mockResolvedValue({
      output: [
        {
          result: "data:image/png;base64,aGVsbG8=",
        },
      ],
    });

    await expect(
      generateCodexImage(
        {
          intent: "first_generation",
          beat: {
            beatId: "main-character",
            prompt: "Draw your main character",
            drawingImageUrl: "data:image/png;base64,drawing",
            transcript: "Her name is Mira, a tiny blue dragon.",
            correctionTranscripts: [],
          },
          previousAcceptedImages: [],
        },
        {
          client: { createResponse },
          env: {
            STORY_COACH_CODEX_RESPONSE_MODEL: "gpt-response-test",
            STORY_COACH_CODEX_IMAGE_MODEL: "gpt-image-test",
          },
        },
      ),
    ).resolves.toEqual({
      imageUrl: "data:image/png;base64,aGVsbG8=",
    });

    expect(createResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-response-test",
        store: false,
        tools: [
          {
            type: "image_generation",
            model: "gpt-image-test",
          },
        ],
      }),
    );
    expect(createResponse.mock.calls[0][0]).not.toHaveProperty("metadata");
    const imageContent = (
      createResponse.mock.calls[0][0].input as {
        content: Record<string, unknown>[];
      }[]
    )[0].content.find((content) => content.type === "input_image");

    expect(imageContent).not.toHaveProperty("metadata");
  });

  it("accepts promoted streamed image base64 responses", async () => {
    const createResponse = vi.fn().mockResolvedValue({
      image_b64: "iVBORw0KGgo-streamed",
    });

    await expect(
      generateCodexImage(
        {
          intent: "regenerate",
          beat: {
            beatId: "ending",
            prompt: "Draw the ending",
            transcript: "Mira flies home.",
            correctionTranscripts: [],
          },
          previousAcceptedImages: [],
        },
        {
          client: { createResponse },
        },
      ),
    ).resolves.toEqual({
      imageUrl: "data:image/png;base64,iVBORw0KGgo-streamed",
    });
  });
});
