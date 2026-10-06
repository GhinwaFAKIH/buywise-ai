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
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean),
      claims: source.claims
        .split(/[,;\n]+/)
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
            to give you a transparent value score.
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
              <small>Paste the full ingredient list; commas, semicolons and line breaks are accepted.</small>
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
                <section className="insightCard">
                  <h4>Product assessment</h4>
                  {result.ai_report ? <>
                    <p>{result.ai_report.summary}</p>
                    <h4>Ingredient insights</h4>
                    <ul>{result.ai_report.ingredient_notes.map((note, i) => <li key={i}>{note}</li>)}</ul>
                    <h4>Price explained</h4>
                    <p>{result.ai_report.value_explanation}</p>
                    <h4>What remains uncertain</h4>
                    <ul>{result.ai_report.limitations.map((note, i) => <li key={i}>{note}</li>)}</ul>
                    <h4>Next steps</h4>
                    <ul>{result.ai_report.next_steps.map((note, i) => <li key={i}>{note}</li>)}</ul>
                    <small>AI explanation based on your inputs and a limited internal knowledge base. No live source verification.</small>
                  </> : <p>{result.ai_status && result.ai_status !== "not_configured" ? "The AI explanation is temporarily unavailable. Your ingredient and price assessment is below." : "Ingredient and price assessment below. AI explanations are not enabled yet."}</p>}
                </section>
                <div className="reportHeader">
                  <div>
                    <span className="label">BUYWISE SCORE</span>
                    <h3>{result.product_name}</h3>
                  </div>
                  <div className="scoreCircle">
                    <strong>{result.score == null ? "—" : Math.round(result.score)}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className={verdictClass(result.verdict)}>{result.verdict}</div>
                <p>Data confidence: <strong>{result.confidence || "Not assessed"}</strong>{result.ingredient_coverage != null && ` · Ingredient coverage: ${Math.round(result.ingredient_coverage * 100)}%`}</p>
                <p className="priceNote">€{result.price_per_10ml.toFixed(2)} per 10 ml</p>

                <div className="breakdown">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div className="metric" key={key}>
                      <div>
                        <span>{key}</span>
                        <strong>{value == null ? "Insufficient information" : Math.round(value)}</strong>
                      </div>
                      <div className="bar">
                        <div style={{ width: `${value ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="insightGrid">
                  <div className="insightCard">
                    <h4>✓ Strengths</h4>
                    {result.strengths.length ? (
                      <ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                    ) : <p>No major strengths detected yet.</p>}
                  </div>

                  <div className="insightCard warningCard">
                    <h4>⚠ Watch out</h4>
                    {result.warnings.length ? (
                      <ul>{result.warnings.map((item) => <li key={item}>{item}</li>)}</ul>
                    ) : <p>No major warnings detected.</p>}
                  </div>
                </div>

                <div className="alternatives">
                  <div className="alternativesHeading">
                    <span>BETTER VALUE</span>
                    <h4>Possible alternatives</h4>
                  </div>
                  {result.alternatives.length ? result.alternatives.map((item) => (
                    <div className="alternative" key={item.name}>
                      <div>
                        <strong>{item.brand} {item.name}</strong>
                        <p>{item.reason}</p>
                      </div>
                      <div className="alternativeMeta">
                        <span>€{item.price_eur.toFixed(2)}</span>
                        <strong>{Math.round(item.score)}/100</strong>
                      </div>
                    </div>
                  )) : <p>No verified alternative available.</p>}
                </div>

                <p className="methodology">{result.methodology}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="howItWorks">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>A score you can actually understand.</h2>
        <div className="steps">
          <div><strong>01</strong><h3>Ingredients</h3><p>We check known ingredients against a structured knowledge base.</p></div>
          <div><strong>02</strong><h3>Evidence</h3><p>Claims are evaluated separately instead of being accepted at face value.</p></div>
          <div><strong>03</strong><h3>Value</h3><p>Price and quantity are normalized so expensive packaging does not hide poor value.</p></div>
          <div><strong>04</strong><h3>Verdict</h3><p>The score is deterministic, and AI is used to explain rather than invent it.</p></div>
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
              <li>BuyWise score and verdict</li>
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
