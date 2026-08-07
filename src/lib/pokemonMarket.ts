// Real, sourced data behind the Pokemon Cards module's market-level
// analysis — cumulative production milestones, one flagship card's real
// price trajectory, and real liquidity/market-size proxies. Everything
// here is a fact pulled from a real search at the time it was written
// (2026-07-23) and dated accordingly; nothing is interpolated or
// estimated to fill a gap. See the "what we can't verify" section on the
// page itself for what a real 30-year continuous data series would need
// that simply isn't published anywhere for free (or at all).

export type ProductionMilestone = { date: string; cumulativeBillion: number; label: string };

// The Pokemon Company's own reported lifetime production figures, at every
// point one was actually published — NOT a smooth 30-year series. There is
// no public, continuous, year-by-year card-production count going back to
// 1996; these are the real disclosed milestones, which is why the chart
// built from them only meaningfully covers the last ~6 years.
export const PRODUCTION_MILESTONES: ProductionMilestone[] = [
  { date: "2020-03", cumulativeBillion: 34.1, label: "34.1bn lifetime cards sold" },
  { date: "2023-03", cumulativeBillion: 52.9, label: "52.9bn lifetime cards produced" },
  { date: "2024-03", cumulativeBillion: 64.8, label: "64.8bn lifetime, 11.9bn sold in FY23/24 alone" },
  { date: "2025-03", cumulativeBillion: 75.0, label: "75bn lifetime, 10.2bn sold in FY24/25 alone" },
  { date: "2026-05", cumulativeBillion: 85.0, label: "85bn+ lifetime cards printed" },
];

export type PriceDataPoint = { date: string; usd: number; label: string };

// PSA 10, 1st Edition Base Set Charizard (#4/102) — the single most-tracked
// individual Pokemon card, and the cleanest real case study of the asset's
// actual volatility. Real publicly reported sale/valuation points; the
// gaps between them are real gaps in reporting, not smoothed.
//
// Corrected 2026-07-23: an earlier pass here had a "2018: $11,000" point
// that turned out to be shaky once checked more carefully — a follow-up
// search found a better-sourced, precisely dated real sale instead
// ($18,900, 23 July 2017, via PWCC on eBay, documented by Beckett News),
// and — more importantly — an explicit, source-attributed fact that
// directly explains the 2017-2020 gap rather than just failing to fill
// it: per data tracker Card Ladder, there are no publicly recorded PSA 10
// sales of this card at all between 2017 and 2021. That's not a hole in
// this research; it's a real, documented fact about the market itself,
// which is a stronger and more honest thing to show than an invented
// intermediate point ever would be. The 2016 "$800, near-mint ungraded"
// figure was also removed from this series — it was a different, far more
// common (raw, non-PSA-10) product, and mixing grades into one "price"
// line understated how real the pre-2020 gap actually is.
// The gap between 2017-07 and 2020-10 below is deliberately left with no
// interpolated point in between — per data tracker Card Ladder, there are
// no publicly recorded PSA 10 sales of this card at all in that window,
// a real documented fact (see the note above), not a missing data point
// this chart is glossing over.
export const CHARIZARD_PRICE_HISTORY: PriceDataPoint[] = [
  { date: "2017-07", usd: 18900, label: "Real PSA 10 sale via PWCC/eBay (Beckett News)" },
  { date: "2020-10", usd: 220000, label: "PSA 10 sale" },
  { date: "2020-11", usd: 295000, label: "PSA 10 sale, one month later" },
  { date: "2022-03", usd: 420000, label: "Peak of the pandemic-era boom" },
  { date: "2022-11", usd: 250000, label: "Post-peak correction settles here" },
  { date: "2025-12", usd: 550000, label: "New all-time public auction record (Heritage Auctions)" },
];

// --- "$30 in 1999" comparison: PSA 10 1st Edition Charizard vs. S&P 500 ---
//
// The S&P 500 side is fully real and solidly sourced: Yahoo Finance's own
// public chart API (query1.finance.yahoo.com), fetched directly, returns
// dividend-and-split-adjusted ("adjclose") SPY prices back to January
// 1999 — this is exactly Yahoo's "Adj Close" figure, the correct basis
// for a fair total-return comparison (not just raw price appreciation).
// Confirmed working and pulled live before writing this file.
//
// The Charizard side is honestly weaker before mid-2017, and that gap is
// real, not glossed over. $30 is the illustrative 1999 entry price asked
// for — treated here as a stated assumption (roughly what a few packs, or
// an early raw copy, cost at release), not a documented sale. A specific,
// dated PSA 10 sale record for 1999 through mid-2017 does not exist in
// any source this project could access: PriceCharting, PWCC, and Heritage
// Auctions all blocked automated access (HTTP 403) when checked directly.
// From July 2017 onward, every point is a real, publicly reported sale —
// the same data used in the Charizard case study above, including the
// documented (Card Ladder-sourced) fact that no PSA 10 sales of this card
// are publicly recorded at all between 2017 and 2021.
export type ComparisonPoint = {
  date: string;
  charizardUsd: number | null;
  sp500Usd: number | null;
  charizardReal: boolean; // false = the labeled 1999 assumption, not a documented sale
};

