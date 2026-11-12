import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Programmato — AI, agenti e sistemi autonomi",
    template: "%s — Programmato",
  },
  description:
    "Architetture, tool use, evals e casi reali su AI e agenti. La reference italiana per chi costruisce sistemi autonomi in produzione.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://programmato.it"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Programmato",
    title: "Programmato — AI, agenti e sistemi autonomi",
    description:
      "Dal prototipo alla produzione: trace, evals, costi e failure mode dei sistemi autonomi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Programmato",
    description:
      "Dal prototipo alla produzione: trace, evals, costi e failure mode dei sistemi autonomi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only absolute left-4 top-4 z-[100] rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
        >
          Salta al contenuto
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
