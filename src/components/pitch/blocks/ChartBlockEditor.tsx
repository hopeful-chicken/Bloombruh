"use client";

// Lets the student drop a chart into their report: pick a data series
// (price, revenue, net income, EBITDA — whatever's available for this
// company) and a chart type (line or bar), with a live Recharts preview.
// Reuses Recharts, already a project dependency for PriceChart.tsx — no
// new library added.

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartBlockData, ChartSeriesOption } from "@/lib/reportBlocks";

export default function ChartBlockEditor({
  data,
  onChange,
  availableSeries,
}: {
  data: ChartBlockData;
  onChange: (data: ChartBlockData) => void;
  availableSeries: ChartSeriesOption[];
}) {
  const selected = availableSeries.find((s) => s.key === data.seriesKey);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Data series</span>
          <select
            value={data.seriesKey}
            onChange={(e) => onChange({ ...data, seriesKey: e.target.value })}
            className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          >
            {availableSeries.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Chart type</span>
          <select
            value={data.chartType}
            onChange={(e) =>
              onChange({ ...data, chartType: e.target.value as "line" | "bar" })
            }
            className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </label>
      </div>

      <div className="h-56 w-full rounded-md border border-border bg-background p-2">
        {!selected || selected.points.length === 0 ? (
          <p className="flex h-full items-center justify-center text-xs text-muted">
            No data available for this series.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {data.chartType === "bar" ? (
              <BarChart data={selected.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6f6b60", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e3e0d3" }}
                />
                <YAxis
                  tick={{ fill: "#6f6b60", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "#f3f1ea",
                    border: "1px solid #e3e0d3",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#26241f" }}
                />
                <Bar dataKey="value" fill="#bc5b33" />
              </BarChart>
            ) : (
              <LineChart data={selected.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6f6b60", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e3e0d3" }}
                />
                <YAxis
                  tick={{ fill: "#6f6b60", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "#f3f1ea",
                    border: "1px solid #e3e0d3",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#26241f" }}
                />
                <Line type="monotone" dataKey="value" stroke="#bc5b33" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
