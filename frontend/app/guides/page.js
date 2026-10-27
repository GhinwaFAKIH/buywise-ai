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
    <header className="guidesHero"><span>THE GHINÉVA EDIT</span><h1>Skincare Ingredient Guides & Beauty Comparisons</h1><p>Understand ingredient claims, compare skincare costs and decide what fits your routine. Independent educational guides—not hands-on product tests.</p><Link href="/#analyze">Try GHINÉVA ↗</Link></header>
    <section aria-label="Start with popular skincare guides" style={{maxWidth:1100,margin:"24px auto",padding:"0 20px"}}><h2>Start with these free guides</h2><p>New to skincare comparisons? These practical articles explain what to check before buying.</p><ul style={{lineHeight:2}}><li><Link href="/guides/niacinamide-vs-vitamin-c">Niacinamide vs vitamin C: compare benefits and routine fit</Link></li><li><Link href="/guides/is-hyaluronic-acid-serum-worth-it">Is hyaluronic acid serum worth buying if you already use moisturizer?</Link></li><li><Link href="/guides/how-to-compare-skincare-prices">How to compare skincare prices fairly per 10 ml</Link></li></ul><p><Link href="/calculator">Try the free price-per-ml calculator →</Link></p></section>
    <GuideBrowser guides={guides}/>
    <p className="guideDisclaimer">These guides offer general information, not medical advice. Product claims and formulations may change. Some articles contain labeled affiliate links.</p>
  </main>;
}
