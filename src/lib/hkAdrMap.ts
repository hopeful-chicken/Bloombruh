// Curated map between Hong Kong Stock Exchange listings and the SAME
// COMPANY's US-listed ticker that actually files with the SEC. This is the
// bridge that lets an HK company page show real SEC fundamentals: SEC
// EDGAR has no record of "9988.HK", but it has full filings for BABA —
// and Alibaba Group Holding Ltd is one legal entity with two listings, so
// its revenue, margins, and balance sheet are identical either way. The
// page always captions fundamentals sourced this way, so a reader knows
// exactly which listing's filings they're seeing.
//
// Every pair here was verified against SEC's live ticker→CIK map before
// being added (see docs/DECISIONS.md) — the US ticker must be a real SEC
// registrant, not an unsponsored OTC ADR that never files (which is why
// Tencent is absent: TCEHY exists as a ticker but files nothing with the
// SEC, so there is genuinely no free filing data for it).
//
// Deliberately excluded: HK-listed *subsidiaries* of US-listed parents
// (Sands China vs. Las Vegas Sands, Budweiser APAC vs. AB InBev) — the
// parent's SEC filings describe a different, bigger entity, and showing
// them as the subsidiary's numbers would be wrong, not clever.
//
// This is a static list, not a feed — HK/US dual listings change rarely,
// and a small verified list beats a large guessed one. Add pairs here as
// needed; nothing else has to change.

export const HK_ADR_MAP: Record<string, string> = {
  "9988.HK": "BABA", // Alibaba Group Holding Ltd
  "0005.HK": "HSBC", // HSBC Holdings plc
  "9618.HK": "JD", // JD.com Inc
  "9888.HK": "BIDU", // Baidu Inc
  "9866.HK": "NIO", // NIO Inc
  "9961.HK": "TCOM", // Trip.com Group Ltd
  "2015.HK": "LI", // Li Auto Inc
  "9868.HK": "XPEV", // XPeng Inc
  "9999.HK": "NTES", // NetEase Inc
  "9626.HK": "BILI", // Bilibili Inc
  "9987.HK": "YUMC", // Yum China Holdings Inc (dual primary; files 10-K)
  "2057.HK": "ZTO", // ZTO Express (Cayman) Inc
  "2378.HK": "PUK", // Prudential plc
  "0945.HK": "MFC", // Manulife Financial Corp
  "9698.HK": "GDS", // GDS Holdings Ltd
  // Added 2026-07-22 — each verified as a real SEC filer with recent
  // (FY2025) fundamentals AND a live HKEX common-stock listing:
  "9688.HK": "ZLAB", // Zai Lab Ltd
  "2423.HK": "BEKE", // KE Holdings Inc (Beike)
  "2518.HK": "ATHM", // Autohome Inc
  "9901.HK": "EDU", // New Oriental Education & Technology
  "2390.HK": "ZH", // Zhihu Inc
  "9898.HK": "WB", // Weibo Corp
  "2391.HK": "TUYA", // Tuya Inc
  "6160.HK": "ONC", // BeOne Medicines (formerly BeiGene)
  "3896.HK": "KC", // Kingsoft Cloud Holdings
};

/** US SEC-filing ticker for an HK listing, or null if no verified pair
 * exists (most smaller HKEX companies — an honest gap, not an oversight). */
export function getAdrForHkSymbol(hkSymbol: string): string | null {
  return HK_ADR_MAP[hkSymbol.toUpperCase()] ?? null;
}

const ADR_TO_HK: Record<string, string> = Object.fromEntries(
  Object.entries(HK_ADR_MAP).map(([hk, adr]) => [adr, hk])
);

/** The reverse direction: an ADR ticker's HK listing, or null. Used to
 * compute per-share valuation multiples from the HK ordinary-share price —
 * ADR quotes are per *ADS bundle* (1 BABA ADS = 8 ordinary shares), so
 * dividing an ADS price by SEC's per-ordinary-share EPS overstates P/E by
 * the bundle ratio. The HK price is per ordinary share, matching SEC's
 * share counts exactly, with no ratio lookup needed. */
export function getHkSymbolForAdr(adrTicker: string): string | null {
  return ADR_TO_HK[adrTicker.toUpperCase()] ?? null;
}
