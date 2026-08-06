"use client";

// A dual-axis overlay chart: the region's stock index (price, right axis)
// on top of the central bank's policy rate (%, left axis), sharing one
// date x-axis — so a reader can see for themselves whether and how the two
// move together over the chosen window. Both series are real: the rate is
// the same history the RateChart shows; the index is the real ETF price
// series fetched server-side and passed in. No correlation is asserted by
// the chart itself — it just puts the two lines side by side and lets the
// AI narrative (grounded in real news) and the reader judge.
//
// Same "full history in, filtered client-side by range buttons" pattern as
// RateChart — no refetch per range. The rate (a sparse step series) is
// carried forward onto the index's daily dates so both lines span the
// window continuously.

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { RateObservation } from "@/lib/centralBankRates";

export type IndexPoint = { date: string; close: number };
export type CompareRange = "1W" | "1M" | "3M" | "1Y" | "MAX";

const RANGE_DAYS: Record<CompareRange, number | null> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  MAX: null,
};

function cutoffIso(latestIso: string, range: CompareRange): string | null {
  const days = RANGE_DAYS[range];
  if (days === null) return null;
  const d = new Date(latestIso);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** The index's % change across a range window — shared by the chart (for
 * its own label) and the CountrySituation panel (to ground the AI
 * narrative in the exact figure on screen). Null if the window has no
 * usable data. */
export function windowChangePercent(
  indexHistory: IndexPoint[],
  range: CompareRange
): number | null {
  if (indexHistory.length === 0) return null;
  const latestIso = indexHistory[indexHistory.length - 1].date;
  const cutoff = cutoffIso(latestIso, range);
  const idx = cutoff ? indexHistory.filter((p) => p.date >= cutoff) : indexHistory;
  if (idx.length < 2) return null;
  const first = idx[0].close;
  const last = idx[idx.length - 1].close;
  return first !== 0 ? (last / first - 1) * 100 : null;
}

/** Downsamples to ~`maxPoints`, always keeping first and last. */
function sample<T>(arr: T[], maxPoints = 160): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  const out: T[] = [];
  for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1]);
  return out;
}

export default function IndexRateCompareChart({
  rateHistory,
  indexHistory,
  indexName,
  range,
  ratePercentColor = "var(--module-macro)",
}: {
  rateHistory: RateObservation[];
  indexHistory: IndexPoint[];
  indexName: string;
  range: CompareRange;
  ratePercentColor?: string;
}) {
  const { data, indexChangePercent } = useMemo(() => {
    if (indexHistory.length === 0) return { data: [], indexChangePercent: null };

    const latestIso = indexHistory[indexHistory.length - 1].date;
    const cutoff = cutoffIso(latestIso, range);
    const idx = cutoff ? indexHistory.filter((p) => p.date >= cutoff) : indexHistory;
    if (idx.length === 0) return { data: [], indexChangePercent: null };

    // Carry the (sparse, ISO-dated) rate forward onto each index date.
    const sortedRates = [...rateHistory].sort((a, b) => a.date.localeCompare(b.date));
    let ri = 0;
    let carried: number | null = null;
    // Seed carry with the last rate at/before the window's first date.
    const merged = idx.map((p) => {
      while (ri < sortedRates.length && sortedRates[ri].date <= p.date) {
        carried = sortedRates[ri].rate;
        ri += 1;
      }
      return { date: p.date, index: p.close, rate: carried };
    });

    const first = idx[0].close;
    const last = idx[idx.length - 1].close;
    const change = first !== 0 ? (last / first - 1) * 100 : null;
    return { data: sample(merged), indexChangePercent: change };
  }, [rateHistory, indexHistory, range]);

  if (indexHistory.length === 0) {
    return (
      <p className="text-sm text-muted">
        Index data for this region is unavailable right now.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-end">
        {indexChangePercent !== null && (
          <span
            className={`font-mono text-xs ${indexChangePercent >= 0 ? "text-positive" : "text-negative"}`}
          >
            {indexName}: {indexChangePercent > 0 ? "+" : ""}
            {indexChangePercent.toFixed(1)}% over this window
          </span>
        )}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6f6b60", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e3e0d3" }}
              minTickGap={44}
              tickFormatter={(d: string) => d.slice(2)}
            />
            <YAxis
              yAxisId="rate"
              orientation="left"
              domain={["auto", "auto"]}
              tick={{ fill: "#6f6b60", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="index"
              orientation="right"
              domain={["auto", "auto"]}
              tick={{ fill: "#6f6b60", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "#f3f1ea",
                border: "1px solid #e3e0d3",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#26241f" }}
              formatter={(value, name) =>
                name === "Policy rate"
                  ? [`${value}%`, name]
                  : [typeof value === "number" ? value.toFixed(2) : value, name]
              }
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="rate"
              type="stepAfter"
              dataKey="rate"
              name="Policy rate"
              stroke={ratePercentColor}
              strokeWidth={1.6}
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="index"
              type="monotone"
              dataKey="index"
              name={indexName}
              stroke="#2f6f9f"
              strokeWidth={1.4}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
