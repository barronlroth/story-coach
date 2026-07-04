import { describe, expect, it } from "vitest";
import { STORY_BEATS } from "@/lib/beats";
import {
  createInitialStorySession,
  getNextBeatStep,
  getNextStepAfterDescription,
  getNextStepAfterDrawing,
  getNextStepAfterGeneration,
} from "@/lib/story-state";

describe("story session state", () => {
  it("creates one artifact-based state entry per story beat", () => {
    const session = createInitialStorySession(new Date("2026-07-04T12:00:00.000Z"));

    expect(session.currentBeatIndex).toBe(0);
    expect(session.currentStep).toBe("draw");
    expect(session.beats).toHaveLength(STORY_BEATS.length);
    expect(session.beats[0]).toMatchObject({
      beatId: "main-character",
      mode: "drawThenDescribe",
      correctionTranscripts: [],
      accepted: false,
    });
  });

  it("starts describe-only beats on the describe step", () => {
    const wantBeat = createInitialStorySession().beats.find((beat) => beat.beatId === "want");

    expect(wantBeat).toBeDefined();
    expect(getNextBeatStep(wantBeat!)).toBe("describe");
  });

  it("moves from draw to describe, description to generating, and generation to confirm", () => {
    const [mainBeat] = createInitialStorySession().beats;

    expect(getNextStepAfterDrawing(mainBeat)).toBe("describe");
    expect(getNextStepAfterDescription()).toBe("generating");
    expect(getNextStepAfterGeneration()).toBe("confirm");
  });
});
