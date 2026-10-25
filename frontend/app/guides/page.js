import Link from "next/link";
import { guides } from "./guides";
import GuideBrowser from "./GuideBrowser";

export const metadata = {
  title: "Beauty Guides",
  description: "Evidence-aware skincare, haircare and ingredient guides to help you compare beauty products before buying.",
  alternates: { canonical: "/guides" },
  openGraph: { title: "Beauty Guides | GHINÉVA", description: "Practical skincare and ingredient comparisons before buying." }
};

export default function GuidesPage() {
  return <main className="guidesPage">
    <nav className="guidesNav"><Link href="/">❧ GHINÉVA</Link><Link href="/compare-skincare-products">Compare Products</Link><Link href="/shop">Shop & Compare</Link><Link href="/about">About</Link><Link href="/methodology">Our method</Link><Link href="/#pricing">Plans</Link></nav>
    <header className="guidesHero"><span>THE GHINÉVA EDIT</span><h1>Beauty Guides</h1><p>Learn what ingredients do, compare fairly and shop with more confidence.</p><Link href="/#analyze">Try GHINÉVA ↗</Link></header>
    <GuideBrowser guides={guides}/>
    <p className="guideDisclaimer">These guides offer general information, not medical advice. Product claims and formulations may change. Some articles contain labeled affiliate links.</p>
  </main>;
}
