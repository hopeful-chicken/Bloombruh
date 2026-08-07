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
  Rect,
  Link,
} from "@react-pdf/renderer";
import { formatUSD, formatPct } from "@/lib/format";
import type { Rating } from "./PitchWorkbench";
import type { Fundamentals } from "@/lib/secEdgar";
import type { Block, StatEntry, ChartSeriesOption } from "@/lib/reportBlocks";
import { parseLines } from "@/lib/reportBlocks";
import { computeLbo, computeManda } from "@/lib/dealMath";
import type { NewsArticle } from "@/lib/news";

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
  blocks: Block[];
  availableStats: StatEntry[];
  chartSeries: ChartSeriesOption[];
  newsArticles: NewsArticle[];
  generatedAt: string;
};

const ACCENT = "#d97757";
const ACCENT_DIM = "#f3e3da";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  body: { paddingHorizontal: 36, paddingBottom: 36 },
  banner: {
    backgroundColor: "#17161c",
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 18,
    marginBottom: 18,
  },
  kicker: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  companyName: { fontSize: 19, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  ticker: { fontSize: 11, color: "#a8a8b3" },
  price: { fontSize: 19, fontFamily: "Helvetica-Bold", textAlign: "right", color: "#ffffff" },
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
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
    borderLeft: `3 solid ${ACCENT}`,
    paddingLeft: 6,
  },
  card: {
    border: "1 solid #e2e2e2",
    borderRadius: 4,
    padding: 12,
  },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statBox: {
    width: "22%",
    marginBottom: 8,
    backgroundColor: ACCENT_DIM,
    borderRadius: 3,
    padding: 6,
  },
  statValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 8, color: "#666666", marginTop: 2 },
  paragraph: { fontSize: 10, lineHeight: 1.5 },
  bullet: { flexDirection: "row", marginBottom: 3 },
  bulletDot: { width: 10, fontSize: 10, color: ACCENT },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  swotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  swotBox: {
    width: "48%",
    border: "1 solid #e2e2e2",
    borderRadius: 4,
    padding: 10,
  },
  swotLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#666666",
    marginBottom: 4,
  },
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

/** Builds an SVG path string tracing a normalized series of numbers — used
 * both for the price sparkline in the banner and for line-type Chart
 * blocks in the report body. */
function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}

/** Same normalization as sparklinePath, but returns a rect per value for
 * a bar-type Chart block. */
