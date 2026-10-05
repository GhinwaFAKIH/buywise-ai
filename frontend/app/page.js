"use client";

import { useState } from "react";

const API_URL = "/api";

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
  const [productUrl, setProductUrl] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [showManual, setShowManual] = useState(false);
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
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      claims: source.claims
        .split(",")
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

  async function extractUrl(event) {
    event.preventDefault();
    setExtracting(true);
    setError("");
    setExtracted(null);
    setResult(null);
    let productFound = false;

    try {
      const response = await fetch(`${API_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Could not extract this product page.");
      }

      setExtracted(data);
      productFound = true;

      const nextForm = {
        name: data.name || "",
        brand: data.brand || "",
        price_eur: data.price ?? "",
        size_ml: data.size_ml ?? "",
        rating: data.rating ?? "",
        review_count: data.review_count ?? "",
        ingredients: data.ingredients?.length ? data.ingredients.join(", ") : "",
        claims: data.claims?.length ? data.claims.join(", ") : "",
      };

      setForm(nextForm);

      const readyForAutomaticAnalysis =
        nextForm.name &&
        nextForm.brand &&
        nextForm.price_eur &&
        nextForm.size_ml &&
        nextForm.ingredients;

      if (readyForAutomaticAnalysis) {
        setShowManual(false);
        await runAnalysis(toPayload(nextForm));
      } else {
        setShowManual(true);
        setError(
          "I found the product, but some details are missing. Please review the fields below before analyzing."
        );
      }
    } catch (err) {
      setShowManual(true);
      if (!productFound) {
        setForm({ name: "", brand: "", price_eur: "", size_ml: "", ingredients: "", claims: "", rating: "", review_count: "" });
      }
      setError(`${err.message || "Could not extract this product page."} You can enter the product details below to continue.`);
    } finally {
      setExtracting(false);
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
            Paste a real product link first, then review the extracted details and run the BuyWise analysis.
          </p>
        </div>

        <div className="urlCard">
          <form onSubmit={extractUrl}>
            <label>
              Product URL
              <div className="urlRow">
                <input
                  type="url"
                  placeholder="https://www.example.com/product/..."
                  value={productUrl}
                  onChange={(event) => setProductUrl(event.target.value)}
                  required
                />
                <button type="submit" className="secondaryButton" disabled={extracting}>
                  {extracting || loading ? "Analyzing..." : "Check if it's worth it"}
                </button>
              </div>
            </label>

            {extracted && (
              <div className="extractedSummary">
                {extracted.image && <img src={extracted.image} alt="" />}
                <div>
                  <strong>{extracted.brand ? `${extracted.brand} · ` : ""}{extracted.name || "Product found"}</strong>
                  <p>
                    {extracted.price ? `${extracted.currency || "€"} ${extracted.price}` : "Price not found"}
                    {" · "}
                    {extracted.size_ml ? `${extracted.size_ml} ml` : "Size not found"}
                    {" · "}
                    {extracted.raw_has_product_jsonld ? "Structured product data detected" : "Basic page metadata detected"}
                  </p>
                  {!showManual && result && <p className="autoDone">✓ Product analyzed automatically</p>}
                </div>
              </div>
            )}

            <button
                type="button"
                className="editButton"
                onClick={() => setShowManual((value) => !value)}
              >
                {showManual ? "Hide product details" : extracted ? "Edit extracted details" : "Enter product details manually"}
              </button>

            {error && <div className="error">{error}</div>}
          </form>
        </div>

        <div className={`workspace ${showManual ? "" : "resultsOnly"}`}>
          {showManual && <form className="formCard" onSubmit={analyze}>
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

          </form>}

          <div className="resultArea">
            {!result && (
              <div className="emptyState">
                <div className="emptyIcon">✦</div>
                <h3>Paste a product link to start</h3>
                <p>
                  BuyWise will extract the product details and, when enough information is available,
                  run the analysis automatically.
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
            <p>The first version focuses on skincare. Sephora France has dedicated extraction support, with generic extraction used for other product pages.</p>
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
