import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.extractor import ProductExtractionError, extract_product_from_url
from app.models import ProductInput, ProductAnalysis
from app.scoring import analyze_product
from app.ai_report import explain_product
from app.research import research_product, retrieve_reviews
from app.url_models import ExtractedProduct, ProductUrlInput, WaitlistInput

app = FastAPI(
    title="BuyWise AI API",
    description="Evidence-aware product scoring for smarter shopping decisions.",
    version="0.2.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "BuyWise AI",
        "message": "Paste a product URL or product data to start an analysis.",
        "version": "0.2.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractedProduct)
def extract(payload: ProductUrlInput):
    try:
        data = extract_product_from_url(str(payload.url))
        return ExtractedProduct(**data)
    except ProductExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/analyze", response_model=ProductAnalysis)
def analyze(product: ProductInput):
    sources, status = research_product(product)
    reviews = retrieve_reviews(product, sources)
    enriched = product
    if reviews and product.rating is None and product.review_count is None:
        enriched = product.model_copy(update={"rating": reviews["rating"], "review_count": reviews["review_count"]})
    analysis = analyze_product(enriched)
    analysis.research_sources = sources
    analysis.research_status = status
    analysis.retrieved_reviews = reviews
    analysis.ai_report, analysis.ai_status = explain_product(product, analysis)
    return analysis


@app.post("/waitlist")
def join_waitlist(payload: WaitlistInput):
    webhook_url = os.getenv("WAITLIST_WEBHOOK_URL")
    forwarded = False

    if webhook_url:
        try:
            import requests
            response = requests.post(
                webhook_url,
                json={"email": payload.email},
                timeout=10,
            )
            response.raise_for_status()
            forwarded = True
        except requests.RequestException:
            forwarded = False

    return {
        "ok": True,
        "message": "Thanks — you're on the BuyWise early-access list.",
        "forwarded": forwarded,
    }
