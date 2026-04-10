'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, Mail, Calendar, ShoppingCart, Package,
  Trash2, Plus, CheckCircle2, User, Brain, Activity, Home,
  AlertTriangle, Star
} from 'lucide-react';
import { PatientProfile } from '@/lib/types';

interface SavedPatient {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  notes: string | null;
  gir_niveau: number;
  gir_score: number;
  gir_description: string;
  gir_eligible_apa: boolean;
  profil: Partial<PatientProfile> | null;
  produits_recommandes: { reference: string; nom: string; prix_ttc?: number; categorie?: string }[];
}

interface CartItem {
  reference: string;
  nom: string;
  prix_ttc: number | null;
  image_url: string | null;
  quantite: number;
}

const GIR_STYLES: Record<number, { badgeClass: string; label: string }> = {
  1: { badgeClass: 'bg-red-50 text-red-700 border border-red-200', label: 'GIR 1' },
  2: { badgeClass: 'bg-red-50 text-red-600 border border-red-200', label: 'GIR 2' },
  3: { badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200', label: 'GIR 3' },
  4: { badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'GIR 4' },
  5: { badgeClass: 'bg-lime-50 text-lime-700 border border-lime-200', label: 'GIR 5' },
  6: { badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'GIR 6' },
};

// Labels lisibles pour les variables AGGIR
const AGGIR_LABELS: Record<string, { label: string; values: string[] }> = {
  coherence:            { label: 'Cohérence', values: ['Cohérent', 'Parfois incohérent', 'Très incohérent'] },
  orientation:          { label: 'Orientation', values: ['Orienté', 'Parfois désorienté', 'Désorienté'] },
  toilette:             { label: 'Toilette corporelle', values: ['Seul', 'Aide partielle', 'Aide totale'] },
  habillage:            { label: 'Habillage', values: ['Seul', 'Aide partielle', 'Aide totale'] },
  alimentation:         { label: 'Alimentation', values: ['Seul', 'Aide préparation', 'Aide totale'] },
  elimination:          { label: 'Élimination / continence', values: ['Continent', 'Accidents occasionnels', 'Protections autonome', 'Protections + aide'] },
  transferts:           { label: 'Transferts (se lever, s\'asseoir)', values: ['Seul', 'Aide partielle', 'Aide totale'] },
  mobilite:             { label: 'Déplacements intérieurs', values: ['Marche bien', 'Difficulté', 'Aide technique', 'Fauteuil / alité'] },
  deplacementExterieur: { label: 'Déplacements extérieurs', values: ['Sort seul', 'Accompagné seulement', 'Ne sort plus'] },
  communication:        { label: 'Communication à distance', values: ['Utilise seul', 'Avec aide', 'Ne peut pas'] },
  situationRecente:     { label: 'Événement récent', values: ['Aucun', 'Chute', 'Hospitalisation', 'Perte d\'autonomie progressive'] },
};

const AGGIR_COLORS = (val: number) => {
  if (val === 0) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (val === 1) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

const PRIORITE_LABELS: Record<string, string> = {
  aide_marche: 'Aide à la marche',
  chambre: 'Chambre',
  fauteuils: 'Fauteuils',
  salle_de_bain: 'Salle de bain',
  toilettes: 'Toilettes',
  aides_techniques: 'Aides techniques',
};

const AGE_LABELS: Record<string, string> = {
  '<60': 'Moins de 60 ans',
  '60-70': '60–70 ans',
  '71-80': '71–80 ans',
  '81-90': '81–90 ans',
  '90+': 'Plus de 90 ans',
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<SavedPatient | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lgmad_patients');
      if (stored) {
        const patients: SavedPatient[] = JSON.parse(stored);
        const found = patients.find((p) => p.id === id);
        setPatient(found ?? null);
      }
    } catch { /* ignore */ }

    try {
      const cart = localStorage.getItem('lgmad_cart');
      if (cart) setCartItems(JSON.parse(cart));
    } catch { /* ignore */ }
  }, [id]);

  const removeProduct = (reference: string) => {
    if (!patient) return;
    const updated = {
      ...patient,
      produits_recommandes: patient.produits_recommandes.filter((p) => p.reference !== reference),
    };
    setPatient(updated);
    savePatient(updated);
  };

  const addCartToPatient = () => {
    if (!patient || cartItems.length === 0) return;
    const existing = new Set(patient.produits_recommandes.map((p) => p.reference));
    const toAdd = cartItems
      .filter((c) => !existing.has(c.reference))
      .map((c) => ({ reference: c.reference, nom: c.nom, prix_ttc: c.prix_ttc ?? undefined, categorie: undefined }));
    const updated = {
      ...patient,
      produits_recommandes: [...patient.produits_recommandes, ...toAdd],
    };
    setPatient(updated);
    savePatient(updated);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 2500);
  };

  const savePatient = (updated: SavedPatient) => {
    try {
      const stored = localStorage.getItem('lgmad_patients');
      const patients: SavedPatient[] = stored ? JSON.parse(stored) : [];
      const idx = patients.findIndex((p) => p.id === updated.id);
      if (idx >= 0) patients[idx] = updated;
      else patients.unshift(updated);
      localStorage.setItem('lgmad_patients', JSON.stringify(patients));
    } catch { /* ignore */ }
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <User className="h-12 w-12 text-text-muted/30" />
        <p className="text-text-muted">Patient introuvable</p>
        <button onClick={() => router.back()} className="text-brand-primary text-sm font-semibold hover:underline">
          Retour
        </button>
      </div>
    );
  }

  const gStyle = GIR_STYLES[patient.gir_niveau] ?? GIR_STYLES[6];
  const date = new Date(patient.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const initials = `${patient.prenom[0]}${patient.nom[0]}`.toUpperCase();
  const profil = patient.profil;

  const cartNotInDossier = cartItems.filter(
    (c) => !patient.produits_recommandes.find((p) => p.reference === c.reference)
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">

      {/* Retour */}
      <button
        onClick={() => router.push('/gestion/clients')}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-brand-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux patients
      </button>

      {/* Header patient */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary text-xl font-extrabold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-extrabold text-text-main">{patient.prenom} {patient.nom}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${gStyle.badgeClass}`}>
                {gStyle.label}
              </span>
              {patient.gir_eligible_apa && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Éligible APA
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted mb-3">{patient.gir_description}</p>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-sm text-text-muted">
                <Calendar className="h-4 w-4" /> Évalué le {date}
              </span>
              {patient.telephone && (
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Phone className="h-4 w-4" /> {patient.telephone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Mail className="h-4 w-4" /> {patient.email}
                </span>
              )}
            </div>
          </div>
          {patient.gir_score !== undefined && (
            <div className="text-right shrink-0">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Score AGGIR</p>
              <p className="text-3xl font-extrabold text-brand-primary">{patient.gir_score}</p>
            </div>
          )}
        </div>

        {patient.notes && (
          <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-text-muted italic">"{patient.notes}"</p>
          </div>
        )}
      </div>

      {/* Évaluation AGGIR */}
      {profil && (
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="flex items-center gap-2 text-base font-bold text-brand-primary mb-5">
            <Brain className="h-4 w-4" />
            Résultats de l'évaluation AGGIR
          </h2>

          {/* Infos générales */}
          <div className="flex flex-wrap gap-3 mb-5">
            {profil.age && (
              <span className="text-xs bg-brand-page border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-text-muted font-medium">
                <span className="text-text-main font-bold">Âge :</span> {AGE_LABELS[profil.age] ?? profil.age}
              </span>
            )}
            {profil.sexe && (
              <span className="text-xs bg-brand-page border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-text-muted font-medium">
                <span className="text-text-main font-bold">Sexe :</span> {profil.sexe === 'femme' ? 'Femme' : 'Homme'}
              </span>
            )}
            {profil.respondant && (
              <span className="text-xs bg-brand-page border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-text-muted font-medium">
                <span className="text-text-main font-bold">Répondu par :</span> {profil.respondant === 'aidant' ? 'Un aidant' : 'Le patient'}
              </span>
            )}
          </div>

          {/* Variables discriminantes */}
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(AGGIR_LABELS).map(([key, meta]) => {
              const raw = profil[key as keyof PatientProfile];
              if (raw === undefined || raw === null) return null;
              const val = raw as number;
              const label = meta.values[val] ?? String(val);
              return (
                <div key={key} className="flex items-center justify-between gap-3 rounded-xl bg-brand-page border border-[var(--border-subtle)] px-4 py-2.5">
                  <span className="text-xs text-text-muted font-medium">{meta.label}</span>
                  <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 border ${AGGIR_COLORS(val)}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Priorités MAD */}
          {profil.priorites && profil.priorites.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" /> Priorités déclarées
              </p>
              <div className="flex flex-wrap gap-2">
                {profil.priorites.map((p) => (
                  <span key={p} className="text-xs font-semibold bg-brand-primary/8 text-brand-primary border border-brand-primary/20 rounded-full px-3 py-1">
                    {PRIORITE_LABELS[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Produits recommandés */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <h2 className="flex items-center gap-2 text-base font-bold text-brand-primary">
            <Package className="h-4 w-4" />
            Équipements du dossier
            <span className="text-sm font-normal text-text-muted">({patient.produits_recommandes.length})</span>
          </h2>

          {/* Ajouter depuis le panier */}
          {cartNotInDossier.length > 0 && (
            <button
              onClick={addCartToPatient}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm"
            >
              {addedFlash ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Ajouté au dossier !
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Ajouter panier au dossier
                  <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs">{cartNotInDossier.length}</span>
                </>
              )}
            </button>
          )}
        </div>

        {patient.produits_recommandes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Package className="h-10 w-10 text-text-muted/30" />
            <p className="text-sm text-text-muted">Aucun équipement dans le dossier</p>
            {cartItems.length > 0 && (
              <button
                onClick={addCartToPatient}
                className="text-brand-primary text-sm font-semibold hover:underline"
              >
                Ajouter {cartItems.length} article{cartItems.length > 1 ? 's' : ''} depuis le panier
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {patient.produits_recommandes.map((prod) => (
              <div key={prod.reference} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-brand-page px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-main truncate">{prod.nom}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted">{prod.reference}</span>
                    {prod.categorie && (
                      <>
                        <span className="text-text-muted/30">·</span>
                        <span className="text-xs text-text-muted capitalize">{prod.categorie.replace(/_/g, ' ')}</span>
                      </>
                    )}
                  </div>
                </div>
                {prod.prix_ttc !== undefined && (
                  <span className="text-sm font-bold text-brand-primary shrink-0">
                    {prod.prix_ttc.toFixed(2)} €
                  </span>
                )}
                <button
                  onClick={() => removeProduct(prod.reference)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  title="Retirer du dossier"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Panier disponible à ajouter */}
        {cartNotInDossier.length > 0 && patient.produits_recommandes.length > 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-brand-primary/30 bg-brand-primary/4 p-4">
            <p className="text-xs font-bold text-brand-primary mb-2 flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              Articles dans le panier non encore dans ce dossier :
            </p>
            <div className="space-y-1">
              {cartNotInDossier.map((c) => (
                <div key={c.reference} className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted flex-1">{c.nom}</span>
                  {c.prix_ttc !== null && (
                    <span className="text-xs font-semibold text-brand-primary">{c.prix_ttc.toFixed(2)} €</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section actions rapides */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="flex items-center gap-2 text-sm font-bold text-brand-primary mb-4">
          <Activity className="h-4 w-4" />
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          {patient.telephone && (
            <a
              href={`tel:${patient.telephone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-base)] text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          )}
          {patient.email && (
            <a
              href={`mailto:${patient.email}?subject=Votre dossier MAD — LGm@d`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-base)] text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              Envoyer un email
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-base)] text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition-colors no-print"
          >
            <Package className="h-4 w-4" />
            Imprimer le dossier
          </button>
        </div>
      </div>

    </div>
  );
}
