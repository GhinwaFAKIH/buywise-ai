"use client";
import { useEffect, useRef, useState } from "react";
const initialForm = { name: "", brand: "", price_eur: "", size_ml: "", ingredients: "", claims: "", rating: "", review_count: "" };
const example = { name: "Niacinamide 10% + Zinc 1%", brand: "The Ordinary", price_eur: "7.95", size_ml: "30", ingredients: "Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin", claims: "", rating: "", review_count: "" };
function Mark() { return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C20 3 21 10 16 16C10 21 3 20 3 16C3 12 10 11 16 16C21 22 20 29 16 29C12 29 11 22 16 16C22 11 29 12 29 16C29 20 22 21 16 16C11 10 12 3 16 3Z" fill="currentColor"/></svg>; }
async function api(endpoint, payload = {}) {
  const response = await fetch(`/api/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) { const error = new Error(typeof data.detail === "string" ? data.detail : "Please check your details and try again."); error.status = response.status; throw error; }
  return data;
}
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
  const [account, setAccount] = useState({ accounts_enabled: false, billing_enabled: false, user: null });
  const [authMode, setAuthMode] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const modal = useRef(null);
  async function refreshAccount() { try { const data = await api("account"); setAccount(data); return data; } catch { return null; } }
  useEffect(() => { refreshAccount(); if (new URLSearchParams(window.location.search).get("billing") === "success") { setNotice("Thanks! Your plan will appear once payment is confirmed. Refresh your account in a moment."); const timer = setTimeout(refreshAccount, 4000); return () => clearTimeout(timer); } }, []);
  useEffect(() => { if (!authMode) return; const handler = event => { if (event.key === "Escape") setAuthMode(null); if (event.key === "Tab") { const nodes = modal.current?.querySelectorAll("button, input, a[href]"); if (!nodes?.length) return; const first = nodes[0], last = nodes[nodes.length-1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } }; document.addEventListener("keydown", handler); const old = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = old; }; }, [authMode]);
  function updateField(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }
  function toPayload(source) { const split = value => value.split(/[,;\n]+|\.(?=\s|$)/).map(item => item.trim()).filter(Boolean); return { name: source.name, brand: source.brand, price_eur: Number(source.price_eur), size_ml: Number(source.size_ml), ingredients: split(source.ingredients), claims: split(source.claims), rating: source.rating === "" ? null : Number(source.rating), review_count: source.review_count === "" ? null : Number(source.review_count) }; }
  async function analyze(event) {
    event.preventDefault(); setError("");
    if (account.accounts_enabled && !account.user) { setAuthMode("signup"); return; }
    if (account.user?.remaining === 0) { setError("You have used your analyses. Choose a plan below to continue."); document.getElementById("pricing").scrollIntoView({ behavior: "smooth" }); return; }
    setLoading(true); setResult(null);
    try { setResult(await api("analyze", toPayload(form))); await refreshAccount(); }
    catch (err) { setError(err.message); if (err.status === 401) setAuthMode("login"); }
    finally { setLoading(false); }
  }
  async function authenticate(event) { event.preventDefault(); setAuthBusy(true); setAuthError(""); const data = new FormData(event.currentTarget); try { const user = await api(authMode, { email: data.get("email"), password: data.get("password") }); setAccount(current => ({ ...current, user })); setAuthMode(null); setNotice("You’re signed in. Your product details are ready to analyze."); } catch (err) { setAuthError(err.message); } finally { setAuthBusy(false); } }
  async function subscribe(plan) { setNotice(""); if (!account.billing_enabled) { setNotice("Paid plans are opening soon. Join the launch list below to be notified."); document.getElementById("launch").scrollIntoView({ behavior: "smooth" }); return; } if (!account.user) { setAuthMode("signup"); return; } setBillingBusy(true); try { const data = await api(account.user.plan !== "free" ? "portal" : "checkout", { plan }); window.location.assign(data.url); } catch (err) { setNotice(err.message); } finally { setBillingBusy(false); } }
  async function manageBilling() { setBillingBusy(true); try { const data = await api("portal"); window.location.assign(data.url); } catch (err) { setNotice(err.message); } finally { setBillingBusy(false); } }
  async function joinWaitlist(event) { event.preventDefault(); try { const data = await api("waitlist", { email: waitlistEmail }); setWaitlistMessage(data.message); } catch (err) { setWaitlistMessage(err.message); } }
  const assessment = result ? buyingAssessment(result) : null;
  return <main>
    <nav className="topNav"><a href="#" className="logo"><Mark/>BuyWise<span>ai</span></a><div className="navLinks"><a href="#analyze">Analyze</a><a href="#how">How it works</a><a href="#pricing">Pricing</a></div><button className="navAccount" onClick={async () => { if (account.user) { await api("logout"); await refreshAccount(); } else if (account.accounts_enabled) { setAuthError(""); setAuthMode("login"); } else { document.getElementById("analyze").scrollIntoView({ behavior: "smooth" }); } }}>{account.user ? "Sign out" : account.accounts_enabled ? "Sign in" : "Try BuyWise ↗"}</button></nav>
    <section className="hero">
      <div className="heroContent"><div className="pill"><span className="liveDot"/> A little research. A smarter purchase.</div><h1>Less guessing.<br/>More <em>good buys.</em></h1><p className="lead">Your skincare shelf deserves a second opinion. Explore ingredients, check the claims and compare prices before you buy.</p><div className="heroActions"><a className="primaryButton" href="#analyze">Check a product <span>↗</span></a><a className="textButton" href="#how">See how it works →</a></div><div className="heroTrust"><span>✦ Sources you can open</span><span>✦ No sponsored rankings</span></div></div>
      <div className="heroVisual" aria-label="Illustration of a BuyWise report"><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="floatingNote noteTop">✦ Make your next buy count</div><div className="previewCard"><div className="previewTop"><Mark/><span>YOUR SECOND OPINION</span><span>↗</span></div><div className="bottleScene"><div className="bottle"><div className="bottleCap"/><div className="bottleLabel">YOUR<br/><strong>SKINCARE</strong><span>Look a little closer.</span></div></div><span className="sceneSpark sparkOne">✧</span><span className="sceneSpark sparkTwo">✦</span></div><div className="previewLine"><span>Formula insights</span><strong>Ingredients explained</strong></div><div className="previewLine"><span>Price comparison</span><strong>Cost per 10 ml</strong></div><div className="previewLine"><span>Evidence check</span><strong>Sources linked ↗</strong></div><small>Example report illustration</small></div><div className="floatingNote noteBottom">✓ Shop with a little more clarity</div></div>
    </section>
    <div className="featureStrip"><span>INGREDIENT INSIGHTS</span><i>✦</i><span>REAL SOURCE LINKS</span><i>✦</i><span>PRICE COMPARISONS</span><i>✦</i><span>REVIEW RESEARCH</span></div>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}
    <section className="analyzeSection" id="analyze"><div className="sectionHeading"><span className="eyebrow">MEET YOUR SHOPPING SIDEKICK</span><h2>What’s on your wishlist?</h2><p>Add the basics. We’ll look for product information, research and reviews.</p></div><div className="usageBanner">{account.user ? <><strong>{account.user.remaining} analyses left</strong><span>{account.user.plan === "free" ? "Your 3 free analyses" : `${account.user.plan} · ${account.user.limit} analyses per billing month`}</span><button onClick={refreshAccount}>Refresh account</button>{account.user.plan !== "free" && <button onClick={manageBilling} disabled={billingBusy}>Manage subscription</button>}</> : <><strong>{account.accounts_enabled ? "Your first 3 analyses are free" : "Try the public preview"}</strong><span>{account.accounts_enabled ? "Create an account to keep track of your analyses." : "Accounts and subscriptions are opening soon."}</span>{account.accounts_enabled && <button onClick={() => {setAuthError("");setAuthMode("signup");}}>Create free account →</button>}</>}</div>
    <div className="workspace"><form className="formCard" onSubmit={analyze}><div className="formTop"><span className="stepBadge">01</span><h3>The product details</h3><button type="button" className="sampleButton" onClick={() => setForm(example)}>Try an example</button></div><div className="twoCols"><label>Product name<input name="name" placeholder="e.g. Niacinamide serum" value={form.name} onChange={updateField} required maxLength={180}/></label><label>Brand<input name="brand" placeholder="e.g. The Ordinary" value={form.brand} onChange={updateField} required maxLength={100}/></label></div><div className="twoCols"><label>Price (€)<input type="number" step="0.01" min="0.01" name="price_eur" placeholder="7.95" value={form.price_eur} onChange={updateField} required/></label><label>Size (ml)<input type="number" step="0.1" min="0.1" name="size_ml" placeholder="30" value={form.size_ml} onChange={updateField} required/></label></div><label>Ingredient list<textarea name="ingredients" placeholder="Paste the INCI list from the packaging…" value={form.ingredients} onChange={updateField} rows={4} required maxLength={12000}/><small>Commas, full stops and line breaks all work.</small></label><details className="optionalFields"><summary>More details <span>optional +</span></summary><label>Marketing claims<textarea name="claims" value={form.claims} onChange={updateField} rows={2} maxLength={3000}/></label><div className="twoCols"><label>Rating / 5<input type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={updateField}/></label><label>Review count<input type="number" min="0" name="review_count" value={form.review_count} onChange={updateField}/></label></div></details>{error && <p className="error" role="alert">{error}</p>}<button className="submitButton" disabled={loading}>{loading ? "Searching sources & reviews…" : "Give me a second opinion ↗"}</button><p className="microcopy">We’ll link what we find and explain what remains uncertain.</p></form><div className="resultArea">{!result && <div className="emptyState"><div className={loading ? "emptyIcon spinning" : "emptyIcon"}><Mark/></div><span className="eyebrow">{loading ? "A LITTLE RESEARCH IN PROGRESS" : "YOUR REPORT LIVES HERE"}</span><h3>{loading ? "Looking a little closer…" : "Good buys start with good questions."}</h3><p>{loading ? "Searching product pages, ingredient studies and customer reviews. This can take a moment." : "You’ll get formula insights, a price comparison and linked sources, all in one place."}</p><div className="emptyTags"><span>Ingredients</span><span>Evidence</span><span>Value</span></div></div>}
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
                  {result.score == null && <details><summary>Why there is no numerical score</summary><p>We searched for product information and ingredient studies. Finding sources does not automatically justify a numerical efficacy score; the evidence still needs to match the exact formula and claimed outcome.</p></details>}
                </section>

                <section className="insightCard" style={{ marginTop: 16 }}>
                  <h4>What we found online</h4>
                  {result.research_status === "retrieved" ? <>
                    {(result.ai_report?.research_findings || []).map((finding, i) => {
                      const source = result.research_sources?.[finding.source_index];
                      return source ? <div key={i}><p><strong>{source.category === "ingredient_study" ? "Ingredient research" : "Product information"}:</strong> {finding.interpretation}</p><p><q>{finding.quote}</q> <a href={source.url} target="_blank" rel="noopener noreferrer">Source</a></p></div> : null;
                    })}
                    {result.retrieved_reviews && <p><strong>Customer feedback:</strong> {result.retrieved_reviews.rating}/5 from {result.retrieved_reviews.review_count} reviews. <a href={result.retrieved_reviews.source_url} target="_blank" rel="noopener noreferrer">Review source</a>. Retrieved {result.retrieved_reviews.retrieved_at} from {result.retrieved_reviews.retrieval_method === "product_page" ? "the product page" : "a search excerpt"}. Consumer ratings are not clinical evidence.</p>}
                    {result.retrieved_reviews?.review_excerpts?.length > 0 && <details><summary>Available review-section excerpts</summary>{result.retrieved_reviews.review_excerpts.map((text, i) => <p key={i}><q>{text}</q></p>)}<small>A small visible sample from this site; not a representative summary of all reviews.</small></details>}
                    {!result.ai_report?.research_findings?.length && <p>Search results are available below. No supported AI interpretation was returned for this request.</p>}
                    <details><summary>Retrieved sources ({result.research_sources?.length || 0})</summary>
                      {(result.research_sources || []).map((source, i) => <div key={source.url}><p><a href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.title}</strong></a> · {source.category === "ingredient_study" ? "Ingredient study" : "Product search result"} · Retrieved {source.retrieved_at}</p><p>{source.excerpt.split(/\s+/).slice(0, 25).join(" ")}…</p></div>)}
                    </details>
                  </> : <p>{result.research_status === "no_results" ? "We searched but found no usable sources for this product." : result.research_status === "not_configured" ? "Online search is unavailable because the backend search key is not configured." : "Online search could not complete this time. Ingredient and price insights remain available; try again for research."}</p>}
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

                <details className="methodology"><summary>How this assessment works</summary><p>{result.methodology}</p><p>Online research searches product pages and ingredient studies. Search excerpts may be incomplete or outdated; linked sources show what was retrieved. Ingredient evidence, manufacturer claims and customer ratings are different kinds of information. Comparison prices were checked on 6 October 2026.</p></details>
              </div>
            )}
    </div></div></section>
    <section className="howItWorks" id="how"><div className="sectionHeading"><span className="eyebrow">FROM “MAYBE” TO A CLEARER CHOICE</span><h2>Three steps. Less guesswork.</h2></div><div className="steps"><div><strong>01 / THE FORMULA</strong><h3>Look past the label.</h3><p>Understand the roles of identified ingredients and what the formula can tell you.</p></div><div><strong>02 / THE RESEARCH</strong><h3>Check the story.</h3><p>Explore product pages, ingredient studies and available reviews, with links to the sources.</p></div><div><strong>03 / THE COMPARISON</strong><h3>Put price in context.</h3><p>Compare cost per ml with similar products. See what you’re paying for before switching.</p></div></div></section>
    <section className="pricingSection" id="pricing"><div className="sectionHeading"><span className="eyebrow">SMALL PRICE. SMARTER SHOPPING.</span><h2>A second opinion<br/>that won’t cost a serum.</h2><p>Start with three free analyses. Choose more when you need them.</p></div><div className="pricingGrid">{[{id:"free",name:"The curious shopper",price:"0",label:"FREE",limit:"3 analyses total",description:"A little clarity for your next purchase."},{id:"starter",name:"The thoughtful shopper",price:"2.99",label:"STARTER",limit:"20 analyses / month",description:"For building a routine you feel good about."},{id:"plus",name:"The comparison lover",price:"5.99",label:"PLUS",limit:"60 analyses / month",description:"For researching, comparing and exploring."}].map(plan => <div key={plan.id} className={`priceCard ${plan.id === "starter" ? "featuredPrice" : ""}`}><span className="priceTag">{plan.label}{plan.id === "starter" && " · GREAT VALUE"}</span><h3>{plan.name}</h3><p>{plan.description}</p><div className="price">€{plan.price}{plan.id !== "free" && <small>/ month</small>}</div><strong>{plan.limit}</strong><ul><li>Ingredient and formula insights</li><li>Online source & review research</li><li>Similar-product price comparisons</li></ul><button className="priceButton" disabled={billingBusy} onClick={() => { if (plan.id === "free") { if (account.accounts_enabled && !account.user) {setAuthError("");setAuthMode("signup");} else document.getElementById("analyze").scrollIntoView({behavior:"smooth"}); } else subscribe(plan.id); }}>{plan.id === "free" ? "Start exploring →" : billingBusy ? "Opening checkout…" : account.billing_enabled ? (account.billing_mode === "test" ? "Test " : "Choose ") + plan.label.toLowerCase() + " →" : "Notify me at launch →"}</button><small>{plan.id === "free" ? "No card required" : "Monthly subscription · cancel future renewal anytime"}</small></div>)}</div><p className="pricingNote">Paid analyses reset each billing month and do not roll over. Free analyses are a one-time allowance per account. {account.billing_enabled ? account.billing_mode === "test" ? "Stripe test mode: no real payments are collected." : "Payment is handled securely by Stripe." : "Paid plans are not open for purchase yet."}</p></section>
    <section className="faqSection"><div className="sectionHeading"><span className="eyebrow">A FEW GOOD QUESTIONS</span><h2>Before you dive in.</h2></div><div className="faqList"><details><summary>Can I use it for any product?</summary><p>BuyWise currently focuses on skincare. Enter the product details and full ingredient list from its packaging.</p></details><details><summary>Will I always get a numerical score?</summary><p>You’ll get a formula and price assessment. A numerical score appears only when the scoring rules have enough information. Ingredient roles and customer reviews alone do not prove effectiveness.</p></details><details><summary>Do you actually search for reviews?</summary><p>Yes. We search for matching products and try to open review pages. Some retailers block access, and visible reviews may be only a small sample. Every retrieved rating includes its source.</p></details><details><summary>How do subscriptions work?</summary><p>Your first three analyses are free per account. Starter includes 20 analyses and Plus includes 60 per billing month. Paid plans renew monthly; you can manage or cancel renewal through the billing portal.</p></details><details><summary>Is this medical advice?</summary><p>No. BuyWise helps with product research and shopping decisions. It does not diagnose conditions or determine individual skin tolerance.</p></details></div></section>
    <section className="waitlistSection" id="launch"><div><span className="eyebrow">KEEP IN THE LOOP</span><h2>Your next good buy<br/>starts here.</h2><p>Hear when accounts and paid plans open, plus new BuyWise features.</p></div><form className="waitlistForm" onSubmit={joinWaitlist}><label className="srOnly" htmlFor="launchEmail">Email address</label><input id="launchEmail" type="email" placeholder="Your email address" value={waitlistEmail} onChange={event => setWaitlistEmail(event.target.value)} required/><button className="primaryButton">Keep me posted ↗</button>{waitlistMessage && <p role="status">{waitlistMessage}</p>}</form></section>
    <footer><a className="logo" href="#"><Mark/>BuyWise<span>ai</span></a><p>A little clarity before you checkout.<br/><small>Product information, not medical advice.</small></p><a href="#pricing">Plans ↗</a></footer>
    {authMode && <div className="modalBackdrop" onClick={event => { if (event.target === event.currentTarget) setAuthMode(null); }}><section className="authModal" ref={modal} role="dialog" aria-modal="true" aria-labelledby="authTitle"><button className="closeModal" onClick={() => setAuthMode(null)} aria-label="Close">×</button><div className="logo"><Mark/>BuyWise<span>ai</span></div><h2 id="authTitle">{authMode === "signup" ? "Your next good buy starts here." : "Good to see you again."}</h2><p>{authMode === "signup" ? "Create an account for your 3 free analyses. No card needed." : "Sign in to continue exploring."}</p><form onSubmit={authenticate}><label>Email<input autoFocus type="email" name="email" autoComplete="email" required maxLength={254}/></label><label>Password<input type="password" name="password" minLength={10} maxLength={128} autoComplete={authMode === "signup" ? "new-password" : "current-password"} required/><small>At least 10 characters.</small></label>{authError && <p className="error" role="alert">{authError}</p>}<button className="submitButton" disabled={authBusy}>{authBusy ? "One moment…" : authMode === "signup" ? "Create my free account →" : "Sign in →"}</button></form><button className="authSwitch" onClick={() => {setAuthError("");setAuthMode(authMode === "signup" ? "login" : "signup");}}>{authMode === "signup" ? "Already have an account? Sign in" : "New here? Create a free account"}</button></section></div>}
  </main>;
}
