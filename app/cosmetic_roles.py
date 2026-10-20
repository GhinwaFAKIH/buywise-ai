"""Common cosmetic ingredient functions; not proof of product efficacy."""
from app.scoring import normalize

ROLES = {
    "glycerin": "Humectant",
    "panthenol": "Conditioning ingredient",
    "dimethicone": "Conditioning silicone",
    "behentrimonium chloride": "Hair conditioning agent",
    "cetearyl alcohol": "Fatty alcohol; texture and conditioning",
    "sodium laureth sulfate": "Cleansing surfactant",
    "cocamidopropyl betaine": "Cleansing surfactant",
    "hydrolyzed keratin": "Film-forming protein",
    "titanium dioxide": "Pigment or UV filter; context-dependent",
    "iron oxides": "Colorant",
    "mica": "Effect pigment",
    "silica": "Absorbent or texturizer",
    "tocopherol": "Antioxidant ingredient",
    "hyaluronic acid": "Humectant",
    "niacinamide": "Skin-conditioning ingredient",
    "fragrance": "Fragrance",
}

def describe_ingredients(ingredients: list[str]) -> dict:
    known = [{"ingredient": raw, "role": ROLES[normalize(raw)]}
             for raw in ingredients if normalize(raw) in ROLES]
    unknown = [raw for raw in ingredients if normalize(raw) not in ROLES]
    return {"recognized": known, "unrecognized": unknown,
            "coverage": round(len(known) / len(ingredients), 3) if ingredients else 0,
            "disclaimer": "Common ingredient roles do not establish concentration, effectiveness or personal suitability."}
