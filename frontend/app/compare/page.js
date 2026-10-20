"use client";
import { useState } from "react";
import Link from "next/link";

const blank = () => ({ name: "", brand: "", price_eur: "", size_ml: "", ingredients: "" });
export default function ComparePage() {
  const [category, setCategory] = useState("skincare");
  const [products, setProducts] = useState([blank(), blank()]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function change(index, field, value) {
    setProducts(current => current.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }
  async function compare(event) {
    event.preventDefault();
    setError(""); setResult(null); setBusy(true);
    try {
      const payload = { category, products: products.map(p => ({
        ...p, price_eur: Number(p.price_eur), size_ml: Number(p.size_ml),
        ingredients: p.ingredients.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
      })) };
      const response = await fetch("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Check product details and try again.");
      setResult(data);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main style={{maxWidth:1000,margin:"auto",padding:"32px 20px 80px"}}>
    <Link href="/">← BuyWise AI</Link>
    <header style={{margin:"40px 0"}}><h1 style={{fontSize:"clamp(32px,5vw,54px)"}}>Compare before you buy.</h1><p>Skincare, haircare and beauty products. Transparent prices, no invented scores.</p></header>
    <form onSubmit={compare}>
      <label htmlFor="category">Product category</label>
      <select id="category" value={category} onChange={e=>{setCategory(e.target.value);setResult(null);}} style={{display:"block",padding:12,margin:"8px 0 24px",borderRadius:10}}>
        <option value="skincare">Skincare</option><option value="haircare">Haircare</option><option value="beauty">Beauty / makeup</option>
      </select>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16}}>
      {products.map((p,i)=><section key={i} style={{background:"white",padding:22,borderRadius:16,border:"1px solid #e4dfee"}}>
        <h2 style={{fontSize:22,marginBottom:16}}>Product {i+1}</h2>
        {["brand","name","price_eur","size_ml","ingredients"].map(field=><label key={field} style={{display:"block",marginBottom:12}}>
          <span style={{display:"block",textTransform:"capitalize",marginBottom:4}}>{field.replaceAll("_"," ")}{field==="size_ml"?" (ml)":""}</span>
          <input required={field!=="ingredients"} type={field==="price_eur"||field==="size_ml"?"number":"text"} min={field==="price_eur"||field==="size_ml"?"0.01":undefined} step="any" value={p[field]} onChange={e=>change(i,field,e.target.value)} style={{width:"100%",padding:10,border:"1px solid #ccc",borderRadius:8}}/>
        </label>)}
        {products.length>2&&<button type="button" onClick={()=>setProducts(v=>v.filter((_,j)=>j!==i))}>Remove</button>}
      </section>)}
      </div>
      <div style={{display:"flex",gap:12,marginTop:24,flexWrap:"wrap"}}>
        {products.length<3&&<button type="button" onClick={()=>setProducts(v=>[...v,blank()])} style={{padding:"12px 20px"}}>+ Add third product</button>}
        <button type="submit" disabled={busy} className="primaryButton">{busy?"Comparing…":"Compare products →"}</button>
      </div>
    </form>
    {error&&<p role="alert" style={{color:"#a11"}}>{error}</p>}
    {result&&<section aria-live="polite" style={{marginTop:48}}>
      <h2 style={{fontSize:30}}>Your comparison</h2>
      <p>Lowest unit price: <strong>{result.lowest_unit_price_product}</strong>. This does not mean it is the best product for you.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
        {result.products.map((p,i)=><article key={i} style={{background:"white",padding:20,borderRadius:16,border:"1px solid #e4dfee"}}>
          <h3>{p.name}</h3><p>€{p.price_eur.toFixed(2)} · {p.size_ml} ml</p>
          <p><strong>€{p.price_per_10ml.toFixed(2)} / 10 ml</strong></p>
          <p>Ingredients listed: {p.ingredient_count}</p>
          <p>{p.score==null?"Effectiveness not scored":`Existing skincare heuristic: ${p.score}/100`}</p>
          {(p.warnings||[]).slice(0,2).map((w,j)=><p key={j} style={{fontSize:13}}>{w}</p>)}
        </article>)}
      </div><p style={{marginTop:20,fontSize:13}}>{result.methodology}</p>
    </section>}
  </main>;
}
