"use client";

// Filterable technical question bank. Filter by category (the gap topics
// this module targets — accounting/three-statement, valuation/technicals,
// deal & case) and by firm type, then expand a question to reveal the
// model answer. Client-only: no data fetching, just filtering state.

import { useMemo, useState } from "react";
import { FIRM_TYPES, TECH_QUESTIONS, type TechQuestion } from "@/data/testPrep";

const CATEGORIES: TechQuestion["category"][] = [
  "Accounting & Three-Statement",
  "Valuation & Technicals",
  "Deal & Case",
];

export default function QuestionBank() {
  const [category, setCategory] = useState<TechQuestion["category"] | "All">("All");
  const [firmType, setFirmType] = useState<string | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return TECH_QUESTIONS.filter((q) => {
      if (category !== "All" && q.category !== category) return false;
      if (firmType !== "All" && !q.firmTypes.includes(firmType)) return false;
      return true;
    });
  }, [category, firmType]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("All")}
          className={[
            "rounded-full border px-3 py-1 text-xs transition-colors",
            category === "All"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:text-foreground",
          ].join(" ")}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              "rounded-full border px-3 py-1 text-xs transition-colors",
              category === c
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={() => setFirmType("All")}
          className={[
            "rounded-full px-3 py-1 text-[11px] transition-colors",
            firmType === "All" ? "text-accent underline" : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          All firm types
        </button>
        {FIRM_TYPES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFirmType(f.id)}
            className={[
              "rounded-full px-3 py-1 text-[11px] transition-colors",
              firmType === f.id ? "text-accent underline" : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {f.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        {filtered.length} question{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="mt-3 space-y-2">
        {filtered.map((q) => {
          const isOpen = openId === q.id;
          return (
            <div key={q.id} className="rounded-lg border border-border bg-surface/40">
              <button
                onClick={() => setOpenId(isOpen ? null : q.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                    {q.category}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{q.question}</p>
                </div>
                <span className="mt-1 shrink-0 text-xs text-accent">{isOpen ? "hide" : "show"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-sm leading-relaxed text-muted">{q.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
