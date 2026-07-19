import Link from "next/link";
import { getHoldingsData } from "@/lib/holdings";

const tabs = [
  { href: "/swf", label: "Search" },
  { href: "/swf/dashboard", label: "Dashboard" },
  { href: "/swf/country/united-kingdom", label: "UK / FTSE 100" },
  { href: "/swf/voting", label: "Voting" },
];

export default function SwfLayout({ children }: { children: React.ReactNode }) {
  const { asOfDate, isMockData, companyCount } = getHoldingsData();

  return (
    <div>
      {/* As-of-date / data source banner — required on every SWF Explorer view */}
      <div
        className={[
          "border-b px-4 py-2 text-center text-xs font-medium sm:px-6",
          isMockData
            ? "border-accent/30 bg-accent/10 text-accent"
            : "border-border bg-surface text-muted",
        ].join(" ")}
      >
        {isMockData ? (
          <>
            ⚠ MOCK DATA — {companyCount} companies, illustrative figures only,
            not NBIM&apos;s real holdings. As of {asOfDate}.
          </>
        ) : (
          <>NBIM equity holdings, {companyCount} companies, as of {asOfDate}.</>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex flex-wrap gap-1 border-b border-border py-3">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="py-8">{children}</div>
      </div>
    </div>
  );
}
