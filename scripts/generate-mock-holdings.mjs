// generate-mock-holdings.mjs
//
// WHAT THIS DOES (plain English):
// NBIM's real published holdings file isn't wired in yet (see /scripts/README.md
// for how to swap it in). Until then, this script invents a realistic-looking
// but entirely FAKE portfolio of ~200 well-known real companies, with made-up
// (but plausible) position sizes, so the whole site can be built and tested.
//
// Every number this script produces is fiction. The output file is clearly
// labeled `isMockData: true` and the UI must show a "MOCK DATA" badge
// wherever this data appears.
//
// HOW THE NUMBERS ARE MADE UP (so it's not a total black box):
// - Companies are listed below roughly biggest-to-smallest by real-world
//   market cap (a rough approximation from general knowledge, not looked up).
// - Position sizes follow a "power law" curve (a few giant positions, a long
//   tail of small ones) because that's how NBIM's real portfolio looks too.
// - A fixed random seed is used, so re-running this script always produces
//   the exact same numbers (makes it easier to spot if something changed).
//
// TO RE-RUN: `node scripts/generate-mock-holdings.mjs` from the project root.

import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const regions = JSON.parse(
  readFileSync(join(ROOT, "src/data/regions.json"), "utf-8")
);
const ftse100 = JSON.parse(
  readFileSync(join(ROOT, "src/data/ftse100.json"), "utf-8")
);
const ftse100Names = new Set(ftse100.constituents);

// Seeded random number generator (mulberry32) so output is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260720); // seed = today's date, arbitrary but fixed

