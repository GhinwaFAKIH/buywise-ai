"use client";
import {useState} from "react";
import Link from "next/link";
const options=[
{id:"hydration",name:"The Ordinary Hyaluronic Acid 2% + B5",description:"A hydrating serum option for a routine focused on moisture.",guide:"/guides/hyaluronic-acid-serums-guide",reason:"Hydration is your main priority.",cost:"Check retailer price and size",tags:["hydration"],skin:["dry","combination","oily","unsure"]},
{id:"niacinamide",name:"The Ordinary Niacinamide 10% + Zinc 1%",description:"A niacinamide serum to investigate for oiliness or visible unevenness; a 10% formula may not suit everyone.",guide:"/guides/the-ordinary-niacinamide-10-zinc-1",reason:"Your selected concern may make a niacinamide comparison useful.",cost:"Check retailer price and size",tags:["oiliness","tone"],skin:["oily","combination","unsure"]},
{id:"moisturizer",name:"CeraVe Moisturizing Cream",description:"A richer moisturizer option to explore when comfort and dryness matter.",guide:"/guides/ceramides-moisturizer-guide",reason:"Moisturizing is a practical starting point for dryness.",cost:"Check retailer price and size",tags:["hydration","comfort"],skin:["dry","combination","unsure"]},
];
export default function SkinFinder(){
const [skin,setSkin]=useState(""),[concern,setConcern]=useState(""),[budget,setBudget]=useState(""),[show,setShow]=useState(false);
const results=options.map(p=>({...p,score:(p.tags.includes(concern)?4:0)+(p.skin.includes(skin)?2:0)+(p.id==="moisturizer"&&skin==="dry"?2:0)})).sort((a,b)=>b.score-a.score).filter(p=>p.score>0).slice(0,3);
return <section className="guideArticle" aria-label="Skincare finder questionnaire"><div style={{background:"#fff",border:"1px solid #e4dfee",borderRadius:22,padding:"clamp(18px,4vw,36px)"}}>
<h2>Three questions, a clearer starting point</h2>
<form onSubmit={e=>{e.preventDefault();setShow(true);}}>
<div style={{display:"grid",gap:18,marginTop:22}}>
<label style={{display:"grid",gap:8,fontWeight:600}}>1. How does your skin usually feel?
<select required value={skin} onChange={e=>{setSkin(e.target.value);setShow(false)}} style={{padding:14,borderRadius:10,border:"1px solid #d5c8eb",background:"white"}}><option value="">Choose an option</option><option value="dry">Dry or tight</option><option value="oily">Oily or shiny</option><option value="combination">Combination</option><option value="unsure">Not sure / varies</option></select></label>
<label style={{display:"grid",gap:8,fontWeight:600}}>2. What's your main priority?
<select required value={concern} onChange={e=>{setConcern(e.target.value);setShow(false)}} style={{padding:14,borderRadius:10,border:"1px solid #d5c8eb",background:"white"}}><option value="">Choose a priority</option><option value="hydration">Hydration</option><option value="oiliness">Oiliness</option><option value="tone">Uneven-looking tone</option><option value="comfort">Dryness and comfort</option></select></label>
<label style={{display:"grid",gap:8,fontWeight:600}}>3. What's your preferred budget?
<select required value={budget} onChange={e=>{setBudget(e.target.value);setShow(false)}} style={{padding:14,borderRadius:10,border:"1px solid #d5c8eb",background:"white"}}><option value="">Choose a budget</option><option value="under15">Under €15</option><option value="15to30">€15–€30</option><option value="flexible">Flexible</option></select></label>
</div><button type="submit" className="primaryButton" style={{marginTop:22}}>Show options →</button></form>
{show&&<div aria-live="polite" style={{marginTop:28}}><h2>Options to explore</h2><p>These are educational starting points, not verified matches. Your budget preference is noted, but products are not filtered by price because current prices have not been verified.</p>{results.length?results.map((p,i)=><article key={p.id} style={{borderTop:"1px solid #e4dfee",padding:"20px 0"}}><small>OPTION {i+1}</small><h3 style={{marginTop:6}}>{p.name}</h3><p>{p.description}</p><p><strong>Why it appears:</strong> {p.reason}</p><p><strong>Price:</strong> {p.cost}</p><Link href={p.guide}>Read product guide →</Link></article>):<p>No strong match in our small selection. Start with the <Link href="/skin">skincare guide</Link>.</p>}<button type="button" onClick={()=>{setSkin("");setConcern("");setBudget("");setShow(false)}} style={{padding:"10px 16px",border:"1px solid #d5c8eb",borderRadius:10,background:"white"}}>Start again</button></div>}
</div></section>;
}