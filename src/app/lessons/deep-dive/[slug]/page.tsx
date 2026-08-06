import Link from "next/link";
import { notFound } from "next/navigation";
import { DEEP_DIVES } from "@/data/deepDives";
import { COURSE_CHAPTERS } from "@/data/course";
import MarkdownContent from "@/components/research/MarkdownContent";
import QuizBlock from "@/components/lessons/QuizBlock";

export function generateStaticParams() {
  return DEEP_DIVES.map((d) => ({ slug: d.slug }));
}

export default async function DeepDivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deepDive = DEEP_DIVES.find((d) => d.slug === slug);
  if (!deepDive) notFound();

  const parentChapter = COURSE_CHAPTERS.find((c) => c.slug === deepDive.parentChapterSlug);

  return (
    <div>
      <Link
        href="/lessons"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← Finance 101
      </Link>

      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-module-analysis">
        Deep Dive
        {parentChapter && (
          <>
            {" "}
            · extends{" "}
            <Link href={`/lessons/${parentChapter.slug}`} className="underline decoration-dotted underline-offset-2 hover:text-accent">
              Ch. {parentChapter.number}: {parentChapter.title}
            </Link>
          </>
        )}
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {deepDive.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{deepDive.tagline}</p>

      <div className="mt-8 border-t border-border pt-6">
        <MarkdownContent markdown={deepDive.body} />
      </div>

      <QuizBlock quiz={deepDive.quiz} chapterSlug={`deep-dive-${deepDive.slug}`} />

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        {parentChapter ? (
          <Link href={`/lessons/${parentChapter.slug}`} className="text-muted hover:text-accent">
            ← Back to Ch. {parentChapter.number}: {parentChapter.title}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/lessons" className="text-right text-accent hover:text-accent-dim">
          All Deep Dives →
        </Link>
      </div>
    </div>
  );
}
