/**
 * Authoritative label map for each step's quick action values.
 * Used server-side to correct model responses that may use raw values as labels.
 */
export const STEP_QUICK_ACTIONS: Record<string, { label: string; value: string }[]> = {
  respondant: [
    { label: '👤 Pour moi-même', value: 'patient' },
    { label: '🤝 Pour un proche', value: 'aidant' },
  ],
  age: [
    { label: 'Moins de 60 ans', value: '<60' },
    { label: '60 à 70 ans', value: '60-70' },
    { label: '71 à 80 ans', value: '71-80' },
    { label: '81 à 90 ans', value: '81-90' },
    { label: 'Plus de 90 ans', value: '90+' },
  ],
  sexe: [
    { label: 'Homme', value: 'homme' },
    { label: 'Femme', value: 'femme' },
  ],
  coherence: [
    { label: 'Toujours lucide', value: '0' },
    { label: 'Parfois confus(e)', value: '1' },
    { label: 'Souvent désorienté(e)', value: '2' },
  ],
  mobilite: [
    { label: 'Marche bien', value: '0' },
    { label: 'Marche avec difficulté', value: '1' },
    { label: 'Utilise canne / déambulateur', value: '2' },
    { label: 'Fauteuil roulant / alité(e)', value: '3' },
  ],
  deplacementExterieur: [
    { label: 'Sort seul(e)', value: '0' },
    { label: 'Sort accompagné(e)', value: '1' },
    { label: 'Ne sort plus', value: '2' },
  ],
  transferts: [
    { label: 'Seul(e) sans problème', value: '0' },
    { label: 'Un peu d\'aide', value: '1' },
    { label: 'Aide complète', value: '2' },
  ],
  toilette: [
    { label: 'Seul(e)', value: '0' },
    { label: 'Aide partielle', value: '1' },
    { label: 'Aide totale', value: '2' },
  ],
  habillage: [
    { label: 'Seul(e)', value: '0' },
    { label: 'Aide parfois', value: '1' },
    { label: 'Aide complète', value: '2' },
  ],
  alimentation: [
    { label: 'Seul(e)', value: '0' },
    { label: 'Aide pour préparer', value: '1' },
    { label: 'Aide pour manger', value: '2' },
  ],
  elimination: [
    { label: 'Continent(e)', value: '0' },
    { label: 'Accidents occasionnels', value: '1' },
    { label: 'Protections, autonome', value: '2' },
    { label: 'Protections + aide', value: '3' },
  ],
  communication: [
    { label: 'Oui, sans problème', value: '0' },
    { label: 'Avec de l\'aide', value: '1' },
    { label: 'Ne peut pas', value: '2' },
  ],
  situationRecente: [
    { label: 'Aucun événement récent', value: '0' },
    { label: 'Chute récente', value: '1' },
    { label: 'Hospitalisation récente', value: '2' },
    { label: 'Perte d\'autonomie progressive', value: '3' },
  ],
  priorites: [
    { label: '🦯 Aide à la marche', value: 'aide_marche' },
    { label: '🛏️ Chambre / lit', value: 'chambre' },
    { label: '♿ Fauteuil / mobilité', value: 'fauteuils' },
    { label: '🚿 Salle de bain', value: 'salle_de_bain' },
    { label: '🚽 Toilettes', value: 'toilettes' },
    { label: '🔧 Aides du quotidien', value: 'aides_techniques' },
  ],
  ordonnance: [
    { label: '✅ Oui, j\'ai une ordonnance', value: 'oui_ordonnance' },
    { label: '❌ Non, pas d\'ordonnance', value: 'no_prescription' },
  ],
};

/**
 * Fix quickAction labels: if the model used a raw value as label, replace with the canonical label.
 */
export function fixQuickActionLabels(
  step: string | undefined,
  quickActions: { label: string; value: string }[]
): { label: string; value: string }[] {
  if (!step) return quickActions;

  const canonical = STEP_QUICK_ACTIONS[step];
  if (!canonical) return quickActions;

  // If model returned correct count, just override labels using value as key
  const labelByValue = Object.fromEntries(canonical.map((a) => [a.value, a.label]));

  const fixed = quickActions.map((action) => ({
    value: action.value,
    label: labelByValue[action.value] ?? labelByValue[String(action.value)] ?? action.label,
  }));

  // If model returned no or wrong actions, fall back to canonical set
  const hasValidLabels = fixed.some((a) => a.label && a.label !== a.value);
  return hasValidLabels ? fixed : canonical;
}
