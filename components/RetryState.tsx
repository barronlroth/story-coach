"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import { cx, storyCoachTreatments } from "@/lib/design-tokens";

type RetryStateProps = {
  title?: string;
  message?: string;
  drawingImageUrl?: string;
  drawingImageAlt?: string;
  posterLabel?: string;
  safeNote?: string;
  retryLabel?: string;
  goBackLabel?: string;
  onRetry: () => void;
  onGoBack?: () => void;
  isBusy?: boolean;
  className?: string;
};

export function RetryState({
  title = "Oops, that didn't work",
  message = "Let's try that part again",
  drawingImageUrl,
  drawingImageAlt = "Your drawing",
  posterLabel = "Your drawing",
  safeNote = "Your drawing is still here.",
  retryLabel = "Try again",
  goBackLabel = "Go back",
  onRetry,
  onGoBack,
  isBusy = false,
  className,
}: RetryStateProps) {
  return (
    <section className={cx(storyCoachTreatments.workspaceBand, "grid gap-6 p-5 md:grid-cols-[0.58fr_0.42fr] md:p-8", className)}>
      <div className={cx(storyCoachTreatments.paperPanel, "flex min-h-[28rem] flex-col items-center justify-center p-6 text-center")}>
        <div className="mb-3 flex items-end gap-2" aria-hidden="true">
          <span className="h-5 w-20 rotate-[-12deg] rounded-sm bg-[var(--accent-sun)] shadow-sm" />
          <span className="h-14 w-14 rounded-[16px] bg-[var(--accent-sun)] shadow-md" />
          <span className="h-5 w-20 rotate-[12deg] rounded-sm bg-[var(--accent-sun)] shadow-sm" />
        </div>
        <h2 className="max-w-xl text-4xl font-black leading-tight text-[var(--ink-primary)] md:text-6xl">{title}</h2>
        <p className="mt-4 text-2xl font-bold leading-snug text-[var(--ink-primary)]/85">{message}</p>

        <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cx(storyCoachTreatments.touchButton, "bg-[#2578d8] text-white shadow-[0_8px_0_rgba(22,86,161,0.24),0_14px_28px_rgba(78,56,28,0.14)]")}
            onClick={onRetry}
            disabled={isBusy}
          >
            <RotateCcw size={32} strokeWidth={3} aria-hidden="true" />
            {retryLabel}
          </button>
          {onGoBack ? (
            <button
              type="button"
              className={cx(storyCoachTreatments.touchButton, storyCoachTreatments.secondaryButton)}
              onClick={onGoBack}
              disabled={isBusy}
            >
              <ArrowLeft size={30} strokeWidth={3} aria-hidden="true" />
              {goBackLabel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5">
        <div className="rotate-[-3deg] rounded-[8px] bg-[var(--accent-sun)] px-5 py-4 text-center text-xl font-black shadow-[0_12px_22px_rgba(78,56,28,0.18)]">
          {safeNote}
        </div>
        <div className="relative rotate-[2deg]">
          <span className={cx(storyCoachTreatments.tapeStrip, "left-1/2 top-[-14px] z-20 -translate-x-1/2 rotate-[2deg]")} aria-hidden="true" />
          <span className={cx(storyCoachTreatments.pin, "left-3 top-[-8px] z-20 bg-[var(--accent-leaf)]")} aria-hidden="true" />
          <span className={cx(storyCoachTreatments.pin, "right-3 top-[-8px] z-20 bg-[var(--accent-coral)]")} aria-hidden="true" />
          <div className={storyCoachTreatments.pinnedLandscapePaper}>
            {drawingImageUrl ? (
              <img src={drawingImageUrl} alt={drawingImageAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white text-lg font-black text-[var(--ink-soft)]">
                {posterLabel}
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-base font-extrabold text-[var(--ink-soft)]">{posterLabel}</p>
        </div>
      </div>
    </section>
  );
}
