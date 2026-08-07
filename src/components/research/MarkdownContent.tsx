// Renders a PromptAnswerEntry's markdown body with the site's own type
// styles (font-display for headings, accent color, terminal-dark surfaces)
// instead of react-markdown's unstyled defaults.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/slugify";

// Flattens react-markdown's children (usually a plain string, but can nest
// bold/italic nodes) into text, so headings with inline formatting still
// get a usable id for the section nav to link to.
function headingText(children: React.ReactNode): string {
  return Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : headingText((c as { props?: { children?: React.ReactNode } })?.props?.children))).join("")
    : typeof children === "string"
      ? children
      : "";
}

export default function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        // singleTilde: false — remark-gfm defaults to treating a single "~"
        // as a strikethrough delimiter, which silently ate real prose that
        // used "~" for "approximately" (e.g. "~$3.34bn" paired up with a
        // later "~$904m" and everything between vanished into a <del>).
        // Real GFM strikethrough needs "~~" now; a lone "~" always renders
        // as a literal character.
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={{
          h1: () => null, // the entry's own title is rendered by the page, not repeated here
          h2: ({ children }) => (
            <h2
              id={slugify(headingText(children))}
              className="font-display mt-8 scroll-mt-32 text-lg font-semibold text-foreground first:mt-0 lg:scroll-mt-24"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="leading-relaxed text-foreground/90">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 text-accent hover:text-accent/80"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="text-foreground/90">{children}</li>,
          hr: () => <hr className="my-8 border-border" />,
          code: ({ children }) => (
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs text-accent">{children}</code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="border-b border-border">{children}</thead>,
          th: ({ children }) => (
            <th className="whitespace-nowrap px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
              {children}
            </th>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border/60 last:border-0">{children}</tr>,
          td: ({ children }) => <td className="px-3 py-2 align-top text-foreground/90">{children}</td>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
