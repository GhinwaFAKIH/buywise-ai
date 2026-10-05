from statistics import mean

from app.data import INGREDIENTS, SUPPORTED_CLAIMS, ALTERNATIVE_CATALOG
from app.models import (
    Alternative,
    ProductAnalysis,
    ProductInput,
    ScoreBreakdown,
)


def normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())


def score_ingredients(product: ProductInput) -> tuple[float, list[str], list[str]]:
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
        return 55.0, strengths, ["Most ingredients are not yet covered by the V1 knowledge base."]

    return round(mean(known_scores) * 10, 1), strengths, warnings


def score_claims(product: ProductInput) -> tuple[float, list[str]]:
    if not product.claims:
        return 60.0, ["No marketing claims were provided for evidence checking."]

    scores = []
    warnings = []

    for claim in product.claims:
        normalized = normalize(claim)
        support = SUPPORTED_CLAIMS.get(normalized)

        if support is None:
            scores.append(0.55)
            warnings.append(f'Claim needs deeper evidence review: "{claim}".')
        else:
            scores.append(support)

    return round(mean(scores) * 100, 1), warnings


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


def score_reviews(product: ProductInput) -> float:
    if product.rating is None:
        return 60.0

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


def find_alternatives(product: ProductInput, final_score: float) -> list[Alternative]:
    product_ingredients = {normalize(i) for i in product.ingredients}
    alternatives = []

    for item in ALTERNATIVE_CATALOG:
        overlap = product_ingredients.intersection(item["ingredients"])

        if not overlap:
            continue

        if item["price_eur"] >= product.price_eur and item["base_score"] <= final_score:
            continue

        alternatives.append(
            Alternative(
                name=item["name"],
                brand=item["brand"],
                price_eur=item["price_eur"],
                score=item["base_score"],
                reason=(
                    f"Shares {', '.join(sorted(overlap))} and offers stronger value "
                    f"at €{item['price_eur']:.2f}."
                ),
            )
        )

    return sorted(alternatives, key=lambda x: (-x.score, x.price_eur))[:3]


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

    final_score = round(
        ingredient_score * 0.35
        + evidence_score * 0.30
        + value_score * 0.20
        + review_score * 0.15,
        1,
    )

    warnings = ingredient_warnings + claim_warnings

    if value_score < 55:
        warnings.append("The product is expensive relative to its size.")

    if review_score >= 80:
        strengths.append("Customer feedback is strong relative to the available review volume.")

    return ProductAnalysis(
        product_name=f"{product.brand} {product.name}",
        score=final_score,
        verdict=verdict_for(final_score),
        price_per_10ml=price_per_10ml,
        breakdown=ScoreBreakdown(
            ingredients=ingredient_score,
            evidence=evidence_score,
            value=value_score,
            reviews=review_score,
        ),
        strengths=strengths[:6],
        warnings=warnings[:6],
        alternatives=find_alternatives(product, final_score),
        methodology=(
            "Score = ingredients 35% + evidence 30% + value 20% + reviews 15%. "
            "The V1 score is deterministic; generative AI should explain the result, not invent it."
        ),
    )
