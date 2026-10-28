import Link from "next/link";
import IngredientInteractive from "./IngredientInteractive";

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
  return <main className="guidesPage"><nav className="guidesNav"><Link href="/">GHINÉVA</Link><Link href="/guides">Beauty guides</Link><Link href="/calculator">Price calculator</Link></nav>
    <article className="guideArticle"><small>INGREDIENT COMPARISON · GHINÉVA</small>
      <h1>Niacinamide vs Vitamin C: Which Serum Fits Your Routine?</h1>
      <p className="guideIntro">Both ingredients are popular in skincare, but they are not interchangeable. The better choice depends on what you want from your routine, the finished formulation, your skin's tolerance and your budget.</p>
      <IngredientInteractive />
      <section><h2>At a glance</h2><table><thead><tr><th>What to compare</th><th>Niacinamide</th><th>Vitamin C</th></tr></thead><tbody>{comparison.map(([label,a,b])=><tr key={label}><th scope="row">{label}</th><td>{a}</td><td>{b}</td></tr>)}</tbody></table></section>
      <section><h2>When might niacinamide make sense?</h2><p>Niacinamide is commonly used in formulas focused on skin-barrier support, uneven-looking tone and excess oil. Before buying a separate serum, check whether your existing moisturizer already contains it. A higher percentage is not automatically better.</p></section>
      <section><h2>When might vitamin C make sense?</h2><p>Vitamin C products are often chosen for antioxidant skincare and the appearance of dullness or uneven tone. “Vitamin C” can describe different ingredients, including L-ascorbic acid and derivatives. Packaging, storage instructions and the rest of the formula matter.</p></section>
      <section><h2>Can you use both?</h2><p>They are not inherently incompatible, but using multiple new active products at once can make irritation harder to identify. Follow each product's directions and introduce products gradually. If your skin is reactive, a simpler routine may be easier to manage.</p></section>
      <section><h2>Which serum offers better value?</h2><p>Compare prices on the same basis: price per 10 ml = (price ÷ bottle size in ml) × 10. For example, a hypothetical €12 / 30 ml serum costs €4 per 10 ml, while a hypothetical €18 / 50 ml serum costs €3.60 per 10 ml. These are illustrations, not current store prices. The cheaper product is not necessarily more effective.</p><p><Link href="/calculator">Calculate price per ml</Link> or read <Link href="/fr/guide-prix-skincare">our French skincare price guide</Link>.</p></section>
      <section><h2>Quick buying checklist</h2><ul><li>Choose a specific skincare goal before shopping.</li><li>Read the complete ingredient list, not only the front label.</li><li>Check formulation, packaging and storage guidance.</li><li>Introduce one new product at a time and monitor tolerance.</li><li>Compare unit prices, shipping and retailer information.</li></ul></section>
      <section><h2>Frequently asked questions</h2><h3>Is niacinamide better than vitamin C?</h3><p>Neither is universally better. They serve overlapping but different formulation goals, and outcomes depend on the product and your skin.</p><h3>Should I buy a 10% niacinamide serum?</h3><p>Not necessarily. Check whether you already use niacinamide and whether a separate step would add value.</p><h3>Does a more expensive vitamin C serum work better?</h3><p>Price alone cannot establish effectiveness. Assess the vitamin C form, complete formula, packaging and independent evidence.</p></section>
      <p>This is general educational information, not a diagnosis or a product-specific clinical assessment. Learn about <Link href="/methodology">GHINÉVA's methodology</Link> and explore <Link href="/guides/vitamin-c-serum-vs-niacinamide-serum">our related comparison guide</Link>.</p>
    </article>
  </main>;
}