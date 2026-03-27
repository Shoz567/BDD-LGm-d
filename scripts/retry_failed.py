"""
Reclassifie uniquement les 3 lots en échec :
- Lignes 81-100
- Lignes 101-120
- Lignes 1641-1660
"""

import csv
import json
import time
import requests

MISTRAL_API_KEY = "7AygyMO4cOOe9U6YvZE6z8N5235wrnxY"
MISTRAL_MODEL   = "ministral-8b-latest"
API_URL         = "https://api.mistral.ai/v1/chat/completions"

# Fichier source = le résultat IA à corriger
SOURCE = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
DELIM  = "|"

# Lignes à reprendre (1-indexées, inclusives)
FAILED_RANGES = [(81, 100), (101, 120), (1641, 1660)]

CATEGORIES = [
    "Aide a la marche",
    "La chambre",
    "Fauteuils roulants",
    "Salle de bain",
    "Toilettes",
    "Aides techniques",
]

CAT_DISPLAY = {
    "Aide a la marche":   "Aide à la marche",
    "La chambre":         "La chambre",
    "Fauteuils roulants": "Fauteuils roulants",
    "Salle de bain":      "Salle de bain",
    "Toilettes":          "Toilettes",
    "Aides techniques":   "Aides techniques",
}

SYSTEM = (
    "Tu es un expert en matériel MAD (Maintien à Domicile) pour les pharmacies françaises. "
    "Classe chaque produit dans l'une des 6 catégories suivantes UNIQUEMENT :\n"
    "- 'Aide a la marche' : cannes, rollators, déambulateurs, cadres de marche, béquilles\n"
    "- 'La chambre' : matelas, oreillers, alèses, coussins, lève-personnes, fauteuils releveurs, arceau de lit, draps de glisse, ceintures de transfert, protège-matelas\n"
    "- 'Fauteuils roulants' : fauteuils roulants manuels ou électriques, fauteuils de transfert\n"
    "- 'Salle de bain' : chaises/tabourets/sièges de douche ou bain, barres d'appui, bancs de baignoire, tapis antidérapants\n"
    "- 'Toilettes' : chaises percées, garde-robes, rehausseurs WC, sièges de toilette adaptés\n"
    "- 'Aides techniques' : TOUT LE RESTE\n\n"
    "Réponds TOUJOURS en JSON valide : {\"r\": [\"cat1\", \"cat2\", ...]}"
)


def call_mistral(products: list[str], retries: int = 5) -> list[str]:
    numbered = "\n".join(f"{i+1}. {nom}" for i, nom in enumerate(products))
    payload = {
        "model": MISTRAL_MODEL,
        "temperature": 0,
        "max_tokens": 1024,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM},
            {
                "role": "user",
                "content": (
                    f"Classifie ces {len(products)} produits. "
                    f"Réponds en JSON avec exactement {len(products)} éléments : "
                    f"{{\"r\": [\"cat1\", ...]}}.\n\n{numbered}"
                )
            }
        ]
    }
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }

    for attempt in range(retries):
        try:
            resp = requests.post(API_URL, json=payload, headers=headers, timeout=60)
            if resp.status_code == 429:
                wait = 20 * (attempt + 1)
                print(f"\n    [rate limit] attente {wait}s...", end="", flush=True)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(text)
            results = data.get("r", data.get("results", []))
            if len(results) != len(products):
                raise ValueError(f"Recu {len(results)} pour {len(products)}")

            clean = []
            for cat in results:
                normalized = (cat
                    .replace("à", "a").replace("â", "a")
                    .replace("é", "e").replace("è", "e").replace("ê", "e")
                    .replace("î", "i").replace("ô", "o").replace("û", "u")
                    .strip())
                matched = None
                for c in CATEGORIES:
                    if c.lower() in normalized.lower() or normalized.lower() in c.lower():
                        matched = c
                        break
                clean.append(matched if matched else "Aides techniques")
            return clean

        except Exception as e:
            if attempt < retries - 1:
                print(f"\n    [erreur] {e} — retry {attempt+2}/{retries}...", end="", flush=True)
                time.sleep(3)
            else:
                raise

    raise RuntimeError("Echec apres tous les retries")


def main():
    # Lire le CSV complet
    print(f"Lecture de {SOURCE}...")
    rows = []
    with open(SOURCE, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=DELIM)
        fieldnames = list(reader.fieldnames or [])
        for row in reader:
            rows.append(row)
    print(f"{len(rows)} produits charges.")

    # Construire la liste des indices 0-based à reprendre
    indices_to_retry = set()
    for start, end in FAILED_RANGES:
        for i in range(start - 1, min(end, len(rows))):
            indices_to_retry.add(i)

    total_retry = len(indices_to_retry)
    print(f"\nReprend {total_retry} produits ({len(FAILED_RANGES)} lots)...\n")

    # Traiter par lots de 20
    idx_list = sorted(indices_to_retry)
    batch_size = 20
    batches = [idx_list[i:i+batch_size] for i in range(0, len(idx_list), batch_size)]

    for b_num, batch_indices in enumerate(batches):
        noms = [rows[i].get('nom', '') for i in batch_indices]
        first = batch_indices[0] + 1
        last  = batch_indices[-1] + 1
        print(f"  Lot {b_num+1}/{len(batches)}  [lignes {first}-{last}]...", end=" ", flush=True)

        try:
            cats = call_mistral(noms)
            for idx, cat_key in zip(batch_indices, cats):
                rows[idx]['categorie'] = CAT_DISPLAY.get(cat_key, "Aides techniques")
            print("OK")
        except Exception as e:
            print(f"ECHEC ({e}) — laissé en Aides techniques")

        if b_num < len(batches) - 1:
            time.sleep(0.5)

    # Réécrire le fichier
    print(f"\nEcriture vers {SOURCE}...")
    with open(SOURCE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=DELIM, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    # Stats finales
    stats: dict[str, int] = {}
    for row in rows:
        cat = row.get('categorie', '')
        stats[cat] = stats.get(cat, 0) + 1

    print(f"\n{'='*55}")
    print(f"  DONE — {len(rows)} produits total")
    print(f"{'='*55}")
    for cat in CAT_DISPLAY.values():
        count = stats.get(cat, 0)
        bar = '#' * (count * 30 // max(len(rows), 1))
        print(f"  {cat:<25} {count:>4}  {bar}")
    print(f"{'='*55}")


if __name__ == '__main__':
    main()
