"""
Télécharge les images produits via la Wayback Machine (archive.org).
L'Archive.org met en cache les images des sites commerciaux et est librement accessible.
"""
import csv, json, os, sys, time, requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

CSV_FILE   = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
JSON_FILE  = r"c:\Users\Utilisateur\Desktop\BDD7\Site\lib\catalogue.json"
OUTPUT_DIR = r"c:\Users\Utilisateur\Desktop\BDD7\Site\public\images\products"
THREADS    = 4   # Respectueux vis-à-vis de l'Archive
DELAY      = 0.3 # Secondes entre requêtes CDX

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(JSON_FILE, encoding='utf-8') as f:
    products = json.load(f)

# Index des produits déjà avec image locale
already_local = {p['reference'] for p in products if (p.get('imageUrl') or '').startswith('/images/')}
print(f"Déjà en local : {len(already_local)} images\n")

# Lire les URLs depuis le CSV
csv_urls = {}
with open(CSV_FILE, encoding='utf-8-sig') as f:
    for row in csv.DictReader(f, delimiter='|'):
        url = row.get('image_url', '').strip()
        ref = row.get('reference', '').strip()
        if url and ref and ref not in already_local:
            csv_urls[ref] = url

print(f"{len(csv_urls)} images à récupérer via Wayback Machine\n")

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (compatible; archive-fetcher/1.0)',
    'Accept': 'image/*,*/*',
})

def get_wayback_url(original_url: str) -> str | None:
    """Cherche une URL archivée via l'API CDX."""
    cdx = (
        f"http://web.archive.org/cdx/search/cdx"
        f"?url={requests.utils.quote(original_url, safe='')}"
        f"&output=json&limit=1&fl=timestamp&filter=statuscode:200&collapse=digest"
    )
    try:
        r = session.get(cdx, timeout=15)
        data = r.json()
        if len(data) > 1:
            timestamp = data[1][0]
            return f"https://web.archive.org/web/{timestamp}if_/{original_url}"
    except Exception:
        pass
    return None

def download_one(ref: str, url: str) -> tuple[str, str | None, str]:
    ext = url.rsplit('.', 1)[-1].split('?')[0][:4] or 'jpg'
    filename = f"{ref.replace('/', '_').replace(' ', '_')}.{ext}"
    dest = Path(OUTPUT_DIR) / filename

    if dest.exists() and dest.stat().st_size > 500:
        return ref, filename, 'skip'

    time.sleep(DELAY)

    # Chercher dans Wayback
    wayback_url = get_wayback_url(url)
    if not wayback_url:
        return ref, None, 'not_archived'

    try:
        time.sleep(DELAY)
        r = session.get(wayback_url, timeout=20)
        if r.status_code == 200 and len(r.content) > 500:
            ct = r.headers.get('content-type', '')
            if 'image' in ct or 'octet' in ct:
                dest.write_bytes(r.content)
                return ref, filename, 'ok'
        return ref, None, f'http:{r.status_code}'
    except Exception as e:
        return ref, None, f'err:{str(e)[:40]}'

# Test rapide sur 3 URLs
print("Test Wayback Machine sur 3 URLs...", flush=True)
test_refs = list(csv_urls.keys())[:3]
test_ok = 0
for ref in test_refs:
    url = csv_urls[ref]
    wb = get_wayback_url(url)
    status = "TROUVÉ" if wb else "non archivé"
    print(f"  {ref}: {status}")
    if wb:
        test_ok += 1
    time.sleep(0.5)

print()
if test_ok == 0:
    print("⚠ Aucune URL trouvée dans la Wayback Machine pour ces produits.")
    print("  Les images ne sont probablement pas archivées.")
    print("  Arrêt du script.")
    sys.exit(0)

print(f"✓ {test_ok}/3 URLs archivées. Lancement du téléchargement...\n")

# Téléchargement complet
ok = skip = not_archived = fail = 0
results = {}
tasks = list(csv_urls.items())

with ThreadPoolExecutor(max_workers=THREADS) as ex:
    futures = {ex.submit(download_one, ref, url): ref for ref, url in tasks}
    for i, future in enumerate(as_completed(futures), 1):
        ref, filename, status = future.result()
        if status == 'ok':
            results[ref] = f'/images/products/{filename}'
            ok += 1
        elif status == 'skip':
            results[ref] = f'/images/products/{filename}'
            skip += 1
        elif status == 'not_archived':
            not_archived += 1
        else:
            fail += 1

        if i % 50 == 0 or i == len(tasks):
            print(f"  {i}/{len(tasks)} — OK:{ok} Skip:{skip} NonArchivé:{not_archived} Fail:{fail}", flush=True)

# Mise à jour du JSON
updated = 0
for p in products:
    ref = p['reference']
    if ref in results:
        p['imageUrl'] = results[ref]
        updated += 1

with open(JSON_FILE, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"\n{'='*55}")
print(f"  Nouvelles images  : {ok}")
print(f"  Déjà présentes    : {skip}")
print(f"  Non archivées     : {not_archived}")
print(f"  Erreurs           : {fail}")
print(f"  JSON mis à jour   : {updated} produits")
print(f"{'='*55}")
print(f"\nImages dans : {OUTPUT_DIR}")
