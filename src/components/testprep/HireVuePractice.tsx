"use client";

// Write-and-save HireVue practice. Real HireVue rounds are timed video —
// this site can't record video, so this is the honest substitute: answer
// in writing first (which is how you should actually prepare — knowing
// what you want to say before you're on camera), with a simple stopwatch
// so you can see how long a real answer runs. Drafts persist in
// localStorage per prompt id (no accounts/database in this project).

import { useEffect, useState } from "react";
import { FIRM_TYPES, HIREVUE_PROMPTS, type HireVuePrompt } from "@/data/testPrep";

const STORAGE_PREFIX = "bloombruh-hirevue-";

const CATEGORIES: HireVuePrompt["category"][] = ["Behavioral", "Motivational", "Technical"];

export default function HireVuePractice() {
  const [category, setCategory] = useState<HireVuePrompt["category"] | "All">("All");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timing, setTiming] = useState(false);

  const filtered = HIREVUE_PROMPTS.filter((p) => category === "All" || p.category === category);
  const prompt = filtered[index % filtered.length];

  useEffect(() => {
    if (typeof window === "undefined" || !prompt) return;
    const stored = window.localStorage.getItem(STORAGE_PREFIX + prompt.id);
    setAnswer(stored ?? "");
    setSaved(false);
    setSeconds(0);
    setTiming(false);
  }, [prompt?.id]);

  useEffect(() => {
    if (!timing) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timing]);

  if (!prompt) return null;

  function save() {
    window.localStorage.setItem(STORAGE_PREFIX + prompt.id, answer);
    setSaved(true);
    setTiming(false);
  }

  function next() {
    setIndex((i) => (i + 1) % filtered.length);
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setCategory("All");
            setIndex(0);
          }}
          className={[
            "rounded-full border px-3 py-1 text-xs transition-colors",
            category === "All"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:text-foreground",
          ].join(" ")}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setIndex(0);
            }}
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

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted/70">
        {prompt.category} · asked at:{" "}
        {prompt.firmTypes.map((id) => FIRM_TYPES.find((f) => f.id === id)?.name).join(", ")}
      </p>
      <p className="mt-1.5 text-base text-foreground">{prompt.prompt}</p>
      <p className="mt-1.5 text-xs text-muted">{prompt.tip}</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="font-mono text-sm text-accent">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
        <button
          onClick={() => setTiming((t) => !t)}
          className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:border-accent"
        >
          {timing ? "Pause timer" : "Start timer"}
        </button>
        <span className="text-xs text-muted">
          real HireVue answers are usually capped 60-180 seconds
        </span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setSaved(false);
        }}
        rows={6}
        placeholder="Write your answer here..."
        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Save draft
        </button>
        <button
          onClick={next}
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
        >
          Next prompt →
        </button>
        {saved && <span className="text-xs text-accent">Saved to this browser</span>}
      </div>
    </div>
  );
}
