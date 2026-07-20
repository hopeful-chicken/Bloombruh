// Server-only helper for a plain-English company description and a set of
// "read more" links. This is free, no key required, combining two public
// sources:
//   1. Wikipedia — a two-step lookup (search for the best-matching article,
//      then fetch its summary) since company names from the market-data
//      provider don't always exactly match Wikipedia's page titles.
//   2. Constructed links to SEC EDGAR (via secEdgar.ts's CIK lookup) and
//      Yahoo Finance, so a student can jump straight to primary sources
//      instead of us trying to re-host everything ourselves.

import { getCikForTicker } from "@/lib/secEdgar";

const USER_AGENT = "GraduateAnalystTerminal contact@example.com (student project)";

type WikiSearchResult = { title: string };
type WikiSummary = {
  extract: string;
  content_urls?: { desktop?: { page?: string } };
};

/** Finds the best-matching Wikipedia article title for a company name. */
async function findWikipediaTitle(companyName: string): Promise<string | null> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", companyName);
  url.searchParams.set("srlimit", "1");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const results: WikiSearchResult[] = data?.query?.search ?? [];
  return results[0]?.title ?? null;
}

export type CompanyDescription = {
  extract: string;
  wikipediaUrl: string;
};

/** Plain-English company summary, sourced from Wikipedia. Cached 1 day. */
export async function getCompanyDescription(
  companyName: string
): Promise<CompanyDescription | null> {
  const title = await findWikipediaTitle(companyName);
  if (!title) return null;

  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  const res = await fetch(summaryUrl, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as WikiSummary;
  if (!data.extract) return null;

  return {
    extract: data.extract,
    wikipediaUrl:
      data.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

export type SourceLink = { label: string; url: string };

/**
 * "Read more" links for a ticker: SEC filings (if it's a US SEC filer) plus
 * Yahoo Finance, which covers most exchanges worldwide. These are
 * constructed URLs (not guesses at a company's own website), so they're
 * always safe to show even if we don't know anything else about the company.
 */
export async function getSourceLinks(
  ticker: string,
  wikipediaUrl: string | null
): Promise<SourceLink[]> {
  const links: SourceLink[] = [
    {
      label: "Yahoo Finance",
      url: `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`,
    },
  ];

  const cik = await getCikForTicker(ticker);
  if (cik) {
    links.push({
      label: "SEC EDGAR filings",
      url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=10-K&dateb=&owner=include&count=40`,
    });
  }

  if (wikipediaUrl) {
    links.push({ label: "Wikipedia", url: wikipediaUrl });
  }

  return links;
}
