import { NextResponse } from "next/server";
import { transcribeSpeech, TranscriptionError, type AudioTranscriptionInput } from "@/lib/speech/transcribe";

export const runtime = "nodejs";

type JsonBody = {
  text?: unknown;
  transcript?: unknown;
  typedTranscript?: unknown;
  mock?: unknown;
};

function isTruthy(value: FormDataEntryValue | unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function readStringField(formData: FormData, names: string[]) {
  for (const name of names) {
    const value = formData.get(name);

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number"
  );
}

function filenameFor(value: File) {
  return value.name.trim().length > 0 ? value.name : undefined;
}

async function readAudioField(formData: FormData): Promise<AudioTranscriptionInput | undefined> {
  const audioValue = formData.get("audio") ?? formData.get("file");

  if (!isFileLike(audioValue) || audioValue.size === 0) {
    return undefined;
  }

  return {
    buffer: Buffer.from(await audioValue.arrayBuffer()),
    mimeType: audioValue.type,
    filename: filenameFor(audioValue),
  };
}

function errorResponse(error: TranscriptionError) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        hint: error.hint,
      },
    },
    { status: error.status },
  );
}

function successResponse(result: Awaited<ReturnType<typeof transcribeSpeech>>) {
  return NextResponse.json({
    ok: true,
    transcript: result.transcript,
    provider: result.provider,
    source: result.source,
    isMock: result.isMock,
    warnings: result.warnings,
  });
}

async function readJsonBody(request: Request): Promise<JsonBody> {
  try {
    return (await request.json()) as JsonBody;
  } catch {
    throw new TranscriptionError(
      "transcribe_invalid_json",
      "The transcript request body is not valid JSON.",
      400,
      "Send multipart form data, or JSON with a text field.",
    );
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const queryAllowsMock = isTruthy(url.searchParams.get("mock"));
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const result = await transcribeSpeech({
        audio: await readAudioField(formData),
        textFallback: readStringField(formData, ["text", "transcript", "typedTranscript"]),
        allowMock: queryAllowsMock || isTruthy(formData.get("mock")),
      });

      return successResponse(result);
    }

    if (contentType.includes("application/json")) {
      const body = await readJsonBody(request);
      const text =
        typeof body.text === "string"
          ? body.text
          : typeof body.transcript === "string"
            ? body.transcript
            : typeof body.typedTranscript === "string"
              ? body.typedTranscript
              : undefined;

      const result = await transcribeSpeech({
        textFallback: text,
        allowMock: queryAllowsMock || isTruthy(body.mock),
      });

      return successResponse(result);
    }

    throw new TranscriptionError(
      "transcribe_unsupported_content_type",
      "Send audio or typed text as multipart form data, or send typed text as JSON.",
      415,
      "Use multipart field audio for recordings, or text for typed fallback.",
    );
  } catch (error) {
    if (error instanceof TranscriptionError) {
      return errorResponse(error);
    }

    return errorResponse(
      new TranscriptionError(
        "transcribe_unexpected_error",
        "Story Coach could not make a transcript.",
        500,
        error instanceof Error ? error.message : "Try again, or use typed fallback.",
      ),
    );
  }
}
