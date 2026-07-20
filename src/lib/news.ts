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
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    companyName
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
