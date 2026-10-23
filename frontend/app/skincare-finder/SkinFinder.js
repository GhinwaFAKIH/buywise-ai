"use client";
import {useState} from "react";
import Link from "next/link";

const products=[
{id:"hyaluronic",name:"The Ordinary Hyaluronic Acid 2% + B5",category:"Hydrating serum",description:"A serum to explore when hydration is the main goal.",guide:"/guides/hyaluronic-acid-serums-guide",source:"https://theordinary.com/fr-fr/acide-hyaluronique-2-b5-serum-100637.html",concerns:["hydration","dehydration"],skin:["dry","combination","oily","unsure"],sensitivity:"general"},
{id:"cerave",name:"CeraVe Moisturizing Cream",category:"Moisturizer",description:"A richer cream to investigate for dryness and skin comfort.",guide:"/guides/ceramides-moisturizer-guide",source:"https://www.cerave.fr/nos-produits/hydratants/baume-hydratant",concerns:["hydration","comfort","dehydration"],skin:["dry","combination","unsure"],sensitivity:"general"},
{id:"ordinary-niacinamide",name:"The Ordinary Niacinamide 10% + Zinc 1%",category:"Niacinamide serum",description:"A concentrated niacinamide formula; check tolerance and the current ingredient list.",guide:"/guides/the-ordinary-niacinamide-10-zinc-1",source:"https://theordinary.com/fr-fr/niacinamide-10-zinc-1-serum-100436.html",concerns:["oiliness","tone"],skin:["oily","combination","unsure"],sensitivity:"strong"},
{id:"inkey-niacinamide",name:"The INKEY List Niacinamide Serum",category:"Niacinamide serum",description:"Another niacinamide option to compare for formula details and personal preference.",guide:"/guides/the-ordinary-vs-inkey-list-niacinamide",source:"https://www.theinkeylist.com/products/niacinamide-serum",concerns:["oiliness","tone"],skin:["oily","combination","unsure"],sensitivity:"strong"},
{id:"geek-bbomb",name:"Geek & Gorgeous B-Bomb",category:"Niacinamide serum",description:"A further niacinamide comparison option; review the manufacturer's current formula.",guide:"/guides/geek-and-gorgeous-b-bomb-vs-ordinary",source:"https://www.geekandgorgeous.fr/products/b-bomb",concerns:["oiliness","tone"],skin:["oily","combination","unsure"],sensitivity:"strong"}
];
const concerns=[["hydration","More moisture"],["dehydration","Dehydrated-looking skin"],["oiliness","Oiliness / shine"],["tone","Uneven-looking tone"],["comfort","Dryness / comfort"]];
const fieldStyle={padding:14,borderRadius:10,border:"1px solid #d5c8eb",background:"white",width:"100%"};
export default function SkinFinder(){
const [skin,setSkin]=useState(""),[concern,setConcern]=useState(""),[budget,setBudget]=useState(""),[sensitive,setSensitive]=useState(""),[show,setShow]=useState(false);
const ranked=products.map((p,index)=>({ ...p,index,score:(p.concerns.includes(concern)?6:0)+(p.skin.includes(skin)?2:0)+(p.id==="cerave"&&skin==="dry"?2:0)-(sensitive==="yes"&&p.sensitivity==="strong"?10:0)})).filter(p=>p.score>=6).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3);
function reset(){setSkin("");setConcern("");setBudget("");setSensitive("");setShow(false);}
return <section className="guideArticle" aria-label="Skincare finder questionnaire"><div style={{background:"#fff",border:"1px solid #e4dfee",borderRadius:22,padding:"clamp(18px,4vw,36px)"}}>
<h2>Find a useful starting point</h2><p>Four quick questions. No signup, diagnosis or hidden scoring.</p>
<form onSubmit={e=>{e.preventDefault();setShow(true);}}>
<div style={{display:"grid",gap:18,marginTop:22}}>
<label style={{display:"grid",gap:8,fontWeight:600}}>1. How does your skin usually feel?
<select required value={skin} onChange={e=>{setSkin(e.target.value);setShow(false)}} style={fieldStyle}><option value="">Choose an option</option><option value="dry">Dry or tight</option><option value="oily">Oily or shiny</option><option value="combination">Combination</option><option value="unsure">Not sure / varies</option></select></label>
<label style={{display:"grid",gap:8,fontWeight:600}}>2. What's your main priority?
<select required value={concern} onChange={e=>{setConcern(e.target.value);setShow(false)}} style={fieldStyle}><option value="">Choose a priority</option>{concerns.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
<label style={{display:"grid",gap:8,fontWeight:600}}>3. Does your skin react easily to new products?
<select required value={sensitive} onChange={e=>{setSensitive(e.target.value);setShow(false)}} style={fieldStyle}><option value="">Choose an option</option><option value="yes">Yes / I prefer a cautious approach</option><option value="no">Not usually</option><option value="unsure">Not sure</option></select></label>
<label style={{display:"grid",gap:8,fontWeight:600}}>4. What's your preferred budget?
<select required value={budget} onChange={e=>{setBudget(e.target.value);setShow(false)}} style={fieldStyle}><option value="">Choose a budget</option><option value="under15">Under €15</option><option value="15to30">€15–€30</option><option value="flexible">Flexible</option></select></label>
</div><button type="submit" className="primaryButton" style={{marginTop:22}}>Explore products →</button></form>
{show&&<div aria-live="polite" style={{marginTop:28}}><h2>Your skincare starting points</h2><p>These are educational options selected from five products already covered by BuyWise, not clinical recommendations. We prioritize your concern and skin feel. If you report easy reactions, we avoid ranking concentrated niacinamide options. We do not infer that a product is safe for you.</p>
<p><strong>Your budget:</strong> {budget==="under15"?"Under €15":budget==="15to30"?"€15–€30":"Flexible"}. We cannot confirm which products fit it without verified current retailer prices. Check the exact size, shipping and price before purchasing.</p>
{ranked.length?ranked.map((p,i)=><article key={p.id} style={{borderTop:"1px solid #e4dfee",padding:"20px 0"}}><small>OPTION {i+1} · {p.category}</small><h3 style={{marginTop:6}}>{p.name}</h3><p>{p.description}</p><p><strong>Why shown:</strong> {p.concerns.includes(concern)?"It relates to your selected priority. ":""}{p.skin.includes(skin)?"It is also an option to investigate for your selected skin feel.":""}</p><p><Link href={p.guide}>Read BuyWise comparison →</Link> · <a href={p.source} target="_blank" rel="noopener noreferrer">Check manufacturer details ↗</a></p></article>):<p>We don't have a confident match in this small catalog for your selections. For reactive skin, consider starting with a simple routine and seeking advice from a qualified professional if irritation persists. Explore our <Link href="/skin">skincare overview</Link>.</p>}
<p>Compare actual product costs with our <Link href="/calculator">free price-per-ml calculator</Link>. This tool does not store your answers or send them to a server.</p>
<button type="button" onClick={reset} style={{padding:"10px 16px",border:"1px solid #d5c8eb",borderRadius:10,background:"white"}}>Start again</button></div>}
</div></section>;
}