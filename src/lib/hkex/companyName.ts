// Strips common corporate-entity suffixes for use in a news search query.
// The EODHD directory's official names are often formal legal names
// ("CK Hutchison Holdings Limited") that real news coverage rarely spells
// out in full — searching Google News for the exact formal name can miss
// real, relevant, reliable-outlet coverage that just says "CK Hutchison"
// (confirmed empirically: the full-name query surfaced only obscure
// sources, while the shortened name surfaced Reuters/Bloomberg/WSJ/SCMP
// pieces on the same company). Display names elsewhere stay the full
// official name — this is only for building a better search query.

const SUFFIX_PATTERN =
  /\s*[,]?\s*(holdings?( company)?|group( holdings?)?|company|corporation|international|international holdings?)?\s*(limited|ltd\.?|plc|inc\.?|corp\.?|co\.?,?\s*ltd\.?)\s*$/i;

const SHARE_CLASS_PATTERN = /\s+(class\s+[a-z]|[a-z])$/i;

/** Strips trailing legal-entity suffixes (repeatedly, since names can
 * stack them — "X Group Holdings Limited") and a trailing bare share-class
 * letter ("Swire Pacific A" -> "Swire Pacific"). Never strips below a
 * reasonable minimum length, so a genuinely short name is left alone. */
export function simplifyCompanyName(name: string): string {
  let result = name.trim();

  for (let i = 0; i < 3; i++) {
    const stripped = result.replace(SUFFIX_PATTERN, "").trim();
    if (stripped === result || stripped.length < 3) break;
    result = stripped;
  }

  const withoutClass = result.replace(SHARE_CLASS_PATTERN, "").trim();
  if (withoutClass.length >= 3) result = withoutClass;

  return result || name.trim();
}

/** A broader fallback beyond simplifyCompanyName, for names its suffix
 * list doesn't fully clean — e.g. "Ping An Insurance (Group) Co of China
 * Ltd" only simplifies to "Ping An Insurance (Group) Co of China" (the
 * "(Group) ... of China" structure isn't a simple trailing suffix), which
 * still misses real coverage a plainer "Ping An Insurance" query finds
 * (confirmed empirically). Only cuts at the first parenthesis — safe even
 * for names where the parenthetical is meaningful (e.g. "Bank of China
 * (Hong Kong)" -> "Bank of China" is still a correct, just less specific,
 * search subject), so this is only used as a secondary broadening query,
 * not a replacement for the primary simplified-name search. */
export function coreCompanyName(name: string): string {
  const simplified = simplifyCompanyName(name);
  const parenIndex = simplified.indexOf("(");
  if (parenIndex > 2) {
    const core = simplified.slice(0, parenIndex).trim();
    if (core.length >= 3) return core;
  }
  return simplified;
}
