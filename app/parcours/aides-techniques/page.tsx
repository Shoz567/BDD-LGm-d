import { ParcoursShell } from '@/components/parcours/ParcoursShell';

export const metadata = { title: 'LGm@d — Aides techniques' };

const STEPS = [
  { label: '1. Préhension & cuisine', active: true },
  { label: '2. Habillage', href: '#' },
  { label: '3. Communication', href: '#' },
];

const HINTS = [
  { label: 'Vie quotidienne' },
  { label: 'Indépendance' },
  { label: 'Compensation motrice' },
];

const PRODUCTS = [
  { title: 'Enfile-chaussettes', price: '12,00 €', ref: 'AT-001', badge: 'Vente' },
  { title: 'Pince de préhension 40 cm', price: '18,00 €', ref: 'AT-002', badge: 'Vente' },
  { title: 'Ouvre-bocaux électrique', price: '32,00 €', ref: 'AT-003', badge: 'Vente' },
  { title: 'Couverts ergonomiques (set 4)', price: '45,00 €', ref: 'AT-004', badge: 'Vente' },
  { title: 'Bouton de manchon de fermeture éclair', price: '8,00 €', ref: 'AT-005', badge: 'Vente' },
  { title: 'Chausse-pied long 60 cm', price: '9,00 €', ref: 'AT-006', badge: 'Vente' },
];

export default function AidesTechniquesPage() {
  return (
    <ParcoursShell
      title="Aides techniques"
      subtitle="Simplifier les gestes de la vie quotidienne et maintenir l'indépendance à domicile."
      steps={STEPS}
      hints={HINTS}
      products={PRODUCTS}
      accentColor="#3f7f73"
      nextHref="/parcours"
      nextLabel="← Tous les parcours"
    />
  );
}
