from app.models import ProductInput
from app.semantic_evidence import retrieve_graph_evidence

def test_ingredient_links_and_manufacturer_attribution():
    p = ProductInput(name="Niacinamide 10% + Zinc 1%", brand="The Ordinary", price_eur=8, size_ml=30, ingredients=["Aqua", "Niacinamide", "Zinc PCA"])
    result = retrieve_graph_evidence(p)
    assert result["status"] == "matched"
    assert any(f["entity"] == "Niacinamide" for f in result["findings"])
    assert any(f["relation"] == "manufacturer_claim" for f in result["findings"])

def test_unmatched_product_does_not_invent_claims():
    p = ProductInput(name="Unknown Cream", brand="Unknown", price_eur=10, size_ml=50, ingredients=["Unrecognized Ingredient"])
    result = retrieve_graph_evidence(p)
    assert result["status"] == "no_match"
    assert result["findings"] == []
