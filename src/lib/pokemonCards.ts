// Server-only wrapper around the TCGdex API (https://tcgdex.dev) — a free,
// no-key-required, community-run source of real Pokemon TCG card data and
// real market pricing (pulled from TCGplayer and Cardmarket). Confirmed
// empirically before building this (see docs/DATA_SOURCES.md): search,
// per-language card catalogs, and type/set filters all return real data
// across 12 tested languages.
//
// One honest limit, also confirmed empirically: this API gives real
// *current* pricing (TCGplayer low/mid/high/market, Cardmarket average +
// 1/7/30-day trend) but not a multi-year daily price history — nobody
// publishes that for free. This module shows real current stats rather
// than a fabricated historical chart.

const BASE_URL = "https://api.tcgdex.net/v2";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "es", label: "Spanish" },
  { code: "ja", label: "Japanese" },
  { code: "zh-tw", label: "Chinese (Traditional)" },
  { code: "ko", label: "Korean" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export type SetSummary = {
  id: string;
  name: string;
  cardCount?: { total: number; official: number };
};

export type TcgplayerVariantPrice = {
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
};

export type CardPricing = {
  tcgplayer: {
    unit: string;
    updated: string | null;
    normal?: TcgplayerVariantPrice;
    holofoil?: TcgplayerVariantPrice;
    reverseHolofoil?: TcgplayerVariantPrice;
  } | null;
  cardmarket: {
    unit: string;
    updated: string | null;
    avg: number | null;
    low: number | null;
    trend: number | null;
    avg1: number | null;
    avg7: number | null;
    avg30: number | null;
  } | null;
};

export type CardDetail = {
  id: string;
  name: string;
  image?: string;
  rarity: string | null;
  types: string[];
  set: SetSummary | null;
  hp: number | null;
  illustrator: string | null;
  pricing: CardPricing | null;
};

async function tcgdexFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      // Card catalog data (names, sets, types) barely changes; prices move
      // daily. A short revalidate keeps this fresh without hammering a free
      // community API on every request.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Raw shape actually returned by the API for a single card — kept loose
// (not every field is always present) rather than assuming a rigid schema.
type RawCardDetail = {
  id: string;
  name: string;
  image?: string;
  rarity?: string;
  types?: string[];
  hp?: number;
  illustrator?: string;
  set?: SetSummary;
  pricing?: {
    tcgplayer?: {
      unit: string;
      updated?: string;
      normal?: TcgplayerVariantPrice;
      holofoil?: TcgplayerVariantPrice;
      "reverse-holofoil"?: TcgplayerVariantPrice;
    };
    cardmarket?: {
      unit: string;
      updated?: string;
      avg?: number;
      low?: number;
      trend?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
    };
  };
};

export async function getCard(
  language: LanguageCode,
  id: string
): Promise<CardDetail | null> {
  const raw = await tcgdexFetch<RawCardDetail>(`/${language}/cards/${id}`);
  if (!raw) return null;

  const tcgplayer = raw.pricing?.tcgplayer;
  const cardmarket = raw.pricing?.cardmarket;

  return {
    id: raw.id,
    name: raw.name,
    image: raw.image,
    rarity: raw.rarity ?? null,
    types: raw.types ?? [],
    set: raw.set ?? null,
    hp: raw.hp ?? null,
    illustrator: raw.illustrator ?? null,
    pricing:
      tcgplayer || cardmarket
        ? {
            tcgplayer: tcgplayer
              ? {
                  unit: tcgplayer.unit,
                  updated: tcgplayer.updated ?? null,
                  normal: tcgplayer.normal,
                  holofoil: tcgplayer.holofoil,
                  reverseHolofoil: tcgplayer["reverse-holofoil"],
                }
              : null,
            cardmarket: cardmarket
              ? {
                  unit: cardmarket.unit,
                  updated: cardmarket.updated ?? null,
                  avg: cardmarket.avg ?? null,
                  low: cardmarket.low ?? null,
                  trend: cardmarket.trend ?? null,
                  avg1: cardmarket.avg1 ?? null,
                  avg7: cardmarket.avg7 ?? null,
                  avg30: cardmarket.avg30 ?? null,
                }
              : null,
          }
        : null,
  };
}
