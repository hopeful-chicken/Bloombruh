"use client";

// The "Pro" AI report-grading feature. This is the first (and so far only)
// part of the site gated behind a code, and the first feature that costs
// real money per use (a Claude API call on Adam's own Anthropic key) —
// everything else on the site is free, public data. See docs/DECISIONS.md
// for why a hardcoded unlock code instead of real payment: it's a
// deliberate placeholder until there's an actual monetization plan.
//
// Unlock state persists in localStorage (no user accounts exist in this
// project) so a student doesn't have to retype the code every visit. This
// is NOT real security — anyone reading the client bundle could find the
// code — it's just a friction gate, exactly as intended for now.

import { useEffect, useState } from "react";
import type { Block, StatEntry } from "@/lib/reportBlocks";
import type { GradeResult } from "@/lib/grading";
import type { Rating } from "./PitchWorkbench";

const UNLOCK_CODE = "bloombruh";
const STORAGE_KEY = "bloombruh-pro-unlocked";

type Props = {
  symbol: string;
  companyName: string;
  price: number;
  rating: Rating;
  targetPrice: number | null;
  availableStats: StatEntry[];
  blocks: Block[];
};

export default function AiGrader(props: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  function handleUnlock() {
    if (codeInput.trim().toLowerCase() === UNLOCK_CODE) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  }

  async function handleGrade() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: props.symbol,
          companyName: props.companyName,
          price: props.price,
          rating: props.rating,
          targetPrice: props.targetPrice,
          availableStats: props.availableStats,
          blocks: props.blocks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI grading failed.");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Couldn't reach the AI grader — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-border p-5">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
          Pro — AI report grading
        </h3>
        <p className="mt-2 text-sm text-muted">
          Get specific, fact-checked feedback on your written sections from
          Claude — a paid feature, unlocked with a code for now while this
          is still in testing.
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
            className="w-40 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={handleUnlock}
            className="rounded-md border border-accent px-3 py-2 text-xs text-accent hover:bg-accent/10"
          >
            Unlock
          </button>
        </div>
        {codeError && (
          <p className="mt-2 text-xs text-negative">Wrong code — try again.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-accent">
          Pro — AI report grading
        </h3>
        <button
          type="button"
          onClick={handleGrade}
          disabled={loading}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Grading…" : "Grade my report"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-negative">{error}</p>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-3xl font-semibold text-accent">
              {Math.round(result.overallScore)}
              <span className="text-base text-muted">/100</span>
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {result.overallSummary}
          </p>

          {result.strengths.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-positive">
                Strengths
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-muted">
                {result.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-negative">
                To improve
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-muted">
                {result.weaknesses.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {result.factCheckNotes.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-accent">
                Fact-check notes
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-muted">
                {result.factCheckNotes.map((n) => (
                  <li key={n}>• {n}</li>
                ))}
              </ul>
            </div>
          )}

          {result.sectionFeedback.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-muted">
                Section-by-section
              </h4>
              <div className="mt-2 space-y-2">
                {result.sectionFeedback.map((sf) => (
                  <div
                    key={sf.blockTitle}
                    className="rounded-md border border-border bg-surface p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {sf.blockTitle}
                      </p>
                      {sf.score !== null && (
                        <p className="font-mono text-xs text-accent">{sf.score}/10</p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">{sf.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
