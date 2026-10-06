"use client";

import { useState } from "react";

const API_URL = "/api";

const initialForm = { name: "", brand: "", price_eur: "", size_ml: "", ingredients: "", claims: "", rating: "", review_count: "" };

function verdictClass(verdict) {
  if (verdict === "WORTH IT") return "verdict good";
  if (verdict === "INSUFFICIENT INFORMATION") return "verdict maybe";
  if (verdict === "MAYBE") return "verdict maybe";
  return "verdict bad";
}


function buyingAssessment(result) {
  const names = (result.ingredient_roles || []).map(item => item.ingredient.toLowerCase().trim());
  const hasNiacinamide = names.includes("niacinamide");
  const alternatives = (result.alternatives || []).filter(item => item.price_difference_percent != null);
  const cheapest = alternatives.length > 0 && alternatives.every(item => item.price_difference_percent > 0);
  const cheaper = alternatives.filter(item => item.price_difference_percent < 0);
  const equal = alternatives.some(item => item.price_difference_percent === 0);
  const formula = hasNiacinamide
    ? "Worth considering if you are looking for a niacinamide serum: the entered formula includes niacinamide, commonly used in products targeting excess oil."
    : names.length
      ? "Some ingredient roles are identified, but there is not enough supported information to judge whether this formula meets your goal."
      : "We cannot evaluate this formula yet because its ingredients are not covered by the current database.";
  const price = cheapest
    ? "Price advantage: your entered price is lower per ml than every listed comparison. Switching to these alternatives would cost more."
    : cheaper.length
      ? `Price check: ${cheaper.map(item => item.brand + " " + item.name).join(", ")} costs less per ml. Compare the full formulas before switching.`
      : equal
        ? "Price check: at least one listed comparison costs the same per ml, so price alone does not distinguish them."
        : "Price check: no priced comparison is available, so we cannot tell whether this is competitive.";
  return { title: hasNiacinamide && cheapest ? "Worth considering — price advantage" : cheaper.length ? "Compare before buying" : "Formula assessment", formula, price };
}

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toPayload(source) {
    return {
      name: source.name,
      brand: source.brand,
      price_eur: Number(source.price_eur),
      size_ml: Number(source.size_ml),
      ingredients: source.ingredients
        .split(/[,;\n]+|\.(?=\s|$)/)
        .map((item) => item.trim())
        .filter(Boolean),
      claims: source.claims
        .split(/[,;\n]+|\.(?=\s|$)/)
        .map((item) => item.trim())
        .filter(Boolean),
      rating: source.rating === "" ? null : Number(source.rating),
      review_count: source.review_count === "" ? null : Number(source.review_count),
    };
  }

  async function runAnalysis(payload) {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not analyze this product.");
      }

      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  async function joinWaitlist(event) {
    event.preventDefault();
    setWaitlistLoading(true);
    setWaitlistMessage("");

    try {
      const response = await fetch(`${API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Could not join the waitlist.");

      setWaitlistMessage(data.message || "You're on the list.");
      setWaitlistEmail("");
    } catch (err) {
      setWaitlistMessage("Could not save your email right now. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  }

  async function analyze(event) {
    event.preventDefault();
    setError("");

    try {
      await runAnalysis(toPayload(form));
    } catch (err) {
      setError(
        "The analysis service could not be reached. Please review the product details and try again."
      );
    }
  }

  const assessment = result ? buyingAssessment(result) : null;

  return (
    <main>
      <section className="hero">
        <nav>
          <div className="logo">BuyWise<span>AI</span></div>
          <a href="#analyze">Analyze a product</a>
        </nav>

        <div className="heroContent">
          <div className="eyebrow">SHOP SMARTER WITH EVIDENCE</div>
          <h1>Is it actually <em>worth buying?</em></h1>
          <p className="lead">
            BuyWise AI looks at ingredients, product claims, price and customer feedback
            to help you understand the formula and compare its price.
          </p>
          <a className="primaryButton" href="#analyze">Check a product</a>
          <p className="microcopy">No sponsored rankings. No mystery score.</p>
        </div>
      </section>

      <section className="analyzeSection" id="analyze">
        <div className="sectionHeading">
          <span>TRY THE V1</span>
          <h2>Analyze a skincare product</h2>
          <p>
            Enter product details from its packaging. Leave optional fields blank if you do not know them.
          </p>
        </div>

        {error && <div className="error" role="alert">{error}</div>}
        <div className="workspace">
          <form className="formCard" onSubmit={analyze}>
            <div className="twoCols">
              <label>
                Product name
                <input name="name" value={form.name} onChange={updateField} required />
              </label>
              <label>
                Brand
                <input name="brand" value={form.brand} onChange={updateField} required />
              </label>
            </div>

            <div className="twoCols">
              <label>
                Price (€)
                <input type="number" step="0.01" min="0.01" name="price_eur" value={form.price_eur} onChange={updateField} required />
              </label>
              <label>
                Size (ml)
                <input type="number" step="0.1" min="0.1" name="size_ml" value={form.size_ml} onChange={updateField} required />
              </label>
            </div>

            <label>
              Ingredients
              <textarea
                name="ingredients"
                value={form.ingredients}
                onChange={updateField}
                placeholder="niacinamide, hyaluronic acid, fragrance"
                rows="3"
                required
              />
              <small>Paste the full ingredient list; commas, full stops, semicolons and line breaks are accepted.</small>
            </label>

            <label>
              Marketing claims
              <textarea
                name="claims"
                value={form.claims}
                onChange={updateField}
                placeholder="brightens skin, supports hydration"
                rows="2"
              />
            </label>

            <div className="twoCols">
              <label>
                Rating / 5
                <input type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={updateField} />
              </label>
              <label>
                Review count
                <input type="number" min="0" name="review_count" value={form.review_count} onChange={updateField} />
              </label>
            </div>

            <button type="submit" className="submitButton" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze product"}
            </button>

          </form>

          <div className="resultArea">
            {!result && (
              <div className="emptyState">
                <div className="emptyIcon">✦</div>
                <h3>Enter product details to start</h3>
                <p>
                  Your report will show whether there is enough information for a buying verdict.
                </p>
              </div>
            )}

            {result && (
              <div className="report">
                <div className="reportHeader">
                  <div>
                    <span className="label">{result.score == null ? "PRODUCT ASSESSMENT" : "BUYWISE SCORE"}</span>
                    <h3>{result.product_name}</h3>
                  </div>
                  {result.score != null && <div className="scoreCircle">
                    <strong>{Math.round(result.score)}</strong>
                    <span>/100</span>
                  </div>}
                </div>

                {result.score != null && <div className={verdictClass(result.verdict)}>{result.verdict}</div>}
                <p>{result.recognized_count != null ? `${result.recognized_count} of ${result.ingredient_count} ingredients identified` : "Ingredient insights"}. General roles, not a product efficacy rating.</p>
                <p className="priceNote">€{result.price_per_10ml.toFixed(2)} per 10 ml</p>

                {result.score != null && <div className="breakdown">
                  {Object.entries(result.breakdown).filter(([, value]) => value != null).map(([key, value]) => (
                    <div className="metric" key={key}>
                      <div>
                        <span>{key === "ingredients" ? "Recognized ingredients (limited assessment)" : key === "value" ? "Price heuristic" : key}</span>
                        <strong>{value == null ? "Insufficient information" : Math.round(value)}</strong>
                      </div>
                      <div className="bar">
                        <div style={{ width: `${value ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>}

                <section className="insightCard">
                  <h4>{assessment.title}</h4>
                  <p><strong>Formula fit:</strong> {assessment.formula}</p>
                  <p><strong>Value:</strong> {assessment.price}</p>
                  <p><strong>Before buying:</strong> The ingredient list does not establish how well the finished product works or whether your skin will tolerate it.</p>
                  {result.ingredient_roles?.length > 0 && <>
                    <ul>{result.ingredient_roles.filter(item => !["aqua", "aqua (water)"].includes(item.ingredient.toLowerCase())).slice(0, 3).map(item => <li key={item.ingredient}><strong>{item.ingredient}:</strong> {item.role}</li>)}</ul>
                    <details><summary>All ingredient roles and sources</summary><ul>{result.ingredient_roles.map(item => <li key={item.ingredient}><strong>{item.ingredient}:</strong> {item.role} <a href={item.source} target="_blank" rel="noopener noreferrer">Source</a></li>)}</ul></details>
                  </>}
                  {result.score == null && <details><summary>Why there is no numerical score</summary><p>The assessment above uses ingredient roles and the listed prices. A full efficacy rating needs stronger product evidence; missing review data is not a negative review.</p></details>}
                </section>

                <div className="alternatives">
                  <div className="alternativesHeading">
                    <span>COMPARE</span>
                    <h4>Similar products</h4>
                  </div>
                  {result.alternatives.length ? result.alternatives.map((item) => (
                    <div className="alternative" key={item.name}>
                      <div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer"><strong>{item.brand} {item.name}</strong></a>
                        <p>{item.reason}</p>
                      </div>
                      <div className="alternativeMeta">
                        <span>{item.price_eur != null ? `€${item.price_eur.toFixed(2)}` : "Check current price"}</span>
                        {item.size_ml != null && <small>{item.size_ml} ml · €{item.price_per_10ml.toFixed(2)} / 10 ml</small>}
                        {item.price_difference_percent != null && <small>{item.price_difference_percent === 0 ? "Same price per ml" : `${Math.abs(item.price_difference_percent).toFixed(0)}% ${item.price_difference_percent < 0 ? "less" : "more"} per ml`}</small>}
                        {item.price_checked && <small>Price checked {item.price_checked}; shipping excluded</small>}
                      </div>
                    </div>
                  )) : <p>No verified alternative available.</p>}
                  {result.alternatives.some(item => item.price_eur != null) && <p className="microcopy">Manufacturer list prices may change. A similar active ingredient does not mean equal results.</p>}
                </div>

                <details className="methodology"><summary>How this assessment works</summary><p>{result.methodology}</p><p>AI uses entered details and a limited internal database. Similar products come from manufacturer pages checked on 6 October 2026; they are not ranked as better or cheaper.</p></details>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="howItWorks">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>A buying assessment you can actually use.</h2>
        <div className="steps">
          <div><strong>01</strong><h3>Ingredients</h3><p>We check known ingredients against a structured knowledge base.</p></div>
          <div><strong>02</strong><h3>Evidence</h3><p>Claims are evaluated separately instead of being accepted at face value.</p></div>
          <div><strong>03</strong><h3>Value</h3><p>Price and quantity are normalized so expensive packaging does not hide poor value.</p></div>
          <div><strong>04</strong><h3>Verdict</h3><p>You get a short assessment of formula fit, comparative price and what remains uncertain.</p></div>
        </div>
      </section>

      <section className="pricingSection" id="pricing">
        <div className="sectionHeading">
          <span>PRICING</span>
          <h2>Start free. Upgrade when you need more.</h2>
          <p>Simple pricing for shoppers who want better decisions without endless research.</p>
        </div>

        <div className="pricingGrid">
          <div className="priceCard">
            <span className="priceTag">FREE</span>
            <h3>Try BuyWise</h3>
            <div className="price">€0</div>
            <ul>
              <li>3 product checks per month</li>
              <li>Formula and price assessment</li>
              <li>Ingredient and value breakdown</li>
            </ul>
            <a className="priceButton" href="#analyze">Try it free</a>
          </div>

          <div className="priceCard featuredPrice">
            <span className="priceTag">PRO</span>
            <h3>BuyWise Pro</h3>
            <div className="price">€4.99 <small>/ month</small></div>
            <ul>
              <li>Unlimited product checks</li>
              <li>Deeper evidence reports</li>
              <li>Product comparisons</li>
              <li>Saved products and future price alerts</li>
            </ul>
            <a className="priceButton" href="#waitlist">Join early access</a>
          </div>
        </div>
      </section>

      <section className="faqSection">
        <div className="sectionHeading">
          <span>FAQ</span>
          <h2>Questions people will ask.</h2>
        </div>

        <div className="faqList">
          <details>
            <summary>Does BuyWise accept money from brands?</summary>
            <p>No sponsored ranking is used in the score. If affiliate links are added later, they should never change the product score.</p>
          </details>
          <details>
            <summary>Is the score generated by an LLM?</summary>
            <p>No. The V1 score is calculated from defined rules for ingredients, evidence, value and reviews. Generative AI may be used later to explain the result in plain language.</p>
          </details>
          <details>
            <summary>Which products can I analyze?</summary>
            <p>The first version focuses on skincare. Enter the product details manually; automatic link analysis is unavailable.</p>
          </details>
          <details>
            <summary>Is BuyWise medical advice?</summary>
            <p>No. BuyWise is a shopping and product-information tool, not a substitute for professional medical or dermatological advice.</p>
          </details>
        </div>
      </section>

      <section className="waitlistSection" id="waitlist">
        <div>
          <span className="eyebrow">EARLY ACCESS</span>
          <h2>Help shape BuyWise.</h2>
          <p>Join the early-access list to hear about new retailers, comparisons and the Pro launch.</p>
        </div>

        <form className="waitlistForm" onSubmit={joinWaitlist}>
          <input
            type="email"
            placeholder="you@example.com"
            value={waitlistEmail}
            onChange={(event) => setWaitlistEmail(event.target.value)}
            required
          />
          <button type="submit" disabled={waitlistLoading}>
            {waitlistLoading ? "Joining..." : "Join early access"}
          </button>
          {waitlistMessage && <p>{waitlistMessage}</p>}
        </form>
      </section>

      <footer>
        <div className="logo">BuyWise<span>AI</span></div>
        <p>Informational shopping assistance only. Not medical advice.</p>
      </footer>
    </main>
  );
}
