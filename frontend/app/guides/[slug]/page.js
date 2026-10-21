import Link from "next/link";
import ShareGuide from "../ShareGuide";
import { guides, getGuide } from "../guides";
export function generateStaticParams(){return guides.map(g=>({slug:g.slug}));}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found", robots: { index: false } };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
    },
    twitter: { card: "summary", title: guide.title, description: guide.description },
  };
}
export default async function Guide({params}){const {slug}=await params;const g=getGuide(slug);if(!g)return <main className="guidesPage"><Link href="/guides">Back to Beauty Guides</Link><h1>Guide not found</h1></main>;return <main className="guidesPage"><nav className="guidesNav"><Link href="/">❧ BuyWise AI</Link><Link href="/guides">All guides</Link></nav><article className="guideArticle"><Link className="guideBack" href="/guides">← Beauty Guides</Link><small>{g.category} · BUYWISE EDITORIAL</small><h1>{g.title}</h1><p className="guideIntro">{g.description}</p><ShareGuide title={g.title} />{g.sections.map(s=><section key={s.heading}><h2>{s.heading}</h2><p>{s.body}</p></section>)}{g.comparison&&<section className="guideComparison"><h2>Compare at a glance</h2><div className="guideTableScroll"><table><caption>{g.comparison.caption}</caption><thead><tr>{g.comparison.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{g.comparison.rows.map((cells,i)=><tr key={i}>{cells.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>}{g.faq?.length>0&&<section className="guideFaq"><h2>Frequently asked questions</h2>{g.faq.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>}<aside className="guideCta"><h2>Compare before you buy</h2><p>Use BuyWise AI to explore formula ingredients, unit prices, research links and uncertainties.</p><Link href="/#analyze">Analyze a product ↗</Link></aside>{g.affiliateUrl&&<aside className="guideAffiliate"><p><strong>Affiliate disclosure:</strong> As an Amazon Associate, BuyWise may earn from qualifying purchases, at no extra cost to you. Buying links do not determine our analysis.</p><a href={g.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer">View The Ordinary on Amazon ↗</a><p>Check current price, seller and formulation on Amazon before buying.</p></aside>}<div className="relatedGuides"><h2>Keep exploring</h2><div>{(g.relatedSlugs?.length ? g.relatedSlugs.map(id=>getGuide(id)).filter(Boolean) : guides.filter(item=>item.slug!==g.slug).slice(0,3)).map(item=><Link key={item.slug} href={"/guides/"+item.slug}>{item.title} →</Link>)}</div></div><p className="guideDisclaimer">General educational content only; not medical or dermatological advice. Consult a qualified professional for personal skin or hair concerns.</p></article></main>}
