// Server-only wrappers around free, no-key central bank / official statistics
// APIs, used by the Central Bank Room to show each bank's actual policy rate,
// its history, and a derived timeline of rate decisions.
//
// Every source here was empirically tested with a real HTTP call before being
// wired in (see docs/DATA_SOURCES.md) — some official "free" APIs turn out to
// be paywalled or missing when you actually try them, so nothing is assumed
// to work just because it's documented as free.
//
// Coverage is uneven by design: some banks (Fed, ECB, BoE, BoC) publish a
// single, clean, daily policy rate. Others (SNB, RBA) only publish monthly
// data. Japan and China don't publish one clean daily policy-rate series at
// all, so what's shown there is the closest free market-rate proxy, clearly
// labelled as such (isProxy: true) rather than presented as the official
// rate. If a source fails at request time, the function returns null and the
// page shows an honest "unavailable" state — never a guessed number.

import type { CentralBankId } from "./centralBanks";

export type RateObservation = { date: string; rate: number };

export type RateDecision = {
  date: string;
  rate: number;
  /** Change vs the previous observation, in basis points (100bp = 1 percentage point). */
  changeBp: number;
  type: "hike" | "cut";
};

export type CentralBankRateData = {
  currentRate: number;
  asOfDate: string;
  seriesLabel: string;
  resolution: "daily" | "monthly";
  /** True when this series is a market-rate stand-in, not the bank's own
   * official policy rate (currently: Japan, China). */
  isProxy: boolean;
  /** Full history within the fetch window, oldest first. */
  history: RateObservation[];
  /** Every point where the rate changed vs the prior observation, most recent first. */
  decisions: RateDecision[];
  source: string;
  sourceUrl: string;
};

async function fetchText(url: string, headers?: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 }, headers });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** ISO date string N years before today — used to bound how much history we
 * pull in, so daily series (decades long) don't balloon the page. */
function cutoffDate(yearsBack: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsBack);
  return d.toISOString().slice(0, 10);
}

function buildDecisions(history: RateObservation[]): RateDecision[] {
  const decisions: RateDecision[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].rate;
    const curr = history[i].rate;
    const changeBp = Math.round((curr - prev) * 100);
    if (changeBp === 0) continue;
    decisions.push({
      date: history[i].date,
      rate: curr,
      changeBp,
      type: changeBp > 0 ? "hike" : "cut",
    });
  }
  return decisions.reverse();
}

function finalize(
  history: RateObservation[],
  meta: {
    seriesLabel: string;
    resolution: "daily" | "monthly";
    isProxy: boolean;
    source: string;
    sourceUrl: string;
  }
): CentralBankRateData | null {
  if (history.length === 0) return null;
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  return {
    currentRate: last.rate,
    asOfDate: last.date,
    history: sorted,
    decisions: buildDecisions(sorted),
    ...meta,
  };
}

/** Shared parser for FRED's "fredgraph.csv" export — a plain two-column CSV
 * (observation_date,VALUE) with "." for missing observations. This specific
 * CSV export endpoint doesn't require an API key, unlike FRED's main JSON API. */
function parseFredCsv(text: string): RateObservation[] {
  const lines = text.trim().split("\n");
  const out: RateObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, value] = lines[i].split(",");
    if (!date || value === undefined || value === ".") continue;
    const rate = parseFloat(value);
    if (Number.isNaN(rate)) continue;
    out.push({ date, rate });
  }
  return out;
}

