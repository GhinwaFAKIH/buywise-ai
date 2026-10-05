"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const initialForm = {
  name: "Glow Serum",
  brand: "Demo Beauty",
  price_eur: 39,
  size_ml: 30,
  ingredients: "niacinamide, hyaluronic acid, fragrance",
  claims: "brightens skin, supports hydration",
  rating: 4.4,
  review_count: 1250,
};

function verdictClass(verdict) {
  if (verdict === "WORTH IT") return "verdict good";
  if (verdict === "MAYBE") return "verdict maybe";
  return "verdict bad";
}

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function analyze(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      name: form.name,
      brand: form.brand,
      price_eur: Number(form.price_eur),
      size_ml: Number(form.size_ml),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      claims: form.claims
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      rating: form.rating === "" ? null : Number(form.rating),
      review_count: form.review_count === "" ? null : Number(form.review_count),
    };

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
    } catch (err) {
      setError(
        "The analysis service could not be reached. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
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
            For now, enter the product details manually. URL-based extraction comes next.
          </p>
        </div>

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
              <small>Separate ingredients with commas.</small>
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

            {error && <div className="error">{error}</div>}
          </form>

          <div className="resultArea">
            {!result && (
              <div className="emptyState">
                <div className="emptyIcon">✦</div>
                <h3>Your BuyWise report will appear here</h3>
                <p>
                  You’ll see the overall score, verdict, detailed score breakdown,
                  strengths, warnings and better-value alternatives.
                </p>
              </div>
            )}

            {result && (
              <div className="report">
                <div className="reportHeader">
                  <div>
                    <span className="label">BUYWISE SCORE</span>
                    <h3>{result.product_name}</h3>
                  </div>
                  <div className="scoreCircle">
                    <strong>{Math.round(result.score)}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className={verdictClass(result.verdict)}>{result.verdict}</div>
                <p className="priceNote">€{result.price_per_10ml.toFixed(2)} per 10 ml</p>

                <div className="breakdown">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div className="metric" key={key}>
                      <div>
                        <span>{key}</span>
                        <strong>{Math.round(value)}</strong>
                      </div>
                      <div className="bar">
                        <div style={{ width: `${value}%` }} />
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
                  )) : <p>No matching alternative in the V1 catalog.</p>}
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

      <footer>
        <div className="logo">BuyWise<span>AI</span></div>
        <p>Informational shopping assistance only. Not medical advice.</p>
      </footer>
    </main>
  );
}
