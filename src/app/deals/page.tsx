import Link from "next/link";
import { DEAL_TEARDOWNS } from "@/data/dealTeardowns";

// Deal Teardowns — its own section, deliberately separate from the stock
// pitches in My Analysis: pitches are about the stock, teardowns are about
// the deal. Public, like the write-ups.
export default function DealsPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Deal Teardowns</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Deals, Taken Apart
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Real announced M&A deals, dissected one at a time: the price and multiple paid,
        the financing mix, the accretion/dilution math, and a verdict with dated,
        checkable milestones. Separate from the stock pitches — a pitch asks whether
        to own the stock; a teardown asks whether the deal itself made sense. Each one
        comes with the step-by-step for building your own.
      </p>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Teardowns</h2>
        <div className="mt-3 space-y-2.5">
          {DEAL_TEARDOWNS.map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="block rounded-lg border border-border bg-surface/40 p-4 transition-colors hover:border-accent/60 hover:bg-surface/70"
            >
              <p className="font-mono text-[11px] text-muted">{deal.date}</p>
              <h3 className="font-display mt-0.5 text-base font-semibold text-foreground">
                {deal.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{deal.tagline}</p>
              <p className="mt-2 text-xs text-accent">{deal.stance}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
