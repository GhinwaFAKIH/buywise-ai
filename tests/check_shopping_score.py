"""Run with PYTHONPATH=. python tests/check_shopping_score.py."""
from app.models import ProductInput
from app.scoring import analyze_product

p=ProductInput(name='Niacinamide 10% + Zinc 1%',brand='The Ordinary',price_eur=7.95,size_ml=30,ingredients=['Niacinamide'],rating=4.47,review_count=15)
r=analyze_product(p)
s=r.shopping_assessment
assert s['score']==92.8 and s['provisional']
assert s['verdict']=='WORTH CONSIDERING'
assert len(r.alternatives)==2 and all(x.url.startswith('https://') for x in r.alternatives)
missing=analyze_product(p.model_copy(update={'rating':None,'review_count':None})).shopping_assessment
assert missing['score']==95 and missing['verdict']=='PRICE CHECK ONLY'
assert 'Customer rating' not in missing['components']
expensive=analyze_product(p.model_copy(update={'price_eur':70})).shopping_assessment
assert expensive['score']<s['score'] and expensive['verdict']=='LOOK AT ALTERNATIVES'
zero=analyze_product(p.model_copy(update={'rating':0,'review_count':100})).shopping_assessment
assert zero['components']['Customer rating']==0
assert analyze_product(p.model_copy(update={'review_count':0})).shopping_assessment['basis'].startswith('Price only')
assert r.score is None, 'Shopping score must not be substituted for an efficacy assessment'
print('PASS: shopping score, missing reviews, zero ratings, price sensitivity and comparison links')
