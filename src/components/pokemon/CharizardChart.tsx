"use client";

// PSA 10, 1st Edition Base Set Charizard — real reported sale/valuation
// points (see lib/pokemonMarket.ts). Linear axis (equal spacing per
// dollar), by request, rather than log scale. This is the flagship "is
// this thing actually volatile" case study: a near-vertical 2018-2022
// run, a real ~40% correction, then a new all-time high by December
// 2025 — genuine volatility sitting inside a longer structural uptrend,
// not a one-way crash the way the 1990s sports-card bust was.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { PriceDataPoint } from "@/lib/pokemonMarket";

export default function CharizardChart({ data }: { data: PriceDataPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
          />
          <YAxis
            domain={[0, 600000]}
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
            ticks={[0, 100000, 200000, 300000, 400000, 500000, 600000]}
            tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)}
          />
          <Tooltip
            contentStyle={{
              background: "#f3f1ea",
              border: "1px solid #e3e0d3",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#26241f" }}
            formatter={(value, _name, item) => [
              `$${Number(value).toLocaleString()}: ${item.payload.label}`,
              "",
            ]}
          />
          <Line
            type="monotone"
            dataKey="usd"
            stroke="var(--module-pokemon)"
            strokeWidth={1.8}
            dot={{ r: 3, fill: "var(--module-pokemon)" }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">
        Real reported sale/valuation points; gaps between them are real reporting
        gaps, not smoothed.
      </p>
    </div>
  );
}
