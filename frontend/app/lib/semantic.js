import { siteUrl } from "../site-url";
export const base=siteUrl;
export const id=(path)=>base+path;
export const organization={"@type":"Organization","@id":id("/#organization"),name:"BuyWise AI",url:base};
export const website={"@type":"WebSite","@id":id("/#website"),url:base,name:"BuyWise AI",description:"Free skincare product comparison, ingredient information, and price-per-ml tools.",inLanguage:"en",publisher:{"@id":organization["@id"]}};
export const concepts={
niacinamide:{name:"Niacinamide",description:"An ingredient commonly used in skincare formulations."},
hyaluronicAcid:{name:"Hyaluronic acid",description:"A humectant ingredient used in skincare."},
ceramides:{name:"Ceramides",description:"Lipids associated with the skin barrier."},
zincPca:{name:"Zinc PCA",description:"An ingredient used in some niacinamide serums."}
};
export const term=(key)=>({"@type":"DefinedTerm","@id":id("/knowledge-graph.jsonld#"+key),name:concepts[key].name,description:concepts[key].description,inDefinedTermSet:id("/knowledge-graph.jsonld#ingredients")});
export const products=[
{slug:"the-ordinary-niacinamide",name:"The Ordinary Niacinamide 10% + Zinc 1%",brand:"The Ordinary",mentions:["niacinamide","zincPca"],guide:"the-ordinary-niacinamide-10-zinc-1"},
{slug:"inkey-list-niacinamide",name:"The INKEY List Niacinamide Serum",brand:"The INKEY List",mentions:["niacinamide"],guide:"the-ordinary-vs-inkey-list-niacinamide"},
{slug:"geek-gorgeous-b-bomb",name:"Geek & Gorgeous B-Bomb",brand:"Geek & Gorgeous",mentions:["niacinamide","zincPca"],guide:"geek-and-gorgeous-b-bomb-vs-ordinary"},
{slug:"cerave-moisturizing-cream",name:"CeraVe Moisturizing Cream",brand:"CeraVe",mentions:["ceramides","hyaluronicAcid"],guide:"ceramides-moisturizer-guide"}
];
export const productNode=(p)=>({"@type":"Product","@id":id("/knowledge-graph.jsonld#product-"+p.slug),name:p.name,brand:{"@type":"Brand",name:p.brand},subjectOf:{"@id":id("/guides/"+p.guide+"#article")},mentions:p.mentions.map(k=>({"@id":term(k)["@id"]}))});
export const serializeJsonLd=(graph)=>JSON.stringify(graph).replace(/</g,"\\u003c");
export const breadcrumbs=(items)=>({"@type":"BreadcrumbList",itemListElement:items.map((item,i)=>({"@type":"ListItem",position:i+1,name:item.name,item:id(item.path)}))});
