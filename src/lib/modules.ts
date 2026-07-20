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
    name: "Company Profile",
    slug: "/profile",
    status: "live",
    tagline: "Ticker in, one-page profile out",
    description:
      "A clean one-page company snapshot: price chart, basic multiples, and a plain-English description — plus context on whether those multiples look cheap or expensive.",
  },
  {
    name: "Pitch Builder",
    slug: "/pitch",
    status: "live",
    tagline: "Research a company, write your own pitch",
    description:
      "Pull real price and (for US companies) financial data, then write your own rating, target price, thesis, catalysts, and risks — and download it as a PDF pitch.",
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
];
