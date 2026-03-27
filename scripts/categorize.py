"""
Catégorisation automatique du catalogue MAD en 6 catégories.
Lit catalogue_aprium_mad_nsi_final.csv et produit un nouveau CSV avec la colonne 'categorie' remplie.
"""

import csv
import re
import sys

INPUT  = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_aprium_mad_nsi_final.csv"
OUTPUT = r"c:\Users\Utilisateur\Desktop\BDD7\CSV\catalogue_categorise.csv"
DELIM  = "|"

# ──────────────────────────────────────────────────────────────────────────────
# Règles de catégorisation — ordre = priorité (première règle gagne)
# ──────────────────────────────────────────────────────────────────────────────

RULES = [
    # ── Fauteuils roulants ♿ ──────────────────────────────────────────────
    ("Fauteuils roulants", [
        r"fauteuil roulant",
        r"fauteuil (de )?transfert",
        r"fauteuil action",
        r"fauteuil ergo",
        r"action \d",
        r"stan up",
        r"wheeleo.*fauteuil",
        r"fauteuil.*électrique",
        r"fauteuil.*électrique.*pliant",
        r"fauteuil.*actif",
        r"fauteuil.*alumin",
        r"fauteuil.*pliable",
        r"fauteuil.*transit",
        r"fauteuil.*nitrum",
        r"alber.*fauteuil",
        r"assistance électrique.*propulsion",
    ]),

    # ── Aide à la marche 🦯 ────────────────────────────────────────────────
    ("Aide à la marche", [
        r"rollator",
        r"canne (anglaise|pliante|derby|maginot|anatomique|fantaisie|t\b)",
        r"\bcanne\b",
        r"déambulateur",
        r"cadre de marche",
        r"béquille",
        r"wheeleo",
        r"tripode",
        r"quadripode",
        r"marchette",
        r"aide.*(marche|mobilité)",
        r"marche.*aide",
        r"verrou anti.?ejection",
        r"appui opti",
        r"accroche.?canne",
    ]),

    # ── Toilettes 🚽 ───────────────────────────────────────────────────────
    ("Toilettes", [
        r"chaise percée",
        r"chaise garde.?robe",
        r"garde.?robe",
        r"chaise.*commode",
        r"commode.*chaise",
        r"rehausseur.*wc",
        r"rehausseur.*toilette",
        r"siège.*wc",
        r"siège.*toilette",
        r"cadre.*wc",
        r"seau (pour )?chaise",
        r"seau.*moem",
        r"moem.*seau",
        r"\bwc\b",
        r"toilettes?",
        r"garde robe",
        r"talis.*garde",
    ]),

    # ── Salle de bain 🚿 ───────────────────────────────────────────────────
    ("Salle de bain", [
        r"(chaise|tabouret|siège).*(douche|bain)",
        r"(douche|bain).*(chaise|tabouret|siège)",
        r"tabouret.*réglable",
        r"barre.*appui",
        r"barre.*sécurité",
        r"appui.*baignoire",
        r"baignoire.*appui",
        r"tapis.*(antidérap|bain|douche)",
        r"banc.*bain",
        r"bain.*banc",
        r"planche.*bain",
        r"siège.*bain",
        r"bain.*siège",
        r"(douche|bain).*modulaire",
        r"aquatec",
        r"cascata",  # chaise percée à roulettes Cascata pour salle de bain
        r"moem.*douche",
        r"douche.*moem",
    ]),

    # ── La chambre 🛏️ ───────────────────────────────────────────────────
    ("La chambre", [
        r"drap",
        r"matelas",
        r"oreiller",
        r"alèse",
        r"protège.?matelas",
        r"housse.*matelas",
        r"taie",
        r"arceau.*lit",
        r"lit.*arceau",
        r"table.*lit",
        r"lit.*table",
        r"lève.?personne",
        r"lève.?patient",
        r"fauteuil releveur",
        r"releveur.*fauteuil",
        r"initio.*fauteuil",
        r"fauteuil.*initio",
        r"pico.*releveur",
        r"releveur.*pico",
        r"coussin.*(positionnement|décubitus|abduction|triangulaire|cylindrique|demi.?lune|universel|galbé|alova|kalli|visco|poz in form|careware)",
        r"poz in form",
        r"kalli.*visco",
        r"visco.*kalli",
        r"coussins kalli",
        r"coussins.*(escarre|anti.?escarre)",
        r"anti.?escarre",
        r"drap.*glisse",
        r"glisse.*drap",
        r"sangle.*transfert",
        r"transfert.*sangle",
        r"planche.*transfert",
        r"ceinture.*transfert",
        r"roller slide",
        r"birdie",
        r"isa.*lève",
        r"lève.*isa",
        r"verticalis",
        r"télécommande.*verticalis",
        r"lit médicalisé",
        r"médical.*lit",
    ]),
]

FALLBACK = "Aides techniques"

# ──────────────────────────────────────────────────────────────────────────────

def categorize(nom: str) -> str:
    nom_lower = nom.lower()
    for categorie, patterns in RULES:
        for pat in patterns:
            if re.search(pat, nom_lower):
                return categorie
    return FALLBACK


def main():
    stats: dict[str, int] = {}
    rows_out = []

    with open(INPUT, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=DELIM)
        fieldnames = reader.fieldnames or []

        for row in reader:
            nom = row.get('nom', '')
            cat = categorize(nom)
            row['categorie'] = cat
            stats[cat] = stats.get(cat, 0) + 1
            rows_out.append(row)

    with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=DELIM, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"\nOK  Fichier ecrit : {OUTPUT}")
    print(f"    {len(rows_out)} produits traites\n")
    total = sum(stats.values())
    for cat, count in sorted(stats.items(), key=lambda x: -x[1]):
        bar = '#' * (count * 30 // total)
        print(f"  {cat:<25} {count:>4} ({count*100//total:>2}%)  {bar}")

if __name__ == '__main__':
    main()
