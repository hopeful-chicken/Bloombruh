export default function SimulationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Both simulations here use generated, not real, data: a random-walk price feed for the
        Market Maker game, and illustrative long-run return/volatility assumptions for the
        Portfolio Risk Simulator (not live prices, not any specific published forecast). What is
        real is the mechanics: spread capture vs. fill rate, inventory risk, mark-to-market P&amp;L,
        risk limits, and a genuine Monte Carlo/VaR calculation running entirely in your browser.
      </div>
      {children}
    </div>
  );
}
