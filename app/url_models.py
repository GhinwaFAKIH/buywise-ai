from pydantic import BaseModel, HttpUrl


class ProductUrlInput(BaseModel):
    url: HttpUrl


class ExtractedProduct(BaseModel):
    url: str
    domain: str
    name: str | None = None
    brand: str | None = None
    description: str = ""
    price: float | None = None
    currency: str | None = None
    size_ml: float | None = None
    rating: float | None = None
    review_count: int | None = None
    image: str | None = None
    sku: str | None = None
    raw_has_product_jsonld: bool = False
