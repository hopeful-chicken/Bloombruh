// Shared read-only headline list — used both by the always-visible News
// section in DataDashboard.tsx and by the optional "In the news" report
// block (NewsBlockEditor.tsx), so a student can quote a headline or drop
// the whole list into their exported report's appendix without the two
// UIs drifting apart.

import type { NewsArticle } from "@/lib/news";

export default function NewsList({ articles }: { articles: NewsArticle[] }) {
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
