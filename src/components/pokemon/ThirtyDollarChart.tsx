"use client";

// "$30 in 1999" comparison — PSA 10 1st Edition Charizard (orange) vs.
// $30 in the S&P 500, dividend-adjusted (blue). Log scale: by 2026 the
// two lines are nearly 2,000x apart. See lib/pokemonMarket.ts for the
// real sourcing behind every point, and which points are real documented
// sales vs. the one labeled 1999 entry-price assumption.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ComparisonPoint } from "@/lib/pokemonMarket";

const CHARIZARD_COLOR = "var(--module-pokemon)";
const SP500_COLOR = "#2f6f9f";

function CharizardDot(props: {
  cx?: number;
  cy?: number;
  payload?: ComparisonPoint;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || payload?.charizardUsd == null) return null;
  const isReal = payload.charizardReal;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={isReal ? CHARIZARD_COLOR : "transparent"}
      stroke={CHARIZARD_COLOR}
      strokeWidth={isReal ? 0 : 1.5}
      strokeDasharray={isReal ? undefined : "2 1"}
    />
  );
}

export default function ThirtyDollarChart({ data }: { data: ComparisonPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
            minTickGap={24}
          />
          <YAxis
            scale="log"
            domain={[20, 700000]}
            ticks={[30, 300, 3000, 30000, 300000]}
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={64}
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
            formatter={(value, name) => [
              value == null ? "—" : `$${Number(value).toLocaleString()}`,
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="charizardUsd"
            name="PSA 10 Charizard"
            stroke={CHARIZARD_COLOR}
            strokeWidth={1.8}
            dot={<CharizardDot />}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="sp500Usd"
            name="S&P 500 (dividends reinvested)"
            stroke={SP500_COLOR}
            strokeWidth={1.8}
            dot={{ r: 2.5, fill: SP500_COLOR }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">
        Log scale — the two lines end nearly 2,000x apart. Hollow/dashed dot = the
        stated $30 entry assumption, not a documented sale; filled dots are real
        reported sales. See below for exactly what is and isn&apos;t verifiable here.
      </p>
    </div>
  );
}
