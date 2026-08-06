"use client";

// The course index — "Finance 101," a start-to-end, chapter-numbered
// curriculum (see src/data/course.ts for why this replaced the old flat,
// six-lesson module). Client component so it can read chapter-completion
// progress straight out of localStorage (written by QuizBlock.tsx) and
// show a real progress bar and per-chapter checkmarks, not because
// anything here needs interactivity beyond that.

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSE_CHAPTERS } from "@/data/course";

const PROGRESS_KEY = "bloombruh:course-progress";

export default function LessonsPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      // localStorage unavailable — progress just shows as empty
    }
  }, []);

  const doneCount = COURSE_CHAPTERS.filter((c) => completed[c.slug]).length;
  const total = COURSE_CHAPTERS.length;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Lessons</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Finance 101
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        A start-to-end course for anyone new to finance who doesn&apos;t yet know which seat they
        want — equities, fixed income, commodities and FX, how markets actually trade, M&amp;A,
        asset management, and valuation, thirteen chapters in order. Every chapter ends with a
        short quiz and a real reason to go use another module on this site — Company Profile,
        Central Bank Room, Markets Overview, Simulations, Model Templates — so the concepts don&apos;t
        stay theoretical.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted">
          {doneCount} / {total} chapters complete
        </span>
      </div>

      <div className="mt-8 divide-y divide-border border-t border-border">
        {COURSE_CHAPTERS.map((chapter) => {
          const isDone = !!completed[chapter.slug];
          return (
            <Link
              key={chapter.slug}
              href={`/lessons/${chapter.slug}`}
              className="group flex items-start gap-4 py-4 transition-colors hover:bg-surface/40"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                  isDone
                    ? "border-positive bg-positive/15 text-positive"
                    : "border-border text-muted"
                }`}
                aria-hidden="true"
              >
                {isDone ? "✓" : chapter.number}
              </span>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                  {chapter.track}
                </p>
                <h2 className="font-display mt-0.5 text-base font-semibold text-foreground group-hover:text-accent sm:text-lg">
                  Chapter {chapter.number}: {chapter.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{chapter.tagline}</p>
              </div>
              <span className="mt-1 shrink-0 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                {isDone ? "Review →" : "Start →"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
