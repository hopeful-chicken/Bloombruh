// Adam's own commentary on the Markets Overview module — same pattern as
// src/data/centralBankOpinions.ts: a plain, version-controlled data file
// (no database), keyed by segment id so each sector/private-market
// section/world-situation panel can show its own "Adam's take" separately
// from the AI-generated narrative and the real news above it. To publish a
// new take, add an entry to the array below and redeploy. Starts empty.

export type MarketCommentarySegmentId =
  | "world"
  | "global-equities"
  | "tmt"
  | "fig"
  | "healthcare"
  | "energy"
  | "industrials"
  | "consumer"
  | "private-equity"
  | "private-credit"
  | "real-assets";

export type MarketCommentaryEntry = {
  segmentId: MarketCommentarySegmentId;
  /** ISO date string, e.g. "2026-07-21" */
  date: string;
  title: string;
  /** Plain text — paragraphs separated by a blank line, same convention as
   * the report builder's text blocks and centralBankOpinions.ts. */
  body: string;
};

export const MARKET_COMMENTARY: MarketCommentaryEntry[] = [];
