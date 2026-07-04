import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/transcribe/route";

describe("/api/transcribe", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts multipart typed fallback without local STT", async () => {
    vi.stubEnv("STORY_COACH_TRANSCRIBE_COMMAND", "");
    const formData = new FormData();
    formData.set("text", "A tiny robot wants to find the loudest song.");

    const response = await POST(
      new Request("http://localhost/api/transcribe", {
        method: "POST",
        body: formData,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      ok: true,
      transcript: "A tiny robot wants to find the loudest song.",
      provider: "typed-fallback",
      source: "typed-fallback",
      isMock: false,
    });
  });

  it("returns a helpful error when audio is sent without a configured provider", async () => {
    vi.stubEnv("STORY_COACH_TRANSCRIBE_COMMAND", "");
    const formData = new FormData();
    formData.set("audio", new Blob(["fake-audio"], { type: "audio/webm" }), "voice.webm");

    const response = await POST(
      new Request("http://localhost/api/transcribe", {
        method: "POST",
        body: formData,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toMatchObject({
      ok: false,
      error: {
        code: "transcribe_provider_missing",
      },
    });
  });

  it("returns an explicit mock transcript when requested", async () => {
    vi.stubEnv("STORY_COACH_TRANSCRIBE_COMMAND", "");
    const formData = new FormData();
    formData.set("audio", new Blob(["fake-audio"], { type: "audio/webm" }), "voice.webm");
    formData.set("mock", "true");

    const response = await POST(
      new Request("http://localhost/api/transcribe", {
        method: "POST",
        body: formData,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      ok: true,
      provider: "mock-dev",
      source: "mock",
      isMock: true,
    });
    expect(json.transcript).toContain("Luna");
  });
});
