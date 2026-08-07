"use client";

// The Pitch Builder's main interaction: shows the pulled-in company data,
// and a structured form for the user's own rating/target/thesis/catalysts/
// risks. A live preview updates as they type, and "Download PDF" produces
// the exportable document (see PitchPdfDocument.tsx). Everything here is
// client-side, local component state only — nothing is saved to a server.

import { useState } from "react";
import dynamic from "next/dynamic";
import { formatPct } from "@/lib/format";
import type { ChartPoint } from "@/components/profile/PriceChart";
import type { Fundamentals } from "@/lib/secEdgar";
import type { CompanyDescription, SourceLink } from "@/lib/companyInfo";
import type { NewsArticle } from "@/lib/news";
import type { AtAGlanceInputs } from "@/lib/signals";
import DataDashboard from "./DataDashboard";
import DataSourcesAppendix, { COMPANY_PROFILE_SOURCES } from "./DataSourcesAppendix";
import ReportBuilder from "./ReportBuilder";
import AiGrader from "./AiGrader";
import {
  createTextBlock,
  createSwotBlock,
  createListBlock,
  createStatsBlock,
  createCompsBlock,
  createLboBlock,
  createMandaBlock,
  createChartBlock,
  createNewsBlock,
  CORE_FINANCIAL_STAT_KEYS,
  VALUATION_STAT_KEYS,
  GROWTH_RETURNS_STAT_KEYS,
  CREDIT_WACC_STAT_KEYS,
  type Block,
  type StatEntry,
  type ChartSeriesOption,
} from "@/lib/reportBlocks";

// react-pdf's PDFDownloadLink touches browser-only APIs, so it's loaded
// only in the browser (no server-side render) to avoid build/hydration
// issues.
const PitchDownloadButton = dynamic(
  () => import("@/components/pitch/PitchDownloadButton"),
  { ssr: false, loading: () => <PdfButtonPlaceholder /> }
);

export type Rating = "Buy" | "Hold" | "Sell";

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
  availableChartSeries: ChartSeriesOption[];
  newsArticles: NewsArticle[];
  /** Extra provenance line for the data-sources appendix on pages whose
   * fundamentals/multiples take a non-obvious route (HK listings bridged
   * to SEC filings via a US ticker, ADR pages priced off the HK listing —
   * see src/lib/hkAdrMap.ts). Null on ordinary pages. */
  fundamentalsSourceNote?: string | null;
  snapshotInputs: AtAGlanceInputs;
};

const REPORT_TYPES = [
  { id: "equity-research", label: "Equity Research / Pitch" },
  { id: "ib-comps", label: "IB Comps" },
  { id: "manda", label: "M&A" },
  { id: "lbo", label: "LBO" },
] as const;

type ReportTypeId = (typeof REPORT_TYPES)[number]["id"];

/** Suggested starter blocks per report type — each gives the student a
 * sensible skeleton for that interview "lens", which they can then remove,
 * retitle, or add to freely. Keyed by report type id so switching types
 * can rebuild the block list from scratch. */
