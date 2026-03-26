"""
check_names.py
Compare les noms de produits du CSV avec les résultats de recherche sur techniciendesante.fr
"""

import time
import unicodedata
import re
import os
import pandas as pd
import requests
from bs4 import BeautifulSoup

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_DIR        = r"c:\Users\Utilisateur\Desktop\BDD7"
CSV_INPUT       = BASE_DIR + r"\catalogue_aprium_mad_nsi_clean.csv"
MISMATCHES_OUT  = BASE_DIR + r"\mismatches.csv"
NOT_FOUND_OUT   = BASE_DIR + r"\not_found.csv"
CHECKPOINT_FILE = BASE_DIR + r"\progress_checkpoint.csv"

SEARCH_URL_TPL  = "https://www.techniciendesante.fr/recherche?controller=search&s={ref}"

REQUEST_DELAY    = 0.3   # secondes entre chaque requête
REQUEST_TIMEOUT  = 15    # secondes avant abandon
MAX_RETRIES      = 2     # tentatives supplémentaires en cas d'erreur réseau
CHECKPOINT_EVERY = 50    # sauvegarde tous les N produits

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Normalisation du texte ─────────────────────────────────────────────────────

def normalize(text: str) -> str:
    """Minuscules, sans accents, sans ponctuation, espaces normalisés."""
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ── Scraping HTML ──────────────────────────────────────────────────────────────

# Sélecteurs CSS par ordre de priorité (thèmes PrestaShop 1.6/1.7/1.8)
PRODUCT_NAME_SELECTORS = [
    "h2.product-title a",
    "h2.h3.product-title a",
    ".product-title a",
    ".product-title",
    "h5.product-name a",
    ".product_name a",
    "article.product-miniature .product-title",
    ".products .product-title",
]

NO_RESULTS_SELECTORS = [
    ".alert.alert-warning",
    "#main .alert",
    ".no-product",
]


def extract_first_product_name(html: str) -> str | None:
    """Retourne le nom du premier produit trouvé, ou None si aucun résultat."""
    soup = BeautifulSoup(html, "lxml")

    # Vérification explicite "aucun résultat"
    for sel in NO_RESULTS_SELECTORS:
        node = soup.select_one(sel)
        if node and node.get_text(strip=True):
            return None

    # Tentative avec chaque sélecteur
    for sel in PRODUCT_NAME_SELECTORS:
        node = soup.select_one(sel)
        if node:
            name = node.get_text(strip=True)
            if name:
                return name

    # Dernier recours : premier <a> dans un article produit
    article = soup.select_one("article.product-miniature")
    if article:
        a = article.find("a", string=True)
        if a:
            return a.get_text(strip=True)

    return None


# ── Requête HTTP avec retry ────────────────────────────────────────────────────

def fetch_search_page(reference: str, session: requests.Session) -> tuple:
    """Retourne (html|None, status_string)."""
    url = SEARCH_URL_TPL.format(ref=reference)
    for attempt in range(1, MAX_RETRIES + 2):
        try:
            resp = session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                return resp.text, "ok"
            elif resp.status_code == 404:
                return None, "http_error:404"
            else:
                if attempt <= MAX_RETRIES:
                    time.sleep(2)
                    continue
                return None, f"http_error:{resp.status_code}"
        except requests.Timeout:
            if attempt <= MAX_RETRIES:
                time.sleep(3)
                continue
            return None, "timeout"
        except requests.RequestException as exc:
            if attempt <= MAX_RETRIES:
                time.sleep(3)
                continue
            return None, f"network_error:{exc.__class__.__name__}"
    return None, "unknown_error"


# ── Checkpoint ─────────────────────────────────────────────────────────────────

def save_checkpoint(mismatches: list, not_found: list):
    if mismatches:
        pd.DataFrame(mismatches).to_csv(CHECKPOINT_FILE, index=False, encoding="utf-8-sig")
    if not_found:
        pd.DataFrame(not_found).to_csv(NOT_FOUND_OUT, index=False, encoding="utf-8-sig")


def load_already_processed() -> set:
    if os.path.exists(CHECKPOINT_FILE):
        try:
            df = pd.read_csv(CHECKPOINT_FILE, encoding="utf-8-sig")
            if "reference" in df.columns:
                return set(df["reference"].astype(str).tolist())
        except Exception:
            pass
    return set()


# ── Boucle principale ─────────────────────────────────────────────────────────

def main():
    print(f"Chargement de {CSV_INPUT} ...")
    df = pd.read_csv(CSV_INPUT, delimiter="|", encoding="utf-8-sig", dtype=str)
    df["reference"] = df["reference"].str.strip()
    df["nom"]       = df["nom"].str.strip()

    total = len(df)
    print(f"{total} produits chargés.")

    already_done = load_already_processed()
    if already_done:
        print(f"Reprise : {len(already_done)} références déjà traitées, ignorées.")

    mismatches: list = []
    not_found:  list = []

    session = requests.Session()

    for idx, row in enumerate(df.itertuples(index=False), start=1):
        reference = row.reference
        nom_csv   = row.nom

        if reference in already_done:
            continue

        print(f"[{idx}/{total}] {reference} ...", end=" ", flush=True)

        html, status = fetch_search_page(reference, session)

        if html is None:
            print(f"IGNORÉ ({status})")
            not_found.append({"reference": reference, "nom_csv": nom_csv, "error": status})
        else:
            nom_site = extract_first_product_name(html)

            if nom_site is None:
                print("NON TROUVÉ (aucun résultat)")
                not_found.append({"reference": reference, "nom_csv": nom_csv, "error": "no_results"})
            else:
                # Ignorer si le site tronque le nom (finit par '...')
                nom_site_clean = nom_site
                is_truncated = nom_site.endswith("...")
                if is_truncated:
                    nom_site_clean = nom_site[:-3].strip()

                norm_csv  = normalize(nom_csv)
                norm_site = normalize(nom_site_clean)

                match = (norm_csv == norm_site) or (
                    is_truncated and norm_csv.startswith(norm_site)
                )

                if not match:
                    print(f"DIFFERENCE | CSV: '{nom_csv}' | SITE: '{nom_site}'")
                    mismatches.append({"reference": reference, "nom_csv": nom_csv, "nom_site": nom_site})
                else:
                    print("ok")

        if idx % CHECKPOINT_EVERY == 0:
            save_checkpoint(mismatches, not_found)
            print(f"  -- Checkpoint sauvegardé au produit #{idx} --")

        time.sleep(REQUEST_DELAY)

    print("\nTerminé. Sauvegarde des résultats finaux...")

    if mismatches:
        pd.DataFrame(mismatches).to_csv(MISMATCHES_OUT, index=False, encoding="utf-8-sig")
        print(f"Differences : {len(mismatches)} -> {MISMATCHES_OUT}")
    else:
        print("Aucune différence trouvée.")

    if not_found:
        pd.DataFrame(not_found).to_csv(NOT_FOUND_OUT, index=False, encoding="utf-8-sig")
        print(f"Non trouves / erreurs : {len(not_found)} -> {NOT_FOUND_OUT}")

    print("Fin.")


if __name__ == "__main__":
    main()
