import { PatientProfile, GIRScore } from './types';

/**
 * Calcul du score GIR v2.1 — Pondéré, aligné sur les 10 variables discriminantes AGGIR
 *
 * Variables AGGIR et poids :
 * - Cohérence  (×2)   — très discriminant GIR 1-2
 * - Orientation (×2)  — très discriminant GIR 1-3
 * - Toilette corporelle (×1.5)
 * - Habillage (×1)
 * - Alimentation (×1)
 * - Élimination/continence (×1.5)
 * - Transferts (×1.5) — discriminant GIR 3-4
 * - Déplacements intérieurs (×1)
 * - Déplacements extérieurs (×0.5)
 * - Communication à distance (×0.5)
 * - Bonus âge 80+ (+1)
 *
 * NOTE : situationRecente n'est PAS une variable AGGIR — elle n'est pas
 * incluse dans le score (évite de sur-estimer la dépendance). Elle est
 * conservée dans le profil pour le contexte des recommandations produits.
 *
 * Seuils validés sur les 6 personas de référence (GIR 1 à 6) :
 *   ≤ 3 → GIR 6 | ≤ 7 → GIR 5 | ≤ 13 → GIR 4
 *   ≤ 20 → GIR 3 | ≤ 23 → GIR 2 | > 23 → GIR 1
 */
export function calculerGIR(profil: Partial<PatientProfile>): GIRScore {
  let score = 0;
  const detail: Record<string, number> = {};

  // Cohérence mentale (×2)
  const coh = (profil.coherence ?? 0) * 2;
  detail['Cohérence'] = coh;
  score += coh;

  // Orientation temporo-spatiale (×2)
  const ori = (profil.orientation ?? 0) * 2;
  detail['Orientation'] = ori;
  score += ori;

  // Toilette corporelle (×1.5)
  const toi = (profil.toilette ?? 0) * 1.5;
  detail['Toilette'] = toi;
  score += toi;

  // Habillage (×1)
  const hab = profil.habillage ?? 0;
  detail['Habillage'] = hab;
  score += hab;

  // Alimentation (×1)
  const ali = profil.alimentation ?? 0;
  detail['Alimentation'] = ali;
  score += ali;

  // Élimination / continence (×1.5)
  const eli = (profil.elimination ?? 0) * 1.5;
  detail['Élimination'] = eli;
  score += eli;

  // Transferts (×1.5)
  const tra = (profil.transferts ?? 0) * 1.5;
  detail['Transferts'] = tra;
  score += tra;

  // Déplacements intérieurs (×1)
  const mob = profil.mobilite ?? 0;
  detail['Mobilité intérieure'] = mob;
  score += mob;

  // Déplacements extérieurs (×0.5)
  const ext = (profil.deplacementExterieur ?? 0) * 0.5;
  detail['Déplacements extérieurs'] = ext;
  score += ext;

  // Communication à distance (×0.5)
  const com = (profil.communication ?? 0) * 0.5;
  detail['Communication'] = com;
  score += com;

  // Bonus âge
  const age = profil.age;
  if (age === '81-90' || age === '90+') {
    score += 1;
    detail['Bonus âge'] = 1;
  }

  const rounded = Math.max(0, Math.min(28, Math.round(score)));
  const gir = scoreToGIR(rounded);

  return {
    niveau: gir.niveau,
    scoreTotal: rounded,
    description: gir.description,
    couleur: gir.couleur,
    eligibleAPA: gir.niveau <= 4,
    detailVariables: detail,
  };
}

function scoreToGIR(score: number): GIRScore {
  // Seuils recalibrés sur score pondéré (max ~28)
  if (score <= 3) {
    return {
      niveau: 6,
      scoreTotal: score,
      description: 'Personne autonome — prévention et confort',
      couleur: '#22c55e',
      eligibleAPA: false,
    };
  }
  if (score <= 7) {
    return {
      niveau: 5,
      scoreTotal: score,
      description: 'Légèrement dépendant — aide ponctuelle',
      couleur: '#84cc16',
      eligibleAPA: false,
    };
  }
  if (score <= 13) {
    return {
      niveau: 4,
      scoreTotal: score,
      description: 'Moyennement dépendant — aide quotidienne',
      couleur: '#eab308',
      eligibleAPA: true,
    };
  }
  if (score <= 20) {
    return {
      niveau: 3,
      scoreTotal: score,
      description: 'Modérément dépendant — aide pluriquotidienne',
      couleur: '#f97316',
      eligibleAPA: true,
    };
  }
  if (score <= 23) {
    return {
      niveau: 2,
      scoreTotal: score,
      description: 'Fortement dépendant — prise en charge lourde',
      couleur: '#ef4444',
      eligibleAPA: true,
    };
  }
  return {
    niveau: 1,
    scoreTotal: score,
    description: 'Dépendance totale — matériel médicalisé complet',
    couleur: '#dc2626',
    eligibleAPA: true,
  };
}

/**
 * Retourne les catégories MAD prioritaires selon le niveau GIR
 */
export function getCategoriesByGIR(niveau: number): string[] {
  const matrice: Record<number, string[]> = {
    6: ['aide_marche', 'salle_de_bain', 'aides_techniques'],
    5: ['aide_marche', 'salle_de_bain', 'toilettes', 'aides_techniques'],
    4: ['chambre', 'salle_de_bain', 'toilettes', 'aide_marche'],
    3: ['fauteuils', 'chambre', 'toilettes', 'aides_techniques'],
    2: ['chambre', 'fauteuils', 'toilettes', 'soins'],
    1: ['chambre', 'fauteuils', 'toilettes', 'soins', 'aides_techniques'],
  };
  return matrice[niveau] ?? matrice[6];
}

/**
 * Description textuelle du GIR pour l'IA
 */
export function describeGIRForAI(gir: GIRScore): string {
  const descriptions: Record<number, string> = {
    6: 'La personne est autonome. Elle peut bénéficier d\'équipements de prévention et de confort (cannes, barres appui, tapis antidérapants).',
    5: 'Légère dépendance. Aides ponctuelles : aide à la marche (rollator, canne), aménagements salle de bain (siège douche, barre), réhausseur WC.',
    4: 'Dépendance modérée. Aide quotidienne : lit médicalisé, réhausseur WC, aménagements, aide aux transferts, potentiellement protections urinaires.',
    3: 'Dépendance notable. Fauteuil roulant ou rollator, matelas anti-escarres, protections urinaires/fécales, lève-personne, aides techniques pour gestes quotidiens.',
    2: 'Forte dépendance. Matériel médicalisé : lit électrique, matelas à air, lève-personne, fauteuil adapté, protections journalières et nocturnes.',
    1: 'Dépendance totale. Package médicalisé complet urgent : lit air anti-escarres, lève-personne motorisé, protections continues, fauteuil coquille/positionnement.',
  };
  return descriptions[gir.niveau] ?? descriptions[6];
}