function barRects(
  values: number[],
  width: number,
  height: number
): { x: number; y: number; w: number; h: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const gap = 4;
  const barWidth = Math.max((width - gap * (values.length - 1)) / values.length, 1);
  return values.map((v, i) => {
    const barHeight = ((v - min) / range) * height;
    return {
      x: i * (barWidth + gap),
      y: height - barHeight,
      w: barWidth,
      h: Math.max(barHeight, 0),
    };
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SwotBox({ label, items }: { label: string; items: string[] }) {
  return (
    <View style={styles.swotBox}>
      <Text style={styles.swotLabel}>{label}</Text>
      {items.length > 0 ? (
        items.map((item, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))
      ) : (
        <Text style={{ fontSize: 9, color: "#999999" }}>—</Text>
      )}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={{ fontSize: 9, color: "#999999" }}>—</Text>;
  }
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

/** Renders one student-built block into the PDF, matching whatever type
 * it is — this is what makes the report genuinely personalizable instead
 * of a fixed template. */
function BlockOutput({
  block,
  availableStats,
  chartSeries,
  newsArticles,
}: {
  block: Block;
  availableStats: StatEntry[];
  chartSeries: ChartSeriesOption[];
  newsArticles: NewsArticle[];
}) {
  const title = block.title || "Untitled";

  if (block.type === "text") {
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.paragraph}>{block.data.body.trim() || "(nothing written)"}</Text>
      </>
    );
  }

  if (block.type === "swot") {
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.swotGrid}>
          <SwotBox label="Strengths" items={parseLines(block.data.strengths)} />
          <SwotBox label="Weaknesses" items={parseLines(block.data.weaknesses)} />
          <SwotBox label="Opportunities" items={parseLines(block.data.opportunities)} />
          <SwotBox label="Threats" items={parseLines(block.data.threats)} />
        </View>
      </>
    );
  }

  if (block.type === "list") {
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <BulletList items={parseLines(block.data.items)} />
      </>
    );
  }

  if (block.type === "stats") {
    const rows = block.data.statKeys
      .map((key) => availableStats.find((s) => s.key === key))
      .filter((s): s is StatEntry => Boolean(s));
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.card, styles.statsRow]}>
          {rows.map((stat) => (
            <Stat
              key={stat.key}
              label={stat.label}
              value={stat.value ?? block.data.overrides[stat.key] ?? "Unavailable"}
            />
          ))}
        </View>
      </>
    );
  }

  if (block.type === "comps") {
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {block.data.rows.length === 0 ? (
          <Text style={{ fontSize: 9, color: "#999999" }}>—</Text>
        ) : (
          <View style={styles.card}>
            {block.data.rows.map((row) => (
              <Text key={row.symbol} style={{ fontSize: 9, marginBottom: 3 }}>
                {row.symbol}
                {row.error
                  ? `: ${row.error}`
                  : `: Price ${row.price !== null ? formatUSD(row.price) : "—"}, P/E ${
                      row.peRatio !== null ? row.peRatio.toFixed(1) + "x" : "—"
                    }, Revenue ${row.revenue !== null ? formatUSD(row.revenue) : "—"}, Net margin ${
                      row.netMarginPct !== null ? formatPct(row.netMarginPct) : "—"
                    }`}
              </Text>
            ))}
          </View>
        )}
      </>
    );
  }

  if (block.type === "lbo") {
    const result = computeLbo(block.data);
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {result ? (
          <View style={[styles.card, styles.statsRow]}>
            <Stat label="Entry equity" value={formatUSD(result.entryEquity)} />
            <Stat label="Exit equity" value={formatUSD(result.exitEquity)} />
            <Stat label="MOIC" value={`${result.moic.toFixed(2)}x`} />
            <Stat label="IRR" value={`${result.irrPct.toFixed(1)}%`} />
          </View>
        ) : (
          <Text style={{ fontSize: 9, color: "#999999" }}>(incomplete inputs)</Text>
        )}
      </>
    );
  }

  if (block.type === "chart") {
    const series = chartSeries.find((s) => s.key === block.data.seriesKey);
    const values = series?.points.map((p) => p.value) ?? [];
    const width = 500;
    const height = 110;
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.card}>
          {series && values.length > 1 ? (
            <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              {block.data.chartType === "bar"
                ? barRects(values, width, height).map((r, i) => (
                    <Rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={ACCENT} />
                  ))
                : (
                    <Path
                      d={sparklinePath(values, width, height)}
                      stroke={ACCENT}
                      strokeWidth={1.5}
                      fill="none"
                    />
                  )}
            </Svg>
          ) : (
            <Text style={{ fontSize: 9, color: "#999999" }}>
              (not enough data for this series)
            </Text>
          )}
        </View>
      </>
    );
  }

  if (block.type === "news") {
    // null selectedLinks means "include everything" (default/legacy state);
    // otherwise only the articles the student explicitly checked.
    const selected =
      block.data.selectedLinks === null
        ? newsArticles
        : newsArticles.filter((a) => block.data.selectedLinks!.includes(a.link));
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {selected.length === 0 ? (
          <Text style={{ fontSize: 9, color: "#999999" }}>(no recent headlines found)</Text>
        ) : (
          <View style={styles.card}>
            {selected.map((a, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Link src={a.link} style={{ fontSize: 9, color: "#1a1a1a" }}>
                  {a.title}
                </Link>
                <Text style={{ fontSize: 8, color: "#999999", marginTop: 1 }}>
                  {a.source ? `${a.source} · ` : ""}
                  {a.pubDate}
                </Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
  }

  // manda
  const result = computeManda(block.data);
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      {result ? (
        <View style={[styles.card, styles.statsRow]}>
          <Stat label="Deal value" value={formatUSD(result.dealValue)} />
          <Stat
            label="Pro-forma EPS"
            value={result.proFormaEps !== null ? `$${result.proFormaEps.toFixed(2)}` : "—"}
          />
          <Stat
            label="Accretion / (dilution)"
            value={
              result.accretionDilutionPct !== null
                ? formatPct(result.accretionDilutionPct)
                : "—"
            }
          />
          <Stat
            label="Goodwill"
            value={result.goodwill !== null ? formatUSD(result.goodwill) : "—"}
          />
        </View>
      ) : (
        <Text style={{ fontSize: 9, color: "#999999" }}>(incomplete inputs)</Text>
      )}
    </>
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
      title={`${props.companyName} (${props.symbol}): Pitch`}
      author="Bloombruh"
    >
      <Page size="A4" style={styles.page}>
        {/* Banner: company header, rating, sparkline — on a dark card so the
            PDF reads like a "terminal" printout rather than a plain memo. */}
        <View style={styles.banner}>
          <Text style={styles.kicker}>Bloombruh · Pitch</Text>
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
                  color: isUp ? "#55b685" : "#e2685a",
                }}
              >
                {isUp ? "+" : ""}
                {props.change.toFixed(2)} ({formatPct(props.percentChange)})
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
            }}
          >
            <Text
              style={[
                styles.ratingBadge,
                { backgroundColor: RATING_COLORS[props.rating] },
              ]}
            >
              {props.rating.toUpperCase()}
            </Text>
            {props.targetPrice !== null && (
              <Text style={{ fontSize: 10, color: "#f1eee5" }}>
                Target: {formatUSD(props.targetPrice)}
                {impliedUpsidePct !== null &&
                  ` (${formatPct(impliedUpsidePct)} implied)`}
              </Text>
            )}
          </View>

          {props.chartCloses.length > 1 && (
            <View style={{ marginTop: 14 }}>
              <Svg width="523" height="60" viewBox="0 0 523 60">
                <Path
                  d={sparklinePath(props.chartCloses, 523, 60)}
                  stroke={isUp ? "#55b685" : "#e2685a"}
                  strokeWidth={1.5}
                  fill="none"
                />
              </Svg>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Key stats */}
          <Text style={styles.sectionTitle}>Price stats</Text>
          <View style={[styles.card, styles.statsRow]}>
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
              <View style={[styles.card, styles.statsRow]}>
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

          {/* Student-built report blocks — rendered generically in
              whatever order the student assembled them in. */}
          {props.blocks.map((block) => (
            <BlockOutput
              key={block.id}
              block={block}
              availableStats={props.availableStats}
              chartSeries={props.chartSeries}
              newsArticles={props.newsArticles}
            />
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated {props.generatedAt} by Bloombruh. Prices from Twelve
          Data, fundamentals from SEC EDGAR (may be delayed).
          This is student-written analysis, not investment advice, always
          do your own research.
        </Text>
      </Page>
    </Document>
  );
}