function suggestedBlocksFor(reportType: ReportTypeId, defaultEbitda: string): Block[] {
  switch (reportType) {
    case "equity-research":
      return [
        createTextBlock("Thesis"),
        createStatsBlock("Core Financials", CORE_FINANCIAL_STAT_KEYS),
        createTextBlock(
          "Business & Moat",
          "What does this company actually sell, and to whom? Break down revenue by product, geography, and customer type if you can find it. Then make the case for (or against) a durable moat (switching costs, network effects, scale, brand) and say clearly whether you think it holds up."
        ),
        createSwotBlock("SWOT"),
        createTextBlock(
          "Valuation & Catalysts",
          "Value the company across at least two methods (e.g. a comps multiple and a DCF/FCF-yield check), then list the near-term catalysts that could move the stock and roughly when they will happen."
        ),
        createTextBlock(
          "Bear Case / What Would Prove You Wrong",
          "Steelman the other side. What is the strongest argument against your thesis, and what specific data point or event would tell you that you were wrong?"
        ),
        createListBlock("Catalysts"),
        createListBlock("Risks"),
        createNewsBlock(),
      ];
    case "ib-comps":
      return [
        createTextBlock("Overview"),
        createStatsBlock("Core Financials", CORE_FINANCIAL_STAT_KEYS),
        createStatsBlock("Valuation Multiples", VALUATION_STAT_KEYS),
        createCompsBlock(),
        createStatsBlock("Credit Metrics & WACC Inputs", CREDIT_WACC_STAT_KEYS),
        createTextBlock(
          "Ownership & Shareholder Structure",
          "Who owns this company: insiders, founders, index funds, activist investors? Note any concentrated stakes, dual-class shares, or recent large ownership changes."
        ),
      ];
    case "manda":
      return [
        createTextBlock("Deal Rationale"),
        createStatsBlock("Core Financials", CORE_FINANCIAL_STAT_KEYS),
        createMandaBlock(),
        createTextBlock(
          "Deal Terms & Synergies",
          "Lay out the deal: offer price and premium to the undisturbed share price, financing mix (cash/debt/stock), and the synergies being claimed. Split cost vs. revenue synergies and note how credible each side is."
        ),
        createTextBlock(
          "Integration & Regulatory Risk",
          "What could go wrong operationally (culture clash, systems integration, key-employee attrition) or on the regulatory side (antitrust, foreign ownership rules)? How long might approval and integration realistically take?"
        ),
      ];
    case "lbo":
      return [
        createTextBlock("Investment Thesis"),
        createStatsBlock("Core Financials", CORE_FINANCIAL_STAT_KEYS),
        createLboBlock("LBO returns", defaultEbitda),
        createTextBlock(
          "Leverage & Debt Maturities",
          "How much existing leverage does the target carry, and when do those debt tranches mature? Note capex intensity and the tangible asset base available as collateral for new debt."
        ),
        createTextBlock(
          "Exit Assumptions",
          "State your assumed holding period, exit multiple, and exit route (strategic sale, sponsor-to-sponsor, IPO). Justify why the exit multiple you have chosen is reasonable relative to entry."
        ),
      ];
  }
}

