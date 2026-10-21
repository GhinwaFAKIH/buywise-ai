import "./globals.css";
import { siteUrl } from "./site-url";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: {
    default: "BuyWise AI | Is That Skincare Product Worth Buying?",
    template: "%s | BuyWise AI",
  },
  description: "Compare skincare ingredients, product claims and price per ml before you buy. Explore practical beauty guides and try a free BuyWise AI product analysis.",
  applicationName: "BuyWise AI",
  keywords: ["skincare product comparison", "skincare ingredient checker", "beauty product value", "price per ml skincare", "BuyWise AI"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "BuyWise AI",
    title: "BuyWise AI | Compare Skincare Before You Buy",
    description: "Explore skincare ingredients, compare prices and understand product trade-offs with BuyWise AI.",
  },
  twitter: {
    card: "summary",
    title: "BuyWise AI | Smarter Skincare Decisions",
    description: "Compare ingredients, claims and prices before buying skincare.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<Script src="https://plausible.io/js/pa-ZHzIkDdDGIs2X6vtpTUuF.js" strategy="afterInteractive" /><Script id="plausible-init" strategy="afterInteractive">{`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}</Script></body>
    </html>
  );
}
