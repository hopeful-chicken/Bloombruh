// Renders a PromptAnswerEntry's markdown body with the site's own type
// styles (font-display for headings, accent color, terminal-dark surfaces)
// instead of react-markdown's unstyled defaults.

import ReactMarkdown from "react-markdown";
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
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
