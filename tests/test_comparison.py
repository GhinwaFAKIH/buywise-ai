import pytest
from pydantic import ValidationError
from app.comparison import ComparisonRequest, compare_products

def product(name, price, size=100):
    return {"name": name, "brand": "Test", "price_eur": price, "size_ml": size, "ingredients": []}

@pytest.mark.parametrize("category", ["skincare", "haircare", "beauty"])
def test_comparison_categories(category):
    result = compare_products(ComparisonRequest(category=category, products=[product("A", 10), product("B", 20)]))
    assert result["category"] == category
    assert result["lowest_unit_price_index"] == 0
    assert result["products"][0]["price_per_10ml"] == 1.0

def test_duplicate_products_rejected():
    with pytest.raises(ValidationError):
        ComparisonRequest(category="haircare", products=[product("A", 10), product("A", 20)])

def test_one_product_rejected():
    with pytest.raises(ValidationError):
        ComparisonRequest(category="beauty", products=[product("A", 10)])

def test_four_products_rejected():
    with pytest.raises(ValidationError):
        ComparisonRequest(category="beauty", products=[product(str(i), 10) for i in range(4)])

def test_haircare_not_given_skincare_score():
    result = compare_products(ComparisonRequest(category="haircare", products=[product("Shampoo", 10), product("Conditioner", 12)]))
    assert all(item["score"] is None for item in result["products"])
