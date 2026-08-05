"use client";

// Price chart for the HKEX company detail page (/hkex/[code]) — ported
// from the standalone "HK Research" project (same author, same stack).
// Pulls from /api/hkex/timeseries (Yahoo Finance, with an EODHD fallback —
// see src/lib/hkex/yahooFinance.ts) rather than this site's main
// /api/timeseries, since that route is wired to Twelve Data, which doesn't
// reliably cover 10Y/MAX ranges for HK listings.

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type ChartPoint = {
  date: string;
  close: number;
};

type Range = "1W" | "1M" | "3M" | "1Y" | "10Y" | "MAX";

const RANGES: { value: Range; label: string }[] = [
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "10Y", label: "10Y" },
  { value: "MAX", label: "Max" },
];

export default function HkexPriceChart({
  code,
  data,
  initialRange = "1Y",
}: {
  code: string;
  data: ChartPoint[];
  initialRange?: Range;
}) {
  const [range, setRange] = useState<Range>(initialRange);
  const [points, setPoints] = useState<ChartPoint[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // True when the server had to fall back to ~1 year of data for a 10Y/Max
  // request (Yahoo Finance temporarily unavailable) — shown as a note
  // rather than silently mislabeling a 1-year chart as 10 years.
  const [partial, setPartial] = useState(false);

  async function handleRangeChange(next: Range) {
    if (next === range) return;
    setRange(next);
    setLoading(true);
    setError(false);
    setPartial(false);
    try {
      const res = await fetch(`/api/hkex/timeseries?code=${encodeURIComponent(code)}&range=${next}`);
      if (!res.ok) throw new Error("Request failed");
      const body = await res.json();
      setPoints(body.points ?? []);
      setPartial(Boolean(body.isPartial));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => handleRangeChange(r.value)}
              className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                range === r.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {loading && <span className="text-xs text-muted">Loading…</span>}
        {error && !loading && <span className="text-xs text-negative">Couldn&apos;t load this range</span>}
        {partial && !loading && !error && (
          <span className="text-xs text-muted">Only ~1Y available right now — full range temporarily unavailable</span>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="hkexPriceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              minTickGap={70}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value) => (value == null ? ["", ""] : [`HK$${value}`, "Close"])}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="url(#hkexPriceFill)"
              isAnimationActive={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
