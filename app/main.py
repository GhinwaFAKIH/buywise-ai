from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import ProductInput, ProductAnalysis
from app.scoring import analyze_product

app = FastAPI(
    title="BuyWise AI API",
    description="Evidence-aware product scoring for smarter shopping decisions.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "BuyWise AI",
        "message": "Paste product data, get a transparent value assessment.",
        "version": "0.1.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=ProductAnalysis)
def analyze(product: ProductInput):
    return analyze_product(product)
