"use client";

// A real Monte Carlo simulation (single-factor / market-model, 500 paths
// x 1 trading year), run entirely client-side — but framed the way the
// job actually works: you are not optimizing a portfolio in a vacuum,
// you are building one for a SPECIFIC client with a written mandate.
// Pick a client, build their portfolio, run the sim, then sit through
// the client call where every mandate constraint is checked with the
// numbers on the table. The return/vol/beta inputs are illustrative
// long-run assumptions (see src/data/simulations.ts), not live data —
// stated plainly in the UI, not just in a footnote.

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ASSET_CLASSES,
  CLIENT_BRIEFS,
  evaluateMandate,
  runMonteCarlo,
  RISK_FREE_RATE,
  type ClientBrief,
  type MonteCarloResult,
  type MandateResult,
} from "@/data/simulations";

const STARTING_VALUE = 100000;

export default function PortfolioRiskSimulator() {
  const [brief, setBrief] = useState<ClientBrief>(CLIENT_BRIEFS[1]); // default: the endowment
  const [weights, setWeights] = useState<Record<string, number>>({
    "us-large": 50,
    "ig-bonds": 30,
    "intl-dev": 20,
  });
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [mandate, setMandate] = useState<MandateResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);

  function setWeight(id: string, value: number) {
    setWeights((w) => ({ ...w, [id]: value }));
    // Changing the portfolio after a run invalidates the client call —
    // the numbers on the table must match the portfolio being discussed.
    setMandate(null);
  }

  function pickBrief(b: ClientBrief) {
    setBrief(b);
    setMandate(null);
  }

  function run() {
    if (totalWeight <= 0) return;
    setRunning(true);
    // Let the "Running..." state paint before the (synchronous, but
    // real) computation blocks the main thread for a moment.
    setTimeout(() => {
      const normalized: Record<string, number> = {};
      for (const a of ASSET_CLASSES) normalized[a.id] = (weights[a.id] ?? 0) / totalWeight;
      const weightedAssets = ASSET_CLASSES.filter((a) => (normalized[a.id] ?? 0) > 0).map((a) => ({
        asset: a,
        weight: normalized[a.id],
      }));
      const r = runMonteCarlo(weightedAssets, STARTING_VALUE);
      setResult(r);
      setMandate(evaluateMandate(brief, normalized, r));
      setRunning(false);
    }, 30);
  }

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.percentileByDay
      .filter((_, i) => i % 3 === 0)
      .map((row) => ({
        day: row.day,
        band: [row.p5, row.p95],
        midBand: [row.p25, row.p75],
        median: row.median,
      }));
  }, [result]);

  const passes = mandate?.filter((m) => m.pass).length ?? 0;
  const allPass = mandate !== null && passes === mandate.length;

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-5">
      {/* The client, first — the mandate defines the job before any slider moves */}
      <p className="text-xs text-muted">
        First, whose money is it? Each client hands you a written mandate — hard constraints your
        portfolio must satisfy <span className="text-foreground">all at once</span>.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {CLIENT_BRIEFS.map((b) => (
          <button
            key={b.id}
            onClick={() => pickBrief(b)}
            className={`rounded-lg border p-3 text-left ${
              brief.id === b.id
                ? "border-accent bg-accent/5"
                : "border-border bg-background/40 hover:border-accent/60"
            }`}
          >
            <p className="text-sm font-medium text-foreground">
              {b.client} <span className="text-xs font-normal text-muted">· {b.role}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{b.story}</p>
          </button>
        ))}
      </div>

      {/* The mandate, in writing */}
      <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-accent">
          {brefName(brief)}&apos;s mandate
        </p>
        <ul className="mt-1 space-y-0.5">
          {brief.constraintLabels.map((l) => (
            <li key={l} className="text-xs text-foreground">
              · {l}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-muted">
        Portfolio: <span className="font-mono text-foreground">${STARTING_VALUE.toLocaleString()}</span>.
        Set weights below (they will be normalized to 100% automatically), then run 500 simulated
        1-year paths.
      </p>

      <div className="mt-4 space-y-2.5">
        {ASSET_CLASSES.map((a) => (
          <div key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_5rem_3rem]">
            <div>
              <p className="text-sm text-foreground">{a.name}</p>
              <p className="text-[11px] text-muted">
                {a.category} · exp. return {(a.expectedReturn * 100).toFixed(1)}% · vol{" "}
                {(a.volatility * 100).toFixed(0)}%
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[a.id] ?? 0}
              onChange={(e) => setWeight(a.id, Number(e.target.value))}
              className="col-span-2 accent-accent sm:col-span-1"
            />
            <span className="font-mono text-xs text-accent">{weights[a.id] ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <p className="text-xs text-muted">
          Total weight: <span className="text-foreground">{totalWeight}</span>
          {totalWeight !== 100 && totalWeight > 0 && (
            <span className="ml-1 text-accent">(will be normalized to 100%)</span>
          )}
        </p>
      </div>

      <button
        onClick={run}
        disabled={totalWeight <= 0 || running}
        className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
      >
        {running ? "Running 500 simulated paths…" : `Run the sim & take the client call`}
      </button>

      {result && (
        <div className="mt-6 border-t border-border pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Expected 1yr return" value={`${(result.expectedReturn * 100).toFixed(1)}%`} />
            <Stat label="Volatility" value={`${(result.volatility * 100).toFixed(1)}%`} />
            <Stat label="95% VaR (1yr)" value={`-${(result.var95 * 100).toFixed(1)}%`} accent />
            <Stat label="95% CVaR (Expected Shortfall)" value={`-${(result.cvar95 * 100).toFixed(1)}%`} accent />
            <Stat label="Sharpe ratio" value={result.sharpe.toFixed(2)} />
          </div>
          <p className="mt-3 text-xs text-muted">
            VaR: in the worst 5% of simulated years, the portfolio loses at least this much. CVaR:
            the average loss across that worst 5% (a fuller picture of tail risk than VaR alone).
            Sharpe uses an assumed {(RISK_FREE_RATE * 100).toFixed(0)}% risk-free rate.
          </p>

          {/* The client call — the whole point of the seat */}
          {mandate && (
            <div
              className={`mt-5 rounded-lg border p-4 ${
                allPass
                  ? "border-[var(--color-positive)]/50 bg-[var(--color-positive)]/5"
                  : "border-[var(--color-negative)]/50 bg-[var(--color-negative)]/5"
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted/70">
                The client call — {brief.client}&apos;s reaction
              </p>
              <ul className="mt-2 space-y-1.5">
                {mandate.map((m) => (
                  <li key={m.label} className="flex items-start gap-2 text-xs">
                    <span
                      className={`mt-0.5 font-mono ${
                        m.pass ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                      }`}
                    >
                      {m.pass ? "✓" : "✗"}
                    </span>
                    <span className="text-foreground">
                      {m.label}{" "}
                      <span className="text-muted">— {m.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border/60 pt-2 text-sm font-medium text-foreground">
                {allPass ? brief.signOff : brief.pushBack}
              </p>
              {!allPass && (
                <p className="mt-1 text-xs text-muted">
                  {passes} of {mandate.length} constraints met. Adjust the weights and run it again —
                  every answer is in the trade-off, not in any single slider.
                </p>
              )}
            </div>
          )}

          <p className="mt-5 mb-2 text-xs uppercase tracking-widest text-muted/70">
            Simulated value over 1 year: median, 25th-75th percentile band, 5th-95th percentile band
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  label={{ value: "Trading day", position: "insideBottom", offset: -3, fontSize: 11, fill: "var(--color-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (Array.isArray(value)) {
                      return [`$${Number(value[0]).toLocaleString(undefined, { maximumFractionDigits: 0 })} – $${Number(value[1]).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name];
                    }
                    return [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name];
                  }}
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: 12 }}
                />
                <Area dataKey="band" name="5th-95th pct." fill="var(--color-accent)" fillOpacity={0.1} stroke="none" />
                <Area dataKey="midBand" name="25th-75th pct." fill="var(--color-accent)" fillOpacity={0.22} stroke="none" />
                <Line dataKey="median" name="Median" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function brefName(b: ClientBrief): string {
  return b.client;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted/70">{label}</p>
      <p className={`mt-1 font-mono text-lg ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
