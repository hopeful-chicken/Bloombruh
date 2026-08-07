"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { splitAtBaseline } from "@/lib/chartSplit";

export type ChartPoint = {
  date: string;
  close: number;
};

type Range = "1D" | "1M" | "3M" | "1Y" | "MAX";

const RANGES: { value: Range; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "MAX", label: "Max" },
];

const UP_COLOR = "#3e7d57";
const DOWN_COLOR = "#c0392b";

export default function PriceChart({
  symbol,
  data,
  currency,
  initialRange = "1Y",
  previousClose,
}: {
  symbol: string;
  data: ChartPoint[];
  currency: string;
  initialRange?: Range;
  /** Real previous-session close, fetched server-side from the live quote.
   * Used as the 1D view's baseline instead of the day's first intraday bar
   * — otherwise an overnight gap-down can render as a green "up" day, since
   * intraday data only covers today's own session, not yesterday's close.
   * Bug found and fixed 2026-07-23. */
  previousClose?: number;
}) {
  const [range, setRange] = useState<Range>(initialRange);
  const [points, setPoints] = useState<ChartPoint[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // For "1D", the real baseline is yesterday's close, not today's first
  // bar — prepend it as a genuine data point so the chart's own line (not
  // just the up/down color) shows the true overnight gap.
  const chartPoints =
    range === "1D" && previousClose != null && points.length > 0
      ? [{ date: "Prev close", close: Math.round(previousClose * 100) / 100 }, ...points]
      : points;

  const baseline = chartPoints.length > 0 ? chartPoints[0].close : 0;
  const splitData = splitAtBaseline(chartPoints, baseline);

  async function handleRangeChange(next: Range) {
    if (next === range) return;
    setRange(next);
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/timeseries?symbol=${encodeURIComponent(symbol)}&range=${next}`
      );
      if (!res.ok) throw new Error("Request failed");
      const body = await res.json();
      setPoints(body.points ?? []);
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
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
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
        {error && !loading && (
          <span className="text-xs text-negative">Could not load this range</span>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={splitData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="priceFillUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={UP_COLOR} stopOpacity={0.25} />
                <stop offset="100%" stopColor={UP_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="priceFillDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DOWN_COLOR} stopOpacity={0.25} />
                <stop offset="100%" stopColor={DOWN_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6f6b60", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e3e0d3" }}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#6f6b60", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => `${currency === "USD" ? "$" : ""}${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#f3f1ea",
                border: "1px solid #e3e0d3",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#26241f" }}
              formatter={(value) => (value == null ? ["", ""] : [`${value}`, "Close"])}
            />
            <Area
              type="monotone"
              dataKey="above"
              stroke={UP_COLOR}
              strokeWidth={1.5}
              fill="url(#priceFillUp)"
              connectNulls={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="below"
              stroke={DOWN_COLOR}
              strokeWidth={1.5}
              fill="url(#priceFillDown)"
              connectNulls={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {range === "1D" && previousClose != null && (
        <p className="mt-1 text-[11px] text-muted/70">
          Baselined at yesterday&apos;s close ({currency === "USD" ? "$" : ""}
          {previousClose.toFixed(2)}), not today&apos;s first intraday price.
        </p>
      )}
    </div>
  );
}
