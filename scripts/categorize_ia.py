"""
Catégorisation IA du catalogue MAD via Claude API.
Traite les produits par lots de 50 pour minimiser le coût.
Modèle : claude-haiku-4-5 (le plus rapide et économique)

Usage :
    set ANTHROPIC_API_KEY=sk-ant-...
    python categorize_ia.py
"""

import csv
import json
import os
import sys
import time
import anthropic

INPUT  = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_aprium_mad_nsi_final.csv"
OUTPUT = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise_ia.csv"
DELIM  = "|"
BATCH_SIZE = 50   # produits par appel API

CATEGORIES = [
    "Aide à la marche",
    "La chambre",
    "Fauteuils roulants",
    "Salle de bain",
    "Toilettes",
    "Aides techniques",
]

SYSTEM_PROMPT = """Tu es un expert en matériel médical pour le Maintien à Domicile (MAD).
Ta tâche est de classer des produits dans exactement l'une de ces 6 catégories :

1. "Aide à la marche" : cannes, rollators, déambulateurs, cadres de marche, béquilles, wheeleo, manchons, embouts
2. "La chambre" : lits médicaux, matelas, oreillers, draps, alèses, coussins de positionnement, lève-personnes, fauteuils releveurs, arceaux de lit, tables de lit, draps de glisse, ceintures de transfert
3. "Fauteuils roulants" : fauteuils roulants manuels ou électriques, fauteuils de transfert, assistance à la propulsion
4. "Salle de bain" : chaises/tabourets/sièges de douche ou de bain, barres d'appui, bancs de baignoire, tapis antidérapants, planches de bain
5. "Toilettes" : chaises percées, garde-robes, rehausseurs WC, sièges de toilettes adaptés, seaux hygiéniques
6. "Aides techniques" : TOUT le reste — pansements, sondes, seringues, cathéters, stéthoscopes, désinfectants, compresses, orthèses, électrostimulateurs, oxygène, incontinence, vêtements médicaux, chaussures, matériel de soins, etc.

Règle : si un produit ne correspond pas clairement aux catégories 1-5, classe-le dans "Aides techniques".
"""

def categorize_batch(client: anthropic.Anthropic, products: list[dict]) -> list[str]:
    """Envoie un lot de produits à Claude et retourne leurs catégories."""

    # Construire la liste numérotée pour le prompt
    product_list = "\n".join(
        f"{i+1}. {p['nom']}"
        for i, p in enumerate(products)
    )

    prompt = f"""Voici {len(products)} produits à classer. Pour chacun, donne uniquement le nom de la catégorie.
Réponds en JSON : {{"results": ["catégorie1", "catégorie2", ...]}}
Le tableau doit avoir exactement {len(products)} éléments dans le même ordre.

Produits :
{product_list}"""

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "results": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": CATEGORIES
                            }
                        }
                    },
                    "required": ["results"],
                    "additionalProperties": False
                }
            }
        }
    )

    text = next(b.text for b in response.content if b.type == "text")
    data = json.loads(text)
    results = data["results"]

    # Sécurité : vérifier la longueur
    if len(results) != len(products):
        raise ValueError(f"Lot : attendu {len(products)} catégories, reçu {len(results)}")

    # Valider chaque catégorie
    for i, cat in enumerate(results):
        if cat not in CATEGORIES:
            print(f"  [avertissement] categorie inconnue '{cat}' pour '{products[i]['nom']}' -> Aides techniques")
            results[i] = "Aides techniques"

    return results


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERREUR : variable d'environnement ANTHROPIC_API_KEY non definie.")
        print("Definissez-la avec : set ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Lire le CSV
    print(f"Lecture de {INPUT}...")
    rows = []
    with open(INPUT, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=DELIM)
        fieldnames = reader.fieldnames or []
        for row in reader:
            rows.append(row)

    print(f"{len(rows)} produits charges.")

    # Traitement par lots
    total_batches = (len(rows) + BATCH_SIZE - 1) // BATCH_SIZE
    stats: dict[str, int] = {}
    errors = 0

    print(f"\nCategorialisation en {total_batches} lots de {BATCH_SIZE} produits...\n")

    for batch_idx in range(total_batches):
        start = batch_idx * BATCH_SIZE
        end = min(start + BATCH_SIZE, len(rows))
        batch = rows[start:end]

        pct = (batch_idx * 100) // total_batches
        print(f"  Lot {batch_idx+1:3d}/{total_batches} ({pct:2d}%)  produits {start+1}-{end}...", end=" ", flush=True)

        try:
            categories = categorize_batch(client, batch)

            for row, cat in zip(batch, categories):
                row['categorie'] = cat
                stats[cat] = stats.get(cat, 0) + 1

            print("OK")

        except anthropic.RateLimitError:
            print("rate limit - attente 10s...")
            time.sleep(10)
            # Réessayer
            try:
                categories = categorize_batch(client, batch)
                for row, cat in zip(batch, categories):
                    row['categorie'] = cat
                    stats[cat] = stats.get(cat, 0) + 1
                print("OK (apres retry)")
            except Exception as e2:
                print(f"ECHEC : {e2}")
                for row in batch:
                    row['categorie'] = "Aides techniques"
                errors += len(batch)

        except Exception as e:
            print(f"ERREUR : {e}")
            for row in batch:
                row['categorie'] = "Aides techniques"
            errors += len(batch)

        # Petite pause pour éviter le rate limit
        if batch_idx < total_batches - 1:
            time.sleep(0.3)

    # Écrire le CSV de sortie
    print(f"\nEcriture de {OUTPUT}...")
    with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=DELIM, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    # Résumé
    print(f"\nFINI - {len(rows)} produits categorises")
    if errors:
        print(f"  Echecs (fallback Aides techniques) : {errors}")

    total = sum(stats.values())
    print("\nRepartition :")
    for cat in CATEGORIES:
        count = stats.get(cat, 0)
        bar = '#' * (count * 30 // max(total, 1))
        print(f"  {cat:<25} {count:>4} ({count*100//max(total,1):>2}%)  {bar}")


if __name__ == '__main__':
    main()
