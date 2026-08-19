// Shared client for every AI-generated feature on this site (market
// commentary, Central Bank Room narratives, Hype vs Fundamentals, HKEX
// summaries, rate-decision explanations, pitch news recaps, and the Pro
// report grader). One place to configure which provider actually answers,
// instead of each feature constructing its own client.
//
// Prefers Moonshot's Kimi models when MOONSHOT_API_KEY is set (2026-08-12
// — Adam's own Anthropic account ran out of credit, and Kimi's API is
// Anthropic-SDK-compatible: same @anthropic-ai/sdk client, just pointed at
// a different base URL, no code changes needed beyond this file). Falls
// back to real Claude via ANTHROPIC_API_KEY if Moonshot isn't configured,
// so this still works standalone if the Kimi key is ever removed.

import Anthropic from "@anthropic-ai/sdk";

const MOONSHOT_BASE_URL = "https://api.moonshot.ai/anthropic";

// Kimi's recommended general-purpose model (see platform.kimi.ai's own
// Claude Code integration guide) — used for every call site here, from
// short factual narratives to the heavier Pro report grader, since Kimi
// doesn't document a separate lighter/heavier tier the way Claude's
// Sonnet/Opus split does.
export const AI_MODEL = "kimi-k3";

export function getAiClient(): Anthropic {
  const moonshotKey = process.env.MOONSHOT_API_KEY;
  if (moonshotKey) {
    return new Anthropic({ apiKey: moonshotKey, baseURL: MOONSHOT_BASE_URL });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return new Anthropic({ apiKey: anthropicKey });
  }

  throw new Error(
    "Neither MOONSHOT_API_KEY nor ANTHROPIC_API_KEY is set. Add one to .env.local — see .env.local.example."
  );
}
