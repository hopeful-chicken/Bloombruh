"use client";

// PSA 10 population growth for four Base Set (1999) cards over one recent
// 30-day window (see lib/pokemonMarket.ts). The printed supply of a 1999
// card is fixed, but the number of copies actually sitting in a PSA 10
// holder is not: this is the real evidence behind that distinction.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { PsaPopulationPoint } from "@/lib/pokemonMarket";

const BEFORE_COLOR = "#c9c2ac";
const AFTER_COLOR = "var(--module-pokemon)";

export default function PsaPopulationChart({ data }: { data: PsaPopulationPoint[] }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={288}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
          <XAxis
            dataKey="card"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
          />
          <YAxis
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#f3f1ea",
              border: "1px solid #e3e0d3",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#26241f" }}
            formatter={(value, name) => [Number(value).toLocaleString(), name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="before" name="PSA 10 pop, 30 days ago" fill={BEFORE_COLOR} radius={[3, 3, 0, 0]} />
          <Bar dataKey="after" name="PSA 10 pop, today" fill={AFTER_COLOR} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-muted/70">
        Real PSA population-report figures for four 1999 Base Set cards, one recent 30-day
        window. Part of this is PSA clearing a submission backlog rather than a steady run
        rate, but the direction is real: the gem-mint population of a 1999 card can more
        than double, in some cases more than quintuple, in a month.
      </p>
    </div>
  );
}
