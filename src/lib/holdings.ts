// src/lib/holdings.ts
//
// Server-side helper for reading the processed holdings data (currently
// MOCK DATA — see /scripts/README.md). This file is read once at build/
// request time and cached in memory, so every page/component that needs
// holdings data goes through here rather than re-reading the file.
//
// NOTE: this file imports Node's `fs`, so it must only be imported from
// server components / route handlers, never from a "use client" component.
// Client components that need to filter/format holdings should import from
// src/lib/search.ts and src/lib/types.ts instead.

import { readFileSync } from "fs";
import { join } from "path";
import type { Holding, HoldingsData, GroupTotal } from "./types";
import { filterHoldings } from "./search";

export type { Holding, HoldingsData, GroupTotal } from "./types";
export { formatUSD } from "./search";

let cached: HoldingsData | null = null;

/** Reads and parses public/data/holdings.json, caching the result in memory. */
export function getHoldingsData(): HoldingsData {
  if (cached) return cached;
  const filePath = join(process.cwd(), "public/data/holdings.json");
  const raw = readFileSync(filePath, "utf-8");
  cached = JSON.parse(raw) as HoldingsData;
  return cached;
}

export function searchHoldings(query: string, limit = 10): Holding[] {
  return filterHoldings(getHoldingsData().holdings, query, limit);
}

export function getHoldingById(id: string): Holding | undefined {
  return getHoldingsData().holdings.find((h) => h.id === id);
}

export function getTopHoldings(n: number): Holding[] {
  return getHoldingsData().holdings.slice(0, n);
}

function groupBy(
  holdings: Holding[],
  keyFn: (h: Holding) => string,
  total: number
): GroupTotal[] {
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

/** URL-friendly slug for a country name, e.g. "United Kingdom" -> "united-kingdom". */
export function slugifyCountry(country: string): string {
  return country.toLowerCase().replace(/\s+/g, "-");
}

/** Reverses slugifyCountry by matching against the countries actually present in the data. */
export function unslugifyCountry(slug: string): string | undefined {
  const countries = new Set(getHoldingsData().holdings.map((h) => h.country));
  return Array.from(countries).find((c) => slugifyCountry(c) === slug);
}

export function listCountries(): string[] {
  return groupByCountry().map((g) => g.key);
}
