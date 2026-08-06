import type { MetadataRoute } from "next";
import { ANALYSIS_ENTRIES, STOCK_PITCHES } from "@/data/analysis";
import { LESSONS } from "@/data/lessons";

// Lists every URL worth Google indexing. Ticker-driven pages
// (/profile/[symbol], /pokemon/[id], /hkex/[code]) are left out on purpose
// — there's no fixed, finite list of valid tickers to enumerate, and
// Google finds them fine by following the on-site search/links once it's
// crawled the module pages below. See .env.local.example for
// NEXT_PUBLIC_SITE_URL, which this reads to build absolute URLs.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bloombruh.vercel.app";

const STATIC_ROUTES = [
  "",
  "/profile",
  "/macro",
  "/pokemon",
  "/analysis",
  "/markets",
  "/templates",
  "/hkex",
  "/hype",
  "/lessons",
  "/simulations",
  "/test-prep",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const analysisEntries = [...ANALYSIS_ENTRIES, ...STOCK_PITCHES].map((entry) => ({
    url: `${siteUrl}/analysis/${entry.id}`,
    lastModified: new Date(),
  }));

  const lessonEntries = LESSONS.map((lesson) => ({
    url: `${siteUrl}/lessons/${lesson.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...analysisEntries, ...lessonEntries];
}
