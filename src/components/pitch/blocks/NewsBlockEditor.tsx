"use client";

// Viewer-only block: there's nothing for the student to edit here, it
// just displays the headlines fetched once, server-side, for this
// company (see src/lib/news.ts) — same "fetch once, pass down" pattern
// as the company description block. The same list is always visible in
// the data dashboard; this block just lets the student include it (or
// quote from it) inside their exported report too.

import type { NewsArticle } from "@/lib/news";
import NewsList from "@/components/pitch/NewsList";

export default function NewsBlockEditor({ articles }: { articles: NewsArticle[] }) {
  return <NewsList articles={articles} />;
}
