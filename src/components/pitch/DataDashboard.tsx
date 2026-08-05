// The Pitch Builder's "just show me the data" view — a purely
// presentational, read-only dashboard of everything the site knows about
// the company: price, chart, key stats, context, description, fundamentals/
// valuation, and news. Nothing here is a checkbox or a form field; it's laid
// out general-to-specific (identity/price first, deep fundamentals last) so
// any visitor can find their level, whether or not they ever build a report.
//
// This is rendered both full-width (default view) and side-by-side with the
// report builder (once the student clicks "Build your own report") — see
// PitchWorkbench.tsx.

import { formatUSD, formatNumber, formatPct, formatOriginalCurrency } from "@/lib/format";
import PriceChart, { type ChartPoint } from "@/components/profile/PriceChart";
import ScoreGauge from "@/components/profile/ScoreGauge";
import { getLogoUrl } from "@/lib/logos";
import Stat from "@/components/Stat";
import NewsList from "@/components/pitch/NewsList";
import type { Fundamentals } from "@/lib/secEdgar";
import type { CompanyDescription, SourceLink } from "@/lib/companyInfo";
import type { NewsArticle } from "@/lib/news";
import {
  computeTechnicalScore,
  computeFundamentalScore,
  computeAtAGlanceChips,
  type AtAGlanceInputs,
} from "@/lib/signals";
import {
  CORE_FINANCIAL_STAT_KEYS,
  VALUATION_STAT_KEYS,
  GROWTH_RETURNS_STAT_KEYS,
  CREDIT_WACC_STAT_KEYS,
  type StatEntry,
} from "@/lib/reportBlocks";

type Props = {
  symbol: string;
  companyName: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  previousClose: number;
  open: number;
  week52High: number;
  week52Low: number;
  volume: number;
  averageVolume: number;
  movingAverage50: number | null;
  annualizedVol: number | null;
  contextNotes: string[];
  chartData: ChartPoint[];
  fundamentals: Fundamentals | null;
  description: CompanyDescription | null;
  sourceLinks: SourceLink[];
  availableStats: StatEntry[];
  newsArticles: NewsArticle[];
  snapshotInputs: AtAGlanceInputs;
};

/** Renders one labeled grid of stats, pulled from the availableStats
 * registry by key. Unlike the report builder (which shows "Unavailable"
 * placeholders so a student can fill in an override), this read-only
 * dashboard only shows stats that actually have a value — a company with
 * sparse data shows a short, honest grid instead of a wall of
 * "Unavailable" cards. Returns null (hides the whole section, heading
 * included) if none of this group's keys have real data. */
function StatGroup({
  title,
  keys,
  stats,
}: {
  title: string;
  keys: readonly string[];
  stats: StatEntry[];
}) {
  const entries = stats.filter((s) => keys.includes(s.key) && s.value !== null);
  if (entries.length === 0) return null;
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {entries.map((s) => (
          <Stat key={s.key} label={s.label} value={s.value!} caption={s.caption} />
        ))}
      </div>
    </div>
  );
}

// Every stat key that depends on SEC EDGAR fundamentals, excluding the two
// (price, beta) computed independently of them — used to decide whether
// the fundamentals section has anything real to show at all.
const FUNDAMENTALS_DEPENDENT_KEYS = [
  ...CORE_FINANCIAL_STAT_KEYS,
  ...VALUATION_STAT_KEYS.filter((k) => k !== "price"),
  ...GROWTH_RETURNS_STAT_KEYS,
  ...CREDIT_WACC_STAT_KEYS.filter((k) => k !== "beta"),
];

