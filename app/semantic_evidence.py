"""Small curated, deterministic semantic retrieval layer for skincare analysis.

Identifiers align with frontend/app/lib/semantic.js and /ontology.jsonld.
Statements here are descriptors, not evidence of product efficacy.
"""
import re

SITE = "https://buywise-ai-pi.vercel.app"
BASE = SITE + "/knowledge-graph.jsonld#"
ONTOLOGY = SITE + "/ontology.jsonld#"
INGREDIENTS = {
    "niacinamide": ("Niacinamide", ["niacinamide"], "An ingredient used in skincare formulations."),
    "hyaluronicAcid": ("Hyaluronic acid", ["hyaluronic acid", "sodium hyaluronate", "hydrolyzed hyaluronic acid"], "A humectant ingredient used in skincare."),
    "ceramides": ("Ceramides", ["ceramide np", "ceramide ap", "ceramide eop", "ceramides"], "Lipids associated with the skin barrier."),
    "zincPca": ("Zinc PCA", ["zinc pca"], "An ingredient used in some niacinamide serums."),
}
PRODUCTS = {
    "the-ordinary-niacinamide": {
        "brand": "The Ordinary", "name": "Niacinamide 10% + Zinc 1%",
        "source": "https://theordinary.com/fr-fr/niacinamide-10-zinc-1-serum-100436.html",
        "claim": "Manufacturer markets this serum for oily-looking skin.",
        "guide": "the-ordinary-niacinamide-10-zinc-1",
    },
    "cerave-moisturizing-cream": {
        "brand": "CeraVe", "name": "Moisturizing Cream",
        "source": "https://www.cerave.fr/nos-produits/hydratants/baume-hydratant",
        "claim": "Manufacturer describes a moisturizer for dry to very dry skin.",
        "guide": "ceramides-moisturizer-guide",
    },
}
def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", str(s).casefold()).strip()

def retrieve_graph_evidence(product):
    """Only match supplied labels. Do not infer absent ingredients or efficacy."""
    raw = [str(x) for x in product.ingredients]
    normalized = [norm(x) for x in raw]
    found = []
    for key, (name, aliases, description) in INGREDIENTS.items():
        matched = [raw[i] for i, n in enumerate(normalized) if n in [norm(a) for a in aliases]]
        if matched:
            found.append({
                "entity": name, "entity_id": BASE + key,
                "relation": "ingredient_match", "matched_labels": matched[:4],
                "statement": description, "evidence_type": "curated_ingredient_description",
                "source_url": SITE + "/ontology",
                "limitation": "An ingredient match does not establish product-level clinical efficacy.",
            })
    product_facts = []
    submitted_brand, submitted_name = norm(product.brand), norm(product.name)
    for slug, record in PRODUCTS.items():
        if submitted_brand == norm(record["brand"]) and norm(record["name"]) in submitted_name:
            product_facts.append({
                "entity": record["brand"] + " " + record["name"],
                "entity_id": BASE + "product-" + slug,
                "relation": "manufacturer_claim",
                "statement": record["claim"],
                "evidence_type": "manufacturer_description_not_independently_verified",
                "source_url": record["source"],
                "limitation": "Manufacturer description is not a clinical test or proof of individual suitability.",
            })
    return {
        "status": "matched" if found or product_facts else "no_match",
        "ontology_url": SITE + "/ontology.jsonld",
        "method": "deterministic_exact_label_and_alias_matching",
        "findings": (found + product_facts)[:12],
        "unmatched_ingredient_count": max(0, len(raw) - len({x for f in found for x in f["matched_labels"]})),
        "disclaimer": "Curated semantic links are not independent clinical validation. Product claims are attributed to manufacturers.",
    }
