import Link from "next/link";
import IngredientInteractive from "./IngredientInteractive";
import { siteUrl } from "../site-url";
import { serializeJsonLd, breadcrumbs, term } from "../lib/semantic";

export const metadata = {
  title: "Niacinamide vs Vitamin C: Differences, Uses & Serum Buying Guide",
  description: "Niacinamide vs vitamin C for your skincare routine: compare goals, formula types, tolerability, packaging and serum prices with a practical checklist.",
  alternates: { canonical: "/niacinamide-vs-vitamin-c" },
  openGraph: { title: "Niacinamide vs Vitamin C | GHINÉVA", description: "An ingredient-first skincare comparison with a practical serum buying checklist.", type: "article" }
};

const comparison = [
  ["Typical role", "Supports the skin barrier and can help with the appearance of uneven tone and excess oil", "Antioxidant; some formulations target the appearance of dullness and uneven tone"],
  ["Check the label", "Niacinamide concentration and the rest of the formula", "Exact vitamin C form, concentration, packaging and storage instructions"],
  ["Tolerance", "Often well tolerated, but any finished product may irritate", "Some formulations, particularly low-pH L-ascorbic acid, may sting sensitive skin"],
  ["Value", "Compare the full formula and price per 10 ml", "Consider packaging, stability and price per 10 ml"]
];

export default function Page() {
  const pageUrl = siteUrl + "/niacinamide-vs-vitamin-c";
  const graph = {"@context":"https://schema.org","@graph":[
    {"@type":"Article","@id":pageUrl+"#article",headline:"Niacinamide vs Vitamin C: Which Serum Fits Your Routine?",description:"Compare niacinamide and vitamin C formulations, tolerability, and price per 10 ml.",mainEntityOfPage:pageUrl,inLanguage:"en",isAccessibleForFree:true,author:{"@id":siteUrl+"/#organization"},publisher:{"@id":siteUrl+"/#organization"},about:[{"@id":term("niacinamide")["@id"]},{"@id":term("vitaminC")["@id"]}]},
    breadcrumbs([{name:"Home",path:"/"},{name:"Guides",path:"/guides"},{name:"Niacinamide vs Vitamin C",path:"/niacinamide-vs-vitamin-c"}])
  ]};
  return <main className="guidesPage"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(graph)}}/><nav className="guidesNav"><Link href="/">GHINÉVA</Link><Link href="/guides">Beauty guides</Link><Link href="/calculator">Price calculator</Link></nav>
    <article className="guideArticle"><small>INGREDIENT COMPARISON · GHINÉVA</small>
      <h1>Niacinamide vs Vitamin C: Which Serum Fits Your Routine?</h1>
      <p className="guideIntro">Compare the benefits, explore your routine and check the price in seconds.</p>
      <IngredientInteractive />
      <section aria-labelledby="ingredient-differences"><h2 id="ingredient-differences">Niacinamide vs vitamin C at a glance</h2>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
          <thead><tr><th scope="col">Compare</th><th scope="col">Niacinamide</th><th scope="col">Vitamin C</th></tr></thead>
          <tbody>{comparison.map(([topic,niacinamide,vitaminC])=><tr key={topic}><th scope="row">{topic}</th><td>{niacinamide}</td><td>{vitaminC}</td></tr>)}</tbody>
        </table></div>
        <p>Choose by your skincare goal, then check the complete formula, packaging and price. An ingredient name alone cannot predict how a finished serum will perform.</p>
        <p>Compare costs with our <Link href="/calculator">price-per-ml calculator</Link> or read <Link href="/guides/how-to-compare-skincare-prices">our price comparison guide</Link>. For hydration, see <Link href="/guides/is-hyaluronic-acid-serum-worth-it">the hyaluronic acid guide</Link>.</p>
      </section>
      <section><h2>Quick answers</h2><details><summary>Can I use both?</summary><p>Often yes, but introduce new products gradually and follow their directions.</p></details><details><summary>Which is better for me?</summary><p>Choose based on your skincare goal, tolerance and the full formula.</p></details><details><summary>Is expensive always better?</summary><p>No. Compare formulas and price per 10 ml.</p></details></section><p><Link href="/guides">More beauty guides →</Link> · <Link href="/methodology">Our method</Link></p>
    </article>
  </main>;
}