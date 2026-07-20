"use client";

// Viewer-only block: there's nothing for the student to edit here, it
// just displays the headlines fetched once, server-side, for this
// company (see src/lib/news.ts) — same "fetch once, pass down" pattern
// as the company description block.

import type { NewsArticle } from "@/lib/news";

export default function NewsBlockEditor({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted">
        No recent headlines found for this company.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {articles.map((a) => (
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
  );
}
