// Real daily US market movers from Alpha Vantage — an async server
// component that fetches its own data, so it can just be dropped into
// Markets Overview without threading props through the page. Fails
// silently (renders nothing) rather than showing a broken panel if the
// free-tier quota is exhausted for the day — this is a bonus panel, not
// core to the page.

import { getTopMovers, type MarketMover } from "@/lib/alphaVantage";

function MoverRow({ mover, showPositive }: { mover: MarketMover; showPositive: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-b-0">
      <span className="font-mono text-foreground">{mover.ticker}</span>
      <span className="font-mono text-xs text-muted">${mover.price.toFixed(2)}</span>
      <span className={`font-mono text-xs ${showPositive ? "text-positive" : "text-negative"}`}>
        {mover.changePercentage}
      </span>
    </div>
  );
}

export default async function TopMoversPanel() {
  const movers = await getTopMovers(5).catch(() => null);
  if (!movers) return null;

  return (
    <section className="mt-10 rounded-xl border border-border bg-surface/40 p-5 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Today&apos;s Movers</p>
      <h2 className="font-display mt-1 text-lg font-semibold text-foreground">
        Top gainers, losers &amp; most active
      </h2>
      <p className="mt-1 text-xs text-muted">
        Real US market data from Alpha Vantage, last updated {movers.lastUpdated}.
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted/70">Top Gainers</p>
          {movers.topGainers.map((m) => (
            <MoverRow key={m.ticker} mover={m} showPositive />
          ))}
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted/70">Top Losers</p>
          {movers.topLosers.map((m) => (
            <MoverRow key={m.ticker} mover={m} showPositive={false} />
          ))}
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted/70">Most Active</p>
          {movers.mostActive.map((m) => (
            <MoverRow key={m.ticker} mover={m} showPositive={m.changeAmount >= 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
