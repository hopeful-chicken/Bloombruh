import Link from "next/link";
import { getHoldingsData } from "@/lib/holdings";
import { formatUSD } from "@/lib/search";
import CompanySearch from "@/components/swf/CompanySearch";

export default async function SwfHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { holdings, totalPortfolioValueUSD, companyCount } = getHoldingsData();

  return (
    <div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          SWF Explorer
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
          NBIM — Norway&apos;s Government Pension Fund Global — owns on
          average about 1.5% of every listed company on Earth. Search a
          company below to see its position.
          {/* EDITORIAL: Adam to review/replace this framing line with his own voice */}
        </p>
      </div>

      <div className="mt-10">
        <CompanySearch holdings={holdings} initialQuery={q ?? ""} />
      </div>

      <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-6 border-t border-border pt-8 text-center">
        <div>
          <p className="font-mono text-2xl font-semibold text-accent">
            {formatUSD(totalPortfolioValueUSD)}
          </p>
          <p className="text-xs text-muted">Total portfolio value</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-semibold text-accent">
            {companyCount}
          </p>
          <p className="text-xs text-muted">Companies held</p>
        </div>
        <Link
          href="/swf/dashboard"
          className="rounded border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/60 hover:text-foreground"
        >
          View full portfolio dashboard →
        </Link>
      </div>
    </div>
  );
}
