import { BookOpen } from "lucide-react";
import type { FinalBookPage } from "@/lib/story-state";

type PageSpreadProps = {
  pages: FinalBookPage[];
  title: string;
};

export function PageSpread({ pages, title }: PageSpreadProps) {
  return (
    <div className="relative rounded-[24px] border border-[var(--border-paper)] bg-[var(--surface-paper-deep)] p-3 shadow-[var(--shadow-paper)]">
      <div className="pointer-events-none absolute left-1/2 top-4 bottom-4 hidden w-[3px] -translate-x-1/2 rounded-full bg-[rgba(92,67,38,0.18)] md:block" />
      <div className="grid gap-3 md:grid-cols-2">
        {pages.map((page) => (
          <article
            key={page.pageNumber}
            className="flex min-h-[520px] flex-col rounded-[18px] border border-[rgba(117,89,53,0.18)] bg-[rgba(255,252,243,0.96)] p-4 shadow-[inset_0_0_28px_rgba(126,89,43,0.08)]"
          >
            <div className="flex items-center justify-between gap-3 text-sm font-black text-[var(--ink-soft)]">
              <span>{title}</span>
              <span>Page {page.pageNumber}</span>
            </div>

            <div className="mt-4 overflow-hidden rounded-[16px] border border-[var(--border-paper)] bg-white shadow-sm">
              {page.imageUrl ? (
                <img
                  src={page.imageUrl}
                  alt={`Illustration for page ${page.pageNumber}`}
                  className="aspect-[3/2] w-full object-contain"
                />
              ) : (
                <div className="flex aspect-[3/2] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(246,201,76,0.18),rgba(131,200,242,0.22))] text-[var(--ink-soft)]">
                  <BookOpen size={52} aria-hidden="true" />
                </div>
              )}
            </div>

            <p className="mt-5 flex-1 text-pretty text-[clamp(1.1rem,1.7vw,1.55rem)] font-extrabold leading-snug text-[var(--ink-primary)]">
              {page.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
