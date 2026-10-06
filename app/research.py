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
    queries = [(f'{identity} official ingredients claims', 'product_page'), (f'{identity} rating customer reviews avis note', 'product_page')]
    if ingredients:
        queries.append((' '.join(ingredients) + ' topical skin randomized controlled trial site:pubmed.ncbi.nlm.nih.gov OR site:pmc.ncbi.nlm.nih.gov', 'ingredient_study'))
    with ThreadPoolExecutor(max_workers=3) as pool:
        responses = list(pool.map(lambda args: search(*args, key), queries))
    sources = []
    seen = set()
    for found, _ in responses:
        for item in found:
            if item['url'] not in seen:
                sources.append(item)
                seen.add(item['url'])
    if sources:
        candidates = [item for item in sources if matching_product(product, item)][:3]
        with ThreadPoolExecutor(max_workers=3) as pool:
            fetched = list(pool.map(lambda item: fetch_review_page(item, key), candidates))
        by_url = {item['url']: item for item in fetched}
        sources = [by_url.get(item['url'], item) for item in sources]
        return sources, 'retrieved'
    statuses = [status for _, status in responses]
    return [], 'no_results' if all(s == 'searched' for s in statuses) else next(s for s in statuses if s != 'searched')


REVIEW_DOMAINS = {'theordinary.com','sephora.fr','sephora.com','boots.com','lookfantastic.fr','lookfantastic.com','theinkeylist.com','eu.theinkeylist.com','geekandgorgeous.fr','cultbeauty.com','notino.fr','douglas.fr','marionnaud.fr'}


def matching_product(product, source):
    host = urlsplit(source['url']).hostname.lower().removeprefix('www.')
    if source['category'] != 'product_page' or host not in REVIEW_DOMAINS:
        return False
    title = source['title'].lower()
    brand_words = [word for word in re.findall(r'[a-z]{3,}', product.brand.lower()) if word != 'the']
    words = re.findall(r'[a-z]{3,}', product.name.lower())[:2]
    if not brand_words or not words or not all(word in title for word in brand_words + words):
        return False
    # Exclude a different strength/version of the same ingredient serum.
    concentrations = re.findall(r'\d+(?:[.,]\d+)?\s*%', product.name)
    title_compact = re.sub(r'\s+', '', title)
    return all(re.search(r'(?<![\d.])' + re.escape(re.sub(r'\s+', '', strength).lower()), title_compact) for strength in concentrations)


def fetch_review_page(source, key):
    try:
        response = requests.post('https://ollama.com/api/web_fetch',
            headers={'Authorization': f'Bearer {key}'}, json={'url': source['url']}, timeout=(2, 7))
        response.raise_for_status()
        data = response.json()
        content = data.get('content')
        if not isinstance(content, str) or not content.strip():
            return {**source, 'page_status': 'empty'}
        # Preserve title identity from both search and fetched page for later matching.
        title = str(data.get('title') or source['title'])[:200]
        headings = list(re.finditer(r'customer reviews|ratings? and reviews|avis clients|évaluations et avis', content, re.I))
        windows = [content[max(0, match.start()-300):match.start()+4000] for match in headings[-2:]]
        return {**source, 'title': title, 'excerpt': content[:2200] + '\n' + '\n'.join(windows),
            'review_content': '\n'.join(windows), 'page_status': 'fetched'}
    except (requests.RequestException, ValueError, TypeError, AttributeError):
        return {**source, 'page_status': 'unavailable'}


def retrieve_reviews(product, sources):
    """Ratings remain per-site; never merge ratings or count unrelated products."""
    for source in sorted(sources, key=lambda item: item.get('page_status') != 'fetched'):
        if not matching_product(product, source):
            continue
        text = re.sub(r'[*_#]', '', source['excerpt'])
        rating = re.search(r'(?<![\d.])(\d(?:[.,]\d{1,2})?)\s*(?:out of\s*5|/\s*5|sur\s*5|stars|étoiles)', text, re.I)
        count = re.search(r'([\d][\d ,\u202f\u00a0]*)\s*(?:reviews|avis)\b', text, re.I)
        if not rating or not count:
            continue
        value = float(rating.group(1).replace(',', '.'))
        total = int(re.sub(r'\D', '', count.group(1)))
        if 0 <= value <= 5 and total > 0:
            review_text = source.get('review_content', '')
            paragraphs = re.split(r'\n\s*\n', review_text)
            excerpts = []
            for paragraph in paragraphs:
                plain = re.sub(r'[*_#]', '', paragraph).strip()
                if 8 <= len(plain.split()) <= 100 and not re.search(r'https?://|customer reviews|cookie|sign in|write a review', plain, re.I):
                    excerpts.append(' '.join(plain.split()[:25]))
                    if len(excerpts) == 2:
                        break
            return {'rating': value, 'review_count': total, 'source_url': source['url'],
                'source_title': source['title'], 'retrieved_at': source['retrieved_at'],
                'retrieval_method': 'product_page' if source.get('page_status') == 'fetched' else 'search_excerpt',
                'review_excerpts': excerpts}
    return None
