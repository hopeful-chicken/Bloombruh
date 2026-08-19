import Link from "next/link";
import { getTickerQuotes } from "@/lib/tickerQuotes";

// A real, live market ticker strip under the nav, on every page — same
// idea as a trading-floor tape. Pure CSS animation (see the `tape-scroll`
// keyframes in globals.css): the quote list is rendered twice back to
// back and translated exactly -50%, so the loop has no visible seam.
// Hovering pauses it so a number can actually be read. Each quote links
// to that company's real profile page rather than sitting there as pure
// decoration.
//
// Data is real (Twelve Data, same source and 60s cache as the Company
// Profile page), not illustrative — if the API key is missing or every
// symbol fails, this renders nothing rather than showing fake numbers.
export default async function MarketTicker() {
  const quotes = await getTickerQuotes();
  if (quotes.length === 0) return null;

  // Colors are fixed hex, not the theme's --foreground/--background vars —
  // a ticker tape reads as a physical, always-dark display (like a real
  // exchange board), not something that should flip to a light bar when
  // the site is in dark mode. Values match the dark theme's own palette
  // (globals.css) so it still belongs to the site, just isn't theme-
  // reactive itself.
  const strip = (half: "a" | "b") => (
    <div
      aria-hidden={half === "b"}
      className="inline-flex shrink-0 items-center py-2 font-mono text-[11px]"
    >
      {quotes.map((q) => (
        <Link
          key={`${half}-${q.symbol}`}
          href={`/profile/${encodeURIComponent(q.symbol)}`}
          className="mx-4 inline-flex items-baseline gap-1.5 whitespace-nowrap transition-opacity hover:opacity-70"
        >
          <span className="text-[#9c9787]">{q.symbol}</span>
          <span className="font-semibold text-[#f1eee5]">{q.priceLabel}</span>
          <span
            className={
              q.direction === "up"
                ? "text-[#55b685]"
                : q.direction === "down"
                  ? "text-[#e2685a]"
                  : "text-[#9c9787]"
            }
          >
            {q.changeLabel}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div
      className="group overflow-hidden whitespace-nowrap border-b border-[#3c3833] bg-[#201e1a] motion-reduce:overflow-x-auto"
      role="group"
      aria-label="Market snapshot, real quotes, links to each company's profile page"
    >
      <div className="inline-flex animate-[tape-scroll_42s_linear_infinite] motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {strip("a")}
        {strip("b")}
      </div>
    </div>
  );
}
