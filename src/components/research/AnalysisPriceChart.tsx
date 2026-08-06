"use client";

// A real, indexed multi-security price comparison for a My Analysis
// write-up — used where the actual point of the piece is a *comparison*
// (does a levered, Korea-listed stock really behave that differently
// from an unlevered US peer over the same window?), not just a single
// price line. Data is a static, dated snapshot fetched live from Twelve
// Data at the time this entry was written (see AnalysisChart's own
// comment in data/analysis.ts) — a specific historical window, not a
// live-updating quote. Indexed to 100 at a chosen base date so two very
// differently-priced stocks compare honestly on one axis (same device as
// IndexedCaseChart.tsx in the Hype module). Annotation dates render as
// thin vertical reference lines with a small numbered label, the same
// device the reference pitch decks use to tie price moves to news.
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { AnalysisChart } from "@/data/analysis";

export default function AnalysisPriceChart({ chart }: { chart: AnalysisChart }) {
  if (chart.series.length === 0) return null;

  // Index each series to 100 at chart.indexBase (or its first available
  // point, if the base date itself is missing from that series).
  const indexed = chart.series.map((s) => {
    const baseIdx = s.points.findIndex((p) => p.date >= chart.indexBase);
    const base = s.points[baseIdx === -1 ? 0 : baseIdx]?.close ?? s.points[0].close;
    return {
      ...s,
      points: s.points.map((p) => ({ date: p.date, value: (p.close / base) * 100 })),
    };
  });

  const dateIndex = new Map<string, Record<string, number | undefined>>();
  for (const s of indexed) {
    for (const p of s.points) {
      const row = dateIndex.get(p.date) ?? {};
      row[s.symbol] = p.value;
      dateIndex.set(p.date, row);
    }
  }
  const data = Array.from(dateIndex.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));

  return (
    <div className="mt-6 border border-border bg-surface/40 p-4 sm:p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">{chart.title}</p>
      <div className="mt-3 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ReferenceLine y={100} stroke="var(--muted)" strokeDasharray="2 2" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value) => [typeof value === "number" ? value.toFixed(1) : value, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {chart.annotations.map((a, i) => (
              <ReferenceLine
                key={a.date}
                x={a.date}
                stroke="var(--accent)"
                strokeDasharray="2 2"
                label={{
                  value: String(i + 1),
                  position: "top",
                  fill: "var(--accent)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            ))}
            {indexed.map((s) => (
              <Line
                key={s.symbol}
                type="monotone"
                dataKey={s.symbol}
                name={s.label}
                stroke={s.color}
                strokeWidth={1.8}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] text-muted/70">
        Indexed to 100 on {chart.indexBase} — lines compare relative movement, not dollar price.
      </p>
      <ol className="mt-3 space-y-1 text-[11px] text-muted">
        {chart.annotations.map((a, i) => (
          <li key={a.date}>
            <span className="font-mono font-semibold text-accent">{i + 1}.</span> {a.date} — {a.label}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[11px] text-muted/70">{chart.note}</p>
    </div>
  );
}
