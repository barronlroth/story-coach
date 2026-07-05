"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, FileText, RotateCcw } from "lucide-react";
import { AddDetailPanel } from "@/components/AddDetailPanel";
import { BeatProgress } from "@/components/BeatProgress";
import { BookBuilderState } from "@/components/BookBuilderState";
import { BookReader } from "@/components/BookReader";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { GeneratingState } from "@/components/GeneratingState";
import { PinnedDrawing } from "@/components/PinnedDrawing";
import { RetryState } from "@/components/RetryState";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { getBeatDefinition, STORY_BEATS } from "@/lib/beats";
import { SEED_FINAL_BOOK, createSeedSession } from "@/lib/seed-data";
import { loadStorySession, saveStorySession } from "@/lib/storage";
import {
  acceptCurrentBeat,
  addCorrectionTranscript,
  createInitialStorySession,
  getCurrentBeat,
  getCurrentBeatDefinition,
  requestCorrection,
  requestRegeneration,
  saveCurrentBeatDrawing,
  saveCurrentBeatGeneratedImage,
  saveCurrentBeatTranscript,
  type FinalBook,
  type StoryBeatState,
  type StorySessionState,
} from "@/lib/story-state";

type GenerateImageResponse = {
  imageUrl: string;
};

type AppMode = "story" | "building-book" | "book" | "error";

