"use client";

import type { MandaBlockData } from "@/lib/reportBlocks";
import { computeManda } from "@/lib/dealMath";
import { formatUSD, formatPct } from "@/lib/format";

const ACQUIRER_FIELDS: { key: keyof MandaBlockData; label: string }[] = [
  { key: "acquirerNetIncome", label: "Net income ($)" },
  { key: "acquirerShares", label: "Diluted shares outstanding" },
  { key: "acquirerSharePrice", label: "Share price ($)" },
  { key: "acquirerDebt", label: "Total debt ($)" },
  { key: "acquirerEbitda", label: "EBITDA ($)" },
];

const TARGET_FIELDS: { key: keyof MandaBlockData; label: string }[] = [
  { key: "targetNetIncome", label: "Net income ($)" },
  { key: "targetShares", label: "Diluted shares outstanding" },
  { key: "targetStockholdersEquity", label: "Stockholders' equity ($)" },
  { key: "targetDebt", label: "Total debt ($)" },
  { key: "targetEbitda", label: "EBITDA ($)" },
  { key: "targetCurrentPrice", label: "Current share price ($)" },
];

const DEAL_FIELDS: { key: keyof MandaBlockData; label: string; suffix?: string }[] = [
  { key: "offerPricePerShare", label: "Offer price per share ($)" },
  { key: "cashPct", label: "Financed with cash", suffix: "% (rest in stock)" },
  { key: "newDebtRaised", label: "New debt raised ($)" },
  { key: "interestRatePct", label: "Interest rate on new debt", suffix: "%" },
  { key: "taxRatePct", label: "Tax rate", suffix: "%" },
  { key: "synergiesPreTax", label: "Annual run-rate synergies, pre-tax ($)" },
];

function FieldGrid({
  fields,
  data,
  onChange,
}: {
  fields: { key: keyof MandaBlockData; label: string; suffix?: string }[];
  data: MandaBlockData;
  onChange: (data: MandaBlockData) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.key} className="block text-sm">
          <span className="mb-1 block text-muted">
            {f.label}
            {f.suffix && <span className="text-muted/60"> ({f.suffix})</span>}
          </span>
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
  );
}

export default function MandaBlockEditor({
  data,
  onChange,
}: {
  data: MandaBlockData;
  onChange: (data: MandaBlockData) => void;
}) {
  const result = computeManda(data);

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        Enter the acquirer and target&apos;s financials (auto-filled figures
        can be overwritten) plus deal terms, to see the pro-forma EPS
        impact, goodwill, and leverage.
      </p>

      <div className="mb-4">
        <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
          Acquirer
        </span>
        <FieldGrid fields={ACQUIRER_FIELDS} data={data} onChange={onChange} />
      </div>

      <div className="mb-4">
        <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
          Target
        </span>
        <FieldGrid fields={TARGET_FIELDS} data={data} onChange={onChange} />
      </div>

      <div className="mb-4">
        <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
          Deal terms
        </span>
        <FieldGrid fields={DEAL_FIELDS} data={data} onChange={onChange} />
      </div>

      <div className="rounded-md border border-accent/30 bg-accent/5 p-3 text-sm">
        {result ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <ResultStat label="Deal value" value={formatUSD(result.dealValue)} />
            <ResultStat
              label="Premium"
              value={result.premiumPct !== null ? formatPct(result.premiumPct) : "—"}
            />
            <ResultStat
              label="New shares issued"
              value={result.newSharesIssued.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            />
            <ResultStat
              label="Pro-forma EPS"
              value={result.proFormaEps !== null ? `$${result.proFormaEps.toFixed(2)}` : "—"}
            />
            <ResultStat
              label="Accretion / (dilution)"
              value={
                result.accretionDilutionPct !== null
                  ? formatPct(result.accretionDilutionPct)
                  : "—"
              }
            />
            <ResultStat
              label="Goodwill"
              value={result.goodwill !== null ? formatUSD(result.goodwill) : "—"}
            />
            <ResultStat
              label="Pro-forma leverage"
              value={
                result.proFormaLeverage !== null
                  ? `${result.proFormaLeverage.toFixed(1)}x`
                  : "—"
              }
            />
          </div>
        ) : (
          <p className="text-xs text-muted">
            Fill in the acquirer/target shares, offer price, and cash %
            fields above to see deal math.
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
