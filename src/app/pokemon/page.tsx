import Link from "next/link";
import { getCard } from "@/lib/pokemonCards";
import {
  PRODUCTION_MILESTONES,
  CHARIZARD_PRICE_HISTORY,
  THIRTY_DOLLAR_COMPARISON,
  MARKET_STATS,
  SWOT,
} from "@/lib/pokemonMarket";
import MarketChart from "@/components/pokemon/MarketChart";
import CharizardChart from "@/components/pokemon/CharizardChart";
import ThirtyDollarChart from "@/components/pokemon/ThirtyDollarChart";
import Stat from "@/components/Stat";

export const dynamic = "force-dynamic";

export default async function PokemonPage() {
  const charizard = await getCard("en", "base1-4");
  const liveHolo = charizard?.pricing?.tcgplayer?.holofoil;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Pokemon Cards</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        The collectible commodity
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Most trading-card and collectible waves are pure hype: a spike, a crash, and a
        decade of being worth less than the shipping box they came in. Pokemon&apos;s own
        thirty-year sales record looks structurally different — closer to a real,
        persistently-in-demand commodity than a fad. This is the real data behind that
        claim, the real volatility inside it, and what an honest analyst would still flag
        as risk.
      </p>

      {/* Market overview */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          The Market, By The Numbers
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Real production milestones and secondary-market liquidity proxies — sourced, dated below.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-surface/40 p-5">
          <p className="text-sm text-foreground">
            Cumulative Pokemon TCG cards printed worldwide crossed{" "}
            <span className="font-semibold">85 billion in May 2026</span> — and roughly{" "}
            <span className="font-semibold">40% of every card ever printed</span>{" "}
            was printed in just the last three fiscal years. That&apos;s not the shape of a
            fad cooling off; it&apos;s a demand curve still bending upward three decades in.
          </p>
          <div className="mt-4">
            <MarketChart data={PRODUCTION_MILESTONES} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MARKET_STATS.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} caption={s.note} />
            ))}
          </div>
        </div>
      </section>

      {/* Case study */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Case Study — Is It Actually Volatile?
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          PSA 10, 1st Edition Base Set Charizard — the single most-tracked card in the hobby.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-surface/40 p-5">
          <p className="text-sm text-foreground">
            Real answer: yes, individual cards are genuinely volatile — but the shape of
            that volatility matters. A PSA 10 1st-edition Charizard sold for{" "}
            <span className="font-semibold">$18,900 in July 2017</span> — and then, per
            data tracker Card Ladder, has{" "}
            <span className="font-semibold">no publicly recorded sale at all until 2020</span>,
            a real documented gap in the market itself, not a hole in this research. From
            there it went to a{" "}
            <span className="font-semibold">$420,000 peak in March 2022</span>, corrected
            roughly 40% to the $250,000s by late 2022 — and then set a{" "}
            <span className="font-semibold">new all-time record of $550,000</span>{" "}
            at Heritage Auctions in December 2025. That&apos;s a real drawdown sitting inside a
            longer structural uptrend, not the one-way collapse that defines an actual
            crashed asset (see the sports-card comparison below).
          </p>
          <div className="mt-4">
            <CharizardChart data={CHARIZARD_PRICE_HISTORY} />
          </div>
          {liveHolo && (
            <p className="mt-3 text-xs text-muted">
              For comparison — a live, ungraded/unlimited-edition holo Charizard (a
              completely different, far more common card than the graded 1st-edition
              above) currently trades for a real market price of{" "}
              <span className="font-semibold text-foreground">
                ${liveHolo.marketPrice?.toFixed(2)}
              </span>{" "}
              on TCGPlayer, via this module&apos;s own live feed.{" "}
              <Link href="/pokemon/base1-4?lang=en" className="underline decoration-dotted underline-offset-2 hover:text-accent">
                See the live card page →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* $30 in 1999 comparison */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          $30 In 1999 — Card Vs. Market
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          A PSA 10 1st-Edition Charizard against $30 in the S&amp;P 500, dividends reinvested.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-surface/40 p-5">
          <p className="text-sm text-foreground">
            $30 in the S&amp;P 500 in January 1999 — dividends reinvested, real Yahoo
            Finance adjusted-close data — is worth about{" "}
            <span className="font-semibold">$261 today</span>, roughly 9x. The same $30
            put toward a 1st-Edition Charizard that later graded a PSA 10 would be
            worth <span className="font-semibold">$550,000</span>{" "}
            as of its most recent public auction record — over 18,000x. That gap is real and enormous, and
            it&apos;s also the least representative comparison possible: it&apos;s the
            single most valuable specific outcome in the entire hobby, not a typical one.
          </p>
          <div className="mt-4">
            <ThirtyDollarChart data={THIRTY_DOLLAR_COMPARISON} />
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background/60 p-4 text-xs text-muted">
            <p className="font-semibold text-foreground">
              Exactly how solid each side of this chart actually is:
            </p>
            <p className="mt-1.5">
              <span className="font-semibold text-foreground">The S&amp;P 500 line is fully real</span>{" "}
              — pulled directly from Yahoo Finance&apos;s own public chart data, using
              the dividend-and-split-adjusted (&ldquo;Adj Close&rdquo;) price, the
              correct basis for a genuine total-return comparison rather than raw price
              appreciation alone.
            </p>
            <p className="mt-1.5">
              <span className="font-semibold text-foreground">The Charizard line is honestly weaker before mid-2017.</span>{" "}
              The $30 starting point is the entry price this comparison was asked to
              use — treated here as a stated assumption (roughly what a raw copy or a
              few packs cost at release), not a documented sale. A specific, dated
              PSA 10 sale record for 1999 through mid-2017 isn&apos;t something this
              research could verify: PriceCharting, PWCC, and Heritage Auctions all
              blocked automated access when checked directly. From July 2017 (a real
              $18,900 sale via PWCC, documented by Beckett News) onward, every point is
              a real, publicly reported sale — including the documented fact, per data
              tracker Card Ladder, that no PSA 10 sale of this card is publicly
              recorded at all between 2017 and 2021 — the hollow dashed dot on the
              chart is the one assumption (1999); every filled dot is a real transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Why hasn't it crashed */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          The Comparison That Actually Matters
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Every hype cycle eventually gets compared to something that crashed. Here&apos;s the honest one.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              1990s &ldquo;Junk Wax&rdquo; baseball cards — the real cautionary tale
            </h3>
            <p className="mt-2 text-sm text-muted">
              At the peak of the early-1990s craze, manufacturers printed an estimated{" "}
              <span className="font-semibold text-foreground">81 billion baseball cards a year</span>{" "}
              — about 325 for every person in America — chasing demand with no regard for
              scarcity. When the 1994 MLB strike broke collector confidence, the market
              never recovered: revenue fell to roughly{" "}
              <span className="font-semibold text-foreground">1/7th of its peak</span>, and
              most of that era&apos;s cards are worth about a cent each today.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Pokemon is running the same risk — just hasn&apos;t hit it (yet)
            </h3>
            <p className="mt-2 text-sm text-muted">
              Being honest about the parallel: Pokemon&apos;s own print runs are
              accelerating too — the same &ldquo;print more to chase demand&rdquo;
              instinct that broke the sports-card market. What&apos;s different so far is
              that demand has kept pace (PSA grading volume up 95% year-over-year, not
              declining) — but a real structural stress-test (a recession, a sharp fall in
              new-collector demand) is something this specific boom hasn&apos;t faced yet.
              The comparison isn&apos;t reassuring by default; it&apos;s a real risk worth
              tracking, not dismissing.
            </p>
          </div>
        </div>
      </section>

      {/* SWOT */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          SWOT — Investing In The Category
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Framed the way an analyst would frame any alternative asset — not advice, see the disclosure below.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SwotBlock title="Strengths" entries={SWOT.strengths} tone="positive" />
          <SwotBlock title="Weaknesses" entries={SWOT.weaknesses} tone="negative" />
          <SwotBlock title="Opportunities" entries={SWOT.opportunities} tone="positive" />
          <SwotBlock title="Threats" entries={SWOT.threats} tone="negative" />
        </div>
      </section>

      {/* Honesty section */}
      <section className="mt-10 rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          What Isn&apos;t Actually Knowable Here
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <span className="font-semibold text-foreground">No continuous 30-year demand series exists.</span>{" "}
            The Pokemon Company discloses cumulative production at scattered points, not a
            clean annual series back to 1996 — the chart above only covers 2020 onward
            because that&apos;s genuinely as far back as public, dated figures go.
          </li>
          <li>
            <span className="font-semibold text-foreground">
              &ldquo;Market size&rdquo; estimates disagree by 3-5x across research firms
            </span>{" "}
            (figures found ranging from roughly $9bn to $52bn for what&apos;s nominally the
            same 2026 market), depending entirely on methodology and what&apos;s counted —
            there is no single authoritative number, and any report presenting one without
            that caveat is oversimplifying.
          </li>
          <li>
            <span className="font-semibold text-foreground">
              There is no real &ldquo;dollar trading volume&rdquo; figure
            </span>{" "}
              the way a stock exchange publishes one. PSA grading volume and eBay&apos;s
            share of listings are real, genuine liquidity proxies — not the same thing as
            an actual consolidated trading tape, which doesn&apos;t exist for this market.
          </li>
        </ul>
      </section>

      <p className="mt-8 text-xs text-muted/70">
        Real, sourced data as of July 2026 — not investment advice, and not a recommendation
        to buy, sell, or collect anything.
      </p>
    </div>
  );
}

function SwotBlock({
  title,
  entries,
  tone,
}: {
  title: string;
  entries: { point: string; detail: string }[];
  tone: "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <h3
        className={`text-sm font-semibold ${tone === "positive" ? "text-positive" : "text-negative"}`}
      >
        {title}
      </h3>
      <ul className="mt-2 space-y-3">
        {entries.map((e) => (
          <li key={e.point}>
            <p className="text-sm font-medium text-foreground">{e.point}</p>
            <p className="mt-0.5 text-xs text-muted">{e.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
