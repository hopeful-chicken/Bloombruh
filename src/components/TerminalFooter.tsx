// Server component: shows disclaimers and attribution shared across every
// module. Individual modules show their own data-source/as-of-date banners
// (e.g. the Company Profile module shows "quotes may be delayed ~15min").

export default function TerminalFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">
        <p>
          Market data on this site is sourced from free, publicly available
          APIs and may be delayed. This project is independent and
          unaffiliated with any exchange, data provider, or company
          mentioned on this site.
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
