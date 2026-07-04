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

function touch(session: StorySessionState, now = new Date()): StorySessionState {
  return {
    ...session,
    updatedAt: now.toISOString(),
  };
}

function updateCurrentBeat(
  session: StorySessionState,
  update: (beat: StoryBeatState) => StoryBeatState,
  now = new Date(),
): StorySessionState {
  return touch(
    {
      ...session,
      beats: session.beats.map((beat, index) =>
        index === session.currentBeatIndex ? update(beat) : beat,
      ),
    },
    now,
  );
}

export function saveCurrentBeatDrawing(
  session: StorySessionState,
  drawingImageUrl: string,
  now?: Date,
): StorySessionState {
  return {
    ...updateCurrentBeat(session, (beat) => ({ ...beat, drawingImageUrl }), now),
    currentStep: getNextStepAfterDrawing(getCurrentBeat(session)),
  };
}

export function saveCurrentBeatTranscript(
  session: StorySessionState,
  transcript: string,
  now?: Date,
): StorySessionState {
  return {
    ...updateCurrentBeat(session, (beat) => ({ ...beat, transcript }), now),
    currentStep: getNextStepAfterDescription(),
  };
}

export function saveCurrentBeatGeneratedImage(
  session: StorySessionState,
  generatedImageUrl: string,
  now?: Date,
): StorySessionState {
  return {
    ...updateCurrentBeat(session, (beat) => ({ ...beat, generatedImageUrl }), now),
    currentStep: getNextStepAfterGeneration(),
  };
}

export function addCorrectionTranscript(
  session: StorySessionState,
  correctionTranscript: string,
  now?: Date,
): StorySessionState {
  return {
    ...updateCurrentBeat(
      session,
      (beat) => ({
        ...beat,
        correctionTranscripts: [...beat.correctionTranscripts, correctionTranscript],
      }),
      now,
    ),
    currentStep: "generating",
  };
}

export function requestCorrection(session: StorySessionState, now?: Date): StorySessionState {
  return touch({ ...session, currentStep: "correction" }, now);
}

export function requestRegeneration(session: StorySessionState, now?: Date): StorySessionState {
  return touch({ ...session, currentStep: "generating" }, now);
}

export function acceptCurrentBeat(session: StorySessionState, now?: Date): StorySessionState {
  const acceptedSession = updateCurrentBeat(session, (beat) => ({ ...beat, accepted: true }), now);

  if (!canAdvanceToNextBeat(acceptedSession)) {
    return touch({ ...acceptedSession, currentStep: "confirm" }, now);
  }

  const currentBeatIndex = acceptedSession.currentBeatIndex + 1;
  const nextBeat = acceptedSession.beats[currentBeatIndex];

  return touch(
    {
      ...acceptedSession,
      currentBeatIndex,
      currentStep: getNextBeatStep(nextBeat),
    },
    now,
  );
}
