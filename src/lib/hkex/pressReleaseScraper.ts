// Fetches a company's own press-release listing page directly and extracts
// real, dated entries from its actual HTML — no keyword search, no proxy.
// If nothing can be confidently extracted, callers get an empty list and
// are expected to say so honestly rather than fall back to a guess.
//
// This only works for listing pages that are plain server-rendered HTML.
// Confirmed by direct fetch (not a browser — a plain fetch, exactly what
// this runs) against a handful of real IR/media sites before writing this:
// Tencent, AIA, and Li Ning render title+date pairs directly in the HTML;
// Alibaba and Link REIT only render an empty shell and fill it via
// client-side JS, so a plain fetch gets nothing — those are intentionally
// left unmapped rather than faked (see src/data/pressReleaseSources.ts).

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export type ScrapedRelease = {
  title: string;
  link: string;
  date: string; // "YYYY-MM-DD"
};

// A handful of date shapes seen on real corporate press pages: "9 July
// 2026", "July 9, 2026", "2026-07-09", "2026.07.09", "06/07/2026". Each
// has its own parser since a bare regex match isn't enough to know which
// number is the day vs month for the slash format.
const DATE_PATTERNS: { pattern: RegExp; parse: (raw: string) => Date }[] = [
  {
    pattern:
      /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/,
    parse: (raw) => new Date(raw),
  },
  {
    pattern:
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}\b/,
    parse: (raw) => new Date(raw),
  },
  {
    pattern: /\b\d{4}[.\-]\d{1,2}[.\-]\d{1,2}\b/,
    parse: (raw) => new Date(raw.replace(/\./g, "-")),
  },
  {
    // DD/MM/YYYY — the convention on HK corporate sites (confirmed against
    // ckh.com.hk, where "07/04/2026" means 7 April, not July 4). Not
    // ambiguous with MM/DD/YYYY here since this project only ever targets
    // Hong Kong company sites.
    pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
    parse: (raw) => {
      const [d, m, y] = raw.split("/").map(Number);
      return new Date(y, m - 1, d);
    },
  },
];

function findDate(text: string): { raw: string; date: Date } | null {
  for (const { pattern, parse } of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const parsed = parse(match[0]);
      if (!Number.isNaN(parsed.getTime())) {
        return { raw: match[0], date: parsed };
      }
    }
  }
  return null;
}

/** Prefers a date sitting at the very start or end of the text (how a
 * publish-date stamp is normally attached to a headline) over one buried
 * mid-sentence (which is more likely part of the headline's own wording,
 * e.g. "... Meeting Held on 26 June 2026" — a meeting date, not a publish
 * date). Falls back to anywhere in the text only if neither edge matches. */
function findEdgeDate(text: string): { raw: string; date: Date } | null {
  const trimmed = text.trim();
  return (
    findDate(trimmed.slice(-30)) ??
    findDate(trimmed.slice(0, 30)) ??
    findDate(trimmed)
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Generic-looking link text that's never a real headline — filters out
// "Read more", "View All", nav labels, etc. picked up incidentally.
const GENERIC_TEXT = /^(read more|view all|learn more|see all|more|home|news|media|contact|next|previous|share)$/i;

function isPlausibleTitle(title: string): boolean {
  return title.length >= 15 && !GENERIC_TEXT.test(title.trim());
}

// Routine regulatory/governance filings — required disclosures, not
// something a company would put in front of clients or the press. Several
// of the curated sources (Meituan, Li Ning) turned out to be HKEX
// disclosure feeds rehosted on the IR site rather than genuine press
// pages, so this filter matters even after picking "official" sources.
// Matched against the title with any leading HKEX category prefix
// ("Announcements and Notices - ") stripped first.
const BOILERPLATE_PATTERNS: RegExp[] = [
  /next day disclosure return/i,
  /monthly return of equity issuer/i,
  /list of directors/i,
  /poll results of/i,
  /notice of (annual|extraordinary|special) general meeting/i,
  /results of (annual|extraordinary|special) general meeting/i,
  /results of (agm|egm|sgm)/i,
  /grant of (restricted )?share (units|options|awards?)/i,
  /^circular/i,
  /proxy form/i,
  /closure of (the )?register of members/i,
  /change (in|of) company secretary/i,
  /change in (director|board)/i,
  /change in composition of board committees/i,
  /date of board meeting/i,
  /re-?designation of authorised representative/i,
  /re-?compliance with rule/i,
  /appointment of authorised representative/i,
];

function isBoilerplateFiling(title: string): boolean {
  const stripped = title.replace(/^announcements? and notices?\s*-\s*/i, "");
  return BOILERPLATE_PATTERNS.some((p) => p.test(stripped));
}

/** Extracts (title, link, date) triples from a listing page's raw HTML.
 * Looks for the date in three places, in priority order: inside the link
 * text itself (Meituan/AIA-style), immediately before the link (Li
 * Ning-style — a sibling date div), or immediately after it
 * (Tencent-style — a sibling date div following the headline). */
export function extractPressReleases(html: string, baseUrl: string): ScrapedRelease[] {
  const results: ScrapedRelease[] = [];
  const anchorPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html)) !== null) {
    const [fullMatch, hrefRaw, innerHtml] = match;
    const innerText = stripTags(innerHtml);
    if (!innerText) continue;

    const beforeContext = stripTags(html.slice(Math.max(0, match.index - 200), match.index));
    const afterContext = stripTags(html.slice(match.index + fullMatch.length, match.index + fullMatch.length + 200));

    let dateResult = findEdgeDate(innerText);
    let title = innerText;

    if (dateResult) {
      title = innerText
        .replace(dateResult.raw, "")
        .replace(/^[\s,;:.\-–—]+/, "")
        .replace(/[\s,;:.\-–—]+$/, "")
        .trim();
    } else {
      const afterDate = findDate(afterContext.slice(0, 40));
      const beforeDate = findDate(beforeContext.slice(-40));
      if (afterDate) {
        dateResult = afterDate;
      } else if (beforeDate) {
        dateResult = beforeDate;
      }
    }

    if (!dateResult || !isPlausibleTitle(title)) continue;

    let link = hrefRaw;
    if (link.startsWith("/")) {
      link = new URL(link, baseUrl).toString();
    } else if (!link.startsWith("http")) {
      continue; // javascript:void(0) or similar — not a real link
    }

    results.push({
      title,
      link,
      date: dateResult.date.toISOString().slice(0, 10),
    });
  }

  return results;
}

export async function fetchPressReleasePage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Press release page request failed: ${res.status}`);
  return res.text();
}

/** Fetches and extracts up to `limit` releases from the last `withinDays`
 * days, newest first, deduped by title. Returns an empty array (not an
 * error) if the page can't be fetched or nothing confidently matches —
 * callers should treat that as "couldn't find them," not retry with a
 * guess. */
export async function getScrapedPressReleases(
  url: string,
  withinDays = 100,
  limit = 10
): Promise<ScrapedRelease[]> {
  let html: string;
  try {
    html = await fetchPressReleasePage(url);
  } catch {
    return [];
  }

  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  const all = extractPressReleases(html, url)
    .filter((r) => new Date(r.date).getTime() >= cutoff)
    .filter((r) => !isBoilerplateFiling(r.title));

  const seen = new Set<string>();
  const deduped = all.filter((r) => {
    const key = r.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => (a.date < b.date ? 1 : -1));
  return deduped.slice(0, limit);
}
