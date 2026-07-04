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
  "main-character": "/storyboard/04-step-1d-confirm-character.png",
  special: "/storyboard/07-step-2c-confirm-special.png",
  want: "/storyboard/09-step-3b-confirm-want.png",
  problem: "/storyboard/12-step-4c-confirm-problem.png",
  try: "/storyboard/15-step-5c-confirm-try.png",
  ending: "/storyboard/18-step-6c-confirm-ending.png",
};

const FALLBACK_DEMO_IMAGE_URL = "/storyboard/03-step-1c-generating-character.png";

export function getStubImageUrl(beatId: string): string {
  return DEMO_IMAGE_BY_BEAT_ID[beatId] ?? FALLBACK_DEMO_IMAGE_URL;
}

export async function generateImageStub(input: StubImageGenerationInput): Promise<ImageGenerationResult> {
  return {
    imageUrl: getStubImageUrl(input.beat.beatId),
  };
}
