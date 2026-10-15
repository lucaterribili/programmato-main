import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Programmato",
  description: "La rete editoriale Programmato: OstiaRoma, PoRusski, CityRome, MondoSapere e LucaTerribili.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
