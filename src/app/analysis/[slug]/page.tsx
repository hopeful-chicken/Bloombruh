import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ANALYSIS_ENTRIES, STOCK_PITCHES } from "@/data/analysis";
import PitchToolkitGate from "@/components/research/PitchToolkitGate";
import ArticleBody from "@/components/research/ArticleBody";
import MarketChart from "@/components/pokemon/MarketChart";
import CharizardChart from "@/components/pokemon/CharizardChart";
import ThirtyDollarChart from "@/components/pokemon/ThirtyDollarChart";
import { PRODUCTION_MILESTONES, CHARIZARD_PRICE_HISTORY, THIRTY_DOLLAR_COMPARISON } from "@/lib/pokemonMarket";
import { getCard } from "@/lib/pokemonCards";

const ALL_ENTRIES = [...ANALYSIS_ENTRIES, ...STOCK_PITCHES];

export function generateStaticParams() {
  return ALL_ENTRIES.map((entry) => ({ slug: entry.id }));
}

// One real TCGdex card image plus a caption, used for every {{POKEMON_*_IMAGE}}
// block below. `unoptimized`-style plain <img>, matching the site's existing
// per-card page convention for this same external CDN.
function CardImage({
  image,
  alt,
  caption,
  widthClass = "w-28 sm:w-36",
}: {
  image: string;
  alt: string;
  caption: ReactNode;
  widthClass?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- external TCGdex CDN, same as the site's existing per-card page */}
      <img
        src={`${image}/high.png`}
        alt={alt}
        className={`h-auto shrink-0 rounded-sm border border-border ${widthClass}`}
      />
      <div className="text-xs text-muted">{caption}</div>
    </div>
  );
}

// Real chart/image content for specific write-ups, keyed to {{TOKEN}}
// markers in that entry's own markdown body (see ArticleBody). Can't live
// in analysis.ts itself since that's a plain data file, not JSX.
async function getWriteUpBlocks(slug: string): Promise<Record<string, ReactNode> | undefined> {
  if (slug === "pokemon-cards-as-an-asset-class") {
    const [charizard, modernCharizard, umbreonSir] = await Promise.all([
      getCard("en", "base1-4"),
      getCard("en", "sv03-125"),
      getCard("en", "sv08.5-161"),
    ]);

    return {
      POKEMON_CARD_IMAGE: charizard?.image ? (
        <div className="my-6 rounded-sm border border-border bg-surface/60 p-5">
          <CardImage
            image={charizard.image}
            alt="1st Edition Base Set Charizard"
            widthClass="w-28 sm:w-36"
            caption={
              <>
                <p className="font-display text-sm font-semibold text-foreground">
                  1st Edition Base Set Charizard (#4/102)
                </p>
                <p className="mt-1">
                  The card behind every number in this section. Real card art, via TCGdex, the
                  same source this site&apos;s pricing data comes from.
                </p>
              </>
            }
          />
        </div>
      ) : null,
      POKEMON_MODERN_CARDS_IMAGE:
        modernCharizard?.image && umbreonSir?.image ? (
          <div className="my-6 grid gap-4 rounded-sm border border-border bg-surface/60 p-5 sm:grid-cols-2">
            <CardImage
              image={modernCharizard.image}
              alt="Charizard ex, Obsidian Flames"
              widthClass="w-24 sm:w-28"
              caption={
                <>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Charizard ex (Obsidian Flames, 2023)
                  </p>
                  <p className="mt-1">The card that fell from $126 to $79.</p>
                </>
              }
            />
            <CardImage
              image={umbreonSir.image}
              alt="Umbreon ex, Special Illustration Rare, Prismatic Evolutions"
              widthClass="w-24 sm:w-28"
              caption={
                <>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Umbreon ex SIR (Prismatic Evolutions, 2025)
                  </p>
                  <p className="mt-1">The card that fell from $1,600 to $832.</p>
                </>
              }
            />
          </div>
        ) : null,
      POKEMON_PRODUCTION_CHART: <MarketChart data={PRODUCTION_MILESTONES} />,
      POKEMON_CHARIZARD_CHART: <CharizardChart data={CHARIZARD_PRICE_HISTORY} />,
      POKEMON_THIRTYDOLLAR_CHART: <ThirtyDollarChart data={THIRTY_DOLLAR_COMPARISON} />,
    };
  }

  return undefined;
}

export default async function AnalysisEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writeUp = ANALYSIS_ENTRIES.find((e) => e.id === slug);
  const isPitch = STOCK_PITCHES.some((e) => e.id === slug);
  if (!writeUp && !isPitch) notFound();
  const blocks = writeUp ? await getWriteUpBlocks(slug) : undefined;

  return (
    <div>
      <Link
        href="/analysis"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← All of My Analysis
      </Link>

      {writeUp ? (
        // Write-ups are public — real content, rendered server-side, same
        // as every other page on the site. Only stock pitches (below) are
        // gated: nothing about a pitch, not even its title, gets rendered
        // in this tree, since a server component's output ships to every
        // visitor regardless of the gate's visual state. See docs/DECISIONS.md.
        <>
          <p className="font-mono mt-4 text-[11px] text-muted">{writeUp.date}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {writeUp.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{writeUp.tagline}</p>
          <div className="mt-8 border-t border-border pt-6">
            <ArticleBody body={writeUp.body} chart={writeUp.chart} blocks={blocks} />
          </div>
        </>
      ) : (
        <PitchToolkitGate pitchId={slug} />
      )}
    </div>
  );
}
