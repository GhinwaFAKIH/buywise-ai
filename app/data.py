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
