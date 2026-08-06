"use client";

// Gate for the /analysis index itself — the write-ups list, the stock
// pitches list, and the leads list are not rendered by the page at all;
// this component fetches them from /api/analysis-index only after the
// code checks out server-side. Same shared code/localStorage key as
// PitchToolkitGate, so unlocking once here also unlocks the individual
// pitch and write-up pages (and vice versa) — one gate for the whole
// section, not nine separate ones.

import { useEffect, useState } from "react";
import Link from "next/link";
import { PITCH_UNLOCK_CODE as UNLOCK_CODE, PITCH_UNLOCK_STORAGE_KEY as STORAGE_KEY } from "@/lib/pitchUnlock";

type IndexEntry = { id: string; title: string; tagline: string; date: string };
type Lead = { id: string; date: string; sentence: string; source: { label: string; url: string } };
type IndexContent = { entries: IndexEntry[]; pitches: IndexEntry[]; leads: Lead[] };

function EntryRow({ entry, locked }: { entry: IndexEntry; locked?: boolean }) {
  return (
    <Link
      href={`/analysis/${entry.id}`}
      className="block rounded-lg border border-border bg-surface/40 p-4 transition-colors hover:border-module-analysis/60 hover:bg-surface/70"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted">{entry.date}</p>
        {locked && (
          <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            Locked
          </span>
        )}
      </div>
      <h3 className="font-display mt-0.5 text-base font-semibold text-foreground group-hover:text-module-analysis">
        {entry.title}
      </h3>
      <p className="mt-1 text-sm text-muted">{entry.tagline}</p>
    </Link>
  );
}

export default function AnalysisIndexGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [content, setContent] = useState<IndexContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked || content) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    fetch(`/api/analysis-index?code=${encodeURIComponent(UNLOCK_CODE)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: IndexContent) => {
        if (!cancelled) setContent(body);
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [unlocked, content]);

  function handleUnlock() {
    if (codeInput === UNLOCK_CODE) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }

  if (!unlocked) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border p-5">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
          My Analysis is locked
        </h3>
        <p className="mt-2 text-sm text-muted">
          Write-ups, stock pitches, and the leads list — kept out of public view, unlocked with a
          code. One code unlocks the whole section.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              setCodeError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Unlock code"
            className="w-44 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={handleUnlock}
            className="rounded-md border border-accent px-3 py-2 text-xs text-accent hover:bg-accent/10"
          >
            Unlock
          </button>
        </div>
        {codeError && <p className="mt-2 text-xs text-negative">Wrong code — try again.</p>}
      </div>
    );
  }

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  if (fetchError || !content) {
    return (
      <p className="mt-8 text-sm text-muted">
        Couldn&apos;t load this right now — refresh to try again.
      </p>
    );
  }

  return (
    <>
      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Write-Ups</h2>
        <div className="mt-3 space-y-2.5">
          {content.entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Stock Pitches</h2>
        <div className="mt-3 space-y-2.5">
          {content.pitches.map((entry) => (
            <EntryRow key={entry.id} entry={entry} locked />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-10">
        <p className="font-mono text-xs uppercase tracking-widest text-module-analysis">Worth Digging Into</p>
        <h2 className="font-display mt-1 text-xl font-semibold text-foreground">
          A running leads list
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          One sentence, one source, dropped here as-is — not deep-researched or cross-checked the
          way the pieces above are. A single source can be wrong, outdated, or missing context,
          so treat every line below as a starting point, not a finished fact.
        </p>

        <ul className="mt-6 space-y-4">
          {content.leads.map((lead) => (
            <li key={lead.id} className="rounded-lg border border-border bg-surface/40 p-4">
              <p className="text-sm leading-relaxed text-foreground">{lead.sentence}</p>
              <p className="mt-2 text-xs text-muted">
                {lead.date} ·{" "}
                <a
                  href={lead.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-accent"
                >
                  {lead.source.label}
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
