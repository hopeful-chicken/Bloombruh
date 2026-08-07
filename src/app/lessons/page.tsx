"use client";

// The Lessons hub — organized into sections, "Finance 101" being one of
// them (see src/data/course.ts) and "Deep Dives" the other (see
// src/data/deepDives.ts): a genuinely more advanced companion article per
// chapter, for a student who liked a specific topic and wants to go
// further on just that one instead of moving on. Client component so it
// can read chapter-completion progress straight out of localStorage
// (written by QuizBlock.tsx) and show a real progress bar and per-item
// checkmarks.

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSE_CHAPTERS } from "@/data/course";
import { DEEP_DIVES } from "@/data/deepDives";
import { TRACKS } from "@/data/tracks";

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
Start with <strong className="text-foreground">Finance 101</strong>{" "}
        : a start-to-end sequence for anyone new to finance who does not yet know which seat
        they want, thirteen chapters in order, each with a quiz and a real reason to go use another
        module on this site. Then go deeper: <strong className="text-foreground">Deep Dives</strong>{" "}
        are one more advanced article per chapter, and each{" "}
        <strong className="text-foreground">track</strong> below is a focused mini-course on one
        specific seat: real mechanics, real formulas, worked examples, for whichever path you are
        actually considering.
      </p>

      {/* ———————————————————————————————————————————————————————— */}
      {/* Section: Finance 101 */}
      {/* ———————————————————————————————————————————————————————— */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-accent pl-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
              Section 1 · Finance 101
            </p>
            <p className="mt-0.5 text-xs text-muted">The main course, start to end</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted">
              {doneCount} / {total} complete
            </span>
          </div>
        </div>

        <div className="mt-4 divide-y divide-border border-t border-border">
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
                    isDone ? "border-positive bg-positive/15 text-positive" : "border-border text-muted"
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
      </section>

      {/* ———————————————————————————————————————————————————————— */}
      {/* Section: Deep Dives */}
      {/* ———————————————————————————————————————————————————————— */}
      <section className="mt-14">
        <div className="border-l-2 border-module-analysis pl-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-module-analysis">
            Section 2 · Deep Dives
          </p>
          <p className="mt-0.5 text-xs text-muted">
            One more advanced article per chapter, optional, go as deep as you want on whatever
            actually interests you
          </p>
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          {DEEP_DIVES.map((deepDive) => {
            const progressKey = `deep-dive-${deepDive.slug}`;
            const isDone = !!completed[progressKey];
            const parentChapter = COURSE_CHAPTERS.find((c) => c.slug === deepDive.parentChapterSlug);
            return (
              <Link
                key={deepDive.slug}
                href={`/lessons/deep-dive/${deepDive.slug}`}
                className="group flex items-stretch bg-surface transition-colors hover:bg-surface-hover"
              >
                <span className="w-1 shrink-0 bg-module-analysis" aria-hidden="true" />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                      {parentChapter ? `Ch. ${parentChapter.number}` : "Deep Dive"}
                    </p>
                    {isDone && <span className="text-xs text-positive">✓</span>}
                  </div>
                  <h3 className="font-display mt-1 text-sm font-semibold text-foreground group-hover:text-accent">
                    {deepDive.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{deepDive.tagline}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ———————————————————————————————————————————————————————— */}
      {/* Sections 3+: career tracks */}
      {/* ———————————————————————————————————————————————————————— */}
      {TRACKS.map((track, trackIndex) => {
        const doneCount = track.chapters.filter((c) => completed[`track-${track.id}-${c.slug}`]).length;
        return (
          <section key={track.id} className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-border pl-3">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                  Section {trackIndex + 3} · {track.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">{track.tagline}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{
                      width: `${track.chapters.length > 0 ? (doneCount / track.chapters.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-muted">
                  {doneCount} / {track.chapters.length} complete
                </span>
              </div>
            </div>

            <div className="mt-4 divide-y divide-border border-t border-border">
              {track.chapters.map((chapter, i) => {
                const isDone = !!completed[`track-${track.id}-${chapter.slug}`];
                return (
                  <Link
                    key={chapter.slug}
                    href={`/lessons/track/${track.id}/${chapter.slug}`}
                    className="group flex items-start gap-4 py-4 transition-colors hover:bg-surface/40"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                        isDone ? "border-positive bg-positive/15 text-positive" : "border-border text-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-display text-base font-semibold text-foreground group-hover:text-accent sm:text-lg">
                        {chapter.title}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{chapter.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
