import Link from "next/link";
import { notFound } from "next/navigation";
import {
  unslugifyCountry,
  getHoldingsByCountry,
  getFTSE100Holdings,
  listCountries,
  slugifyCountry,
  getHoldingsData,
} from "@/lib/holdings";
import { formatUSD } from "@/lib/search";
import HoldingsTable from "@/components/swf/HoldingsTable";

export function generateStaticParams() {
  return listCountries().map((country) => ({ slug: slugifyCountry(country) }));
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = unslugifyCountry(slug);

  if (!country) {
    notFound();
  }

  const holdings = getHoldingsByCountry(country);
  const { totalPortfolioValueUSD } = getHoldingsData();
  const countryTotalUSD = holdings.reduce((sum, h) => sum + h.marketValueUSD, 0);
  const countryPortfolioPct = (countryTotalUSD / totalPortfolioValueUSD) * 100;
  const isUK = country === "United Kingdom";
  const ftse100 = isUK ? getFTSE100Holdings() : [];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Country
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {country}
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <HeadlineStat label="Companies held" value={holdings.length.toString()} />
        <HeadlineStat label="Total NBIM stake" value={formatUSD(countryTotalUSD)} />
        <HeadlineStat
          label="% of portfolio"
          value={`${countryPortfolioPct.toFixed(2)}%`}
        />
      </div>

      {isUK && (
        <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-5">
          <h2 className="font-mono text-sm uppercase tracking-widest text-accent">
            FTSE 100 spotlight
          </h2>
          {/* EDITORIAL: Adam to review/replace this framing line with his own voice */}
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            NBIM holds positions in {ftse100.length} of the FTSE 100&apos;s
            constituent companies. Below is NBIM&apos;s stake in each, ranked
            by market value.
          </p>
          <div className="mt-5">
            <HoldingsTable holdings={ftse100} />
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-muted">
          All holdings in {country}
        </h2>
        <HoldingsTable holdings={holdings} />
      </div>

      <div className="mt-8">
        <Link
          href="/swf/dashboard"
          className="text-sm text-muted hover:text-accent hover:underline"
        >
          ← Back to portfolio dashboard
        </Link>
      </div>
    </div>
  );
}

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-mono text-xl font-semibold text-accent sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