// ~200 well-known real companies, roughly ordered biggest-to-smallest by
// real-world market cap (approximate, from general knowledge). Country names
// must match keys in src/data/regions.json exactly.
const companies = [
  // --- United States: mega caps ---
  ["Apple Inc", "United States", "Information Technology", "AAPL"],
  ["Microsoft Corporation", "United States", "Information Technology", "MSFT"],
  ["NVIDIA Corporation", "United States", "Information Technology", "NVDA"],
  ["Alphabet Inc", "United States", "Communication Services", "GOOGL"],
  ["Amazon.com Inc", "United States", "Consumer Discretionary", "AMZN"],
  ["Meta Platforms Inc", "United States", "Communication Services", "META"],
  ["Broadcom Inc", "United States", "Information Technology", "AVGO"],
  ["Berkshire Hathaway Inc", "United States", "Financials", "BRK.B"],
  ["Eli Lilly and Company", "United States", "Health Care", "LLY"],
  ["JPMorgan Chase & Co", "United States", "Financials", "JPM"],
  ["Visa Inc", "United States", "Financials", "V"],
  ["Mastercard Inc", "United States", "Financials", "MA"],
  ["UnitedHealth Group Inc", "United States", "Health Care", "UNH"],
  ["Exxon Mobil Corporation", "United States", "Energy", "XOM"],
  ["Walmart Inc", "United States", "Consumer Staples", "WMT"],
  ["Procter & Gamble Co", "United States", "Consumer Staples", "PG"],
  ["Johnson & Johnson", "United States", "Health Care", "JNJ"],
  ["Home Depot Inc", "United States", "Consumer Discretionary", "HD"],
  ["Chevron Corporation", "United States", "Energy", "CVX"],
  ["Merck & Co Inc", "United States", "Health Care", "MRK"],
  ["AbbVie Inc", "United States", "Health Care", "ABBV"],
  ["Costco Wholesale Corp", "United States", "Consumer Staples", "COST"],
  ["Netflix Inc", "United States", "Communication Services", "NFLX"],
  ["Adobe Inc", "United States", "Information Technology", "ADBE"],
  ["Salesforce Inc", "United States", "Information Technology", "CRM"],
  ["Oracle Corporation", "United States", "Information Technology", "ORCL"],
  ["Coca-Cola Co", "United States", "Consumer Staples", "KO"],
  ["PepsiCo Inc", "United States", "Consumer Staples", "PEP"],
  ["Bank of America Corp", "United States", "Financials", "BAC"],
  ["Thermo Fisher Scientific Inc", "United States", "Health Care", "TMO"],
  ["Danaher Corporation", "United States", "Health Care", "DHR"],
  ["Abbott Laboratories", "United States", "Health Care", "ABT"],
  ["McDonald's Corp", "United States", "Consumer Discretionary", "MCD"],
  ["Cisco Systems Inc", "United States", "Information Technology", "CSCO"],
  ["Intel Corporation", "United States", "Information Technology", "INTC"],
  ["Advanced Micro Devices Inc", "United States", "Information Technology", "AMD"],
  ["QUALCOMM Inc", "United States", "Information Technology", "QCOM"],
  ["Texas Instruments Inc", "United States", "Information Technology", "TXN"],
  ["International Business Machines Corp", "United States", "Information Technology", "IBM"],
  ["Goldman Sachs Group Inc", "United States", "Financials", "GS"],
  ["Morgan Stanley", "United States", "Financials", "MS"],
  ["American Express Co", "United States", "Financials", "AXP"],
  ["Verizon Communications Inc", "United States", "Communication Services", "VZ"],
  ["AT&T Inc", "United States", "Communication Services", "T"],
  ["Comcast Corporation", "United States", "Communication Services", "CMCSA"],
  ["Walt Disney Co", "United States", "Communication Services", "DIS"],
  ["Nike Inc", "United States", "Consumer Discretionary", "NKE"],
  ["Starbucks Corp", "United States", "Consumer Discretionary", "SBUX"],
  ["Lowe's Companies Inc", "United States", "Consumer Discretionary", "LOW"],
  ["Union Pacific Corp", "United States", "Industrials", "UNP"],
  ["Honeywell International Inc", "United States", "Industrials", "HON"],
  ["Caterpillar Inc", "United States", "Industrials", "CAT"],
  ["Boeing Co", "United States", "Industrials", "BA"],
  ["Lockheed Martin Corp", "United States", "Industrials", "LMT"],
  ["RTX Corporation", "United States", "Industrials", "RTX"],
  ["3M Co", "United States", "Industrials", "MMM"],
  ["General Electric Co", "United States", "Industrials", "GE"],
  ["Ford Motor Co", "United States", "Consumer Discretionary", "F"],
  ["General Motors Co", "United States", "Consumer Discretionary", "GM"],
  ["Uber Technologies Inc", "United States", "Industrials", "UBER"],
  ["PayPal Holdings Inc", "United States", "Financials", "PYPL"],
  ["ServiceNow Inc", "United States", "Information Technology", "NOW"],
  ["Intuit Inc", "United States", "Information Technology", "INTU"],
  ["Booking Holdings Inc", "United States", "Consumer Discretionary", "BKNG"],
  ["Airbnb Inc", "United States", "Consumer Discretionary", "ABNB"],
  ["Charles Schwab Corp", "United States", "Financials", "SCHW"],
  ["Blackstone Inc", "United States", "Financials", "BX"],
  ["S&P Global Inc", "United States", "Financials", "SPGI"],
  ["Moody's Corp", "United States", "Financials", "MCO"],
  ["CME Group Inc", "United States", "Financials", "CME"],
  ["Marsh & McLennan Companies Inc", "United States", "Financials", "MMC"],
  ["Progressive Corp", "United States", "Financials", "PGR"],
  ["Chubb Ltd", "United States", "Financials", "CB"],
  ["Travelers Companies Inc", "United States", "Financials", "TRV"],
  ["Simon Property Group Inc", "United States", "Real Estate", "SPG"],
  ["Prologis Inc", "United States", "Real Estate", "PLD"],
  ["American Tower Corp", "United States", "Real Estate", "AMT"],
  ["Public Storage", "United States", "Real Estate", "PSA"],
  ["Duke Energy Corp", "United States", "Utilities", "DUK"],
  ["NextEra Energy Inc", "United States", "Utilities", "NEE"],
  ["Southern Co", "United States", "Utilities", "SO"],
  ["Dominion Energy Inc", "United States", "Utilities", "D"],
  ["Sempra", "United States", "Utilities", "SRE"],
  ["Kinder Morgan Inc", "United States", "Energy", "KMI"],
  ["Williams Companies Inc", "United States", "Energy", "WMB"],
  ["ConocoPhillips", "United States", "Energy", "COP"],
  ["Occidental Petroleum Corp", "United States", "Energy", "OXY"],
  ["Schlumberger NV", "United States", "Energy", "SLB"],
  ["EOG Resources Inc", "United States", "Energy", "EOG"],
  // --- Canada ---
  ["Royal Bank of Canada", "Canada", "Financials", "RY"],
  ["Toronto-Dominion Bank", "Canada", "Financials", "TD"],
  ["Shopify Inc", "Canada", "Information Technology", "SHOP"],
  ["Canadian National Railway Co", "Canada", "Industrials", "CNI"],
  ["Enbridge Inc", "Canada", "Energy", "ENB"],
  // --- United Kingdom ---
  ["AstraZeneca", "United Kingdom", "Health Care"],
  ["Shell", "United Kingdom", "Energy"],
  ["HSBC Holdings", "United Kingdom", "Financials"],
  ["Unilever", "United Kingdom", "Consumer Staples"],
  ["BP", "United Kingdom", "Energy"],
  ["GSK", "United Kingdom", "Health Care"],
  ["Diageo", "United Kingdom", "Consumer Staples"],
  ["Rio Tinto", "United Kingdom", "Materials"],
  ["Reckitt Benckiser", "United Kingdom", "Consumer Staples"],
  ["British American Tobacco", "United Kingdom", "Consumer Staples"],
  ["National Grid", "United Kingdom", "Utilities"],
  ["Vodafone Group", "United Kingdom", "Communication Services"],
  ["Barclays", "United Kingdom", "Financials"],
  ["Lloyds Banking Group", "United Kingdom", "Financials"],
  ["NatWest Group", "United Kingdom", "Financials"],
  ["Prudential", "United Kingdom", "Financials"],
  ["Legal & General Group", "United Kingdom", "Financials"],
  ["Aviva", "United Kingdom", "Financials"],
  ["Rolls-Royce Holdings", "United Kingdom", "Industrials"],
  ["BAE Systems", "United Kingdom", "Industrials"],
  ["RELX", "United Kingdom", "Industrials"],
  ["Compass Group", "United Kingdom", "Industrials"],
  ["Sage Group", "United Kingdom", "Information Technology"],
  ["Tesco", "United Kingdom", "Consumer Staples"],
  ["J Sainsbury", "United Kingdom", "Consumer Staples"],
  ["Next", "United Kingdom", "Consumer Discretionary"],
  ["Associated British Foods", "United Kingdom", "Consumer Staples"],
  ["Anglo American", "United Kingdom", "Materials"],
  ["Glencore", "United Kingdom", "Materials"],
  ["Standard Chartered", "United Kingdom", "Financials"],
  ["Smith & Nephew", "United Kingdom", "Health Care"],
  ["WPP", "United Kingdom", "Communication Services"],
  ["London Stock Exchange Group", "United Kingdom", "Financials"],
  ["Pearson", "United Kingdom", "Consumer Discretionary"],
  ["ITV", "United Kingdom", "Communication Services"],
  ["Imperial Brands", "United Kingdom", "Consumer Staples"],
  ["Severn Trent", "United Kingdom", "Utilities"],
  ["SSE", "United Kingdom", "Utilities"],
  ["Centrica", "United Kingdom", "Utilities"],
  ["Admiral Group", "United Kingdom", "Financials"],
  ["Schroders", "United Kingdom", "Financials"],
  ["Ashtead Group", "United Kingdom", "Industrials"],
  ["Flutter Entertainment", "United Kingdom", "Consumer Discretionary"],
  ["Marks and Spencer Group", "United Kingdom", "Consumer Discretionary"],
  ["Kingfisher", "United Kingdom", "Consumer Discretionary"],
  ["Persimmon", "United Kingdom", "Consumer Discretionary"],
  ["Taylor Wimpey", "United Kingdom", "Consumer Discretionary"],
  ["Berkeley Group Holdings", "United Kingdom", "Consumer Discretionary"],
  // --- Continental Europe ---
  ["LVMH Moet Hennessy Louis Vuitton", "France", "Consumer Discretionary"],
  ["Nestle SA", "Switzerland", "Consumer Staples"],
  ["Novo Nordisk", "Denmark", "Health Care"],
  ["ASML Holding", "Netherlands", "Information Technology"],
  ["SAP SE", "Germany", "Information Technology"],
  ["Roche Holding", "Switzerland", "Health Care"],
  ["Novartis", "Switzerland", "Health Care"],
  ["TotalEnergies", "France", "Energy"],
  ["Sanofi", "France", "Health Care"],
  ["L'Oreal", "France", "Consumer Staples"],
  ["Siemens", "Germany", "Industrials"],
  ["Allianz SE", "Germany", "Financials"],
  ["Air Liquide", "France", "Materials"],
  ["Schneider Electric", "France", "Industrials"],
  ["Airbus SE", "France", "Industrials"],
  ["Deutsche Telekom", "Germany", "Communication Services"],
  ["Iberdrola", "Spain", "Utilities"],
  ["Banco Santander", "Spain", "Financials"],
  ["Inditex", "Spain", "Consumer Discretionary"],
  ["EssilorLuxottica", "France", "Health Care"],
  ["Hermes International", "France", "Consumer Discretionary"],
  ["Vinci SA", "France", "Industrials"],
  ["Safran SA", "France", "Industrials"],
  ["BNP Paribas", "France", "Financials"],
  ["AXA SA", "France", "Financials"],
  ["Munich Re", "Germany", "Financials"],
  ["Adidas AG", "Germany", "Consumer Discretionary"],
  ["Volkswagen AG", "Germany", "Consumer Discretionary"],
  ["Mercedes-Benz Group", "Germany", "Consumer Discretionary"],
  ["BMW AG", "Germany", "Consumer Discretionary"],
  ["Eni SpA", "Italy", "Energy"],
  ["Enel SpA", "Italy", "Utilities"],
  ["UBS Group", "Switzerland", "Financials"],
  ["Zurich Insurance Group", "Switzerland", "Financials"],
  ["Nordea Bank", "Finland", "Financials"],
  ["Equinor ASA", "Norway", "Energy"],
  ["Maersk", "Denmark", "Industrials"],
  ["Ericsson", "Sweden", "Information Technology"],
  ["Volvo AB", "Sweden", "Industrials"],
  ["Atlas Copco", "Sweden", "Industrials"],
  ["Investor AB", "Sweden", "Financials"],
  // --- Asia-Pacific ---
  ["Toyota Motor Corp", "Japan", "Consumer Discretionary"],
  ["Samsung Electronics", "South Korea", "Information Technology"],
  ["Taiwan Semiconductor Manufacturing", "Taiwan", "Information Technology"],
  ["Tencent Holdings", "China", "Communication Services"],
  ["Alibaba Group Holding", "China", "Consumer Discretionary"],
  ["Sony Group Corp", "Japan", "Consumer Discretionary"],
  ["Keyence Corp", "Japan", "Information Technology"],
  ["Mitsubishi UFJ Financial Group", "Japan", "Financials"],
  ["Nintendo Co", "Japan", "Communication Services"],
  ["SoftBank Group Corp", "Japan", "Communication Services"],
  ["Commonwealth Bank of Australia", "Australia", "Financials"],
  ["BHP Group", "Australia", "Materials"],
  ["CSL Limited", "Australia", "Health Care"],
  ["Reliance Industries", "India", "Energy"],
  ["Infosys", "India", "Information Technology"],
  ["Tata Consultancy Services", "India", "Information Technology"],
  ["HDFC Bank", "India", "Financials"],
];