export default function PitchWorkbench(props: Props) {
  const { symbol, companyName, exchange, price, change, percentChange } = props;

  const [rating, setRating] = useState<Rating>("Hold");
  const [targetPrice, setTargetPrice] = useState("");

  // Default view: one page with everything (data, news, numbers) and
  // nothing to fill in. Only once the student opts in to building their
  // own report does the page split into two panes — the data stays fully
  // visible on one side, the report builder lives on the other. Toggling
  // back and forth loses nothing: blocks/rating/targetPrice all live in
  // this same component, so they're untouched either way.
  const [showBuilder, setShowBuilder] = useState(false);

  const defaultEbitda =
    props.fundamentals?.operatingIncome !== null &&
    props.fundamentals?.operatingIncome !== undefined &&
    props.fundamentals?.depreciationAmortization !== null &&
    props.fundamentals?.depreciationAmortization !== undefined
      ? String(
          props.fundamentals.operatingIncome + props.fundamentals.depreciationAmortization
        )
      : "";

  const [reportType, setReportType] = useState<ReportTypeId>("equity-research");
  const [blocks, setBlocks] = useState<Block[]>(() =>
    suggestedBlocksFor("equity-research", defaultEbitda)
  );

  /** Switching report type rebuilds the block list from that type's
   * starter set — a destructive action, so confirm first since it
   * discards whatever the student has already written. */
  function handleReportTypeChange(next: ReportTypeId) {
    if (next === reportType) return;
    const proceed =
      blocks.length === 0 ||
      window.confirm(
        "Switching report type replaces your current blocks with a new starter set. Continue?"
      );
    if (!proceed) return;
    setReportType(next);
    setBlocks(suggestedBlocksFor(next, defaultEbitda));
  }

  const targetPriceNum = parseFloat(targetPrice);
  const impliedUpsidePct =
    Number.isFinite(targetPriceNum) && price > 0
      ? ((targetPriceNum - price) / price) * 100
      : null;

  const reportPane = (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
          Build your report
        </h2>
        <button
          type="button"
          onClick={() => setShowBuilder(false)}
          className="text-xs text-muted hover:text-accent"
        >
          ← Back to data view
        </button>
      </div>

      {/* Report type — each has its own suggested starter block set,
          covering the four common interview "lenses". Switching types
          rebuilds the block list, so it asks for confirmation first. */}
      <div className="mt-3 flex flex-wrap gap-2">
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.id}
            type="button"
            onClick={() => handleReportTypeChange(rt.id)}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              reportType === rt.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {rt.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-border bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Rating</span>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value as Rating)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="Buy">Buy</option>
              <option value="Hold">Hold</option>
              <option value="Sell">Sell</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-muted">
              Target price
              {impliedUpsidePct !== null && (
                <span
                  className={`ml-2 font-mono text-xs ${
                    impliedUpsidePct >= 0 ? "text-positive" : "text-negative"
                  }`}
                >
                  ({formatPct(impliedUpsidePct)} implied)
                </span>
              )}
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={price.toFixed(2)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div className="mt-5">
        <ReportBuilder
          blocks={blocks}
          onBlocksChange={setBlocks}
          availableStats={props.availableStats}
          availableChartSeries={props.availableChartSeries}
          newsArticles={props.newsArticles}
          defaultEbitda={defaultEbitda}
        />
      </div>

      <div className="mt-5">
        <AiGrader
          symbol={symbol}
          companyName={companyName}
          price={price}
          rating={rating}
          targetPrice={Number.isFinite(targetPriceNum) ? targetPriceNum : null}
          availableStats={props.availableStats}
          blocks={blocks}
        />
      </div>

      <div className="mt-5">
        <PitchDownloadButton
          symbol={symbol}
          companyName={companyName}
          exchange={exchange}
          price={price}
          change={change}
          percentChange={percentChange}
          week52High={props.week52High}
          week52Low={props.week52Low}
          movingAverage50={props.movingAverage50}
          annualizedVol={props.annualizedVol}
          chartCloses={props.chartData.map((p) => p.close)}
          fundamentals={props.fundamentals}
          rating={rating}
          targetPrice={Number.isFinite(targetPriceNum) ? targetPriceNum : null}
          blocks={blocks}
          availableStats={props.availableStats}
          chartSeries={props.availableChartSeries}
          newsArticles={props.newsArticles}
        />
      </div>
    </div>
  );

  if (!showBuilder) {
    return (
      <div className="mt-4">
        <DataDashboard {...props} />

        {/* CTA — the clear "look vs. build" separation: everything above
            is just data, nothing to fill in. Opting in here is what
            switches to the two-pane report-building view. */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-accent/30 bg-accent/5 p-5">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
              Want to go further?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Build your own investment report from this data. Pick a report
              type, add your thesis, and export a PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Build your own report →
          </button>
        </div>

        <DataSourcesAppendix
          sources={COMPANY_PROFILE_SOURCES}
          note={
            props.fundamentalsSourceNote ??
            (props.fundamentals
              ? null
              : 'No SEC fundamentals were found for this ticker (likely a non-US listing). Figures that depend on it show "Unavailable" rather than a guess.')
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-4">
          <DataDashboard {...props} />
        </div>
        <div>{reportPane}</div>
      </div>

      <DataSourcesAppendix
        sources={COMPANY_PROFILE_SOURCES}
        note={
          props.fundamentalsSourceNote ??
          (props.fundamentals
            ? null
            : 'No SEC fundamentals were found for this ticker (likely a non-US listing). Figures that depend on it show "Unavailable" rather than a guess.')
        }
      />
    </div>
  );
}

function PdfButtonPlaceholder() {
  return (
    <button
      type="button"
      disabled
      className="rounded-md border border-border px-4 py-2 text-sm text-muted"
    >
      Preparing PDF export…
    </button>
  );
}
