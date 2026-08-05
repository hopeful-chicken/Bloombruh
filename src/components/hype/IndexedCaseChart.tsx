"use client";

// Multi-line chart for one historical hype case: each ticker's real price
// series, indexed to 100 at the start of the case's window, so tickers
// with very different price scales (GME ~$480 vs AMC ~$20) can be
// compared on one honest chart — the lines show relative movement, not
// dollar levels (real dollar figures are shown separately in the stat
// grid next to this chart). Full history from the window start through
// today, so a viewer can see both the run-up and however things stand now
// (Cisco still below its dot-com peak 25 years later, for instance).

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { PricePoint } from "@/lib/hypeAnalysis";

const LINE_COLORS = ["#bc5b33", "#2f6f9f", "#6f9f4f", "#9f6f9f"];

/** Downsamples to ~maxPoints, always keeping the first and last. */
function sample(arr: PricePoint[], maxPoints = 200): PricePoint[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  const out: PricePoint[] = [];
  for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1]);
  return out;
}

export default function IndexedCaseChart({
  series,
}: {
  series: { symbol: string; points: PricePoint[] }[];
}) {
  const usable = series.filter((s) => s.points.length > 1);
  if (usable.length === 0) {
    return <p className="text-sm text-muted">Price history is unavailable for this case right now.</p>;
  }

  // Merge onto a shared set of dates for Recharts (one row per date, one
  // key per ticker) — dates come from the longest series; shorter series
  // (a ticker with less available history) just have gaps, which Recharts
  // leaves as connected gaps via connectNulls.
  const longest = usable.reduce((a, b) => (b.points.length > a.points.length ? b : a));
  const dateIndex = new Map<string, Record<string, number | undefined>>();
  for (const s of usable) {
    for (const p of sample(s.points)) {
      const row = dateIndex.get(p.date) ?? {};
      row[s.symbol] = p.close;
      dateIndex.set(p.date, row);
    }
  }
  const data = Array.from(dateIndex.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
            minTickGap={44}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `${v}`}
          />
          <ReferenceLine y={100} stroke="#a39d8c" strokeDasharray="2 2" />
          <Tooltip
            contentStyle={{
              background: "#f3f1ea",
              border: "1px solid #e3e0d3",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#26241f" }}
            formatter={(value) => [typeof value === "number" ? value.toFixed(0) : value, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {usable.map((s, i) => (
            <Line
              key={s.symbol}
              type="monotone"
              dataKey={s.symbol}
              name={s.symbol}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={1.6}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">
        Indexed to 100 at the start of the window shown — lines compare relative
        movement, not dollar price (see the real prices in the stats below).
      </p>
    </div>
  );
}
