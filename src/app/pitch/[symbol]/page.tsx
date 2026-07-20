import Link from "next/link";
import { getQuote, getTimeSeries } from "@/lib/marketData";
import { getFundamentals } from "@/lib/secEdgar";
import { getCompanyDescription, getSourceLinks } from "@/lib/companyInfo";
import {
  describePriceVs52WeekRange,
  computeMovingAverage,
  describeMomentum,
  computeAnnualizedVolatility,
  describeVolatility,
} from "@/lib/profileAnalysis";
import PitchWorkbench from "@/components/pitch/PitchWorkbench";

export default async function PitchBuilderPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  const [quoteResult, seriesResult, fundamentalsResult] =
    await Promise.allSettled([
      getQuote(symbol),
      getTimeSeries(symbol),
      getFundamentals(symbol),
    ]);

  if (quoteResult.status === "rejected") {
    return (
      <div>
        <Link href="/pitch" className="text-sm text-muted hover:text-accent">
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
  const fundamentals =
    fundamentalsResult.status === "fulfilled" ? fundamentalsResult.value : null;

  const description = await getCompanyDescription(quote.name).catch(() => null);
  const sourceLinks = await getSourceLinks(
    symbol,
    description?.wikipediaUrl ?? null
  ).catch(() => []);

  const price = parseFloat(quote.close);
  const change = parseFloat(quote.change);
  const percentChange = parseFloat(quote.percent_change);

  const chronological = series ? [...series.values].reverse() : [];
  const chartData = chronological.map((v) => ({
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

  const contextNotes = [
    describePriceVs52WeekRange(price, week52Low, week52High),
    describeMomentum(price, movingAverage50, "50-day"),
    describeVolatility(annualizedVol),
  ].filter((n): n is string => Boolean(n));

  return (
    <div>
      <Link href="/pitch" className="text-sm text-muted hover:text-accent">
        ← Back to search
      </Link>

      <PitchWorkbench
        symbol={symbol}
        companyName={quote.name}
        exchange={quote.exchange}
        currency={quote.currency}
        price={price}
        change={change}
        percentChange={percentChange}
        previousClose={previousClose}
        open={parseFloat(quote.open)}
        week52High={week52High}
        week52Low={week52Low}
        volume={volume}
        averageVolume={averageVolume}
        movingAverage50={movingAverage50}
        annualizedVol={annualizedVol}
        contextNotes={contextNotes}
        chartData={chartData}
        fundamentals={fundamentals}
        description={description}
        sourceLinks={sourceLinks}
      />
    </div>
  );
}
