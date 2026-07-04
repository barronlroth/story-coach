import { BookOpen, LoaderCircle, Sparkles } from "lucide-react";

type BookBuilderStateProps = {
  acceptedBeatCount?: number;
  totalBeatCount?: number;
};

export function BookBuilderState({ acceptedBeatCount = 6, totalBeatCount = 6 }: BookBuilderStateProps) {
  const progress = totalBeatCount > 0 ? Math.min(100, Math.max(0, (acceptedBeatCount / totalBeatCount) * 100)) : 0;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl items-center justify-center px-5 py-8 text-[var(--ink-primary)]">
      <div className="w-full rounded-[28px] border border-[var(--border-paper)] bg-[rgba(255,248,232,0.86)] p-6 text-center shadow-[var(--shadow-paper)] md:p-10">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[26px] border border-[var(--border-paper)] bg-white shadow-sm">
          <BookOpen size={54} className="text-[var(--accent-plum)]" aria-hidden="true" />
        </div>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-[var(--accent-sky)] px-4 py-2 text-sm font-black text-[var(--ink-primary)] shadow-sm">
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
          Building your book
        </div>

        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
          Putting your drawings and words together
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-xl font-semibold leading-snug text-[var(--ink-soft)]">
          Story Coach is making six pages from the ideas you accepted.
        </p>

        <div className="mx-auto mt-8 grid max-w-xl gap-3 rounded-[22px] border border-[var(--border-paper)] bg-white/70 p-4 text-left shadow-sm">
          <div className="flex items-center justify-between gap-4 text-base font-black">
            <span>Story pieces ready</span>
            <span>
              {acceptedBeatCount}/{totalBeatCount}
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[rgba(218,196,155,0.42)]">
            <div
              className="h-full rounded-full bg-[var(--accent-leaf)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 text-base font-black text-[var(--ink-soft)]">
          <Sparkles size={20} className="text-[var(--accent-coral)]" aria-hidden="true" />
          Almost ready to read
        </div>
      </div>
    </section>
  );
}
