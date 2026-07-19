// Shared types with no Node.js dependencies — safe to import from both
// server and client components.

export type Holding = {
  id: string;
  name: string;
  ticker: string | null;
  country: string;
  region: string;
  sector: string;
  marketValueUSD: number;
  ownershipPct: number;
  portfolioPct: number;
  isFTSE100: boolean;
};

export type HoldingsData = {
  asOfDate: string;
  isMockData: boolean;
  dataLabel: string;
  source: string;
  currency: string;
  totalPortfolioValueUSD: number;
  companyCount: number;
  generatedAt: string;
  holdings: Holding[];
};

export type GroupTotal = {
  key: string;
  totalValueUSD: number;
  portfolioPct: number;
  count: number;
};
