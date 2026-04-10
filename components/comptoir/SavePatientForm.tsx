'use client';

import { useState } from 'react';
import { UserPlus, X, Check, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { GIRScore, PatientProfile, Product } from '@/lib/types';

interface Props {
  gir: GIRScore;
  profil: Partial<PatientProfile>;
  produits: Product[];
}

const GIR_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700 border-red-200',
  2: 'bg-red-50 text-red-600 border-red-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
  4: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  5: 'bg-lime-100 text-lime-700 border-lime-200',
  6: 'bg-green-100 text-green-700 border-green-200',
};

type Status = 'collapsed' | 'open' | 'loading' | 'success' | 'error';

export function SavePatientForm({ gir, profil, produits }: Props) {
  const [status, setStatus] = useState<Status>('collapsed');
  const [error, setError] = useState('');
  const [savedName, setSavedName] = useState('');

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }
    setError('');
    setStatus('loading');

    try {
      const patient = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        prenom: prenom.trim(),
        nom: nom.trim(),
        telephone: telephone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
        gir_niveau: gir.niveau,
        gir_score: gir.scoreTotal,
        gir_description: gir.description,
        gir_eligible_apa: gir.eligibleAPA,
        profil,
        produits_recommandes: produits.map((p) => ({
          reference: p.reference,
          nom: p.nom,
          prix_ttc: p.prix_ttc,
          categorie: p.categorie_mad ?? p.categorie,
        })),
      };

      const existing = JSON.parse(localStorage.getItem('lgmad_patients') ?? '[]');
      localStorage.setItem('lgmad_patients', JSON.stringify([patient, ...existing]));

      setSavedName(`${prenom.trim()} ${nom.trim()}`);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  };

  // ── État succès ────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <div className="glass-panel-strong p-6 rounded-3xl flex items-center gap-4 border border-green-200 bg-green-50/60">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-green-800 text-base">Patient enregistré avec succès</p>
          <p className="text-sm text-green-700 mt-0.5">
            {savedName} · {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  // ── État réduit ────────────────────────────────────────────────────────────

  if (status === 'collapsed') {
    return (
      <button
        onClick={() => setStatus('open')}
        className="w-full glass-panel-strong rounded-3xl p-5 flex items-center gap-4 hover:border-brand-primary/30 hover:shadow-md transition-all duration-200 group text-left border border-dashed border-gray-200"
      >
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center group-hover:bg-brand-primary/12 transition-colors">
          <UserPlus className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-brand-primary text-sm">Enregistrer ce patient</p>
          <p className="text-xs text-text-muted mt-0.5">Sauvegarder le profil, le score GIR et les recommandations</p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
      </button>
    );
  }

  // ── Formulaire ouvert ──────────────────────────────────────────────────────

  return (
    <div className="glass-panel-strong p-6 rounded-3xl space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-bold text-brand-primary text-base">Enregistrer ce patient</h3>
            <p className="text-xs text-text-muted">Les données de l'évaluation sont sauvegardées automatiquement</p>
          </div>
        </div>
        <button
          onClick={() => setStatus('collapsed')}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Résumé automatique (non modifiable) */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
        <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${GIR_COLORS[gir.niveau] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          GIR {gir.niveau}
        </span>
        <span className="text-xs text-text-muted">
          {gir.description}
        </span>
        {produits.length > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-text-muted">
              {produits.length} produit{produits.length > 1 ? 's' : ''} recommandé{produits.length > 1 ? 's' : ''}
            </span>
          </>
        )}
        {gir.eligibleAPA && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-semibold text-emerald-600">Éligible APA</span>
          </>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ligne 1 : Prénom + Nom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Prénom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Marie"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              disabled={status === 'loading'}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Dupont"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {/* Ligne 2 : Téléphone + Email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              disabled={status === 'loading'}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie@exemple.fr"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {/* Ligne 3 : Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Remarques du pharmacien, contexte particulier…"
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all resize-none"
            disabled={status === 'loading'}
          />
        </div>

        {/* Erreur */}
        {status === 'error' && error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => setStatus('collapsed')}
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
