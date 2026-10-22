import { ontologyGraph } from "../lib/ontology";
export function GET(){return new Response(JSON.stringify(ontologyGraph(),null,2),{headers:{"Content-Type":"application/ld+json; charset=utf-8","Cache-Control":"public, max-age=300"}});}
