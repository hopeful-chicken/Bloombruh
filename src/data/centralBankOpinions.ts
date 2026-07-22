// Adam's own commentary on each central bank — this is the "part where I
// can add my own opinion" the Central Bank Room needed. There's no
// database or login system in this project (see CLAUDE.md's tech stack
// decision), so this is a plain, version-controlled data file: to publish
// a new take, add an entry to the array below (ask Claude Code to do it,
// or edit it directly) and redeploy. It's the same "static/preprocessed
// data" approach used everywhere else on the site — just editorial
// content instead of fetched numbers.
//
// This is explicitly Adam's own opinion, not fetched or AI-generated data
// — the Central Bank Room page labels it as such so it's never confused
// with the real, sourced news headlines next to it.

import type { CentralBankId } from "@/lib/centralBanks";

export type CentralBankOpinion = {
  bankId: CentralBankId;
  /** ISO date string, e.g. "2026-07-21" */
  date: string;
  title: string;
  /** Plain text — paragraphs separated by a blank line, same convention
   * as the report builder's text blocks (no markdown, keeps this simple). */
  body: string;
};

export const CENTRAL_BANK_OPINIONS: CentralBankOpinion[] = [];
