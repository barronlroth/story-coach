import {
  CodexImageGenerationConfigurationError,
  generateCodexImage,
} from "@/lib/ai/codexImageGeneration";
import { CodexAuthConfigurationError } from "@/lib/ai/codexAuth";
import {
  CodexResponsesConfigurationError,
  CodexResponsesRequestError,
} from "@/lib/ai/codexResponsesClient";
import { persistGeneratedImageUrl } from "@/lib/ai/generatedImageStorage";
import { generateImageStub } from "@/lib/ai/imageGenerationStub";
import {
  buildImageGenerationPrompt,
  isImageGenerationIntent,
  type BuildImageGenerationPromptInput,
  type ImageGenerationIntent,
  type ImagePromptBeat,
  type PreviousAcceptedImageReference,
} from "@/lib/prompts/imagePrompt";

export const runtime = "nodejs";

export type GenerateImageRequest = {
  beat: ImagePromptBeat;
  previousAcceptedImages: PreviousAcceptedImageReference[];
  intent: ImageGenerationIntent;
  styleInstruction?: string;
  continuityInstruction?: string;
};

export type GenerateImageResponse = {
  imageUrl: string;
};

type ParseResult =
  | { ok: true; request: GenerateImageRequest }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseCorrectionTranscripts(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseBeat(value: unknown): ImagePromptBeat | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const beatId = value.beatId;
  const prompt = value.prompt;

  if (typeof beatId !== "string" || typeof prompt !== "string") {
    return undefined;
  }

  return {
    beatId,
    prompt,
    drawingImageUrl: optionalString(value.drawingImageUrl),
    transcript: optionalString(value.transcript),
    generatedImageUrl: optionalString(value.generatedImageUrl),
    correctionTranscripts: parseCorrectionTranscripts(value.correctionTranscripts),
  };
}

function parsePreviousAcceptedImages(value: unknown): PreviousAcceptedImageReference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.beatId !== "string" || typeof item.imageUrl !== "string") {
      return [];
    }

    return [
      {
        beatId: item.beatId,
        imageUrl: item.imageUrl,
      },
    ];
  });
}

function parseGenerateImageRequest(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const beat = parseBeat(value.beat);
  if (!beat) {
    return { ok: false, message: "Request body must include beat.beatId and beat.prompt." };
  }

  if (!isImageGenerationIntent(value.intent)) {
    return {
      ok: false,
      message: "Request body must include intent: first_generation, correction, or regenerate.",
    };
  }

  return {
    ok: true,
    request: {
      beat,
      previousAcceptedImages: parsePreviousAcceptedImages(value.previousAcceptedImages),
      intent: value.intent,
      styleInstruction: optionalString(value.styleInstruction),
      continuityInstruction: optionalString(value.continuityInstruction),
    },
  };
}

function imageProvider(env: NodeJS.ProcessEnv): "codex" | "stub" {
  return env.STORY_COACH_IMAGE_PROVIDER === "codex" ? "codex" : "stub";
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init);
}

function providerUnavailableResponse(): Response {
  return jsonResponse(
    {
      error: "image_generation_unavailable",
      message: "Codex image generation is not configured on this server.",
    },
    { status: 503 },
  );
}

function providerFailedResponse(): Response {
  return jsonResponse(
    {
      error: "image_generation_failed",
      message: "Image generation failed before returning an image URL.",
    },
    { status: 502 },
  );
}

function responseForError(error: unknown): Response {
  if (
    error instanceof CodexAuthConfigurationError ||
    error instanceof CodexResponsesConfigurationError ||
    error instanceof CodexImageGenerationConfigurationError
  ) {
    return providerUnavailableResponse();
  }

  if (error instanceof CodexResponsesRequestError || error instanceof Error) {
    return providerFailedResponse();
  }

  return providerFailedResponse();
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json", message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = parseGenerateImageRequest(body);
  if (!parsed.ok) {
    return jsonResponse({ error: "invalid_request", message: parsed.message }, { status: 400 });
  }

  const promptInput: BuildImageGenerationPromptInput = parsed.request;
  const builtPrompt = buildImageGenerationPrompt(promptInput);

  try {
    const result =
      imageProvider(process.env) === "codex"
        ? await generateCodexImage({ ...promptInput, builtPrompt })
        : await generateImageStub({ ...promptInput, builtPrompt });
    const imageUrl = await persistGeneratedImageUrl(result.imageUrl, {
      beatId: parsed.request.beat.beatId,
    });

    return jsonResponse({ imageUrl } satisfies GenerateImageResponse);
  } catch (error) {
    return responseForError(error);
  }
}
