import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type TranscriptionSource = "audio" | "typed-fallback" | "mock";

export type AudioTranscriptionInput = {
  buffer: Buffer;
  mimeType?: string;
  filename?: string;
};

export type TranscriptionRequest = {
  audio?: AudioTranscriptionInput;
  textFallback?: string | null;
  allowMock?: boolean;
  env?: TranscriptionEnvironment;
};

export type TranscriptionEnvironment = Partial<Record<string, string | undefined>>;

export type TranscriptionResult = {
  transcript: string;
  provider: string;
  source: TranscriptionSource;
  isMock: boolean;
  warnings?: string[];
};

export type LocalCommandProvider = {
  kind: "local-command";
  name: string;
  command: string;
  args: string[];
};

export type MockProvider = {
  kind: "mock";
  name: "mock-dev";
};

export type UnconfiguredProvider = {
  kind: "unconfigured";
  message: string;
  hint: string;
};

export type AudioTranscriptionProvider = LocalCommandProvider | MockProvider | UnconfiguredProvider;

export class TranscriptionError extends Error {
  code: string;
  status: number;
  hint?: string;

  constructor(code: string, message: string, status = 500, hint?: string) {
    super(message);
    this.name = "TranscriptionError";
    this.code = code;
    this.status = status;
    this.hint = hint;
  }
}

const DEFAULT_MOCK_TRANSCRIPT =
  "My character is Luna, a brave little inventor with purple boots and a backpack full of glowing stars.";

function normalizeText(text: string | null | undefined) {
  const trimmed = text?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseCommandArgs(args: string) {
  const matches = args.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return matches.map((arg) => arg.replace(/^["']|["']$/g, ""));
}

function extensionForAudio(input: AudioTranscriptionInput) {
  const fileExtension = input.filename ? path.extname(input.filename).replace(".", "") : "";

  if (fileExtension.length > 0) {
    return fileExtension;
  }

  if (input.mimeType?.includes("mp4")) {
    return "m4a";
  }

  if (input.mimeType?.includes("ogg")) {
    return "ogg";
  }

  if (input.mimeType?.includes("wav")) {
    return "wav";
  }

  return "webm";
}

function parseTranscriptFromStdout(stdout: string) {
  const trimmed = stdout.trim();

  if (trimmed.length === 0) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmed) as { transcript?: unknown; text?: unknown };
    const transcript = typeof parsed.transcript === "string" ? parsed.transcript : parsed.text;

    if (typeof transcript === "string") {
      return transcript.trim();
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function selectAudioTranscriptionProvider({
  env = process.env,
  allowMock = false,
}: {
  env?: TranscriptionEnvironment;
  allowMock?: boolean;
} = {}): AudioTranscriptionProvider {
  const command = env.STORY_COACH_TRANSCRIBE_COMMAND?.trim();

  if (command) {
    return {
      kind: "local-command",
      name: env.STORY_COACH_TRANSCRIBE_PROVIDER?.trim() || "local-command",
      command,
      args: parseCommandArgs(env.STORY_COACH_TRANSCRIBE_ARGS?.trim() || "{input}"),
    };
  }

  if (allowMock) {
    return {
      kind: "mock",
      name: "mock-dev",
    };
  }

  return {
    kind: "unconfigured",
    message: "No local speech-to-text provider is configured for Story Coach.",
    hint:
      "Submit typed text, or set STORY_COACH_TRANSCRIBE_COMMAND with optional STORY_COACH_TRANSCRIBE_ARGS using {input}. For demos, request mock=true explicitly.",
  };
}

async function runLocalCommand(provider: LocalCommandProvider, audio: AudioTranscriptionInput): Promise<TranscriptionResult> {
  const workingDirectory = await mkdtemp(path.join(tmpdir(), "story-coach-stt-"));
  const audioPath = path.join(workingDirectory, `input.${extensionForAudio(audio)}`);

  try {
    await writeFile(audioPath, audio.buffer);

    const args = provider.args.map((arg) => arg.replaceAll("{input}", audioPath));
    const { stdout } = await execFileAsync(provider.command, args, {
      timeout: 120_000,
      maxBuffer: 1024 * 1024 * 8,
    });
    const transcript = parseTranscriptFromStdout(stdout);

    if (transcript.length === 0) {
      throw new TranscriptionError(
        "transcribe_empty_output",
        "The local speech-to-text provider returned an empty transcript.",
        502,
        "Try typed text, or check the configured transcription command.",
      );
    }

    return {
      transcript,
      provider: provider.name,
      source: "audio",
      isMock: false,
    };
  } catch (error) {
    if (error instanceof TranscriptionError) {
      throw error;
    }

    throw new TranscriptionError(
      "transcribe_provider_failed",
      "The local speech-to-text provider could not transcribe the audio.",
      502,
      error instanceof Error ? error.message : "Check the configured transcription command.",
    );
  } finally {
    await rm(workingDirectory, { recursive: true, force: true });
  }
}

function mockTranscript(): TranscriptionResult {
  return {
    transcript: DEFAULT_MOCK_TRANSCRIPT,
    provider: "mock-dev",
    source: "mock",
    isMock: true,
    warnings: ["Using a mock development transcript because mock=true was requested."],
  };
}

function typedFallbackResult(text: string, warnings?: string[]): TranscriptionResult {
  return {
    transcript: text,
    provider: "typed-fallback",
    source: "typed-fallback",
    isMock: false,
    warnings,
  };
}

export async function transcribeSpeech({
  audio,
  textFallback,
  allowMock = false,
  env = process.env,
}: TranscriptionRequest): Promise<TranscriptionResult> {
  const typedText = normalizeText(textFallback);
  const hasAudio = audio !== undefined && audio.buffer.byteLength > 0;

  if (!hasAudio && typedText) {
    return typedFallbackResult(typedText);
  }

  if (!hasAudio) {
    if (allowMock) {
      return mockTranscript();
    }

    throw new TranscriptionError(
      "transcribe_input_missing",
      "Send an audio file or typed text to transcribe.",
      400,
      "Use multipart field audio for recordings, or text for typed fallback.",
    );
  }

  const audioInput = audio;

  const provider = selectAudioTranscriptionProvider({ env, allowMock });

  if (provider.kind === "local-command") {
    try {
      return await runLocalCommand(provider, audioInput);
    } catch (error) {
      if (typedText) {
        return typedFallbackResult(typedText, [
          error instanceof Error ? error.message : "Audio transcription failed, so typed fallback was used.",
        ]);
      }

      throw error;
    }
  }

  if (provider.kind === "mock") {
    return mockTranscript();
  }

  if (typedText) {
    return typedFallbackResult(typedText, [provider.message]);
  }

  throw new TranscriptionError("transcribe_provider_missing", provider.message, 503, provider.hint);
}
