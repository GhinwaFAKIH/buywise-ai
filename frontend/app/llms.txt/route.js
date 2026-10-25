import {siteUrl} from "../site-url";
import {guides} from "../guides/guides";
export const dynamic = "force-static";
export function GET(){
 const text = [
 "# GHINÉVA",
 "",
 "> GHINÉVA helps shoppers understand skincare ingredients, compare cosmetic product information, and calculate unit prices. It provides general educational guidance, not personal dermatological advice or real-time price guarantees.",
 "",
 "Website: "+siteUrl,
 "",
 "## Tools",
 "- [Compare skincare products]("+siteUrl+"/compare-skincare-products): Side-by-side ingredient and price comparison.",
 "- [Free price calculator]("+siteUrl+"/calculator): Compare price per ml and per 10 ml using visitor-entered prices and volumes.",
 "- [Shop and compare]("+siteUrl+"/shop): Product examples and disclosed shopping links.",
 "",
 "## Original comparison guides",
 "- [The Ordinary vs The INKEY List Niacinamide]("+siteUrl+"/guides/the-ordinary-vs-inkey-list-niacinamide)",
 "- [Budget niacinamide serum comparison]("+siteUrl+"/guides/budget-niacinamide-serums-comparison)",
 "- [The Ordinary Hyaluronic Acid vs La Roche-Posay Hyalu B5]("+siteUrl+"/guides/the-ordinary-hyaluronic-acid-vs-hyalu-b5)",
 "",
 "## Complete guide directory",
 ...guides.map(g=>"- ["+g.title+"]("+siteUrl+"/guides/"+g.slug+"): "+g.description),
 "",
 "## Editorial information",
 "- [Comparison methodology]("+siteUrl+"/methodology)",
 "- [About GHINÉVA]("+siteUrl+"/about)",
 "- [All beauty guides]("+siteUrl+"/guides)",
 "- [Linked product data]("+siteUrl+"/knowledge-graph.jsonld)",
 "- [Skincare ontology]("+siteUrl+"/ontology.jsonld)",
 "",
 "## Important limitations",
 "- Manufacturer ingredient lists and prices may change; verify labels and current seller listings.",
 "- Example price calculations are not live retailer prices.",
 "- Links to Amazon may be affiliate links and are identified as such on relevant pages.",
 "- GHINÉVA is not a medical provider and does not guarantee outcomes.",
 ""
 ].join("\n");
 return new Response(text,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"}});
}
