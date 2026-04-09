import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const COMMANDES = [
  { id: 'CMD-2847', patient: 'M. Dupont Bernard', produit: 'Déambulateur 4 roues Invacare', statut: 'En livraison', date: '31/03/2026', montant: '189 €', statusClass: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Truck },
  { id: 'CMD-2846', patient: 'Mme Lefebvre Marie', produit: 'Lit médicalisé électrique 3 plans', statut: 'Confirmée', date: '30/03/2026', montant: '1 240 €', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  { id: 'CMD-2845', patient: 'M. Martin Robert', produit: 'Fauteuil roulant manuel léger', statut: 'Bloquée', date: '29/03/2026', montant: '345 €', statusClass: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle },
  { id: 'CMD-2844', patient: 'Mme Moreau Simone', produit: 'Siège de douche avec accoudoirs', statut: 'Livrée', date: '28/03/2026', montant: '89 €', statusClass: 'bg-gray-50 text-gray-600 border border-gray-200', icon: CheckCircle },
];

const STATS = [
  { label: 'En livraison', count: 4, icon: Truck, colorClass: 'text-blue-600', bgClass: 'bg-blue-50 border border-blue-100' },
  { label: 'Confirmées', count: 5, icon: CheckCircle, colorClass: 'text-brand-primary', bgClass: 'bg-brand-primary/8 border border-brand-primary/20' },
  { label: 'Bloquées', count: 3, icon: XCircle, colorClass: 'text-red-600', bgClass: 'bg-red-50 border border-red-200' },
  { label: 'En attente', count: 2, icon: Clock, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 border border-amber-200' },
];

const COLUMNS = ['N° commande', 'Patient', 'Produit', 'Statut', 'Date', 'Montant HT'];

export default function CommandesPage() {
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-primary tracking-tight">Commandes</h1>
          <p className="text-[14px] text-text-muted mt-1">12 commandes en cours · 3 bloquées</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-bold">
          <Package className="h-3.5 w-3.5" />
          3 requièrent votre attention
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="premium-card p-5 flex items-center gap-4">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${s.bgClass}`}>
                <Icon className={`h-5 w-5 ${s.colorClass}`} />
              </div>
              <div>
                <p className={`text-2xl font-black ${s.colorClass}`}>{s.count}</p>
                <p className="text-xs text-text-muted font-medium">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="glass-panel-strong rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-base)]">
                {COLUMNS.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-text-muted bg-white/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMMANDES.map((c, i) => {
                const Icon = c.icon;
                return (
                  <tr
                    key={c.id}
                    className={`group hover:bg-brand-primary/3 transition-colors cursor-pointer ${i < COMMANDES.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/8 px-2 py-1 rounded-lg">
                        {c.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-text-main">{c.patient}</td>
                    <td className="px-5 py-4 text-text-muted max-w-[220px] truncate">{c.produit}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${c.statusClass}`}>
                        <Icon className="h-3 w-3" />
                        {c.statut}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap">{c.date}</td>
                    <td className="px-5 py-4 font-bold text-text-main">{c.montant}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
