import { ParcoursShell } from '@/components/parcours/ParcoursShell';

export const metadata = { title: 'LGm@d — Fauteuils roulants' };

const STEPS = [
  { label: '1. FRM manuel', active: true },
  { label: '2. FRM électrique', href: '#' },
  { label: '3. Fauteuil releveur', href: '#' },
];

const HINTS = [
  { label: 'Autonomie partielle' },
  { label: 'Déplacements intérieurs' },
  { label: 'Transport & sortie' },
];

const PRODUCTS = [
  { title: 'Fauteuil roulant manuel standard', price: '340,00 €', ref: 'FR-001', badge: 'Location' },
  { title: 'Fauteuil roulant léger aluminium', price: '580,00 €', ref: 'FR-002', badge: 'Vente' },
  { title: 'Fauteuil roulant électrique entrée de gamme', price: '2 400,00 €', ref: 'FR-003', badge: 'Location' },
  { title: 'Fauteuil releveur 2 moteurs', price: '1 800,00 €', ref: 'FR-004', badge: 'Location' },
  { title: 'Coussin anti-escarres gel', price: '85,00 €', ref: 'FR-005', badge: 'Vente' },
  { title: 'Gilet de positionnement', price: '55,00 €', ref: 'FR-006', badge: 'Vente' },
];

export default function FauteuilsPage() {
  return (
    <ParcoursShell
      title="Fauteuils roulants"
      subtitle="Trouver la solution de mobilité adaptée selon le niveau d'autonomie et le cadre de vie."
      steps={STEPS}
      hints={HINTS}
      products={PRODUCTS}
      accentColor="#7b6bb3"
      nextHref="/parcours/salle-de-bain"
      nextLabel="Parcours salle de bain →"
    />
  );
}
