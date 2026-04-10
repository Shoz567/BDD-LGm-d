# Agent Comptoir — Présentation orale

## C'est quoi en une phrase ?

> Un assistant IA qui joue le rôle d'un pharmacien et guide le client pour trouver le bon matériel médical à domicile.

---

## Le problème qu'il résout

Quand quelqu'un arrive en pharmacie pour acheter du matériel médical (déambulateur, fauteuil roulant, lit médicalisé…), le pharmacien doit évaluer le niveau d'autonomie du patient pour recommander le bon équipement.

Aujourd'hui, cette évaluation :
- Prend du temps en pharmacie
- Dépend du pharmacien disponible
- N'est pas toujours bien faite (grille AGGIR complexe)

**L'agent comptoir automatise et standardise ce processus.**

---

## Ce que fait concrètement l'agent

1. Il pose **15 questions** au client (ou à son aidant), une par une, sous forme de conversation naturelle
2. Chaque réponse lui permet d'estimer le **niveau d'autonomie du patient** (score GIR, de 1 à 6)
3. À la fin, il génère une **liste de produits recommandés**, adaptés au profil du patient
4. Il produit aussi un **résumé clinique** que le pharmacien peut consulter

---

## Les questions posées (dans les grandes lignes)

- Est-ce que c'est le patient ou un aidant qui répond ?
- L'âge, le sexe
- La cohérence, l'orientation (cognitif)
- La mobilité, les déplacements
- L'autonomie pour se laver, s'habiller, manger
- La continence
- La situation récente (chute, hospitalisation…)
- Les priorités du patient
- Est-ce qu'il y a une ordonnance ?

---

## Le score GIR — c'est quoi ?

La **grille AGGIR** est l'outil officiel utilisé en France pour évaluer la dépendance des personnes âgées.

Elle donne un score de 1 à 6 :
- **GIR 1** → dépendance totale (alité, sans communication)
- **GIR 6** → totalement autonome

L'agent calcule ce score automatiquement à partir des réponses, sans que le pharmacien ait à remplir le formulaire manuellement.

> GIR 1-2 = éligible à l'APA (Allocation Personnalisée d'Autonomie)

---

## Ce qui le rend "intelligent"

- Il ne pose jamais la même question deux fois
- Il **saute des questions** si elles sont inutiles (ex : si le patient est en fauteuil roulant, pas besoin de demander ses déplacements extérieurs)
- Il **adapte son ton** : plus doux si c'est un aidant épuisé, plus direct si c'est le patient lui-même
- Il parle de façon naturelle, pas comme un formulaire

---

## Les recommandations produits

Une fois l'évaluation terminée, l'agent :
1. Génère une description du profil patient
2. Cherche dans une base de données de produits médicaux (via recherche sémantique)
3. Classe les produits par pertinence
4. Explique en 1-2 phrases **pourquoi** chaque produit est adapté

---

## Les fonctionnalités bonus

- **Vocal** : l'agent peut lire ses réponses à voix haute (pratique pour les personnes âgées)
- **Dictée** : le client peut répondre à la voix
- **OCR** : on peut prendre en photo une ordonnance, l'agent l'analyse
- **Rapport clinique** : vue résumée pour le pharmacien
- **Profils démo** : des patients fictifs pour tester l'outil

---

## Pour qui c'est fait ?

| Utilisateur | Usage |
|-------------|-------|
| **Le pharmacien** | Délègue l'évaluation initiale, gagne du temps |
| **Le patient** | Reçoit une recommandation personnalisée sans attendre |
| **L'aidant** | Peut faire l'évaluation depuis chez lui |

---

## En résumé (à dire à l'oral)

> L'agent comptoir, c'est un pharmacien virtuel. Il pose les bonnes questions, évalue l'autonomie du patient avec la grille officielle AGGIR, et recommande le matériel médical adapté. L'objectif : gagner du temps en pharmacie, standardiser les évaluations, et mieux orienter les patients vers le bon équipement.
