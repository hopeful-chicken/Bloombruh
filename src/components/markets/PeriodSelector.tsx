"use client";

// Shared Week/Month/Year/Max period selector for the Markets Overview
// module — used by the world-situation panel and both segment pickers
// (equity sectors, private markets). Same visual pattern as the range
// buttons on RateChart.tsx and GlobalRatesOverview.tsx, just a different
// (coarser) set of periods since this module deals in return-over-period
// rather than a zoomable price chart.

export type MarketPeriod = "1W" | "1M" | "1Y" | "5Y" | "MAX";

export const MARKET_PERIODS: { value: MarketPeriod; label: string }[] = [
  { value: "1W", label: "Week" },
  { value: "1M", label: "Month" },
  { value: "1Y", label: "Year" },
  { value: "5Y", label: "5 Years" },
  { value: "MAX", label: "Forever" },
];

const PERIOD_PHRASES: Record<MarketPeriod, string> = {
  "1W": "the past week",
  "1M": "the past month",
  "1Y": "the past year",
  "5Y": "the past 5 years",
  MAX: "the full available history",
};

export function periodPhrase(period: MarketPeriod): string {
  return PERIOD_PHRASES[period];
}

export default function PeriodSelector({
  value,
  onChange,
}: {
  value: MarketPeriod;
  onChange: (period: MarketPeriod) => void;
}) {
  return (
    <div className="flex gap-1">
      {MARKET_PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
            value === p.value
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:bg-surface hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
