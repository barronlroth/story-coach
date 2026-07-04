import { getBeatDefinition } from "@/lib/beats";
import type { StoryBeatState } from "@/lib/story-state";

export type FinalBookPrompt = {
  system: string;
  user: string;
};

export type FinalBookPromptBeat = {
  pageNumber: number;
  beatId: string;
  beatTitle: string;
  sessionPrompt: string;
  drawPrompt: string | null;
  describePrompt: string | null;
  transcript: string | null;
  correctionTranscripts: string[];
  acceptedImageUrl: string | null;
};

export const FINAL_BOOK_SYSTEM_PROMPT =
  "You assemble six-page children's picture books from Story Coach session artifacts. Return valid JSON only.";

export const FINAL_BOOK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "pages", "narrationText"],
  properties: {
    title: {
      type: "string",
      minLength: 1,
    },
    pages: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["pageNumber", "beatId", "text"],
        properties: {
          pageNumber: {
            type: "integer",
            minimum: 1,
            maximum: 6,
          },
          beatId: {
            type: "string",
          },
          text: {
            type: "string",
            minLength: 1,
          },
        },
      },
    },
    narrationText: {
      type: "string",
      minLength: 1,
    },
  },
} as const;

function cleanText(value: string | undefined): string | null {
  const text = value?.trim().replace(/\s+/g, " ");

  return text ? text : null;
}

export function getAcceptedImageUrl(beat: Pick<StoryBeatState, "accepted" | "generatedImageUrl">): string | null {
  return beat.accepted && beat.generatedImageUrl ? beat.generatedImageUrl : null;
}

export function buildFinalBookPromptBeats(beats: StoryBeatState[]): FinalBookPromptBeat[] {
  return beats.map((beat, index) => {
    const definition = getBeatDefinition(beat.beatId);

    return {
      pageNumber: index + 1,
      beatId: beat.beatId,
      beatTitle: definition?.title ?? beat.beatId,
      sessionPrompt: beat.prompt,
      drawPrompt: definition?.drawPrompt ?? null,
      describePrompt: definition?.describePrompt ?? null,
      transcript: cleanText(beat.transcript),
      correctionTranscripts: beat.correctionTranscripts.map((transcript) => transcript.trim()).filter(Boolean),
      acceptedImageUrl: getAcceptedImageUrl(beat),
    };
  });
}

export function buildFinalBookPrompt(beats: StoryBeatState[]): FinalBookPrompt {
  const promptBeats = buildFinalBookPromptBeats(beats);

  return {
    system: FINAL_BOOK_SYSTEM_PROMPT,
    user: [
      "You are assembling a six-page children's picture book from a child's Story Coach session.",
      "",
      "Rules:",
      "- Preserve the child's raw ideas and wording where it helps the voice feel authored by the child.",
      "- Use simple, vivid read-aloud language for ages 6-9.",
      "- Write exactly one page for each beat, in the order provided.",
      "- Make each page 1-3 short sentences.",
      "- Use accepted image URLs as page anchors. Do not mention URLs in the story text.",
      "- Include correction transcripts as final truth for the matching beat.",
      "- Do not add major new characters, powers, settings, or plot turns unless needed for clarity.",
      "- The ending must answer what the character wanted.",
      "- Return JSON only, matching this TypeScript shape:",
      "{ title: string; pages: { pageNumber: number; beatId: string; text: string }[]; narrationText: string }",
      "",
      "Story beat artifacts:",
      JSON.stringify(promptBeats, null, 2),
    ].join("\n"),
  };
}
