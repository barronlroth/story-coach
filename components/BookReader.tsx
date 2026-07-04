"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Volume2 } from "lucide-react";
import { PageSpread } from "@/components/PageSpread";
import type { FinalBook } from "@/lib/story-state";

type BookReaderProps = {
  book: FinalBook;
};

const PAGES_PER_SPREAD = 2;

export function BookReader({ book }: BookReaderProps) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [showNarration, setShowNarration] = useState(false);
  const totalSpreads = Math.max(1, Math.ceil(book.pages.length / PAGES_PER_SPREAD));
  const pages = useMemo(
    () => book.pages.slice(spreadIndex * PAGES_PER_SPREAD, spreadIndex * PAGES_PER_SPREAD + PAGES_PER_SPREAD),
    [book.pages, spreadIndex],
  );
  const firstPage = pages[0]?.pageNumber ?? 1;
  const lastPage = pages[pages.length - 1]?.pageNumber ?? firstPage;
  const hasPrevious = spreadIndex > 0;
  const hasNext = spreadIndex < totalSpreads - 1;

  function goPrevious() {
    setSpreadIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setSpreadIndex((current) => Math.min(totalSpreads - 1, current + 1));
  }

  function toggleNarration() {
    const nextShowNarration = !showNarration;
    setShowNarration(nextShowNarration);

    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();

    if (nextShowNarration) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(book.narrationText));
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 text-[var(--ink-primary)] md:px-8 md:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[var(--border-paper)] bg-[rgba(255,248,232,0.82)] px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-2xl font-black leading-tight md:text-4xl">{book.title}</h1>
          <p className="mt-1 text-sm font-black text-[var(--ink-soft)]">
            Pages {firstPage}-{lastPage} of {book.pages.length}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleNarration}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[var(--border-paper)] bg-white px-4 py-3 text-base font-black shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(131,200,242,0.45)]"
          aria-expanded={showNarration}
        >
          {showNarration ? <Pause size={22} aria-hidden="true" /> : <Volume2 size={22} aria-hidden="true" />}
          {showNarration ? "Pause read-aloud" : "Read aloud"}
        </button>
      </div>

      <PageSpread title={book.title} pages={pages} />

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrevious}
          disabled={!hasPrevious}
          className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-lg font-black shadow-md transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus:ring-4 focus:ring-[rgba(131,200,242,0.45)]"
        >
          <ChevronLeft size={24} aria-hidden="true" />
          Previous
        </button>

        <div className="rounded-full bg-[rgba(255,255,255,0.62)] px-4 py-2 text-sm font-black text-[var(--ink-soft)]">
          Spread {spreadIndex + 1} of {totalSpreads}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!hasNext}
          className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[var(--accent-sun)] px-5 py-3 text-lg font-black shadow-md transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus:ring-4 focus:ring-[rgba(131,200,242,0.45)]"
        >
          Next
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>

      {showNarration ? (
        <p className="mt-4 rounded-[18px] border border-[var(--border-paper)] bg-white/80 p-4 text-lg font-semibold leading-relaxed text-[var(--ink-soft)]">
          {book.narrationText}
        </p>
      ) : null}
    </section>
  );
}
