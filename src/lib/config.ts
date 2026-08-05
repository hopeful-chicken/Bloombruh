// Single source of truth for the disclosure shown on every page (via
// TerminalFooter, rendered once in the root layout). Kept as one named
// constant, rather than hand-written prose repeated per component, so the
// wording can never drift between pages and is easy to audit in one place.

export const DISCLOSURE =
  "This site is for educational and informational purposes only. Nothing on it is financial advice, a recommendation to buy or sell any security, or personalized to your situation. Consult a licensed advisor before making investment decisions.";
