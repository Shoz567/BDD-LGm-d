"""
Stratégie : visiter les pages de résultats de recherche avec Playwright,
intercepter les images qui se chargent (IDs actuels), télécharger via requests.
Les images chargées par le navigateur ont les bons IDs et sont accessibles.
"""
import asyncio, csv, json, os, sys, re, requests
from pathlib import Path
from playwright.async_api import async_playwright
from urllib.parse import quote

sys.stdout.reconfigure(encoding='utf-8')

JSON_FILE  = r"c:\Users\Utilisateur\Desktop\BDD7\Site\lib\catalogue.json"
OUTPUT_DIR = r"c:\Users\Utilisateur\Desktop\BDD7\Site\public\images\products"
CSV_FILE   = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
BATCH      = 6   # Produits par page de recherche (multi-mots)

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(JSON_FILE, encoding='utf-8') as f:
    products = json.load(f)

# Produits sans image locale
need_image = [p for p in products if not (p.get('imageUrl') or '').startswith('/images/')]
print(f"{len(need_image)} produits sans image\n")

# Session requests pour télécharger les images capturées
dl_session = requests.Session()
dl_session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

def download_image(url: str, ref: str) -> str | None:
    """Télécharge une image depuis une URL accessible."""
    ext = url.rsplit('.', 1)[-1].split('?')[0][:4] or 'jpg'
    filename = f"{ref.replace('/', '_').replace(' ', '_')}.{ext}"
    dest = Path(OUTPUT_DIR) / filename
    if dest.exists() and dest.stat().st_size > 500:
        return f'/images/products/{filename}'
    try:
        r = dl_session.get(url, timeout=15)
        if r.status_code == 200 and len(r.content) > 500:
            dest.write_bytes(r.content)
            return f'/images/products/{filename}'
    except Exception:
        pass
    return None

def slug_from_url(url: str) -> str:
    """Extrait le slug du nom produit depuis l'URL image."""
    # ex: /4096830-home_default/ceinture-de-transfert-ready-belt-s.jpg
    match = re.search(r'\d+-(?:home|large|medium)_default/(.+?)\.', url)
    return match.group(1) if match else ''

def slug_from_name(name: str) -> str:
    """Génère un slug depuis un nom produit."""
    import unicodedata
    s = name.lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60]

def match_score(slug_a: str, slug_b: str) -> int:
    """Score de similarité entre deux slugs."""
    words_a = set(slug_a.split('-'))
    words_b = set(slug_b.split('-'))
    common = words_a & words_b
    return len(common)

async def scrape_batch(page, batch_products: list, intercepted: dict):
    """Recherche un batch et capture les images interceptées."""
    # Construire une query de recherche avec le premier produit du batch
    query = batch_products[0]['nom'][:40]
    url = f"https://www.techniciendesante.fr/recherche?s={quote(query)}"

    try:
        await page.goto(url, wait_until='networkidle', timeout=25000)
        await asyncio.sleep(1.5)
    except Exception:
        pass

async def main():
    ok = skip = nomatch = 0
    results = {}

    # Slugs de référence pour chaque produit
    ref_slugs = {p['reference']: slug_from_name(p['nom']) for p in need_image}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )
        page = await context.new_page()

        # Pool d'images capturées
        intercepted_pool: dict[str, str] = {}  # slug -> url

        async def on_response(response):
            if response.status == 200:
                ct = response.headers.get('content-type', '')
                if 'image' in ct and ('large_default' in response.url or 'home_default' in response.url):
                    slug = slug_from_url(response.url)
                    if slug and slug not in intercepted_pool:
                        intercepted_pool[slug] = response.url

        page.on('response', on_response)

        # Visite homepage pour cookies
        print("Initialisation...", flush=True)
        await page.goto('https://www.techniciendesante.fr/', wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(2)

        # Traitement produit par produit via recherche
        total = len(need_image)
        for i, product in enumerate(need_image):
            ref = product['reference']
            ref_slug = ref_slugs[ref]
            dest_file = Path(OUTPUT_DIR) / f"{ref.replace('/', '_')}.jpg"

            if dest_file.exists() and dest_file.stat().st_size > 500:
                results[ref] = f'/images/products/{ref.replace("/","_")}.jpg'
                skip += 1
                continue

            # Chercher dans le pool déjà intercepté
            best_slug = None
            best_score = 0
            for sl in intercepted_pool:
                score = match_score(ref_slug, sl)
                if score > best_score:
                    best_score = score
                    best_slug = sl

            if best_slug and best_score >= 3:
                img_url = intercepted_pool[best_slug]
                # Remplacer home_default par large_default
                large_url = img_url.replace('home_default', 'large_default')
                local = download_image(large_url, ref) or download_image(img_url, ref)
                if local:
                    results[ref] = local
                    ok += 1
                    if ok % 25 == 0:
                        print(f"  {i+1}/{total} — OK:{ok} Skip:{skip} NoMatch:{nomatch}", flush=True)
                    continue

            # Pas trouvé dans le pool, faire une recherche
            query = product['nom'][:50]
            search_url = f"https://www.techniciendesante.fr/recherche?s={quote(query)}"
            try:
                await page.goto(search_url, wait_until='networkidle', timeout=20000)
                await asyncio.sleep(1)
            except Exception:
                pass

            # Re-chercher dans le pool mis à jour
            best_slug = None
            best_score = 0
            for sl in intercepted_pool:
                score = match_score(ref_slug, sl)
                if score > best_score:
                    best_score = score
                    best_slug = sl

            if best_slug and best_score >= 3:
                img_url = intercepted_pool[best_slug]
                large_url = img_url.replace('home_default', 'large_default')
                local = download_image(large_url, ref) or download_image(img_url, ref)
                if local:
                    results[ref] = local
                    ok += 1
                else:
                    nomatch += 1
            else:
                nomatch += 1

            if (i + 1) % 25 == 0 or (i + 1) == total:
                print(f"  {i+1}/{total} — OK:{ok} Skip:{skip} NoMatch:{nomatch} Pool:{len(intercepted_pool)}", flush=True)

        await browser.close()

    # Mettre à jour le JSON
    updated = 0
    for p in products:
        if p['reference'] in results:
            p['imageUrl'] = results[p['reference']]
            updated += 1

    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*55}")
    print(f"  Téléchargées  : {ok}")
    print(f"  Déjà présentes: {skip}")
    print(f"  Non trouvées  : {nomatch}")
    print(f"  JSON mis à jour: {updated + 28} produits avec image")
    print(f"{'='*55}")

asyncio.run(main())
