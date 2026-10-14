import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://greenhavenresidence.com"),
  title: "Green Haven Residence | Biophilic Luxury Sanctuary",
  description:
    "Ultra-luxury biophilic residential tower featuring private sky gardens, net-zero carbon architecture, panoramic bay vistas, and bespoke concierge living.",
  keywords: [
    "Green Haven Residence",
    "Luxury Apartments",
    "Biophilic Architecture",
    "Eco Luxury Penthouse",
    "Sky Villa",
    "Sustainable Real Estate",
  ],
  authors: [{ name: "Green Haven Developments" }],
  openGraph: {
    title: "Green Haven Residence | Biophilic Luxury Sanctuary",
    description:
      "Where architectural mastery meets living sanctuary. Explore exclusive sky villas and botanical penthouses.",
    images: ["/images/hero-residence.jpg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
