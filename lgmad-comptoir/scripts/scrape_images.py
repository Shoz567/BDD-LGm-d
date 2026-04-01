"""
Scraper intelligent : teste chaque URL, télécharge si accessible (200),
passe si 403. Délai humain entre requêtes pour éviter le rate-limiting.
"""
import csv, json, os, sys, time, requests
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

CSV_FILE   = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
JSON_FILE  = r"c:\Users\Utilisateur\Desktop\BDD7\Site\lib\catalogue.json"
OUTPUT_DIR = r"c:\Users\Utilisateur\Desktop\BDD7\Site\public\images\products"
DELAY      = 0.4   # secondes entre chaque requête

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Charger le JSON
with open(JSON_FILE, encoding='utf-8') as f:
    products = json.load(f)

# Index des images déjà en local
already = {p['reference'] for p in products if (p.get('imageUrl') or '').startswith('/images/')}
print(f"Déjà en local : {len(already)}\n")

# Lire les URLs depuis le CSV
csv_urls = {}
with open(CSV_FILE, encoding='utf-8-sig') as f:
    for row in csv.DictReader(f, delimiter='|'):
        ref = row.get('reference', '').strip()
        url = row.get('image_url', '').strip()
        if ref and url and ref not in already:
            csv_urls[ref] = url

total = len(csv_urls)
print(f"{total} images à tester (délai {DELAY}s/req = ~{total*DELAY/60:.0f} min)\n")

session = requests.Session()
session.headers.update({
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/122.0.0.0 Safari/537.36'
    ),
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9',
})

ok = skip = blocked = error = 0
results = {}

for i, (ref, url) in enumerate(csv_urls.items(), 1):
    ext = url.rsplit('.', 1)[-1].split('?')[0][:4] or 'jpg'
    filename = f"{ref.replace('/', '_').replace(' ', '_')}.{ext}"
    dest = Path(OUTPUT_DIR) / filename

    # Déjà téléchargé dans une session précédente
    if dest.exists() and dest.stat().st_size > 500:
        results[ref] = f'/images/products/{filename}'
        skip += 1
        if i % 100 == 0:
            print(f"  {i}/{total} — OK:{ok} Skip:{skip} Bloqué:{blocked} Err:{error}", flush=True)
        continue

    time.sleep(DELAY)

    try:
        r = session.get(url, timeout=15)
        if r.status_code == 200:
            ct = r.headers.get('content-type', '')
            if ('image' in ct or 'octet' in ct) and len(r.content) > 500:
                dest.write_bytes(r.content)
                results[ref] = f'/images/products/{filename}'
                ok += 1
            else:
                blocked += 1
        else:
            blocked += 1
    except Exception:
        error += 1

    if i % 100 == 0 or i == total:
        pct = int(i / total * 100)
        print(f"  {i}/{total} ({pct}%) — OK:{ok} Skip:{skip} Bloqué:{blocked} Err:{error}", flush=True)

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
print(f"  Bloquées (403): {blocked}")
print(f"  Erreurs       : {error}")
print(f"  JSON mis à jour: {updated + len(already)} produits avec image")
print(f"{'='*55}")
