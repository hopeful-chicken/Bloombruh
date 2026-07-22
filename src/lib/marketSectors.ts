// Registry of the public equity sectors shown in the Markets Overview
// module — same "small config list" pattern as centralBanks.ts. Each
// sector is tracked via a real, liquid sector ETF as a proxy for "how is
// this part of the market doing" (there's no free API that hands back a
// single clean "TMT sector return" number, but a widely-used SPDR sector
// ETF's price is real, free, and a reasonable stand-in). Adding a sector
// later is just adding an entry here — the picker, chart, and AI
// narrative all key off this list.

export type MarketSectorId =
  | "global-equities"
  | "tmt"
  | "fig"
  | "healthcare"
  | "energy"
  | "industrials"
  | "consumer";

export type MarketSector = {
  id: MarketSectorId;
  label: string;
  shortLabel: string;
  /** Twelve Data symbol used as the price/return proxy for this sector. */
  tickerSymbol: string;
  /** What that ticker actually is, shown so a reader knows this is a real,
   * named, tradable fund, not an invented "sector index". */
  proxyName: string;
  /** Google News search query used to ground the AI narrative and news list. */
  newsQuery: string;
  /** One-line, static description of what this sector covers. */
  blurb: string;
};

export const MARKET_SECTORS: MarketSector[] = [
  {
    id: "global-equities",
    label: "Global Equities",
    shortLabel: "Global Equities",
    tickerSymbol: "SPY",
    proxyName: "SPDR S&P 500 ETF Trust (SPY)",
    newsQuery: "global stock market equities outlook",
    blurb: "The broad US large-cap market, used here as a stand-in for global equity sentiment.",
  },
  {
    id: "tmt",
    label: "Technology, Media & Telecom",
    shortLabel: "TMT",
    tickerSymbol: "XLK",
    proxyName: "Technology Select Sector SPDR Fund (XLK)",
    newsQuery: "technology media telecom stocks sector",
    blurb: "Software, hardware, semiconductors, media, and telecom companies.",
  },
  {
    id: "fig",
    label: "Financial Institutions",
    shortLabel: "FIG",
    tickerSymbol: "XLF",
    proxyName: "Financial Select Sector SPDR Fund (XLF)",
    newsQuery: "banks financial institutions stocks sector",
    blurb: "Banks, insurers, asset managers, and other financial institutions.",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    shortLabel: "Healthcare",
    tickerSymbol: "XLV",
    proxyName: "Health Care Select Sector SPDR Fund (XLV)",
    newsQuery: "healthcare pharma biotech stocks sector",
    blurb: "Pharma, biotech, medical devices, and healthcare providers.",
  },
  {
    id: "energy",
    label: "Energy",
    shortLabel: "Energy",
    tickerSymbol: "XLE",
    proxyName: "Energy Select Sector SPDR Fund (XLE)",
    newsQuery: "energy oil gas stocks sector",
    blurb: "Oil, gas, and energy-producing and servicing companies.",
  },
  {
    id: "industrials",
    label: "Industrials",
    shortLabel: "Industrials",
    tickerSymbol: "XLI",
    proxyName: "Industrial Select Sector SPDR Fund (XLI)",
    newsQuery: "industrials manufacturing stocks sector",
    blurb: "Manufacturing, aerospace & defense, transport, and machinery companies.",
  },
  {
    id: "consumer",
    label: "Consumer",
    shortLabel: "Consumer",
    tickerSymbol: "XLY",
    proxyName: "Consumer Discretionary Select Sector SPDR Fund (XLY)",
    newsQuery: "consumer retail spending stocks sector",
    blurb: "Retail, e-commerce, autos, leisure, and other consumer-facing companies.",
  },
];

export function getMarketSector(id: string): MarketSector | undefined {
  return MARKET_SECTORS.find((s) => s.id === id);
}
