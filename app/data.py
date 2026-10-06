INGREDIENTS = {
    "niacinamide": {
        "score": 9.0,
        "benefits": ["skin barrier support", "oil regulation", "appearance of uneven tone"],
        "evidence": "strong",
        "warning": None,
    },
    "hyaluronic acid": {
        "score": 8.5,
        "benefits": ["hydration", "skin plumping"],
        "evidence": "strong",
        "warning": None,
    },
    "vitamin c": {
        "score": 8.5,
        "benefits": ["antioxidant support", "appearance of uneven tone"],
        "evidence": "moderate",
        "warning": "Stability depends heavily on formulation and packaging.",
    },
    "retinol": {
        "score": 9.0,
        "benefits": ["appearance of fine lines", "skin texture"],
        "evidence": "strong",
        "warning": "Can cause irritation and requires careful introduction.",
    },
    "ceramides": {
        "score": 9.0,
        "benefits": ["skin barrier support", "moisture retention"],
        "evidence": "strong",
        "warning": None,
    },
    "fragrance": {
        "score": 4.0,
        "benefits": [],
        "evidence": "low",
        "warning": "May be irritating for fragrance-sensitive users.",
    },
    "denatured alcohol": {
        "score": 4.5,
        "benefits": ["lightweight texture"],
        "evidence": "context-dependent",
        "warning": "May be drying or irritating depending on concentration and formulation.",
    },
}

SUPPORTED_CLAIMS = {
    "brightens skin": 0.80,
    "supports hydration": 0.90,
    "supports skin barrier": 0.90,
    "reduces appearance of fine lines": 0.80,
    "improves skin texture": 0.80,
}

ALTERNATIVE_CATALOG = [
    {
        "name": "Barrier Balance Serum",
        "brand": "Demo Lab",
        "price_eur": 18.0,
        "size_ml": 30,
        "ingredients": ["niacinamide", "ceramides", "hyaluronic acid"],
        "base_score": 88.0,
    },
    {
        "name": "Simple Hydration Serum",
        "brand": "Clear Formula",
        "price_eur": 14.0,
        "size_ml": 30,
        "ingredients": ["hyaluronic acid", "niacinamide"],
        "base_score": 83.0,
    },
    {
        "name": "Vitamin C Daily Serum",
        "brand": "Evidence Skin",
        "price_eur": 22.0,
        "size_ml": 30,
        "ingredients": ["vitamin c", "hyaluronic acid"],
        "base_score": 85.0,
    },
]

# Manufacturer-listed comparison products, checked 2026-10-06. No efficacy ranking.
VERIFIED_ALTERNATIVES = [
    {"brand": "Geek & Gorgeous", "name": "B-Bomb", "price_eur": 8.50, "size_ml": 30, "price_checked": "2026-10-06", "ingredients": ["niacinamide", "zinc pca"], "url": "https://www.geekandgorgeous.fr/products/b-bomb", "reason": "Manufacturer lists 10% niacinamide and Zinc PCA. Compare its full formula and current price."},
    {"brand": "The INKEY List", "name": "10% Niacinamide Serum", "price_eur": 10.00, "size_ml": 30, "price_checked": "2026-10-06", "ingredients": ["niacinamide", "hyaluronic acid"], "url": "https://eu.theinkeylist.com/products/niacinamide-serum", "reason": "Manufacturer lists 10% niacinamide and hyaluronic acid. Compare its full formula and current price."},
]

# General formulation roles; deliberately separate from efficacy scoring.
INGREDIENT_ROLES = {
    "aqua": {"role": "Water-based solvent", "source": "https://www.evonik.com/content/dam/evonik/documents/GF_two_phase_primer_spray_with_SPHERILEX_10_PC_and_AEROSIL_200_EN_Asset_2032725.pdf"},
    "niacinamide": {"role": "Skin-conditioning ingredient; commonly used in oil-control serums", "source": "https://theordinary.com/fr-fr/niacinamide-10-zinc-1-serum-100436.html"},
    "pentylene glycol": {"role": "Multifunctional formula additive; supports preservation", "source": "https://www.evonik.com/en/products/cs/pr_52045017.html"},
    "zinc pca": {"role": "Skin-conditioning ingredient marketed for oil control", "source": "https://www.solabia.com/cosmetics/product/zincidone/"},
    "dimethyl isosorbide": {"role": "Solvent for other formula ingredients", "source": "https://www.crodabeauty.com/en-gb/products/product/714-arlasolve_1_dmi"},
    "tamarindus indica seed gum": {"role": "Plant-derived gum used in cosmetic formulations", "source": "https://pubchem.ncbi.nlm.nih.gov/compound/Tamarindus%20Indica%20Seed%20Gum"},
    "xanthan gum": {"role": "Gum used to structure the formula", "source": "https://www.cir-safety.org/supplementaldoc/safety-assessment-microbial-polysaccharide-gums-used-cosmetics"},
    "isoceteth-20": {"role": "Surfactant; helps ingredients mix", "source": "https://pubchem.ncbi.nlm.nih.gov/compound/Isoceteth-20"},
    "ethoxydiglycol": {"role": "Solvent and solubilizer", "source": "https://www.gattefosse.com/pharmaceuticals/product-finder/transcutol-hp"},
    "phenoxyethanol": {"role": "Preservative", "source": "https://health.ec.europa.eu/publications/phenoxyethanol_en"},
    "chlorphenesin": {"role": "Preservative", "source": "https://cir-safety.org/sites/default/files/Chlorp092012rep.pdf"},
}
