import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Caveat } from "next/font/google";
import "./globals.css";
import TerminalNav from "@/components/TerminalNav";
import TerminalFooter from "@/components/TerminalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fraunces is a characterful serif with a "soft" optical-size axis, used
// for page/company titles (see the `font-display` utility in globals.css)
// and, in its italic cut, for the logo/wordmark (see `font-logo`).
// Everything else stays on Geist Sans/Mono — this is the one deliberate
// flourish that makes headings and the brand feel designed and a little
// elegant, without touching the mono numbers.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

// A handwriting-style face used sparingly for small "margin note"
// annotations (see `font-hand` in globals.css) — a real, human, sketched-
// in-the-margin touch instead of another line of marketing copy. Never
// used for real content, only for a handful of asides.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const title = "Bloombruh";
const description =
  "A free, web-based Bloomberg-lite for students — look up any public company's price, chart, and fundamentals, or build your own investment pitch report and export it as a PDF.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · Bloombruh",
  },
  description,
  keywords: [
    "company profile",
    "stock research",
    "equity research",
    "investment pitch",
    "financial fundamentals",
    "student finance tool",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: title,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Applies the saved theme (light/dark) before the page paints, so
          there's no flash of the wrong theme on reload. Light is the
          default look; dark is opt-in via the toggle and persists to
          localStorage. Kept as a tiny inline script rather than a library
          (e.g. next-themes) since this project avoids new dependencies when
          a few lines of plain JS do the job — see docs/DECISIONS.md.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TerminalNav />
        <main className="flex-1">{children}</main>
        <TerminalFooter />
      </body>
    </html>
  );
}
