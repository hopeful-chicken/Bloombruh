import { NextRequest, NextResponse } from "next/server";
import { getScrapedPressReleases } from "@/lib/hkex/pressReleaseScraper";
import { summarizeItems } from "@/lib/hkex/summarize";
import { getPressReleaseSource } from "@/data/hkexPressReleaseSources";
import type { NewsItem } from "@/lib/hkex/news";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const companyName = request.nextUrl.searchParams.get("name") ?? "";
  if (!code.trim() || !companyName.trim()) {
    return NextResponse.json({ error: "Missing code or company name" }, { status: 400 });
  }

  const source = getPressReleaseSource(code);
  if (!source) {
    return NextResponse.json({ items: [], summary: null, mapped: false });
  }

  const scraped = await getScrapedPressReleases(source.url);
  const items: NewsItem[] = scraped.map((r) => ({
    title: r.title,
    link: r.link,
    source: companyName,
    publishedAt: r.date,
  }));

  let summary: string | null = null;
  if (items.length > 0) {
    try {
      summary = await summarizeItems({ companyName, kind: "press releases", items });
    } catch (error) {
      console.error("HKEX press release summary failed:", error);
    }
  }

  return NextResponse.json({ items, summary, mapped: true, sourceUrl: source.url });
}
