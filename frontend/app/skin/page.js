import Link from "next/link";
import {CategoryPage,catalog} from "../components/CategoryPage";
export const metadata={title:catalog.skin.title+" | BuyWise AI",description:catalog.skin.intro,alternates:{canonical:"/skin"}};
export default function Page(){return <><CategoryPage category="skin"/><section className="guideArticle"><aside className="guideCta"><h2>Not sure where to start?</h2><p>Answer three quick questions to explore skincare options based on your priorities.</p><Link href="/skincare-finder">Try the free skincare finder ↗</Link></aside></section></>;}
