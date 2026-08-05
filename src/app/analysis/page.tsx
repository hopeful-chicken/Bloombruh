import Link from "next/link";
import { ANALYSIS_ENTRIES, STOCK_PITCHES, LEADS, type AnalysisEntry } from "@/data/analysis";

function EntryRow({ entry, locked }: { entry: AnalysisEntry; locked?: boolean }) {
  return (
    <Link
      href={`/analysis/${entry.id}`}
      className="block rounded-lg border border-border bg-surface/40 p-4 transition-colors hover:border-accent/60 hover:bg-surface/70"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted">{entry.date}</p>
        {locked && (
          <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            Locked
          </span>
        )}
      </div>
      <h3 className="font-display mt-0.5 text-base font-semibold text-foreground group-hover:text-accent">
        {entry.title}
      </h3>
      <p className="mt-1 text-sm text-muted">{entry.tagline}</p>
    </Link>
  );
}

export default function AnalysisPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">My Analysis</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        The Feed
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Most of what actually reaches me isn&apos;t a newspaper — it&apos;s my feed: a clip, a
        headline, a 20-second video between everything else on Instagram. I scroll past almost
        all of it. This is what I stopped on — the ones I went and actually worked out properly.
      </p>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Write-Ups</h2>
        <div className="mt-3 space-y-2.5">
          {ANALYSIS_ENTRIES.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Stock Pitches</h2>
        <div className="mt-3 space-y-2.5">
          {STOCK_PITCHES.map((entry) => (
            <EntryRow key={entry.id} entry={entry} locked />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-10">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Worth Digging Into</p>
        <h2 className="font-display mt-1 text-xl font-semibold text-foreground">
          A running leads list
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          One sentence, one source, dropped here as-is — not deep-researched or cross-checked the
          way the pieces above are. A single source can be wrong, outdated, or missing context,
          so treat every line below as a starting point, not a finished fact.
        </p>

        <ul className="mt-6 space-y-4">
          {LEADS.map((lead) => (
            <li key={lead.id} className="rounded-lg border border-border bg-surface/40 p-4">
              <p className="text-sm leading-relaxed text-foreground">{lead.sentence}</p>
              <p className="mt-2 text-xs text-muted">
                {lead.date} ·{" "}
                <a
                  href={lead.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-accent"
                >
                  {lead.source.label}
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
