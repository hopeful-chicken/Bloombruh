import WalkingPokemon from "@/components/pokemon/WalkingPokemon";

export default function PokemonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <WalkingPokemon />
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Production and price-history figures are real, sourced, and dated inline. Live card
        pricing is from{" "}
        <a
          href="https://tcgdex.dev"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          TCGdex
        </a>{" "}
        (a free, community-run API pulling real TCGPlayer and Cardmarket marketplace prices).
        Not investment advice — a market analysis, not a recommendation to buy, sell, or collect
        anything.
      </div>
      {children}
    </div>
  );
}
