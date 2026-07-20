"use client";

// Client-only wrapper around react-pdf's PDFDownloadLink. Split into its
// own file and loaded via next/dynamic with ssr:false from PitchWorkbench,
// since react-pdf touches browser-only APIs that don't exist during
// server-side rendering.

import { PDFDownloadLink } from "@react-pdf/renderer";
import PitchPdfDocument, { type PitchPdfProps } from "./PitchPdfDocument";

type Props = Omit<PitchPdfProps, "generatedAt">;

export default function PitchDownloadButton(props: Props) {
  const generatedAt = new Date().toISOString().slice(0, 10);

  return (
    <PDFDownloadLink
      document={<PitchPdfDocument {...props} generatedAt={generatedAt} />}
      fileName={`${props.symbol}-pitch.pdf`}
      className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent/90"
    >
      {({ loading }) => (loading ? "Preparing PDF…" : "Download PDF")}
    </PDFDownloadLink>
  );
}
