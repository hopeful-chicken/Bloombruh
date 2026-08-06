import Link from "next/link";
import { modules } from "@/lib/modules";
import { MARKET_COMMENTARY } from "@/data/marketCommentary";
import WorldSituationOverview from "@/components/markets/WorldSituationOverview";
import DataSourcesAppendix, { type DataSource } from "@/components/pitch/DataSourcesAppendix";
import ModuleGrid from "@/components/ModuleGrid";
import TerminalHero from "@/components/TerminalHero";
import ScrollReveal from "@/components/ScrollReveal";
import { LogoMark } from "@/components/Logo";

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Hero — one unified bento grid instead of a separate hero-then-
          teaser stack. The brand statement and the terminal window sit as
          the two big cards up top; the world situation and "build your
          own model" cards sit right underneath, same weight, same grid —
          a dashboard you land on, not a marketing page you scroll past.
          Each cell fades/slides in on load or on scroll, staggered. */}
      <section className="grid grid-cols-1 gap-4 border-b border-border pb-14 lg:grid-cols-2">
        <ScrollReveal className="flex flex-col justify-center border border-border bg-surface/40 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Free · Independent · Built in public
          </p>
          <h1 className="mt-3 flex items-center gap-2 sm:gap-4">
            <LogoMark className="h-6 w-[2.1rem] shrink-0 sm:h-10 sm:w-14" />
            <span className="font-logo text-4xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Bloom<span className="text-accent">bruh</span>
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            A terminal-style research tool built by an economics student, not a company —
            real prices, real filings, real central-bank data, and the pitch decks and models
            to turn any of it into your own view.
          </p>
          <Link
            href="/profile"
            className="mt-7 inline-flex w-fit items-center gap-2 border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dim"
          >
            Open Company Profile <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>

        <ScrollReveal delayMs={120}>
          <TerminalHero />
        </ScrollReveal>

        <ScrollReveal delayMs={200}>
          <WorldSituationOverview commentary={MARKET_COMMENTARY} compact />
        </ScrollReveal>

        <ScrollReveal delayMs={280} className="border border-border">
          <h2 className="bg-accent px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-accent-foreground">
            Want to build your own valuation model?
          </h2>
          <div className="p-5">
            <p className="text-sm leading-relaxed text-muted">
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
              className="mt-5 inline-flex items-center gap-2 border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Open the template library <span aria-hidden="true">→</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Module cards — split into what's actually ready vs. what's real
          but still in progress, rather than presenting all of it as
          equally finished. */}
      <ScrollReveal as="section" className="mt-20">
        <h2 className="border-l-2 border-accent pl-3 font-mono text-xs font-medium uppercase tracking-widest text-muted">
          Modules
        </h2>
        <ModuleGrid modules={modules.filter((m) => m.status === "live")} />
      </ScrollReveal>

      <ScrollReveal as="section" className="mt-14">
        <h2 className="border-l-2 border-border pl-3 font-mono text-xs font-medium uppercase tracking-widest text-muted">
          In development — beta
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          These are real, working, and use genuine data — nothing fake here — but they haven&apos;t
          had the same level of polish or double-checking as the modules above yet, so treat them
          as a preview rather than a finished product.
        </p>
        <ModuleGrid modules={modules.filter((m) => m.status === "beta")} />
      </ScrollReveal>

      {/* About */}
      <ScrollReveal as="section" className="mt-20 max-w-3xl border-t border-border pt-10">
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
      </ScrollReveal>
    </div>
  );
}
