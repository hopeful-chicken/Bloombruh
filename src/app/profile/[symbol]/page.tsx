import Link from "next/link";
import {
  getQuote,
  getCompanyProfile,
  getStatistics,
  getTimeSeries,
} from "@/lib/marketData";
import { formatUSD, formatNumber, formatPct } from "@/lib/format";
import {
  describePriceVs52WeekRange,
  describePE,
  describeMargin,
} from "@/lib/profileAnalysis";
import PriceChart, { type ChartPoint } from "@/components/profile/PriceChart";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  const [quoteResult, profileResult, statsResult, seriesResult] =
    await Promise.allSettled([
      getQuote(symbol),
      getCompanyProfile(symbol),
      getStatistics(symbol),
      getTimeSeries(symbol),
    ]);

  if (quoteResult.status === "rejected") {
    return (
      <div>
        <Link href="/profile" className="text-sm text-muted hover:text-accent">
          ← Back to search
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Couldn&apos;t load &ldquo;{symbol}&rdquo;
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          That ticker might not exist, or the data provider is temporarily
          unavailable. Double check the symbol and try again.
        </p>
      </div>
    );
  }

  const quote = quoteResult.value;
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const series = seriesResult.status === "fulfilled" ? seriesResult.value : null;

  const price = parseFloat(quote.close);
  const change = parseFloat(quote.change);
  const percentChange = parseFloat(quote.percent_change);
  const isUp = change >= 0;

  const chartData: ChartPoint[] = series
    ? [...series.values]
        .reverse()
        .map((v) => ({ date: v.datetime.slice(5), close: parseFloat(v.close) }))
    : [];

  const vm = stats?.statistics?.valuations_metrics;
  const fin = stats?.statistics?.financials;
  const ss = stats?.statistics?.stock_statistics;
  const div = stats?.statistics?.dividends_and_splits;

  const week52High = ss?.["52_week_high"];
  const week52Low = ss?.["52_week_low"];

  const rangeNote = describePriceVs52WeekRange(
    price,
    week52Low ?? NaN,
    week52High ?? NaN
  );
  const peNote = describePE(vm?.trailing_pe);
  const marginNote = describeMargin("Profit margin", fin?.profit_margin);

  return (
    <div>
      <Link href="/profile" className="text-sm text-muted hover:text-accent">
        ← Back to search
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {profile?.name ?? quote.name}{" "}
            <span className="font-mono text-lg text-muted">{symbol}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {quote.exchange}
            {profile?.sector ? ` · ${profile.sector}` : ""}
            {profile?.industry ? ` · ${profile.industry}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
            {formatUSD(price)}
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
      {chartData.length > 0 && (
        <div className="mt-8">
          <PriceChart data={chartData} currency={quote.currency} />
        </div>
      )}

      {/* Key stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Market cap" value={vm?.market_capitalization ? formatUSD(vm.market_capitalization) : "—"} />
        <Stat label="Trailing P/E" value={vm?.trailing_pe ? vm.trailing_pe.toFixed(1) : "—"} />
        <Stat label="52-week high" value={week52High ? formatUSD(week52High) : "—"} />
        <Stat label="52-week low" value={week52Low ? formatUSD(week52Low) : "—"} />
        <Stat label="Dividend yield" value={div?.forward_annual_dividend_yield ? formatPct(div.forward_annual_dividend_yield * 100) : "—"} />
        <Stat label="EPS (TTM)" value={fin?.income_statement?.diluted_eps_ttm ? formatUSD(fin.income_statement.diluted_eps_ttm) : "—"} />
        <Stat label="Shares out." value={ss?.shares_outstanding ? formatNumber(ss.shares_outstanding) : "—"} />
        <Stat label="Beta" value={ss?.beta ? ss.beta.toFixed(2) : "—"} />
      </div>

      {/* Analytical layer — computed context, not just raw numbers */}
      {(rangeNote || peNote || marginNote) && (
        <div className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            Context
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {rangeNote && <li>{rangeNote}</li>}
            {peNote && <li>{peNote}</li>}
            {marginNote && <li>{marginNote}</li>}
          </ul>
          <p className="mt-3 text-xs text-muted/70">
            These are objective comparisons, not recommendations — always do
            your own research.
          </p>
        </div>
      )}

      {/* Description */}
      {profile?.description && (
        <div className="mt-8">
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
            About
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            {profile.description}
          </p>
          {profile.employees > 0 && (
            <p className="mt-2 text-xs text-muted/70">
              {formatNumber(profile.employees)} employees
              {profile.CEO ? ` · CEO: ${profile.CEO}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-mono text-lg font-semibold text-accent sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
