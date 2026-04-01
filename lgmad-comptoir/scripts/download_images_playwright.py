"""
Télécharge les images via Playwright (vrai Chromium).
Visite d'abord techniciendesante.fr pour obtenir les cookies,
puis télécharge les images avec le contexte authentifié.
"""
import json, os, sys, asyncio
from pathlib import Path
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

CSV_FILE   = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
JSON_FILE  = r"c:\Users\Utilisateur\Desktop\BDD7\Site\lib\catalogue.json"
OUTPUT_DIR = r"c:\Users\Utilisateur\Desktop\BDD7\Site\public\images\products"
WORKERS    = 8

os.makedirs(OUTPUT_DIR, exist_ok=True)

import csv
with open(JSON_FILE, encoding='utf-8') as f:
    products = json.load(f)

# Lire les URLs depuis le CSV (source de vérité)
csv_urls = {}
with open(CSV_FILE, encoding='utf-8-sig') as f:
    for row in csv.DictReader(f, delimiter='|'):
        url = row.get('image_url', '').strip()
        if url:
            csv_urls[row['reference']] = url

# Construire les tâches depuis le CSV
tasks = []
for p in products:
    ref = p['reference']
    url = csv_urls.get(ref, '')
    if url.startswith('http'):
        ext = url.rsplit('.', 1)[-1].split('?')[0][:4] or 'jpg'
        filename = f"{ref.replace('/', '_').replace(' ', '_')}.{ext}"
        dest = Path(OUTPUT_DIR) / filename
        if not (dest.exists() and dest.stat().st_size > 500):
            tasks.append((ref, url, filename))

total = len(tasks)
print(f"{total} images à télécharger ({WORKERS} workers Chromium)\n")

ok_count = 0
fail_count = 0
results = {}
lock = asyncio.Lock()

async def download_worker(context, task_queue):
    global ok_count, fail_count
    page = await context.new_page()
    try:
        while True:
            try:
                ref, url, filename = task_queue.get_nowait()
            except asyncio.QueueEmpty:
                break

            dest = Path(OUTPUT_DIR) / filename
            try:
                resp = await page.goto(url, timeout=20000, wait_until='commit')
                if resp and resp.status == 200:
                    ct = resp.headers.get('content-type', '')
                    if 'image' in ct or 'octet' in ct:
                        body = await resp.body()
                        if len(body) > 500:
                            dest.write_bytes(body)
                            async with lock:
                                results[ref] = f'/images/products/{filename}'
                                ok_count += 1
                                done = ok_count + fail_count
                                if done % 50 == 0 or done == total:
                                    print(f"  {done}/{total} — OK:{ok_count}  Fail:{fail_count}", flush=True)
                            continue
                async with lock:
                    results[ref] = None
                    fail_count += 1
                    done = ok_count + fail_count
                    if done % 50 == 0 or done == total:
                        print(f"  {done}/{total} — OK:{ok_count}  Fail:{fail_count}", flush=True)
            except Exception:
                async with lock:
                    results[ref] = None
                    fail_count += 1
    finally:
        await page.close()


async def main():
    q = asyncio.Queue()
    for t in tasks:
        await q.put(t)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)

        # Un seul contexte partagé — visite homepage pour cookies
        context = await browser.new_context(
            user_agent=(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/122.0.0.0 Safari/537.36'
            ),
            extra_http_headers={
                'Accept-Language': 'fr-FR,fr;q=0.9',
                'Referer': 'https://www.techniciendesante.fr/',
            }
        )

        print("Obtention des cookies via la page d'accueil...", flush=True)
        init_page = await context.new_page()
        try:
            await init_page.goto('https://www.techniciendesante.fr/', timeout=20000, wait_until='domcontentloaded')
            await asyncio.sleep(2)
        except Exception as e:
            print(f"  Warning homepage: {e}")
        finally:
            await init_page.close()

        print(f"Lancement de {WORKERS} workers...\n", flush=True)
        workers = [download_worker(context, q) for _ in range(WORKERS)]
        await asyncio.gather(*workers)

        await context.close()
        await browser.close()

    # Mise à jour du JSON
    updated = 0
    for p in products:
        ref = p['reference']
        if ref in results:
            p['imageUrl'] = results[ref]
            if results[ref]:
                updated += 1

    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"  Téléchargées    : {ok_count}")
    print(f"  Échouées        : {fail_count}")
    print(f"  JSON mis à jour : {updated} produits avec image locale")
    print(f"{'='*50}")


asyncio.run(main())
