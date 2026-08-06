"use client";

// A playable, simplified version of Pymetrics' real Balloon Game. The
// real game measures risk tolerance by seeing how much you inflate a
// balloon (each pump banks a bit more money into that balloon's pot,
// but raises the chance it pops and you lose that balloon's pot) before
// cashing out. This is an honest simplification for practice/intuition,
// not a real psychometric instrument — the pop-probability curve here is
// a reasonable guess, not Pymetrics' actual proprietary algorithm, and
// the "profile" text at the end is descriptive, not a real assessment.

import { useState } from "react";

const MAX_BALLOONS = 10;
const PER_PUMP_VALUE = 5;
const BASE_POP_CHANCE = 0.02;
const POP_CHANCE_GROWTH = 0.012;

type BalloonResult = { pumps: number; popped: boolean; banked: number };

export default function BalloonGame() {
  const [pumps, setPumps] = useState(0);
  const [popped, setPopped] = useState(false);
  const [results, setResults] = useState<BalloonResult[]>([]);
  const [totalBanked, setTotalBanked] = useState(0);

  const balloonNumber = results.length + 1;
  const done = results.length >= MAX_BALLOONS;
  const currentPot = pumps * PER_PUMP_VALUE;
  const balloonSize = 60 + pumps * 6;

  function pump() {
    if (popped || done) return;
    const popChance = BASE_POP_CHANCE + pumps * POP_CHANCE_GROWTH;
    if (Math.random() < popChance) {
      setPopped(true);
      setResults((r) => [...r, { pumps, popped: true, banked: 0 }]);
      return;
    }
    setPumps((p) => p + 1);
  }

  function cashOut() {
    if (popped || done || pumps === 0) return;
    setTotalBanked((t) => t + currentPot);
    setResults((r) => [...r, { pumps, popped: false, banked: currentPot }]);
    setPumps(0);
  }

  function nextBalloon() {
    setPumps(0);
    setPopped(false);
  }

  function reset() {
    setPumps(0);
    setPopped(false);
    setResults([]);
    setTotalBanked(0);
  }

  const avgPumps =
    results.length > 0 ? results.reduce((s, r) => s + r.pumps, 0) / results.length : 0;
  const poppedCount = results.filter((r) => r.popped).length;

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-5">
      {!done ? (
        <>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Balloon {balloonNumber} of {MAX_BALLOONS}
            </span>
            <span>Banked so far: ${totalBanked}</span>
          </div>

          <div className="mt-4 flex h-40 items-end justify-center">
            <div
              className={[
                "rounded-full transition-all duration-150",
                popped ? "opacity-0" : "bg-accent/70",
              ].join(" ")}
              style={{ width: balloonSize, height: balloonSize }}
            />
          </div>

          <p className="text-center font-mono text-lg text-foreground">
            {popped ? "Popped! Lost this balloon's pot." : `Current pot: $${currentPot}`}
          </p>

          <div className="mt-4 flex justify-center gap-3">
            {!popped ? (
              <>
                <button
                  onClick={pump}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                  Pump (+${PER_PUMP_VALUE})
                </button>
                <button
                  onClick={cashOut}
                  disabled={pumps === 0}
                  className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent disabled:opacity-40"
                >
                  Cash out
                </button>
              </>
            ) : (
              <button
                onClick={nextBalloon}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Next balloon →
              </button>
            )}
          </div>
        </>
      ) : (
        <div>
          <p className="font-display text-lg font-semibold text-foreground">Session complete</p>
          <p className="mt-2 text-sm text-muted">
            Total banked: <span className="text-accent">${totalBanked}</span> across{" "}
            {MAX_BALLOONS} balloons. Average pumps before cashing out or popping:{" "}
            {avgPumps.toFixed(1)}. Popped {poppedCount} of {MAX_BALLOONS} times.
          </p>
          <p className="mt-2 text-xs text-muted">
            More pumps on average, and more pops, generally reads as higher risk tolerance in the
            real game&apos;s framework — fewer pumps and consistent early cash-outs reads as more
            risk-averse. This is a simplified illustration of the mechanic, not Pymetrics&apos;
            real scoring algorithm, and it isn&apos;t telling you anything diagnostic about
            yourself.
          </p>
          <button
            onClick={reset}
            className="mt-4 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
