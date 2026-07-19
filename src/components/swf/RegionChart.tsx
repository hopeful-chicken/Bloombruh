"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { GroupTotal } from "@/lib/types";
import { formatUSD } from "@/lib/search";

const COLORS = [
  "#f5a623",
  "#34d399",
  "#60a5fa",
  "#f87171",
  "#a78bfa",
  "#facc15",
  "#38bdf8",
  "#fb923c",
];

export default function RegionChart({ data }: { data: GroupTotal[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalValueUSD"
            nameKey="key"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#141416",
              border: "1px solid #2a2a2e",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
            formatter={(value, _name, item) => [
              `${formatUSD(Number(value))} (${item.payload.portfolioPct.toFixed(1)}%)`,
              item.payload.key,
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#8a8a92" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
