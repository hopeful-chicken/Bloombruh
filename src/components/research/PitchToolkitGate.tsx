"use client";

// Code gate for stock pitches — shown immediately (right where you land
// after clicking a pitch on /analysis), before any of the pitch content.
// Same pattern as AiGrader.tsx (this site's only other gated feature):
// one shared, hardcoded code, unlock state in localStorage. This is NOT
// real security — anyone reading the client bundle can find the code —
// it's a friction gate, not a real access-control system.

import { useEffect, useState } from "react";

const UNLOCK_CODE = "vq55jh68&*";
const STORAGE_KEY = "bloombruh-pitch-toolkit-unlocked";

export default function PitchToolkitGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

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
          This pitch is locked
        </h3>
        <p className="mt-2 text-sm text-muted">
          The full pitch, plus the research toolkit behind it (tools, sources, and a
          step-by-step build guide) — kept out of public view, unlocked with a code.
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

  return <>{children}</>;
}
