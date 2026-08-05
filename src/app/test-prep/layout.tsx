export default function TestPrepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Firm processes, real assessment-game names, and interview prompts here are drawn from
        real, publicly documented recruiting practices — but every firm&apos;s process changes
        year to year, so treat this as realistic practice, not a guarantee of what you&apos;ll
        see. The Balloon Game is a simplified, honest illustration of the real mechanic, not
        Pymetrics&apos; actual algorithm. HireVue draft answers are saved only in this browser
        (no accounts, no server storage).
      </div>
      {children}
    </div>
  );
}
