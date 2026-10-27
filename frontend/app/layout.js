import "./globals.css";
import { siteUrl } from "./site-url";
import Script from "next/script";
import { organization, website, serializeJsonLd } from "./lib/semantic";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: {
    default: "Skincare Ingredient & Price Comparison | GHINÉVA",
    template: "%s | GHINÉVA",
  },
  description: "Compare skincare products side by side, check ingredients and calculate price per ml. Explore free skincare comparison tools and ingredient guides on GHINÉVA.",
  applicationName: "GHINÉVA",
  keywords: ["skincare product comparison", "skincare ingredient checker", "beauty product value", "price per ml skincare", "GHINÉVA"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "GHINÉVA",
    title: "Skincare Ingredient & Price Comparison | GHINÉVA",
    description: "Explore skincare ingredients, compare prices and understand product trade-offs with GHINÉVA.",
  },
  twitter: {
    card: "summary",
    title: "GHINÉVA | Smarter Skincare Decisions",
    description: "Compare ingredients, claims and prices before buying skincare.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd({"@context":"https://schema.org","@graph":[organization,website]})}}/>{children}<Script src="https://plausible.io/js/pa-L5113jqwrpvbePVhZrnIe.js" strategy="afterInteractive" /><Script id="ghineva-ai-referral" strategy="afterInteractive">{`(function(){try{var ref=document.referrer||"";var host=ref?new URL(ref).hostname.toLowerCase():"";var sources=[["ChatGPT",/(^|\\.)chatgpt\\.com$/],["Perplexity",/(^|\\.)perplexity\\.ai$/],["Claude",/(^|\\.)claude\\.ai$/],["Gemini",/(^|\\.)gemini\\.google\\.com$/],["Copilot",/(^|\\.)copilot\\.microsoft\\.com$/]];for(var i=0;i<sources.length;i++){if(sources[i][1].test(host)){window.plausible&&window.plausible("AI Referral",{props:{assistant:sources[i][0]}});break;}}}catch(e){}})();`}</Script><Script id="plausible-init" strategy="afterInteractive">{`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}</Script></body>
    </html>
  );
}
