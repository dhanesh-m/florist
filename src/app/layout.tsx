import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  title: {
    default: "floral_doctor | Doctor Florist. Canada | Fresh Handmade Bouquets",
    template: "%s | floral_doctor",
  },
  description:
    "Doctor Florist. Canada. Fresh, handmade flower bouquets for every occasion. Browse our collection and enquire via WhatsApp.",
  keywords: ["florist", "flowers", "bouquets", "Canada", "doctor florist", "wedding"],
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
        <Navbar />
        <main className="min-h-screen pt-[72px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
