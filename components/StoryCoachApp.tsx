"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Mic, Paintbrush, Sparkles } from "lucide-react";
import { STORY_BEATS } from "@/lib/beats";
import { createSeedSession } from "@/lib/seed-data";

const seedSession = createSeedSession();
const activeBeat = seedSession.beats[0];

export function StoryCoachApp() {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-5 text-[var(--ink-primary)] md:px-8 md:py-6">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col rounded-[30px] border border-[var(--border-paper)] bg-[rgba(255,248,232,0.76)] p-5 shadow-[var(--shadow-paper)] backdrop-blur-sm md:min-h-[calc(100vh-3rem)] md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {STORY_BEATS.map((beat, index) => (
              <span
                key={beat.beatId}
                className={`h-3 w-3 rounded-full border border-[rgba(47,42,34,0.18)] ${
                  index === 0 ? "bg-[var(--accent-sun)]" : "bg-white/80"
                }`}
                aria-label={`Beat ${index + 1}: ${beat.title}`}
              />
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[var(--ink-soft)] shadow-sm">
            <BookOpen size={18} />
            Demo seed
          </button>
        </div>

        <div className="grid flex-1 items-center gap-6 py-5 md:grid-cols-[1.05fr_0.95fr] md:py-7">
          <div className="relative">
            <div className="absolute -left-3 -top-3 z-10 rotate-[-8deg] rounded-full bg-[var(--accent-coral)] px-4 py-2 text-sm font-black text-white shadow-md">
              1B
            </div>
            <div className="rounded-[24px] border border-[var(--border-paper)] bg-[var(--surface-paper)] p-5 shadow-[var(--shadow-paper)]">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--accent-plum)]">
                Main character
              </p>
              <h1 className="max-w-xl text-4xl font-black leading-[1.02] md:text-6xl">
                Tell me about your character
              </h1>
              <p className="mt-4 max-w-lg text-xl font-semibold leading-snug text-[var(--ink-soft)]">
                What is their name? What are they? What should I remember?
              </p>

              <div className="mt-8 rounded-[22px] border-2 border-dashed border-[var(--border-paper)] bg-white/80 p-3">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] bg-white shadow-inner">
                  <Image
                    src="/storyboard/01-step-1a-draw-main-character.png"
                    alt="Child drawing pinned as a wide paper reference"
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border-paper)] bg-white/70 p-5 shadow-[var(--shadow-paper)]">
            <div className="rounded-[24px] bg-[var(--accent-sky)] p-5 text-center shadow-inner">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white text-[var(--accent-coral)] shadow-lg">
                <Mic size={54} strokeWidth={2.8} />
              </div>
              <p className="mt-5 text-2xl font-black">Start talking</p>
              <p className="mx-auto mt-2 max-w-xs text-base font-semibold text-[rgba(47,42,34,0.72)]">
                Ramble is okay. Story Coach will keep the good details.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {["What's their name?", "What are they?", "What should I remember?"].map((nudge) => (
                <button
                  key={nudge}
                  className="rounded-2xl border border-[var(--border-paper)] bg-[var(--surface-paper)] px-4 py-3 text-left text-lg font-extrabold shadow-sm"
                >
                  {nudge}
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--accent-sun)] px-5 py-4 text-lg font-black shadow-md">
                <Sparkles size={22} />
                Make picture
              </button>
              <button className="inline-flex items-center justify-center rounded-2xl bg-[var(--ink-primary)] px-5 py-4 text-white shadow-md">
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-[rgba(255,255,255,0.48)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink-soft)]">
            <Paintbrush size={18} />
            Current beat stores drawing, transcript, corrections, and accepted image.
          </div>
          <span className="text-sm font-black text-[var(--ink-soft)]">{activeBeat.beatId}</span>
        </footer>
      </section>
    </main>
  );
}
