// The piece the index-vs-rate chart above can't do on its own: translate a
// policy rate into money a non-economist actually feels, and correct the
// single most-documented public misconception about how it works.
//
// Design choices here follow real central-bank public-education practice,
// not this site's own invention — checked directly against the Bank of
// England, Fed, and ECB's own "explainers" pages, plus mainstream coverage
// (CNBC, Time, NBC) and survey data on what people actually get wrong:
//   1. Concrete local-currency numbers on a stated illustrative balance,
//      the same technique the ECB uses ("borrow €10,000 at 5%, pay €500").
//   2. An explicit fast-vs-slow contrast — credit-card-style borrowing
//      reprices close to 1:1 with the policy rate within weeks; mortgages
//      don't, because they're priced off longer-term bond-yield
//      expectations instead. Two 2025 surveys (Rocket Mortgage, Veterans
//      United) found 60%+ of people believe the central bank sets mortgage
//      rates directly — this is the single biggest documented point of
//      confusion, so it's stated plainly rather than left implicit.
//   3. An explicit lag: Milton Friedman's "long and variable lags" finding
//      (historically 4-29 months between a policy move and its economic
//      effect) — a two-line chart moving in step invites the reader to
//      assume the effect is immediate and 1:1, which it isn't.
//
// The dollar figures below are real arithmetic on the real policy rate
// passed in, applied to a stated illustrative balance — clearly labeled as
// illustrative, never presented as a specific bank's actual product terms.

const CURRENCY: Record<string, { symbol: string; code: string }> = {
  fed: { symbol: "$", code: "USD" },
  ecb: { symbol: "€", code: "EUR" },
  boe: { symbol: "£", code: "GBP" },
  boj: { symbol: "¥", code: "JPY" },
  pboc: { symbol: "¥", code: "CNY" },
  snb: { symbol: "CHF ", code: "CHF" },
  rba: { symbol: "A$", code: "AUD" },
  boc: { symbol: "C$", code: "CAD" },
};

const ILLUSTRATIVE_BALANCE = 10_000;
// A representative spread a variable-rate consumer loan or credit card
// might carry over the policy rate — stated as illustrative, not a real
// quoted product rate, same as the ECB's own worked examples.
const FAST_PRODUCT_SPREAD = 8;
const SAVINGS_PASSTHROUGH = 0.6; // banks typically pass through less than 100%

function fmt(n: number, symbol: string) {
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function RateImpactExplainer({
  bankId,
  bankName,
  currentRate,
}: {
  bankId: string;
  bankName: string;
  currentRate: number | null;
}) {
  const currency = CURRENCY[bankId] ?? { symbol: "$", code: "USD" };

  if (currentRate === null) {
    return null;
  }

  const fastRate = (currentRate + FAST_PRODUCT_SPREAD) / 100;
  const fastInterestNow = ILLUSTRATIVE_BALANCE * fastRate;
  const fastInterestPlus1 = ILLUSTRATIVE_BALANCE * (fastRate + 0.01);
  const fastDelta = fastInterestPlus1 - fastInterestNow;

  const saveRate = Math.max(currentRate, 0) * (SAVINGS_PASSTHROUGH / 100);
  const saveInterestNow = ILLUSTRATIVE_BALANCE * saveRate;
  const saveInterestPlus1 = ILLUSTRATIVE_BALANCE * (saveRate + 0.01 * SAVINGS_PASSTHROUGH);
  const saveDelta = saveInterestPlus1 - saveInterestNow;

  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="mb-3 text-[11px] uppercase tracking-widest text-muted/70">
        What {currentRate.toFixed(2)}% actually does to real money
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-negative">
            If you are borrowing
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Say you owe {fmt(ILLUSTRATIVE_BALANCE, currency.symbol)} on a variable-rate loan or
            card priced at roughly {bankName}&apos;s policy rate plus a typical spread. At
            today&apos;s {currentRate.toFixed(2)}%, that is about{" "}
            <span className="font-semibold">{fmt(fastInterestNow, currency.symbol)}/year</span>{" "}
            in interest. A further 1-point rate rise would push that to roughly{" "}
            <span className="font-semibold">{fmt(fastInterestPlus1, currency.symbol)}/year</span>,
            an extra {fmt(fastDelta, currency.symbol)} on just this one balance.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-positive">
            If you are saving
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            The same {fmt(ILLUSTRATIVE_BALANCE, currency.symbol)}, this time sitting in a
            savings account, earns roughly{" "}
            <span className="font-semibold">{fmt(saveInterestNow, currency.symbol)}/year</span> at
            today&apos;s rate (banks typically pass through less than the full policy rate). A
            1-point rise would take that to about{" "}
            <span className="font-semibold">{fmt(saveInterestPlus1, currency.symbol)}/year</span>,
            savers gain from the same move that costs borrowers.
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted/70">
        Both boxes are worked illustrations on a stated {fmt(ILLUSTRATIVE_BALANCE, currency.symbol)}{" "}
        balance and a typical spread over the policy rate, not a specific bank&apos;s actual
        advertised rate. The point is the mechanism and direction, not a quote you could take to a
        branch.
      </p>

      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
          The one thing most people get backwards
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Two 2025 US surveys (Rocket Mortgage and Veterans United) found that roughly{" "}
          <span className="font-semibold text-foreground">6 in 10 people believe the central
          bank directly sets mortgage rates.</span> It does not. Credit cards, overdrafts, and
          variable-rate loans, like the borrowing example above, move close to 1:1 with the
          policy rate, often within weeks, because they are priced directly off it. Fixed
          mortgage rates are different: they track longer-term bond yields and where investors
          expect rates to go over the next 10-30 years, not today&apos;s policy rate itself, which
          is why mortgage rates can sit still, or even move the opposite way, right after a policy
          rate change.
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Why the chart above will not show an instant reaction
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Economist Milton Friedman's original finding on this (since re-tested many times,
          including by the St. Louis Fed) is that the gap between a policy move and its full
          effect on the real economy has historically ranged from{" "}
          <span className="font-semibold text-foreground">4 to 29 months</span>, with no reliable
          way to know in advance where in that range a given move will land. That is exactly
          why a chart of two lines moving together (or not) over a short window can be
          misleading either way. A real effect can still be working its way through the economy
          well after the line on the chart looks flat.
        </p>
      </div>
    </div>
  );
}
