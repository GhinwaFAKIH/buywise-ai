import json
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/153.0.0.0 Safari/537.36"
)


class ProductExtractionError(Exception):
    pass


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(str(value).replace(",", ".").strip())
    except (TypeError, ValueError):
        return None


def _flatten_jsonld(value: Any) -> list[dict]:
    items = []

    if isinstance(value, dict):
        if "@graph" in value and isinstance(value["@graph"], list):
            for item in value["@graph"]:
                items.extend(_flatten_jsonld(item))
        else:
            items.append(value)

    elif isinstance(value, list):
        for item in value:
            items.extend(_flatten_jsonld(item))

    return items


def _find_product_jsonld(soup: BeautifulSoup) -> dict | None:
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = tag.string or tag.get_text(strip=True)
        if not raw:
            continue

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            continue

        for item in _flatten_jsonld(parsed):
            item_type = item.get("@type")
            if item_type == "Product" or (
                isinstance(item_type, list) and "Product" in item_type
            ):
                return item

    return None


def _extract_offer(product: dict) -> tuple[float | None, str | None]:
    offers = product.get("offers")

    if isinstance(offers, list) and offers:
        offers = offers[0]

    if not isinstance(offers, dict):
        return None, None

    price = _safe_float(offers.get("price") or offers.get("lowPrice"))
    currency = offers.get("priceCurrency")
    return price, currency


def _extract_rating(product: dict) -> tuple[float | None, int | None]:
    rating = product.get("aggregateRating")

    if not isinstance(rating, dict):
        return None, None

    rating_value = _safe_float(rating.get("ratingValue"))

    review_count = rating.get("reviewCount") or rating.get("ratingCount")
    try:
        review_count = int(review_count) if review_count is not None else None
    except (TypeError, ValueError):
        review_count = None

    return rating_value, review_count


def _meta_content(soup: BeautifulSoup, *names: str) -> str | None:
    for name in names:
        tag = soup.find("meta", attrs={"property": name}) or soup.find(
            "meta", attrs={"name": name}
        )
        if tag and tag.get("content"):
            return tag["content"].strip()
    return None


def _extract_size_ml(text: str | None) -> float | None:
    if not text:
        return None

    import re

    match = re.search(r"(\d+(?:[\.,]\d+)?)\s*ml\b", text, flags=re.I)
    if not match:
        return None

    return _safe_float(match.group(1))


def extract_product_from_url(url: str) -> dict:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise ProductExtractionError("Please provide a valid http(s) product URL.")

    try:
        response = requests.get(
            url,
            timeout=15,
            headers={
                "User-Agent": USER_AGENT,
                "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
            },
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise ProductExtractionError(
            "Could not download this product page. The retailer may block automated access."
        ) from exc

    soup = BeautifulSoup(response.text, "html.parser")
    product = _find_product_jsonld(soup) or {}

    name = product.get("name") or _meta_content(
        soup, "og:title", "twitter:title"
    )

    brand = product.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name")

    if not brand:
        brand = product.get("manufacturer")
        if isinstance(brand, dict):
            brand = brand.get("name")

    description = (
        product.get("description")
        or _meta_content(soup, "og:description", "description")
        or ""
    )

    price, currency = _extract_offer(product)
    if price is None:
        price = _safe_float(
            _meta_content(
                soup,
                "product:price:amount",
                "og:price:amount",
            )
        )

    if not currency:
        currency = _meta_content(
            soup,
            "product:price:currency",
            "og:price:currency",
        )

    rating, review_count = _extract_rating(product)

    image = product.get("image")
    if isinstance(image, list):
        image = image[0] if image else None
    elif isinstance(image, dict):
        image = image.get("url")

    if not image:
        image = _meta_content(soup, "og:image", "twitter:image")

    sku = product.get("sku")
    size_ml = _extract_size_ml(name) or _extract_size_ml(description)

    return {
        "url": url,
        "domain": parsed.netloc,
        "name": name,
        "brand": brand,
        "description": description,
        "price": price,
        "currency": currency,
        "size_ml": size_ml,
        "rating": rating,
        "review_count": review_count,
        "image": image,
        "sku": sku,
        "raw_has_product_jsonld": bool(product),
    }
