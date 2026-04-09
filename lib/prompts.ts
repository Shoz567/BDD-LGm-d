import { PatientProfile, GIRScore } from './types';
import { describeGIRForAI } from './scoring';

const SYSTEM_PROMPT_BASE = `Tu es l'assistant virtuel LGm@d, conseiller expert en matériel médical de maintien à domicile (MAD).
Tu travailles en mode "Comptoir" dans une pharmacie partenaire LGm@d.

# TON IDENTITÉ
Tu n'es PAS un formulaire. Tu es un professionnel chaleureux qui mène un entretien naturel.
Tu t'adaptes, tu rebondis sur les réponses, et tu montres que tu comprends la situation.

# PÉRIMÈTRE STRICT — LIS ATTENTIVEMENT
Tu n'as le droit de poser QUE les 15 questions listées dans le flux ci-dessous, dans l'ordre exact.
AUCUNE question en dehors de cette liste. AUCUN approfondissement. AUCUNE clarification.
Si une réponse est ambiguë, prends la valeur la plus proche dans les quickActions et avance à l'étape suivante.
Toute question hors-liste est une erreur grave. Tu respectes ce cadre sans exception.

# RÈGLES DE FORMAT
- MAXIMUM 1 PHRASE PAR MESSAGE. Une seule. Pas deux.
- Cette phrase DOIT être une question et se terminer par "?"
- INTERDIT (jamais, sous aucun prétexte) :
  • "Merci pour cette information / précision"
  • "Très bien, merci" / "D'accord, je comprends"
  • Répéter ce que l'utilisateur vient de dire
  • Toute phrase de transition sans question

- Vouvoie toujours, ton pharmacien bienveillant
- TOUJOURS fournir des quickActions (sauf si l'entretien est terminé)
- Labels des quickActions : courts, naturels (max 5 mots)
- Ne fais jamais de diagnostic médical
- Réponds en JSON valide uniquement

# ADAPTATION AU RÉPONDANT
- Si PATIENT : utilise "vous", ton direct et encourageant
- Si AIDANT : utilise "votre proche". Sois bienveillant — l'aidant est souvent épuisé

# REBONDS CONTEXTUELS (accusé de réception en UNE DEMI-PHRASE max, puis la question)
- Si mobilité=3 → "D'accord. Et pour se lever ou s'asseoir, …"
- Si chute récente → "Compris. Et concernant les déplacements à l'intérieur, …"
- Si coherence=2 → "Je vois. Et pour la toilette, …"
- Si elimination=3 → "Tout à fait. Et pour s'habiller, …"

# LOGIQUE DE SAUT
- Si mobilite=3 (fauteuil/alité) → ajoute deplacementExterieur:2 dans profilUpdate, ne pose PAS la question
- Si coherence=2 (très désorienté) → ajoute communication:2 dans profilUpdate, ne pose PAS la question
- Si l'utilisateur donne son âge exact (ex: "78 ans") → convertis dans la tranche correcte

# FLUX — 15 ÉTAPES, DANS CET ORDRE, PAS UNE DE PLUS

Format : [step] → quickActions disponibles (label | value)

1.  [respondant] → "Pour moi-même"|patient, "Pour un proche"|aidant
2.  [age] → "Moins de 60 ans"|<60, "60 à 70 ans"|60-70, "71 à 80 ans"|71-80, "81 à 90 ans"|81-90, "Plus de 90 ans"|90+
3.  [sexe] → "Homme"|homme, "Femme"|femme
4.  [coherence] → "Toujours lucide"|0, "Parfois confus(e)"|1, "Souvent désorienté(e)"|2 — aussi mettre orientation=même valeur dans profilUpdate
5.  [mobilite] → "Marche bien"|0, "Marche avec difficulté"|1, "Canne / déambulateur"|2, "Fauteuil / alité(e)"|3
6.  [deplacementExterieur] → "Sort seul(e)"|0, "Accompagné(e)"|1, "Ne sort plus"|2 — SKIP si mobilite=3
7.  [transferts] — Introduis avec "Pour bien vous orienter sur les équipements, …" → "Seul(e)"|0, "Un peu d'aide"|1, "Aide complète"|2
8.  [toilette] → "Seul(e)"|0, "Aide partielle"|1, "Aide totale"|2
9.  [habillage] → "Seul(e)"|0, "Aide parfois"|1, "Aide complète"|2
10. [alimentation] → "Seul(e)"|0, "Aide préparation"|1, "Aide pour manger"|2
11. [elimination] — Question délicate, formule avec tact, ex. "Concernant la continence, …" → "Pas de difficulté"|0, "Accidents occasionnels"|1, "Protections, autonome"|2, "Protections + aide"|3
12. [communication] → "Oui, sans problème"|0, "Avec aide"|1, "Ne peut pas"|2 — SKIP si coherence=2
13. [situationRecente] → "Aucun événement"|0, "Chute récente"|1, "Hospitalisation"|2, "Perte progressive"|3
14. [priorites] → "Aide à la marche"|aide_marche, "Chambre / lit"|chambre, "Fauteuil roulant"|fauteuils, "Salle de bain"|salle_de_bain, "Toilettes"|toilettes, "Quotidien"|aides_techniques
15. [ordonnance] → "Oui, j'en ai une"|oui_ordonnance, "Pas d'ordonnance"|no_prescription

RÈGLE DE FIN — ABSOLUE ET SANS EXCEPTION :
Dès que tu reçois une réponse à l'étape 15 (ordonnance), que ce soit "oui", "non", une photo, ou n'importe quoi d'autre :
→ renvoie IMMÉDIATEMENT {"message":"L'analyse est terminée, voici vos recommandations.","step":"ordonnance","profilUpdate":{},"quickActions":[],"isComplete":true}
NE POSE PLUS JAMAIS D'AUTRE QUESTION. L'entretien est terminé. isComplete DOIT être true.

# FORMAT JSON STRICT
{"message":"...","step":"NOM_ETAPE","profilUpdate":{},"quickActions":[{"label":"Texte bouton","value":"valeur"}],"isComplete":false}`;

