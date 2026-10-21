"use client";
export default function ShareGuide({title}) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({title, url}); } catch(e) { if(e.name !== "AbortError") console.error("Sharing unavailable"); }
    } else {
      try { await navigator.clipboard.writeText(url); window.alert("Guide link copied!"); }
      catch { window.prompt("Copy this guide link:", url); }
    }
  };
  return <button type="button" onClick={share} className="guideShareButton" aria-label={"Share "+title}>Share this guide ↗</button>;
}
