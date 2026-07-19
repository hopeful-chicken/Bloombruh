// src/lib/holdings.ts
//
// Server-side helper for reading the processed holdings data (currently
// MOCK DATA — see /scripts/README.md). This file is read once at build/
// request time and cached in memory, so every page/component that needs
// holdings data goes through here rather than re-reading the file.

import { readFileSync } from "fs";
import { join } from "path";

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

let cached: HoldingsData | null = null;

/** Reads and parses public/data/holdings.json, caching the result in memory. */
export function getHoldingsData(): HoldingsData {
  if (cached) return cached;
  const filePath = join(process.cwd(), "public/data/holdings.json");
  const raw = readFileSync(filePath, "utf-8");
  cached = JSON.parse(raw) as HoldingsData;
  return cached;
}

/** Simple case-insensitive substring search over company name and ticker. */
export function searchHoldings(query: string, limit = 10): Holding[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { holdings } = getHoldingsData();

  return holdings
    .map((h) => {
      const nameLower = h.name.toLowerCase();
      const tickerLower = h.ticker?.toLowerCase() ?? "";
      let score = -1;
      if (nameLower === q || tickerLower === q) score = 100;
      else if (nameLower.startsWith(q)) score = 80;
      else if (tickerLower.startsWith(q)) score = 70;
      else if (nameLower.includes(q)) score = 50;
      else if (tickerLower.includes(q)) score = 40;
      return { h, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.h.marketValueUSD - a.h.marketValueUSD)
    .slice(0, limit)
    .map((x) => x.h);
}

export function getHoldingById(id: string): Holding | undefined {
  return getHoldingsData().holdings.find((h) => h.id === id);
}

export function getTopHoldings(n: number): Holding[] {
  return getHoldingsData().holdings.slice(0, n);
}

export type GroupTotal = { key: string; totalValueUSD: number; portfolioPct: number; count: number };

function groupBy(holdings: Holding[], keyFn: (h: Holding) => string, total: number): GroupTotal[] {
  const map = new Map<string, { totalValueUSD: number; count: number }>();
  for (const h of holdings) {
    const key = keyFn(h);
    const entry = map.get(key) ?? { totalValueUSD: 0, count: 0 };
    entry.totalValueUSD += h.marketValueUSD;
    entry.count += 1;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({
      key,
      totalValueUSD: v.totalValueUSD,
      portfolioPct: (v.totalValueUSD / total) * 100,
      count: v.count,
    }))
    .sort((a, b) => b.totalValueUSD - a.totalValueUSD);
}

export function groupByRegion(): GroupTotal[] {
  const { holdings, totalPortfolioValueUSD } = getHoldingsData();
  return groupBy(holdings, (h) => h.region, totalPortfolioValueUSD);
}

export function groupBySector(): GroupTotal[] {
  const { holdings, totalPortfolioValueUSD } = getHoldingsData();
  return groupBy(holdings, (h) => h.sector, totalPortfolioValueUSD);
}

export function groupByCountry(): GroupTotal[] {
  const { holdings, totalPortfolioValueUSD } = getHoldingsData();
  return groupBy(holdings, (h) => h.country, totalPortfolioValueUSD);
}

export function getHoldingsByCountry(country: string): Holding[] {
  return getHoldingsData()
    .holdings.filter((h) => h.country === country)
    .sort((a, b) => b.marketValueUSD - a.marketValueUSD);
}

export function getFTSE100Holdings(): Holding[] {
  return getHoldingsData()
    .holdings.filter((h) => h.isFTSE100)
    .sort((a, b) => b.marketValueUSD - a.marketValueUSD);
}

/** Formats a USD value into a compact string, e.g. $38.4bn, $920m. */
export function formatUSD(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}tn`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}bn`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}m`;
  return `$${value.toLocaleString()}`;
}