export default function DataDashboard(props: Props) {
  const { symbol, companyName, exchange, currency, price, change, percentChange } =
    props;
  const isUp = change >= 0;
  const hasFundamentalsData = props.availableStats.some(
    (s) => FUNDAMENTALS_DEPENDENT_KEYS.includes(s.key) && s.value !== null
  );
  // Prices display in the quote's own currency — "HK$474.00", not "$474.00"
  // (a bare "$" on an HKD price would overstate it ~8x). USD keeps the
  // compact formatUSD style everything else on the site uses.
  const fmtPrice = (v: number) =>
    currency === "USD" ? formatUSD(v) : formatOriginalCurrency(v, currency);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-center gap-3">
          {getLogoUrl(symbol) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getLogoUrl(symbol)!}
              alt=""
              className="h-12 w-12 rounded-md border border-border bg-white object-contain p-1.5"
            />
          )}
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {companyName}{" "}
              <span className="font-mono text-lg text-muted">{symbol}</span>
            </h1>
            <p className="mt-1 text-sm text-muted">{exchange}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
            {fmtPrice(price)}
          </p>
          <p
            className={`font-mono text-sm ${isUp ? "text-positive" : "text-negative"}`}
          >
            {isUp ? "+" : ""}
            {change.toFixed(2)} ({formatPct(percentChange)})
          </p>
        </div>
      </div>

      {/* Price chart */}
      {props.chartData.length > 0 && (
        <div className="mt-8">
          <PriceChart
            symbol={symbol}
            data={props.chartData}
            currency={currency}
            previousClose={props.previousClose}
          />
        </div>
      )}

      {/* Snapshot — real computed signal, never a buy/sell call (see
          DISCLOSURE in lib/config.ts). Two 0-100 gauges plus 7 short,
          factual "at a glance" chips, all from lib/signals.ts. */}
      <div className="mt-8">
        <p className="text-xs text-muted">
          A quick, factual read on the price trend and the underlying business — not a
          recommendation, and not a substitute for reading the numbers below yourself.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              At a glance
            </p>
            <div className="flex flex-wrap gap-1.5">
              {computeAtAGlanceChips(props.snapshotInputs).map((c) => (
                <span
                  key={c.label}
                  title={c.label}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground"
                >
                  {c.value}
                </span>
              ))}
            </div>
          </div>
          {(() => {
            const technical = computeTechnicalScore(props.snapshotInputs);
            return (
              <div>
                <ScoreGauge
                  score={technical.score}
                  label="Technical strength"
                  subtitle="Trend, momentum, position vs averages"
                />
                {technical.drivers.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
                    {technical.drivers.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}
          {(() => {
            const fundamental = computeFundamentalScore(props.snapshotInputs);
            return (
              <div>
                <ScoreGauge
                  score={fundamental.score}
                  label="Fundamental quality"
                  subtitle="Margins, returns, leverage, growth"
                />
                {fundamental.drivers.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
                    {fundamental.drivers.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Key stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Open" value={fmtPrice(props.open)} />
        <Stat label="Previous close" value={fmtPrice(props.previousClose)} />
        <Stat label="52-week high" value={fmtPrice(props.week52High)} />
        <Stat label="52-week low" value={fmtPrice(props.week52Low)} />
        <Stat label="Volume" value={formatNumber(props.volume)} />
        <Stat label="Avg. volume" value={formatNumber(props.averageVolume)} />
        <Stat
          label="50-day avg."
          value={props.movingAverage50 ? fmtPrice(props.movingAverage50) : "—"}
        />
        <Stat
          label="Volatility (ann.)"
          value={props.annualizedVol ? formatPct(props.annualizedVol, 0) : "—"}
        />
      </div>

      {/* Computed context */}
      {props.contextNotes.length > 0 && (
        <div className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            Context
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {props.contextNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* About — plain-English description + links to primary sources, so
          research can start here rather than needing five other tabs open. */}
      {(props.description || props.sourceLinks.length > 0) && (
        <div className="mt-8">
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
            About
          </h2>
          {props.description && (
            <p className="text-sm leading-relaxed text-muted">
              {props.description.extract}
            </p>
          )}
          {props.sourceLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {props.sourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:border-accent hover:text-accent"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fundamentals & valuation — every stat the report builder's Stats
          blocks can offer, shown as plain read-only grids, grouped roughly
          three-statements → valuation → growth/returns → credit, general to
          specific. If a company has essentially no fundamentals data (a
          common non-US SEC-filer situation), this whole section collapses
          to one explanatory line rather than four half-empty grids. */}
      <div className="mt-8">
        <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
          Fundamentals & valuation
          {props.fundamentals && ` (FY${props.fundamentals.fiscalYear}, from SEC filings)`}
        </h2>
        {!hasFundamentalsData ? (
          <p className="text-xs text-muted/70">
            No SEC fundamentals data available for {symbol} — either it
            isn&apos;t a US SEC filer, or its filings don&apos;t use a
            recognized tagging format. Price, volatility, and beta above are
            unaffected.
          </p>
        ) : (
          <>
            <StatGroup
              title="Core financials"
              keys={CORE_FINANCIAL_STAT_KEYS}
              stats={props.availableStats}
            />
            <StatGroup
              title="Valuation multiples"
              keys={VALUATION_STAT_KEYS}
              stats={props.availableStats}
            />
            <StatGroup
              title="Growth & returns"
              keys={GROWTH_RETURNS_STAT_KEYS}
              stats={props.availableStats}
            />
            <StatGroup
              title="Credit metrics & WACC inputs"
              keys={CREDIT_WACC_STAT_KEYS}
              stats={props.availableStats}
            />
          </>
        )}
      </div>

      {/* News */}
      <div className="mt-8">
        <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
          In the news
        </h2>
        <NewsList articles={props.newsArticles} />
      </div>
    </div>
  );
}
