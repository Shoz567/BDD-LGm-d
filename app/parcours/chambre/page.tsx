import { ParcoursShell } from '@/components/parcours/ParcoursShell';

export const metadata = { title: 'LGm@d — La chambre' };

const STEPS = [
  { label: '1. Lit médicalisé', active: true },
  { label: '2. Barrières & potences', href: '#' },
  { label: '3. Matelas & coussins', href: '#' },
];

const HINTS = [
  { label: 'Aide au lever' },
  { label: 'Confort nocturne' },
  { label: 'Prévention escarres' },
];

const PRODUCTS = [
  { title: 'Lit médicalisé électrique 1 moteur', price: '890,00 €', ref: 'LIT-001', badge: 'Location' },
  { title: 'Lit médicalisé électrique 3 moteurs', price: '1 290,00 €', ref: 'LIT-002', badge: 'Location' },
  { title: 'Potence de lit', price: '45,00 €', ref: 'CH-003', badge: 'Vente' },
  { title: 'Barrière de lit', price: '68,00 €', ref: 'CH-004', badge: 'Vente' },
  { title: 'Matelas anti-escarres mousse', price: '120,00 €', ref: 'CH-005', badge: 'Vente' },
  { title: 'Lève-personne mobile', price: '1 650,00 €', ref: 'CH-006', badge: 'Location' },
];

export default function ChambrePage() {
  return (
    <ParcoursShell
      title="La chambre"
      subtitle="Faciliter le lever, améliorer le confort et prévenir les chutes au lit."
      steps={STEPS}
      hints={HINTS}
      products={PRODUCTS}
      accentColor="#4c7ecf"
      nextHref="/parcours/fauteuils"
      nextLabel="Parcours fauteuils →"
    />
  );
}
