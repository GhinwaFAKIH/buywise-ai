from typing import List
from pydantic import BaseModel, Field, field_validator
import re


class ProductInput(BaseModel):
    name: str
    brand: str
    price_eur: float = Field(gt=0)
    size_ml: float = Field(gt=0)
    ingredients: List[str]
    @field_validator("ingredients", mode="before")
    @classmethod
    def split_ingredients(cls, value):
        items = [value] if isinstance(value, str) else value
        return [part.strip() for item in items for part in re.split(r"[,;\n]+|\.(?=\s|$)", item) if part.strip()]

    claims: List[str] = Field(default_factory=list)
    rating: float | None = Field(default=None, ge=0, le=5)
    review_count: int | None = Field(default=None, ge=0)


class ScoreBreakdown(BaseModel):
    ingredients: float | None
    evidence: float | None
    value: float
    reviews: float | None


class Alternative(BaseModel):
    name: str
    brand: str
    price_eur: float | None = None
    score: float | None = None
    size_ml: float | None = None
    price_per_10ml: float | None = None
    price_checked: str | None = None
    price_difference_percent: float | None = None
    url: str
    reason: str


class ProductAnalysis(BaseModel):
    product_name: str
    score: float | None
    confidence: str
    ingredient_coverage: float
    verdict: str
    price_per_10ml: float
    breakdown: ScoreBreakdown
    strengths: List[str]
    warnings: List[str]
    alternatives: List[Alternative]
    methodology: str
    ingredient_roles: list[dict] = Field(default_factory=list)
    recognition_coverage: float = 0
    ingredient_count: int = 0
    recognized_count: int = 0
    ai_report: dict | None = None
    ai_status: str = "not_configured"
