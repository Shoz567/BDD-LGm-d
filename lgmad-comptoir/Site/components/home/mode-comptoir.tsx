'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  PersonStanding,
  BedDouble,
  Armchair,
  ShowerHead,
  Home,
  Wrench,
  Stethoscope,
  Activity,
  Building2,
  BookOpen,
} from 'lucide-react'
import { products } from '@/lib/data'
import { ProductCard } from '@/components/product-card'
import type { ReactNode } from 'react'

// ─── Hellia animated waves ────────────────────────────────────────────────────
function HelliaWaves() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes hellia-wave-a { 0%{r:44px;opacity:.7} 100%{r:90px;opacity:0} }
        @keyframes hellia-wave-b { 0%{r:44px;opacity:.6} 100%{r:110px;opacity:0} }
        @keyframes hellia-wave-c { 0%{r:44px;opacity:.5} 100%{r:130px;opacity:0} }
        .hw-a { animation: hellia-wave-a 2.8s ease-out infinite; }
        .hw-b { animation: hellia-wave-b 2.8s ease-out .5s infinite; }
        .hw-c { animation: hellia-wave-c 2.8s ease-out 1s infinite; }
      `}</style>
      <circle className="hw-a" cx="52" cy="50%" r="44" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/>
      <circle className="hw-b" cx="52" cy="50%" r="44" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1"/>
      <circle className="hw-c" cx="52" cy="50%" r="44" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1"/>
    </svg>
  )
}

// ─── Hellia block ─────────────────────────────────────────────────────────────
function HelliaBlock() {
  const [message, setMessage] = useState('')

  return (
    <div
      className="rounded-2xl overflow-hidden border border-[#e4ebe7]"
      style={{ boxShadow: '0 4px 24px rgba(41,78,70,.10)' }}
    >
      {/* Green header */}
      <div className="relative" style={{ background: '#294e46' }}>
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg,#e97123,#f29a5e,#294e46)' }}
        />
        <div className="relative flex items-center gap-4 px-5 py-4 overflow-hidden">
          <HelliaWaves />

          {/* Avatar */}
          <div className="relative z-10 flex-shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: '#3d6b5e', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-label="Hellia">
                <circle cx="20" cy="16" r="8" fill="rgba(255,255,255,0.3)"/>
                <path d="M4 36c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span
              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#294e46]"
              style={{ background: '#4ade80' }}
            />
          </div>

          {/* Identity */}
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base font-bold text-white">Hellia</span>
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(233,113,35,0.3)', color: '#f29a5e' }}
              >
                IA · bêta
              </span>
            </div>
            <p className="text-xs text-white/60 mb-1.5">Votre conseillère MAD · en ligne</p>
            <div
              className="inline-block px-3 py-1.5 rounded-xl text-xs text-white/90"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              Comment puis-je vous conseiller&nbsp;?
            </div>
          </div>
        </div>
      </div>

      {/* Actions area */}
      <div className="px-5 py-4" style={{ background: '#f4f8f6' }}>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez votre question…"
            className="flex-1 h-9 px-3 rounded-xl border border-[#e4ebe7] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#294e46]/20"
            style={{ color: '#17212b' }}
          />
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#294e46' }}
            aria-label="Envoyer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="flex-1 h-px bg-[#e4ebe7]" />
          <span className="text-xs text-[#9aa89f]">ou</span>
          <span className="flex-1 h-px bg-[#e4ebe7]" />
        </div>

        <Link
          href="/questionnaire"
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-[#e4ebe7] bg-white hover:border-[#294e46]/30 transition-colors group"
        >
          <span className="text-sm font-medium" style={{ color: '#294e46' }}>
            Lancer un questionnaire personnalisé
          </span>
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#294e46' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}

// ─── Hero action cards data ───────────────────────────────────────────────────
const heroCards = [
  {
    variant: 'autonomy',
    href: '/questionnaire',
    title: 'Questionnaire\nautonomie',
    text: 'Qualifier rapidement la situation.',
    bar: '#294e46',
    bg: 'radial-gradient(ellipse at 0% 50%,rgba(41,78,70,.08) 0%,transparent 70%)',
  },
  {
    variant: 'advice',
    href: '/bientot-disponible',
    title: 'Parcours\nconseil',
    text: 'Guider selon la situation du patient.',
    bar: '#e97123',
    bg: 'radial-gradient(ellipse at 0% 50%,rgba(233,113,35,.08) 0%,transparent 70%)',
  },
  {
    variant: 'catalog',
    href: '/catalogue',
    title: 'Catalogue\nproduits',
    text: 'Accéder aux solutions par usage.',
    bar: '#456f65',
    bg: 'radial-gradient(ellipse at 0% 50%,rgba(69,111,101,.08) 0%,transparent 70%)',
  },
]

// ─── Path card ────────────────────────────────────────────────────────────────
function PathCard({
  href,
  title,
  text,
  variant = 'mad',
  badge,
  icon,
}: {
  href: string
  title: string
  text: string
  variant?: 'mad' | 'pro'
  badge?: string
  icon?: ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-stretch rounded-2xl border border-[#e4ebe7] bg-white overflow-hidden hover:border-[#294e46]/30 hover:shadow-md transition-all group"
      style={{ boxShadow: '0 1px 4px rgba(41,78,70,.06)' }}
    >
      {/* Icon area */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ width: '78px', background: variant === 'pro' ? '#f4f8f6' : '#e8f3ef' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#294e46' }}
        >
          {icon ?? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center min-w-0">
        {badge && (
          <span
            className="inline-block mb-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
            style={{ background: '#e97123', color: '#fff', width: 'fit-content' }}
          >
            {badge}
          </span>
        )}
        <h4 className="text-sm font-semibold leading-tight mb-0.5 group-hover:text-[#294e46] transition-colors" style={{ color: '#17212b' }}>
          {title}
        </h4>
        <p className="text-xs leading-snug line-clamp-2" style={{ color: '#667085' }}>
          {text}
        </p>
      </div>

      {/* Arrow */}
      <div className="flex items-center pr-4 flex-shrink-0">
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: '#294e46' }} />
      </div>
    </Link>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ModeComptoir() {
  const recommendedProducts = products.filter(p => p.recommande)

  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Hero ── */}
      <section className="py-10 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.08fr] gap-8 lg:gap-12 items-start">

            {/* Left: copy + hero cards */}
            <div>
              {/* Surtitre */}
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#e97123' }}>
                <span className="w-4 h-px" style={{ background: '#e97123' }} />
                Plateforme MAD pharmacie
              </span>

              <h1
                style={{
                  fontSize: 'clamp(2.25rem, 3.5vw, 3.25rem)',
                  color: '#17212b',
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}
              >
                Le réflexe MAD pour la pharmacie
              </h1>

              <p
                className="text-base lg:text-lg leading-relaxed mb-8"
                style={{ color: '#667085', maxWidth: '480px' }}
              >
                Conseillez, orientez et accédez aux bonnes solutions MAD.
              </p>

              {/* Hero action cards */}
              <div className="grid gap-3">
                {heroCards.map((card) => (
                  <Link
                    key={card.variant}
                    href={card.href}
                    className="flex items-stretch rounded-2xl border border-[#e4ebe7] overflow-hidden hover:shadow-md transition-all group"
                    style={{
                      boxShadow: '0 1px 4px rgba(41,78,70,.06)',
                      background: `${card.bg}, #ffffff`,
                      minHeight: '80px',
                    }}
                  >
                    <span className="flex-shrink-0 w-1.5 rounded-l-2xl" style={{ background: card.bar }} />
                    <div className="flex-1 px-4 py-4">
                      <h3
                        className="font-semibold text-sm leading-snug mb-1 group-hover:text-[#294e46] transition-colors whitespace-pre-line"
                        style={{ color: '#17212b' }}
                      >
                        {card.title}
                      </h3>
                      <p className="text-xs" style={{ color: '#667085' }}>{card.text}</p>
                    </div>
                    <div className="flex items-center pr-4">
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: '#294e46' }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Hellia block */}
            <div>
              <HelliaBlock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Parcours conseil ── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">

          {/* MAD block */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide" style={{ background: '#294e46', color: '#fff' }}>
                  MAD
                </span>
                <h2 className="text-xl font-bold" style={{ color: '#17212b' }}>Parcours conseil MAD</h2>
              </div>
              <div className="flex-1 h-px" style={{ background: '#e4ebe7' }} />
            </div>
            <p className="text-sm mb-5" style={{ color: '#667085' }}>Parcours utilisés pour accompagner les patients au comptoir.</p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: '/bientot-disponible', title: 'Aide à la marche', text: "Choisir l'aide adaptée selon l'autonomie.", icon: <PersonStanding className="w-5 h-5 text-white" /> },
                { href: '/bientot-disponible', title: 'La chambre', text: 'Faciliter le lever et améliorer le confort.', icon: <BedDouble className="w-5 h-5 text-white" /> },
                { href: '/bientot-disponible', title: 'Fauteuils roulants', text: 'Trouver la solution de mobilité adaptée.', icon: <Armchair className="w-5 h-5 text-white" /> },
                { href: '/bientot-disponible', title: 'Salle de bain', text: 'Sécuriser les usages et prévenir les chutes.', icon: <ShowerHead className="w-5 h-5 text-white" /> },
                { href: '/bientot-disponible', title: 'Toilettes', text: 'Faciliter les transferts au quotidien.', icon: <Home className="w-5 h-5 text-white" /> },
                { href: '/bientot-disponible', title: 'Aides techniques', text: 'Simplifier les gestes de la vie quotidienne.', icon: <Wrench className="w-5 h-5 text-white" /> },
              ].map((p) => (
                <PathCard key={p.title} href={p.href} title={p.title} text={p.text} variant="mad" icon={p.icon} />
              ))}
            </div>
          </div>

          {/* PRO block */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide" style={{ background: '#e97123', color: '#fff' }}>
                  PRO
                </span>
                <h2 className="text-xl font-bold" style={{ color: '#17212b' }}>Parcours conseil PRO</h2>
              </div>
              <div className="flex-1 h-px" style={{ background: '#e4ebe7' }} />
            </div>
            <p className="text-sm mb-5" style={{ color: '#667085' }}>Solutions dédiées aux professionnels de santé.</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Soins à domicile', text: 'Faciliter la prise en charge et proposer les équipements utiles sur le terrain.', icon: <Stethoscope className="w-5 h-5 text-white" /> },
                { title: 'Rééducation', text: 'Une offre claire pour accompagner les besoins des kinés et de la rééducation.', icon: <Activity className="w-5 h-5 text-white" /> },
                { title: 'Cabinet médical', text: "Les indispensables pour structurer l'équipement et les usages du cabinet.", icon: <Building2 className="w-5 h-5 text-white" /> },
              ].map((p) => (
                <PathCard key={p.title} href="/bientot-disponible" title={p.title} text={p.text} variant="pro" badge="PRO" icon={p.icon} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Produits recommandés ── */}
      <section className="py-10 lg:py-14" style={{ background: '#f4f8f6' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#17212b' }}>Produits recommandés</h2>
              <p className="text-sm" style={{ color: '#667085' }}>Bloc dynamique connecté à la base articles avec affichage prix public TTC.</p>
            </div>
            <Link
              href="/catalogue"
              className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: '#294e46' }}
            >
              Voir tout le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.reference} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Outils LGm@d — section sombre ── */}
      <section className="py-10 lg:py-14" style={{ background: '#294e46' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1 text-white">Les outils LGm@d</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Des raccourcis métier pour aider au conseil et à la vente.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Questionnaires autonomie', text: "Qualifier les besoins et orienter l'échange avec méthode.", href: '/questionnaire' },
              { title: 'Parcours conseils', text: "Proposer les bons produits selon l'usage, le niveau d'autonomie et le contexte.", href: '/bientot-disponible' },
              { title: 'Guides autonomie', text: 'Accéder à des contenus utiles pour accompagner le patient et son entourage.', href: '/bientot-disponible' },
              { title: 'Contenus patient', text: "Retrouver des supports simples à utiliser dans l'échange au comptoir.", href: '/bientot-disponible' },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="rounded-2xl p-5 transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              >
                <h3 className="font-semibold text-sm mb-2 text-white group-hover:text-[#f29a5e] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>{tool.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conseils d'experts ── */}
      <section className="py-10 lg:py-14" style={{ background: '#f4f8f6' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" style={{ color: '#17212b' }}>Les conseils d&apos;experts LGm@d</h2>
            <p className="text-sm" style={{ color: '#667085' }}>Une sélection de contenus pédagogiques pour soutenir l&apos;échange au comptoir.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Prévention chute', text: 'Repères simples pour sécuriser le domicile et proposer les bonnes aides techniques.' },
              { title: 'Autonomie salle de bain', text: 'Produits et conseils pour faciliter les gestes du quotidien.' },
              { title: 'Mobilité', text: 'Comment choisir une aide à la marche adaptée au profil du patient.' },
              { title: 'Adaptation du domicile', text: 'Premières recommandations utiles à transmettre au patient et à ses proches.' },
            ].map((article) => (
              <Link
                key={article.title}
                href="/bientot-disponible"
                className="bg-white rounded-2xl border border-[#e4ebe7] overflow-hidden hover:border-[#294e46]/30 hover:shadow-md transition-all group"
                style={{ boxShadow: '0 1px 4px rgba(41,78,70,.06)' }}
              >
                {/* Image placeholder with BookOpen icon */}
                <div
                  className="aspect-video flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #e8f3ef, #f4f8f6)' }}
                >
                  <BookOpen className="w-10 h-10" style={{ color: '#9aa89f' }} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1.5 group-hover:text-[#294e46] transition-colors" style={{ color: '#17212b' }}>
                    {article.title}
                  </h3>
                  <p className="text-xs leading-snug mb-3 line-clamp-2" style={{ color: '#667085' }}>{article.text}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#294e46' }}>
                    Lire <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
