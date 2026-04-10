import { ParcoursShell } from '@/components/parcours/ParcoursShell';

export const metadata = { title: 'LGm@d — Aide à la marche' };

const STEPS = [
  { label: '1. Cannes de marche', active: true },
  { label: '2. Déambulateurs & rollators', href: '#' },
  { label: '3. Rollators techniques', href: '#' },
];

const HINTS = [
  { label: 'Appui léger' },
  { label: 'Prévention des chutes' },
  { label: 'Marche autonome' },
];

const PRODUCTS = [
  { title: 'Canne anglaise', price: '12,00 €', ref: 'CA-001', badge: 'Vente' },
  { title: 'Canne pliante', price: '15,00 €', ref: 'CA-002', badge: 'Vente' },
  { title: 'Canne derby', price: '16,00 €', ref: 'CA-003', badge: 'Vente' },
  { title: 'Canne quad', price: '28,00 €', ref: 'CA-004', badge: 'Vente' },
  { title: 'Béquilles axillaires', price: '22,00 €', ref: 'CA-005', badge: 'Vente' },
  { title: 'Béquilles avant-bras', price: '18,00 €', ref: 'CA-006', badge: 'Vente' },
];

export default function AideMarchePage() {
  return (
    <ParcoursShell
      title="Aide à la marche"
      subtitle="Orientez rapidement vers la solution adaptée selon le niveau d'appui et d'autonomie."
      steps={STEPS}
      hints={HINTS}
      products={PRODUCTS}
      nextHref="/parcours/chambre"
      nextLabel="Parcours chambre →"
    />
  );
}
