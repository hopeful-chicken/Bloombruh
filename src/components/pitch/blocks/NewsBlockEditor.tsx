"use client";

// The News block's editor: lets the student pick exactly which headlines
// to quote/include in their exported report, instead of dumping every
// fetched headline in wholesale. `data.selectedLinks === null` means
// "include everything" (the default, and also what a brand-new block
// starts with) — the moment the student touches a checkbox it becomes an
// explicit list of article `link`s, same convention as StatsBlockEditor's
// `statKeys` toggle list.

import type { NewsArticle } from "@/lib/news";
import type { NewsBlockData } from "@/lib/reportBlocks";

export default function NewsBlockEditor({
  data,
  articles,
  onChange,
}: {
  data: NewsBlockData;
  articles: NewsArticle[];
  onChange: (data: NewsBlockData) => void;
}) {
  const isSelected = (link: string) =>
    data.selectedLinks === null || data.selectedLinks.includes(link);

  function toggle(link: string) {
    // Starting from "all selected" (null), unchecking one article means
    // building an explicit list of every OTHER article's link.
    const current = data.selectedLinks ?? articles.map((a) => a.link);
    const next = current.includes(link)
      ? current.filter((l) => l !== link)
      : [...current, link];
    onChange({ selectedLinks: next });
  }

  if (articles.length === 0) {
    return (
      <p className="text-xs text-muted">
        No headlines were found for this company — nothing to quote here.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          Pick which headlines to quote or list in your exported report.
        </p>
        <div className="flex shrink-0 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onChange({ selectedLinks: null })}
            className="text-accent hover:underline"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onChange({ selectedLinks: [] })}
            className="text-muted hover:underline"
          >
            None
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {articles.map((article) => {
          const selected = isSelected(article.link);
          return (
            <label
              key={article.link}
              className={`flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm ${
                selected ? "border-accent/50 bg-accent/5" : "border-border"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(article.link)}
                className="mt-0.5 accent-accent"
              />
              <span>
                <span className="block text-foreground">{article.title}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {article.source ? `${article.source} · ` : ""}
                  {article.pubDate}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
