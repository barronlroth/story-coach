import { describe, expect, it } from "vitest";
import { selectAudioTranscriptionProvider, transcribeSpeech } from "@/lib/speech/transcribe";

describe("selectAudioTranscriptionProvider", () => {
  it("selects the local command provider only when a command is configured", () => {
    const provider = selectAudioTranscriptionProvider({
      env: {
        STORY_COACH_TRANSCRIBE_COMMAND: "/usr/local/bin/story-stt",
        STORY_COACH_TRANSCRIBE_ARGS: "--json --input {input}",
        STORY_COACH_TRANSCRIBE_PROVIDER: "story-stt",
      },
    });

    expect(provider).toEqual({
      kind: "local-command",
      name: "story-stt",
      command: "/usr/local/bin/story-stt",
      args: ["--json", "--input", "{input}"],
    });
  });

  it("does not select mock transcription unless mock is requested", () => {
    expect(selectAudioTranscriptionProvider({ env: {} }).kind).toBe("unconfigured");
    expect(selectAudioTranscriptionProvider({ env: {}, allowMock: true }).kind).toBe("mock");
  });
});

describe("transcribeSpeech", () => {
  it("returns typed fallback without needing a local provider", async () => {
    await expect(
      transcribeSpeech({
        textFallback: "  She is a moon dragon with roller skates.  ",
        env: {},
      }),
    ).resolves.toMatchObject({
      transcript: "She is a moon dragon with roller skates.",
      provider: "typed-fallback",
      source: "typed-fallback",
      isMock: false,
    });
  });

  it("uses typed fallback when audio is present but no provider is configured", async () => {
    await expect(
      transcribeSpeech({
        audio: {
          buffer: Buffer.from("fake-audio"),
          mimeType: "audio/webm",
          filename: "voice.webm",
        },
        textFallback: "The castle has a secret elevator.",
        env: {},
      }),
    ).resolves.toMatchObject({
      transcript: "The castle has a secret elevator.",
      provider: "typed-fallback",
      warnings: ["No local speech-to-text provider is configured for Story Coach."],
    });
  });

  it("returns a helpful provider error for audio without configured STT", async () => {
    await expect(
      transcribeSpeech({
        audio: {
          buffer: Buffer.from("fake-audio"),
          mimeType: "audio/webm",
        },
        env: {},
      }),
    ).rejects.toMatchObject({
      code: "transcribe_provider_missing",
      status: 503,
    });
  });

  it("returns a mock transcript only when requested", async () => {
    await expect(
      transcribeSpeech({
        audio: {
          buffer: Buffer.from("fake-audio"),
          mimeType: "audio/webm",
        },
        allowMock: true,
        env: {},
      }),
    ).resolves.toMatchObject({
      provider: "mock-dev",
      source: "mock",
      isMock: true,
    });
  });
});
