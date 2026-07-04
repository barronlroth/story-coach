import { STORY_BEATS } from "@/lib/beats";
import { getAcceptedImageUrl } from "@/lib/prompts/finalBookPrompt";
import type { FinalBook, FinalBookPage, StoryBeatState } from "@/lib/story-state";

const FALLBACK_IMAGE_URL = "";

const PAGE_FALLBACKS = [
  "A new character stepped into the story.",
  "Something special made the character shine.",
  "There was something important the character wanted.",
  "Then a problem got in the way.",
  "The character tried something brave.",
  "In the end, the story found its way home.",
];

function cleanText(value: string | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function ensureSentence(value: string): string {
  const text = cleanText(value);

  if (!text) {
    return text;
  }

  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => (word.length > 2 ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : word.toLowerCase()))
    .join(" ");
}

function extractName(transcript: string | undefined): string | null {
  const text = cleanText(transcript);
  const match =
    text.match(/\b(?:name is|called|this is|meet)\s+([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,3})/) ??
    text.match(/^([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,2})\b/);

  return match?.[1]?.trim().replace(/[.!?,;:]$/, "") || null;
}

function extractWantNoun(transcript: string | undefined): string | null {
  const text = cleanText(transcript).toLowerCase();
  const match = text.match(/\bwants?\s+(?:to\s+)?(?:find|get|make|save|reach|have|catch|build|see)\s+(?:the\s+|a\s+|an\s+)?([^.!?]+)/);

  if (!match?.[1]) {
    return null;
  }

  const phrase = match[1].replace(/\b(before|because|so|and then)\b.*$/, "").trim();

  return phrase ? titleCase(phrase) : null;
}

function textForPage(beat: StoryBeatState, pageIndex: number): string {
  const transcript = ensureSentence(beat.transcript ?? "");
  const corrections = beat.correctionTranscripts.map(ensureSentence).filter(Boolean);
  const base = transcript || PAGE_FALLBACKS[pageIndex] || ensureSentence(beat.prompt);

  if (corrections.length === 0) {
    return base;
  }

  return `${base} ${corrections.join(" ")}`;
}

function beatForPage(beats: StoryBeatState[], pageIndex: number): StoryBeatState {
  const expectedBeatId = STORY_BEATS[pageIndex]?.beatId;
  const matchingBeat = expectedBeatId ? beats.find((beat) => beat.beatId === expectedBeatId) : undefined;

  return (
    matchingBeat ??
    beats[pageIndex] ?? {
      beatId: expectedBeatId ?? `page-${pageIndex + 1}`,
      prompt: STORY_BEATS[pageIndex]?.drawPrompt ?? STORY_BEATS[pageIndex]?.describePrompt ?? PAGE_FALLBACKS[pageIndex],
      mode: STORY_BEATS[pageIndex]?.mode ?? "describe",
      correctionTranscripts: [],
      accepted: false,
    }
  );
}

export function writeFinalBookStub(beats: StoryBeatState[]): FinalBook {
  const pages: FinalBookPage[] = STORY_BEATS.map((_, index) => {
    const beat = beatForPage(beats, index);

    return {
      pageNumber: index + 1,
      beatId: beat.beatId,
      imageUrl: getAcceptedImageUrl(beat) ?? FALLBACK_IMAGE_URL,
      text: textForPage(beat, index),
    };
  });

  const mainCharacter = extractName(beatForPage(beats, 0).transcript);
  const want = extractWantNoun(beatForPage(beats, 2).transcript);
  const title = mainCharacter && want ? `${mainCharacter} and the ${want}` : mainCharacter ? `${mainCharacter}'s Story` : "My Story";
  const narrationText = pages.map((page) => page.text).join(" ");

  return {
    title,
    pages,
    narrationText,
  };
}
