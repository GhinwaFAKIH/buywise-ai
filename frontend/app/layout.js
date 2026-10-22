import "./globals.css";
import { siteUrl } from "./site-url";
import Script from "next/script";
import { organization, website, serializeJsonLd } from "./lib/semantic";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: {
    default: "Skincare Ingredient & Price Comparison | BuyWise AI",
    template: "%s | BuyWise AI",
  },
  description: "Compare skincare products side by side, check ingredients and calculate price per ml. Explore free skincare comparison tools and ingredient guides on BuyWise AI.",
  applicationName: "BuyWise AI",
  keywords: ["skincare product comparison", "skincare ingredient checker", "beauty product value", "price per ml skincare", "BuyWise AI"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "BuyWise AI",
    title: "Skincare Ingredient & Price Comparison | BuyWise AI",
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
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd({"@context":"https://schema.org","@graph":[organization,website]})}}/>{children}<Script src="https://plausible.io/js/pa-ZHzIkDdDGIs2X6vtpTUuF.js" strategy="afterInteractive" /><Script id="plausible-init" strategy="afterInteractive">{`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}</Script></body>
    </html>
  );
}