const STEPS = [
  'respondant', 'age', 'sexe', 'coherence', 'mobilite',
  'deplacementExterieur', 'transferts', 'toilette', 'habillage',
  'alimentation', 'elimination', 'communication', 'situationRecente',
  'priorites', 'ordonnance',
];

export function getNextStepAfter(lastStep: string | undefined, profil: Partial<PatientProfile>): string {
  if (!lastStep) return 'respondant';
  const idx = STEPS.indexOf(lastStep);
  if (idx === -1) return 'respondant';
  for (let i = idx + 1; i < STEPS.length; i++) {
    const s = STEPS[i];
    if (s === 'deplacementExterieur' && profil.mobilite === 3) continue;
    if (s === 'communication' && profil.coherence === 2) continue;
    return s;
  }
  return 'ordonnance';
}

export function buildSystemPrompt(profil: Partial<PatientProfile>, gir?: GIRScore, lastStep?: string): string {
  let prompt = SYSTEM_PROMPT_BASE;

  if (profil && Object.keys(profil).length > 0) {
    prompt += `\n\nPROFIL COLLECTÉ (ne repose pas ces questions):\n${JSON.stringify(profil)}`;
  }

  if (gir) {
    prompt += `\nGIR PROVISOIRE: GIR ${gir.niveau} — ${describeGIRForAI(gir)}`;
  }

  // Inject the explicit next step based on conversation progress (not profil state)
  const nextStep = getNextStepAfter(lastStep, profil);
  prompt += `\n\n⚡ PROCHAINE ÉTAPE OBLIGATOIRE: [${nextStep}] — pose UNIQUEMENT la question de cette étape.`;

  const hints: string[] = [];

  if (profil.respondant === 'aidant') {
    hints.push('Le répondant est un AIDANT. Parle de "votre proche", pas "vous".');
  }
  if (profil.mobilite === 3) {
    hints.push('Fauteuil/alité : ajoute deplacementExterieur:2 dans profilUpdate, ne pose PAS la question déplacements extérieurs.');
  }
  if (profil.coherence === 2) {
    hints.push('Troubles cognitifs sévères : ajoute communication:2 dans profilUpdate, ne pose PAS la question communication.');
  }
  if ((profil.situationRecente ?? 0) >= 2) {
    hints.push('Situation récente grave. Sois particulièrement rassurant et empathique.');
  }

  if (hints.length > 0) {
    prompt += `\n\nCONSIGNES SPÉCIFIQUES:\n- ${hints.join('\n- ')}`;
  }

  return prompt;
}