async function fetchFredSeries(
  seriesId: string,
  meta: {
    seriesLabel: string;
    resolution: "daily" | "monthly";
    isProxy: boolean;
    sourceUrl: string;
  }
): Promise<CentralBankRateData | null> {
  const text = await fetchText(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`);
  if (!text) return null;
  const history = parseFredCsv(text).filter((h) => h.date >= cutoffDate(15));
  return finalize(history, {
    ...meta,
    source: "FRED (Federal Reserve Bank of St. Louis)",
  });
}

async function fetchEcb(): Promise<CentralBankRateData | null> {
  // `detail=dataonly` strips the ECB's per-row series metadata (long fields
  // like TITLE_COMPL repeated on every single observation) that we don't
  // use anyway — without it, 15 years of daily data is ~2.2MB, just over
  // Next.js's 2MB fetch-cache limit, which was silently breaking caching
  // (and could fail the request outright) for this bank only. With it, the
  // same data is ~350KB.
  const text = await fetchText(
    `https://data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.DFR.LEV?format=csvdata&detail=dataonly&startPeriod=${cutoffDate(15)}`
  );
  if (!text) return null;
  // Split on \r?\n, not just \n — the ECB API returns CRLF line endings, and
  // with `detail=dataonly` OBS_VALUE is the *last* header column, so a bare
  // "\n" split left a trailing "\r" on it and broke the header.indexOf match
  // (silently, since a failed match here just makes the whole fetch return
  // null and the page show its normal "unavailable" fallback).
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const dateIdx = header.indexOf("TIME_PERIOD");
  const valueIdx = header.indexOf("OBS_VALUE");
  if (dateIdx === -1 || valueIdx === -1) return null;
  const history: RateObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const date = cols[dateIdx];
    const rate = parseFloat(cols[valueIdx]);
    if (!date || Number.isNaN(rate)) continue;
    history.push({ date, rate });
  }
  return finalize(history, {
    seriesLabel: "Deposit facility rate",
    resolution: "daily",
    isProxy: false,
    source: "ECB Statistical Data Warehouse",
    sourceUrl: "https://data.ecb.europa.eu/data/datasets/FM",
  });
}

async function fetchBoc(): Promise<CentralBankRateData | null> {
  const text = await fetchText(
    "https://www.bankofcanada.ca/valet/observations/V39079/json?recent=3900"
  );
  if (!text) return null;
  try {
    const data = JSON.parse(text) as {
      observations: { d: string; V39079: { v: string } }[];
    };
    const history: RateObservation[] = data.observations
      .map((o) => ({ date: o.d, rate: parseFloat(o.V39079.v) }))
      .filter((o) => !Number.isNaN(o.rate));
    return finalize(history, {
      seriesLabel: "Target for the overnight rate",
      resolution: "daily",
      isProxy: false,
      source: "Bank of Canada Valet API",
      sourceUrl: "https://www.bankofcanada.ca/rates/interest-rates/canadian-interest-rates/",
    });
  } catch {
    return null;
  }
}

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function parseBoeDate(s: string): string | null {
  const parts = s.trim().split(" ");
  if (parts.length !== 3) return null;
  const [dd, mon, yyyy] = parts;
  const mm = MONTHS[mon];
  if (!mm) return null;
  return `${yyyy}-${mm}-${dd.padStart(2, "0")}`;
}

async function fetchBoe(): Promise<CentralBankRateData | null> {
  const from = cutoffDate(15);
  const [fy, fm, fd] = from.split("-");
  const fromLabel = `${fd}/${Object.keys(MONTHS)[parseInt(fm, 10) - 1]}/${fy}`;
  const url =
    `https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp` +
    `?csv.x=yes&Datefrom=${fromLabel}&Dateto=now&SeriesCodes=IUDBEDR&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N`;
  const text = await fetchText(url);
  if (!text) return null;
  const lines = text.trim().split(/\r?\n/);
  const history: RateObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [dateStr, value] = lines[i].split(",");
    if (!dateStr || value === undefined) continue;
    const rate = parseFloat(value);
    if (Number.isNaN(rate)) continue;
    const date = parseBoeDate(dateStr);
    if (!date) continue;
    history.push({ date, rate });
  }
  return finalize(history, {
    seriesLabel: "Bank Rate",
    resolution: "daily",
    isProxy: false,
    source: "Bank of England Interactive Statistical Database",
    sourceUrl: "https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp",
  });
}

