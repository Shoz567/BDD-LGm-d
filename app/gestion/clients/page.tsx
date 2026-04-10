'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Package, Phone, Mail, ChevronRight } from 'lucide-react';

interface SavedPatient {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  notes: string | null;
  gir_niveau: number;
  gir_description: string;
  gir_eligible_apa: boolean;
  produits_recommandes: { reference: string; nom: string; categorie?: string }[];
}

const DEMO_CLIENTS = [
  { nom: 'Dupont Bernard', age: 74, gir: 4, dernierContact: '31/03/2026', materiel: 'Déambulateur, lit médicalisé' },
  { nom: 'Lefebvre Marie', age: 82, gir: 2, dernierContact: '30/03/2026', materiel: 'Fauteuil électrique, matelas anti-escarres' },
  { nom: 'Martin Robert', age: 68, gir: 5, dernierContact: '28/03/2026', materiel: 'Canne, barre d\'appui' },
  { nom: 'Moreau Simone', age: 79, gir: 3, dernierContact: '25/03/2026', materiel: 'Lève-personne, protections' },
];

const GIR_STYLES: Record<number, { badgeClass: string; label: string }> = {
  1: { badgeClass: 'bg-red-50 text-red-700 border border-red-200', label: 'GIR 1' },
  2: { badgeClass: 'bg-red-50 text-red-600 border border-red-200', label: 'GIR 2' },
  3: { badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200', label: 'GIR 3' },
  4: { badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'GIR 4' },
  5: { badgeClass: 'bg-lime-50 text-lime-700 border border-lime-200', label: 'GIR 5' },
  6: { badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'GIR 6' },
};

export default function ClientsPage() {
  const [savedPatients, setSavedPatients] = useState<SavedPatient[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lgmad_patients');
      if (stored) setSavedPatients(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const totalActifs = 213 + savedPatients.length;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-primary tracking-tight">Patients MAD</h1>
          <p className="text-[14px] text-text-muted mt-1">{totalActifs} patients actifs · Historique des équipements</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-primary bg-brand-primary/8 border border-brand-primary/20 px-3 py-1.5 rounded-lg font-bold">
          <Users className="h-3.5 w-3.5" />
          {totalActifs} actifs
        </div>
      </div>

      {/* Patients enregistrés depuis l'évaluation */}
      {savedPatients.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-accent inline-block" />
            Récemment évalués ({savedPatients.length})
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedPatients.map((p) => {
              const gStyle = GIR_STYLES[p.gir_niveau] ?? GIR_STYLES[6];
              const initials = `${p.prenom[0]}${p.nom[0]}`.toUpperCase();
              const date = new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const materiels = p.produits_recommandes.slice(0, 3).map((pr) => pr.nom).join(', ');
              return (
                <Link key={p.id} href={`/gestion/clients/${p.id}`} className="block">
                <div className="premium-card p-5 border-l-4 border-l-brand-accent hover:shadow-md transition-shadow cursor-pointer">
                  {/* Badge nouveau */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary text-sm font-extrabold">
                        {initials}
                      </div>
                      <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-full">
                        Nouveau
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${gStyle.badgeClass}`}>
                        {gStyle.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <p className="font-bold text-text-main mb-1">{p.prenom} {p.nom}</p>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {date}
                    </span>
                    {p.telephone && (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Phone className="h-3 w-3" />
                        {p.telephone}
                      </span>
                    )}
                    {p.email && (
                      <span className="flex items-center gap-1 text-xs text-text-muted truncate max-w-[140px]">
                        <Mail className="h-3 w-3 shrink-0" />
                        {p.email}
                      </span>
                    )}
                  </div>

                  {p.gir_eligible_apa && (
                    <p className="text-[11px] font-semibold text-emerald-600 mb-2">✓ Éligible APA</p>
                  )}

                  {materiels && (
                    <div className="flex items-start gap-2 rounded-xl bg-brand-page border border-[var(--border-subtle)] px-3 py-2.5">
                      <Package className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" />
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{materiels}</p>
                    </div>
                  )}

                  {p.notes && (
                    <p className="text-[11px] text-text-muted italic mt-2 line-clamp-2">"{p.notes}"</p>
                  )}
                </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Patients démo */}
      <div>
        {savedPatients.length > 0 && (
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Autres patients
          </h2>
        )}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {DEMO_CLIENTS.map((c) => {
            const gStyle = GIR_STYLES[c.gir] ?? GIR_STYLES[6];
            const initials = c.nom.split(' ').map((n) => n[0]).join('');
            return (
              <div key={c.nom} className="premium-card p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary text-sm font-extrabold">
                    {initials}
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${gStyle.badgeClass}`}>
                    {gStyle.label}
                  </span>
                </div>
                <p className="font-bold text-text-main mb-1">{c.nom}</p>
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Users className="h-3 w-3" />
                    {c.age} ans
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {c.dernierContact}
                  </span>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-brand-page border border-[var(--border-subtle)] px-3 py-2.5">
                  <Package className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" />
                  <p className="text-xs text-text-muted leading-relaxed">{c.materiel}</p>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-dashed border-[var(--border-base)] flex items-center justify-center min-h-[170px] bg-white/50">
            <div className="text-center">
              <Users className="h-8 w-8 text-text-muted/40 mx-auto mb-2" />
              <p className="text-sm text-text-muted font-medium">209 autres patients</p>
              <p className="text-xs text-text-muted/60 mt-0.5">dans la base complète</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
