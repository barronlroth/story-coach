"use client";

import { useState, type FormEvent } from "react";
import { Mic, RotateCcw, X } from "lucide-react";
import { cx, storyCoachTreatments } from "@/lib/design-tokens";

type AddDetailPanelProps = {
  generatedImageUrl: string;
  generatedImageAlt?: string;
  originalDrawingImageUrl?: string;
  originalDrawingAlt?: string;
  prompt?: string;
  helperText?: string;
  exampleText?: string;
  submitLabel?: string;
  cancelLabel?: string;
  initialDetail?: string;
  onSubmitDetail: (detail: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
};

export function AddDetailPanel({
  generatedImageUrl,
  generatedImageAlt = "Generated storybook picture",
  originalDrawingImageUrl,
  originalDrawingAlt = "Original drawing",
  prompt = "What should I change?",
  helperText = "Tell me the missing detail",
  exampleText = "Purple wings, not blue",
  submitLabel = "Update it",
  cancelLabel = "Cancel",
  initialDetail = "",
  onSubmitDetail,
  onCancel,
  isSubmitting = false,
  className,
}: AddDetailPanelProps) {
  const [detail, setDetail] = useState(initialDetail);
  const trimmedDetail = detail.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedDetail || isSubmitting) {
      return;
    }

    onSubmitDetail(trimmedDetail);
  }

  return (
    <section className={cx(storyCoachTreatments.workspaceBand, "grid gap-6 p-5 md:grid-cols-2 md:p-8", className)}>
      <div className="grid content-start gap-5">
        <div className="relative rotate-[-2deg]">
          <span className={cx(storyCoachTreatments.pin, "left-3 top-[-8px] z-20 bg-[var(--accent-leaf)]")} aria-hidden="true" />
          <div className={storyCoachTreatments.confirmationImageStage}>
            <img src={generatedImageUrl} alt={generatedImageAlt} className="h-full w-full object-contain" />
          </div>
          <p className="mt-3 text-center text-base font-extrabold text-[var(--ink-soft)]">Generated image</p>
        </div>

        {originalDrawingImageUrl ? (
          <div className="relative mx-auto w-full max-w-md rotate-[2deg]">
            <span className={cx(storyCoachTreatments.tapeStrip, "left-1/2 top-[-14px] z-20 -translate-x-1/2 rotate-[3deg]")} aria-hidden="true" />
            <div className={storyCoachTreatments.pinnedLandscapePaper}>
              <img src={originalDrawingImageUrl} alt={originalDrawingAlt} className="h-full w-full object-contain" />
            </div>
            <p className="mt-3 text-center text-base font-extrabold text-[var(--ink-soft)]">Original drawing</p>
          </div>
        ) : null}
      </div>

      <form className="flex flex-col justify-center" onSubmit={handleSubmit}>
        <h2 className="text-center text-4xl font-black leading-tight text-[var(--ink-primary)] md:text-6xl">{prompt}</h2>
        <div className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-[22px] bg-[var(--accent-sun)] px-6 py-3 text-xl font-black shadow-md">
          <Mic size={28} strokeWidth={3} className="text-[#2578d8]" aria-hidden="true" />
          {helperText}
        </div>

        <label className="mt-7 text-lg font-black text-[var(--ink-primary)]" htmlFor="story-coach-correction">
          Add the detail
        </label>
        <textarea
          id="story-coach-correction"
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          rows={4}
          placeholder={exampleText}
          className="mt-2 min-h-32 resize-none rounded-[22px] border-2 border-[var(--border-paper)] bg-white/85 px-5 py-4 text-xl font-semibold leading-snug text-[var(--ink-primary)] shadow-inner outline-none transition focus:border-[#2578d8] focus:ring-4 focus:ring-[#2578d8]/20"
          disabled={isSubmitting}
        />
        <p className="mt-3 text-center text-base font-bold text-[var(--ink-soft)]">
          Example: <span className="text-[var(--ink-primary)]">{exampleText}</span>
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            className={cx(storyCoachTreatments.touchButton, storyCoachTreatments.successButton)}
            disabled={!trimmedDetail || isSubmitting}
          >
            <RotateCcw size={25} strokeWidth={2.8} aria-hidden="true" />
            {submitLabel}
          </button>
          <button
            type="button"
            className={cx(storyCoachTreatments.touchButton, "bg-[var(--accent-coral)] text-white shadow-[0_8px_0_rgba(185,74,55,0.22),0_14px_28px_rgba(78,56,28,0.14)]")}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X size={26} strokeWidth={3} aria-hidden="true" />
            {cancelLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
