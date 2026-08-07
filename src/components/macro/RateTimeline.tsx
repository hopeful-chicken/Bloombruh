"use client";

// A list of a central bank's rate decisions (derived from the real history —
// every point where the rate changed), grouped by year so the whole fetched
// history is browsable (not just the most recent handful) without dumping
// everything on screen at once. Each year is its own expandable section
// (most recent year open by default); within a year, every decision has a
// generic one-line note plus an "Explain more" button.
//
// "Explain more" fetches real, dated news coverage from around that
// decision AND a short AI-generated explanation of the situation/likely
// reasoning grounded in those same articles (see
// src/lib/rateDecisionExplainer.ts) — the sources are always listed right
// after the generated text, so nothing here is presented as fact without a
// real, clickable source next to it. If AI generation isn't available
// (no API key, or it fails), this falls back to showing just the raw
// source articles rather than any fabricated explanation.

import { useState } from "react";
import type { RateDecision } from "@/lib/centralBankRates";
import type { NewsArticle } from "@/lib/news";

function magnitudeLabel(bp: number): string {
  const abs = Math.abs(bp);
  if (abs % 100 === 0) return `${abs / 100}pp`;
  if (abs === 25) return "quarter-point";
  if (abs === 50) return "half-point";
  if (abs === 75) return "three-quarter-point";
  return `${abs}bp`;
}

function genericNote(d: RateDecision): string {
  const size = magnitudeLabel(d.changeBp);
  return d.type === "hike"
    ? `${size} hike: moves like this are typically used to cool inflation or an overheating economy by making borrowing more expensive.`
    : `${size} cut: moves like this are typically used to support a slowing economy by making borrowing and spending cheaper.`;
}

type DecisionDetail = {
  articles: NewsArticle[];
  explanation: string | null;
  explanationError: string | null;
};

function DecisionItem({ decision, bankName }: { decision: RateDecision; bankName: string }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<DecisionDetail | null>(null);
  const [error, setError] = useState(false);

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && detail === null && !loading) {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({
          bank: bankName,
          date: decision.date,
          rate: String(decision.rate),
          changeBp: String(decision.changeBp),
          type: decision.type,
        });
        const res = await fetch(`/api/bank-decision-news?${params}`);
        if (!res.ok) throw new Error("bad response");
        const json = await res.json();
        setDetail({
          articles: json.articles ?? [],
          explanation: json.explanation ?? null,
          explanationError: json.explanationError ?? null,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <li className="relative">
      <span
        className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${
          decision.type === "hike" ? "bg-negative" : "bg-positive"
        }`}
      />
      <p className="font-mono text-[11px] text-muted">{decision.date}</p>
      <p className="text-sm text-foreground">
        <span className="font-mono font-semibold">{decision.rate}%</span>{" "}
        <span className={decision.type === "hike" ? "text-negative" : "text-positive"}>
          ({decision.changeBp > 0 ? "+" : ""}
          {decision.changeBp}bp)
        </span>
      </p>
      <p className="mt-0.5 text-xs text-muted">{genericNote(decision)}</p>
      <button
        type="button"
        onClick={handleExpand}
        className="mt-1 text-xs text-accent hover:underline"
      >
        {expanded ? "Hide details ↑" : "Explain more ↓"}
      </button>
      {expanded && (
        <div className="mt-2 rounded-md border border-border bg-surface p-3">
          {loading && <p className="text-xs text-muted">Loading…</p>}
          {!loading && error && (
            <p className="text-xs text-muted">
              Could not load details for this decision. Try again later.
            </p>
          )}
          {!loading && !error && detail && (
            <>
              {detail.explanation && (
                <div className="mb-3">
                  <p className="mb-1 text-[11px] uppercase tracking-widest text-muted/70">
                    Situation &amp; likely reasoning (AI-generated, grounded in the
                    sources below)
                  </p>
                  <p className="text-xs leading-relaxed text-foreground">
                    {detail.explanation}
                  </p>
                </div>
              )}
              {!detail.explanation && detail.explanationError && (
                <p className="mb-3 text-xs text-muted">
                  Couldn&apos;t generate an AI explanation for this decision —
                  showing the real source articles below instead.
                </p>
              )}
              {detail.articles.length === 0 ? (
                <p className="text-xs text-muted">
                  No coverage found for this specific date window.
                </p>
              ) : (
                <>
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
                    {detail.explanation ? "Sources" : "Real coverage from around this decision"}
                  </p>
                  <ul className="space-y-2">
                    {detail.articles.map((a) => (
                      <li key={a.link}>
                        <a
                          href={a.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-foreground hover:text-accent"
                        >
                          {a.title}
                        </a>
                        <p className="text-[11px] text-muted">
                          {a.source ? `${a.source} · ` : ""}
                          {a.pubDate}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}

function YearSection({
  year,
  decisions,
  bankName,
  defaultOpen,
}: {
  year: string;
  decisions: RateDecision[];
  bankName: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-3 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{year}</span>
        <span className="text-xs text-muted">
          {decisions.length} move{decisions.length === 1 ? "" : "s"} {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ol className="mt-2 space-y-3 border-l border-border pl-4">
          {decisions.map((d) => (
            <DecisionItem key={d.date} decision={d} bankName={bankName} />
          ))}
        </ol>
      )}
    </div>
  );
}

export default function RateTimeline({
  decisions,
  bankName,
}: {
  decisions: RateDecision[];
  bankName: string;
}) {
  if (decisions.length === 0) {
    return (
      <p className="text-sm text-muted">
        No rate changes detected in the fetched history window.
      </p>
    );
  }

  const byYear = new Map<string, RateDecision[]>();
  for (const d of decisions) {
    const year = d.date.slice(0, 4);
    const list = byYear.get(year);
    if (list) list.push(d);
    else byYear.set(year, [d]);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <div className="space-y-1">
        {years.map((year, i) => (
          <YearSection
            key={year}
            year={year}
            decisions={byYear.get(year)!}
            bankName={bankName}
            defaultOpen={i === 0}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted/70">
        The one-line note next to each move is a general description of what
        that type of decision typically does, not this bank&apos;s own stated
        reason for that specific move. &quot;Explain more&quot; generates a
        short AI summary grounded only in the real, dated news articles
        listed as sources beneath it (never the bank&apos;s official
        statement, and it may say there isn&apos;t enough coverage to explain
        confidently).
      </p>
    </div>
  );
}
