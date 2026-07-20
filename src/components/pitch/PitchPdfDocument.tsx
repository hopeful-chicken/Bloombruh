// The exportable PDF for a pitch, built with @react-pdf/renderer (a pure-JS
// PDF renderer — no headless browser needed, so it works fine on Vercel's
// free tier). The price sparkline is drawn directly as an SVG path from
// the raw closing prices, rather than screenshotting the on-page chart —
// keeps this dependency-light and avoids fragile DOM-capture tooling.

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { formatUSD, formatPct } from "@/lib/format";
import type { Rating } from "./PitchWorkbench";
import type { Fundamentals } from "@/lib/secEdgar";

export type PitchPdfProps = {
  symbol: string;
  companyName: string;
  exchange: string;
  price: number;
  change: number;
  percentChange: number;
  week52High: number;
  week52Low: number;
  movingAverage50: number | null;
  annualizedVol: number | null;
  chartCloses: number[];
  fundamentals: Fundamentals | null;
  rating: Rating;
  targetPrice: number | null;
  thesis: string;
  catalysts: string[];
  risks: string[];
  generatedAt: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "2 solid #1a1a1a",
    paddingBottom: 8,
    marginBottom: 12,
  },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  ticker: { fontSize: 11, color: "#555555" },
  price: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "right" },
  ratingBadge: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#555555",
    marginTop: 14,
    marginBottom: 6,
  },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statBox: { width: "22%", marginBottom: 8 },
  statValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 8, color: "#666666" },
  paragraph: { fontSize: 10, lineHeight: 1.5 },
  bullet: { flexDirection: "row", marginBottom: 3 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#888888",
    borderTop: "1 solid #cccccc",
    paddingTop: 6,
  },
});

const RATING_COLORS: Record<Rating, string> = {
  Buy: "#1a7f37",
  Hold: "#9a6700",
  Sell: "#b91c1c",
};

/** Builds an SVG path string tracing normalized closing prices. */
function sparklinePath(closes: number[], width: number, height: number): string {
  if (closes.length < 2) return "";
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const stepX = width / (closes.length - 1);
  const points = closes.map((c, i) => {
    const x = i * stepX;
    const y = height - ((c - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function PitchPdfDocument(props: PitchPdfProps) {
  const isUp = props.change >= 0;
  const impliedUpsidePct =
    props.targetPrice !== null && props.price > 0
      ? ((props.targetPrice - props.price) / props.price) * 100
      : null;

  return (
    <Document
      title={`${props.companyName} (${props.symbol}) — Pitch`}
      author="Graduate Analyst Terminal"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{props.companyName}</Text>
            <Text style={styles.ticker}>
              {props.symbol} · {props.exchange}
            </Text>
          </View>
          <View>
            <Text style={styles.price}>{formatUSD(props.price)}</Text>
            <Text
              style={{
                fontSize: 10,
                textAlign: "right",
                color: isUp ? "#1a7f37" : "#b91c1c",
              }}
            >
              {isUp ? "+" : ""}
              {props.change.toFixed(2)} ({formatPct(props.percentChange)})
            </Text>
          </View>
        </View>

        {/* Rating + target */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text
            style={[
              styles.ratingBadge,
              { backgroundColor: RATING_COLORS[props.rating] },
            ]}
          >
            {props.rating.toUpperCase()}
          </Text>
          {props.targetPrice !== null && (
            <Text style={{ fontSize: 10 }}>
              Target: {formatUSD(props.targetPrice)}
              {impliedUpsidePct !== null &&
                ` (${formatPct(impliedUpsidePct)} implied)`}
            </Text>
          )}
        </View>

        {/* Sparkline */}
        {props.chartCloses.length > 1 && (
          <View style={{ marginTop: 12 }}>
            <Svg width="523" height="70" viewBox="0 0 523 70">
              <Path
                d={sparklinePath(props.chartCloses, 523, 70)}
                stroke={isUp ? "#1a7f37" : "#b91c1c"}
                strokeWidth={1.5}
                fill="none"
              />
            </Svg>
          </View>
        )}

        {/* Key stats */}
        <Text style={styles.sectionTitle}>Price stats</Text>
        <View style={styles.statsRow}>
          <Stat label="52-week high" value={formatUSD(props.week52High)} />
          <Stat label="52-week low" value={formatUSD(props.week52Low)} />
          <Stat
            label="50-day avg."
            value={props.movingAverage50 ? formatUSD(props.movingAverage50) : "—"}
          />
          <Stat
            label="Volatility (ann.)"
            value={props.annualizedVol ? formatPct(props.annualizedVol, 0) : "—"}
          />
        </View>

        {/* Fundamentals */}
        {props.fundamentals && (
          <>
            <Text style={styles.sectionTitle}>
              Fundamentals (FY{props.fundamentals.fiscalYear}, SEC filings)
            </Text>
            <View style={styles.statsRow}>
              <Stat
                label="Revenue"
                value={
                  props.fundamentals.revenue !== null
                    ? formatUSD(props.fundamentals.revenue)
                    : "—"
                }
              />
              <Stat
                label="Revenue growth (YoY)"
                value={
                  props.fundamentals.revenue !== null &&
                  props.fundamentals.revenuePriorYear
                    ? formatPct(
                        ((props.fundamentals.revenue -
                          props.fundamentals.revenuePriorYear) /
                          props.fundamentals.revenuePriorYear) *
                          100
                      )
                    : "—"
                }
              />
              <Stat
                label="Net income"
                value={
                  props.fundamentals.netIncome !== null
                    ? formatUSD(props.fundamentals.netIncome)
                    : "—"
                }
              />
              <Stat
                label="EPS (diluted)"
                value={
                  props.fundamentals.epsDiluted !== null
                    ? `$${props.fundamentals.epsDiluted.toFixed(2)}`
                    : "—"
                }
              />
            </View>
          </>
        )}

        {/* Thesis */}
        <Text style={styles.sectionTitle}>Thesis</Text>
        <Text style={styles.paragraph}>
          {props.thesis.trim() || "(no thesis written)"}
        </Text>

        {/* Catalysts */}
        {props.catalysts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Catalysts</Text>
            {props.catalysts.map((c, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{c}</Text>
              </View>
            ))}
          </>
        )}

        {/* Risks */}
        {props.risks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Risks</Text>
            {props.risks.map((r, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{r}</Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated {props.generatedAt} by Graduate Analyst Terminal. Prices
          from Twelve Data, fundamentals from SEC EDGAR (may be delayed).
          This is student-written analysis, not investment advice — always
          do your own research.
        </Text>
      </Page>
    </Document>
  );
}
