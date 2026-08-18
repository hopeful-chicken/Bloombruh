export default function SimulationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Market Maker uses a generated price feed. Portfolio Risk Simulator uses illustrative return
        assumptions.
      </div>
      {children}
    </div>
  );
}
