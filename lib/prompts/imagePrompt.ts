export const IMAGE_GENERATION_INTENTS = [
  "first_generation",
  "correction",
  "regenerate",
] as const;

export type ImageGenerationIntent = (typeof IMAGE_GENERATION_INTENTS)[number];

export type ImagePromptBeat = {
  beatId: string;
  prompt: string;
  drawingImageUrl?: string;
  transcript?: string;
  generatedImageUrl?: string;
  correctionTranscripts?: string[];
};

export type PreviousAcceptedImageReference = {
  beatId: string;
  imageUrl: string;
};

export type ImagePromptReferenceKind = "drawing" | "current_generated" | "previous_accepted";

export type ImagePromptReference = {
  kind: ImagePromptReferenceKind;
  beatId: string;
  url: string;
};

export type BuildImageGenerationPromptInput = {
  beat: ImagePromptBeat;
  previousAcceptedImages: PreviousAcceptedImageReference[];
  intent: ImageGenerationIntent;
  styleInstruction?: string;
  continuityInstruction?: string;
};

export type BuiltImageGenerationPrompt = {
  prompt: string;
  imageReferences: ImagePromptReference[];
};

const DEFAULT_STYLE_INSTRUCTION =
  "Create one polished children's book illustration with warm, expressive character art and clear storybook composition.";

const DEFAULT_CONTINUITY_INSTRUCTION =
  "Keep recurring characters, important objects, and visual traits consistent with previous accepted images.";

const INTENT_INSTRUCTIONS: Record<ImageGenerationIntent, string> = {
  first_generation:
    "Use the current beat prompt, child drawing, and child transcript to make the first image for this beat.",
  correction:
    "Revise the current generated image using the additive correction transcripts. Preserve what was already right.",
  regenerate:
    "Create a fresh variation from the same source material without adding new story facts.",
};

function cleanText(value: string | undefined): string {
  return value?.trim() || "Not provided.";
}

function formatCorrections(correctionTranscripts: string[] | undefined): string {
  const corrections = correctionTranscripts?.map((item) => item.trim()).filter(Boolean) ?? [];

  if (corrections.length === 0) {
    return "No correction transcripts yet.";
  }

  return corrections.map((correction, index) => `${index + 1}. ${correction}`).join("\n");
}

function formatPreviousImages(previousAcceptedImages: PreviousAcceptedImageReference[]): string {
  if (previousAcceptedImages.length === 0) {
    return "No previous accepted images yet.";
  }

  return previousAcceptedImages
    .map((image, index) => `${index + 1}. Accepted illustration from the ${formatBeatLabel(image.beatId)} beat.`)
    .join("\n");
}

function formatBeatLabel(beatId: string): string {
  return beatId.replace(/[-_]+/g, " ").trim() || "previous story";
}

function buildImageReferences(input: BuildImageGenerationPromptInput): ImagePromptReference[] {
  const references: ImagePromptReference[] = [];

  if (input.beat.drawingImageUrl) {
    references.push({
      kind: "drawing",
      beatId: input.beat.beatId,
      url: input.beat.drawingImageUrl,
    });
  }

  if (input.intent === "correction" && input.beat.generatedImageUrl) {
    references.push({
      kind: "current_generated",
      beatId: input.beat.beatId,
      url: input.beat.generatedImageUrl,
    });
  }

  for (const previousImage of input.previousAcceptedImages) {
    references.push({
      kind: "previous_accepted",
      beatId: previousImage.beatId,
      url: previousImage.imageUrl,
    });
  }

  return references;
}

function formatAttachedReferences(imageReferences: ImagePromptReference[]): string {
  if (imageReferences.length === 0) {
    return "No images are attached.";
  }

  return imageReferences
    .map((reference, index) => {
      if (reference.kind === "drawing") {
        return `${index + 1}. Child's current drawing for this beat.`;
      }

      if (reference.kind === "current_generated") {
        return `${index + 1}. Current generated image for this beat, to revise.`;
      }

      return `${index + 1}. Previously accepted illustration from the ${formatBeatLabel(reference.beatId)} beat.`;
    })
    .join("\n");
}

export function isImageGenerationIntent(value: unknown): value is ImageGenerationIntent {
  return typeof value === "string" && IMAGE_GENERATION_INTENTS.includes(value as ImageGenerationIntent);
}

export function buildImageGenerationPrompt(
  input: BuildImageGenerationPromptInput,
): BuiltImageGenerationPrompt {
  const styleInstruction = cleanText(input.styleInstruction ?? DEFAULT_STYLE_INSTRUCTION);
  const continuityInstruction = cleanText(
    input.continuityInstruction ?? DEFAULT_CONTINUITY_INSTRUCTION,
  );
  const imageReferences = buildImageReferences(input);

  const prompt = [
    "Story Coach image generation request",
    "",
    `Intent: ${input.intent}`,
    INTENT_INSTRUCTIONS[input.intent],
    "",
    "Current storytelling input:",
    `- Story prompt: ${cleanText(input.beat.prompt)}`,
    `- Child transcript: ${cleanText(input.beat.transcript)}`,
    "",
    "Correction transcripts:",
    formatCorrections(input.beat.correctionTranscripts),
    "",
    "Attached image references, in order:",
    formatAttachedReferences(imageReferences),
    "",
    "Previous accepted image references:",
    formatPreviousImages(input.previousAcceptedImages),
    "",
    "Style instruction:",
    styleInstruction,
    "",
    "Continuity instruction:",
    continuityInstruction,
    "",
    "Rules:",
    "- Use the child's drawing as visual intent when present.",
    "- Obey the child's spoken description and correction transcripts.",
    "- Keep the recurring character consistent with previous accepted images.",
    "- Do not invent major story facts beyond the current beat.",
    "- Return one PNG image suitable for a children's book page.",
  ].join("\n");

  return {
    prompt,
    imageReferences,
  };
}
