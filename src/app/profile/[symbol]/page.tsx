import Link from "next/link";
import { getQuote, getTimeSeries } from "@/lib/marketData";
import { formatUSD, formatNumber, formatPct } from "@/lib/format";
import {
  describePriceVs52WeekRange,
  computeMovingAverage,
  describeMomentum,
  computeAnnualizedVolatility,
  describeVolatility,
} from "@/lib/profileAnalysis";
import PriceChart, { type ChartPoint } from "@/components/profile/PriceChart";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  const [quoteResult, seriesResult] = await Promise.allSettled([
    getQuote(symbol),
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
  const series = seriesResult.status === "fulfilled" ? seriesResult.value : null;

  const price = parseFloat(quote.close);
  const change = parseFloat(quote.change);
  const percentChange = parseFloat(quote.percent_change);
  const isUp = change >= 0;

  // Chronological (oldest → newest) closes, used for the chart and for the
  // computed analytics below (moving average, volatility).
  const chronological = series ? [...series.values].reverse() : [];
  const chartData: ChartPoint[] = chronological.map((v) => ({
    date: v.datetime.slice(5),
    close: parseFloat(v.close),
  }));
  const closes = chronological.map((v) => parseFloat(v.close));

  const week52High = parseFloat(quote.fifty_two_week?.high);
  const week52Low = parseFloat(quote.fifty_two_week?.low);
  const previousClose = parseFloat(quote.previous_close);
  const volume = parseFloat(quote.volume);
  const averageVolume = parseFloat(quote.average_volume);

  const movingAverage50 = computeMovingAverage(closes, 50);
  const annualizedVol = computeAnnualizedVolatility(closes);

  const rangeNote = describePriceVs52WeekRange(price, week52Low, week52High);
  const momentumNote = describeMomentum(price, movingAverage50, "50-day");
  const volatilityNote = describeVolatility(annualizedVol);

  return (
    <div>
      <Link href="/profile" className="text-sm text-muted hover:text-accent">
        ← Back to search
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {quote.name}{" "}
            <span className="font-mono text-lg text-muted">{symbol}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{quote.exchange}</p>
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

      {/* Key stats — everything here comes from Twelve Data's free /quote
          endpoint (or is computed by us from price history). Company
          fundamentals like market cap and P/E require a paid Twelve Data
          plan, so they're deliberately left out rather than shown broken —
          see docs/DATA_SOURCES.md. */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Open" value={formatUSD(parseFloat(quote.open))} />
        <Stat label="Previous close" value={formatUSD(previousClose)} />
        <Stat label="52-week high" value={formatUSD(week52High)} />
        <Stat label="52-week low" value={formatUSD(week52Low)} />
        <Stat label="Volume" value={formatNumber(volume)} />
        <Stat label="Avg. volume" value={formatNumber(averageVolume)} />
        <Stat
          label="50-day avg."
          value={movingAverage50 ? formatUSD(movingAverage50) : "—"}
        />
        <Stat
          label="Volatility (ann.)"
          value={annualizedVol ? formatPct(annualizedVol, 0) : "—"}
        />
      </div>

      {/* Analytical layer — computed by us from price history, not just
          numbers re-displayed from the data provider. */}
      {(rangeNote || momentumNote || volatilityNote) && (
        <div className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            Context
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {rangeNote && <li>{rangeNote}</li>}
            {momentumNote && <li>{momentumNote}</li>}
            {volatilityNote && <li>{volatilityNote}</li>}
          </ul>
          <p className="mt-3 text-xs text-muted/70">
            These are objective, computed comparisons, not recommendations —
            always do your own research.
          </p>
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
