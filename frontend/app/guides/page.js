import Link from "next/link";
import GuidesCollection from "./GuidesCollection";

export const metadata = {
  title: "Beauty Guides",
  description: "Explore practical skincare, ingredient, haircare and beauty shopping guides. Compare formulas, unit prices and buying trade-offs with BuyWise AI.",
  alternates: { canonical: "/guides" },
  openGraph: { title: "Beauty Guides | BuyWise AI", description: "Shop skincare with more confidence: guides to ingredients, value and practical comparisons." },
};

export default function GuidesPage() {
  return <main className="guidesPage">
    <nav className="guidesNav"><Link href="/">❧ BuyWise AI</Link><Link href="/#pricing">Plans</Link></nav>
    <header className="guidesHero"><span>THE BUYWISE EDIT</span><h1>Beauty Guides</h1><p>Learn what ingredients do, compare fairly and shop with more confidence.</p><Link href="/#analyze">Try BuyWise AI ↗</Link></header>
    <GuidesCollection />
    <p className="guideDisclaimer">These guides provide general educational information, not medical advice. Product formulations and prices can change. Some articles contain clearly disclosed affiliate links. Illustrations are editorial artwork, not product photographs.</p>
  </main>;
}
