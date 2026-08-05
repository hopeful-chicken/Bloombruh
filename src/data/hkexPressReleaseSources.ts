// Curated per-company press-release listing URLs — verified one at a time
// by fetching each page directly (no browser, plain HTTP, exactly what the
// scraper does at runtime) and confirming it actually returns real dated
// headlines rather than an empty JS-rendered shell.
//
// This list is intentionally small and honest rather than broad and
// guessed: many corporate IR sites either block plain server-side fetches
// entirely (HSBC, BYD, Xiaomi's ir.mi.com all failed outright while
// building this) or only render their press-release list via client-side
// JavaScript, so a server fetch gets nothing (Alibaba, Link REIT — both
// confirmed to return an empty shell despite genuinely having the content,
// just not in the initial HTML). HKEX's own news page was excluded too:
// its headlines often state a future event date ("... on 3 August 2026")
// rather than the actual publish date, which the date-proximity scraper
// could misread as when the release happened.
//
// Companies not listed here still get the generic HKEX filings link
// (src/lib/officialLinks.ts, works for every company) and the reliable
// third-party news feed (src/lib/news.ts, also works for every company) —
// only this curated "official press releases" list is unavailable for
// them, and the UI says so plainly rather than inventing anything.

export type PressReleaseSource = {
  code: string; // bare HKEX code, e.g. "0700"
  name: string;
  url: string;
};

export const PRESS_RELEASE_SOURCES: PressReleaseSource[] = [
  { code: "0700", name: "Tencent Holdings", url: "https://www.tencent.com/en-us/media.html" },
  { code: "1299", name: "AIA Group", url: "https://www.aia.com/en/media-centre" },
  { code: "2331", name: "Li Ning Company", url: "https://ir.lining.com/en/ir/announcements.php" },
  { code: "3690", name: "Meituan", url: "https://www.meituan.com/en-US/investor/announcement" },
  { code: "0001", name: "CK Hutchison Holdings", url: "https://www.ckh.com.hk/en/media/press_releases.php" },
];

export function getPressReleaseSource(code: string): PressReleaseSource | undefined {
  const bare = code.toUpperCase().replace(/\.HK$/, "").replace(/^0+/, "").padStart(4, "0");
  return PRESS_RELEASE_SOURCES.find((s) => s.code === bare);
}
