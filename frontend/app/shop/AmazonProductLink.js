"use client";
export default function AmazonProductLink({href,product}) {
  function recordClick() {
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      window.plausible("Amazon Product Click", { props: { product } });
    }
  }
  return <a href={href} target="_blank" rel="sponsored nofollow noopener noreferrer" onClick={recordClick} className="buywiseShopButton">Check on Amazon ↗</a>;
}
