"use client";

// Cumulative Pokemon TCG cards printed worldwide — real, disclosed
// milestones only (see lib/pokemonMarket.ts). Deliberately NOT a smooth
// 30-year curve: these are the actual dated figures the Pokemon Company
// has published, nothing interpolated between them.

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ProductionMilestone } from "@/lib/pokemonMarket";

export default function MarketChart({ data }: { data: ProductionMilestone[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="marketFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--module-pokemon)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--module-pokemon)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
          />
          <YAxis
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `${v}bn`}
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
              item.payload.label,
              "",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulativeBillion"
            stroke="var(--module-pokemon)"
            strokeWidth={1.8}
            fill="url(#marketFill)"
            dot={{ r: 3, fill: "var(--module-pokemon)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">
        Every point is a real, disclosed figure — this only covers 2020 onward because
        that&apos;s as far back as continuous public data actually goes (see below).
      </p>
    </div>
  );
}
