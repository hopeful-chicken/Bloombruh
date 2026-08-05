import MarketMakerGame from "@/components/simulations/MarketMakerGame";
import PortfolioRiskSimulator from "@/components/simulations/PortfolioRiskSimulator";

export default function SimulationsPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Simulations</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Sit in the seat
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Every other module on this site is about analyzing markets from the outside. These two are
        about the actual job: running a trading book like a sales &amp; trading desk, and building
        and stress-testing a portfolio like a risk or asset-management analyst.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Market Maker — a sales &amp; trading desk
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Quote a bid/ask spread around a moving price and see what actually happens to your P&amp;L
          as customer flow trades against you.
        </p>
        <div className="mt-4">
          <MarketMakerGame />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Portfolio Risk Simulator — asset management &amp; risk
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Build a portfolio across 10 asset classes and run a real 500-path Monte Carlo simulation
          to see the full distribution of 1-year outcomes — not just an expected return, but the
          shape of the risk around it.
        </p>
        <div className="mt-4">
          <PortfolioRiskSimulator />
        </div>
      </section>
    </div>
  );
}
