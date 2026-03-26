import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'

// ─── Management card data ────────────────────────────────────────────────────
const mgmtCards = [
  {
    id: 'clients',
    title: 'Clients',
    text: 'Dossiers, historique, suivi',
    count: '213 actifs',
    color: '#294e46',
    colorName: 'green-deep',
    badge: { type: 'dot' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#294e46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'commandes',
    title: 'Commandes',
    text: 'Suivi, traitement, livraisons',
    count: '12 en cours',
    color: '#e97123',
    colorName: 'orange',
    badge: { type: 'alert', value: '3' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e97123" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'catalogues',
    title: 'Catalogues',
    text: 'Offres, tarifs HT, références',
    count: '4 fournisseurs',
    color: '#456f65',
    colorName: 'green-mid',
    badge: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#456f65" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: 'formations',
    title: 'Formations',
    text: 'Modules, programmes, suivi',
    count: '2 nouveaux',
    color: '#f29a5e',
    colorName: 'orange-light',
    badge: { type: 'dot' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f29a5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    id: 'ressources',
    title: 'Ressources',
    text: 'Documents, contenus métier',
    count: 'Mis à jour',
    color: '#8a6e52',
    colorName: 'sand',
    badge: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a6e52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>
      </svg>
    ),
  },
]

// ─── Gestion action items ────────────────────────────────────────────────────
const gestionActions = [
  {
    label: 'Devis en attente',
    number: '7',
    sub: 'À convertir ou relancer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f29a5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
      </svg>
    ),
  },
  {
    label: 'Commandes à valider',
    number: '12',
    sub: 'En attente de traitement',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f29a5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
]

export function ModeGestion() {
  return (
    <div className="animate-in fade-in duration-300 py-10 lg:py-14">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 space-y-10">

        {/* ── Outils de gestion (5-col management cards) ── */}
        <section>
          <div
            className="rounded-2xl border border-[#e4ebe7] bg-white p-6"
            style={{ boxShadow: '0 1px 4px rgba(41,78,70,.06)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#9aa89f' }}>
              Outils de gestion
            </p>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {mgmtCards.map((card) => (
                <Link
                  key={card.id}
                  href="/bientot-disponible"
                  className="relative flex flex-col rounded-xl border border-[#e4ebe7] bg-white overflow-hidden hover:shadow-md transition-all group"
                  style={{ boxShadow: '0 1px 3px rgba(41,78,70,.05)' }}
                >
                  {/* Colored top bar */}
                  <span
                    className="block h-1 w-full flex-shrink-0"
                    style={{ background: card.color }}
                  />

                  {/* Badge (dot or alert) */}
                  {card.badge?.type === 'dot' && (
                    <span
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ background: '#294e46' }}
                      aria-label="Nouvelle information"
                    />
                  )}
                  {card.badge?.type === 'alert' && (
                    <span
                      className="absolute top-2 right-2 flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: '#fef3eb', color: '#c85f18' }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#c85f18">
                        <path d="M12 2L1 21h22L12 2zm0 5l7.5 13h-15L12 7zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                      </svg>
                      {card.badge.value}
                    </span>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    {/* Icon + count */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${card.color}18` }}
                      >
                        {card.icon}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: card.color }}>
                        {card.count}
                      </span>
                    </div>

                    {/* Title + text */}
                    <h4 className="text-sm font-semibold mb-0.5 group-hover:text-[#294e46] transition-colors" style={{ color: '#17212b' }}>
                      {card.title}
                    </h4>
                    <p className="text-xs" style={{ color: '#667085' }}>{card.text}</p>

                    {/* Arrow */}
                    <div className="mt-auto pt-3 text-right">
                      <ArrowRight className="w-4 h-4 inline-block transition-transform group-hover:translate-x-1" style={{ color: card.color }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-[#e4ebe7]">
              <span className="flex items-center gap-2 text-xs" style={{ color: '#667085' }}>
                <span className="w-2 h-2 rounded-full bg-[#294e46]" />
                Nouvelle information
              </span>
              <span className="flex items-center gap-2 text-xs" style={{ color: '#667085' }}>
                <span className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold" style={{ background: '#fef3eb', color: '#c85f18' }}>
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="#c85f18">
                    <path d="M12 2L1 21h22L12 2zm0 5l7.5 13h-15L12 7zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                  </svg>
                  n
                </span>
                Action requise
              </span>
            </div>
          </div>
        </section>

        {/* ── Activité (gestion-kpi-grid) ── */}
        <section>
          <div
            className="rounded-2xl border border-[#e4ebe7] bg-white p-6"
            style={{ boxShadow: '0 1px 4px rgba(41,78,70,.06)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#9aa89f' }}>
              Activité
            </p>

            <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1.6fr_1fr]">
              {/* Dashboard card */}
              <div
                className="rounded-xl border border-[#e4ebe7] overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(41,78,70,.05)' }}
              >
                {/* Top bar */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #294e46, #456f65)' }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold" style={{ color: '#17212b' }}>Tableau de bord</p>
                    <div className="flex items-center gap-1">
                      {['Mois', 'Trimestre', 'Année'].map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 rounded text-[11px] cursor-default"
                          style={{ color: '#9aa89f', background: '#f4f8f6' }}
                          title="Disponible prochainement"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CA main */}
                  <div className="mb-4">
                    <p className="text-xs mb-1" style={{ color: '#9aa89f' }}>CA HT total</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold" style={{ color: '#17212b' }}>128 450 €</span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: '#4a8c6f' }}
                      >
                        ▲ +8% vs mois préc.
                      </span>
                    </div>
                  </div>

                  {/* Sub-grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Ventes', value: '82 300 €' },
                      { label: 'Locations', value: '46 150 €' },
                      { label: 'Marge HT', value: '8%', trend: '▲ +1pt' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg p-3"
                        style={{ background: '#f4f8f6' }}
                      >
                        <p className="text-[11px] mb-1" style={{ color: '#9aa89f' }}>{item.label}</p>
                        <p className="text-base font-bold" style={{ color: '#17212b' }}>{item.value}</p>
                        {item.trend && (
                          <span className="text-[11px] font-medium" style={{ color: '#4a8c6f' }}>{item.trend}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions card */}
              <div
                className="rounded-xl border border-[#e4ebe7] overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(41,78,70,.05)' }}
              >
                {/* Top bar */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e97123, #f29a5e)' }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#e97123">
                      <path d="M12 2L1 21h22L12 2zm0 5l7.5 13h-15L12 7zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                    </svg>
                    <p className="text-sm font-semibold" style={{ color: '#17212b' }}>Actions du jour</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {gestionActions.map((action) => (
                      <Link
                        key={action.label}
                        href="/bientot-disponible"
                        className="flex items-center justify-between p-3 rounded-xl border border-[#e4ebe7] hover:border-[#e97123]/30 transition-colors group"
                        style={{ background: '#fafafa' }}
                      >
                        <div>
                          <p className="text-xs font-medium mb-0.5" style={{ color: '#667085' }}>{action.label}</p>
                          <p className="text-2xl font-bold" style={{ color: '#17212b' }}>{action.number}</p>
                          <p className="text-[11px]" style={{ color: '#9aa89f' }}>{action.sub}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {action.icon}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: '#e97123' }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Top ventes ── */}
        <section>
          <div
            className="rounded-2xl border border-[#e4ebe7] p-6"
            style={{ background: '#f4f8f6', boxShadow: '0 1px 4px rgba(41,78,70,.06)' }}
          >
            <div className="mb-5">
              <h3 className="text-lg font-bold mb-1" style={{ color: '#17212b' }}>Top ventes</h3>
              <p className="text-sm" style={{ color: '#667085' }}>Les produits les plus vendus sur la période — prix achat HT.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Rollator 4 roues standard', ref: 'ROLL4STD · Hexa', meta: 'Aide à la marche · top vente', price: '54,90 € HT', sub: 'Prix LPP : 53,81 €' },
                { title: 'Fauteuil roulant léger', ref: 'FAURLG07 · Fournisseur X', meta: 'Mobilité · produit stratégique', price: '122,90 € HT', sub: 'LPPR selon modèle' },
                { title: 'Tabouret de douche réglable', ref: 'TABDCH01 · Fournisseur Y', meta: 'Salle de bain · nouveauté', price: '68,40 € HT', sub: 'Rotation régulière' },
                { title: 'Chaise percée avec accoudoirs', ref: 'CHPERC09 · Fournisseur Z', meta: 'Confort · potentiel marge', price: '79,00 € HT', sub: 'À intégrer au suivi gestion' },
              ].map((product) => (
                <div
                  key={product.title}
                  className="bg-white rounded-xl border border-[#e4ebe7] overflow-hidden"
                  style={{ boxShadow: '0 1px 3px rgba(41,78,70,.05)' }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ height: '100px', background: '#e8f3ef' }}
                  >
                    <Package className="w-10 h-10" style={{ color: '#9aa89f' }} />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#17212b' }}>{product.title}</p>
                    <p className="text-xs mb-1" style={{ color: '#9aa89f' }}>Réf. {product.ref}</p>
                    <p className="text-xs mb-2" style={{ color: '#667085' }}>{product.meta}</p>
                    <p className="text-base font-bold mb-0.5" style={{ color: '#294e46' }}>{product.price}</p>
                    <p className="text-xs mb-3" style={{ color: '#9aa89f' }}>{product.sub}</p>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ background: '#294e46' }}
                      >
                        Voir la fiche
                      </button>
                      <button
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-[#e4ebe7]"
                        style={{ color: '#667085' }}
                      >
                        Commander
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
