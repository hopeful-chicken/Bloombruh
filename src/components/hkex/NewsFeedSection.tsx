"use client";

// Shared feed renderer for both the news and press-release sections of the
// HKEX company detail page — ported from the standalone "HK Research"
// project. Handles three distinct states honestly rather than collapsing
// them into one generic "nothing here": still loading, no curated source
// exists for this company at all (press releases only), and a source
// exists but nothing confident came back from it.

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

type FeedResponse = {
  items: NewsItem[];
  summary: string | null;
  mapped?: boolean;
  error?: string;
};

export default function NewsFeedSection({
  title,
  fetchUrl,
  unmappedMessage,
  emptyMessage = "Nothing found in the last 3 months.",
}: {
  title: string;
  fetchUrl: string;
  /** Shown when the API reports mapped: false — no official source is
   * curated for this company at all (only relevant to the press-releases
   * feed — see src/data/hkexPressReleaseSources.ts). */
  unmappedMessage?: string;
  /** Shown when a source exists but nothing confident came back from it —
   * distinct from "not mapped" so the message stays honest either way. */
  emptyMessage?: string;
}) {
  // Keyed by the URL it was fetched for, so "loading" is derived (no entry
  // yet for the current fetchUrl) rather than a boolean set synchronously
  // inside the effect body.
  const [dataByUrl, setDataByUrl] = useState<Record<string, FeedResponse>>({});
  const data = dataByUrl[fetchUrl];
  const loading = data === undefined;

  useEffect(() => {
    let cancelled = false;
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((body: FeedResponse) => {
        if (!cancelled) setDataByUrl((prev) => ({ ...prev, [fetchUrl]: body }));
      })
      .catch(() => {
        if (!cancelled) {
          setDataByUrl((prev) => ({
            ...prev,
            [fetchUrl]: { items: [], summary: null, error: "Failed to load" },
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchUrl]);

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {!loading && data.mapped === false && (
        <p className="text-sm text-muted">{unmappedMessage}</p>
      )}

      {!loading && data.mapped !== false && data.items.length === 0 && (
        <p className="text-sm text-muted">{emptyMessage}</p>
      )}

      {!loading && data.items.length > 0 && (
        <>
          {data.summary && (
            <p className="mb-4 text-sm leading-relaxed text-foreground">{data.summary}</p>
          )}
          <ul className="divide-y divide-border border-y border-border">
            {data.items.map((item, i) => (
              <li key={i} className="py-2.5">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {item.title}
                </a>
                <div className="mt-0.5 text-xs text-muted">
                  {item.source || "Unknown source"} · {item.publishedAt.slice(0, 10)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
