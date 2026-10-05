import re
from bs4 import BeautifulSoup

KNOWN_ACTIVES = {
    "niacinamide": "niacinamide",
    "acide hyaluronique": "hyaluronic acid",
    "hyaluronic acid": "hyaluronic acid",
    "vitamine c": "vitamin c",
    "vitamin c": "vitamin c",
    "rétinol": "retinol",
    "retinol": "retinol",
    "céramides": "ceramides",
    "ceramides": "ceramides",
    "acide salicylique": "salicylic acid",
    "salicylic acid": "salicylic acid",
    "acide azélaïque": "azelaic acid",
    "azelaic acid": "azelaic acid",
    "acide glycolique": "glycolic acid",
    "glycolic acid": "glycolic acid",
    "peptides": "peptides",
    "squalane": "squalane",
    "zinc": "zinc",
}

CLAIM_PATTERNS = {
    "supports hydration": ["hydrate", "hydratation", "hydratant", "hydrater"],
    "brightens skin": ["éclat", "illumine", "illuminant", "teint uniforme"],
    "supports skin barrier": ["barrière cutanée", "barriere cutanee"],
    "reduces appearance of fine lines": ["rides", "ridules", "anti-âge", "anti-age"],
    "improves skin texture": ["grain de peau", "texture", "lisse"],
}


def _clean(text: str) -> str:
    return " ".join(text.split())


def _extract_full_inci(soup: BeautifulSoup) -> list[str]:
    selectors = [
        '[data-comp*="ingredient" i]',
        '[class*="ingredient" i]',
        '[id*="ingredient" i]',
        '[data-testid*="ingredient" i]',
    ]

    candidates = []
    for selector in selectors:
        for node in soup.select(selector):
            text = _clean(node.get_text(" ", strip=True))
            if len(text) > 40:
                candidates.append(text)

    for text in sorted(candidates, key=len, reverse=True):
        lowered = text.lower()
        if "ingrédient" in lowered or "ingredient" in lowered or "," in text:
            text = re.sub(r"^.*?ingr[ée]dients?\s*:?", "", text, flags=re.I)
            parts = [p.strip(" .;:-") for p in re.split(r",|\n", text)]
            parts = [p for p in parts if 2 <= len(p) <= 80]
            if len(parts) >= 3:
                return parts[:80]
    return []


def _extract_known_actives(text: str) -> list[str]:
    lowered = text.lower()
    found = []
    for needle, normalized in KNOWN_ACTIVES.items():
        if needle in lowered and normalized not in found:
            found.append(normalized)
    return found


def _extract_claims(text: str) -> list[str]:
    lowered = text.lower()
    claims = []
    for normalized, patterns in CLAIM_PATTERNS.items():
        if any(pattern in lowered for pattern in patterns):
            claims.append(normalized)
    return claims


def enrich_sephora_fr(soup: BeautifulSoup, base: dict) -> dict:
    page_text = _clean(soup.get_text(" ", strip=True))
    description = base.get("description") or ""
    combined_text = f"{description} {page_text}"

    full_inci = _extract_full_inci(soup)
    ingredients = full_inci or _extract_known_actives(combined_text)
    claims = _extract_claims(combined_text)

    return {
        **base,
        "ingredients": ingredients,
        "claims": claims,
        "retailer": "sephora_fr",
        "ingredient_source": "full_inci" if full_inci else "detected_actives",
    }
