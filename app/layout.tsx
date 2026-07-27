import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Providers } from "./providers";

config.autoAddCss = false;

/**
 * The Coinbase font suite (Display / Sans / Text) is licence-restricted, so
 * these are the substitutes the style reference names.
 *
 * Manrope stands in for CoinbaseDisplay - weight 400 only, used exclusively
 * for large headlines where its slightly wide geometry reads as declarative.
 * Inter covers CoinbaseSans and CoinbaseText: UI, buttons and body copy.
 */
const displayFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-display",
});

const bodySans = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-body-sans",
});

export const metadata: Metadata = {
  title: "Henry Melo — Portfolio",
  description: "Henry Melo's portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodySans.variable}`}>
      <body className={bodySans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