export function StoryCoachApp() {
  const [session, setSession] = useState<StorySessionState>(() => createInitialStorySession());
  const [appMode, setAppMode] = useState<AppMode>("story");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stored = loadStorySession(window.localStorage);
    if (stored) {
      setSession(stored);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveStorySession(session, window.localStorage);
    }
  }, [isHydrated, session]);

  const currentBeat = getCurrentBeat(session);
  const currentDefinition = getCurrentBeatDefinition(session);
  const currentBeatReferenceImage = getCurrentBeatReferenceImage(session);
  const completedBeatIds = useMemo(
    () => session.beats.filter((beat) => beat.accepted).map((beat) => beat.beatId),
    [session.beats],
  );
  function updateSession(updater: (current: StorySessionState) => StorySessionState) {
    setSession((current) => updater(current));
  }

  function resetError() {
    setErrorMessage("");
    if (appMode === "error") {
      setAppMode("story");
    }
  }

  function startNewStory() {
    setSession(createInitialStorySession());
    setAppMode("story");
    setErrorMessage("");
  }

  function loadDemoStory() {
    setSession({
      ...createSeedSession(),
      finalBook: SEED_FINAL_BOOK,
    });
    setAppMode("story");
    setErrorMessage("");
  }

  async function generateImage(
    intent: "first_generation" | "correction" | "regenerate",
    sourceSession: StorySessionState = session,
  ) {
    resetError();
    setIsBusy(true);
    setSession({ ...sourceSession, currentStep: "generating" });

    try {
      const beat = getCurrentBeat(sourceSession);
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beat,
          previousAcceptedImages: getPreviousAcceptedImages(sourceSession),
          intent,
        }),
      });

      if (!response.ok) {
        throw new Error("Story Coach could not make the picture.");
      }

      const payload = (await response.json()) as GenerateImageResponse;

      if (!payload.imageUrl) {
        throw new Error("Story Coach did not return a picture.");
      }

      updateSession((current) => saveCurrentBeatGeneratedImage(current, payload.imageUrl));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Story Coach could not make the picture.");
      setAppMode("error");
    } finally {
      setIsBusy(false);
    }
  }

  function handleDrawingExport(dataUrl: string) {
    updateSession((current) => saveCurrentBeatDrawing(current, dataUrl));
  }

  function handleTranscript(transcript: string) {
    const nextSession = saveCurrentBeatTranscript(session, transcript);
    setSession(nextSession);
    void generateImage("first_generation", nextSession);
  }

  function handleLooksRight() {
    if (session.currentBeatIndex === session.beats.length - 1) {
      updateSession((current) => ({
        ...acceptCurrentBeat(current),
        currentStep: "confirm",
      }));
      void finalizeBook();
      return;
    }

    updateSession((current) => acceptCurrentBeat(current));
  }

  async function finalizeBook() {
    resetError();
    setIsBusy(true);
    setAppMode("building-book");

    try {
      const response = await fetch("/api/finalize-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beats: session.beats.map((beat, index) =>
            index === session.currentBeatIndex ? { ...beat, accepted: true } : beat,
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Story Coach could not build the book.");
      }

      const book = (await response.json()) as FinalBook;
      updateSession((current) => ({ ...current, finalBook: book }));
      setAppMode("book");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Story Coach could not build the book.");
      setAppMode("error");
    } finally {
      setIsBusy(false);
    }
  }

  function handleAddDetail() {
    updateSession((current) => requestCorrection(current));
  }

  function handleSubmitDetail(detail: string) {
    const nextSession = addCorrectionTranscript(session, detail);
    setSession(nextSession);
    void generateImage("correction", nextSession);
  }

  function handleTryAgain() {
    const nextSession = requestRegeneration(session);
    setSession(nextSession);
    void generateImage("regenerate", nextSession);
  }

  function renderStoryStep() {
    if (appMode === "building-book") {
      return <BookBuilderState />;
    }

    if (appMode === "book" && session.finalBook) {
      return <BookReader book={session.finalBook} />;
    }

    if (appMode === "error") {
      return (
        <RetryState
          title="That part got stuck"
          message={errorMessage || "Let's try that part again."}
          drawingImageUrl={currentBeatReferenceImage?.imageUrl}
          drawingImageAlt={currentBeatReferenceImage?.alt}
          posterLabel={currentBeatReferenceImage?.label}
          safeNote={currentBeatReferenceImage?.safeNote}
          onRetry={() => {
            setAppMode("story");
            if (currentBeat.generatedImageUrl) {
              updateSession((current) => ({ ...current, currentStep: "confirm" }));
            }
          }}
          onGoBack={() => {
            setAppMode("story");
            setErrorMessage("");
          }}
          isBusy={isBusy}
        />
      );
    }

    if (session.currentStep === "draw") {
      return (
        <DrawingCanvas
          prompt={currentDefinition.drawPrompt}
          helperText={currentDefinition.helperText}
          initialImageUrl={currentBeat.drawingImageUrl}
          onExport={handleDrawingExport}
          exportLabel="Done drawing"
        />
      );
    }

    if (session.currentStep === "describe") {
      return (
        <DescribeStep
          beat={currentBeat}
          prompt={currentDefinition.describePrompt ?? currentDefinition.title}
          nudges={currentDefinition.nudges}
          referenceImage={currentBeatReferenceImage}
          onBackToDraw={
            currentBeat.mode === "describe"
              ? undefined
              : () => updateSession((current) => ({ ...current, currentStep: "draw" }))
          }
          onTranscript={handleTranscript}
        />
      );
    }

    if (session.currentStep === "generating") {
      return (
        <GeneratingState
          title={currentBeat.generatedImageUrl ? "Trying a new picture..." : "Making your picture..."}
          subtitle={
            currentBeat.drawingImageUrl
              ? "Using the drawing, words, and story so far"
              : "Using the words and story so far"
          }
          drawingImageUrl={currentBeatReferenceImage?.imageUrl}
          drawingAlt={currentBeatReferenceImage?.alt}
          posterLabel={currentBeatReferenceImage?.label}
        />
      );
    }

    if (session.currentStep === "correction" && currentBeat.generatedImageUrl) {
      return (
        <AddDetailPanel
          generatedImageUrl={currentBeat.generatedImageUrl}
          originalDrawingImageUrl={currentBeat.drawingImageUrl}
          onSubmitDetail={handleSubmitDetail}
          onCancel={() => updateSession((current) => ({ ...current, currentStep: "confirm" }))}
          isSubmitting={isBusy}
        />
      );
    }

    if (session.currentStep === "confirm" && currentBeat.generatedImageUrl) {
      return (
        <ConfirmationPanel
          generatedImageUrl={currentBeat.generatedImageUrl}
          drawingImageUrl={currentBeat.drawingImageUrl}
          beatLabel={currentDefinition.title}
          title={session.currentBeatIndex === session.beats.length - 1 ? "Ready to make your book?" : "Did I get it right?"}
          summaryTitle={currentDefinition.title}
          summaryText={currentBeat.transcript}
          onLooksRight={handleLooksRight}
          onAddDetail={handleAddDetail}
          onTryAgain={handleTryAgain}
          looksRightLabel={session.currentBeatIndex === session.beats.length - 1 ? "Make book" : "Looks right"}
          isBusy={isBusy}
        />
      );
    }

    return (
      <RetryState
        title="This beat needs one more thing"
        message="Go back and add the missing drawing or words."
        drawingImageUrl={currentBeatReferenceImage?.imageUrl}
        drawingImageAlt={currentBeatReferenceImage?.alt}
        posterLabel={currentBeatReferenceImage?.label}
        safeNote={currentBeatReferenceImage?.safeNote}
        onRetry={() => updateSession((current) => ({ ...current, currentStep: currentBeat.mode === "describe" ? "describe" : "draw" }))}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden px-4 py-4 text-[var(--ink-primary)] md:px-7 md:py-6">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col rounded-[30px] border border-[var(--border-paper)] bg-[rgba(255,248,232,0.76)] p-4 shadow-[var(--shadow-paper)] backdrop-blur-sm md:min-h-[calc(100vh-3rem)] md:p-6">
        <header className="grid gap-4 rounded-[24px] bg-white/42 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
          <BeatProgress currentBeatIndex={session.currentBeatIndex} completedBeatIds={completedBeatIds} />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-black text-[var(--ink-soft)] shadow-sm"
              onClick={loadDemoStory}
            >
              <FileText size={18} />
              Seed flow
            </button>
            {session.finalBook ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--accent-sky)] px-4 py-2 text-sm font-black text-[var(--ink-primary)] shadow-sm"
                onClick={() => setAppMode("book")}
              >
                <BookOpen size={18} />
                Book
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--ink-primary)] px-4 py-2 text-sm font-black text-white shadow-sm"
              onClick={startNewStory}
            >
              <RotateCcw size={18} />
              New story
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center py-5 md:py-7">{renderStoryStep()}</div>
      </section>
    </main>
  );
}