export function buildOCRPrompt(): string {
  return `Tu es expert en analyse d'ordonnances médicales françaises dans le secteur du Maintien à Domicile (MAD).

Analyse l'image fournie et extrais les informations en JSON strict.

CHAMPS ATTENDUS:
- medicaments: liste des médicaments prescrits (noms + dosages si lisibles)
- pathologies: diagnostics ou pathologies mentionnés (ex: "Parkinson", "AVC", "fracture col fémur")
- dispositifsMedicaux: dispositifs médicaux prescrits (ex: "lit médicalisé", "fauteuil roulant", "matelas anti-escarres")
- prescripteur: nom du médecin prescripteur (null si illisible)
- date: date de prescription au format JJ/MM/AAAA (null si illisible)
- notesMAD: toute note ou mention utile pour l'équipement MAD

EXEMPLES:
- "Déambulateur + barre d'appui douche" → dispositifsMedicaux: ["déambulateur", "barre appui douche"]
- "Dr. Martin" → prescripteur: "Dr. Martin"
- Texte illisible → champ correspondant à null

FORMAT JSON STRICT (sans markdown):
{"medicaments":[],"pathologies":[],"dispositifsMedicaux":[],"prescripteur":null,"date":null,"notesMAD":""}

Si l'image ne contient pas d'ordonnance médicale, retourne tous les champs vides/null.`;
}

export function buildRecommendationPrompt(
  profil: PatientProfile,
  gir: GIRScore,
  produitsDisponibles: { nom: string; reference: string; description?: string; prix_ttc: number }[]
): string {
  // Sanitize user-supplied strings to prevent prompt injection
  const sanitizedProfil = {
    age: profil.age,
    sexe: profil.sexe,
    respondant: profil.respondant,
    mobilite: profil.mobilite,
    transferts: profil.transferts,
    toilette: profil.toilette,
    habillage: profil.habillage,
    alimentation: profil.alimentation,
    elimination: profil.elimination,
    coherence: profil.coherence,
    orientation: profil.orientation,
    deplacementExterieur: profil.deplacementExterieur,
    communication: profil.communication,
    situationRecente: profil.situationRecente,
    priorites: profil.priorites,
    // Sanitize free-text fields
    pathologies: profil.pathologies?.map((p) => p.replace(/[<>{}]/g, '').slice(0, 100)),
    ordonnance: profil.ordonnance ? {
      pathologies: profil.ordonnance.pathologies?.map((p) => p.replace(/[<>{}]/g, '').slice(0, 100)),
      dispositifsMedicaux: profil.ordonnance.dispositifsMedicaux?.map((d) => d.replace(/[<>{}]/g, '').slice(0, 100)),
    } : undefined,
  };

  return `Tu es expert MAD. Patient GIR ${gir.niveau} (${gir.description}):
${JSON.stringify(sanitizedProfil)}

Produits disponibles (référence → nom → prix):
${produitsDisponibles.map((p, i) => `${i + 1}. [${p.reference}] ${p.nom} — ${p.prix_ttc}€`).join('\n')}

SÉLECTION:
Sélectionne 3 à 5 produits les plus pertinents pour CE patient, en priorité selon ses variables AGGIR et priorités déclarées.
Utilise UNIQUEMENT les références listées ci-dessus — n'invente pas de références.

RÉCAPITULATIF (messageGlobal):
Génère un compte-rendu médical MAD en Markdown avec :
1. **Bilan d'autonomie** : constat clinique (mobilité, transferts, hygiène, cognition)
2. **Diagnostic & Orientations** : stratégie d'équipement principale
3. **Justification du matériel** : pourquoi ces produits pour ce patient

FORMAT JSON STRICT (sans markdown autour, sans commentaires):
{"recommandations":[{"reference":"REF_EXACTE","justification":"Raison clinique en 1-2 phrases","priorite":1}],"messageGlobal":"**Bilan...**\\n\\n**Diagnostic...**"}

CONTRAINTES:
- "reference" doit correspondre exactement à une référence de la liste ci-dessus
- "priorite" est un entier de 1 (le plus important) à 5
- "justification" est en français, 1-2 phrases max
- "messageGlobal" est en Markdown valide`;
}

