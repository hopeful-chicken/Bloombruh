// Static, generic education on how monetary and fiscal (budgetary) policy
// work and what they affect. Deliberately not bank-specific or AI-generated —
// this is background knowledge that applies to any central bank, written
// once and reused everywhere, following the same "no jargon, plain English"
// rule as the rest of the site.

export default function PolicyExplainer({ bankName }: { bankName: string }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          What a policy rate does
        </h3>
        <p className="mt-1">
          A policy rate (like the one {bankName} sets) is the interest rate a
          central bank charges or pays on very short-term lending to
          commercial banks. Every other interest rate in the economy,
          mortgages, savings accounts, business loans, credit cards, is
          priced off that base rate, so moving it is the main lever a central
          bank has to influence the whole economy.
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Hikes vs. cuts
        </h3>
        <p className="mt-1">
          Raising the rate ("hiking") makes borrowing more expensive and
          saving more attractive, which tends to slow spending and investment,
          used to cool inflation or an overheating economy. Cutting the
          rate does the opposite: cheaper borrowing encourages spending and
          investment, used to support a slowing economy or fight
          deflation/unemployment. Changes typically take months to fully feed
          through. This is often called the "transmission mechanism."
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Monetary policy vs. budgetary (fiscal) policy
        </h3>
        <p className="mt-1">
          Monetary policy (interest rates and money supply) is set by the
          central bank, which is deliberately kept independent from elected
          government in most major economies. Budgetary (fiscal) policy
          (government spending and taxation) is set by the government
          itself. The two can reinforce each other (both loosening at once to
          boost growth) or work against each other (a government spending
          more while its central bank raises rates to fight the inflation
          that spending causes). Watching both together usually explains the
          economy better than either alone.
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          What tends to move when the rate moves
        </h3>
        <p className="mt-1">
          Currency: higher rates often attract foreign capital seeking
          yield, which can strengthen the currency (and vice versa). Bonds:
          bond prices generally move opposite to rate expectations. Equities:
          higher rates raise the discount rate used to value future company
          earnings, which tends to weigh on stock valuations, especially for
          growth companies. None of this is guaranteed or immediate. It is
          the general direction markets expect, not a formula.
        </p>
      </div>
    </div>
  );
}
