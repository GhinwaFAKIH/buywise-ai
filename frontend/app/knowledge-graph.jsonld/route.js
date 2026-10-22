import { organization, website, products, productNode, concepts, term, id } from "../lib/semantic";
export function GET(){
 const graph={"@context":"https://schema.org","@graph":[organization,website,{"@type":"DefinedTermSet","@id":id("/knowledge-graph.jsonld#ingredients"),name:"Skincare ingredient concepts",hasDefinedTerm:Object.keys(concepts).map(k=>({"@id":term(k)["@id"]}))},...Object.keys(concepts).map(term),...products.map(productNode)]};
 return new Response(JSON.stringify(graph,null,2),{headers:{"Content-Type":"application/ld+json; charset=utf-8","Cache-Control":"public, max-age=300"}});
}
