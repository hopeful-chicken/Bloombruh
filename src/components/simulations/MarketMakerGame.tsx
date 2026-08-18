"use client";

// A simplified market-maker game — the seat a sales & trading analyst
// actually sits in. Everything here (the price walk, the customer order
// flow) is randomly generated, not real market data — labeled clearly.
// What's real is the mechanic: quote a bid/ask around a moving mid
// price, wider spreads earn more per trade but get hit less often,
// inventory you can't offload carries real mark-to-market risk, and a
// risk desk really does forcibly flatten you if you breach a position
// limit.
//
// Two upgrades over the first version, both borrowed from how real flow
// actually behaves:
//   1. ADVERSE SELECTION — some flow is informed. After you're filled,
//     the mid has a tendency to keep moving against you (the customer
//     "knew" something). Tighter quotes get you more fills, and more
//     fills mean more chances to get run over by someone with better
//     information. That's the real reason desks widen spreads, and it's
//     what makes the tight-spread strategy genuinely risky rather than
//     just boring.
//   2. VOL REGIMES — the session has news. Random "storm" windows arrive
//     where volatility and flow toxicity both spike; the spread that was
//     sensible in the calm is suddenly a way to get run over. Desks that
//     don't re-quote in a storm lose money; now so do you.
//
// The session ends with a desk review, not just a number: fills, spread
// capture, toxicity cost, limit breaches, and a grade — the same things
// a real desk head would ask about your book.

import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const STARTING_MID = 100;
const TICK_MS = 700;
const MAX_TICKS = 90;
const RISK_LIMIT = 40;
const TICK_VOL = 0.0022; // calm-regime per-tick vol (~realistic wiggle over a session)
const STORM_VOL_MULT = 2.6; // storm windows are genuinely dangerous
const STORM_PROB_PER_TICK = 0.022; // expected ~2 storms per 90-tick session
const TOXIC_PROB_CALM = 0.35; // chance a fill was informed (calm)
const TOXIC_PROB_STORM = 0.6; // and in a storm, most flow knows something
const TOXIC_DRIFT = 0.0016; // how far the mid keeps moving against you after a toxic fill

type Tick = { tick: number; mid: number; pnl: number; inventory: number };
type Trade = { tick: number; side: "buy" | "sell"; price: number };

function randNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default function MarketMakerGame() {
  const [halfSpreadCents, setHalfSpreadCents] = useState(15);
  const [mid, setMid] = useState(STARTING_MID);
  const [cash, setCash] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState<Tick[]>([{ tick: 0, mid: STARTING_MID, pnl: 0, inventory: 0 }]);
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const [breaches, setBreaches] = useState(0);
  const [running, setRunning] = useState(false);
  const [fills, setFills] = useState({ buys: 0, sells: 0, noTrade: 0 });
  const [storm, setStorm] = useState(false);
  const [toxicFills, setToxicFills] = useState(0);
  const [toxicCost, setToxicCost] = useState(0);
  const [maxInventory, setMaxInventory] = useState(0);
  const [spreadCaptured, setSpreadCaptured] = useState(0);

  // The interval callback reads the spread through a ref so it always sees
  // the latest slider position without re-creating the interval. Synced in
  // an effect (never during render — the React compiler rightly forbids
  // render-time ref writes).
  const halfSpreadRef = useRef(halfSpreadCents);
  useEffect(() => {
    halfSpreadRef.current = halfSpreadCents;
  }, [halfSpreadCents]);
  const midRef = useRef(mid);
  const cashRef = useRef(cash);
  const inventoryRef = useRef(inventory);
  const intervalRef = useRef<number | null>(null);
  const tickCountRef = useRef(0);
  const stormTicksLeftRef = useRef(0);
  const lastFillSideRef = useRef<"buy" | "sell" | null>(null);
  const toxicCostRef = useRef(0);
  const toxicFillsRef = useRef(0);
  const maxInventoryRef = useRef(0);
  const spreadCapturedRef = useRef(0);

  function halfSpreadCentsGlobal() {
    return halfSpreadRef.current;
  }

  function stepTick() {
    // Weather first: storms arrive unannounced and end the same way.
    if (stormTicksLeftRef.current > 0) {
      stormTicksLeftRef.current -= 1;
      if (stormTicksLeftRef.current === 0) setStorm(false);
    } else if (tickCountRef.current > 10 && tickCountRef.current < MAX_TICKS - 12 && Math.random() < STORM_PROB_PER_TICK) {
      stormTicksLeftRef.current = 8 + Math.floor(Math.random() * 7);
      setStorm(true);
    }
    const inStorm = stormTicksLeftRef.current > 0;
    const vol = TICK_VOL * (inStorm ? STORM_VOL_MULT : 1);

    // Adverse selection: if we were filled last tick, that fill may have
    // been informed — the mid keeps drifting against us with a real
    // probability. This is the cost of getting fills that the P&L shows
    // but a naive spread model doesn't warn you about.
    let adverseShift = 0;
    if (lastFillSideRef.current) {
      const toxicProb = inStorm ? TOXIC_PROB_STORM : TOXIC_PROB_CALM;
      if (Math.random() < toxicProb) {
        // We bought (customer sold to us) → informed sellers are followed by lower prices.
        const direction = lastFillSideRef.current === "buy" ? -1 : 1;
        adverseShift = direction * midRef.current * TOXIC_DRIFT * (0.5 + Math.random());
        toxicCostRef.current += Math.abs(adverseShift);
        toxicFillsRef.current += 1;
        setToxicCost(toxicCostRef.current);
        setToxicFills(toxicFillsRef.current);
      }
    }

    const newMid = midRef.current * (1 + randNormal() * vol) + adverseShift;
    const halfSpread = halfSpreadRef.current / 100;
    const bid = newMid - halfSpread;
    const ask = newMid + halfSpread;

    // Tighter spreads get hit more often — a real market-microstructure
    // trade-off, simplified into one formula.
    const fillProb = Math.max(0.06, Math.min(0.85, 0.85 - halfSpreadCentsGlobal() * 0.012));
    const roll = Math.random();
    let newCash = cashRef.current;
    let newInventory = inventoryRef.current;
    let trade: Trade | null = null;

    if (roll < fillProb / 2) {
      // customer sells to us, we buy at our bid
      newCash -= bid;
      newInventory += 1;
      trade = { tick: tickCountRef.current + 1, side: "buy", price: bid };
      setFills((f) => ({ ...f, buys: f.buys + 1 }));
      spreadCapturedRef.current += halfSpread;
      setSpreadCaptured(spreadCapturedRef.current);
      lastFillSideRef.current = "buy";
    } else if (roll < fillProb) {
      // customer buys from us, we sell at our ask
      newCash += ask;
      newInventory -= 1;
      trade = { tick: tickCountRef.current + 1, side: "sell", price: ask };
      setFills((f) => ({ ...f, sells: f.sells + 1 }));
      spreadCapturedRef.current += halfSpread;
      setSpreadCaptured(spreadCapturedRef.current);
      lastFillSideRef.current = "sell";
    } else {
      setFills((f) => ({ ...f, noTrade: f.noTrade + 1 }));
      lastFillSideRef.current = null;
    }

    // Risk desk intervention: forcibly flatten toward the limit at a
    // punitive price if inventory breaches the risk limit.
    if (Math.abs(newInventory) > RISK_LIMIT) {
      const excess = Math.abs(newInventory) - RISK_LIMIT;
      const flattenQty = Math.min(excess, 5);
      const penalty = halfSpread * 4; // forced hedges pay up
      if (newInventory > 0) {
        newCash += flattenQty * (newMid - penalty);
        newInventory -= flattenQty;
      } else {
        newCash -= flattenQty * (newMid + penalty);
        newInventory += flattenQty;
      }
      setBreaches((b) => b + 1);
    }

    midRef.current = newMid;
    cashRef.current = newCash;
    inventoryRef.current = newInventory;
    tickCountRef.current += 1;
    if (Math.abs(newInventory) > maxInventoryRef.current) {
      maxInventoryRef.current = Math.abs(newInventory);
      setMaxInventory(maxInventoryRef.current);
    }

    const pnl = newCash + newInventory * newMid;
    setMid(newMid);
    setCash(newCash);
    setInventory(newInventory);
    setTickCount(tickCountRef.current);
    setLastTrade(trade);
    setHistory((h) => [...h, { tick: tickCountRef.current, mid: newMid, pnl, inventory: newInventory }]);
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      if (tickCountRef.current >= MAX_TICKS) {
        setRunning(false);
        return;
      }
      stepTick();
    }, TICK_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function start() {
    reset();
    setRunning(true);
  }

  function resume() {
    setRunning(true);
  }

  function endSession() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    midRef.current = STARTING_MID;
    cashRef.current = 0;
    inventoryRef.current = 0;
    tickCountRef.current = 0;
    stormTicksLeftRef.current = 0;
    lastFillSideRef.current = null;
    toxicCostRef.current = 0;
    toxicFillsRef.current = 0;
    maxInventoryRef.current = 0;
    spreadCapturedRef.current = 0;
    setMid(STARTING_MID);
    setCash(0);
    setInventory(0);
    setTickCount(0);
    setHistory([{ tick: 0, mid: STARTING_MID, pnl: 0, inventory: 0 }]);
    setLastTrade(null);
    setBreaches(0);
    setFills({ buys: 0, sells: 0, noTrade: 0 });
    setStorm(false);
    setToxicFills(0);
    setToxicCost(0);
    setMaxInventory(0);
    setSpreadCaptured(0);
  }

  const pnl = cash + inventory * mid;
  const done = tickCount >= MAX_TICKS;
  const bid = mid - halfSpreadCents / 100;
  const ask = mid + halfSpreadCents / 100;
  const inventoryPct = Math.min(100, (Math.abs(inventory) / RISK_LIMIT) * 100);
  const inventoryColor = inventoryPct > 90 ? "text-red-500" : inventoryPct > 60 ? "text-accent" : "text-foreground";
  const totalFills = fills.buys + fills.sells;

  // The desk review. What actually hurt or helped you, in the desk head's
  // order of priorities: did you lose money, did you breach limits, and
  // do you understand WHY your P&L looks the way it does.
  function deskReview(): { grade: string; title: string; lines: string[] } {
    const lines: string[] = [];
    lines.push(
      `Final P&L ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} on ${totalFills} fills; you captured $${spreadCaptured.toFixed(2)} of quoted spread.`
    );
    if (toxicFills > 0) {
      lines.push(
        `${toxicFills} of your fills looked informed — they cost you ~$${toxicCost.toFixed(2)} in adverse moves after the fill. That is the hidden price of tight quotes; it never shows up in the spread, only in the P&L.`
      );
    }
    if (breaches > 0) {
      lines.push(
        `${breaches} risk-limit breach${breaches === 1 ? "" : "es"}. Forced hedges pay penalty prices; on a real desk two of those in a session gets your limits cut.`
      );
    }
    lines.push(`Largest position you carried: ${maxInventory} shares (limit ±${RISK_LIMIT}).`);

    if (pnl > 0 && breaches === 0) {
      return {
        grade: "A",
        title: "Desk increases your limits.",
        lines: [...lines, "Profitable with no breaches — and you survived the storms. That's the job."],
      };
    }
    if (pnl > 0) {
      return {
        grade: "B",
        title: "You keep your seat — barely.",
        lines: [...lines, "Profitable, but the breaches are what the desk head remembers. P&L made the wrong way gets found out."],
      };
    }
    return {
      grade: breaches >= 2 ? "D" : "C",
      title: breaches >= 2 ? "Limits cut. Come back Monday." : "The desk watches you.",
      lines: [
        ...lines,
        totalFills < MAX_TICKS * 0.25
          ? "You barely traded — a spread so wide it never gets hit is not a strategy, it's hiding."
          : "Work out whether the toxicity or the sizing did the damage, then run it again.",
      ],
    };
  }

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-5">
      {!running && tickCount === 0 && (
        <div>
          <p className="text-sm text-muted">
            You quote a bid and ask around a moving mid price for {MAX_TICKS} ticks. A tighter
            spread gets hit more often but earns less per trade — and every fill is a chance the
            customer knew something you didn&apos;t. Breach the ±{RISK_LIMIT}-share risk limit and
            the desk will forcibly hedge you at a penalty price. Watch for storms.
          </p>
          <label className="mt-4 block text-xs text-muted">
            Half-spread (cents): <span className="text-accent">{halfSpreadCents}</span>
          </label>
          <input
            type="range"
            min={2}
            max={60}
            value={halfSpreadCents}
            onChange={(e) => setHalfSpreadCents(Number(e.target.value))}
            className="mt-1 w-full max-w-xs accent-accent"
          />
          <div>
            <button
              onClick={start}
              className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Start session
            </button>
          </div>
        </div>
      )}

      {(running || tickCount > 0) && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">
              Tick {tickCount} / {MAX_TICKS}
            </p>
            <label className="flex items-center gap-2 text-xs text-muted">
              Half-spread:
              <input
                type="range"
                min={2}
                max={60}
                value={halfSpreadCents}
                onChange={(e) => setHalfSpreadCents(Number(e.target.value))}
                className="accent-accent"
              />
              <span className="text-accent">{halfSpreadCents}c</span>
            </label>
          </div>

          {storm && (
            <p className="mt-3 rounded-md border border-[var(--color-negative)]/50 bg-[var(--color-negative)]/10 px-3 py-1.5 text-xs text-[var(--color-negative)]">
              NEWS — volatility spike. Flow just got faster and better-informed. The spread you set
              in the calm is now a way to get run over.
            </p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Mid" value={`$${mid.toFixed(2)}`} />
            <Stat label="Your bid / ask" value={`$${bid.toFixed(2)} / $${ask.toFixed(2)}`} />
            <Stat label="Inventory" value={`${inventory > 0 ? "+" : ""}${inventory}`} valueClass={inventoryColor} />
            <Stat label="Cash" value={`$${cash.toFixed(2)}`} />
            <Stat label="Mark-to-market P&L" value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`} valueClass={pnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"} />
          </div>

          {breaches > 0 && (
            <p className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent">
              Risk limit breached {breaches}x. Desk forcibly hedged part of your position at a
              penalty price.
            </p>
          )}

          {lastTrade && (
            <p className="mt-2 text-xs text-muted">
              Last fill: customer {lastTrade.side === "buy" ? "sold to you" : "bought from you"} at
              ${lastTrade.price.toFixed(2)} (tick {lastTrade.tick})
            </p>
          )}

          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="tick" tick={{ fontSize: 10, fill: "var(--color-muted)" }} />
                <YAxis
                  yAxisId="pnl"
                  tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                  width={45}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: 12 }}
                  formatter={(v, name) => [`$${Number(v).toFixed(2)}`, name]}
                />
                <ReferenceLine yAxisId="pnl" y={0} stroke="var(--color-border)" strokeDasharray="3 3" />
                <Line yAxisId="pnl" dataKey="pnl" name="P&L" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center gap-3">
            {running ? (
              <button
                onClick={endSession}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
              >
                End session
              </button>
            ) : (
              <button
                onClick={done ? start : resume}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                {done ? "Play again" : "Resume"}
              </button>
            )}
          </div>

          {done && !running && (
            <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
              {(() => {
                const review = deskReview();
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-mono text-lg font-semibold text-background">
                        {review.grade}
                      </span>
                      <p className="text-sm font-medium text-foreground">{review.title}</p>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {review.lines.map((line, i) => (
                        <li key={i} className="text-xs leading-relaxed text-muted">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted/70">{label}</p>
      <p className={`mt-1 font-mono text-sm ${valueClass ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}
