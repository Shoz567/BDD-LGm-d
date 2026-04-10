import Link from 'next/link';
import {
  TrendingUp,
  Package,
  FileText,
  BarChart3,
  Users,
  ShoppingCart,
  BookOpen,
  Bot,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

const KPIS = [
  { label: 'CA HT total', value: '128 450 €', delta: '+8%', positive: true, icon: BarChart3, colorClass: 'text-brand-primary', bgClass: 'bg-brand-primary/10' },
  { label: 'Commandes validées', value: '94', delta: '+12%', positive: true, icon: Package, colorClass: 'text-brand-accent', bgClass: 'bg-brand-accent/10' },
  { label: 'Devis en attente', value: '7', delta: '+2', positive: false, icon: FileText, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 border border-amber-100' },
  { label: 'Marge brute', value: '31,2%', delta: '+1,4 pt', positive: true, icon: TrendingUp, colorClass: 'text-blue-500', bgClass: 'bg-blue-50 border border-blue-100' },
];

const MGMT_CARDS = [
  { id: 'clients', href: '/gestion/clients', title: 'Patients', subtitle: 'Dossiers, historique, suivi', metric: '213 actifs', icon: Users, colorClass: 'text-brand-primary', bgClass: 'bg-brand-primary/10' },
  { id: 'commandes', href: '/gestion/commandes', title: 'Commandes', subtitle: 'Suivi, traitement, livraisons', metric: '12 en cours', icon: ShoppingCart, colorClass: 'text-brand-accent', bgClass: 'bg-brand-accent/10', alert: '3 bloquées' },
  { id: 'catalogue', href: '/gestion/catalogue', title: 'Catalogue', subtitle: 'Offres, tarifs HT, 2 470 refs', metric: '4 fournisseurs', icon: BookOpen, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 border border-emerald-100' },
  { id: 'assistant', href: '/gestion/chat', title: 'Assistant IA', subtitle: 'Support technique & commercial', metric: 'En ligne', icon: Bot, colorClass: 'text-purple-600', bgClass: 'bg-purple-50 border border-purple-100', highlight: true },
];

export default function GestionPage() {
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page header */}
      <div className="glass-panel p-6 rounded-2xl animate-fade-in-up">
        <h1 className="text-2xl font-extrabold text-gradient-primary tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-[14px] text-text-muted mt-1 font-medium">
          Pharmacie Aprium · Activité MAD · 2 avril 2026
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {KPIS.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`premium-card p-6 animate-fade-in-up stagger-${index + 1}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bgClass}`}>
                  <Icon className={`h-6 w-6 ${kpi.colorClass}`} />
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold shadow-sm ${
                  kpi.positive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                }`}>
                  {kpi.delta}
                </span>
              </div>
              <p className="text-3xl font-black text-text-main tracking-tight">{kpi.value}</p>
              <p className={`text-[13px] font-bold uppercase tracking-wide mt-1 ${kpi.colorClass}`}>{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Management cards */}
      <div className="glass-panel-strong p-6 rounded-3xl animate-fade-in-up stagger-3">
        <h2 className="text-[14px] font-extrabold text-text-muted uppercase tracking-wider mb-5 flex items-center gap-2">
          <span>⚙️</span> Modules de gestion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MGMT_CARDS.map((card, index) => {
            const Icon = card.icon;
            // stagger limit is 5 in globals.css, to avoid overflow use an upper bound or cycle
            const cardStagger = Math.min((index % 5) + 1, 5) ;
            return (
              <Link
                key={card.id}
                href={card.href}
                className={`group flex flex-col gap-4 rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up stagger-${cardStagger} ${
                  card.highlight
                    ? 'border-purple-200 shadow-[0_4px_16px_rgba(168,85,247,0.08)]'
                    : 'border-[var(--border-base)] shadow-[0_4px_12px_rgba(23,33,43,0.03)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bgClass}`}>
                    <Icon className={`h-6 w-6 ${card.colorClass}`} />
                  </div>
                  {card.alert && (
                    <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white bg-red-500 shadow-sm">
                      <AlertTriangle className="h-3 w-3" />
                      {card.alert}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-[16px] font-extrabold text-text-main group-hover:text-brand-primary transition-colors">{card.title}</p>
                  <p className="text-[13px] text-text-muted mt-1 mb-4 leading-snug">{card.subtitle}</p>
                  <div className="pt-4 border-t border-[var(--border-base)] flex items-center justify-between">
                    <p className={`text-[14px] font-bold ${card.colorClass}`}>{card.metric}</p>
                    <span className={`transition-transform duration-300 group-hover:translate-x-1 ${card.colorClass}`}>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Assistant IA */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-primary-dark to-brand-primary p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <h2 className="text-xl font-extrabold mb-2 flex items-center gap-2 text-white">
            <Bot className="h-6 w-6 text-brand-accent" /> Votre assistant IA est prêt
          </h2>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-xl">
            Commandes, catalogue, devis — posez vos questions directement pour piloter l'activité MAD.
          </p>
        </div>
        <Link
          href="/gestion/chat"
          className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-bold text-brand-primary hover:bg-brand-page hover:shadow-xl hover:scale-105 transition-all"
        >
          Ouvrir l'assistant →
        </Link>
      </div>

    </div>
  );
}
