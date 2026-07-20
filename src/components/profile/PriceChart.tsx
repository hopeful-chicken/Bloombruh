"use client";

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

type Range = "1D" | "1M" | "3M" | "1Y" | "MAX";

const RANGES: { value: Range; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "MAX", label: "Max" },
];

export default function PriceChart({
  symbol,
  data,
  currency,
  initialRange = "1Y",
}: {
  symbol: string;
  data: ChartPoint[];
  currency: string;
  initialRange?: Range;
}) {
  const [range, setRange] = useState<Range>(initialRange);
  const [points, setPoints] = useState<ChartPoint[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isUp = points.length > 1 && points[points.length - 1].close >= points[0].close;

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
                  ? "bg-accent text-background"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {loading && <span className="text-xs text-muted">Loading…</span>}
        {error && !loading && (
          <span className="text-xs text-negative">Couldn&apos;t load this range</span>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isUp ? "#34d399" : "#f87171"}
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor={isUp ? "#34d399" : "#f87171"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8a8a92", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#2a2a2e" }}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#8a8a92", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => `${currency === "USD" ? "$" : ""}${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#141416",
                border: "1px solid #2a2a2e",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e4e4e7" }}
              formatter={(value) => [`${value}`, "Close"]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isUp ? "#34d399" : "#f87171"}
              strokeWidth={1.5}
              fill="url(#priceFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
