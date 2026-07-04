import { describe, expect, it } from "vitest";
import { STORY_BEATS } from "@/lib/beats";
import {
  acceptCurrentBeat,
  addCorrectionTranscript,
  createInitialStorySession,
  getNextBeatStep,
  getNextStepAfterDescription,
  getNextStepAfterDrawing,
  getNextStepAfterGeneration,
  saveCurrentBeatDrawing,
  saveCurrentBeatGeneratedImage,
  saveCurrentBeatTranscript,
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

  it("saves drawing, transcript, generated image, correction, and acceptance without changing other beats", () => {
    const initial = createInitialStorySession(new Date("2026-07-04T12:00:00.000Z"));
    const withDrawing = saveCurrentBeatDrawing(initial, "data:image/png;base64,abc");
    const withTranscript = saveCurrentBeatTranscript(withDrawing, "His name is Jesse Marsh.");
    const withImage = saveCurrentBeatGeneratedImage(withTranscript, "/generated/jesse.png");
    const withCorrection = addCorrectionTranscript(withImage, "Make the wings purple.");
    const accepted = acceptCurrentBeat(withCorrection);

    expect(accepted.currentStep).toBe("draw");
    expect(accepted.currentBeatIndex).toBe(1);
    expect(accepted.beats[0]).toMatchObject({
      beatId: "main-character",
      drawingImageUrl: "data:image/png;base64,abc",
      transcript: "His name is Jesse Marsh.",
      generatedImageUrl: "/generated/jesse.png",
      correctionTranscripts: ["Make the wings purple."],
      accepted: true,
    });
    expect(accepted.beats[1]).toMatchObject({
      beatId: "special",
      accepted: false,
    });
  });
});
