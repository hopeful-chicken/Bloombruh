// Ticker -> company domain, for showing a small logo next to a company
// name (Company Profile header, search results). Deliberately the
// lightweight version: no offline scraper pipeline, no locally-stored
// asset files to maintain — just a small curated map plus Google's public
// favicon proxy (https://www.google.com/s2/favicons), fetched live at
// render time the same way a browser's own "tab icon" works. A missing
// ticker just renders no logo (initials fallback) rather than a broken
// image; there's nothing to keep in sync with a build step.

const TICKER_DOMAINS: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  GOOG: "google.com",
  AMZN: "amazon.com",
  META: "meta.com",
  TSLA: "tesla.com",
  NVDA: "nvidia.com",
  NFLX: "netflix.com",
  INTC: "intel.com",
  AMD: "amd.com",
  IBM: "ibm.com",
  ORCL: "oracle.com",
  CRM: "salesforce.com",
  ADBE: "adobe.com",
  CSCO: "cisco.com",
  PYPL: "paypal.com",
  UBER: "uber.com",
  ABNB: "airbnb.com",
  SPOT: "spotify.com",
  SHOP: "shopify.com",
  PLTR: "palantir.com",
  JPM: "jpmorganchase.com",
  GS: "goldmansachs.com",
  MS: "morganstanley.com",
  BAC: "bankofamerica.com",
  WFC: "wellsfargo.com",
  C: "citigroup.com",
  BLK: "blackrock.com",
  V: "visa.com",
  MA: "mastercard.com",
  BTI: "bat.com",
  BA: "boeing.com",
  CAT: "caterpillar.com",
  GE: "ge.com",
  HON: "honeywell.com",
  RTX: "rtx.com",
  LMT: "lockheedmartin.com",
  NOC: "northropgrumman.com",
  GD: "gd.com",
  MMM: "3m.com",
  XOM: "exxonmobil.com",
  CVX: "chevron.com",
  KO: "coca-cola.com",
  PEP: "pepsico.com",
  PG: "pg.com",
  JNJ: "jnj.com",
  PFE: "pfizer.com",
  MRK: "merck.com",
  ABBV: "abbvie.com",
  UNH: "unitedhealthgroup.com",
  WMT: "walmart.com",
  COST: "costco.com",
  TGT: "target.com",
  HD: "homedepot.com",
  LOW: "lowes.com",
  MCD: "mcdonalds.com",
  SBUX: "starbucks.com",
  NKE: "nike.com",
  DIS: "disney.com",
  T: "att.com",
  VZ: "verizon.com",
  UPS: "ups.com",
  FDX: "fedex.com",
  ASML: "asml.com",
  CCJ: "cameco.com",
  "7974.T": "nintendo.co.jp",
  "DPLM.L": "diplomaplc.com",
  "GRG.L": "greggs.co.uk",
  "BA.L": "baesystems.com",
  "BATS.L": "bat.com",
  "MAERSK-B.CO": "maersk.com",
};

/** A logo image URL for a ticker, or null if the ticker isn't in the
 * curated map (renders no logo rather than a broken image). */
export function getLogoUrl(symbol: string, size = 64): string | null {
  const domain = TICKER_DOMAINS[symbol.toUpperCase()];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}
