"""
fill_columns.py
Remplit les colonnes categorie, image_url, documents du catalogue
en scrapant les pages produits sur techniciendesante.fr
"""

import json
import re
import os
import time
import pandas as pd
import requests
from bs4 import BeautifulSoup

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_DIR         = r"c:\Users\Utilisateur\Desktop\BDD7"
CSV_INPUT        = BASE_DIR + r"\catalogue_aprium_mad_nsi_corrige.csv"
CSV_OUTPUT       = BASE_DIR + r"\catalogue_aprium_mad_nsi_final.csv"
CHECKPOINT_FILE  = BASE_DIR + r"\fill_checkpoint.csv"
NOT_FOUND_FILE   = BASE_DIR + r"\fill_not_found.csv"

SEARCH_URL_TPL   = "https://www.techniciendesante.fr/recherche?controller=search&s={ref}"

REQUEST_DELAY    = 0.05
REQUEST_TIMEOUT  = 15
MAX_RETRIES      = 2
CHECKPOINT_EVERY = 50

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── HTTP ──────────────────────────────────────────────────────────────────────

def fetch(url, session):
    for attempt in range(1, MAX_RETRIES + 2):
        try:
            r = session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            if r.status_code == 200:
                return r.text
            if attempt <= MAX_RETRIES:
                time.sleep(2)
                continue
            return None
        except requests.Timeout:
            if attempt <= MAX_RETRIES:
                time.sleep(3)
                continue
            return None
        except requests.RequestException:
            if attempt <= MAX_RETRIES:
                time.sleep(3)
                continue
            return None
    return None

# ── Extraction depuis la page de recherche ────────────────────────────────────

def get_product_url(search_html):
    """Retourne l'URL de la page produit depuis les résultats de recherche."""
    soup = BeautifulSoup(search_html, "lxml")
    article = soup.select_one("article.product-miniature")
    if article:
        a = article.select_one("a[href]")
        if a:
            return a["href"]
    return None

# ── Extraction depuis la page produit ─────────────────────────────────────────

def extract_product_data(html):
    """Extrait categorie, image_url, documents depuis la page produit."""
    soup = BeautifulSoup(html, "lxml")

    # Lire le JSON data-product
    el = soup.select_one("#product-details[data-product]")
    if not el:
        return "", "", ""

    try:
        data = json.loads(el["data-product"])
    except (json.JSONDecodeError, KeyError):
        return "", "", ""

    # ── Catégorie : breadcrumb complet depuis le JS prestashop ────────────────
    categorie = data.get("category_name", "")
    # Le JS prestashop contient breadcrumb.links avec le chemin complet
    m = re.search(r'"breadcrumb":\{"links":(\[.*?\],"count")', html)
    if m:
        try:
            links = json.loads(m.group(1).rsplit(',"count"', 1)[0])
            # Exclure "Accueil" (index 0) et le produit lui-même (dernier)
            parts = [lnk["title"] for lnk in links[1:-1] if lnk.get("title")]
            if parts:
                categorie = " > ".join(parts)
        except (json.JSONDecodeError, KeyError, IndexError):
            pass  # fallback sur category_name déjà défini

    # ── Images : large_default pour chaque image ──────────────────────────────
    images = []
    for img in data.get("images", []):
        try:
            url = img["bySize"]["large_default"]["url"]
            if url and "fr-default" not in url:  # ignorer le placeholder
                images.append(url)
        except (KeyError, TypeError):
            pass
    image_url = "|".join(images)

    # ── Documents : PDF dans la description HTML ──────────────────────────────
    desc_html = data.get("description", "")
    desc_soup = BeautifulSoup(desc_html, "lxml")
    pdfs = set()
    for a in desc_soup.find_all("a", href=re.compile(r"\.pdf", re.I)):
        pdfs.add(a["href"])
    for iframe in desc_soup.find_all("iframe", src=re.compile(r"\.pdf", re.I)):
        pdfs.add(iframe["src"])
    documents = "|".join(sorted(pdfs))

    return categorie, image_url, documents

