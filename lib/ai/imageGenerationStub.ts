import type {
  BuildImageGenerationPromptInput,
  BuiltImageGenerationPrompt,
} from "@/lib/prompts/imagePrompt";

export type ImageGenerationResult = {
  imageUrl: string;
};

export type StubImageGenerationInput = BuildImageGenerationPromptInput & {
  builtPrompt?: BuiltImageGenerationPrompt;
};

const DEMO_IMAGE_BY_BEAT_ID: Record<string, string> = {
  "main-character": "/generated/demo/main-character.png",
  special: "/generated/demo/special.png",
  want: "/generated/demo/want.png",
  problem: "/generated/demo/problem.png",
  try: "/generated/demo/try.png",
  ending: "/generated/demo/ending.png",
};

const FALLBACK_DEMO_IMAGE_URL = "/generated/demo/main-character.png";

export function getStubImageUrl(beatId: string): string {
  return DEMO_IMAGE_BY_BEAT_ID[beatId] ?? FALLBACK_DEMO_IMAGE_URL;
}

export async function generateImageStub(input: StubImageGenerationInput): Promise<ImageGenerationResult> {
  return {
    imageUrl: getStubImageUrl(input.beat.beatId),
  };
}
