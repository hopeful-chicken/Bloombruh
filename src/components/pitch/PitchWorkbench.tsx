"use client";

// The Pitch Builder's main interaction: shows the pulled-in company data,
// and a structured form for the user's own rating/target/thesis/catalysts/
// risks. A live preview updates as they type, and "Download PDF" produces
// the exportable document (see PitchPdfDocument.tsx). Everything here is
// client-side, local component state only — nothing is saved to a server.

import { useState } from "react";
import dynamic from "next/dynamic";
import { formatUSD, formatNumber, formatPct } from "@/lib/format";
import PriceChart, { type ChartPoint } from "@/components/profile/PriceChart";
import type { Fundamentals } from "@/lib/secEdgar";
import type { CompanyDescription, SourceLink } from "@/lib/companyInfo";

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
};

export default function PitchWorkbench(props: Props) {
  const { symbol, companyName, exchange, currency, price, change, percentChange } =
    props;
  const isUp = change >= 0;

  const [rating, setRating] = useState<Rating>("Hold");
  const [targetPrice, setTargetPrice] = useState("");
  const [thesis, setThesis] = useState("");
  const [catalysts, setCatalysts] = useState("");
  const [risks, setRisks] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [threats, setThreats] = useState("");

  const catalystLines = catalysts.split("\n").map((l) => l.trim()).filter(Boolean);
  const riskLines = risks.split("\n").map((l) => l.trim()).filter(Boolean);
  const strengthLines = strengths.split("\n").map((l) => l.trim()).filter(Boolean);
  const weaknessLines = weaknesses.split("\n").map((l) => l.trim()).filter(Boolean);
  const opportunityLines = opportunities.split("\n").map((l) => l.trim()).filter(Boolean);
  const threatLines = threats.split("\n").map((l) => l.trim()).filter(Boolean);
  const targetPriceNum = parseFloat(targetPrice);
  const impliedUpsidePct =
    Number.isFinite(targetPriceNum) && price > 0
      ? ((targetPriceNum - price) / price) * 100
      : null;

  return (
    <div>
      {/* Header */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {companyName}{" "}
            <span className="font-mono text-lg text-muted">{symbol}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{exchange}</p>
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
      {props.chartData.length > 0 && (
        <div className="mt-8">
          <PriceChart symbol={symbol} data={props.chartData} currency={currency} />
        </div>
      )}

      {/* Key stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Open" value={formatUSD(props.open)} />
        <Stat label="Previous close" value={formatUSD(props.previousClose)} />
        <Stat label="52-week high" value={formatUSD(props.week52High)} />
        <Stat label="52-week low" value={formatUSD(props.week52Low)} />
        <Stat label="Volume" value={formatNumber(props.volume)} />
        <Stat label="Avg. volume" value={formatNumber(props.averageVolume)} />
        <Stat
          label="50-day avg."
          value={props.movingAverage50 ? formatUSD(props.movingAverage50) : "—"}
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

      {/* Fundamentals (US SEC filers only) */}
      {props.fundamentals && (
        <div className="mt-8">
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
            Fundamentals (FY{props.fundamentals.fiscalYear}, from SEC filings)
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="Revenue"
              value={
                props.fundamentals.revenue !== null
                  ? formatUSD(props.fundamentals.revenue)
                  : "—"
              }
            />
            <Stat
              label="Revenue growth (YoY)"
              value={
                props.fundamentals.revenue !== null &&
                props.fundamentals.revenuePriorYear
                  ? formatPct(
                      ((props.fundamentals.revenue -
                        props.fundamentals.revenuePriorYear) /
                        props.fundamentals.revenuePriorYear) *
                        100
                    )
                  : "—"
              }
            />
            <Stat
              label="Net income"
              value={
                props.fundamentals.netIncome !== null
                  ? formatUSD(props.fundamentals.netIncome)
                  : "—"
              }
            />
            <Stat
              label="Gross margin"
              value={
                props.fundamentals.grossProfit !== null &&
                props.fundamentals.revenue
                  ? formatPct(
                      (props.fundamentals.grossProfit / props.fundamentals.revenue) *
                        100
                    )
                  : "—"
              }
            />
            <Stat
              label="EPS (diluted)"
              value={
                props.fundamentals.epsDiluted !== null
                  ? `$${props.fundamentals.epsDiluted.toFixed(2)}`
                  : "—"
              }
            />
            <Stat
              label="Total assets"
              value={
                props.fundamentals.totalAssets !== null
                  ? formatUSD(props.fundamentals.totalAssets)
                  : "—"
              }
            />
          </div>
        </div>
      )}
      {!props.fundamentals && (
        <p className="mt-8 text-xs text-muted/70">
          No SEC fundamentals available for {symbol} — likely a non-US
          listing. The pitch below can still use price data and your own
          research.
        </p>
      )}

      {/* Pitch form */}
      <div className="mt-10 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
          Your pitch
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-muted">Thesis</span>
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={5}
            placeholder="Why this rating? What's the core argument?"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
          />
        </label>

        <div className="mt-6">
          <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
            SWOT (your own read — one point per line)
          </span>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Strengths</span>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={3}
                placeholder={"Strong brand loyalty\nHigh margins"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Weaknesses</span>
              <textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                rows={3}
                placeholder={"Reliant on one product line\nHigh customer concentration"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Opportunities</span>
              <textarea
                value={opportunities}
                onChange={(e) => setOpportunities(e.target.value)}
                rows={3}
                placeholder={"New market expansion\nProduct diversification"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Threats</span>
              <textarea
                value={threats}
                onChange={(e) => setThreats(e.target.value)}
                rows={3}
                placeholder={"New competitor\nRegulatory pressure"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">
              Catalysts (one per line)
            </span>
            <textarea
              value={catalysts}
              onChange={(e) => setCatalysts(e.target.value)}
              rows={4}
              placeholder={"Earnings on [date]\nNew product launch"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Risks (one per line)</span>
            <textarea
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
              rows={4}
              placeholder={"Margin compression\nRegulatory risk"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
            />
          </label>
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
            thesis={thesis}
            catalysts={catalystLines}
            risks={riskLines}
            strengths={strengthLines}
            weaknesses={weaknessLines}
            opportunities={opportunityLines}
            threats={threatLines}
          />
        </div>
      </div>
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
