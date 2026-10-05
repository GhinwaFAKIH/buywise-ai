from typing import List
from pydantic import BaseModel, Field


class ProductInput(BaseModel):
    name: str
    brand: str
    price_eur: float = Field(gt=0)
    size_ml: float = Field(gt=0)
    ingredients: List[str]
    claims: List[str] = []
    rating: float | None = Field(default=None, ge=0, le=5)
    review_count: int | None = Field(default=None, ge=0)


class ScoreBreakdown(BaseModel):
    ingredients: float
    evidence: float
    value: float
    reviews: float


class Alternative(BaseModel):
    name: str
    brand: str
    price_eur: float
    score: float
    reason: str


class ProductAnalysis(BaseModel):
    product_name: str
    score: float
    verdict: str
    price_per_10ml: float
    breakdown: ScoreBreakdown
    strengths: List[str]
    warnings: List[str]
    alternatives: List[Alternative]
    methodology: str
