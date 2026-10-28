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
      <p className="guideIntro">Compare the benefits, explore your routine and check the price in seconds.</p>
      <IngredientInteractive />
      <section><h2>Quick answers</h2><details><summary>Can I use both?</summary><p>Often yes, but introduce new products gradually and follow their directions.</p></details><details><summary>Which is better for me?</summary><p>Choose based on your skincare goal, tolerance and the full formula.</p></details><details><summary>Is expensive always better?</summary><p>No. Compare formulas and price per 10 ml.</p></details></section><p><Link href="/guides">More beauty guides →</Link> · <Link href="/methodology">Our method</Link></p>
    </article>
  </main>;
}