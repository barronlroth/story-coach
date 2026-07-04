"use client";

import { CheckCircle2, PencilLine, RotateCcw } from "lucide-react";
import { cx, storyCoachTreatments } from "@/lib/design-tokens";

type ConfirmationPanelProps = {
  generatedImageUrl: string;
  generatedImageAlt?: string;
  drawingImageUrl?: string;
  drawingImageAlt?: string;
  title?: string;
  beatLabel?: string;
  summaryTitle?: string;
  summaryText?: string;
  looksRightLabel?: string;
  addDetailLabel?: string;
  tryAgainLabel?: string;
  onLooksRight: () => void;
  onAddDetail: () => void;
  onTryAgain: () => void;
  isBusy?: boolean;
  className?: string;
};

export function ConfirmationPanel({
  generatedImageUrl,
  generatedImageAlt = "Generated storybook picture",
  drawingImageUrl,
  drawingImageAlt = "Your drawing",
  title = "Did I get it right?",
  beatLabel,
  summaryTitle,
  summaryText,
  looksRightLabel = "Looks right",
  addDetailLabel = "Add detail",
  tryAgainLabel = "Try again",
  onLooksRight,
  onAddDetail,
  onTryAgain,
  isBusy = false,
  className,
}: ConfirmationPanelProps) {
  return (
    <section className={cx(storyCoachTreatments.workspaceBand, "grid gap-6 p-5 md:grid-cols-[1fr_0.7fr] md:p-8", className)}>
      <div className="flex flex-col justify-center">
        {beatLabel ? (
          <span className="mb-4 w-fit rounded-full bg-[var(--accent-sun)] px-5 py-2 text-lg font-black shadow-sm">
            {beatLabel}
          </span>
        ) : null}
        <h2 className="max-w-2xl text-4xl font-black leading-tight text-[var(--ink-primary)] md:text-6xl">{title}</h2>

        <div className="relative mt-6 rotate-[-2deg]">
          <span className={cx(storyCoachTreatments.tapeStrip, "left-5 top-[-14px] z-20 rotate-[-10deg]")} aria-hidden="true" />
          <div className={storyCoachTreatments.confirmationImageStage}>
            <img src={generatedImageUrl} alt={generatedImageAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5">
        {drawingImageUrl ? (
          <div className="relative rotate-[2deg]">
            <span className={cx(storyCoachTreatments.pin, "left-3 top-[-8px] z-20 bg-[var(--accent-leaf)]")} aria-hidden="true" />
            <span className={cx(storyCoachTreatments.pin, "right-3 top-[-8px] z-20 bg-[var(--accent-coral)]")} aria-hidden="true" />
            <div className={storyCoachTreatments.pinnedLandscapePaper}>
              <img src={drawingImageUrl} alt={drawingImageAlt} className="h-full w-full object-cover" />
            </div>
            <p className="mt-3 text-center text-base font-extrabold text-[var(--ink-soft)]">Your drawing</p>
          </div>
        ) : null}

        {summaryTitle || summaryText ? (
          <div className={cx(storyCoachTreatments.paperPanel, "p-5 text-center")}>
            {summaryTitle ? <h3 className="text-3xl font-black leading-tight text-[var(--ink-primary)]">{summaryTitle}</h3> : null}
            {summaryText ? <p className="mt-2 text-xl font-semibold leading-snug text-[var(--ink-soft)]">{summaryText}</p> : null}
          </div>
        ) : null}

        <div className="grid gap-3">
          <button
            type="button"
            className={cx(storyCoachTreatments.touchButton, storyCoachTreatments.primaryButton, "w-full text-2xl")}
            onClick={onLooksRight}
            disabled={isBusy}
          >
            <CheckCircle2 size={34} strokeWidth={3} aria-hidden="true" />
            {looksRightLabel}
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={cx(storyCoachTreatments.touchButton, storyCoachTreatments.secondaryButton)}
              onClick={onAddDetail}
              disabled={isBusy}
            >
              <PencilLine size={24} strokeWidth={2.8} aria-hidden="true" />
              {addDetailLabel}
            </button>
            <button
              type="button"
              className={cx(storyCoachTreatments.touchButton, storyCoachTreatments.retryButton)}
              onClick={onTryAgain}
              disabled={isBusy}
            >
              <RotateCcw size={25} strokeWidth={2.8} aria-hidden="true" />
              {tryAgainLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
