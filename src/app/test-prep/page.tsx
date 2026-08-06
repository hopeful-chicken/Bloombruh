import { FIRM_TYPES, PYMETRICS_GAMES } from "@/data/testPrep";
import QuestionBank from "@/components/testprep/QuestionBank";
import BalloonGame from "@/components/testprep/BalloonGame";
import HireVuePractice from "@/components/testprep/HireVuePractice";

export default function TestPrepPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Test Prep</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        First-round assessments, for real
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Banks, asset managers, and consulting firms don&apos;t just interview you — increasingly
        the first real filter is a game-based psychometric test (Pymetrics) or a timed recorded
        video (HireVue), before you ever speak to a human. This page covers all three phases:
        what each firm type&apos;s process actually looks like, a technical/case question bank,
        and practice for the two assessment formats themselves.
      </p>

      {/* Firm type overview */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-foreground">
          The process, by firm type
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIRM_TYPES.map((f) => (
            <div key={f.id} className="rounded-sm border border-border bg-surface/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                {f.category}
              </p>
              <h3 className="font-display mt-1 text-base font-semibold text-foreground">
                {f.name}
              </h3>
              <p className="mt-2 text-sm text-muted">{f.summary}</p>
              <ol className="mt-3 space-y-1">
                {f.process.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground">
                    <span className="font-mono text-accent">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
                {f.realWorldNotes}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical / case question bank */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Technical & case question bank
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Accounting and three-statement questions, valuation/technical questions (DCF, LBO, M&amp;A,
          options, fixed income, FX), and consulting-style case and deal questions — filter by
          category or firm type below. Full context for each topic lives in{" "}
          <a href="/lessons" className="underline decoration-dotted underline-offset-2 hover:text-accent">
            Lessons
          </a>
          .
        </p>
        <div className="mt-4">
          <QuestionBank />
        </div>
      </section>

      {/* Pymetrics */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Pymetrics — the real games
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pymetrics (now owned by Harver) is a set of 12 short neuroscience-based games used as a
          first-stage filter by firms including JPMorgan, Unilever, Mastercard, Blackstone, PwC,
          Bain, and Accenture (office-dependent). <strong>McKinsey does not use Pymetrics</strong> —
          it uses its own game-based tool called &ldquo;Solve&rdquo; instead. Below are all 12 real
          games and what each measures; the Balloon Game (the clearest one to simulate honestly) is
          playable.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PYMETRICS_GAMES.map((g) => (
            <div key={g.id} className="rounded-lg border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{g.name}</p>
                {g.playable && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                    playable below
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted/70">{g.measures}</p>
              <p className="mt-1.5 text-xs text-muted">{g.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <BalloonGame />
        </div>
      </section>

      {/* HireVue */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-foreground">
          HireVue — write it before you say it
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          HireVue is timed, one-way recorded video — real users include Goldman Sachs, JPMorgan,
          Morgan Stanley, BlackRock, and (heaviest of all) the Big 4 consulting firms, where it
          often fully replaces a first-round human interview. You can&apos;t practice video here,
          but you can do the part that actually matters most: knowing exactly what you want to say
          before the camera starts. Draft and time your answers below — they save to this browser.
        </p>
        <div className="mt-4">
          <HireVuePractice />
        </div>
      </section>
    </div>
  );
}