// --- Generate position sizes (power-law: a few huge, many small) ---
const TARGET_TOTAL_USD = 1_600_000_000_000; // $1.6 trillion mock total portfolio

const rawValues = companies.map((_, i) => {
  const rank = i + 1;
  const base = Math.pow(rank, -0.35); // power-law decay by rank
  const jitter = 0.85 + rand() * 0.3; // +/- 15% randomness
  return base * jitter;
});
const rawSum = rawValues.reduce((a, b) => a + b, 0);
const scale = TARGET_TOTAL_USD / rawSum;
const marketValues = rawValues.map((v) => Math.round(v * scale));
const totalPortfolioValueUSD = marketValues.reduce((a, b) => a + b, 0);

// --- Generate ownership % (bigger companies -> lower %, smaller -> higher, capped) ---
function ownershipPctForRank(rank) {
  const base = 0.4 + 4.5 / Math.sqrt(rank);
  const jitter = 0.9 + rand() * 0.2;
  return Math.min(9.5, Math.max(0.3, base * jitter));
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const holdings = companies.map(([name, country, sector, ticker], i) => {
  const rank = i + 1;
  const marketValueUSD = marketValues[i];
  const ownershipPct = Math.round(ownershipPctForRank(rank) * 100) / 100;
  const portfolioPct =
    Math.round((marketValueUSD / totalPortfolioValueUSD) * 100 * 10000) /
    10000;
  const region = regions[country] || "Other";

  return {
    id: slugify(name),
    name,
    ticker: ticker || null,
    country,
    region,
    sector,
    marketValueUSD,
    ownershipPct,
    portfolioPct,
    isFTSE100: ftse100Names.has(name),
  };
});

// Sort by market value descending (biggest holding first) for a clean top-N table.
holdings.sort((a, b) => b.marketValueUSD - a.marketValueUSD);

const output = {
  asOfDate: "2025-12-31",
  isMockData: true,
  dataLabel:
    "MOCK DATA — illustrative only. These are not NBIM's real published figures. See /scripts/README.md to swap in real data.",
  source:
    "Generated by scripts/generate-mock-holdings.mjs. Company names are real, all financial figures are synthetic (power-law distributed, seeded random).",
  currency: "USD",
  totalPortfolioValueUSD,
  companyCount: holdings.length,
  generatedAt: new Date().toISOString(),
  holdings,
};

const outPath = join(ROOT, "public/data/holdings.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Wrote ${holdings.length} mock holdings to ${outPath}`);
console.log(
  `Total mock portfolio value: $${(totalPortfolioValueUSD / 1e12).toFixed(2)}tn`
);
console.log(
  `Top holding: ${holdings[0].name} ($${(holdings[0].marketValueUSD / 1e9).toFixed(1)}bn, ${holdings[0].portfolioPct}% of portfolio)`
);
