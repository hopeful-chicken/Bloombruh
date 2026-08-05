// Live news search via Google News RSS — no API key required (verified
// working, no key, live). Used for reliable third-party news about a
// company (any company, by name) — official press releases are handled
// separately by src/lib/pressReleaseScraper.ts, which fetches a company's
// own page directly instead of searching Google News restricted to its
// domain (that approach surfaced unrelated product pages alongside real
// releases — confirmed empirically against tencent.com, which also hosts
// Tencent Cloud/gaming portals under the same domain).
//
// Server-only: never import from a "use client" component.

import { XMLParser } from "fast-xml-parser";
import { simplifyCompanyName, coreCompanyName } from "./companyName";

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string; // ISO date
};

const parser = new XMLParser({ ignoreAttributes: false });

async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-HK&gl=HK&ceid=HK:en`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Google News request failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items
    .filter((it) => it?.title && it?.link)
    .map((it) => ({
      title: String(it.title),
      link: String(it.link),
      source: typeof it.source === "object" ? String(it.source["#text"] ?? "") : String(it.source ?? ""),
      publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
    }));
}

// Reliable, mainstream financial/business outlets — the allowlist third-
// party news is filtered against. Matched against the RSS <source> field
// (the publisher name Google News itself attributes each item to).
const RELIABLE_SOURCES = [
  "Financial Times",
  "The Economist",
  "Reuters",
  "Bloomberg",
  "Bloomberg.com",
  "The Wall Street Journal",
  "WSJ",
  "Nikkei Asia",
  "South China Morning Post",
  "SCMP",
  "CNBC",
  "MarketWatch",
  "The Straits Times",
  "Caixin Global",
];

function isReliableSource(source: string): boolean {
  const s = source.toLowerCase();
  return RELIABLE_SOURCES.some((r) => s.includes(r.toLowerCase()));
}

function dedupeByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const key = it.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Up to `limit` news links from reliable outlets about `companyName`,
 * published in the last 90 days, newest first. Works for any company.
 *
 * Searches the simplified name ("CK Hutchison", not "CK Hutchison Holdings
 * Limited") rather than the EODHD directory's full formal name — confirmed
 * empirically that searching the full legal name can return zero reliable
 * results even when real Reuters/Bloomberg/WSJ coverage exists, because
 * press coverage almost never spells out the full formal entity name.
 *
 * If that still comes back thin (<3 results), also tries the broader
 * coreCompanyName — catches names simplifyCompanyName's suffix list
 * doesn't fully clean, e.g. "Ping An Insurance (Group) Co of China Ltd" ->
 * "Ping An Insurance", which found real Bloomberg coverage the fuller
 * simplified form missed (confirmed empirically). */
export async function getReliableNews(companyName: string, limit = 10): Promise<NewsItem[]> {
  const searchName = simplifyCompanyName(companyName);
  const primary = await fetchGoogleNews(`"${searchName}" when:90d`);
  let reliable = primary.filter((it) => isReliableSource(it.source));

  const broaderName = coreCompanyName(companyName);
  if (reliable.length < 3 && broaderName !== searchName) {
    const broader = await fetchGoogleNews(`"${broaderName}" when:90d`);
    reliable = reliable.concat(broader.filter((it) => isReliableSource(it.source)));
  }

  reliable.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return dedupeByTitle(reliable).slice(0, limit);
}
