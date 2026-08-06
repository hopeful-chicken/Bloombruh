// US CPI and unemployment, real monthly data from Alpha Vantage — shown
// only on the Fed's page (this data is explicitly US-only, unlike the
// policy-rate data above it which covers 8 central banks). Deliberately
// doesn't duplicate the Fed's own policy rate already shown by
// src/lib/centralBankRates.ts — CPI/unemployment are genuinely new
// indicators this site didn't have anywhere before. Async server
// component: fetches its own data, fails silently (renders nothing) if
// the free-tier quota is exhausted, since this is a bonus panel.

import { getCpi, getUnemploymentRate } from "@/lib/alphaVantage";

export default async function UsEconomicIndicators() {
  // Sequential, not Promise.all/allSettled: two Alpha Vantage calls fired
  // concurrently reliably tripped the free tier's rate limit when this was
  // first built. src/lib/alphaVantage.ts's own throttle() now serializes
  // every call from this module regardless, but staying sequential here
  // too costs nothing and keeps this component's own behavior obviously
  // safe on its own.
  const cpi = await getCpi().catch((error) => {
    console.error("CPI fetch failed:", error);
    return [];
  });
  const unemployment = await getUnemploymentRate().catch((error) => {
    console.error("Unemployment fetch failed:", error);
    return [];
  });

  if (cpi.length === 0 && unemployment.length === 0) return null;

  const latestCpi = cpi[0];
  const priorYearCpi = cpi.find((p) => {
    const latestDate = new Date(latestCpi.date);
    const pDate = new Date(p.date);
    return pDate.getFullYear() === latestDate.getFullYear() - 1 && pDate.getMonth() === latestDate.getMonth();
  });
  const cpiYoyPct =
    latestCpi && priorYearCpi ? ((latestCpi.value - priorYearCpi.value) / priorYearCpi.value) * 100 : null;

  const latestUnemployment = unemployment[0];

  return (
    <section className="mt-8 rounded-sm border border-border bg-surface/40 p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-module-macro">US Economic Indicators</p>
      <h2 className="font-display mt-1 text-lg font-semibold text-foreground">
        Beyond the policy rate
      </h2>
      <p className="mt-1 text-xs text-muted">
        Real monthly data from Alpha Vantage — US-specific, so shown only here rather than the
        cross-bank overview above.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {latestCpi && (
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted/70">
              CPI (all urban consumers), {latestCpi.date.slice(0, 7)}
            </p>
            <p className="mt-1 font-mono text-xl text-foreground">{latestCpi.value.toFixed(1)}</p>
            {cpiYoyPct !== null && (
              <p className={`mt-1 text-xs ${cpiYoyPct >= 0 ? "text-negative" : "text-positive"}`}>
                {cpiYoyPct >= 0 ? "+" : ""}
                {cpiYoyPct.toFixed(1)}% year-over-year
              </p>
            )}
          </div>
        )}
        {latestUnemployment && (
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted/70">
              Unemployment rate, {latestUnemployment.date.slice(0, 7)}
            </p>
            <p className="mt-1 font-mono text-xl text-foreground">{latestUnemployment.value.toFixed(1)}%</p>
          </div>
        )}
      </div>
    </section>
  );
}
