"use client";

// Two Charizards, almost identical PSA submission volume, wildly different
// gem-mint (PSA 10) rate (see lib/pokemonMarket.ts). This is the cleanest
// single illustration that a card's real scarcity premium tracks its
// graded population, not the year printed on it.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import type { GemRateComparisonPoint } from "@/lib/pokemonMarket";

export default function GemRateChart({ data }: { data: GemRateComparisonPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 30]}
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="card"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: "#f3f1ea",
              border: "1px solid #e3e0d3",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#26241f" }}
            formatter={(_value, _name, item) => [
              `${item.payload.gemRatePct}% gem rate (${item.payload.psa10Count.toLocaleString()} of ${item.payload.totalGraded.toLocaleString()} graded)`,
              "",
            ]}
          />
          <Bar dataKey="gemRatePct" name="Gem rate" fill="var(--module-pokemon)" radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey="gemRatePct"
              position="right"
              formatter={(v: React.ReactNode) => `${v}%`}
              style={{ fill: "#6f6b60", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">
        Same character, near-identical PSA submission counts (about 101,000 vs. 99,500),
        and a gem-rate gap of more than two hundred times. That gap, not the year on the
        card, is most of what a buyer is actually paying for.
      </p>
    </div>
  );
}
