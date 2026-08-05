import Link from "next/link";
import { LESSONS } from "@/data/lessons";

export default function LessonsPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Lessons</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        The stuff between the tools
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        This site&apos;s other modules are built around live data — a price, a multiple, a rate.
        These six lessons are the opposite: no ticker, no live number, just the finance-career
        fundamentals worth actually understanding before an interview asks about them. Read them
        in any order.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LESSONS.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/lessons/${lesson.slug}`}
            className="group rounded-xl border border-border bg-surface/40 p-5 transition-colors hover:border-accent/60 hover:bg-surface/70"
          >
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted/70">
              {lesson.category}
            </p>
            <h2 className="font-display mt-1.5 text-lg font-semibold text-foreground group-hover:text-accent">
              {lesson.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{lesson.tagline}</p>
            <p className="mt-3 text-xs text-accent">Read lesson →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
