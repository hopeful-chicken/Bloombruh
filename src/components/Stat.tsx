// Small read-only "value + label" card used anywhere raw data is displayed
// as a plain stat grid — Company Profile, the Pitch Builder's always-visible
// data dashboard, etc. Kept as a single shared component so all of those
// grids look and behave identically.

export default function Stat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  /** Small line shown under the label — used for the original, pre-USD-
   * conversion figure on companies that report in another currency (e.g.
   * "Converted from CAD C$1.2bn"). Omitted entirely when not needed. */
  caption?: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-mono text-lg font-semibold text-accent sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
      {caption && <p className="mt-0.5 text-[10px] text-muted/70">{caption}</p>}
    </div>
  );
}
