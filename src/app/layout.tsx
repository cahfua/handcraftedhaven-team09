// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// NOTE (team): Fonts come from our Week 2 design doc:
// Headings = Playfair Display, Body = Inter/Lato style. Using Inter here for body.
const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Handcrafted Haven",
  description: "A marketplace for artisans to share their story and sell handcrafted goods.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {/* NOTE (team): Header is global so it doesn't end up inside the hero */}
        <SiteHeader />

        <main className="site-main">{children}</main>

        {/* NOTE (team): Footer is part of our landing-page structure doc */}
        <SiteFooter />
      </body>
    </html>
  );
}