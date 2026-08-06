"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { TRACKS } from "@/data/tracks";

const PROGRESS_KEY = "bloombruh:course-progress";

export default function TrackIndexPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = use(params);
  const track = TRACKS.find((t) => t.id === trackId);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      // localStorage unavailable — progress just shows as empty
    }
  }, []);

  if (!track) notFound();

  const doneCount = track.chapters.filter((c) => completed[`track-${track.id}-${c.slug}`]).length;

  return (
    <div>
      <Link
        href="/lessons"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← Finance 101
      </Link>

      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-accent">Track</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {track.name}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{track.tagline}</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${track.chapters.length > 0 ? (doneCount / track.chapters.length) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted">
          {doneCount} / {track.chapters.length} complete
        </span>
      </div>

      <div className="mt-6 divide-y divide-border border-t border-border">
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
    </div>
  );
}
