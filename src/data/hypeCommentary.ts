// Adam's own commentary for the Hype vs Fundamentals module — same plain,
// version-controlled data-file pattern as centralBankOpinions.ts and
// marketCommentary.ts. Keyed by case/theme id so a take can be published
// for one historical case or one current theme independently. Starts
// empty; the page shows an honest "no commentary yet" state per entry
// rather than faking one.

export type HypeCommentaryEntry = {
  /** A HypeCaseId or HypeThemeId — kept as a plain string here so this
   * file doesn't need to import both registries just for a union type. */
  entryId: string;
  date: string;
  title: string;
  body: string;
};

export const HYPE_COMMENTARY: HypeCommentaryEntry[] = [];
