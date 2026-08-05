import { ANALYSIS_ENTRIES, STOCK_PITCHES, LEADS } from "@/data/analysis";
import MarkdownContent from "@/components/research/MarkdownContent";

const ALL_WRITEUPS = [...ANALYSIS_ENTRIES, ...STOCK_PITCHES];

export default function AnalysisPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">My Analysis</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        What I&apos;m actually reading about
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        This is where I keep the stuff I go digging into on my own — a headline catches my eye
        while I&apos;m scrolling, and instead of moving on I stop and actually work out what
        happened, why, and what it&apos;s connected to. No assigned topics, no house view — just
        whatever&apos;s breaking that I want to understand properly. Stock pitches live here too
        now, since it&apos;s all the same thing: my own opinions, on the record.
      </p>

      <nav className="mt-8 rounded-xl border border-border bg-surface/40 p-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">Jump to</p>
        <ul className="space-y-1.5">
          {ALL_WRITEUPS.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="text-sm text-foreground underline decoration-dotted underline-offset-2 hover:text-accent"
              >
                {entry.title}
              </a>
              <span className="ml-2 text-xs text-muted">{entry.tagline}</span>
            </li>
          ))}
          <li>
            <a
              href="#worth-digging-into"
              className="text-sm text-foreground underline decoration-dotted underline-offset-2 hover:text-accent"
            >
              Worth Digging Into
            </a>
            <span className="ml-2 text-xs text-muted">
              A running leads list — one sentence each, not yet deep-researched
            </span>
          </li>
        </ul>
      </nav>

      <div className="mt-10 space-y-16">
        {ALL_WRITEUPS.map((entry) => (
          <section
            key={entry.id}
            id={entry.id}
            className="scroll-mt-10 rounded-xl border border-border bg-surface/40 p-5 sm:p-6"
          >
            <p className="font-mono text-[11px] text-muted">{entry.date}</p>
            <h2 className="font-display mt-1 text-xl font-semibold text-foreground">{entry.title}</h2>
            <p className="mt-1 text-sm text-muted">{entry.tagline}</p>
            <div className="mt-5 border-t border-border pt-5">
              <MarkdownContent markdown={entry.body} />
            </div>
          </section>
        ))}
      </div>

      <section id="worth-digging-into" className="scroll-mt-10 mt-16 border-t border-border pt-10">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Worth Digging Into</p>
        <h2 className="font-display mt-1 text-xl font-semibold text-foreground">
          A running leads list
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Real sentences from real sources, dropped here as-is — not deep-researched or
          cross-checked the way the write-ups above are. A single source can be wrong, outdated,
          or missing context, so treat every line below as a starting point, not a finished fact.
          These are the ones I want to actually dig into properly when I have time.
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
