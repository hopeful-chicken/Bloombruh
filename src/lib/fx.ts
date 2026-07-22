// Server-only wrapper around the Frankfurter API (https://api.frankfurter.dev)
// — a free, no-key currency exchange rate service built on the European
// Central Bank's published daily rates. Used to convert non-US companies'
// financial statements (reported in their home currency, e.g. CAD, EUR) into
// USD so they can be compared like-for-like with US companies on this site.
//
// Kept deliberately simple: this looks up one current rate per company and
// applies it across that company's whole fundamentals history, rather than
// a different historical rate for every fiscal year — accurate enough for
// a student research tool, not meant to be forensically precise.

const BASE_URL = "https://api.frankfurter.dev/v1";

/** Looks up the exchange rate to convert 1 unit of `from` into `to`.
 * Returns null if the lookup fails (e.g. an unsupported currency code) —
 * callers should fall back to showing the original currency, unconverted. */
export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;
  try {
    const url = `${BASE_URL}/latest?base=${from}&symbols=${to}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    return data.rates?.[to] ?? null;
  } catch {
    return null;
  }
}
