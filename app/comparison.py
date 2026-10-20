"""Transparent product comparisons across skincare, haircare and beauty."""
from typing import Literal
from pydantic import BaseModel, Field, model_validator
from app.models import ProductInput
from app.scoring import analyze_product

class ComparisonRequest(BaseModel):
    category: Literal["skincare", "haircare", "beauty"]
    products: list[ProductInput] = Field(min_length=2, max_length=3)

    @model_validator(mode="after")
    def unique_products(self):
        names = [(p.brand.strip().casefold(), p.name.strip().casefold()) for p in self.products]
        if len(names) != len(set(names)):
            raise ValueError("Choose different products to compare.")
        return self

def compare_products(payload: ComparisonRequest) -> dict:
    items = []
    for product in payload.products:
        analysis = analyze_product(product) if payload.category == "skincare" else None
        items.append({
            "name": f"{product.brand} {product.name}",
            "price_eur": product.price_eur,
            "size_ml": product.size_ml,
            "price_per_10ml": round(product.price_eur / product.size_ml * 10, 2),
            "ingredient_count": len(product.ingredients),
            "rating": product.rating,
            "review_count": product.review_count,
            "ingredient_coverage": analysis.ingredient_coverage if analysis else None,
            "score": analysis.score if analysis else None,
            "verdict": analysis.verdict if analysis else "NOT SCORED",
            "warnings": analysis.warnings if analysis else ["Category-specific ingredient effectiveness has not been validated."],
        })
    cheapest = min(range(len(items)), key=lambda index: items[index]["price_per_10ml"])
    return {
        "category": payload.category,
        "products": items,
        "lowest_unit_price_index": cheapest,
        "lowest_unit_price_product": items[cheapest]["name"],
        "methodology": "Price per 10 ml is a unit-price comparison, not a quality ranking. Compare only similar products. Skincare scores use V1 heuristics; haircare and beauty efficacy scores are withheld pending validation.",
    }
