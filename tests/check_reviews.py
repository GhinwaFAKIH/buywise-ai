from unittest.mock import patch,Mock
from app.models import ProductInput
from app.research import matching_product,fetch_review_page,retrieve_reviews,research_product
import requests,os
p=ProductInput(name='Niacinamide 10% + Zinc 1%',brand='The Ordinary',price_eur=7.95,size_ml=30,ingredients=['niacinamide'])
s={'title':'The Ordinary Niacinamide 10% + Zinc 1%','url':'https://theordinary.com/serum','category':'product_page','excerpt':'No rating here','retrieved_at':'2026-10-06'}
assert matching_product(p,s)
assert not matching_product(p,{**s,'title':'The Ordinary Niacinamide 20% + Zinc 1%'})
assert not matching_product(p,{**s,'title':'The Ordinary Niacinamide 110% + Zinc 11%'})
response=Mock();response.json.return_value={'title':s['title'],'content':'Product details\n\nCustomer Reviews\n\nRated 4.4 out of 5 stars\n\n1,234 reviews\n\nI liked the texture and it was easy to apply each morning.\n\nIt took time to see changes but I liked using this serum.'}
with patch('app.research.requests.post',return_value=response):
    source=fetch_review_page(s,'test')
r=retrieve_reviews(p,[source])
assert r['rating']==4.4 and r['review_count']==1234 and r['retrieval_method']=='product_page'
assert len(r['review_excerpts'])==2
assert retrieve_reviews(p,[{**source,'title':'Another product'}]) is None
with patch('app.research.requests.post',side_effect=requests.Timeout):
    assert fetch_review_page(s,'test')['page_status']=='unavailable'
print('PASS: fetched ratings/counts, review samples, wrong concentrations, wrong products and blocked-page fallback')
