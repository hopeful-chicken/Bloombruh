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
import {
  computeCreditMetrics,
  computeROIC,
  computeCapitalAllocation,
} from "@/lib/fundamentalsAnalysis";
import { getBeta } from "@/lib/beta";
import { formatUSD, formatPct } from "@/lib/format";
import type { StatEntry } from "@/lib/reportBlocks";
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
  const betaResult = await getBeta(symbol).catch(() => null);

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

  // Every free/computable number the block-based report builder can offer
  // as a "stat" — anything with a null value is shown as "Unavailable" in
  // the builder, with an editable override for the student to fill in.
  const creditMetrics = fundamentals ? computeCreditMetrics(fundamentals) : null;
  const roicPct = fundamentals ? computeROIC(fundamentals) : null;
  const capitalAllocation = fundamentals ? computeCapitalAllocation(fundamentals) : null;

  const availableStats: StatEntry[] = [
    { key: "price", label: "Price", value: formatUSD(price) },
    { key: "week52High", label: "52-week high", value: formatUSD(week52High) },
    { key: "week52Low", label: "52-week low", value: formatUSD(week52Low) },
    {
      key: "movingAverage50",
      label: "50-day avg. price",
      value: movingAverage50 !== null ? formatUSD(movingAverage50) : null,
    },
    {
      key: "annualizedVol",
      label: "Volatility (annualized)",
      value: annualizedVol !== null ? formatPct(annualizedVol, 0) : null,
    },
    {
      key: "beta",
      label: "Beta (vs. S&P 500)",
      value: betaResult ? betaResult.beta.toFixed(2) : null,
    },
    {
      key: "revenue",
      label: "Revenue (latest FY)",
      value: fundamentals?.revenue !== null && fundamentals?.revenue !== undefined
        ? formatUSD(fundamentals.revenue)
        : null,
    },
    {
      key: "revenueGrowth",
      label: "Revenue growth (YoY)",
      value:
        fundamentals?.revenue !== null &&
        fundamentals?.revenue !== undefined &&
        fundamentals?.revenuePriorYear
          ? formatPct(
              ((fundamentals.revenue - fundamentals.revenuePriorYear) /
                fundamentals.revenuePriorYear) *
                100
            )
          : null,
    },
    {
      key: "netIncome",
      label: "Net income (latest FY)",
      value: fundamentals?.netIncome !== null && fundamentals?.netIncome !== undefined
        ? formatUSD(fundamentals.netIncome)
        : null,
    },
    {
      key: "grossMargin",
      label: "Gross margin",
      value:
        fundamentals?.grossProfit !== null &&
        fundamentals?.grossProfit !== undefined &&
        fundamentals?.revenue
          ? formatPct((fundamentals.grossProfit / fundamentals.revenue) * 100)
          : null,
    },
    {
      key: "operatingMargin",
      label: "Operating margin",
      value:
        fundamentals?.operatingIncome !== null &&
        fundamentals?.operatingIncome !== undefined &&
        fundamentals?.revenue
          ? formatPct((fundamentals.operatingIncome / fundamentals.revenue) * 100)
          : null,
    },
    {
      key: "epsDiluted",
      label: "EPS (diluted)",
      value:
        fundamentals?.epsDiluted !== null && fundamentals?.epsDiluted !== undefined
          ? `$${fundamentals.epsDiluted.toFixed(2)}`
          : null,
    },
    {
      key: "totalAssets",
      label: "Total assets",
      value:
        fundamentals?.totalAssets !== null && fundamentals?.totalAssets !== undefined
          ? formatUSD(fundamentals.totalAssets)
          : null,
    },
    {
      key: "totalDebt",
      label: "Total debt",
      value:
        fundamentals?.totalDebt !== null && fundamentals?.totalDebt !== undefined
          ? formatUSD(fundamentals.totalDebt)
          : null,
    },
    {
      key: "cash",
      label: "Cash & equivalents",
      value: fundamentals?.cash !== null && fundamentals?.cash !== undefined
        ? formatUSD(fundamentals.cash)
        : null,
    },
    {
      key: "ebitda",
      label: "EBITDA (op. income + D&A, est.)",
      value: creditMetrics?.ebitda !== null && creditMetrics?.ebitda !== undefined
        ? formatUSD(creditMetrics.ebitda)
        : null,
    },
    {
      key: "netDebtToEbitda",
      label: "Net debt / EBITDA",
      value:
        creditMetrics?.netDebtToEbitda !== null && creditMetrics?.netDebtToEbitda !== undefined
          ? `${creditMetrics.netDebtToEbitda.toFixed(1)}x`
          : null,
    },
    {
      key: "interestCoverage",
      label: "Interest coverage (EBITDA / interest)",
      value:
        creditMetrics?.interestCoverage !== null && creditMetrics?.interestCoverage !== undefined
          ? `${creditMetrics.interestCoverage.toFixed(1)}x`
          : null,
    },
    {
      key: "roic",
      label: "ROIC (est., 21% tax rate)",
      value: roicPct !== null ? formatPct(roicPct) : null,
    },
    {
      key: "dividendsPaid",
      label: "Dividends paid (latest FY)",
      value:
        capitalAllocation?.dividendsPaid !== null &&
        capitalAllocation?.dividendsPaid !== undefined
          ? formatUSD(capitalAllocation.dividendsPaid)
          : null,
    },
    {
      key: "buybacks",
      label: "Share buybacks (latest FY)",
      value:
        capitalAllocation?.buybacks !== null && capitalAllocation?.buybacks !== undefined
          ? formatUSD(capitalAllocation.buybacks)
          : null,
    },
    {
      key: "sharesOutstanding",
      label: "Shares outstanding",
      value:
        fundamentals?.sharesOutstanding !== null &&
        fundamentals?.sharesOutstanding !== undefined
          ? fundamentals.sharesOutstanding.toLocaleString()
          : null,
    },
  ];

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
        availableStats={availableStats}
      />
    </div>
  );
}
