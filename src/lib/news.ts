// Server-only news headlines via Google News' public RSS search feed —
// free, no key, no signup. The feed is small, regular XML, so it's parsed
// with simple regex rather than pulling in an XML parser dependency,
// matching this project's "no new dependency" pattern (see
// companyInfo.ts's Wikipedia integration, which does the same).

const USER_AGENT = "GraduateAnalystTerminal contact@example.com (student project)";

export type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
  source: string | null;
};

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Shared fetch+parse core for Google News' RSS search — takes an already
 * fully-formed search query string, hits the feed, and parses out up to
 * `limit` articles. Returns an empty array (never throws) if the feed is
 * unavailable, so a flaky fetch never breaks the whole page. Used both for
 * plain company-name searches (getCompanyNews) and date-scoped searches
 * (getRateDecisionNews).
 */
async function fetchGoogleNewsRss(query: string, limit: number): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = xml.split("<item>").slice(1);

  const articles: NewsArticle[] = [];
  for (const item of items.slice(0, limit)) {
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    if (!titleMatch || !linkMatch) continue;

    const rawTitle = decodeEntities(titleMatch[1].trim());
    const separatorIndex = rawTitle.lastIndexOf(" - ");
    const title = separatorIndex > 0 ? rawTitle.slice(0, separatorIndex) : rawTitle;
    const source = separatorIndex > 0 ? rawTitle.slice(separatorIndex + 3) : null;

    let pubDate = "";
    if (pubDateMatch) {
      const parsed = new Date(pubDateMatch[1].trim());
      if (!Number.isNaN(parsed.getTime())) pubDate = parsed.toISOString().slice(0, 10);
    }

    articles.push({
      title,
      link: decodeEntities(linkMatch[1].trim()),
      pubDate,
      source,
    });
  }
  return articles;
}

/**
 * Fetches recent headlines about a company from Google News' RSS search.
 * Titles in this feed are usually formatted "Headline - Source Name", so
 * that's split apart for a cleaner display. Returns an empty array (never
 * throws) if the feed is unavailable, so a flaky fetch never breaks the
 * whole profile page.
 */
export async function getCompanyNews(
  companyName: string,
  limit = 6
): Promise<NewsArticle[]> {
  return fetchGoogleNewsRss(companyName, limit);
}

/**
 * Fetches real, dated news coverage about one specific central bank rate
 * decision, using Google News' `after:`/`before:` date-scoped search
 * operators to bracket a short window (3 days either side of the decision
 * date) — enough to catch same-day and next-day reporting without pulling
 * in unrelated coverage from months later. This is the "explain more" data
 * behind each Central Bank Room timeline entry: rather than inventing a
 * canned rationale (no free source publishes structured decision
 * rationale), the timeline links out to real, sourced articles from around
 * that date. Returns an empty array (never throws) if nothing is found.
 */
export async function getRateDecisionNews(
  bankName: string,
  date: string,
  limit = 5
): Promise<NewsArticle[]> {
  const anchor = new Date(date);
  if (Number.isNaN(anchor.getTime())) return [];

  const before = new Date(anchor);
  before.setDate(before.getDate() + 4);
  const after = new Date(anchor);
  after.setDate(after.getDate() - 3);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const query = `${bankName} interest rate after:${iso(after)} before:${iso(before)}`;

  return fetchGoogleNewsRss(query, limit);
}

/**
 * Real, recent coverage scoped to a given lookback window — the general
 * form of the date-scoped search, reused by the Markets Overview module
 * (world situation, each equity sector, each private-market segment all
 * pass their own query through this one function with the period the
 * reader picked). A null daysBack is left unscoped by date (a multi-year
 * date filter would just return whatever Google's index has, not a
 * meaningful "forever" window) and simply returns the most relevant recent
 * coverage instead. Returns an empty array (never throws) if the feed is
 * unavailable.
 */
export async function getPeriodNews(
  query: string,
  daysBack: number | null,
  limit = 6
): Promise<NewsArticle[]> {
  if (daysBack === null) return fetchGoogleNewsRss(query, limit);

  const today = new Date();
  const after = new Date(today);
  after.setDate(after.getDate() - daysBack);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return fetchGoogleNewsRss(`${query} after:${iso(after)} before:${iso(today)}`, limit);
}

/**
 * Real, recent macro coverage used to ground the Central Bank Room's
 * "Global Overview" world-situation summary — a broad search across
 * inflation/growth/rates news, scoped to the same period the student picked
 * for the overview. Thin wrapper around getPeriodNews with a fixed query.
 */
export async function getGlobalMacroNews(
  daysBack: number | null,
  limit = 6
): Promise<NewsArticle[]> {
  return getPeriodNews(
    "global economy central banks inflation growth interest rates",
    daysBack,
    limit
  );
}
