"use client";

// A simplified market-maker game — the seat a sales & trading analyst
// actually sits in. Everything here (the price walk, the customer order
// flow) is randomly generated, not real market data — labeled clearly.
// What's real is the mechanic: quote a bid/ask around a moving mid
// price, wider spreads earn more per trade but get hit less often,
// inventory you can't offload carries real mark-to-market risk, and a
// risk desk really does forcibly flatten you if you breach a position
// limit. That trade-off is the entire job.

import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const STARTING_MID = 100;
const TICK_MS = 700;
const MAX_TICKS = 90;
const RISK_LIMIT = 40;
const TICK_VOL = 0.0022; // ~ generates realistic-looking wiggle over a 90-tick session

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

  const halfSpreadRef = useRef(halfSpreadCents);
  halfSpreadRef.current = halfSpreadCents;
  const midRef = useRef(mid);
  const cashRef = useRef(cash);
  const inventoryRef = useRef(inventory);
  const intervalRef = useRef<number | null>(null);
  const tickCountRef = useRef(0);

  function halfSpreadCentsGlobal() {
    return halfSpreadRef.current;
  }

  function stepTick() {
    const newMid = midRef.current * (1 + randNormal() * TICK_VOL);
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
    } else if (roll < fillProb) {
      // customer buys from us, we sell at our ask
      newCash += ask;
      newInventory -= 1;
      trade = { tick: tickCountRef.current + 1, side: "sell", price: ask };
      setFills((f) => ({ ...f, sells: f.sells + 1 }));
    } else {
      setFills((f) => ({ ...f, noTrade: f.noTrade + 1 }));
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
    setMid(STARTING_MID);
    setCash(0);
    setInventory(0);
    setTickCount(0);
    setHistory([{ tick: 0, mid: STARTING_MID, pnl: 0, inventory: 0 }]);
    setLastTrade(null);
    setBreaches(0);
    setFills({ buys: 0, sells: 0, noTrade: 0 });
  }

  const pnl = cash + inventory * mid;
  const done = tickCount >= MAX_TICKS;
  const bid = mid - halfSpreadCents / 100;
  const ask = mid + halfSpreadCents / 100;
  const inventoryPct = Math.min(100, (Math.abs(inventory) / RISK_LIMIT) * 100);
  const inventoryColor = inventoryPct > 90 ? "text-red-500" : inventoryPct > 60 ? "text-accent" : "text-foreground";

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-5">
      {!running && tickCount === 0 && (
        <div>
          <p className="text-sm text-muted">
            You quote a bid and ask around a moving mid price for {MAX_TICKS} ticks. A tighter
            spread gets hit more often but earns less per trade; a wider spread earns more per
            trade but gets hit less. Breach the ±{RISK_LIMIT}-share risk limit and the desk will
            forcibly hedge you at a penalty price.
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

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Mid" value={`$${mid.toFixed(2)}`} />
            <Stat label="Your bid / ask" value={`$${bid.toFixed(2)} / $${ask.toFixed(2)}`} />
            <Stat label="Inventory" value={`${inventory > 0 ? "+" : ""}${inventory}`} valueClass={inventoryColor} />
            <Stat label="Cash" value={`$${cash.toFixed(2)}`} />
            <Stat label="Mark-to-market P&L" value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`} valueClass={pnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"} />
          </div>

          {breaches > 0 && (
            <p className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent">
              Risk limit breached {breaches}x — desk forcibly hedged part of your position at a
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
              <p className="text-sm font-medium text-foreground">Session complete</p>
              <p className="mt-1 text-sm text-muted">
                Final P&L: <span className={pnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}>
                  {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                </span>{" "}
                · {fills.buys + fills.sells} fills ({fills.buys} bought from customers,{" "}
                {fills.sells} sold to customers) out of {MAX_TICKS} ticks · {breaches} risk-limit
                breaches.
              </p>
              <p className="mt-1 text-xs text-muted">
                Tighter spreads fill more often but earn less per trade; wider spreads are the
                opposite. Try both and compare your final P&L.
              </p>
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
