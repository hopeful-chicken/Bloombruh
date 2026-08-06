// Server component: shows disclaimers and attribution shared across every
// module. Individual modules show their own data-source/as-of-date banners
// (e.g. the Company Profile module shows "quotes may be delayed ~15min").
// The DISCLOSURE line itself lives in one shared constant (lib/config.ts)
// rather than being hand-typed here, so it can never drift between pages.

import { DISCLOSURE } from "@/lib/config";

export default function TerminalFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-relaxed text-muted sm:px-6">
        <p>
          Market data on this site is sourced from free, publicly available
          APIs and may be delayed. This project is independent and
          unaffiliated with any exchange, data provider, or company
          mentioned on this site.
        </p>
        <p className="mt-2">{DISCLOSURE}</p>
        <p className="mt-3">
          <a
            href="/downloads/bloombruh-research.docx"
            download
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            Download past research write-ups (Word, ~40KB)
          </a>
          {" "}— 10 stock pitches, a valuation-model learning plan, and 10 hype-vs-fundamentals
          case studies, previously kept as a browsable page here.
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 text-muted/70">
          <span className="font-logo text-sm font-medium text-foreground/80">
            Bloombruh
          </span>
          <span aria-hidden="true">·</span>
          <span>Built by Adam · UCL Economics</span>
          <span aria-hidden="true">·</span>
          <a
            href="https://www.linkedin.com/in/adam-zhou-1913ba225/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            LinkedIn
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/hopeful-chicken"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
