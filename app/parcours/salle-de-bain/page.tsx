import { ParcoursShell } from '@/components/parcours/ParcoursShell';

export const metadata = { title: 'LGm@d — Salle de bain' };

const STEPS = [
  { label: '1. Barres & sièges', active: true },
  { label: '2. Douche & baignoire', href: '#' },
  { label: '3. Antidérapants', href: '#' },
];

const HINTS = [
  { label: 'Sécurisation' },
  { label: 'Prévention des chutes' },
  { label: 'Autonomie toilette' },
];

const PRODUCTS = [
  { title: 'Barre de douche murale pliable', price: '68,00 €', ref: 'SDB-001', badge: 'Vente' },
  { title: 'Siège de douche rabattable', price: '95,00 €', ref: 'SDB-002', badge: 'Vente' },
  { title: 'Chaise de bain pivotante', price: '185,00 €', ref: 'SDB-003', badge: 'Vente' },
  { title: 'Planche de bain', price: '45,00 €', ref: 'SDB-004', badge: 'Vente' },
  { title: "Barre d'appui verticale", price: '38,00 €', ref: 'SDB-005', badge: 'Vente' },
  { title: 'Tapis antidérapant baignoire', price: '18,00 €', ref: 'SDB-006', badge: 'Vente' },
];

export default function SalleDeBainPage() {
  return (
    <ParcoursShell
      title="Salle de bain"
      subtitle="Sécuriser les usages et prévenir les chutes dans la salle de bain."
      steps={STEPS}
      hints={HINTS}
      products={PRODUCTS}
      accentColor="#4fa7a1"
      nextHref="/parcours/toilettes"
      nextLabel="Parcours toilettes →"
    />
  );
}
