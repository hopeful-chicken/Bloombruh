"use client";

// The Valuation Desk — the IB / equity-research seat in the Simulation
// Room. The job being practiced: produce a quick, DEFENSIBLE valuation
// range under time pressure, the way an analyst does before a call —
// then survive the desk head's first three questions (the grill).
//
// What makes this a simulation and not a calculator:
//   1. A time budget forces real research triage (you cannot afford every
//      check before you build — same as the real job).
//   2. The grill runs the same defensibility checks a desk head runs —
//      terminal smuggling, terminal dependence, growth/margin honesty —
//      and a weak build gets sent back regardless of where the number
//      lands. The consequence is the review, not the arithmetic.
//   3. The reverse-DCF tells you what the market already believes, so the
//      verdict is about YOUR gap vs. what's priced in — the actual
//      question a pitch answers.
//
// All data is real, dated, and sourced (see src/data/valuationDesk.ts);
// the layout banner says the same to the reader.

import { useState } from "react";
import {
  VALUATION_CASES,
  runDcf,
  solveImpliedGrowth,
  compsImpliedValue,
  runGrill,
  deskVerdict,
  type ValuationCase,
  type Levers,
} from "@/data/valuationDesk";

const MINUTES_BUDGET = 5;

// ---------------------------------------------------------------------------
// Small formatting helpers — numbers always in Geist Mono, per site style.
// ---------------------------------------------------------------------------

function fmtPrice(c: ValuationCase, v: number): string {
  if (c.priceUnitLabel === "pence") return `${Math.round(v).toLocaleString()}p`;
  return `$${v.toFixed(2)}`;
}
function fmtPct(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}
// Millions figures (the build table) carry the case's own currency symbol —
// Diploma's financials are £m, the US cases are $m.
function fmtM(v: number, symbol = "$"): string {
  return `${v >= 0 ? "" : "−"}${Math.abs(v) >= 1000 ? `${symbol}${(v / 1000).toFixed(1)}bn` : `${symbol}${Math.abs(v).toFixed(0)}m`}`;
}

