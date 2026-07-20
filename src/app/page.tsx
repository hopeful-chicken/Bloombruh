import Link from "next/link";
import { modules } from "@/lib/modules";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Free · Web-based · Built for students
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Bloombruh
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          A Bloomberg-lite for students who can&apos;t afford a Bloomberg
          terminal. Look up any public company, see its price, key
          multiples, and a plain-English snapshot — free, in seconds.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Open Company Profile →
          </Link>
        </div>
      </section>

      {/* Module cards */}
      <section className="mt-16">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Modules
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const card = (
              <div
                className={[
                  "flex h-full flex-col rounded-lg border p-5 transition-colors",
                  m.status === "live"
                    ? "border-border bg-surface hover:border-accent/60"
                    : "border-border/60 bg-surface/40",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{m.name}</h3>
                  <span
                    className={[
                      "shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      m.status === "live"
                        ? "bg-positive/15 text-positive"
                        : "bg-muted/15 text-muted",
                    ].join(" ")}
                  >
                    {m.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-accent/90">
                  {m.tagline}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {m.description}
                </p>
              </div>
            );

            return m.status === "live" ? (
              <Link key={m.slug} href={m.slug} className="block h-full">
                {card}
              </Link>
            ) : (
              <div key={m.slug} className="h-full cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="mt-16 max-w-3xl border-t border-border pt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          About this project
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Built by Adam, a UCL Economics student, as a long-term project to
          learn by building and to demonstrate genuine interest in markets
          and asset management. It&apos;s free, independent, and
          unaffiliated with any company, exchange, or institution mentioned
          on this site.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Links:{" "}
          <a
            href="#"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            LinkedIn
          </a>{" "}
          ·{" "}
          <a
            href="#"
            className="underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            GitHub
          </a>
          {/* EDITORIAL: Adam to add real links and, if he wants, a short personal note here */}
        </p>
      </section>
    </div>
  );
}