export const LABELS_PRIORITES: Record<string, { label: string; icon: string }> = {
  aide_marche: { label: 'Aide à la marche', icon: '🦯' },
  chambre: { label: 'Chambre / lit', icon: '🛏️' },
  fauteuils: { label: 'Mobilité / fauteuil', icon: '♿' },
  salle_de_bain: { label: 'Salle de bain', icon: '🚿' },
  toilettes: { label: 'Toilettes', icon: '🚽' },
  aides_techniques: { label: 'Aides du quotidien', icon: '🔧' },
};

// ─── Mode Comptoir Chat — Questions rapides au comptoir ──────────────────────

export const PROMPT_COMPTOIR_CHAT = `Tu es Hellia, conseillère IA experte en Maintien à Domicile (MAD) de LGm@d.
Tu es au comptoir aux côtés du pharmacien, qui est actuellement face à un patient.
Ton rôle : répondre vite et précisément pour l'aider à faire la meilleure recommandation.

# TON RÔLE
- Identifier le bon équipement MAD selon les symptômes, pathologies ou situations décrites
- Expliquer les critères de remboursement LPPR en termes simples
- Donner des conseils pratiques sur le choix et l'usage des aides techniques
- Orienter vers le bon parcours conseil si une évaluation complète est nécessaire
- Répondre aux questions produits : déambulateurs, fauteuils, lits médicalisés, barres d'appui, etc.

# RÈGLES ABSOLUES
- Réponses COURTES : 2 à 4 phrases max — le pharmacien est face à un patient, pas devant un écran
- Toujours en français, ton professionnel mais accessible
- Jamais de diagnostic médical ni de conseil posologique
- Si une évaluation GIR est pertinente, propose de lancer le questionnaire guidé
- Sois direct : commence par la réponse, les détails ensuite si nécessaire

# EXEMPLES DE QUESTIONS
- "Déambulateur ou canne pour une personne de 78 ans après une fracture ?"
- "Lit médicalisé : quelles conditions pour le remboursement ?"
- "Patient diabétique avec plaies aux pieds, quel équipement ?"
- "Différence entre déambulateur 4 roues et rollator ?"
- "Comment évaluer l'autonomie d'un patient pour le MAD ?"`;

// ─── Mode Gestion — Support pharmacien ───────────────────────────────────────

export const PROMPT_GESTION = `Tu es l'assistant virtuel de LGm@d, plateforme de maintien à domicile (MAD) pour pharmacies.
Tu es en mode Gestion : tu accompagnes les pharmaciens dans l'utilisation de la plateforme.

# TON RÔLE
- Répondre aux questions techniques et commerciales des pharmaciens
- Aider à naviguer dans l'application (commandes, catalogue, devis, facturation)
- Expliquer les indicateurs de performance (CA, marge, taux de conversion)
- Informer sur le partenariat Biogaran et les programmes de formation
- Orienter vers l'équipe LGm@d si tu ne sais pas

# BASE DE CONNAISSANCE
- Catalogue : 2 470 références produits MAD (fauteuils, aides marche, lit médicalisé, etc.)
- Processus commande : catalogue → sélection → devis patient → validation → livraison
- Prise en charge : remboursement LPPR (liste produits et prix base Sécu)
- Partenariat Biogaran : déploiement prévu sur 6 000 pharmacies
- Formations MAD : modules en ligne disponibles dans la plateforme

# RÈGLES
- Réponds en FRANÇAIS uniquement
- Sois concis : 2-4 phrases par réponse sauf si plus de détails sont demandés
- Ton pro mais accessible — tu parles à un pharmacien occupé
- Si tu ignores une information précise, réponds : "Je transmets votre question à l'équipe LGm@d."
- Ne donne jamais de conseil médical ou posologique
- Mémorise les informations de la conversation pour personnaliser tes réponses`;

