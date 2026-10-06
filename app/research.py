"""Retrieve missing product information with the existing hosted Ollama key."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import os
import re
from urllib.parse import urlsplit
import requests


def safe_url(value):
    try:
        parsed = urlsplit(value)
        return parsed.scheme == 'https' and bool(parsed.hostname) and not parsed.username and not parsed.password
    except (ValueError, TypeError):
        return False


def search(query, category, key):
    try:
        response = requests.post('https://ollama.com/api/web_search',
            headers={'Authorization': f'Bearer {key}'},
            json={'query': query, 'max_results': 3}, timeout=(3, 8))
        response.raise_for_status()
        sources = []
        for item in response.json().get('results', []):
            if not safe_url(item.get('url', '')) or not isinstance(item.get('content'), str):
                continue
            # Studies are deliberately restricted to original publications/indexes.
            host = urlsplit(item['url']).hostname.lower()
            if category == 'ingredient_study' and not (host == 'pubmed.ncbi.nlm.nih.gov' or host == 'pmc.ncbi.nlm.nih.gov'):
                continue
            sources.append({'title': str(item.get('title', 'Source'))[:200],
                'url': item['url'], 'excerpt': item['content'][:2400], 'category': category,
                'retrieved_at': datetime.now(timezone.utc).date().isoformat()})
        return sources, 'searched'
    except requests.Timeout:
        return [], 'timeout'
    except requests.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else 0
        return [], {401:'authentication_failed',403:'access_denied',429:'usage_limit'}.get(status,'search_unavailable')
    except (requests.RequestException, ValueError, TypeError, AttributeError):
        return [], 'search_unavailable'


def research_product(product):
    key = os.getenv('OLLAMA_API_KEY', '').strip()
    if not key:
        return [], 'not_configured'
    # Product text stays bounded and is used only as a search query, not instructions.
    identity = f'{product.brand[:100]} {product.name[:180]}'
    ingredients = [name for name in product.ingredients if name.lower().strip() in
        {'niacinamide','retinol','hyaluronic acid','ascorbic acid','zinc pca','salicylic acid'}][:2]
    queries = [(f'"{identity}" official ingredients claims rating reviews', 'product_page')]
    if ingredients:
        queries.append((' '.join(ingredients) + ' topical skin randomized controlled trial site:pubmed.ncbi.nlm.nih.gov OR site:pmc.ncbi.nlm.nih.gov', 'ingredient_study'))
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda args: search(*args, key), queries))
    sources = []
    seen = set()
    for found, _ in responses:
        for item in found:
            if item['url'] not in seen:
                sources.append(item)
                seen.add(item['url'])
    if sources:
        return sources, 'retrieved'
    statuses = [status for _, status in responses]
    return [], 'no_results' if all(s == 'searched' for s in statuses) else next(s for s in statuses if s != 'searched')


def retrieve_reviews(product, sources):
    """Only parse explicit rating/count pairs from matching trusted product results."""
    brand_words = re.findall(r'[a-z]{3,}', product.brand.lower())
    product_words = re.findall(r'[a-z]{3,}', product.name.lower())[:2]
    allowed = {'theordinary.com','sephora.fr','sephora.com','boots.com','lookfantastic.fr','lookfantastic.com','theinkeylist.com','eu.theinkeylist.com','geekandgorgeous.fr','www.geekandgorgeous.fr'}
    for source in sources:
        host = urlsplit(source['url']).hostname.lower().removeprefix('www.')
        title = source['title'].lower()
        if source['category'] != 'product_page' or host not in allowed:
            continue
        if not brand_words or not product_words or not all(word in title for word in brand_words + product_words):
            continue
        text = source['excerpt']
        rating = re.search(r'(\d[.,]\d)\s*(?:out of\s*5|/\s*5|sur\s*5|stars|étoiles)', text, re.I)
        count = re.search(r'([\d][\d ,\u202f\u00a0]*)\s*(?:reviews|avis)\b', text, re.I)
        if not rating or not count:
            continue
        value = float(rating.group(1).replace(',', '.'))
        total = int(re.sub(r'\D', '', count.group(1)))
        if 0 <= value <= 5 and total > 0:
            return {'rating': value, 'review_count': total, 'source_url': source['url'], 'source_title': source['title']}
    return None
