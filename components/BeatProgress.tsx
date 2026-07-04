import { Check } from "lucide-react";
import { STORY_BEATS } from "@/lib/beats";
import { cx } from "@/lib/design-tokens";

type BeatProgressBeat = {
  beatId: string;
  title: string;
};

type BeatProgressProps = {
  currentBeatIndex: number;
  completedBeatIds?: readonly string[];
  beats?: readonly BeatProgressBeat[];
  className?: string;
};

export function BeatProgress({
  currentBeatIndex,
  completedBeatIds = [],
  beats = STORY_BEATS,
  className,
}: BeatProgressProps) {
  const completed = new Set(completedBeatIds);

  return (
    <nav aria-label="Story progress" className={cx("w-full", className)}>
      <ol className="grid grid-cols-6 items-start gap-2">
        {beats.map((beat, index) => {
          const isCurrent = index === currentBeatIndex;
          const isCompleted = completed.has(beat.beatId) || index < currentBeatIndex;
          const previousBeat = beats[index - 1];
          const isConnectorCompleted = index <= currentBeatIndex || Boolean(previousBeat && completed.has(previousBeat.beatId));
          const stateLabel = isCurrent ? "current" : isCompleted ? "done" : "next";

          return (
            <li key={beat.beatId} className="relative flex min-w-0 flex-col items-center gap-2 text-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute left-[-50%] top-[15px] h-[3px] w-full rounded-full",
                    isConnectorCompleted ? "bg-[var(--accent-leaf)]" : "bg-[rgba(118,98,76,0.22)]",
                  )}
                />
              ) : null}
              <span
                className={cx(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black shadow-sm",
                  isCurrent && "border-white bg-[var(--accent-sun)] text-[var(--ink-primary)] ring-4 ring-white",
                  isCompleted && !isCurrent && "border-white bg-[var(--accent-leaf)] text-white",
                  !isCurrent && !isCompleted && "border-[var(--border-paper)] bg-[#dfcfaf] text-[var(--ink-soft)]",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted && !isCurrent ? <Check size={18} strokeWidth={3.2} aria-hidden="true" /> : index + 1}
              </span>
              <span className="flex min-w-0 flex-col items-center gap-0.5">
                <span className="text-[0.68rem] font-black uppercase leading-none text-[var(--ink-soft)]">
                  {stateLabel}
                </span>
                <span className="max-w-[8.5rem] text-xs font-extrabold leading-tight text-[var(--ink-primary)] md:text-sm">
                  {beat.title}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
