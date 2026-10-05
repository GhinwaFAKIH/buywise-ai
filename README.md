# BuyWise AI

BuyWise AI is an AI-assisted shopping platform that helps users decide whether a skincare product is actually worth buying.

## V1 features

- Analyze skincare products from structured product data
- Score ingredients, evidence, value for money, and reviews
- Return a verdict: `WORTH IT`, `MAYBE`, or `SKIP`
- Highlight strengths and warnings
- Recommend better-value alternatives from a local catalog
- Keep scoring deterministic so generative AI can explain results without inventing the score

## Architecture

```text
Product data
    ↓
Ingredient knowledge base
    ↓
Claim / evidence checks
    ↓
Value + review scoring
    ↓
Deterministic BuyWise score
    ↓
Verdict + explanation + alternatives
```

## Tech stack

- Python 3.11+
- FastAPI
- Pydantic
- Uvicorn
- RDFLib-ready architecture for the semantic layer

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:

- API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

## Example request

POST `/analyze`

```json
{
  "name": "Glow Serum",
  "brand": "Demo Beauty",
  "price_eur": 39.0,
  "size_ml": 30,
  "ingredients": ["niacinamide", "hyaluronic acid", "fragrance"],
  "claims": ["brightens skin", "supports hydration"],
  "rating": 4.4,
  "review_count": 1250
}
```

## Roadmap

1. Add URL extraction for selected retailers
2. Add RDF knowledge graph for ingredients, benefits, and evidence
3. Add claim-evidence retrieval
4. Add product-vs-product comparison
5. Add affiliate-ready alternative links
6. Build a polished Next.js frontend
7. Add accounts and premium features only after validating demand

## Disclaimer

BuyWise AI is an informational shopping assistant and is not medical or dermatological advice.
