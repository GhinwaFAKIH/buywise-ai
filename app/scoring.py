from statistics import mean
import re

from app.data import INGREDIENTS, SUPPORTED_CLAIMS, ALTERNATIVE_CATALOG, VERIFIED_ALTERNATIVES, INGREDIENT_ROLES
from app.models import (
    Alternative,
    ProductAnalysis,
    ProductInput,
    ScoreBreakdown,
)


def normalize(text: str) -> str:
    value = " ".join(text.lower().strip().split())
    value = re.sub(r"\s*\([^)]*\)", "", value).strip()
    value = re.sub(r"\s+\d+(?:\.\d+)?%$", "", value)
    return {"water": "aqua", "eau": "aqua", "water/aqua/eau": "aqua", "parfum": "fragrance", "alcohol denat.": "denatured alcohol", "alcohol denat": "denatured alcohol", "sodium hyaluronate": "hyaluronic acid", "ascorbic acid": "vitamin c"}.get(value, value)


def score_ingredients(product: ProductInput) -> tuple[float | None, list[str], list[str]]:
    known_scores = []
    strengths = []
    warnings = []

    for raw in product.ingredients:
        ingredient = normalize(raw)
        info = INGREDIENTS.get(ingredient)
        if not info:
            continue

        known_scores.append(info["score"])

        if info["score"] >= 8:
            strengths.append(
                f"{raw.title()} has good support for {', '.join(info['benefits'])}."
            )

        if info["warning"]:
            warnings.append(f"{raw.title()}: {info['warning']}")

    if not known_scores:
        return None, strengths, ["Most ingredients are not yet covered by the V1 knowledge base."]

    return round(mean(known_scores) * 10, 1), strengths, warnings


def score_claims(product: ProductInput) -> tuple[float | None, list[str]]:
    if not product.claims:
        return None, ["No marketing claims were provided for evidence checking."]

    scores = []
    warnings = []

    for claim in product.claims:
        normalized = normalize(claim)
        support = SUPPORTED_CLAIMS.get(normalized)

        if support is None:
            warnings.append(f'Claim needs deeper evidence review: "{claim}".')
        else:
            scores.append(support)

    return (round(mean(scores) * 100, 1) if scores else None), warnings


def score_value(product: ProductInput) -> tuple[float, float]:
    price_per_10ml = product.price_eur / product.size_ml * 10

    if price_per_10ml <= 5:
        score = 95
    elif price_per_10ml <= 8:
        score = 85
    elif price_per_10ml <= 12:
        score = 75
    elif price_per_10ml <= 18:
        score = 62
    elif price_per_10ml <= 25:
        score = 50
    else:
        score = 38

    return float(score), round(price_per_10ml, 2)


def score_reviews(product: ProductInput) -> float | None:
    if product.rating is None or not product.review_count:
        return None

    rating_component = product.rating / 5 * 100

    if not product.review_count:
        confidence = 0.75
    elif product.review_count >= 1000:
        confidence = 1.0
    elif product.review_count >= 250:
        confidence = 0.95
    elif product.review_count >= 50:
        confidence = 0.85
    else:
        confidence = 0.75

    return round(rating_component * confidence + 60 * (1 - confidence), 1)


def find_alternatives(product: ProductInput) -> list[Alternative]:
    ingredients = {normalize(i) for i in product.ingredients}
    return [Alternative(name=item["name"], brand=item["brand"], url=item["url"], reason=item["reason"], price_eur=item["price_eur"], size_ml=item["size_ml"], price_checked=item["price_checked"], price_per_10ml=round(item["price_eur"] / item["size_ml"] * 10, 2), price_difference_percent=round((item["price_eur"] / item["size_ml"] / (product.price_eur / product.size_ml) - 1) * 100, 1))
            for item in VERIFIED_ALTERNATIVES
            if ingredients.intersection(item["ingredients"]) and normalize(item["brand"]) != normalize(product.brand)][:2]


def verdict_for(score: float) -> str:
    if score >= 80:
        return "WORTH IT"
    if score >= 60:
        return "MAYBE"
    return "SKIP"


def analyze_product(product: ProductInput) -> ProductAnalysis:
    ingredient_score, strengths, ingredient_warnings = score_ingredients(product)
    evidence_score, claim_warnings = score_claims(product)
    value_score, price_per_10ml = score_value(product)
    review_score = score_reviews(product)

    coverage = sum(normalize(i) in INGREDIENTS for i in product.ingredients) / max(1, len(product.ingredients))
    complete = coverage >= 0.8 and ingredient_score is not None and bool(product.claims) and all(normalize(c) in SUPPORTED_CLAIMS for c in product.claims) and evidence_score is not None and review_score is not None
    final_score = round(ingredient_score * 0.35 + evidence_score * 0.30 + value_score * 0.20 + review_score * 0.15, 1) if complete else None

    warnings = ingredient_warnings + claim_warnings
    if coverage < 0.8:
        warnings.append(f"Only {coverage:.0%} of entered ingredients are recognized; this is not a full formulation assessment.")
    if review_score is None:
        warnings.append("Rating and a positive review count are required to assess reviews.")
    if not complete:
        warnings.append("Insufficient information for an overall score or buying verdict.")

    if value_score < 55:
        warnings.append("The product is expensive relative to its size.")

    if review_score is not None and review_score >= 80:
        strengths.append("Customer feedback is strong relative to the available review volume.")

    return ProductAnalysis(
        ingredient_roles=[{"ingredient": raw, **INGREDIENT_ROLES[normalize(raw)]} for raw in product.ingredients if normalize(raw) in INGREDIENT_ROLES],
        recognition_coverage=round(sum(normalize(i) in INGREDIENT_ROLES or normalize(i) in INGREDIENTS for i in product.ingredients) / max(1, len(product.ingredients)), 3),
        ingredient_count=len(product.ingredients),
        recognized_count=sum(normalize(i) in INGREDIENT_ROLES or normalize(i) in INGREDIENTS for i in product.ingredients),
        product_name=f"{product.brand} {product.name}",
        score=final_score,
        verdict=verdict_for(final_score) if complete else "INSUFFICIENT INFORMATION",
        confidence="Moderate" if complete else "Low",
        ingredient_coverage=round(coverage, 3),
        price_per_10ml=price_per_10ml,
        breakdown=ScoreBreakdown(
            ingredients=ingredient_score,
            evidence=evidence_score,
            value=value_score,
            reviews=review_score,
        ),
        strengths=strengths[:6],
        warnings=warnings[:6],
        alternatives=find_alternatives(product),
        methodology=(
            "Score = ingredients 35% + evidence 30% + value 20% + reviews 15%. "
            "Overall scoring requires 80% ingredient coverage, recognized claims and review data. Missing data gets no default score. Data confidence is not clinical certainty. These scores are V1 heuristics, not verified product-level evidence."
        ),
    )
