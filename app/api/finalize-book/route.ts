import { NextResponse } from "next/server";
import { writeFinalBookWithCodex } from "@/lib/ai/codexStoryWriter";
import { writeFinalBookStub } from "@/lib/ai/storyWriterStub";
import type { FinalBook, StoryBeatState } from "@/lib/story-state";

export const runtime = "nodejs";

type FinalizeBookRequest = {
  beats?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStoryBeatState(value: unknown): value is StoryBeatState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.beatId === "string" &&
    typeof record.prompt === "string" &&
    typeof record.mode === "string" &&
    isStringArray(record.correctionTranscripts) &&
    typeof record.accepted === "boolean" &&
    (record.transcript === undefined || typeof record.transcript === "string") &&
    (record.drawingImageUrl === undefined || typeof record.drawingImageUrl === "string") &&
    (record.generatedImageUrl === undefined || typeof record.generatedImageUrl === "string")
  );
}

function parseBeats(body: FinalizeBookRequest): StoryBeatState[] {
  if (!Array.isArray(body.beats) || body.beats.length !== 6) {
    throw new Error("POST /api/finalize-book expects exactly six beats.");
  }

  if (!body.beats.every(isStoryBeatState)) {
    throw new Error("POST /api/finalize-book received malformed beat data.");
  }

  return body.beats;
}

async function writeFinalBook(beats: StoryBeatState[]): Promise<FinalBook> {
  if (process.env.STORY_COACH_STORY_PROVIDER === "codex" || process.env.STORY_WRITER_PROVIDER === "codex") {
    return writeFinalBookWithCodex(beats);
  }

  return writeFinalBookStub(beats);
}

function validateFinalBook(book: FinalBook): FinalBook {
  if (!book.title || !book.narrationText || book.pages.length !== 6) {
    throw new Error("Final story writer returned an invalid book.");
  }

  book.pages.forEach((page, index) => {
    if (page.pageNumber !== index + 1 || !page.beatId || !page.text) {
      throw new Error("Final story writer returned an invalid page.");
    }
  });

  return book;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FinalizeBookRequest;
    const beats = parseBeats(body);
    const book = validateFinalBook(await writeFinalBook(beats));

    return NextResponse.json(book);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finalize the book.";
    const status = message.includes("not configured") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
