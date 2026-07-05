import { Sparkles } from "lucide-react";
import { cx, storyCoachTreatments } from "@/lib/design-tokens";
import { StoryImageStack, type StoryImageStackItem } from "@/components/StoryImageStack";

type GeneratingStateProps = {
  title?: string;
  subtitle?: string;
  drawingImageUrl?: string;
  drawingAlt?: string;
  storyImages?: StoryImageStackItem[];
  posterLabel?: string;
  note?: string;
  className?: string;
};

export function GeneratingState({
  title = "Making your picture...",
  subtitle = "Using your drawing and your words",
  drawingImageUrl,
  drawingAlt = "Your drawing",
  storyImages = [],
  posterLabel = "Your drawing",
  note = "This may take a few seconds",
  className,
}: GeneratingStateProps) {
  const hasStoryStack = storyImages.length > 0;

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={cx(
        storyCoachTreatments.workspaceBand,
        "grid gap-6 p-5 md:grid-cols-[0.42fr_0.58fr] md:p-8",
        className,
      )}
    >
      {hasStoryStack ? (
        <StoryImageStack images={storyImages} caption={posterLabel} className="self-center rotate-[-2deg]" />
      ) : (
        <div className="relative self-center rotate-[-2deg]">
          <span className={cx(storyCoachTreatments.pin, "left-5 top-[-10px] z-20 bg-[#2578d8]")} aria-hidden="true" />
          <div className={storyCoachTreatments.pinnedLandscapePaper}>
            {drawingImageUrl ? (
              <img src={drawingImageUrl} alt={drawingAlt} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white text-lg font-black text-[var(--ink-soft)]">
                {posterLabel}
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-base font-extrabold text-[var(--ink-soft)]">{posterLabel}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center text-center">
        <span className="rounded-full bg-[var(--accent-sky)]/45 px-5 py-2 text-lg font-black text-[var(--ink-primary)] shadow-sm">
          Story magic
        </span>
        <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-[var(--ink-primary)] md:text-6xl">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-xl font-bold leading-snug text-[var(--ink-primary)]/80 md:text-2xl">
          {subtitle}
        </p>

        <div
          className={cx(
            storyCoachTreatments.paperPanel,
            "mt-7 flex w-full max-w-2xl items-center justify-between gap-4 p-5",
          )}
        >
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-sun)] text-white shadow-md">
              <Sparkles size={28} strokeWidth={3} aria-hidden="true" />
            </span>
            <p className="text-base font-extrabold text-[var(--ink-soft)] md:text-lg">{note}</p>
          </div>
          <div className="flex items-center gap-2" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className="h-3 w-3 animate-pulse rounded-full bg-[#2578d8]"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
