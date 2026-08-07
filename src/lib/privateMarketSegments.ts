// Registry of private-market segments shown in the Markets Overview module.
// There is no free API that publishes actual private-fund NAVs or returns
// (PitchBook/Preqin-style data is paid, subscription-only), so each segment
// is tracked via a real, listed public proxy instead — a fund or basket of
// companies whose business is that private-market activity, even though its
// own shares trade publicly. This is a deliberate approximation, not the
// real thing, and every place this registry is used must show
// `proxyDisclaimer` next to the data so a reader never mistakes a proxy's
// stock-price return for an actual PE/credit fund's return.

export type PrivateMarketId = "private-equity" | "private-credit" | "real-assets";

export type PrivateMarketSegment = {
  id: PrivateMarketId;
  label: string;
  tickerSymbol: string;
  proxyName: string;
  newsQuery: string;
  blurb: string;
};

export const PRIVATE_MARKET_SEGMENTS: PrivateMarketSegment[] = [
  {
    id: "private-equity",
    label: "Private Equity",
    tickerSymbol: "PSP",
    proxyName: "Invesco Global Listed Private Equity ETF (PSP)",
    newsQuery: "private equity buyout firms dealmaking",
    blurb: "Tracks a basket of publicly listed private-equity firms and vehicles, not actual fund NAVs.",
  },
  {
    id: "private-credit",
    label: "Private Credit",
    tickerSymbol: "BIZD",
    proxyName: "VanEck BDC Income ETF (BIZD)",
    newsQuery: "private credit direct lending business development companies",
    blurb: "Tracks listed business development companies (BDCs), the closest public stand-in for direct lending.",
  },
  {
    id: "real-assets",
    label: "Real Estate & Infrastructure",
    tickerSymbol: "VNQ",
    proxyName: "Vanguard Real Estate ETF (VNQ)",
    newsQuery: "real estate infrastructure private markets investment",
    blurb: "Tracks listed US REITs, used as a proxy for private real estate and infrastructure sentiment.",
  },
];

export const PRIVATE_MARKET_PROXY_DISCLAIMER =
  "These are real, listed public-market ETFs used as stand-ins for private-market activity, not actual private-fund NAVs or returns, which are not published anywhere free. Treat the price moves below as sentiment, not as a private fund's actual performance.";

export function getPrivateMarketSegment(id: string): PrivateMarketSegment | undefined {
  return PRIVATE_MARKET_SEGMENTS.find((s) => s.id === id);
}
