// Registry of historical "hype vs. fundamentals" case studies — real
// companies, real tickers, real well-documented eras. Only metadata lives
// here (which tickers, which date window defines the case's era); every
// number shown for a case (peak price, run-up %, drawdown %, fundamentals)
// is computed live from real fetched data in hypeAnalysis.ts, never
// hardcoded — so this file can't go stale or drift from reality the way a
// hardcoded "peaked at $X" figure would.
//
// The date window bounds the run-up/peak/drawdown computation to the
// well-documented era of each mania, rather than taking a blind all-time
// max/min over the ticker's whole history (which could pick up an
// unrelated later high/low and misattribute it to this case). The window
// boundaries themselves are a matter of public record, not a number that
// needs sourcing the way a price or return figure does.

export type HypeCaseId = "dotcom" | "meme-stocks" | "cannabis";

export type HypeCase = {
  id: HypeCaseId;
  name: string;
  era: string;
  /** Real tickers this case tracks, each with a one-line role label. */
  tickers: { symbol: string; role: string }[];
  /** ISO dates bounding the case's well-documented era — the window used
   * to compute peak/run-up/drawdown, generously wide (not a precise "the
   * top was this exact day" claim). */
  windowStart: string;
  windowEnd: string;
  blurb: string;
  /** Google News search query for real retrospective coverage — not date-
   * restricted, since modern hindsight analysis of a historical event is
   * both more available and arguably more useful than trying to surface
   * period-contemporaneous archives through a live news search. */
  newsQuery: string;
};

export const HYPE_CASES: HypeCase[] = [
  {
    id: "dotcom",
    name: "The Dot-Com Bubble",
    era: "1998–2002",
    tickers: [
      { symbol: "CSCO", role: "The bellwether: \"picks and shovels\" for the internet build-out" },
      { symbol: "QQQ", role: "Nasdaq-100: the broad index the whole era rode up and down" },
    ],
    windowStart: "1998-01-01",
    windowEnd: "2003-01-01",
    blurb:
      "Internet-adjacent stocks (and the networking hardware behind them) repriced as if the internet's total future profits had already arrived, years before most of the underlying businesses were consistently profitable.",
    newsQuery: "dot-com bubble Cisco Nasdaq what happened lessons",
  },
  {
    id: "meme-stocks",
    name: "The Meme Stock Mania",
    era: "2020–2022",
    tickers: [
      { symbol: "GME", role: "GameStop: a struggling physical game retailer, the epicenter" },
      { symbol: "AMC", role: "AMC Entertainment: a heavily indebted cinema chain, the co-star" },
    ],
    windowStart: "2020-06-01",
    windowEnd: "2022-06-01",
    blurb:
      "Coordinated retail buying (largely organized on Reddit's r/WallStreetBets) squeezed heavily shorted, structurally challenged companies to prices that had little to do with their actual store counts, debt loads, or earnings.",
    newsQuery: "GameStop AMC meme stock mania what happened lessons",
  },
  {
    id: "cannabis",
    name: "The Cannabis Stock Boom",
    era: "2017–2019",
    tickers: [
      { symbol: "TLRY", role: "Tilray: the IPO that became the boom's most extreme single case" },
      { symbol: "CGC", role: "Canopy Growth: the largest cannabis company by market cap at the peak" },
    ],
    windowStart: "2017-06-01",
    windowEnd: "2020-06-01",
    blurb:
      "Legalization momentum in Canada and parts of the US drove cannabis growers to valuations pricing in years of rapid, profitable expansion, before most had scaled production, distribution, or a route to actual profit.",
    newsQuery: "cannabis stock boom bust Tilray Canopy Growth what happened",
  },
];

export function getHypeCase(id: string): HypeCase | undefined {
  return HYPE_CASES.find((c) => c.id === id);
}