function getPreviousAcceptedImages(sourceSession: StorySessionState) {
  return sourceSession.beats
    .filter((beat) => beat.accepted && beat.generatedImageUrl)
    .map((beat) => ({ beatId: beat.beatId, imageUrl: beat.generatedImageUrl as string }));
}

type BeatReferenceImage = {
  imageUrl: string;
  alt: string;
  label: string;
  safeNote: string;
};

function getCurrentBeatReferenceImage(sourceSession: StorySessionState): BeatReferenceImage | undefined {
  const beat = getCurrentBeat(sourceSession);

  if (beat.drawingImageUrl) {
    return {
      imageUrl: beat.drawingImageUrl,
      alt: "Your drawing",
      label: "Your drawing",
      safeNote: "Your drawing is still here.",
    };
  }

  const previousAcceptedBeat = [...sourceSession.beats]
    .slice(0, sourceSession.currentBeatIndex)
    .reverse()
    .find((previousBeat) => previousBeat.accepted && previousBeat.generatedImageUrl);

  if (!previousAcceptedBeat?.generatedImageUrl) {
    return undefined;
  }

  return {
    imageUrl: previousAcceptedBeat.generatedImageUrl,
    alt: "Story picture so far",
    label: "Story so far",
    safeNote: "The story picture is still here.",
  };
}

type DescribeStepProps = {
  beat: StoryBeatState;
  prompt: string;
  nudges: string[];
  referenceImage?: BeatReferenceImage;
  onBackToDraw?: () => void;
  onTranscript: (transcript: string) => void;
};

function DescribeStep({ beat, prompt, nudges, referenceImage, onBackToDraw, onTranscript }: DescribeStepProps) {
  const beatDefinition = getBeatDefinition(beat.beatId);

  return (
    <section className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative rounded-[28px] border border-[var(--border-paper)] bg-[var(--surface-paper)] p-5 shadow-[var(--shadow-paper)] md:p-7">
        <div className="absolute -left-2 -top-3 z-10 rotate-[-7deg] rounded-full bg-[var(--accent-coral)] px-4 py-2 text-sm font-black text-white shadow-md">
          {beatDefinition?.title ?? "Story beat"}
        </div>
        <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.02] md:text-6xl">{prompt}</h1>
        <p className="mt-4 max-w-lg text-xl font-semibold leading-snug text-[var(--ink-soft)]">
          Say it out loud or type it. Any idea can help.
        </p>
        <div className="mt-8">
          {beat.drawingImageUrl ? (
            <PinnedDrawing imageUrl={beat.drawingImageUrl} caption="Your drawing" />
          ) : referenceImage ? (
            <PinnedDrawing imageUrl={referenceImage.imageUrl} alt={referenceImage.alt} caption={referenceImage.label} />
          ) : (
            <div className="rounded-[24px] border-2 border-dashed border-[var(--border-paper)] bg-white/70 p-8 text-center text-xl font-black text-[var(--ink-soft)]">
              No drawing for this part. Just tell the story.
            </div>
          )}
        </div>
        {onBackToDraw ? (
          <button
            type="button"
            onClick={onBackToDraw}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-base font-black text-[var(--ink-primary)] shadow-sm"
          >
            <ChevronLeft size={20} />
            Back to drawing
          </button>
        ) : null}
      </div>

      <VoiceRecorder
        prompt="Start talking"
        nudges={nudges}
        allowMockTranscript
        initialTypedText={beat.transcript ?? ""}
        onTranscript={(transcript) => onTranscript(transcript)}
      />
    </section>
  );
}