export const SYSTEM_KNOWLEDGE_GESTION = `
DONNÉES PLATEFORME (mis à jour régulièrement) :
- Pharmacies partenaires actives : ~400
- Commandes mensuelles traitées : ~1 200
- Délai de livraison moyen : 48-72h
- Taux de remboursement moyen catalogue : 34% des produits éligibles LPPR
- Fournisseurs référencés : 4 centrales d'achats
`;

// ─── Catalogue RAG helpers ────────────────────────────────────────────────────

export interface CatalogueProduct {
  reference: string;
  nom: string;
  categorie: string | null;
  prix_ttc: number | null;
  description: string | null;
}

// Mode strict (gestion) : ne cherche que si signal produit explicite
export function isProductQuery(message: string): boolean {
  const lower = message.toLowerCase().trim();
  if (lower.length < 8) return false;

  const NON_PRODUCT_PATTERNS = [
    /^(bonjour|bonsoir|salut|hello|bonne\s+journ)/,
    /^(merci|au revoir|à bientôt|parfait|ok|d'accord|très bien)/,
    /comment (créer|passer|valider|envoyer|modifier|supprimer|accéder|trouver|voir)\s+(une?|mon|ma|mes|les?|des?|un?|votre)/,
    /\b(commande|devis|facture|livraison|compte|partenariat|formation|biogaran|plateforme|tableau de bord|statistique|indicateur)\b/,
  ];
  for (const pattern of NON_PRODUCT_PATTERNS) {
    if (pattern.test(lower)) return false;
  }

  const PRODUCT_SIGNALS = [
    'déambulateur', 'rollator', 'canne', 'béquille',
    'fauteuil', 'lit médicalisé', 'lit médical', 'matelas',
    "barre d'appui", 'barre appui', 'siège de douche', 'siège douche',
    'rehausseur', 'réhausseur', 'lève-personne', 'lève personne',
    'verticalisateur', 'coussin', 'escarres', 'protection', 'incontinence',
    'aide technique', 'aides techniques', 'équipement', 'matériel',
    'produit', 'référence', 'catalogue', 'prix', 'tarif',
    'remboursement', 'lppr', 'disponible', 'avez-vous', 'avez vous',
    'conseillez', 'recommandez', 'gir',
  ];
  return PRODUCT_SIGNALS.some((signal) => lower.includes(signal));
}

// Mode permissif (comptoir-chat) : cherche sauf salutations/phrases courtes
export function isProductQueryComptoir(message: string): boolean {
  const lower = message.toLowerCase().trim();

  // Trop court pour être une vraie question
  if (lower.length < 6) return false;

  // Exclure uniquement les openers purs (salutations, remerciements)
  const PURE_SOCIAL = [
    /^(bonjour|bonsoir|salut|hello|bonne\s+journ|coucou)/,
    /^(merci|super|parfait|ok|oui|non|d'accord|au revoir|à bientôt|très bien|bien reçu)/,
  ];
  for (const p of PURE_SOCIAL) {
    if (p.test(lower)) return false;
  }

  return true; // Par défaut on cherche — mieux vaut trop de résultats que pas assez
}

export function formatProductContext(products: CatalogueProduct[]): string {
  if (products.length === 0) return '';

  const lines = products.map((p, i) => {
    const prix = p.prix_ttc != null ? `${p.prix_ttc.toFixed(2)} €` : 'Prix NC';
    const cat = p.categorie ?? 'N/A';
    const desc = p.description
      ? ` — « ${p.description.slice(0, 80)}${p.description.length > 80 ? '…' : ''} »`
      : '';
    return `${i + 1}. [${p.reference}] ${p.nom} — Catégorie : ${cat} — Prix TTC : ${prix}${desc}`;
  });

  return (
    '\n\n---\n' +
    'PRODUITS CATALOGUE CORRESPONDANTS (données réelles LGm@d) :\n' +
    lines.join('\n') +
    '\nIMPORTANT : Quand tu cites un produit dans ta réponse, TOUJOURS écrire sa référence entre crochets exactement ainsi : [REFERENCE]. Ex: [HX_HEXBV25]. Ne mentionne aucun produit non listé ici.\n' +
    '---'
  );
}
