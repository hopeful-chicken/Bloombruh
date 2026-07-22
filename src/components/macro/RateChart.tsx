"use client";

// A line chart of a central bank's policy rate over time, with the same
// range/zoom buttons as the Company Profile price chart. Unlike that chart,
// rate history is already fetched in full server-side (up to 15 years) and
// doesn't need live re-fetching per range — the buttons just filter the
// already-fetched `history` array client-side by date, then downsample
// with the same sampleForChart helper used for the default view.

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { sampleForChart, type RateObservation } from "@/lib/centralBankRates";

type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "MAX";

const RANGES: { value: Range; label: string; days: number | null }[] = [
  { value: "1D", label: "1D", days: 1 },
  { value: "1W", label: "1W", days: 7 },
  { value: "1M", label: "1M", days: 30 },
  { value: "3M", label: "3M", days: 90 },
  { value: "1Y", label: "1Y", days: 365 },
  { value: "MAX", label: "Max", days: null },
];

function filterByRange(history: RateObservation[], range: Range): RateObservation[] {
  const spec = RANGES.find((r) => r.value === range);
  if (!spec || spec.days === null || history.length === 0) return history;

  const lastDate = new Date(history[history.length - 1].date);
  const cutoff = new Date(lastDate);
  cutoff.setDate(cutoff.getDate() - spec.days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const filtered = history.filter((h) => h.date >= cutoffIso);
  // Rate series are sparse (moves happen every few weeks/months at best) —
  // a short range can easily catch zero observations even though the rate
  // was clearly in effect throughout. Fall back to the last known point so
  // a short zoom never renders an empty chart for an unchanged rate.
  if (filtered.length === 0) return history.slice(-1);
  return filtered;
}

export default function RateChart({
  history,
  initialRange = "MAX",
}: {
  history: RateObservation[];
  initialRange?: Range;
}) {
  const [range, setRange] = useState<Range>(initialRange);

  const points = useMemo(
    () => sampleForChart(filterByRange(history, range)),
    [history, range]
  );

  if (history.length < 2) {
    return (
      <p className="text-sm text-muted">Not enough history to chart yet.</p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRange(r.value)}
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

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
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
              width={48}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#f3f1ea",
                border: "1px solid #e3e0d3",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#26241f" }}
              formatter={(value) => [`${value}%`, "Rate"]}
            />
            <Area
              type="stepAfter"
              dataKey="rate"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="url(#rateFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
