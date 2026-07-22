// Static registry of the central banks the Central Bank Room covers —
// same "small config list" pattern as src/lib/modules.ts. Adding a new
// bank later is just adding an entry here; nothing else needs to change,
// since the news fetch and opinions filter both key off `id`.

export type CentralBankId =
  | "fed"
  | "ecb"
  | "boe"
  | "boj"
  | "pboc"
  | "snb"
  | "rba"
  | "boc";

export type CentralBank = {
  id: CentralBankId;
  name: string;
  shortName: string;
  region: string;
  /** Search query used against Google News' RSS feed — kept separate from
   * `name` since "Federal Reserve" alone pulls in too much noise, while
   * adding "interest rate" keeps results on-topic. */
  newsQuery: string;
};

export const CENTRAL_BANKS: CentralBank[] = [
  {
    id: "fed",
    name: "Federal Reserve",
    shortName: "Fed",
    region: "United States",
    newsQuery: "Federal Reserve interest rate",
  },
  {
    id: "ecb",
    name: "European Central Bank",
    shortName: "ECB",
    region: "Eurozone",
    newsQuery: "European Central Bank interest rate",
  },
  {
    id: "boe",
    name: "Bank of England",
    shortName: "BoE",
    region: "United Kingdom",
    newsQuery: "Bank of England interest rate",
  },
  {
    id: "boj",
    name: "Bank of Japan",
    shortName: "BoJ",
    region: "Japan",
    newsQuery: "Bank of Japan interest rate",
  },
  {
    id: "pboc",
    name: "People's Bank of China",
    shortName: "PBoC",
    region: "China",
    newsQuery: "People's Bank of China interest rate",
  },
  {
    id: "snb",
    name: "Swiss National Bank",
    shortName: "SNB",
    region: "Switzerland",
    newsQuery: "Swiss National Bank interest rate",
  },
  {
    id: "rba",
    name: "Reserve Bank of Australia",
    shortName: "RBA",
    region: "Australia",
    newsQuery: "Reserve Bank of Australia interest rate",
  },
  {
    id: "boc",
    name: "Bank of Canada",
    shortName: "BoC",
    region: "Canada",
    newsQuery: "Bank of Canada interest rate",
  },
];

export function getCentralBank(id: string): CentralBank | undefined {
  return CENTRAL_BANKS.find((b) => b.id === id);
}
