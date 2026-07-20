"use client";

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

export default function PriceChart({
  data,
  currency,
}: {
  data: ChartPoint[];
  currency: string;
}) {
  const isUp =
    data.length > 1 && data[data.length - 1].close >= data[0].close;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
  );
}
