"use client";
const safeUrl = raw => {
  try {
    const url = new URL(String(raw || "").trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname.toLowerCase())) return null;
    return url.href;
  } catch { return null; }
};
/** Retailer URLs come from the user's input, not invented offers or affiliate redirects. */
export default function WhereToBuy({ products = [] }) {
  const entries = products.map((item, index) => ({
    title: [item.brand, item.name].filter(Boolean).join(" ") || `Product ${index + 1}`,
    url: safeUrl(item.url),
    index
  }));
  return <section className="whereToBuy" aria-label="Where to buy compared products">
    <div className="whereToBuyIntro"><span>SHOP WITH CONFIDENCE</span><h3>Where to buy</h3><p>Open the product pages you provided and check the current price, shipping, stock and return conditions directly with each retailer.</p></div>
    <div className="whereToBuyList">{entries.map(item=><div className="whereToBuyItem" key={item.index}>
      <strong>{item.title}</strong>
      {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer nofollow sponsored">View at retailer ↗</a> : <span className="whereToBuyUnavailable">Add a product URL above to see a retailer link</span>}
    </div>)}</div>
    <p className="whereToBuyDisclosure"><strong>Affiliate disclosure:</strong> BuyWise may earn a commission from qualifying purchases through clearly identified affiliate links, at no extra cost to you. Currently, the retailer links shown here are the product URLs you provided, not commission-tracked links. Any future paid partnerships will not determine the ingredient assessment or comparison ranking.</p>
  </section>;
}
