import Link from "next/link";
import { modules } from "@/lib/modules";
import { MARKET_COMMENTARY } from "@/data/marketCommentary";
import WorldSituationOverview from "@/components/markets/WorldSituationOverview";
import DataSourcesAppendix, { type DataSource } from "@/components/pitch/DataSourcesAppendix";

// What's actually fetched/computed on this specific page — the world-
// situation panel above. Each module has its own, more detailed sources
// appendix or banner for the data it shows once you open it; this is just
// for what's visible here on the homepage itself.
const HOME_SOURCES: DataSource[] = [
  {
    title: "World-situation news",
    detail:
      "The real headlines underneath the AI narrative come from Google News' public RSS search feed — no account or key required.",
    link: { label: "news.google.com", url: "https://news.google.com" },
  },
  {
    title: "World-situation narrative",
    detail:
      "The short AI-generated summary above those headlines is Claude (Anthropic), grounded strictly in the real news articles shown directly beneath it — it's never allowed to state something the articles don't support, and says so plainly when the coverage isn't enough to explain something confidently.",
    link: { label: "anthropic.com", url: "https://www.anthropic.com" },
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <section className="max-w-3xl">
        <h1 className="font-logo mt-5 text-6xl font-medium tracking-tight text-foreground sm:text-7xl">
          Bloombruh
        </h1>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Open Company Profile →
          </Link>
        </div>
      </section>

      {/* World situation teaser + template library teaser, side by side on
          wide screens — the "read the market" and "now build something
          with it" pair. */}
      <section className="mt-16 grid max-w-6xl gap-6 lg:grid-cols-[3fr_2fr]">
        <WorldSituationOverview commentary={MARKET_COMMENTARY} compact />
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
            Want to build your own valuation model?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Grab a working Excel template — a DCF, an LBO, an M&amp;A model,
            an equity research note, a portfolio one-pager, or a trading-floor
            morning sheet — prefilled with real data for any company on this
            site, with sector-by-sector guidance built in. Then use the
            Markets Overview, the Central Bank Room, and the company profiles
            to do what analysts actually do: turn data into a defensible view.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-foreground">
            <li>· DCF valuation (banks get the dividend-discount variant)</li>
            <li>· LBO &amp; M&amp;A deal models</li>
            <li>· Equity research initiation note</li>
            <li>· AM portfolio one-pager &amp; S&amp;T morning sheet</li>
          </ul>
          <Link
            href="/templates"
            className="mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Open the template library →
          </Link>
        </div>
      </section>

      {/* Module cards */}
      <section className="mt-20">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
          Modules
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const card = (
              <div
                className={[
                  "flex h-full flex-col rounded-2xl border p-6 transition-colors",
                  m.status === "live"
                    ? "border-border bg-surface hover:border-accent/50"
                    : "border-border/60 bg-surface/40",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-medium text-foreground">{m.name}</h3>
                  <span
                    className={[
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      m.status === "live"
                        ? "bg-positive/15 text-positive"
                        : "bg-muted/15 text-muted",
                    ].join(" ")}
                  >
                    {m.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-accent">
                  {m.tagline}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {m.description}
                </p>
              </div>
            );

            return m.status === "live" ? (
              <Link key={m.slug} href={m.slug} className="block h-full">
                {card}
              </Link>
            ) : (
              <div key={m.slug} className="h-full cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="mt-20 max-w-3xl border-t border-border pt-10">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
          About this project
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Built by Adam, a UCL Economics student, as a long-term project to
          learn by building and to demonstrate genuine interest in markets
          and asset management. It&apos;s free, independent, and
          unaffiliated with any company, exchange, or institution mentioned
          on this site.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Links:{" "}
          <a
            href="https://www.linkedin.com/in/adam-zhou-1913ba225/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            LinkedIn
          </a>{" "}
          ·{" "}
          <a
            href="#"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            GitHub
          </a>
          {/* EDITORIAL: Adam to add real links and, if he wants, a short personal note here */}
        </p>

        <DataSourcesAppendix sources={HOME_SOURCES} />
      </section>
    </div>
  );
}
