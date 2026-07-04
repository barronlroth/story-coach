import { STORY_BEATS, type BeatDefinition, type BeatMode } from "@/lib/beats";

export type BeatStep = "draw" | "describe" | "generating" | "confirm" | "correction";

export type StoryBeatState = {
  beatId: string;
  prompt: string;
  mode: BeatMode;
  drawingImageUrl?: string;
  transcript?: string;
  generatedImageUrl?: string;
  correctionTranscripts: string[];
  accepted: boolean;
};

export type FinalBookPage = {
  pageNumber: number;
  beatId: string;
  imageUrl: string;
  text: string;
};

export type FinalBook = {
  title: string;
  pages: FinalBookPage[];
  narrationText: string;
};

export type StorySessionState = {
  sessionId: string;
  currentBeatIndex: number;
  currentStep: BeatStep;
  beats: StoryBeatState[];
  finalBook?: FinalBook;
  createdAt: string;
  updatedAt: string;
};

function firstStepForBeat(beat: Pick<BeatDefinition, "mode">): BeatStep {
  return beat.mode === "describe" ? "describe" : "draw";
}

export function createInitialStorySession(now = new Date()): StorySessionState {
  const timestamp = now.toISOString();
  const beats = STORY_BEATS.map((beat) => ({
    beatId: beat.beatId,
    prompt: beat.drawPrompt ?? beat.describePrompt ?? beat.title,
    mode: beat.mode,
    correctionTranscripts: [],
    accepted: false,
  }));

  return {
    sessionId: `story-${now.getTime()}`,
    currentBeatIndex: 0,
    currentStep: firstStepForBeat(STORY_BEATS[0]),
    beats,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getCurrentBeat(session: StorySessionState): StoryBeatState {
  return session.beats[session.currentBeatIndex];
}

export function getCurrentBeatDefinition(session: StorySessionState): BeatDefinition {
  const beat = getCurrentBeat(session);
  const definition = STORY_BEATS.find((item) => item.beatId === beat.beatId);

  if (!definition) {
    throw new Error(`Unknown beat id: ${beat.beatId}`);
  }

  return definition;
}

export function canAdvanceToNextBeat(session: StorySessionState): boolean {
  return session.currentBeatIndex < session.beats.length - 1;
}

export function getNextStepAfterDrawing(beat: StoryBeatState): BeatStep {
  if (beat.mode === "draw") {
    return "generating";
  }

  return "describe";
}

export function getNextStepAfterDescription(): BeatStep {
  return "generating";
}

export function getNextStepAfterGeneration(): BeatStep {
  return "confirm";
}

export function getNextBeatStep(nextBeat: StoryBeatState): BeatStep {
  return nextBeat.mode === "describe" ? "describe" : "draw";
}
