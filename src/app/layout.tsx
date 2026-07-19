import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const title = "Graduate Analyst Terminal";
const description =
  "A free, web-based terminal for students — starting with the SWF Explorer, an interactive look at NBIM's published portfolio holdings.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · Graduate Analyst Terminal",
  },
  description,
  keywords: [
    "NBIM",
    "Norges Bank Investment Management",
    "sovereign wealth fund",
    "Government Pension Fund Global",
    "portfolio holdings",
    "equity ownership",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TerminalNav />
        <main className="flex-1">{children}</main>
        <TerminalFooter />
      </body>
    </html>
  );
}
