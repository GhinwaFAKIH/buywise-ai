import Link from "next/link";
import { guides } from "./guides";
import GuideBrowser from "./GuideBrowser";

export const metadata = {
  title: "Skincare Ingredient Guides & Product Comparisons",
  description: "Free skincare ingredient guides, niacinamide vs vitamin C comparisons, hyaluronic acid tips, and practical price-per-ml buying advice from GHINÉVA.",
  alternates: { canonical: "/guides" },
  openGraph: { title: "Beauty Guides | GHINÉVA", description: "Practical skincare and ingredient comparisons before buying." }
};

export default function GuidesPage() {
  return <main className="guidesPage">
    <nav className="guidesNav"><Link href="/">❧ GHINÉVA</Link><Link href="/compare-skincare-products">Compare Products</Link><Link href="/shop">Shop & Compare</Link><Link href="/about">About</Link><Link href="/methodology">Our method</Link><Link href="/#pricing">Plans</Link></nav>
    <header className="guidesHero"><span>THE GHINÉVA EDIT</span><h1>Skincare Ingredient Guides & Beauty Comparisons</h1><p>Less guessing. More confident skincare choices.</p><Link href="/#analyze">Try GHINÉVA ↗</Link></header>
    <div className="ghQuickPicks" aria-label="Popular reads"><Link href="/niacinamide-vs-vitamin-c">✨ Niacinamide vs vitamin C</Link><Link href="/guides/is-hyaluronic-acid-serum-worth-it">💧 Hyaluronic acid</Link><Link href="/guides/how-to-compare-skincare-prices">💶 Price comparisons</Link><Link href="/calculator">⚖ Price calculator</Link></div>
    <GuideBrowser guides={guides}/>
    <p className="guideDisclaimer">These guides offer general information, not medical advice. Product claims and formulations may change. Some articles contain labeled affiliate links.</p>
  </main>;
}
