// Small read-only "value + label" card used anywhere raw data is displayed
// as a plain stat grid — Company Profile, the Pitch Builder's always-visible
// data dashboard, etc. Kept as a single shared component so all of those
// grids look and behave identically.

export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-mono text-lg font-semibold text-accent sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
