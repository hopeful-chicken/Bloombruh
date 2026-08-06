// Shared unlock code for gated stock-pitch content. Read by both
// PitchToolkitGate.tsx (the on-page code prompt) and the pitch-deck
// download API route, so the two stay in sync instead of drifting.
//
// NOT real security — this code is visible to anyone reading the client
// bundle. It's a friction gate, same as AiGrader.tsx elsewhere on this
// site: it stops a casual visitor or a search-engine crawler from landing
// directly on a pitch or its downloadable deck, but it will not stop
// anyone who actually looks at the code.
export const PITCH_UNLOCK_CODE = "vq55jh68&*";
export const PITCH_UNLOCK_STORAGE_KEY = "bloombruh-pitch-toolkit-unlocked";

// Allowlist of valid pitch-deck template ids — also doubles as the only
// filenames the download API route will ever read from disk, so a
// malformed or malicious `id` query param can't be used to read an
// arbitrary file.
export const PITCH_TEMPLATE_IDS = [
  "diploma-plc",
  "nintendo",
  "british-american-tobacco",
  "asml",
  "tsmc",
  "maersk",
  "dominos-pizza-group",
  "palantir",
  "microsoft-ai-industry",
] as const;

export type PitchTemplateId = (typeof PITCH_TEMPLATE_IDS)[number];
