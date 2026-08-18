import ValuationDesk from "@/components/simulations/ValuationDesk";
import MarketMakerGame from "@/components/simulations/MarketMakerGame";
import PortfolioRiskSimulator from "@/components/simulations/PortfolioRiskSimulator";

export default function SimulationsPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Simulations</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Valuation, trading, and portfolio construction
      </h1>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">
          The Valuation Desk: IB &amp; equity research
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pick a company, build a DCF range under a time limit, then answer three questions on it.
        </p>
        <div className="mt-4">
          <ValuationDesk />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Market Maker
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Quote a bid/ask spread around a moving price and track your P&amp;L as customer flow
          trades against you.
        </p>
        <div className="mt-4">
          <MarketMakerGame />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Portfolio Risk Simulator: asset management &amp; risk
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Build a portfolio across 10 asset classes for a client mandate, then run a 500-path Monte
          Carlo simulation to check it against the constraints.
        </p>
        <div className="mt-4">
          <PortfolioRiskSimulator />
        </div>
      </section>
    </div>
  );
}
