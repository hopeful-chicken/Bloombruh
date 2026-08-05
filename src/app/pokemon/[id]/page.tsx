import { notFound } from "next/navigation";
import { getCard, SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/pokemonCards";
import Stat from "@/components/Stat";
import { formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";

function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((l) => l.code === value);
}

function money(value: number | null | undefined, currency: string): string {
  if (value == null) return "Unavailable";
  if (currency === "USD") return formatUSD(value);
  return `€${value.toFixed(2)}`;
}

export default async function PokemonCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const rawLang = typeof query.lang === "string" ? query.lang : "en";
  const language: LanguageCode = isLanguageCode(rawLang) ? rawLang : "en";

  const card = await getCard(language, id);
  if (!card) notFound();

  const tcg = card.pricing?.tcgplayer;
  const cm = card.pricing?.cardmarket;
  const tcgVariant = tcg?.normal ?? tcg?.holofoil ?? tcg?.reverseHolofoil ?? null;

  return (
    <div>
      <a href="/pokemon" className="text-xs text-muted hover:text-accent">
        ← Back to the market overview
      </a>

      <div className="mt-4 grid gap-6 sm:grid-cols-[220px_1fr]">
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${card.image}/high.png`} alt={card.name} className="w-full rounded-lg border border-border" />
        ) : (
          <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-border bg-surface text-xs text-muted">
            No image
          </div>
        )}

        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">{card.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {card.set?.name ?? "Unknown set"} {card.hp ? `· HP ${card.hp}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {card.rarity && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground">
                {card.rarity}
              </span>
            )}
            {card.types.map((t) => (
              <span
                key={t}
                className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs text-accent"
              >
                {t}
              </span>
            ))}
          </div>
          {card.illustrator && (
            <p className="mt-2 text-xs text-muted">Illustrated by {card.illustrator}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="TCGPlayer low"
              value={tcgVariant ? money(tcgVariant.lowPrice, tcg?.unit ?? "USD") : "Unavailable"}
            />
            <Stat
              label="TCGPlayer market"
              value={tcgVariant ? money(tcgVariant.marketPrice, tcg?.unit ?? "USD") : "Unavailable"}
            />
            <Stat
              label="TCGPlayer high"
              value={tcgVariant ? money(tcgVariant.highPrice, tcg?.unit ?? "USD") : "Unavailable"}
            />
            <Stat
              label="Cardmarket avg"
              value={cm ? money(cm.avg, cm.unit) : "Unavailable"}
            />
          </div>

          {cm && (cm.avg1 != null || cm.avg7 != null || cm.avg30 != null) && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
                Cardmarket short-term trend (real, not a fabricated history)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="1-day avg" value={cm.avg1 != null ? money(cm.avg1, cm.unit) : "Unavailable"} />
                <Stat label="7-day avg" value={cm.avg7 != null ? money(cm.avg7, cm.unit) : "Unavailable"} />
                <Stat label="30-day avg" value={cm.avg30 != null ? money(cm.avg30, cm.unit) : "Unavailable"} />
              </div>
            </div>
          )}

          <p className="mt-4 text-[11px] text-muted/70">
            No free source publishes multi-year daily price history for Pokemon cards — these are
            the real current stats and short-term trend TCGdex provides. Prices last updated{" "}
            {tcg?.updated ? new Date(tcg.updated).toLocaleString() : "recently"}.
          </p>
        </div>
      </div>
    </div>
  );
}
