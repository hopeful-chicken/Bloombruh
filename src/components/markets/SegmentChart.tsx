"use client";

// Price chart for one Markets Overview segment (an equity sector's or
// private-market segment's proxy ETF) at one period. Fetches from the same
// /api/timeseries route the Company Profile price chart uses (see
// src/app/api/timeseries/route.ts) — the period is driven by the parent's
// shared PeriodSelector rather than its own buttons, since this chart is
// one piece of a bigger segment+period picker. Reports the real computed
// return over the fetched window back up to the parent via onChangePercent
// so the AI narrative can be grounded in the same real number the chart
// shows, not a separately-guessed figure.

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MarketPeriod } from "./PeriodSelector";
import { splitAtBaseline } from "@/lib/chartSplit";

const UP_COLOR = "#3e7d57";
const DOWN_COLOR = "#c0392b";

type ChartPoint = { date: string; close: number };

export default function SegmentChart({
  symbol,
  period,
  onChangePercent,
}: {
  symbol: string;
  period: MarketPeriod;
  onChangePercent: (changePercent: number | null) => void;
}) {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/timeseries?symbol=${encodeURIComponent(symbol)}&range=${period}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: { points?: ChartPoint[] }) => {
        if (cancelled) return;
        const fetched = body.points ?? [];
        setPoints(fetched);
        if (fetched.length >= 2) {
          const first = fetched[0].close;
          const last = fetched[fetched.length - 1].close;
          onChangePercent(first !== 0 ? ((last - first) / first) * 100 : null);
        } else {
          onChangePercent(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          onChangePercent(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // onChangePercent intentionally excluded from deps — it's a stable
    // setter passed down from the parent, not something whose identity
    // should re-trigger this fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, period]);

  if (loading) {
    return <p className="text-sm text-muted">Loading chart…</p>;
  }
  if (error || points.length < 2) {
    return (
      <p className="text-sm text-muted">
        Couldn&apos;t load price data for this segment right now — see the news below in the meantime.
      </p>
    );
  }

  const baseline = points[0].close;
  const splitData = splitAtBaseline(points, baseline);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={splitData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="segmentFillUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={UP_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={UP_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="segmentFillDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={DOWN_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={DOWN_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e3e0d3" }}
            minTickGap={40}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#6f6b60", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#f3f1ea",
              border: "1px solid #e3e0d3",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#26241f" }}
            formatter={(value) => (value == null ? ["", ""] : [`$${value}`, "Close"])}
          />
          <Area
            type="monotone"
            dataKey="above"
            stroke={UP_COLOR}
            strokeWidth={1.5}
            fill="url(#segmentFillUp)"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="below"
            stroke={DOWN_COLOR}
            strokeWidth={1.5}
            fill="url(#segmentFillDown)"
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
