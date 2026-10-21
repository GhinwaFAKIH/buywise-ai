"use client";
const safeUrl = raw => {
  try {
    const url = new URL(String(raw || "").trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname.toLowerCase())) return null;
    return url.href;
  } catch { return null; }
};
// Affiliate link supplied by the site owner via Amazon Associates SiteStripe.
const ordinaryAffiliateLink = "https://link.amazon/A0hGJNtvI";
const isOrdinaryNiacinamide = item => /ordinary/i.test(item.brand || "") && /niacinamide/i.test(item.name || "");
export default function WhereToBuy({ products = [] }) {
  const entries = products.map((item, index) => ({
    title: [item.brand, item.name].filter(Boolean).join(" ") || `Product ${index + 1}`,
    url: safeUrl(item.url),
    affiliateUrl: isOrdinaryNiacinamide(item) ? ordinaryAffiliateLink : null,
    index
  }));
  return <section className="whereToBuy" aria-label="Where to buy compared products">
    <div className="whereToBuyIntro"><span>SHOP WITH CONFIDENCE</span><h3>Where to buy</h3><p>Open the product pages you provided and check the current price, shipping, stock and return conditions directly with each retailer.</p></div>
    <div className="whereToBuyList">{entries.map(item=><div className="whereToBuyItem" key={item.index}>
      <strong>{item.title}</strong>
      {item.affiliateUrl && <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored nofollow">Shop on Amazon ↗ · Affiliate link</a>}
      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer nofollow">View original product page ↗</a>}
      {!item.url && !item.affiliateUrl && <span className="whereToBuyUnavailable">Add a product URL above to see a retailer link</span>}
    </div>)}</div>
    <p className="whereToBuyDisclosure"><strong>Affiliate disclosure:</strong> BuyWise may earn a commission from qualifying purchases through clearly identified affiliate links, at no extra cost to you. Amazon links labeled “Affiliate link” are supplied by BuyWise’s Amazon Associates account. Other retailer links are the URLs you provided. Any future paid partnerships will not determine the ingredient assessment or comparison ranking.</p>
  </section>;
}
