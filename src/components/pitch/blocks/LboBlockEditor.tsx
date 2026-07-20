"use client";

import type { LboBlockData } from "@/lib/reportBlocks";
import { computeLbo } from "@/lib/dealMath";
import { formatUSD } from "@/lib/format";

const FIELDS: { key: keyof LboBlockData; label: string; suffix?: string }[] = [
  { key: "entryEbitda", label: "Entry EBITDA ($)" },
  { key: "entryMultiple", label: "Entry multiple", suffix: "x" },
  { key: "exitMultiple", label: "Exit multiple", suffix: "x" },
  { key: "leverageMultiple", label: "Leverage (Debt/EBITDA)", suffix: "x" },
  { key: "years", label: "Holding period (years)" },
  { key: "ebitdaGrowthPct", label: "Assumed annual EBITDA growth", suffix: "%" },
  { key: "debtPaydownPct", label: "Debt paid down by exit", suffix: "%" },
];

export default function LboBlockEditor({
  data,
  onChange,
}: {
  data: LboBlockData;
  onChange: (data: LboBlockData) => void;
}) {
  const result = computeLbo(data);

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        A simplified LBO: entry/exit value from EBITDA multiples, debt
        sized off a leverage multiple, EBITDA grown at an assumed rate,
        and debt paid down by a flat assumed percentage over the hold.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="mb-1 block text-muted">{f.label}</span>
            <input
              type="number"
              inputMode="decimal"
              value={data[f.key]}
              onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-accent/30 bg-accent/5 p-3 text-sm">
        {result ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <ResultStat label="Entry equity" value={formatUSD(result.entryEquity)} />
            <ResultStat label="Exit equity" value={formatUSD(result.exitEquity)} />
            <ResultStat label="MOIC" value={`${result.moic.toFixed(2)}x`} />
            <ResultStat label="IRR" value={`${result.irrPct.toFixed(1)}%`} />
            <ResultStat label="Entry EV" value={formatUSD(result.entryEv)} />
            <ResultStat label="Exit EV" value={formatUSD(result.exitEv)} />
          </div>
        ) : (
          <p className="text-xs text-muted">
            Fill in all fields above to see entry/exit equity, MOIC, and IRR.
          </p>
        )}
      </div>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-sm font-semibold text-accent">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