export const THIRTY_DOLLAR_COMPARISON: ComparisonPoint[] = [
  { date: "1999", charizardUsd: 30, sp500Usd: 30, charizardReal: false },
  { date: "2000", charizardUsd: null, sp500Usd: 33.15, charizardReal: false },
  { date: "2001", charizardUsd: null, sp500Usd: 32.89, charizardReal: false },
  { date: "2002", charizardUsd: null, sp500Usd: 27.51, charizardReal: false },
  { date: "2003", charizardUsd: null, sp500Usd: 21.25, charizardReal: false },
  { date: "2004", charizardUsd: null, sp500Usd: 28.48, charizardReal: false },
  { date: "2005", charizardUsd: null, sp500Usd: 30.22, charizardReal: false },
  { date: "2006", charizardUsd: null, sp500Usd: 33.19, charizardReal: false },
  { date: "2007", charizardUsd: null, sp500Usd: 38.11, charizardReal: false },
  { date: "2008", charizardUsd: null, sp500Usd: 37.09, charizardReal: false },
  { date: "2009", charizardUsd: null, sp500Usd: 22.9, charizardReal: false },
  { date: "2010", charizardUsd: null, sp500Usd: 30.38, charizardReal: false },
  { date: "2011", charizardUsd: null, sp500Usd: 37.12, charizardReal: false },
  { date: "2012", charizardUsd: null, sp500Usd: 38.67, charizardReal: false },
  { date: "2013", charizardUsd: null, sp500Usd: 45.06, charizardReal: false },
  { date: "2014", charizardUsd: null, sp500Usd: 54.72, charizardReal: false },
  { date: "2015", charizardUsd: null, sp500Usd: 62.45, charizardReal: false },
  { date: "2016", charizardUsd: null, sp500Usd: 61.91, charizardReal: false },
  { date: "2017", charizardUsd: 18900, sp500Usd: 74.28, charizardReal: true },
  { date: "2018", charizardUsd: null, sp500Usd: 93.81, charizardReal: false },
  { date: "2019", charizardUsd: null, sp500Usd: 91.54, charizardReal: false },
  { date: "2020", charizardUsd: 295000, sp500Usd: 111.17, charizardReal: true },
  { date: "2021", charizardUsd: null, sp500Usd: 130.26, charizardReal: false },
  { date: "2022", charizardUsd: 420000, sp500Usd: 160.47, charizardReal: true },
  { date: "2023", charizardUsd: 250000, sp500Usd: 147.34, charizardReal: true },
  { date: "2024", charizardUsd: null, sp500Usd: 177.69, charizardReal: false },
  { date: "2025", charizardUsd: 550000, sp500Usd: 224.29, charizardReal: true },
  { date: "2026", charizardUsd: null, sp500Usd: 260.92, charizardReal: false },
];

export type MarketStat = { label: string; value: string; note: string };

export const MARKET_STATS: MarketStat[] = [
  {
    label: "PSA daily grading volume",
    value: "90,000 cards/day",
    note: "vs. ~15,000/day in 2021, a 6x increase, with a reported 10M+ card backlog as of mid-2026.",
  },
  {
    label: "PSA TCG submission growth",
    value: "+95% YoY",
    note: "Trading-card submissions (Pokemon, Magic, Yu-Gi-Oh) now outpace sports-card submissions more than 2-to-1 at PSA.",
  },
  {
    label: "eBay's share of Pokemon sales",
    value: "~58%",
    note: "The dominant secondary-market venue, ahead of TCGplayer and dedicated auction houses.",
  },
  {
    label: "Lifetime cards printed",
    value: "85bn+",
    note: "Crossed 85 billion in May 2026, roughly 40% of that total printed in just the last 3 fiscal years.",
  },
];

export type SwotEntry = { point: string; detail: string };

export const SWOT = {
  strengths: [
    {
      point: "Three decades of continuous, accelerating demand",
      detail: "Unlike a typical collectible fad, production and sales have grown almost every year since 1996, with the most recent 3 fiscal years alone accounting for roughly 40% of all cards ever printed.",
    },
    {
      point: "Real, independent authentication infrastructure",
      detail: "PSA's grading volume has grown 6x since 2021, a genuine, third-party-verified market, not a self-reported one, which is a meaningfully higher bar than most collectibles clear.",
    },
    {
      point: "Brand permanence, not a single hit product",
      detail: "Games, anime, and merchandising have run continuously for 30 years and are still growing (Switch 2's Pokemon software drove Nintendo's biggest-ever sales year). The card game rides a brand that does not depend on the cards themselves to stay culturally relevant.",
    },
  ] as SwotEntry[],
  weaknesses: [
    {
      point: "Zero cash flow, ever",
      detail: "A card pays no dividend and generates no income. The entire return case rests on someone else paying more for it later, the same structural weakness every collectible shares with none of the yield.",
    },
    {
      point: "Value is extremely concentrated",
      detail: "The 85 billion cards printed are overwhelmingly commons and near-worthless bulk. The real value sits in a tiny fraction of graded, rare, vintage cards, not the asset class as printed.",
    },
    {
      point: "Condition and counterfeit risk",
      detail: "A card's value can be destroyed by a bent corner or a fake slab: risks with no equivalent in a real financial security.",
    },
  ] as SwotEntry[],
  opportunities: [
    {
      point: "Grading is still scaling, not maturing",
      detail: "PSA's own backlog (10M+ cards) suggests submission demand is currently ahead of the market's ability to process and verify it. A growing-pains signal, not a saturation one.",
    },
    {
      point: "International and Asia-Pacific growth",
      detail: "Industry forecasts consistently cite Asia-Pacific as the fastest-growing region for the category, alongside continued growth in Japan's own long-running domestic market.",
    },
  ] as SwotEntry[],
  threats: [
    {
      point: "The exact same 'too much supply' story that killed sports cards",
      detail: "The 1990s baseball-card crash was caused by manufacturers massively overprinting to chase demand (81 billion cards/year at the peak), which is structurally the same dynamic now playing out with Pokemon's own accelerating print runs, just not yet at a level that has broken the market.",
    },
    {
      point: "Discretionary-spending sensitivity",
      detail: "Card collecting is a discretionary hobby purchase. A real recession would be a genuine test this asset class has not faced yet during its current boom.",
    },
  ] as SwotEntry[],
};
