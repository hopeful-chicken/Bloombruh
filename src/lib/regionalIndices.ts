// For each central bank, a well-known equity index (or the closest free
// proxy) for the economy it governs — so the Central Bank Room can chart
// the region's stock market alongside its policy rate and let a reader see
// for themselves whether, and how, the two move together.
//
// Every symbol here is a US-listed ETF, confirmed working on this site's
// Twelve Data plan before being added (same "verify before building" rule
// as the rest of the project). Two of them (SPY, FEZ) genuinely track the
// named index (S&P 500, Euro Stoxx 50). The rest are broad single-country
// equity ETFs (iShares MSCI UK/Japan/Switzerland/Australia/Canada, iShares
// China Large-Cap) — the closest free stand-in for that country's market,
// NOT the exact famous index (FTSE 100, Nikkei 225, etc.), which have no
// free US-listed tracker. `isExactIndex` records which is which, and the
// UI labels proxies honestly rather than implying they're the real index.

import type { CentralBankId } from "./centralBanks";

export type RegionalIndex = {
  bankId: CentralBankId;
  /** The famous index this represents or approximates. */
  indexName: string;
  /** The tradable ETF actually charted. */
  proxySymbol: string;
  proxyName: string;
  /** True when the ETF tracks the named index directly (S&P 500, Euro
   * Stoxx 50); false when it's a broad-country proxy for it. */
  isExactIndex: boolean;
};

export const REGIONAL_INDICES: Record<CentralBankId, RegionalIndex> = {
  fed: {
    bankId: "fed",
    indexName: "S&P 500",
    proxySymbol: "SPY",
    proxyName: "SPDR S&P 500 ETF Trust (SPY)",
    isExactIndex: true,
  },
  ecb: {
    bankId: "ecb",
    indexName: "Euro Stoxx 50",
    proxySymbol: "FEZ",
    proxyName: "SPDR Euro Stoxx 50 ETF (FEZ)",
    isExactIndex: true,
  },
  boe: {
    bankId: "boe",
    indexName: "UK equities (≈ FTSE 100)",
    proxySymbol: "EWU",
    proxyName: "iShares MSCI United Kingdom ETF (EWU)",
    isExactIndex: false,
  },
  boj: {
    bankId: "boj",
    indexName: "Japanese equities (≈ Nikkei 225 / TOPIX)",
    proxySymbol: "EWJ",
    proxyName: "iShares MSCI Japan ETF (EWJ)",
    isExactIndex: false,
  },
  pboc: {
    bankId: "pboc",
    indexName: "Chinese large-caps (≈ FTSE China 50)",
    proxySymbol: "FXI",
    proxyName: "iShares China Large-Cap ETF (FXI)",
    isExactIndex: false,
  },
  snb: {
    bankId: "snb",
    indexName: "Swiss equities (≈ SMI)",
    proxySymbol: "EWL",
    proxyName: "iShares MSCI Switzerland ETF (EWL)",
    isExactIndex: false,
  },
  rba: {
    bankId: "rba",
    indexName: "Australian equities (≈ ASX 200)",
    proxySymbol: "EWA",
    proxyName: "iShares MSCI Australia ETF (EWA)",
    isExactIndex: false,
  },
  boc: {
    bankId: "boc",
    indexName: "Canadian equities (≈ S&P/TSX 60)",
    proxySymbol: "EWC",
    proxyName: "iShares MSCI Canada ETF (EWC)",
    isExactIndex: false,
  },
};

export function getRegionalIndex(bankId: CentralBankId): RegionalIndex {
  return REGIONAL_INDICES[bankId];
}
