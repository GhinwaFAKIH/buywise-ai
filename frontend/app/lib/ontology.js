import { id, concepts, products } from "./semantic";

const ns=id("/ontology.jsonld#");
const uri=(name)=>ns+name;
const classes=[
["SkincareProduct","A cosmetic product considered for a skincare routine."],
["Ingredient","A named constituent of a cosmetic formulation."],
["SkinConcern","A consumer-described cosmetic skin concern, not a medical diagnosis."],
["ProductClaim","A claim about a product, attributed to a source rather than independently verified."],
["EvidenceStatement","A statement recording its source, limits and verification status."]
];
const properties=[
["hasIngredient","A product label or manufacturer information associates a product with an ingredient.","SkincareProduct","Ingredient"],
["addressesConcern","A product is marketed in relation to a cosmetic concern; not an efficacy guarantee.","SkincareProduct","SkinConcern"],
["makesClaim","A sourced description or marketing claim associated with a product.","SkincareProduct","ProductClaim"],
["supportedBy","A claim is linked to a source-qualified evidence statement.","ProductClaim","EvidenceStatement"]
];
const concerns=[
{key:"hydration",name:"Skin hydration",description:"Concern about the feeling or appearance of skin hydration."},
{key:"oiliness",name:"Oily-looking skin",description:"Concern about the appearance of oily skin."},
{key:"dryness",name:"Dry-feeling skin",description:"Concern about skin dryness."}
];
const assertions=[
{product:"the-ordinary-niacinamide",concern:"oiliness",claim:"Manufacturer markets this serum for visible shine and congestion-related appearance.",source:"https://theordinary.com/fr-fr/niacinamide-10-zinc-1-serum-100436.html"},
{product:"cerave-moisturizing-cream",concern:"dryness",claim:"Manufacturer describes a moisturizing cream intended for dry to very dry skin.",source:"https://www.cerave.fr/nos-produits/hydratants/baume-hydratant"}
];
export function ontologyGraph(){
 const classNodes=classes.map(([key,description])=>({"@id":uri(key),"@type":"rdfs:Class","rdfs:label":key,"rdfs:comment":description}));
 const propertyNodes=properties.map(([key,description,domain,range])=>({"@id":uri(key),"@type":"rdf:Property","rdfs:label":key,"rdfs:comment":description,"rdfs:domain":{"@id":uri(domain)},"rdfs:range":{"@id":uri(range)}}));
 const conceptNodes=Object.entries(concepts).map(([key,c])=>({"@id":id("/knowledge-graph.jsonld#"+key),"@type":["schema:DefinedTerm",uri("Ingredient")],"schema:name":c.name,"schema:description":c.description}));
 const concernNodes=concerns.map(c=>({"@id":uri("concern-"+c.key),"@type":uri("SkinConcern"),"schema:name":c.name,"schema:description":c.description}));
 const productNodes=products.map(p=>({"@id":id("/knowledge-graph.jsonld#product-"+p.slug),"@type":["schema:Product",uri("SkincareProduct")],"schema:name":p.name,"schema:brand":{"@type":"schema:Brand","schema:name":p.brand},[uri("hasIngredient")]:p.mentions.map(k=>({"@id":id("/knowledge-graph.jsonld#"+k)})), "schema:subjectOf":{"@id":id("/guides/"+p.guide+"#article")}}));
 const claimNodes=assertions.flatMap((a,i)=>{const cid=uri("claim-"+(i+1)),eid=uri("evidence-"+(i+1));return [{"@id":cid,"@type":uri("ProductClaim"),"schema:text":a.claim,[uri("supportedBy")]:{"@id":eid}},{"@id":eid,"@type":uri("EvidenceStatement"),"schema:description":"Manufacturer product description; not independently verified clinical efficacy.","schema:url":a.source,"schema:additionalType":"https://schema.org/Claim"}]});
 const annotated=productNodes.map(p=>{const a=assertions.map((v,i)=>({...v,i})).filter(v=>p["@id"]===id("/knowledge-graph.jsonld#product-"+v.product));return {...p,[uri("addressesConcern")]:a.map(v=>({"@id":uri("concern-"+v.concern)})),[uri("makesClaim")]:a.map(v=>({"@id":uri("claim-"+(v.i+1))}))}});
 return {"@context":{"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#","rdfs":"http://www.w3.org/2000/01/rdf-schema#","schema":"https://schema.org/","bw":ns},"@graph":[...classNodes,...propertyNodes,...conceptNodes,...concernNodes,...annotated,...claimNodes]};
}
