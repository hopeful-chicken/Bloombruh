// Static config for the module cards shown on the landing page and in nav.
// Adding a new module later = add a folder under src/app/ + an entry here.

export type ModuleInfo = {
  name: string;
  slug: string; // route, e.g. "/swf"
  status: "live" | "soon";
  tagline: string;
  description: string;
};

export const modules: ModuleInfo[] = [
  {
    name: "SWF Explorer",
    slug: "/swf",
    status: "live",
    tagline: "NBIM's global portfolio, holding by holding",
    description:
      "Search NBIM's (Norway's sovereign wealth fund) published equity holdings, see stakes by company, country, and sector, and explore what the world's largest single equity owner actually holds.",
  },
  {
    name: "Company Profile",
    slug: "/profile",
    status: "soon",
    tagline: "Ticker in, one-page profile out",
    description:
      "A clean one-page company snapshot: price chart, basic multiples, and a plain-English description.",
  },
  {
    name: "Central Bank Room",
    slug: "/macro",
    status: "soon",
    tagline: "BoE / Fed / ECB, tracked over time",
    description:
      "An archive of central bank statements with simple hawkish/dovish scoring and a rate-decision timeline.",
  },
  {
    name: "Hype vs Fundamentals",
    slug: "/hype",
    status: "soon",
    tagline: "Narrative vs numbers",
    description:
      "Mention velocity and sentiment plotted against earnings revisions and valuation — flagging where hype and fundamentals diverge.",
  },
  {
    name: "Analyst's Portfolio",
    slug: "/portfolio",
    status: "soon",
    tagline: "A paper portfolio, published in the open",
    description:
      "The builder's own paper portfolio and published letters — a personal, transparent track record.",
  },
];
