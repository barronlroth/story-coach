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

  it("converts local app image URLs to data URLs before calling Codex", async () => {
    const createResponse = vi.fn().mockResolvedValue({
      image_b64: "iVBORw0KGgo-streamed",
    });

    await generateCodexImage(
      {
        intent: "regenerate",
        beat: {
          beatId: "special",
          prompt: "Draw what makes them special",
          drawingImageUrl: "/generated/demo/main-character.png",
          transcript: "Mira has a backpack.",
          correctionTranscripts: [],
        },
        previousAcceptedImages: [
          {
            beatId: "main-character",
            imageUrl: "/generated/demo/main-character.png",
          },
        ],
      },
      {
        client: { createResponse },
      },
    );

    const content = (
      createResponse.mock.calls[0][0].input as {
        content: Record<string, unknown>[];
      }[]
    )[0].content;
    const imageContents = content.filter((item) => item.type === "input_image");

    expect(imageContents).toHaveLength(2);
    expect(imageContents[0].image_url).toEqual(expect.stringMatching(/^data:image\/png;base64,/));
    expect(imageContents[1].image_url).toEqual(expect.stringMatching(/^data:image\/png;base64,/));
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
