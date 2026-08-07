import { slugify } from "./slugify";

export type Section = { id: string; title: string };

// Pulls the top-level (##) headings out of an entry's raw markdown body to
// build a section nav, without needing to render the markdown first. Only
// ## is used (not ###) so the nav stays short enough to fit as tabs on
// mobile or a sidebar on desktop.
export function extractSections(markdown: string): Section[] {
  const matches = markdown.matchAll(/^##\s+(.+)$/gm);
  return [...matches].map((m) => {
    const title = m[1].trim();
    return { id: slugify(title), title };
  });
}
