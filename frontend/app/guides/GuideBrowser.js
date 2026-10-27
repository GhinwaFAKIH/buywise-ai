"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

const groups = ["All", "Comparisons", "Ingredients", "Skincare", "Haircare"];
const visuals = {
  Skincare: { image: "/beauty-skin.svg", label: "Skin" },
  Haircare: { image: "/beauty-hair.svg", label: "Hair" },
  Ingredients: { image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80", label: "Ingredients" },
  Comparisons: { image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80", label: "Compare" }
};
function groupFor(guide) {
  const content = (guide.category + " " + guide.title).toLowerCase();
  if (content.includes("hair") || content.includes("shampoo")) return "Haircare";
  if (content.includes(" vs ") || content.includes("compare") || content.includes("comparison")) return "Comparisons";
  if (content.includes("ingredient") || guide.category === "Ingredients" || content.includes("acid") || content.includes("niacinamide")) return "Ingredients";
  return "Skincare";
}
function shortTitle(title) {
  return title.replace(/: (Buying Checklist|A Practical Guide|What You Need to Know)$/i, "");
}
export default function GuideBrowser({ guides }) {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(12);
  const [playing, setPlaying] = useState(false);
  const results = useMemo(() => guides.filter(guide => {
    const matchesGroup = active === "All" || groupFor(guide) === active;
    const matchesSearch = (guide.title + " " + guide.description + " " + guide.category).toLowerCase().includes(search.trim().toLowerCase());
    return matchesGroup && matchesSearch;
  }), [guides, active, search]);
  return <div className="ghVisualBrowse">
    <div className="ghDiscoverHeader">
      <div><span className="ghEyebrow">EXPLORE & LEARN</span><h2>Find your next answer</h2></div>
      <label className="ghGuideSearch"><span aria-hidden="true">⌕</span><span className="srOnly">Search beauty guides</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setLimit(12); }} placeholder="Search ingredients, skincare, hair..." /></label>
    </div>
    <div className="ghTopicChips" role="group" aria-label="Filter guides by topic">{groups.map(group => <button type="button" key={group} aria-pressed={active === group} onClick={() => { setActive(group); setLimit(12); }}>{group}</button>)}</div>
    <div className="ghSpotlightVideo">
      <div className="ghVideoCopy"><span className="ghEyebrow">WATCH & LEARN</span><h2>Niacinamide or vitamin C?</h2><p>A dermatologist explains the differences.</p><button type="button" className="ghWatchButton" onClick={() => setPlaying(value => !value)} aria-expanded={playing}>{playing ? "Close video ×" : "▶ Watch the video"}</button><small>Video by dermatologist Dr Dray · External educational content</small></div>
      <div className="ghVideoFrame">{playing ? <iframe src="https://www.youtube-nocookie.com/embed/uSrE2s5LZAU?autoplay=1" title="Dr Dray explains niacinamide versus vitamin C" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <button type="button" onClick={() => setPlaying(true)} className="ghVideoPoster" aria-label="Play dermatologist video about niacinamide versus vitamin C"><img src="https://img.youtube.com/vi/uSrE2s5LZAU/hqdefault.jpg" alt="Dermatologist video preview: vitamin C versus niacinamide" loading="lazy"/><span aria-hidden="true">▶</span></button>}</div>
    </div>
    <p className="ghGuideCount" aria-live="polite">{results.length} guides {search ? "found" : "to explore"}</p>
    <section className="ghImageGuideGrid" aria-label="Beauty guides">{results.slice(0, limit).map((guide, index) => { const category = groupFor(guide); const visual = visuals[category]; return <Link href={"/guides/" + guide.slug} key={guide.slug} className="ghImageGuideCard"><div className="ghCardPhoto"><img src={visual.image} alt={category + " educational guide illustration"} loading={index < 3 ? "eager" : "lazy"} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/beauty-skin.svg"; }}/><span className="ghCardPill">{category}</span></div><div className="ghCardContent"><h3>{shortTitle(guide.title)}</h3><span className="ghCardArrow">Read guide ↗</span></div></Link>; })}</section>
    {results.length === 0 && <div className="ghEmptyResult">No guides match yet. Try a different ingredient or topic.</div>}
    {results.length > limit && <button type="button" className="ghLoadMore" onClick={() => setLimit(current => current + 12)}>Show more guides ↓</button>}
  </div>;
}
