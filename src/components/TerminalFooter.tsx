// Server component: shows data source attribution, the "not investment
// advice" disclaimer, and the as-of date of the currently loaded data.

import { getHoldingsData } from "@/lib/holdings";

export default function TerminalFooter() {
  const { asOfDate, isMockData } = getHoldingsData();

  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">
        <p>
          SWF Explorer data{" "}
          {isMockData ? (
            <span className="font-semibold text-accent">
              is currently MOCK DATA (illustrative, not real)
            </span>
          ) : (
            <>sourced from NBIM / Norges Bank public disclosures</>
          )}
          , as of{" "}
          <span className="font-mono text-foreground/80">{asOfDate}</span>.
          This project is independent and unaffiliated with Norges Bank
          Investment Management.
        </p>
        <p className="mt-2">
          Nothing on this site is investment advice. Graduate Analyst
          Terminal is a personal, non-commercial student project — always do
          your own research.
        </p>
        <p className="mt-2 text-muted/70">
          Built by Adam · UCL Economics ·{" "}
          <a
            href="#"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            LinkedIn
          </a>{" "}
          ·{" "}
          <a
            href="#"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            GitHub
          </a>
          {/* EDITORIAL: Adam to swap these placeholder links for real profile URLs */}
        </p>
      </div>
    </footer>
  );
}
