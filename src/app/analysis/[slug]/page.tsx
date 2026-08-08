import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ANALYSIS_ENTRIES, STOCK_PITCHES } from "@/data/analysis";
import PitchToolkitGate from "@/components/research/PitchToolkitGate";
import ArticleBody from "@/components/research/ArticleBody";
import MarketChart from "@/components/pokemon/MarketChart";
import CharizardChart from "@/components/pokemon/CharizardChart";
import ThirtyDollarChart from "@/components/pokemon/ThirtyDollarChart";
import PsaPopulationChart from "@/components/pokemon/PsaPopulationChart";
import GemRateChart from "@/components/pokemon/GemRateChart";
import {
  PRODUCTION_MILESTONES,
  CHARIZARD_PRICE_HISTORY,
  THIRTY_DOLLAR_COMPARISON,
  PSA_POPULATION_GROWTH,
  GEM_RATE_COMPARISON,
} from "@/lib/pokemonMarket";
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
  layout = "row",
}: {
  image: string;
  alt: string;
  caption: ReactNode;
  widthClass?: string;
  /** "row" (image beside caption, the default) or "stack" (image on top,
   * caption centered below) — "stack" is for narrow grid cells, e.g. the
   * four-up Base Set population grid, where a side-by-side row is cramped. */
  layout?: "row" | "stack";
}) {
  return (
    <div className={layout === "stack" ? "flex flex-col items-center gap-2 text-center" : "flex items-center gap-4"}>
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
    const [charizard, modernCharizard, umbreonSir, charizard151, psyduck, charmander, bulbasaur, charmeleon, squirtle] =
      await Promise.all([
        getCard("en", "base1-4"),
        getCard("en", "sv03-125"),
        getCard("en", "sv08.5-161"),
        getCard("en", "sv03.5-006"),
        getCard("en", "base3-53"),
        getCard("en", "base1-46"),
        getCard("en", "base1-44"),
        getCard("en", "base1-24"),
        getCard("en", "base1-63"),
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
      POKEMON_PSYDUCK_IMAGE: psyduck?.image ? (
        <div className="my-6 rounded-sm border border-border bg-surface/60 p-5">
          <CardImage
            image={psyduck.image}
            alt="1st Edition Fossil Psyduck"
            widthClass="w-28 sm:w-36"
            caption={
              <>
                <p className="font-display text-sm font-semibold text-foreground">
                  1st Edition Fossil Psyduck (#53/62)
                </p>
                <p className="mt-1">My own favorite card growing up, and not one this piece has a strong view on.</p>
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
                  <p className="mt-1">The card that fell from $126 to $79 in the same window.</p>
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
                  <p className="mt-1">The card that fell from $1,600 to $832 in a matter of weeks.</p>
                </>
              }
            />
          </div>
        ) : null,
      POKEMON_151_CHARIZARD_IMAGE: charizard151?.image ? (
        <div className="my-6 rounded-sm border border-border bg-surface/60 p-5">
          <CardImage
            image={charizard151.image}
            alt="Charizard ex, 151"
            widthClass="w-28 sm:w-36"
            caption={
              <>
                <p className="font-display text-sm font-semibold text-foreground">
                  Charizard ex (151, 2023)
                </p>
                <p className="mt-1">
                  The other Charizard in the gem-rate comparison below: almost the same submission count
                  as the 1999 card above, a gem-mint rate more than two hundred times higher.
                </p>
              </>
            }
          />
        </div>
      ) : null,
      POKEMON_BASE_SET_POP_IMAGES:
        charmander?.image && bulbasaur?.image && charmeleon?.image && squirtle?.image ? (
          <div className="my-6 grid grid-cols-2 gap-4 rounded-sm border border-border bg-surface/60 p-5 sm:grid-cols-4">
            <CardImage
              image={charmander.image}
              alt="1st Edition Base Set Charmander"
              widthClass="w-full"
              layout="stack"
              caption={<p className="font-display text-xs font-semibold text-foreground">Charmander</p>}
            />
            <CardImage
              image={bulbasaur.image}
              alt="1st Edition Base Set Bulbasaur"
              widthClass="w-full"
              layout="stack"
              caption={<p className="font-display text-xs font-semibold text-foreground">Bulbasaur</p>}
            />
            <CardImage
              image={charmeleon.image}
              alt="1st Edition Base Set Charmeleon"
              widthClass="w-full"
              layout="stack"
              caption={<p className="font-display text-xs font-semibold text-foreground">Charmeleon</p>}
            />
            <CardImage
              image={squirtle.image}
              alt="1st Edition Base Set Squirtle"
              widthClass="w-full"
              layout="stack"
              caption={<p className="font-display text-xs font-semibold text-foreground">Squirtle</p>}
            />
          </div>
        ) : null,
      POKEMON_PRODUCTION_CHART: <MarketChart data={PRODUCTION_MILESTONES} />,
      POKEMON_CHARIZARD_CHART: <CharizardChart data={CHARIZARD_PRICE_HISTORY} />,
      POKEMON_THIRTYDOLLAR_CHART: <ThirtyDollarChart data={THIRTY_DOLLAR_COMPARISON} />,
      POKEMON_PSA_POPULATION_CHART: <PsaPopulationChart data={PSA_POPULATION_GROWTH} />,
      POKEMON_GEM_RATE_CHART: <GemRateChart data={GEM_RATE_COMPARISON} />,
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
