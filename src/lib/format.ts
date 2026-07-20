// Shared formatting helpers — pure functions, no dependencies, safe to
// import from both server and client components.

/** Formats a USD value into a compact string, e.g. $38.4bn, $920m, $4.20. */
export function formatUSD(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}tn`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}bn`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}m`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}k`;
  return `$${value.toFixed(2)}`;
}

/** Formats a plain number with commas, e.g. 1,234,567. */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/** Formats a fraction (0.0123) or already-percent number as "+1.23%" / "-1.23%". */
export function formatPct(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}
