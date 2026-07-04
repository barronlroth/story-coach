import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/generate-image/route";

const ENV_KEYS = [
  "STORY_COACH_IMAGE_PROVIDER",
  "STORY_COACH_CODEX_ACCESS_TOKEN",
  "CODEX_ACCESS_TOKEN",
  "STORY_COACH_CODEX_RESPONSES_URL",
  "CODEX_RESPONSES_URL",
  "STORY_COACH_CODEX_RESPONSE_MODEL",
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const originalValue = originalEnv[key];
    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  }
}

function generateImageRequest(body: unknown): Request {
  return new Request("http://localhost/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate-image", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("returns a stub image URL without live AI configuration", async () => {
    process.env.STORY_COACH_IMAGE_PROVIDER = "stub";

    const response = await POST(
      generateImageRequest({
        intent: "first_generation",
        beat: {
          beatId: "main-character",
          prompt: "Draw your main character",
          drawingImageUrl: "data:image/png;base64,drawing",
          transcript: "Her name is Nora and she has a moon kite.",
          correctionTranscripts: [],
        },
        previousAcceptedImages: [],
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      imageUrl: "/storyboard/04-step-1d-confirm-character.png",
    });
  });

  it("rejects an invalid intent", async () => {
    const response = await POST(
      generateImageRequest({
        intent: "make_it_pop",
        beat: {
          beatId: "main-character",
          prompt: "Draw your main character",
        },
        previousAcceptedImages: [],
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: "invalid_request",
    });
  });

  it("does not expose configured tokens when Codex is selected but incomplete", async () => {
    process.env.STORY_COACH_IMAGE_PROVIDER = "codex";
    process.env.STORY_COACH_CODEX_ACCESS_TOKEN = "secret-token-that-must-not-leak";

    const response = await POST(
      generateImageRequest({
        intent: "regenerate",
        beat: {
          beatId: "want",
          prompt: "What do they want most?",
          transcript: "Nora wants to find the moon kite.",
        },
        previousAcceptedImages: [{ beatId: "main-character", imageUrl: "/generated/nora.png" }],
      }),
    );

    const body = await response.json();
    const serializedBody = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      error: "image_generation_unavailable",
    });
    expect(serializedBody).not.toContain("secret-token-that-must-not-leak");
  });
});
