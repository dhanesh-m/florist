import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: {
    default: "Floral Doctor | Floral Doctor. Canada | Fresh Handmade Bouquets",
    template: "%s | Floral Doctor",
  },
  description:
    "Floral Doctor. Canada. Fresh, handmade flower bouquets for every occasion. Browse our collection and enquire via WhatsApp.",
  keywords: ["florist", "flowers", "bouquets", "Canada", "floral doctor", "wedding"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${sourceSans.variable} ${cormorant.variable} font-sans antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
