"use client";

export type NudgeBubblesProps = {
  nudges: string[];
  activeNudge?: string;
  disabled?: boolean;
  className?: string;
  onSelect?: (nudge: string) => void;
};

export function NudgeBubbles({
  nudges,
  activeNudge,
  disabled = false,
  className = "",
  onSelect,
}: NudgeBubblesProps) {
  if (nudges.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-3 ${className}`} aria-label="Story prompts">
      {nudges.map((nudge) => {
        const isActive = activeNudge === nudge;

        return (
          <button
            key={nudge}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(nudge)}
            className={`rounded-2xl border px-4 py-3 text-left text-base font-extrabold shadow-sm transition md:text-lg ${
              isActive
                ? "border-[var(--accent-plum)] bg-[rgba(139,111,180,0.16)] text-[var(--ink-primary)]"
                : "border-[var(--border-paper)] bg-[var(--surface-paper)] text-[var(--ink-primary)] hover:-translate-y-0.5 hover:bg-white"
            } ${disabled ? "cursor-not-allowed opacity-60 hover:translate-y-0" : ""}`}
          >
            {nudge}
          </button>
        );
      })}
    </div>
  );
}
