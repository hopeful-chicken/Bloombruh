import Link from "next/link";

export type AnalysisIndexEntry = { id: string; title: string; tagline: string; date: string };

// No "use client" — this only renders a <Link>, so it works equally in the
// server-rendered write-ups list and inside the still-gated AnalysisIndexGate.
export default function AnalysisEntryRow({
  entry,
  locked,
}: {
  entry: AnalysisIndexEntry;
  locked?: boolean;
}) {
  return (
    <Link
      href={`/analysis/${entry.id}`}
      className="block rounded-lg border border-border bg-surface/40 p-4 transition-colors hover:border-module-analysis/60 hover:bg-surface/70"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted">{entry.date}</p>
        {locked && (
          <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            Locked
          </span>
        )}
      </div>
      <h3 className="font-display mt-0.5 text-base font-semibold text-foreground group-hover:text-module-analysis">
        {entry.title}
      </h3>
      <p className="mt-1 text-sm text-muted">{entry.tagline}</p>
    </Link>
  );
}