async function fetchSnb(): Promise<CentralBankRateData | null> {
  const text = await fetchText("https://data.snb.ch/api/cube/zimoma/data/csv/en");
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  const cutoff = cutoffDate(15);
  const history: RateObservation[] = [];
  for (const line of lines) {
    if (!line.startsWith('"')) continue;
    const cols = line.split(";").map((c) => c.replace(/^"|"$/g, ""));
    if (cols[1] !== "1TGT") continue;
    const month = cols[0];
    const rate = parseFloat(cols[2]);
    if (!month || Number.isNaN(rate)) continue;
    const date = `${month}-01`;
    if (date < cutoff) continue;
    history.push({ date, rate });
  }
  return finalize(history, {
    seriesLabel: "SNB policy rate",
    resolution: "monthly",
    isProxy: false,
    source: "Swiss National Bank Data Portal",
    sourceUrl: "https://data.snb.ch/en/topics/ziredev#!/cube/zimoma",
  });
}

async function fetchRba(): Promise<CentralBankRateData | null> {
  // The RBA's edge/WAF blocks requests carrying a generic Node.js or
  // browser-style User-Agent header (confirmed empirically — a plain
  // "curl/..." UA is allowed through, both a Node default and a spoofed
  // Chrome UA get a 403), so this specific request sends a curl-like UA.
  const text = await fetchText("https://www.rba.gov.au/statistics/tables/csv/f1.1-data.csv", {
    "User-Agent": "curl/8.7.1",
  });
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  const seriesIdIdx = lines.findIndex((l) => l.startsWith("Series ID"));
  if (seriesIdIdx === -1) return null;
  const cutoff = cutoffDate(15);
  const history: RateObservation[] = [];
  for (let i = seriesIdIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = line.split(",");
    const [dd, mm, yyyy] = (cols[0] ?? "").split("/");
    if (!dd || !mm || !yyyy) continue;
    const rate = parseFloat(cols[1]);
    if (Number.isNaN(rate)) continue;
    const date = `${yyyy}-${mm}-${dd}`;
    if (date < cutoff) continue;
    history.push({ date, rate });
  }
  return finalize(history, {
    seriesLabel: "Cash rate target (monthly average)",
    resolution: "monthly",
    isProxy: false,
    source: "Reserve Bank of Australia",
    sourceUrl: "https://www.rba.gov.au/statistics/cash-rate/",
  });
}

/** Looks up policy-rate data for a central bank. Returns null if the bank
 * isn't covered or the live fetch fails — callers should show an honest
 * "unavailable" state, never a guessed number. */
export async function getCentralBankRateData(
  bankId: CentralBankId
): Promise<CentralBankRateData | null> {
  switch (bankId) {
    case "fed":
      return fetchFredSeries("DFEDTARU", {
        seriesLabel: "Federal funds target rate (upper bound)",
        resolution: "daily",
        isProxy: false,
        sourceUrl: "https://fred.stlouisfed.org/series/DFEDTARU",
      });
    case "ecb":
      return fetchEcb();
    case "boe":
      return fetchBoe();
    case "boc":
      return fetchBoc();
    case "snb":
      return fetchSnb();
    case "rba":
      return fetchRba();
    case "boj":
      return fetchFredSeries("IRSTCI01JPM156N", {
        seriesLabel: "Interbank call money rate — proxy for the BoJ's policy rate target",
        resolution: "monthly",
        isProxy: true,
        sourceUrl: "https://fred.stlouisfed.org/series/IRSTCI01JPM156N",
      });
    case "pboc":
      return fetchFredSeries("IR3TIB01CNM156N", {
        seriesLabel: "3-month interbank rate — proxy (the PBoC doesn't publish one single daily policy rate)",
        resolution: "monthly",
        isProxy: true,
        sourceUrl: "https://fred.stlouisfed.org/series/IR3TIB01CNM156N",
      });
    default:
      return null;
  }
}

