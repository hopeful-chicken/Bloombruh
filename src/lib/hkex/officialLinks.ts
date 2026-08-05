import { hkCode } from "./eodhd";

/** HKEX's own per-company page — works for every listed company via the
 * `sym` query param when it loads (verified live against 0700.HK: title
 * and company profile data resolve correctly for the right company).
 *
 * It's genuinely unreliable, though: it's a client-rendered page sitting
 * behind Akamai bot protection, and repeated live testing hit real
 * problems — the regulatory-filings widget never actually loads (likely
 * gated behind the same protection), its "See All" button has no real
 * href, response times ran 2-8 seconds, and it returned an outright 503
 * at least once during testing. This isn't a guess: a plain fetch was
 * retried multiple times and behaved inconsistently every time. Kept as a
 * link because it's the real, canonical HKEX page when it does load, but
 * paired with yahooFinanceQuoteUrl() below as a link that's actually
 * fast and reliable in practice, so the section doesn't depend on HKEX's
 * own site being up. */
export function hkexCompanyPageUrl(code: string): string {
  return `https://www.hkex.com.hk/Market-Data/Securities-Prices/Equities/Equities-Quote?sym=${hkCode(code)}&sc_lang=en`;
}

/** Yahoo Finance's own public quote page — verified fast and reliable
 * (consistently ~2s, 200 OK) where HKEX's own page was not. Shows real key
 * stats (market cap, P/E, EPS, 52-week range) for every HK ticker without
 * the flakiness of HKEX's site. Not a replacement for actual regulatory
 * filings, but a genuinely reliable source of real financial data as a
 * fallback when hkexCompanyPageUrl is slow or down. */
export function yahooFinanceQuoteUrl(code: string): string {
  return `https://finance.yahoo.com/quote/${hkCode(code)}.HK/`;
}

/** HKEXnews — the actual regulatory filing archive — has no bookmarkable
 * per-company URL at all (confirmed live: searching a stock code there
 * never changes the browser URL, even after selecting it from the
 * autocomplete and submitting — the whole results list is JS-app state,
 * not a URL). So there's no working "direct link to this company's
 * filings" to construct, generically, for any company on the exchange.
 * This links to the search homepage itself; the UI shows the stock code
 * next to it so the one extra manual step (paste it into the search box)
 * is as fast as possible instead of pretending a broken deep link works. */
export function hkexNewsSearchUrl(): string {
  return "https://www1.hkexnews.hk/search/titlesearch.xhtml?lang=en";
}
