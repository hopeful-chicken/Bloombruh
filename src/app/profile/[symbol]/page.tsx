import Link from "next/link";
import { getQuote, getTimeSeries } from "@/lib/marketData";
import { isHongKongSymbol, getHkQuote, getHkTimeSeries, getHkClose } from "@/lib/eodhd";
import { getAdrForHkSymbol, getHkSymbolForAdr } from "@/lib/hkAdrMap";
import { getExchangeRate } from "@/lib/fx";
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
import { formatUSD, formatPct, formatOriginalCurrency } from "@/lib/format";
import type { StatEntry, ChartSeriesOption } from "@/lib/reportBlocks";
import PitchWorkbench from "@/components/pitch/PitchWorkbench";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  // Hong Kong Stock Exchange tickers (".HK" suffix, e.g. "0700.HK") route
  // to EODHD instead of Twelve Data — see src/lib/eodhd.ts for why. SEC
  // EDGAR has no record of HK listings themselves, but where the same
  // company also has a US listing that genuinely files with the SEC (see
  // src/lib/hkAdrMap.ts — Alibaba, HSBC, JD.com, etc.), its fundamentals
  // are fetched through that US ticker instead: one legal entity, two
  // listings, same filings. HK companies with no SEC-filing US listing
  // still honestly show no fundamentals. The Twelve-Data-based beta
  // regression stays skipped for all HK symbols (no HK price history on
  // that provider to regress against).
  const isHongKong = isHongKongSymbol(symbol);
  const adrForHk = isHongKong ? getAdrForHkSymbol(symbol) : null;

  const [quoteResult, seriesResult, fundamentalsResult] =
    await Promise.allSettled([
      isHongKong ? getHkQuote(symbol) : getQuote(symbol),
      isHongKong ? getHkTimeSeries(symbol) : getTimeSeries(symbol),
      isHongKong
        ? adrForHk
          ? getFundamentals(adrForHk)
          : Promise.resolve(null)
        : getFundamentals(symbol),
    ]);

  if (quoteResult.status === "rejected") {
    // Twelve Data's free "Basic" plan only covers quotes for US-listed
    // stocks (NYSE/NASDAQ) and US OTC pink sheets — a company that only
    // trades on a foreign exchange (LSE, ASX, TSX, Frankfurt, etc.) shows
    // up fine in search, but its /quote and /time_series calls come back
    // as this specific "available starting with the [plan] plan" error.
    // Worth telling the user exactly what's going on here rather than the
    // generic "might not exist" message, since the company is real and the
    // ticker is correct — it's a data-provider plan limit, not a typo.
    const reason = quoteResult.reason;
    const errorMessage = reason instanceof Error ? reason.message : "";
    const isPlanGated = !isHongKong && /available starting with the .* plan/i.test(errorMessage);

    return (
      <div>
        <Link href="/profile" className="text-sm text-muted hover:text-accent">
          ← Back to search
        </Link>
        <h1 className="font-display mt-4 text-2xl font-medium text-foreground">
          Couldn&apos;t load &ldquo;{symbol}&rdquo;
        </h1>
        {isHongKong ? (
          <p className="mt-2 max-w-xl text-sm text-muted">
            &ldquo;{symbol}&rdquo; didn&apos;t return real data from the
            Hong Kong Stock Exchange feed — double check the ticker code
            (e.g. &ldquo;0700.HK&rdquo; for Tencent), or the free-tier
            request limit may have been hit for today.
          </p>
        ) : isPlanGated ? (
          <>
            <p className="mt-2 max-w-xl text-sm text-muted">
              &ldquo;{symbol}&rdquo; is a real ticker, but this site&apos;s
              free market-data plan (Twelve Data&apos;s Basic tier) only
              covers quotes for US-listed stocks (NYSE/NASDAQ) and US OTC
              listings — not companies whose primary listing is on a
              foreign exchange (e.g. the London, Australian, Toronto, or
              Frankfurt exchanges).
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted">
              If this company also trades in the US — as an ADR, or a
              secondary US listing — try searching for that ticker instead.
              Otherwise this is a genuine free-tier limit, not a bug; see{" "}
              <span className="font-mono text-xs">docs/DATA_SOURCES.md</span>{" "}
              for the full explanation.
            </p>
          </>
        ) : (
          <p className="mt-2 max-w-xl text-sm text-muted">
            That ticker might not exist, or the data provider is temporarily
            unavailable. Double check the symbol and try again.
          </p>
        )}
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
  const betaResult = isHongKong ? null : await getBeta(symbol).catch(() => null);
  const newsArticles = await getCompanyNews(quote.name, 20).catch(() => []);

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

  // The price fed into valuation multiples must be USD *per ordinary
  // share*, matching SEC's per-ordinary-share EPS and share counts:
  // - HK pages: the quote already is the ordinary-share price, just in HKD
  //   — convert with one current FX rate.
  // - US ADR pages of companies with a mapped HK listing (BABA, JD, ...):
  //   the ADR quote is per *ADS bundle* (1 BABA ADS = 8 ordinary shares),
  //   so dividing it by per-share EPS overstates every multiple by the
  //   bundle ratio — P/E of ~204x instead of ~26x, found live. The HK
  //   listing's ordinary price (converted to USD) is used instead; no
  //   bundle-ratio lookup exists for free, and this needs none.
  // - Everyone else: the quote price as-is.
  // If the HK price or FX rate can't be fetched, price-derived multiples
  // are skipped entirely (shown "Unavailable") rather than computed wrong.
  const hkListingForAdr = !isHongKong ? getHkSymbolForAdr(symbol) : null;
  let valuationPrice: number | null = price;
  if (isHongKong || hkListingForAdr) {
    const [hkClose, hkdToUsd] = await Promise.all([
      isHongKong ? Promise.resolve(price) : getHkClose(hkListingForAdr!),
      getExchangeRate("HKD", "USD"),
    ]);
    valuationPrice =
      hkClose !== null && hkdToUsd !== null ? hkClose * hkdToUsd : null;
  }
  const valuation =
    fundamentals && valuationPrice !== null
      ? computeValuationMetrics(fundamentals, valuationPrice)
      : null;

  // For companies whose SEC filings report in a currency other than USD
  // (IFRS/20-F filers, e.g. Canada Goose in CAD) — getFundamentals() has
  // already converted every dollar figure to USD, but a student should
  // still be able to see the original reported number. This turns a
  // USD-converted value back into a small "Converted from CAD C$1.2bn"
  // caption; returns null for USD filers (nothing to convert) or any
  // value SEC EDGAR didn't provide.
  function currencyCaption(usdValue: number | null): string | null {
    if (usdValue === null || !fundamentals || fundamentals.originalCurrency === "USD") {
      return null;
    }
    const original = usdValue / fundamentals.fxRateToUsd;
    return `Converted from ${fundamentals.originalCurrency} ${formatOriginalCurrency(original, fundamentals.originalCurrency)}`;
  }

  // Price-type figures display in the quote's own currency — an HK share
  // trading at HK$474 is not $474, and pretending otherwise with a bare
  // "$" would overstate it ~8x. Non-USD quotes get their real symbol.
  const fmtQuotePrice = (v: number) =>
    quote.currency === "USD" ? formatUSD(v) : formatOriginalCurrency(v, quote.currency);

  // When a bank's or insurer's "revenue" comes from a financial-sector
  // XBRL concept (net revenues / premiums earned / interest income), say
  // so under the number instead of presenting it like a product-sales
  // line. Keys match the FIG tags in secEdgar.ts's CONCEPTS.revenue.
  const FIG_REVENUE_CAPTIONS: Record<string, string> = {
    RevenuesNetOfInterestExpense:
      "Net revenues (incl. interest, net of interest expense) — how banks report their top line",
    PremiumsEarnedNet: "Net premiums earned — how insurers report their top line",
    InterestAndDividendIncomeOperating:
      "Interest & dividend income — the closest tagged top line for this lender",
  };
  const figRevenueCaption = fundamentals?.revenueConcept
    ? FIG_REVENUE_CAPTIONS[fundamentals.revenueConcept] ?? null
    : null;

  const availableStats: StatEntry[] = [
    { key: "price", label: "Price", value: fmtQuotePrice(price) },
    { key: "week52High", label: "52-week high", value: fmtQuotePrice(week52High) },
    { key: "week52Low", label: "52-week low", value: fmtQuotePrice(week52Low) },
    {
      key: "movingAverage50",
      label: "50-day avg. price",
      value: movingAverage50 !== null ? fmtQuotePrice(movingAverage50) : null,
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
      caption: figRevenueCaption ?? currencyCaption(fundamentals?.revenue ?? null),
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
      caption: currencyCaption(fundamentals?.netIncome ?? null),
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
      caption: currencyCaption(fundamentals?.epsDiluted ?? null),
    },
    {
      key: "totalAssets",
      label: "Total assets",
      value:
        fundamentals?.totalAssets !== null && fundamentals?.totalAssets !== undefined
          ? formatUSD(fundamentals.totalAssets)
          : null,
      caption: currencyCaption(fundamentals?.totalAssets ?? null),
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
      caption: currencyCaption(fundamentals?.cash ?? null),
    },
    {
      key: "ebitda",
      label: "EBITDA (op. income + D&A, est.)",
      value: creditMetrics?.ebitda !== null && creditMetrics?.ebitda !== undefined
        ? formatUSD(creditMetrics.ebitda)
        : null,
      caption: currencyCaption(creditMetrics?.ebitda ?? null),
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
      caption: currencyCaption(valuation?.workingCapital ?? null),
    },
    {
      key: "shareholdersEquity",
      label: "Shareholders' equity",
      value:
        fundamentals?.stockholdersEquity !== null &&
        fundamentals?.stockholdersEquity !== undefined
          ? formatUSD(fundamentals.stockholdersEquity)
          : null,
      caption: currencyCaption(fundamentals?.stockholdersEquity ?? null),
    },
    {
      key: "operatingCashFlow",
      label: "Operating cash flow",
      value:
        fundamentals?.operatingCashFlow !== null &&
        fundamentals?.operatingCashFlow !== undefined
          ? formatUSD(fundamentals.operatingCashFlow)
          : null,
      caption: currencyCaption(fundamentals?.operatingCashFlow ?? null),
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

  // Shown in the data-sources appendix so a reader always knows the exact
  // provenance of fundamentals and multiples on the less-obvious pages —
  // HK listings bridged to SEC filings via the same company's US ticker,
  // and ADR pages whose per-share multiples come from the HK price.
  const fundamentalsSourceNote = isHongKong
    ? adrForHk
      ? `Fundamentals for ${symbol} come from ${quote.name}'s own SEC filings, accessed via its US listing (${adrForHk}) — one company, two listings, same accounts. Price-based multiples convert this page's HK$ ordinary-share price to USD at the current exchange rate.`
      : `No fundamentals shown: ${quote.name} has no US listing that files with the SEC, and no free source publishes HKEX companies' structured financials. Price, chart, and news above are real; nothing is estimated to fill the gap.`
    : hkListingForAdr
      ? `Price-based multiples (P/E, EV/EBITDA, market cap...) are computed from this company's Hong Kong ordinary-share price (${hkListingForAdr}, converted to USD) rather than the ADR price shown above — ADR quotes are per ADS bundle (several ordinary shares each), which would overstate every per-share multiple.`
      : null;

  return (
    <div>
      <Link href="/profile" className="text-sm text-muted hover:text-accent">
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
        fundamentalsSourceNote={fundamentalsSourceNote}
      />
    </div>
  );
}