export default function ValuationDesk() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [bought, setBought] = useState<string[]>([]);
  const [levers, setLevers] = useState<Levers | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const activeCase = VALUATION_CASES.find((c) => c.id === caseId) ?? null;
  const minutesLeft = MINUTES_BUDGET - bought.reduce(
    (sum, id) => sum + (activeCase?.researchActions.find((a) => a.id === id)?.costMinutes ?? 0),
    0
  );

  function pickCase(c: ValuationCase) {
    setCaseId(c.id);
    setBought([]);
    setSubmitted(false);
    setLevers({
      y1Growth: c.recentGrowth,
      // Turnaround cases start the margin lever at a modest-recovery anchor
      // (the case IS the recovery — starting at today's negative margin
      // would just model liquidation); compounders start at today's actual.
      exitMargin: c.thirdCheck.kind === "marginRealism" ? c.baseExitMargin : c.ebitMargin0,
      wacc: c.riskFree + 1.0 * c.erp, // generic β=1.0 until you check the real beta
      terminalGrowth: 0.025,
    });
  }

  function buy(actionId: string) {
    if (!activeCase) return;
    const action = activeCase.researchActions.find((a) => a.id === actionId);
    if (!action || bought.includes(actionId)) return;
    if (action.costMinutes > minutesLeft) return;
    setBought([...bought, actionId]);
  }

  const has = (id: string) => bought.includes(id);

  // Live model outputs — recomputed on every render, exactly like a real
  // spreadsheet recalculates on every edit. All of this is cheap (a 5-year
  // DCF plus a 60-iteration bisection), so plain render-time computation
  // beats clever memoization: simpler code, always correct.
  const dcf = activeCase && levers ? runDcf(activeCase, levers) : null;
  const compsValue =
    activeCase && levers && has("comps") ? compsImpliedValue(activeCase, levers) : null;
  const impliedGrowth =
    activeCase && levers ? solveImpliedGrowth(activeCase, levers.wacc, levers.terminalGrowth) : null;
  const grill = activeCase && levers && dcf && submitted ? runGrill(activeCase, levers, dcf) : null;
  const verdict =
    activeCase && grill && dcf && levers
      ? deskVerdict(activeCase, grill, dcf.perShare, impliedGrowth, levers.y1Growth)
      : null;

  const capmWithRealBeta = activeCase ? activeCase.riskFree + activeCase.deskBeta * activeCase.erp : null;

  // -------------------------------------------------------------------------
  // STEP 0 — pick your brief
  // -------------------------------------------------------------------------
  if (!activeCase || !levers) {
    return (
      <div className="rounded-sm border border-border bg-surface/40 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {VALUATION_CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => pickCase(c)}
              className="rounded-lg border border-border bg-background/40 p-4 text-left hover:border-accent"
            >
              <p className="font-display text-base font-semibold text-foreground">{c.company}</p>
              <p className="font-mono text-[11px] text-muted">{c.ticker}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{c.question}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Steps 1–3 — brief, build, grill
  // -------------------------------------------------------------------------
  const gapVsPrice = dcf ? dcf.perShare / activeCase.priceNow - 1 : 0;

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-5">
      {/* Header + case switcher */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            {activeCase.company} <span className="font-mono text-xs font-normal text-muted">{activeCase.ticker}</span>
          </p>
        </div>
        <button
          onClick={() => setCaseId(null)}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:border-accent hover:text-foreground"
        >
          ← All briefs
        </button>
      </div>

      {/* The brief */}
      <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
        <p className="text-[10px] uppercase tracking-widest text-accent">The brief</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{activeCase.brief}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{activeCase.currencyNote}</p>
      </div>

      {/* Data pack */}
      <p className="mt-5 text-[10px] uppercase tracking-widest text-muted/70">
        Data pack — real figures, dated &amp; sourced
      </p>
      <div className="mt-2 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <tbody>
            {activeCase.dataPack.map((row) => (
              <tr key={row.label} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 text-muted whitespace-nowrap">{row.label}</td>
                <td className="px-3 py-2 font-mono text-foreground whitespace-nowrap">{row.value}</td>
                <td className="px-3 py-2 text-muted/70">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Research triage */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted/70">
            Prep — you can&apos;t afford everything
          </p>
          <p className="font-mono text-xs text-accent">
            {minutesLeft} of {MINUTES_BUDGET} min left
          </p>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {activeCase.researchActions.map((a) => {
            const owned = has(a.id);
            const affordable = a.costMinutes <= minutesLeft;
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-3 ${
                  owned ? "border-accent/50 bg-accent/5" : "border-border bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">{a.label}</p>
                  {owned ? (
                    <span className="font-mono text-[10px] text-accent">done</span>
                  ) : (
                    <button
                      onClick={() => buy(a.id)}
                      disabled={!affordable}
                      className="rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted hover:border-accent hover:text-foreground disabled:opacity-40"
                    >
                      {a.costMinutes} min
                    </button>
                  )}
                </div>
                {owned && <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{a.reveals}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Build */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="text-[10px] uppercase tracking-widest text-muted/70">Build your range</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <LeverSlider
            label="Year-1 revenue growth"
            value={levers.y1Growth}
            min={activeCase.sliderRanges.y1Growth[0]}
            max={activeCase.sliderRanges.y1Growth[1]}
            step={0.005}
            format={(v) => fmtPct(v)}
            marker={
              has("guidance") && activeCase.guidedGrowth !== null
                ? { at: activeCase.guidedGrowth, label: `guided ${fmtPct(activeCase.guidedGrowth, 0)}` }
                : { at: activeCase.recentGrowth, label: `latest actual ${fmtPct(activeCase.recentGrowth, 0)}` }
            }
            markerAt={
              has("guidance") && activeCase.guidedGrowth !== null
                ? activeCase.guidedGrowth
                : activeCase.recentGrowth
            }
            onChange={(v) => setLevers({ ...levers, y1Growth: v })}
          />
          <LeverSlider
            label="Exit operating margin (year 5)"
            value={levers.exitMargin}
            min={activeCase.sliderRanges.exitMargin[0]}
            max={activeCase.sliderRanges.exitMargin[1]}
            step={0.005}
            format={(v) => fmtPct(v)}
            marker={{
              at: activeCase.ebitMargin0,
              label: `today ${fmtPct(activeCase.ebitMargin0)}`,
            }}
            markerAt={activeCase.ebitMargin0}
            onChange={(v) => setLevers({ ...levers, exitMargin: v })}
          />
          <LeverSlider
            label="WACC"
            value={levers.wacc}
            min={0.06}
            max={0.16}
            step={0.0025}
            format={(v) => fmtPct(v)}
            onChange={(v) => setLevers({ ...levers, wacc: v })}
          />
          <LeverSlider
            label="Terminal growth"
            value={levers.terminalGrowth}
            min={0}
            max={0.04}
            step={0.0025}
            format={(v) => fmtPct(v)}
            onChange={(v) => setLevers({ ...levers, terminalGrowth: v })}
          />
        </div>

        {has("beta") && capmWithRealBeta !== null && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2">
            <p className="text-[11px] text-muted">
              CAPM with the desk&apos;s real beta ({activeCase.deskBeta}): {fmtPct(activeCase.riskFree)} +{" "}
              {activeCase.deskBeta} × {fmtPct(activeCase.erp, 0)} ={" "}
              <span className="font-mono text-foreground">{fmtPct(capmWithRealBeta)}</span>
            </p>
            <button
              onClick={() => setLevers({ ...levers, wacc: capmWithRealBeta })}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-accent hover:border-accent"
            >
              apply
            </button>
          </div>
        )}

        {/* Live readout */}
        {dcf && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Your value / share" value={fmtPrice(activeCase, dcf.perShare)} strong />
            <Stat label="Today's price" value={fmtPrice(activeCase, activeCase.priceNow)} />
            <Stat
              label="Gap vs price"
              value={`${gapVsPrice >= 0 ? "+" : ""}${fmtPct(gapVsPrice, 0)}`}
              tone={gapVsPrice >= 0 ? "pos" : "neg"}
            />
            <Stat
              label="Comps-implied"
              value={compsValue !== null ? fmtPrice(activeCase, compsValue) : "—"}
              note={compsValue === null ? "pull the comp sheet" : undefined}
            />
          </div>
        )}

        {/* Football field */}
        {dcf && (
          <FootballField
            c={activeCase}
            dcfValue={dcf.perShare}
            compsValue={compsValue}
            price={activeCase.priceNow}
          />
        )}

        {/* The model, transparent */}
        {dcf && (
          <details className="mt-4 rounded-lg border border-border bg-background/40 px-3 py-2">
            <summary className="cursor-pointer text-xs text-muted hover:text-foreground">
              Show the 7-year build (what the desk sees if they open your model)
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full font-mono text-[11px]">
                <thead>
                  <tr className="text-muted/70">
                    <td className="py-1 pr-3"></td>
                    {dcf.fcfPath.map((y) => (
                      <td key={y.year} className="py-1 pr-3 text-right">Y{y.year}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-muted">
                    <td className="py-0.5 pr-3">Revenue</td>
                    {dcf.fcfPath.map((y) => (
                      <td key={y.year} className="py-0.5 pr-3 text-right">{fmtM(y.revenue, activeCase.currencySymbol)}</td>
                    ))}
                  </tr>
                  <tr className="text-muted">
                    <td className="py-0.5 pr-3">EBIT</td>
                    {dcf.fcfPath.map((y) => (
                      <td key={y.year} className="py-0.5 pr-3 text-right">{fmtM(y.ebit, activeCase.currencySymbol)}</td>
                    ))}
                  </tr>
                  <tr className="text-foreground">
                    <td className="py-0.5 pr-3">Unlevered FCF</td>
                    {dcf.fcfPath.map((y) => (
                      <td key={y.year} className="py-0.5 pr-3 text-right">{fmtM(y.fcf, activeCase.currencySymbol)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 font-mono text-[11px] text-muted">
                EV {fmtM(dcf.enterpriseValue, activeCase.currencySymbol)} = PV(FCF) {fmtM(dcf.pvOfFcf, activeCase.currencySymbol)} + PV(TV) {fmtM(dcf.pvOfTv, activeCase.currencySymbol)}
                {" "}· less net debt {fmtM(activeCase.netDebt, activeCase.currencySymbol)} → equity {fmtM(dcf.equityValue, activeCase.currencySymbol)} ÷ {activeCase.sharesM} sh
              </p>
            </div>
          </details>
        )}

        {/* Submit to the grill */}
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Send it to the desk head
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(false)}
            className="mt-5 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
          >
            ← Rework the build
          </button>
        )}
      </div>

      {/* The grill */}
      {submitted && grill && verdict && dcf && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-[10px] uppercase tracking-widest text-muted/70">
            The grill — the desk head&apos;s first three questions
          </p>
          <div className="mt-3 space-y-2">
            {grill.map((check) => (
              <div
                key={check.name}
                className={`rounded-lg border p-3 ${
                  check.status === "fail"
                    ? "border-[var(--color-negative)]/50 bg-[var(--color-negative)]/5"
                    : check.status === "warn"
                      ? "border-accent/50 bg-accent/5"
                      : "border-border bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground">{check.name}</p>
                  <span
                    className={`font-mono text-[10px] uppercase ${
                      check.status === "fail"
                        ? "text-[var(--color-negative)]"
                        : check.status === "warn"
                          ? "text-accent"
                          : "text-[var(--color-positive)]"
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{check.text}</p>
              </div>
            ))}
          </div>

          {/* Market expectations — the reverse-DCF table */}
          <p className="mt-5 text-[10px] uppercase tracking-widest text-muted/70">
            What the price already believes (reverse DCF at your WACC)
          </p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-background/60 text-muted/70">
                  <td className="px-3 py-2">Metric</td>
                  <td className="px-3 py-2 text-right">Latest / guided</td>
                  <td className="px-3 py-2 text-right">Implied by price</td>
                  <td className="px-3 py-2 text-right">Yours</td>
                  <td className="px-3 py-2 text-right">Gap</td>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="px-3 py-2 font-sans text-muted">Year-1 growth</td>
                  <td className="px-3 py-2 text-right">
                    {fmtPct(
                      has("guidance") && activeCase.guidedGrowth !== null
                        ? activeCase.guidedGrowth
                        : activeCase.recentGrowth
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {impliedGrowth !== null ? fmtPct(impliedGrowth) : "> model max"}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground">{fmtPct(levers.y1Growth)}</td>
                  <td
                    className={`px-3 py-2 text-right ${
                      impliedGrowth !== null && levers.y1Growth < impliedGrowth
                        ? "text-[var(--color-negative)]"
                        : "text-[var(--color-positive)]"
                    }`}
                  >
                    {impliedGrowth !== null
                      ? `${levers.y1Growth - impliedGrowth >= 0 ? "+" : ""}${fmtPct(levers.y1Growth - impliedGrowth)}`
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-sans text-muted">Exit margin</td>
                  <td className="px-3 py-2 text-right">{fmtPct(activeCase.ebitMargin0)}</td>
                  <td className="px-3 py-2 text-right text-muted/60">held at {fmtPct(activeCase.baseExitMargin, 0)}</td>
                  <td className="px-3 py-2 text-right text-foreground">{fmtPct(levers.exitMargin)}</td>
                  <td className="px-3 py-2 text-right text-muted/60">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          {impliedGrowth === null && (
            <p className="mt-2 text-[11px] text-muted">
              The price implies more growth than the model can even express at your discount rate —
              on a real desk, that un-payable expectation is itself the finding.
            </p>
          )}

          {/* The verdict */}
          <div
            className={`mt-4 rounded-lg border p-4 ${
              verdict.tier === "fail"
                ? "border-[var(--color-negative)]/50 bg-[var(--color-negative)]/5"
                : verdict.tier === "warn"
                  ? "border-accent/50 bg-accent/5"
                  : "border-[var(--color-positive)]/50 bg-[var(--color-positive)]/5"
            }`}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted/70">Desk head&apos;s review</p>
            <p className="mt-1 font-display text-base font-semibold text-foreground">{verdict.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{verdict.body}</p>
            <p className="mt-3 border-t border-border/60 pt-2 text-xs italic text-muted">
              {activeCase.verdictContext}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

function Stat({
  label,
  value,
  strong,
  tone,
  note,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "pos" | "neg";
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted/70">{label}</p>
      <p
        className={`mt-1 font-mono ${strong ? "text-lg" : "text-sm"} ${
          tone === "pos"
            ? "text-[var(--color-positive)]"
            : tone === "neg"
              ? "text-[var(--color-negative)]"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-0.5 text-[10px] text-muted/60">{note}</p>}
    </div>
  );
}

function LeverSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  marker,
  markerAt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  marker?: { at: number; label: string };
  markerAt?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted">{label}</label>
        <span className="font-mono text-xs text-accent">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-accent"
      />
      {marker && markerAt !== undefined && (
        <p className="mt-0.5 text-[10px] text-muted/70">
          marker: <span className="font-mono">{marker.label}</span>
        </p>
      )}
    </div>
  );
}

// A valuation football field, drawn with plain divs (no chart library —
// three bars and a price line don't need one). Scale is fitted to whatever
// legs are visible, with the current price always shown as the vertical
// marker line a real desk draws first.
function FootballField({
  c,
  dcfValue,
  compsValue,
  price,
}: {
  c: ValuationCase;
  dcfValue: number;
  compsValue: number | null;
  price: number;
}) {
  const values = [dcfValue, price, ...(compsValue !== null ? [compsValue] : [])];
  const lo = Math.min(...values) * 0.75;
  const hi = Math.max(...values) * 1.25;
  const span = hi - lo;
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / span) * 100))}%`;

  const legs = [
    { label: "Your DCF", value: dcfValue, color: "var(--color-accent)" },
    ...(compsValue !== null
      ? [{ label: `Comps (${c.compMetric})`, value: compsValue, color: "var(--color-module-macro)" }]
      : []),
  ];

  return (
    <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted/70">Football field</p>
      <div className="relative mt-3 space-y-3 pb-5">
        {legs.map((leg) => (
          <div key={leg.label} className="relative">
            <p className="text-[11px] text-muted">
              {leg.label}: <span className="font-mono text-foreground">{fmtPrice(c, leg.value)}</span>
            </p>
            <div className="relative mt-1 h-3 w-full rounded bg-surface">
              <div
                className="absolute top-0 h-3 rounded"
                style={{ left: 0, width: pos(leg.value), background: leg.color, opacity: 0.75 }}
              />
            </div>
          </div>
        ))}
        {/* the price line, spanning every bar */}
        <div
          className="absolute top-6 bottom-0 w-px"
          style={{ left: pos(price), background: "var(--color-foreground)" }}
        />
        <p
          className="absolute bottom-0 -translate-x-1/2 font-mono text-[10px] text-foreground"
          style={{ left: pos(price) }}
        >
          price {fmtPrice(c, price)}
        </p>
      </div>
    </div>
  );
}
