"""
Catégorisation IA du catalogue MAD via Mistral API.
Modèle : ministral-8b-latest (rapide et économique)
Traitement par lots de 60 produits par appel API.
"""

import csv
import json
import time
import requests

MISTRAL_API_KEY = "7AygyMO4cOOe9U6YvZE6z8N5235wrnxY"
MISTRAL_MODEL   = "ministral-8b-latest"
API_URL         = "https://api.mistral.ai/v1/chat/completions"

INPUT      = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_aprium_mad_nsi_final.csv"
OUTPUT     = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
DELIM      = "|"
BATCH_SIZE = 20

CATEGORIES = [
    "Aide a la marche",
    "La chambre",
    "Fauteuils roulants",
    "Salle de bain",
    "Toilettes",
    "Aides techniques",
]

# Correspondance noms affichage
CAT_DISPLAY = {
    "Aide a la marche":  "Aide à la marche",
    "La chambre":        "La chambre",
    "Fauteuils roulants":"Fauteuils roulants",
    "Salle de bain":     "Salle de bain",
    "Toilettes":         "Toilettes",
    "Aides techniques":  "Aides techniques",
}

SYSTEM = (
    "Tu es un expert en matériel MAD (Maintien à Domicile) pour les pharmacies françaises. "
    "Classe chaque produit dans l'une des 6 catégories suivantes UNIQUEMENT :\n"
    "- 'Aide a la marche' : cannes, rollators, déambulateurs, cadres de marche, béquilles, wheeleo\n"
    "- 'La chambre' : matelas, oreillers, draps, alèses, coussins de positionnement, lève-personnes, fauteuils releveurs, arceau de lit, draps de glisse, ceintures de transfert, protège-matelas\n"
    "- 'Fauteuils roulants' : fauteuils roulants manuels ou électriques, fauteuils de transfert\n"
    "- 'Salle de bain' : chaises/tabourets/sièges de douche ou bain, barres d'appui, bancs de baignoire, tapis antidérapants\n"
    "- 'Toilettes' : chaises percées, garde-robes, rehausseurs WC, sièges de toilette adaptés, seaux hygiéniques\n"
    "- 'Aides techniques' : TOUT LE RESTE — pansements, sondes, seringues, cathéters, stéthoscopes, désinfectants, orthèses, incontinence, vêtements, chaussures, oxygène, matériel de soins\n\n"
    "Réponds TOUJOURS en JSON valide : {\"r\": [\"cat1\", \"cat2\", ...]}"
)


def call_mistral(products: list[str], retries: int = 3) -> list[str]:
    """Appelle l'API Mistral pour classer un lot de produits."""
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
                wait = 15 * (attempt + 1)
                print(f"\n    [rate limit] attente {wait}s...", end="", flush=True)
                time.sleep(wait)
                continue

            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(text)
            results = data.get("r", data.get("results", []))

            if len(results) != len(products):
                raise ValueError(f"Recu {len(results)} categories pour {len(products)} produits")

            # Normaliser les accents et valider
            clean = []
            for cat in results:
                # Nettoyer les accents de la réponse pour matcher
                normalized = (cat
                    .replace("à", "a").replace("â", "a")
                    .replace("é", "e").replace("è", "e").replace("ê", "e")
                    .replace("î", "i").replace("ô", "o").replace("û", "u")
                    .strip())
                # Chercher correspondance
                matched = None
                for c in CATEGORIES:
                    if c.lower() in normalized.lower() or normalized.lower() in c.lower():
                        matched = c
                        break
                clean.append(matched if matched else "Aides techniques")

            return clean

        except (requests.RequestException, json.JSONDecodeError, KeyError, ValueError) as e:
            if attempt < retries - 1:
                print(f"\n    [erreur] {e} — retry {attempt+2}/{retries}...", end="", flush=True)
                time.sleep(3)
            else:
                raise

    raise RuntimeError("Echec apres tous les retries")


def main():
    # Lire le CSV
    print(f"Lecture du catalogue...")
    rows = []
    with open(INPUT, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=DELIM)
        fieldnames = list(reader.fieldnames or [])
        for row in reader:
            rows.append(row)

    total = len(rows)
    print(f"{total} produits charges.")

    # S'assurer que 'categorie' est dans les colonnes
    if 'categorie' not in fieldnames:
        fieldnames.append('categorie')

    # Traitement par lots
    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    stats: dict[str, int] = {}
    erreurs = 0

    print(f"\nCategorialisation via Mistral ({MISTRAL_MODEL})")
    print(f"{total_batches} lots de {BATCH_SIZE} produits max\n")

    for i in range(total_batches):
        start = i * BATCH_SIZE
        end   = min(start + BATCH_SIZE, total)
        batch_rows = rows[start:end]
        batch_noms = [r.get('nom', '') for r in batch_rows]

        pct = int((i / total_batches) * 100)
        print(f"  Lot {i+1:3d}/{total_batches} ({pct:2d}%)  [{start+1}-{end}]...", end=" ", flush=True)

        try:
            cats = call_mistral(batch_noms)
            for row, cat_key in zip(batch_rows, cats):
                display = CAT_DISPLAY.get(cat_key, "Aides techniques")
                row['categorie'] = display
                stats[display] = stats.get(display, 0) + 1
            print("OK")

        except Exception as e:
            print(f"ECHEC ({e})")
            for row in batch_rows:
                row['categorie'] = "Aides techniques"
                stats["Aides techniques"] = stats.get("Aides techniques", 0) + 1
            erreurs += len(batch_rows)

        # Petite pause entre les lots
        if i < total_batches - 1:
            time.sleep(0.5)

    # Écrire le résultat
    print(f"\nEcriture vers {OUTPUT}...")
    with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=DELIM, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    # Résumé final
    print(f"\n{'='*55}")
    print(f"  TERMINE : {total} produits | {erreurs} erreurs")
    print(f"{'='*55}")
    display_cats = list(CAT_DISPLAY.values())
    for cat in display_cats:
        count = stats.get(cat, 0)
        bar = '#' * (count * 25 // max(total, 1))
        print(f"  {cat:<25} {count:>4}  {bar}")
    print(f"{'='*55}")
    print(f"\nFichier : {OUTPUT}")


if __name__ == '__main__':
    main()
