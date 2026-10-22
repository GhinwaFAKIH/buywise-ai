import Link from "next/link";
import { id, serializeJsonLd, breadcrumbs } from "../../lib/semantic";

export const metadata = {
  title: "How to Compare Skincare Prices per ml and per 10 ml",
  description: "Learn to compare skincare prices fairly with a worked serum example, delivery costs, unit conversions, and a free price-per-ml calculator.",
  alternates: { canonical: "/calculator/how-to-compare-skincare-prices" },
};

export default function UnitPriceGuide() {
  const faq = [
    { question: "How do I calculate price per 10 ml?", answer: "Divide the total price by the volume in ml, then multiply by 10. For example, a 30 ml serum costing €9 is €3 per 10 ml." },
    { question: "Is a lower price per ml always better?", answer: "No. Unit price compares cost, not effectiveness, ingredients, suitability, or formula quality. Compare products with similar purposes and units." },
    { question: "Should I include shipping?", answer: "Yes, when comparing the amount you would actually pay. Include delivery charges and applicable discounts consistently." },
    { question: "Can I compare grams and millilitres directly?", answer: "Not reliably. Grams measure mass and millilitres measure volume; converting between them requires knowing the product density." },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": id("/calculator/how-to-compare-skincare-prices#article"), headline: "How to Compare Skincare Prices per ml and per 10 ml", description: "A practical guide to unit price comparisons for skincare products.", mainEntityOfPage: id("/calculator/how-to-compare-skincare-prices"), author: { "@id": id("/#organization") }, publisher: { "@id": id("/#organization") } },
      breadcrumbs([{ name: "Home", path: "/" }, { name: "Calculator", path: "/calculator" }, { name: "How to compare skincare prices", path: "/calculator/how-to-compare-skincare-prices" }]),
    ],
  };
  return <main className="guidesPage">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
    <nav className="guidesNav"><Link href="/">❧ BuyWise AI</Link><Link href="/calculator">Free calculator</Link><Link href="/guides">Beauty Guides</Link></nav>
    <header className="guidesHero"><span>SKINCARE PRICE GUIDE</span><h1>How to compare skincare prices fairly</h1><p>Learn what price per ml really means, then use the free calculator to compare products before checkout.</p><Link href="/calculator">Open the free calculator ↗</Link></header>
    <article className="guideArticle">
      <section><h2>What is price per ml?</h2><p>Price per millilitre is the total amount paid divided by the volume in millilitres. It makes it easier to compare different bottle sizes. Price per 10 ml uses the same calculation multiplied by ten.</p><p><strong>Formula:</strong> Price per 10 ml = (total price ÷ volume in ml) × 10.</p></section>
      <section><h2>Worked example: two serums</h2><p>Imagine Serum A costs €9 for 30 ml, while Serum B costs €14 for 50 ml, with no shipping costs. Serum A costs €0.30 per ml (€3.00 per 10 ml). Serum B costs €0.28 per ml (€2.80 per 10 ml). Serum B has the lower unit price, but that alone does not make it the better serum.</p></section>
      <section><h2>Use the final delivered price</h2><p>If a retailer charges delivery, include that cost when comparing what you would pay. For example, adding €4 shipping to Serum B makes its total €18, or €3.60 per 10 ml. Discounts should also be applied consistently.</p></section>
      <section><h2>Compare similar products</h2><p>Use unit price as one factor alongside the intended use, ingredient list, concentration when reliably stated, formulation, packaging and personal preferences. Do not compare grams with millilitres without a valid density conversion.</p></section>
      <section><h2>What the calculator can and cannot tell you</h2><p>The <Link href="/calculator">BuyWise price calculator</Link> computes unit prices from the numbers you enter. It does not check live retailer prices, verify product authenticity, or establish clinical effectiveness. Confirm current prices and labels with the seller or manufacturer.</p></section>
      <section><h2>Frequently asked questions</h2>{faq.map(item=><div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section>
      <aside className="guideCta"><h2>Ready to compare two products?</h2><p>Enter the price and size of each product to see their cost per ml and per 10 ml.</p><Link href="/calculator">Use the free skincare calculator ↗</Link></aside>
      <p>For additional context, see <Link href="/methodology">our comparison methodology</Link> and <Link href="/about">about BuyWise AI</Link>.</p>
    </article>
  </main>;
}
