import {
  createCodexResponsesClient,
  type CodexResponsesClient,
} from "@/lib/ai/codexResponsesClient";
import type { CodexAuthEnv } from "@/lib/ai/codexAuth";
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
  env?: CodexAuthEnv;
};

function resolveResponseModel(env: CodexAuthEnv): string {
  return (
    env.STORY_COACH_CODEX_IMAGE_RESPONSE_MODEL?.trim() ||
    env.STORY_COACH_CODEX_RESPONSE_MODEL?.trim() ||
    env.CODEX_STORY_WRITER_MODEL?.trim() ||
    "gpt-5.4"
  );
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
    })),
  ];
}

function buildCodexImagePayload(
  input: CodexImageGenerationInput,
  builtPrompt: BuiltImageGenerationPrompt,
  env: CodexAuthEnv,
): Record<string, unknown> {
  const responseModel = resolveResponseModel(env);
  const imageModel = env.STORY_COACH_CODEX_IMAGE_MODEL?.trim() || "gpt-image-2";

  return {
    model: responseModel,
    store: false,
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
    for (const key of ["imageUrl", "image_url", "url", "b64_json", "image_b64", "partial_image_b64", "result"]) {
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
