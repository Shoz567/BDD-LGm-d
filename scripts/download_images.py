"""
Télécharge toutes les images du catalogue vers public/images/products/
Met à jour catalogue.json avec les chemins locaux.
Utilise 8 threads parallèles.
"""
import csv, json, os, time, hashlib, sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

CSV_FILE   = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
JSON_FILE  = r"c:\Users\Utilisateur\Desktop\BDD7\Site\lib\catalogue.json"
OUTPUT_DIR = r"c:\Users\Utilisateur\Desktop\BDD7\Site\public\images\products"
THREADS    = 8

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
}

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Lire le JSON
with open(JSON_FILE, encoding='utf-8') as f:
    products = json.load(f)

# Construire la map ref -> imageUrl
tasks = []
for p in products:
    url = p.get('imageUrl') or ''
    if url and url.startswith('http'):
        # Nom de fichier basé sur la référence produit
        ext = url.split('.')[-1].split('?')[0][:4] or 'jpg'
        filename = f"{p['reference'].replace('/', '_').replace(' ', '_')}.{ext}"
        tasks.append((p['reference'], url, filename))

print(f"{len(tasks)} images à télécharger ({THREADS} threads)\n")

ok = 0
fail = 0
skip = 0
results = {}  # ref -> local_path or None

def download(ref, url, filename):
    dest = Path(OUTPUT_DIR) / filename
    if dest.exists() and dest.stat().st_size > 500:
        return ref, filename, 'skip'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
        if len(data) < 500:
            return ref, None, 'empty'
        dest.write_bytes(data)
        return ref, filename, 'ok'
    except Exception as e:
        return ref, None, f'err:{e}'

with ThreadPoolExecutor(max_workers=THREADS) as ex:
    futures = {ex.submit(download, ref, url, fn): ref for ref, url, fn in tasks}
    done = 0
    for future in as_completed(futures):
        ref, filename, status = future.result()
        done += 1
        if filename and status in ('ok', 'skip'):
            results[ref] = f'/images/products/{filename}'
            if status == 'ok':
                ok += 1
            else:
                skip += 1
        else:
            results[ref] = None
            fail += 1
        if done % 50 == 0 or done == len(tasks):
            print(f"  {done}/{len(tasks)} — OK:{ok} Skip:{skip} Fail:{fail}", flush=True)

# Mettre à jour le JSON avec les chemins locaux
updated = 0
for p in products:
    ref = p['reference']
    if ref in results:
        local = results[ref]
        if local:
            p['imageUrl'] = local
            updated += 1
        else:
            p['imageUrl'] = None

with open(JSON_FILE, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"\n{'='*50}")
print(f"  Téléchargées : {ok}")
print(f"  Déjà présentes : {skip}")
print(f"  Échouées : {fail}")
print(f"  JSON mis à jour : {updated} produits")
print(f"{'='*50}")
print(f"\nImages dans : {OUTPUT_DIR}")
