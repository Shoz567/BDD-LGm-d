"""
Scrape les prix sur techniciendesante.fr via Playwright (Chrome visible).
Version parallèle : N_WORKERS pages simultanées pour accélérer.
"""
import asyncio, json, re, sys, unicodedata
from playwright.async_api import async_playwright
from urllib.parse import quote

sys.stdout.reconfigure(encoding='utf-8')

JSON_FILE  = r"c:\Users\Utilisateur\Desktop\BDD7\Site\lib\catalogue.json"
N_WORKERS  = 3   # pages parallèles
SLEEP      = 0.5 # secondes entre requêtes par page

with open(JSON_FILE, encoding='utf-8') as f:
    products = json.load(f)

def slug_from_name(name: str) -> str:
    s = name.lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60]

def parse_price(text: str) -> float | None:
    text = text.strip().replace('\xa0', '').replace(' ', '')
    text = text.replace('€', '').replace('EUR', '')
    text = text.replace(',', '.')
    m = re.search(r'\d+\.?\d*', text)
    if m:
        try:
            return float(m.group())
        except ValueError:
            pass
    return None

def match_score(slug_a: str, slug_b: str) -> int:
    words_a = set(w for w in slug_a.split('-') if len(w) > 2)
    words_b = set(w for w in slug_b.split('-') if len(w) > 2)
    return len(words_a & words_b)

def best_match(ref_slug: str, pool: dict) -> tuple[str | None, int]:
    best_slug, best_score = None, 0
    for sl in pool:
        s = match_score(ref_slug, sl)
        if s > best_score:
            best_score = s
            best_slug = sl
    return best_slug, best_score

async def extract_prices(page, price_pool: dict):
    """Extrait (slug → prix) depuis la page courante et alimente le pool partagé."""
    try:
        items = await page.query_selector_all(
            'article.product-miniature, .product-miniature, li.product'
        )
        for item in items:
            name_el  = await item.query_selector('.product-title a, h3 a, .product-name a')
            price_el = await item.query_selector('.price, span[itemprop="price"], .product-price')
            if name_el and price_el:
                name  = await name_el.inner_text()
                price = parse_price(await price_el.inner_text())
                if price and price > 0.01:
                    price_pool[slug_from_name(name.strip())] = price
    except Exception:
        pass

    try:
        scripts = await page.query_selector_all('script[type="application/ld+json"]')
        for sc in scripts:
            txt = await sc.inner_text()
            if '"price"' not in txt and '"offers"' not in txt:
                continue
            try:
                data = json.loads(txt)
                for item in (data if isinstance(data, list) else [data]):
                    name   = item.get('name', '')
                    offers = item.get('offers', {})
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    price = offers.get('price') or item.get('price')
                    if name and price:
                        try:
                            price_pool[slug_from_name(str(name))] = float(str(price).replace(',', '.'))
                        except Exception:
                            pass
            except Exception:
                pass
    except Exception:
        pass

async def worker(wid: int, page, batch: list, price_pool: dict,
                 results: dict, total: int, counters: dict, lock: asyncio.Lock):
    for product in batch:
        ref      = product['reference']
        ref_slug = slug_from_name(product['nom'])

        # Chercher dans le pool partagé
        sl, score = best_match(ref_slug, price_pool)
        if sl and score >= 3:
            results[ref] = price_pool[sl]
            async with lock:
                counters['found'] += 1
                counters['i'] += 1
            continue

        # Recherche sur le site
        query = product['nom'][:50]
        try:
            await page.goto(
                f"https://www.techniciendesante.fr/recherche?s={quote(query)}",
                wait_until='networkidle', timeout=20000
            )
            await asyncio.sleep(SLEEP)
            await extract_prices(page, price_pool)
        except Exception:
            pass

        sl, score = best_match(ref_slug, price_pool)
        async with lock:
            if sl and score >= 3:
                results[ref] = price_pool[sl]
                counters['found'] += 1
            else:
                counters['not_found'] += 1
            counters['i'] += 1
            i = counters['i']

        if i % 50 == 0 or i == total:
            print(
                f"  {i}/{total} — W{wid} "
                f"Trouvés:{counters['found']} "
                f"NonTrouvés:{counters['not_found']} "
                f"Pool:{len(price_pool)}",
                flush=True
            )

async def main():
    to_scrape = products
    total     = len(to_scrape)
    print(f"{total} produits à scraper ({N_WORKERS} workers parallèles)\n")

    price_pool: dict[str, float] = {}
    results:    dict[str, float] = {}
    counters = {'found': 0, 'not_found': 0, 'i': 0}
    lock = asyncio.Lock()

    # Répartir en N batches
    chunk = (total + N_WORKERS - 1) // N_WORKERS
    batches = [to_scrape[i:i+chunk] for i in range(0, total, chunk)]

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)

        pages = []
        for _ in range(N_WORKERS):
            ctx = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                           'AppleWebKit/537.36 (KHTML, like Gecko) '
                           'Chrome/122.0.0.0 Safari/537.36'
            )
            pages.append(await ctx.new_page())

        # Initialisation simultanée sur toutes les pages
        print("Initialisation...", flush=True)
        await asyncio.gather(*[
            p.goto('https://www.techniciendesante.fr/',
                   wait_until='domcontentloaded', timeout=20000)
            for p in pages
        ])
        await asyncio.sleep(2)

        # Lancer les workers en parallèle
        await asyncio.gather(*[
            worker(i, pages[i], batches[i], price_pool, results, total, counters, lock)
            for i in range(N_WORKERS)
        ])

        await browser.close()

    # Mise à jour du JSON
    updated = 0
    for p in products:
        ref = p['reference']
        if ref in results and results[ref] > 0.01:
            p['prixTTC'] = results[ref]
            updated += 1

    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*55}")
    print(f"  Prix trouvés    : {counters['found']}")
    print(f"  Non trouvés     : {counters['not_found']}")
    print(f"  JSON mis à jour : {updated} produits")
    print(f"{'='*55}")

asyncio.run(main())