# ── Checkpoint ─────────────────────────────────────────────────────────────────

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        try:
            df = pd.read_csv(CHECKPOINT_FILE, encoding="utf-8-sig")
            if "reference" in df.columns:
                return set(df["reference"].astype(str).tolist())
        except Exception:
            pass
    return set()

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"Chargement de {CSV_INPUT} ...")
    df = pd.read_csv(CSV_INPUT, delimiter="|", encoding="utf-8-sig", dtype=str)
    df["reference"] = df["reference"].str.strip()
    total = len(df)
    print(f"{total} produits charges.")

    already_done = load_checkpoint()
    if already_done:
        print(f"Reprise : {len(already_done)} references deja traitees.")

    not_found = []
    done_refs = list(already_done)
    session = requests.Session()

    for idx, row in enumerate(df.itertuples(index=False), start=1):
        reference = row.reference

        if reference in already_done:
            continue

        print(f"[{idx}/{total}] {reference} ...", end=" ", flush=True)

        # Étape 1 : page de recherche
        search_html = fetch(SEARCH_URL_TPL.format(ref=reference), session)
        time.sleep(REQUEST_DELAY)

        if not search_html:
            print("ERREUR (search)")
            not_found.append({"reference": reference, "error": "search_failed"})
            done_refs.append(reference)
            continue

        product_url = get_product_url(search_html)
        if not product_url:
            print("NON TROUVE")
            not_found.append({"reference": reference, "error": "no_results"})
            done_refs.append(reference)
            continue

        # Étape 2 : page produit
        product_html = fetch(product_url, session)
        time.sleep(REQUEST_DELAY)

        if not product_html:
            print("ERREUR (product page)")
            not_found.append({"reference": reference, "error": "product_page_failed"})
            done_refs.append(reference)
            continue

        categorie, image_url, documents = extract_product_data(product_html)

        # Mise à jour du DataFrame
        mask = df["reference"] == reference
        if categorie:
            df.loc[mask, "categorie"] = categorie
        if image_url:
            df.loc[mask, "image_url"] = image_url
        if documents:
            df.loc[mask, "documents"] = documents

        status = []
        if categorie: status.append("cat")
        if image_url: status.append("img")
        if documents: status.append("doc")
        print(f"ok [{', '.join(status) if status else 'vide'}]")

        done_refs.append(reference)

        # Checkpoint
        if idx % CHECKPOINT_EVERY == 0:
            df.to_csv(CSV_OUTPUT, sep="|", index=False, encoding="utf-8-sig")
            pd.DataFrame({"reference": done_refs}).to_csv(
                CHECKPOINT_FILE, index=False, encoding="utf-8-sig"
            )
            if not_found:
                pd.DataFrame(not_found).to_csv(
                    NOT_FOUND_FILE, index=False, encoding="utf-8-sig"
                )
            print(f"  -- Checkpoint #{idx} --")

    # Sauvegarde finale
    print("\nSauvegarde finale...")
    df.to_csv(CSV_OUTPUT, sep="|", index=False, encoding="utf-8-sig")
    print(f"Fichier final -> {CSV_OUTPUT}")

    if not_found:
        pd.DataFrame(not_found).to_csv(NOT_FOUND_FILE, index=False, encoding="utf-8-sig")
        print(f"Non trouves : {len(not_found)} -> {NOT_FOUND_FILE}")

    # Stats
    filled_cat = df["categorie"].notna().sum()
    filled_img = df["image_url"].notna().sum()
    filled_doc = df["documents"].notna().sum()
    print(f"\nStats : categorie={filled_cat}/{total} | image_url={filled_img}/{total} | documents={filled_doc}/{total}")
    print("Termine.")


if __name__ == "__main__":
    main()
