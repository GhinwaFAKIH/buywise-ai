"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { guides } from "./guides";

const categories = ["All", "Skincare", "Ingredients", "Haircare", "Shopping tips"];
const art = {
  "the-ordinary-niacinamide-10-zinc-1": ["SERUM", "10% + ZINC", "serum"],
  "niacinamide-vs-vitamin-c": ["B3 + C", "INGREDIENTS", "vitamins"],
  "hyaluronic-acid-serums-guide": ["HA", "HYDRATION", "drops"],
  "salicylic-acid-vs-glycolic-acid": ["AHA / BHA", "EXFOLIANTS", "acid"],
  "retinol-for-beginners": ["RETINOL", "NIGHT ROUTINE", "serum"],
  "ceramides-moisturizer-guide": ["CERAMIDES", "SKIN BARRIER", "cream"],
  "sulfate-free-shampoo-explained": ["SHAMPOO", "HAIRCARE", "bottle"],
  "hair-oils-vs-serums": ["HAIR OIL", "SMOOTH & SHINE", "bottle"],
  "how-to-compare-skincare-prices": ["€ / 10 ml", "SMART SHOPPING", "price"],
  "how-to-read-ingredient-lists": ["INCI", "READ THE LABEL", "ingredients"],
};
function GuideArt({ guide, prominent = false }) {
  const [label, subtitle, kind] = art[guide.slug] || ["BUYWISE", "BEAUTY EDIT", "serum"];
  return <div className={`guideArt guideArt--${kind}${prominent ? " guideArt--featured" : ""}`} aria-hidden="true">
    <span className="guideArtOrbit guideArtOrbitOne" /><span className="guideArtOrbit guideArtOrbitTwo" />
    <div className="guideArtProduct"><div className="guideArtCap" /><div className="guideArtBottle"><span>BUYWISE EDIT</span><strong>{label}</strong><em>{subtitle}</em></div></div>
    <span className="guideArtCorner">✳</span>
  </div>;
}
export default function GuidesCollection() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const matches = useMemo(() => guides.filter(g => (category === "All" || g.category === category) && (`${g.title} ${g.description} ${g.category}`).toLowerCase().includes(query.trim().toLowerCase())), [category, query]);
  const featured = guides[0];
  return <>
    <section className="guideFeatured" aria-label="Featured beauty guide">
      <div className="guideFeaturedCopy"><span className="guideEyebrow">✦ EDITOR'S PICK</span><h2>Before you buy that viral serum…</h2><p>Does a higher ingredient percentage mean better value? Explore the formula, practical trade-offs and an easy unit-price example.</p><Link href={`/guides/${featured.slug}`} className="guideFeaturedLink">Explore the niacinamide guide ↗</Link></div>
      <Link href={`/guides/${featured.slug}`} className="guideFeaturedMedia" aria-label={featured.title}><GuideArt guide={featured} prominent /></Link>
    </section>
    <section className="guideBrowse" aria-label="Browse beauty guides">
      <div className="guideBrowseTop"><div><span className="guideEyebrow">THE KNOWLEDGE SHELF</span><h2>Find your next good read</h2><p>Unbiased questions, practical comparisons, and more confident choices.</p></div><label className="guideSearch"><span className="sr-only">Search guides</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search guides…" /></label></div>
      <div className="guideFilters" role="group" aria-label="Filter guides by category">{categories.map(c=><button key={c} type="button" className={category===c?"isActive":""} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <p className="guideResultCount" aria-live="polite">{matches.length} {matches.length===1?"guide":"guides"} found</p>
      {matches.length ? <div className="guidesGrid guidesGrid--illustrated">{matches.map(g=><article className="guideTile guideTile--illustrated" key={g.slug}><Link href={`/guides/${g.slug}`} className="guideTileImage" aria-label={`Read ${g.title}`}><GuideArt guide={g}/></Link><div className="guideTileBody"><small>{g.category}</small><h3><Link href={`/guides/${g.slug}`}>{g.title}</Link></h3><p>{g.description}</p><Link className="guideReadLink" href={`/guides/${g.slug}`}>Read guide <span aria-hidden="true">→</span></Link></div></article>)}</div> : <div className="guideEmpty"><strong>No matching guides yet.</strong><p>Try another category or search term.</p><button type="button" onClick={()=>{setCategory("All");setQuery("");}}>Show all guides</button></div>}
    </section>
    <aside className="guideBrowseCta"><div><span className="guideEyebrow">SHOP WITH MORE CONTEXT</span><h2>Have a product in mind?</h2><p>Explore its ingredient list and unit price with GHINÉVA. Your first three analyses are free.</p></div><Link href="/#analyze">Try GHINÉVA ↗</Link></aside>
  </>;
}
