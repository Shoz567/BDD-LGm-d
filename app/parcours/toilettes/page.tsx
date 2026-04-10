import { ParcoursShell } from '@/components/parcours/ParcoursShell';

export const metadata = { title: 'LGm@d — Toilettes' };

const STEPS = [
  { label: '1. Cadre de toilette', active: true },
  { label: '2. Rehausseur WC', href: '#' },
  { label: '3. Chaise percée', href: '#' },
];

const HINTS = [
  { label: 'Transferts faciles' },
  { label: 'Stabilité assise' },
  { label: 'Hygiène autonome' },
];

const PRODUCTS = [
  { title: 'Cadre de toilette réglable', price: '55,00 €', ref: 'WC-001', badge: 'Vente' },
  { title: 'Rehausseur WC 10 cm', price: '38,00 €', ref: 'WC-002', badge: 'Vente' },
  { title: 'Rehausseur WC avec accoudoirs', price: '72,00 €', ref: 'WC-003', badge: 'Vente' },
  { title: 'Chaise percée mobile', price: '145,00 €', ref: 'WC-004', badge: 'Location' },
  { title: "Barre d'appui WC murale", price: '45,00 €', ref: 'WC-005', badge: 'Vente' },
  { title: 'Bidet portable', price: '28,00 €', ref: 'WC-006', badge: 'Vente' },
];

export default function ToilettesPage() {
  return (
    <ParcoursShell
      title="Toilettes"
      subtitle="Faciliter les transferts et maintenir l'autonomie aux toilettes au quotidien."
      steps={STEPS}
      hints={HINTS}
      products={PRODUCTS}
      accentColor="#e97123"
      nextHref="/parcours/aides-techniques"
      nextLabel="Parcours aides techniques →"
    />
  );
}
