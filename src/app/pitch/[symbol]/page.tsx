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
import { computeValuationMetrics, computeEbitdaHistory } from "@/lib/valuationAnalysis";
import { getCompanyNews } from "@/lib/news";
import { getBeta } from "@/lib/beta";
import { formatUSD, formatPct } from "@/lib/format";
import type { StatEntry, ChartSeriesOption } from "@/lib/reportBlocks";
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
  const newsArticles = await getCompanyNews(quote.name).catch(() => []);

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
  const valuation = fundamentals ? computeValuationMetrics(fundamentals, price) : null;

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

    // --- Deeper three-statement data ---
    {
      key: "ebitdaMargin",
      label: "EBITDA margin",
      value:
        creditMetrics?.ebitda !== null &&
        creditMetrics?.ebitda !== undefined &&
        fundamentals?.revenue
          ? formatPct((creditMetrics.ebitda / fundamentals.revenue) * 100)
          : null,
    },
    {
      key: "netMargin",
      label: "Net margin",
      value:
        fundamentals?.netIncome !== null &&
        fundamentals?.netIncome !== undefined &&
        fundamentals?.revenue
          ? formatPct((fundamentals.netIncome / fundamentals.revenue) * 100)
          : null,
    },
    {
      key: "epsGrowth",
      label: "EPS growth (YoY)",
      value: valuation?.epsGrowthPct !== null && valuation?.epsGrowthPct !== undefined
        ? formatPct(valuation.epsGrowthPct)
        : null,
    },
    {
      key: "netDebt",
      label: "Net debt",
      value: valuation?.netDebt !== null && valuation?.netDebt !== undefined
        ? formatUSD(valuation.netDebt)
        : null,
    },
    {
      key: "workingCapital",
      label: "Working capital",
      value: valuation?.workingCapital !== null && valuation?.workingCapital !== undefined
        ? formatUSD(valuation.workingCapital)
        : null,
    },
    {
      key: "shareholdersEquity",
      label: "Shareholders' equity",
      value:
        fundamentals?.stockholdersEquity !== null &&
        fundamentals?.stockholdersEquity !== undefined
          ? formatUSD(fundamentals.stockholdersEquity)
          : null,
    },
    {
      key: "operatingCashFlow",
      label: "Operating cash flow",
      value:
        fundamentals?.operatingCashFlow !== null &&
        fundamentals?.operatingCashFlow !== undefined
          ? formatUSD(fundamentals.operatingCashFlow)
          : null,
    },
    {
      key: "capex",
      label: "Capital expenditure",
      value: fundamentals?.capex !== null && fundamentals?.capex !== undefined
        ? formatUSD(fundamentals.capex)
        : null,
    },
    {
      key: "freeCashFlow",
      label: "Free cash flow",
      value: valuation?.freeCashFlow !== null && valuation?.freeCashFlow !== undefined
        ? formatUSD(valuation.freeCashFlow)
        : null,
    },
    {
      key: "sharesOutstandingBasic",
      label: "Shares outstanding (basic, wtd. avg.)",
      value:
        fundamentals?.sharesOutstandingBasic !== null &&
        fundamentals?.sharesOutstandingBasic !== undefined
          ? fundamentals.sharesOutstandingBasic.toLocaleString()
          : null,
    },
    {
      key: "sharesOutstandingDiluted",
      label: "Shares outstanding (diluted, wtd. avg.)",
      value:
        fundamentals?.sharesOutstandingDiluted !== null &&
        fundamentals?.sharesOutstandingDiluted !== undefined
          ? fundamentals.sharesOutstandingDiluted.toLocaleString()
          : null,
    },

    // --- Derived basics & valuation multiples ---
    {
      key: "marketCap",
      label: "Market cap",
      value: valuation?.marketCap !== null && valuation?.marketCap !== undefined
        ? formatUSD(valuation.marketCap)
        : null,
    },
    {
      key: "enterpriseValue",
      label: "Enterprise value",
      value:
        valuation?.enterpriseValue !== null && valuation?.enterpriseValue !== undefined
          ? formatUSD(valuation.enterpriseValue)
          : null,
    },
    {
      key: "peRatio",
      label: "P/E ratio",
      value: valuation?.peRatio !== null && valuation?.peRatio !== undefined
        ? `${valuation.peRatio.toFixed(1)}x`
        : null,
    },
    {
      key: "evToEbitda",
      label: "EV / EBITDA",
      value: valuation?.evToEbitda !== null && valuation?.evToEbitda !== undefined
        ? `${valuation.evToEbitda.toFixed(1)}x`
        : null,
    },
    {
      key: "evToEbit",
      label: "EV / EBIT",
      value: valuation?.evToEbit !== null && valuation?.evToEbit !== undefined
        ? `${valuation.evToEbit.toFixed(1)}x`
        : null,
    },
    {
      key: "evToSales",
      label: "EV / Sales",
      value: valuation?.evToSales !== null && valuation?.evToSales !== undefined
        ? `${valuation.evToSales.toFixed(1)}x`
        : null,
    },
    {
      key: "priceToBook",
      label: "Price / Book",
      value: valuation?.priceToBook !== null && valuation?.priceToBook !== undefined
        ? `${valuation.priceToBook.toFixed(1)}x`
        : null,
    },
    {
      key: "fcfYield",
      label: "FCF yield",
      value: valuation?.fcfYieldPct !== null && valuation?.fcfYieldPct !== undefined
        ? formatPct(valuation.fcfYieldPct)
        : null,
    },
    {
      key: "dividendYield",
      label: "Dividend yield",
      value:
        valuation?.dividendYieldPct !== null && valuation?.dividendYieldPct !== undefined
          ? formatPct(valuation.dividendYieldPct)
          : null,
    },

    // --- Growth & returns ---
    {
      key: "ebitdaGrowth",
      label: "EBITDA growth (YoY)",
      value:
        valuation?.ebitdaGrowthPct !== null && valuation?.ebitdaGrowthPct !== undefined
          ? formatPct(valuation.ebitdaGrowthPct)
          : null,
    },
    {
      key: "roe",
      label: "ROE",
      value: valuation?.roePct !== null && valuation?.roePct !== undefined
        ? formatPct(valuation.roePct)
        : null,
    },
    {
      key: "roa",
      label: "ROA",
      value: valuation?.roaPct !== null && valuation?.roaPct !== undefined
        ? formatPct(valuation.roaPct)
        : null,
    },
  ];

  // Chart-block series registry — same "computed once, offered as a menu"
  // pattern as availableStats, but for time series instead of single
  // numbers. Price always available; the SEC-derived series gracefully
  // become empty (and get skipped in the picker/hidden with a fallback
  // message) for non-US filers.
  const availableChartSeries: ChartSeriesOption[] = [
    {
      key: "price",
      label: "Price history",
      points: chartData.map((p) => ({ label: p.date, value: p.close })),
    },
    {
      key: "revenue",
      label: "Revenue (annual)",
      points: (fundamentals?.revenueHistory ?? []).map((v) => ({
        label: String(v.fiscalYear),
        value: v.value,
      })),
    },
    {
      key: "netIncome",
      label: "Net income (annual)",
      points: (fundamentals?.netIncomeHistory ?? []).map((v) => ({
        label: String(v.fiscalYear),
        value: v.value,
      })),
    },
    {
      key: "ebitda",
      label: "EBITDA (annual, est.)",
      points: (fundamentals ? computeEbitdaHistory(fundamentals) : []).map((v) => ({
        label: String(v.fiscalYear),
        value: v.value,
      })),
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
        availableChartSeries={availableChartSeries}
        newsArticles={newsArticles}
      />
    </div>
  );
}
