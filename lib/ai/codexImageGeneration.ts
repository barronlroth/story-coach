import {
  createCodexResponsesClient,
  type CodexResponsesClient,
} from "@/lib/ai/codexResponsesClient";
import {
  buildImageGenerationPrompt,
  type BuildImageGenerationPromptInput,
  type BuiltImageGenerationPrompt,
  type ImagePromptReference,
} from "@/lib/prompts/imagePrompt";

export class CodexImageGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexImageGenerationError";
  }
}

export class CodexImageGenerationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexImageGenerationConfigurationError";
  }
}

export type CodexImageGenerationInput = BuildImageGenerationPromptInput & {
  builtPrompt?: BuiltImageGenerationPrompt;
};

export type CodexImageGenerationResult = {
  imageUrl: string;
};

export type CodexImageGenerationOptions = {
  client?: CodexResponsesClient;
  env?: NodeJS.ProcessEnv;
};

function resolveRequiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new CodexImageGenerationConfigurationError(
      `${name} is required for Codex image generation. Use STORY_COACH_IMAGE_PROVIDER=stub for local demo mode.`,
    );
  }

  return value;
}

function buildProviderContent(
  builtPrompt: BuiltImageGenerationPrompt,
): Record<string, unknown>[] {
  return [
    {
      type: "input_text",
      text: builtPrompt.prompt,
    },
    ...builtPrompt.imageReferences.map((reference) => ({
      type: "input_image",
      image_url: reference.url,
      detail: "auto",
      metadata: {
        kind: reference.kind,
        beatId: reference.beatId,
      },
    })),
  ];
}

function buildCodexImagePayload(
  input: CodexImageGenerationInput,
  builtPrompt: BuiltImageGenerationPrompt,
  env: NodeJS.ProcessEnv,
): Record<string, unknown> {
  const responseModel = resolveRequiredEnv("STORY_COACH_CODEX_RESPONSE_MODEL", env);
  const imageModel = env.STORY_COACH_CODEX_IMAGE_MODEL?.trim() || "gpt-image-2";

  return {
    model: responseModel,
    tools: [
      {
        type: "image_generation",
        model: imageModel,
      },
    ],
    input: [
      {
        role: "user",
        content: buildProviderContent(builtPrompt),
      },
    ],
    metadata: {
      app: "story-coach",
      beatId: input.beat.beatId,
      intent: input.intent,
      imageReferenceCount: builtPrompt.imageReferences.length,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeImageUrl(value: string): boolean {
  return (
    value.startsWith("data:image/") ||
    value.startsWith("/generated/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

function looksLikeBase64Png(value: string): boolean {
  return value.startsWith("iVBORw0KGgo") || value.startsWith("data:image/png;base64,");
}

function normalizeImageString(value: string): string | undefined {
  if (looksLikeImageUrl(value)) {
    return value;
  }

  if (looksLikeBase64Png(value)) {
    return value.startsWith("data:image/png;base64,") ? value : `data:image/png;base64,${value}`;
  }

  return undefined;
}

function extractImageUrl(response: unknown): string | undefined {
  if (typeof response === "string") {
    return normalizeImageString(response);
  }

  if (Array.isArray(response)) {
    for (const item of response) {
      const imageUrl = extractImageUrl(item);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  if (isRecord(response)) {
    for (const key of ["imageUrl", "image_url", "url", "b64_json", "result"]) {
      const value = response[key];
      if (typeof value === "string") {
        const imageUrl = normalizeImageString(value);
        if (imageUrl) {
          return imageUrl;
        }
      }
    }

    for (const value of Object.values(response)) {
      const imageUrl = extractImageUrl(value);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  return undefined;
}

export function getCodexImageReferences(
  input: CodexImageGenerationInput,
): ImagePromptReference[] {
  return input.builtPrompt?.imageReferences ?? buildImageGenerationPrompt(input).imageReferences;
}

export async function generateCodexImage(
  input: CodexImageGenerationInput,
  options: CodexImageGenerationOptions = {},
): Promise<CodexImageGenerationResult> {
  const env = options.env ?? process.env;
  const builtPrompt = input.builtPrompt ?? buildImageGenerationPrompt(input);
  const client = options.client ?? createCodexResponsesClient(undefined, env);
  const payload = buildCodexImagePayload(input, builtPrompt, env);
  const providerResponse = await client.createResponse(payload);
  const imageUrl = extractImageUrl(providerResponse);

  if (!imageUrl) {
    throw new CodexImageGenerationError("Codex image generation did not return a usable image URL.");
  }

  return { imageUrl };
}
