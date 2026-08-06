"use client";

// Code gate for stock pitches — shown immediately (right where you land
// after clicking a pitch on /analysis), before any of the pitch content.
// Same friction-gate pattern as AiGrader.tsx elsewhere on this site: one
// shared, hardcoded code, unlock state cached in localStorage so you don't
// have to retype it on every pitch. NOT real security — anyone reading the
// client bundle can find the code — but that was always meant to be the
// only gap.
//
// This component used to take the pitch content as `children` and simply
// hide them until `unlocked` was true. That had a real bug: React Server
// Components serialize `children` into the page's HTML/RSC payload
// regardless of whether the client ever renders them, so the full pitch
// text was sitting in plain "view source" for anyone, whether or not they
// ever touched the code. Fixed by not shipping the content to the client
// at all until after the code is verified server-side: once unlocked,
// this component fetches the actual body/toolkit/news from
// /api/pitch-content (which checks the code again, server-side, before
// returning anything) rather than revealing something it already had.

import { useEffect, useState } from "react";
import { PITCH_UNLOCK_CODE as UNLOCK_CODE, PITCH_UNLOCK_STORAGE_KEY as STORAGE_KEY } from "@/lib/pitchUnlock";
import MarkdownContent from "@/components/research/MarkdownContent";
import PitchNewsSection from "@/components/research/PitchNewsSection";
import AnalysisPriceChart from "@/components/research/AnalysisPriceChart";
import type { NewsArticle } from "@/lib/news";
import type { AnalysisChart } from "@/data/analysis";

type PitchContent = {
  title: string;
  tagline: string;
  date: string;
  body: string;
  toolkit: string | null;
  chart: AnalysisChart | null;
  news: { articles: NewsArticle[]; narrative: string | null; narrativeError: string | null } | null;
};

export default function PitchToolkitGate({ pitchId }: { pitchId: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [content, setContent] = useState<PitchContent | null>(null);
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

    const params = new URLSearchParams({ id: pitchId, code: UNLOCK_CODE });
    fetch(`/api/pitch-content?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: PitchContent) => {
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
  }, [unlocked, pitchId, content]);

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
          My own work — locked while I build it
        </h3>
        <p className="mt-2 text-sm text-muted">Enter the code to view.</p>
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
    return <p className="mt-8 text-sm text-muted">Loading the full pitch…</p>;
  }

  if (fetchError || !content) {
    return (
      <p className="mt-8 text-sm text-muted">
        Couldn&apos;t load this pitch right now — refresh to try again.
      </p>
    );
  }

  return (
    <>
      <p className="font-mono mt-4 text-[11px] text-muted">{content.date}</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {content.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{content.tagline}</p>
      <div className="mt-8 border-t border-border pt-6">
        <MarkdownContent markdown={content.body} />
      </div>
      {content.chart && <AnalysisPriceChart chart={content.chart} />}
      {content.news && (
        <PitchNewsSection
          narrative={content.news.narrative}
          narrativeError={content.news.narrativeError}
          articles={content.news.articles}
        />
      )}
      {content.toolkit && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-module-analysis">
            Research Toolkit
          </p>
          <MarkdownContent markdown={content.toolkit} />
        </div>
      )}
    </>
  );
}
