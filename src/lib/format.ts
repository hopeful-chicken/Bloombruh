// Shared formatting helpers — pure functions, no dependencies, safe to
// import from both server and client components.

/** Formats a USD value into a compact string, e.g. $38.4bn, $920m, $4.20,
 * -$20.6bn. Magnitude checks use the absolute value — without that, a
 * negative net debt (very common for cash-rich companies) or negative FCF
 * fell through every bn/m/k threshold and rendered as a raw
 * "$-20612040200.00" instead of "-$20.6bn" (found while verifying the SEC
 * EDGAR forms-filter fix on Alibaba, which has more cash than debt). */
export function formatUSD(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}tn`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}bn`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}m`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(2)}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  CAD: "C$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CHF: "CHF ",
  HKD: "HK$",
  CNY: "¥",
};

/** Same compact style as formatUSD, but for a non-USD currency — used to
 * show the original, pre-conversion figure for companies whose SEC filings
 * report in their home currency rather than USD (see src/lib/fx.ts). */
export function formatOriginalCurrency(value: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${symbol}${(value / 1e12).toFixed(2)}tn`;
  if (abs >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}bn`;
  if (abs >= 1e6) return `${symbol}${(value / 1e6).toFixed(0)}m`;
  if (abs >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}k`;
  return `${symbol}${value.toFixed(2)}`;
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