/** Downsamples a history array to roughly `maxPoints` points for charting —
 * daily series over 10+ years have thousands of points, which is both slow
 * to render and unreadable. Always keeps the first and last point. */
export function sampleForChart(
  history: RateObservation[],
  maxPoints = 180
): RateObservation[] {
  if (history.length <= maxPoints) return history;
  const step = Math.ceil(history.length / maxPoints);
  const out: RateObservation[] = [];
  for (let i = 0; i < history.length; i += step) out.push(history[i]);
  const last = history[history.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

// Global Overview summary support ---------------------------------------
//
// Shared by GlobalRatesOverview.tsx (client, has all 8 banks' data already
// as props) and /api/global-rate-narrative (server, re-fetches the same 8
// banks' data) so both compute "who hiked/cut/held over this period" the
// exact same way — the AI narrative behind the route needs to describe the
// same numbers the page already shows, not a second, possibly-drifted
// recomputation.

export type GlobalRateRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "MAX";

export const GLOBAL_RATE_RANGES: { value: GlobalRateRange; label: string; days: number | null }[] = [
  { value: "1D", label: "1D", days: 1 },
  { value: "1W", label: "1W", days: 7 },
  { value: "1M", label: "1M", days: 30 },
  { value: "3M", label: "3M", days: 90 },
  { value: "1Y", label: "1Y", days: 365 },
  { value: "MAX", label: "Max", days: null },
];

export function globalRatePeriodPhrase(range: GlobalRateRange): string {
  if (range === "MAX") return "the full fetched history";
  const words: Record<Exclude<GlobalRateRange, "MAX">, string> = {
    "1D": "the past day",
    "1W": "the past week",
    "1M": "the past month",
    "3M": "the past 3 months",
    "1Y": "the past year",
  };
  return words[range];
}

function cutoffIsoFor(history: RateObservation[], range: GlobalRateRange): string | null {
  const spec = GLOBAL_RATE_RANGES.find((r) => r.value === range);
  if (!spec || spec.days === null || history.length === 0) return null;
  const lastDate = new Date(history[history.length - 1].date);
  const cutoff = new Date(lastDate);
  cutoff.setDate(cutoff.getDate() - spec.days);
  return cutoff.toISOString().slice(0, 10);
}

export type BankRateSummary = {
  id: CentralBankId;
  shortName: string;
  currentRate: number;
  asOfDate: string;
  changeBp: number;
  decisionsInWindow: number;
};

/** Per-bank current rate, bp change, and decision count within a range —
 * the exact arithmetic behind the Global Overview's bank grid and its
 * "X hiked / Y cut / Z held steady" summary sentence. Banks with no data
 * are simply omitted (not shown as zero). */
export function summarizeBankRates(
  banks: { id: CentralBankId; shortName: string; data: CentralBankRateData | null }[],
  range: GlobalRateRange
): BankRateSummary[] {
  const result: BankRateSummary[] = [];
  for (const b of banks) {
    if (!b.data || b.data.history.length === 0) continue;
    const cutoffIso = cutoffIsoFor(b.data.history, range);
    const windowHistory = cutoffIso
      ? b.data.history.filter((h) => h.date >= cutoffIso)
      : b.data.history;
    // A short window can catch zero observations for a rate that's been
    // flat for months — fall back to the last known point so that reads
    // as "unchanged", not as missing data.
    const points = windowHistory.length > 0 ? windowHistory : b.data.history.slice(-1);
    const changeBp = Math.round((points[points.length - 1].rate - points[0].rate) * 100);
    const decisionsInWindow = cutoffIso
      ? b.data.decisions.filter((d) => d.date >= cutoffIso).length
      : b.data.decisions.length;
    result.push({
      id: b.id,
      shortName: b.shortName,
      currentRate: b.data.currentRate,
      asOfDate: b.data.asOfDate,
      changeBp,
      decisionsInWindow,
    });
  }
  return result;
}
