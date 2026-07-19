"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { GroupTotal } from "@/lib/types";
import { formatUSD } from "@/lib/search";

export default function SectorChart({ data }: { data: GroupTotal[] }) {
  const sorted = [...data].sort((a, b) => b.totalValueUSD - a.totalValueUSD);

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#8a8a92", fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            dataKey="portfolioPct"
          />
          <YAxis
            type="category"
            dataKey="key"
            width={150}
            tick={{ fill: "#e4e4e7", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#141416",
              border: "1px solid #2a2a2e",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
            formatter={(_value, _name, item) => [
              `${formatUSD(item.payload.totalValueUSD)} (${item.payload.portfolioPct.toFixed(1)}% of portfolio)`,
              item.payload.key,
            ]}
          />
          <Bar dataKey="portfolioPct" fill="#f5a623" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
