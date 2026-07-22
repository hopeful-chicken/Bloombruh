"use client";

// Shared headline list — used both by the always-visible News section in
// DataDashboard.tsx and by the optional "In the news" report block
// (NewsBlockEditor.tsx), so a student can quote a headline or drop the
// whole list into their exported report's appendix without the two UIs
// drifting apart.
//
// Paginated client-side: the page fetches a larger batch of headlines up
// front (see src/app/profile/[symbol]/page.tsx), but only `initialCount`
// are shown at first — "Show more" reveals `pageSize` more at a time so
// the page doesn't open with a huge wall of headlines.

import { useState } from "react";
import type { NewsArticle } from "@/lib/news";

export default function NewsList({
  articles,
  initialCount = 6,
  pageSize = 4,
}: {
  articles: NewsArticle[];
  initialCount?: number;
  pageSize?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted">
        No recent headlines found for this company.
      </p>
    );
  }

  const visible = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <div>
      <ul className="space-y-3">
        {visible.map((a) => (
          <li key={a.link} className="border-b border-border pb-3 last:border-0 last:pb-0">
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground hover:text-accent"
            >
              {a.title}
            </a>
            <p className="mt-0.5 text-xs text-muted">
              {a.source ? `${a.source} · ` : ""}
              {a.pubDate}
            </p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => Math.min(c + pageSize, articles.length))}
          className="mt-3 text-xs text-accent hover:underline"
        >
          Show {Math.min(pageSize, articles.length - visibleCount)} more headlines
        </button>
      )}
    </div>
  );
}
