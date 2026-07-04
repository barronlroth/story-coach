import type { FinalBook, StorySessionState } from "@/lib/story-state";
import { createInitialStorySession } from "@/lib/story-state";

export const DEMO_TRANSCRIPTS: Record<string, string> = {
  "main-character": "His name is Jesse Marsh. He is a brave green dragon who loves castles.",
  special: "Jesse has purple wings that sparkle when he tells the truth.",
  want: "Jesse wants to find the moon kite before the stars go to sleep.",
  problem: "A windy cloud maze keeps blowing the kite farther away.",
  try: "Jesse builds a castle ladder and asks the fireflies to light the path.",
  ending: "Jesse catches the moon kite and shares its glow with every sleepy star.",
};

export const DEMO_IMAGE_URLS: Record<string, string> = {
  "main-character": "/generated/demo/main-character.png",
  special: "/generated/demo/special.png",
  want: "/generated/demo/want.png",
  problem: "/generated/demo/problem.png",
  try: "/generated/demo/try.png",
  ending: "/generated/demo/ending.png",
};

export const DEMO_IMAGE_URL = DEMO_IMAGE_URLS["main-character"];

export function createSeedSession(now = new Date("2026-07-04T12:00:00.000Z")): StorySessionState {
  const session = createInitialStorySession(now);

  return {
    ...session,
    currentBeatIndex: 0,
    currentStep: "confirm",
    beats: session.beats.map((beat) => ({
      ...beat,
      drawingImageUrl: beat.mode === "describe" ? undefined : "/storyboard/01-step-1a-draw-main-character.png",
      transcript: DEMO_TRANSCRIPTS[beat.beatId],
      generatedImageUrl: DEMO_IMAGE_URLS[beat.beatId] ?? DEMO_IMAGE_URL,
      accepted: beat.beatId !== "main-character",
    })),
  };
}

export const SEED_FINAL_BOOK: FinalBook = {
  title: "Jesse Marsh and the Moon Kite",
  pages: [
    {
      pageNumber: 1,
      beatId: "main-character",
      imageUrl: DEMO_IMAGE_URLS["main-character"],
      text: "Jesse Marsh was a brave green dragon who loved tall castles and windy skies.",
    },
    {
      pageNumber: 2,
      beatId: "special",
      imageUrl: DEMO_IMAGE_URLS.special,
      text: "His purple wings sparkled whenever he told the truth.",
    },
    {
      pageNumber: 3,
      beatId: "want",
      imageUrl: DEMO_IMAGE_URLS.want,
      text: "One night, Jesse wanted to find the moon kite before the stars fell asleep.",
    },
    {
      pageNumber: 4,
      beatId: "problem",
      imageUrl: DEMO_IMAGE_URLS.problem,
      text: "A windy cloud maze blew the kite farther and farther away.",
    },
    {
      pageNumber: 5,
      beatId: "try",
      imageUrl: DEMO_IMAGE_URLS.try,
      text: "Jesse built a castle ladder and asked fireflies to light the path.",
    },
    {
      pageNumber: 6,
      beatId: "ending",
      imageUrl: DEMO_IMAGE_URLS.ending,
      text: "At last, Jesse caught the moon kite and shared its glow with every sleepy star.",
    },
  ],
  narrationText:
    "Jesse Marsh was a brave green dragon who loved tall castles and windy skies. His purple wings sparkled whenever he told the truth. One night, Jesse wanted to find the moon kite before the stars fell asleep. A windy cloud maze blew the kite farther and farther away. Jesse built a castle ladder and asked fireflies to light the path. At last, Jesse caught the moon kite and shared its glow with every sleepy star.",
};
