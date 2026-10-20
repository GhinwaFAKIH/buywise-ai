"use client";
import { useState } from "react";
import Link from "next/link";

const blank = () => ({ name:"", brand:"", price_eur:"", size_ml:"", ingredients:"", unit:"ml", url:"", image:"", extractionNote:"" });
const money = n => new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR"}).format(n);
const split = text => text.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);
export default function ComparePage(){
  const [category,setCategory]=useState("skincare");
  const [products,setProducts]=useState([blank(),blank()]);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [extracting,setExtracting]=useState(-1);
  const [notices,setNotices]=useState({});
  function change(i,field,value){setProducts(old=>old.map((p,j)=>j===i?{...p,[field]:value}:p));setResult(null);}
  async function importUrl(i){
    const url=products[i].url.trim();
    if(!/^https?:\/\//i.test(url)){setNotices(n=>({...n,[i]:"Enter a full http(s) product URL."}));return;}
    setExtracting(i);setNotices(n=>({...n,[i]:""}));
    try{
      const response=await fetch("/api/extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.detail==="string"?data.detail:"The retailer did not provide usable product information.");
      const missing=[];
      if(!data.brand)missing.push("brand");
      if(!data.name)missing.push("name");
      if(data.currency!=="EUR"||!(data.price>0))missing.push("EUR price");
      if(!(data.size_ml>0))missing.push("package size");
      if(!data.ingredients?.length)missing.push("ingredient list");
      setProducts(old=>old.map((p,j)=>j!==i?p:{...p,brand:data.brand||p.brand,name:data.name||p.name,price_eur:data.currency==="EUR"&&data.price>0?String(data.price):p.price_eur,size_ml:data.size_ml>0?String(data.size_ml):p.size_ml,ingredients:data.ingredients?.length?data.ingredients.join(", "):p.ingredients,image:data.image||"",extractionNote:missing.length?"Review or fill: "+missing.join(", ")+".":"Product details imported. Please verify against the retailer."}));
    }catch(e){setNotices(n=>({...n,[i]:e.message+" You can enter the details manually."}));}
    finally{setExtracting(-1);}
  }
  async function compare(e){
    e.preventDefault();setBusy(true);setError("");setResult(null);
    try{
      const payload={category,products:products.map(p=>({brand:p.brand.trim(),name:p.name.trim(),price_eur:Number(p.price_eur),size_ml:Number(p.size_ml),unit:p.unit,ingredients:split(p.ingredients)}))};
      if(products.some(p=>!p.name.trim()||!p.brand.trim()||!(Number(p.price_eur)>0)||!(Number(p.size_ml)>0)))throw new Error("Enter a name, brand, positive price and package size for each product.");
      if(new Set(products.map(p=>p.unit)).size>1)throw new Error("Select the same unit for every product. Grams and millilitres cannot be compared directly.");
      const response=await fetch("/api/compare",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.detail==="string"?data.detail:"Comparison is unavailable. Check your product details.");
      setResult(data);document.getElementById("comparison-results")?.scrollIntoView({behavior:"smooth"});
    }catch(e){setError(e.message);}finally{setBusy(false);}
  }
  return <main className="beautyPage">
    <nav className="beautyNav"><Link className="beautyBrand" href="/">✳ BuyWise <span>AI</span></Link><div><Link href="/#analyze">Analyze</Link><Link className="navActive" href="/compare">Compare</Link><Link href="/#how-it-works">How it works</Link></div></nav>
    <section className="beautyHero"><span className="beautyEyebrow">YOUR BEAUTY SHOPPING SIDEKICK</span><h1>Better choices start<br/>with a <em>closer look.</em></h1><p>Compare skincare, haircare and makeup by unit price and known ingredient roles. No invented effectiveness rankings.</p><div className="beautyChips"><span>✦ Transparent unit prices</span><span>✦ Ingredient explanations</span><span>✦ Product-link import</span></div></section>
    <section className="beautyPanel"><div className="beautyPanelTop"><div><span className="beautyEyebrow">01 / BUILD YOUR COMPARISON</span><h2>What are you comparing?</h2></div><label className="beautyCategory">Category<select value={category} onChange={e=>{setCategory(e.target.value);setResult(null);}}><option value="skincare">Skincare</option><option value="haircare">Haircare</option><option value="beauty">Beauty / makeup</option></select></label></div>
      <form onSubmit={compare}><div className="beautyGrid">{products.map((p,i)=><article className="beautyProduct" key={i}>
        <div className="beautyProductHead"><span className="beautyNumber">0{i+1}</span><h3>Product {i+1}</h3>{products.length>2&&<button type="button" className="beautyRemove" onClick={()=>{setProducts(old=>old.filter((_,j)=>j!==i));setResult(null);}}>Remove</button>}</div>
        <label>Product link <span className="beautyOptional">optional</span><div className="beautyUrlRow"><input type="url" placeholder="https://retailer.com/product" value={p.url} onChange={e=>change(i,"url",e.target.value)}/><button type="button" onClick={()=>importUrl(i)} disabled={extracting!==-1||!p.url.trim()}>{extracting===i?"Loading…":"Import"}</button></div></label>
        {notices[i]&&<p className="beautyWarning" role="status">{notices[i]}</p>}{p.extractionNote&&<p className="beautyHint" role="status">{p.extractionNote}</p>}
        <div className="beautyTwo"><label>Brand<input required maxLength={100} placeholder="e.g. The Ordinary" value={p.brand} onChange={e=>change(i,"brand",e.target.value)}/></label><label>Product name<input required maxLength={180} placeholder="e.g. Niacinamide serum" value={p.name} onChange={e=>change(i,"name",e.target.value)}/></label></div>
        <div className="beautyTwo"><label>Price (€)<input required type="number" min="0.01" step="any" placeholder="12.50" value={p.price_eur} onChange={e=>change(i,"price_eur",e.target.value)}/></label><label>Package size <div className="beautySize"><input required type="number" min="0.01" step="any" placeholder="30" value={p.size_ml} onChange={e=>change(i,"size_ml",e.target.value)}/><select aria-label={"Unit for product "+(i+1)} value={p.unit} onChange={e=>change(i,"unit",e.target.value)}><option value="ml">ml</option><option value="g">g</option></select></div></label></div>
        <label>Ingredients <span className="beautyOptional">if available</span><textarea rows={3} placeholder="Paste the INCI list…" value={p.ingredients} onChange={e=>change(i,"ingredients",e.target.value)}/></label>
      </article>)}</div><div className="beautyActions">{products.length<3&&<button className="beautySecondary" type="button" onClick={()=>setProducts(old=>[...old,blank()])}>+ Add third product</button>}<button className="beautyPrimary" disabled={busy||extracting!==-1} type="submit">{busy?"Comparing…":"Compare products →"}</button></div></form>
      {error&&<p className="beautyWarning" role="alert">{error}</p>}
    </section>
    {result&&<section id="comparison-results" className="beautyResults" aria-live="polite"><span className="beautyEyebrow">02 / YOUR COMPARISON</span><h2>Side by side, without the guesswork.</h2><p className="beautyHint">Lowest unit price: <strong>{result.lowest_unit_price_product}</strong>. This is not a quality or suitability recommendation.</p><div className="beautyGrid">{result.products.map((p,i)=><article className="beautyResultCard" key={i}><div className="beautyResultHead"><span className="beautyNumber">0{i+1}</span>{result.lowest_unit_price_index===i&&<span className="beautyValueBadge">Lowest unit price</span>}</div><h3>{p.name}</h3><p>{p.size_ml} {p.unit} · {money(p.price_eur)}</p><div className="beautyMetric"><span>Price per 10 {p.unit}</span><strong>{money(p.price_per_10ml)}</strong></div><div className="beautyMetric"><span>Ingredients provided</span><strong>{p.ingredient_count}</strong></div><div className="beautyMetric"><span>Roles recognized</span><strong>{p.ingredient_insights?.recognized?.length||0}</strong></div><div className="beautyRoles"><h4>Ingredient insights</h4>{p.ingredient_insights?.recognized?.length?<ul>{p.ingredient_insights.recognized.slice(0,5).map((item,j)=><li key={j}><strong>{item.ingredient}</strong><span>{item.role}</span></li>)}</ul>:<p>No supported ingredient roles identified.</p>}</div><p className="beautyHint">{p.score==null?"Effectiveness not scored.":`Existing skincare heuristic: ${p.score}/100 (not a clinical rating).`}</p></article>)}</div><p className="beautyHint">{result.methodology}</p></section>}
    <footer className="beautyFooter"><Link href="/">✳ BuyWise AI</Link><span>Informational shopping guidance, not medical advice.</span></footer>
  </main>;
}
