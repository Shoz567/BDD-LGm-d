'use client';

import Link from 'next/link';
import Image from 'next/image';

const PARCOURS_MAD = [
  {
    href: '/parcours/aide-marche',
    title: 'Aide à la marche',
    text: "Choisir l'aide adaptée selon l'autonomie.",
    image: '/images/parcours-marche.png',
    alt: 'Aide à la marche',
  },
  {
    href: '/parcours/chambre',
    title: 'La chambre',
    text: 'Faciliter le lever et améliorer le confort.',
    image: '/images/parcours-chambre.png',
    alt: 'La chambre',
  },
  {
    href: '/parcours/fauteuils',
    title: 'Fauteuils roulants',
    text: 'Trouver la solution de mobilité adaptée.',
    image: '/images/parcours-fauteuils.png',
    alt: 'Fauteuils roulants',
  },
  {
    href: '/parcours/salle-de-bain',
    title: 'Salle de bain',
    text: 'Sécuriser les usages et prévenir les chutes.',
    image: '/images/parcours-salle-de-bain.png',
    alt: 'Salle de bain',
  },
  {
    href: '/parcours/toilettes',
    title: 'Toilettes',
    text: 'Faciliter les transferts au quotidien.',
    image: '/images/parcours-toilettes.png',
    alt: 'Toilettes',
  },
  {
    href: '/parcours/aides-techniques',
    title: 'Aides techniques',
    text: 'Simplifier les gestes de la vie quotidienne.',
    image: '/images/parcours-aides-techniques.png',
    alt: 'Aides techniques',
  },
];

export default function ParcoursPage() {
  return (
    <div className="grid gap-6">
      {/* Breadcrumb + title */}
      <div className="glass-panel p-8 rounded-[24px] animate-fade-in-up">
        <div className="flex items-center gap-2 text-[13px] text-text-muted mb-4 font-semibold uppercase tracking-wider">
          <Link href="/" className="text-brand-primary hover:text-brand-accent transition-colors">Accueil</Link>
          <span>›</span>
          <span>Parcours conseil</span>
        </div>
        <h1 className="m-0 mb-2 text-[34px] leading-tight tracking-tight text-gradient-primary font-extrabold">
          Démarrer un parcours conseil
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-text-muted max-w-[820px]">
          Choisissez une entrée métier pour orienter rapidement le conseil selon le besoin du patient.
        </p>
      </div>

      {/* MAD pathways block */}
      <div className="glass-panel-strong p-8 rounded-[24px] animate-fade-in-up stagger-2">
        {/* Block header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary">
              <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5h6v5" />
              <path d="M7.5 12.5c.9-1.8 2.4-2.7 4.5-2.7s3.6.9 4.5 2.7" />
            </svg>
            <h2 className="m-0 text-[22px] font-extrabold text-brand-primary">
              Parcours conseil
            </h2>
            <span className="inline-flex items-center h-[26px] px-3 rounded-lg text-[11px] font-extrabold uppercase tracking-wide text-white bg-brand-primary-light shadow-sm">
              MAD
            </span>
          </div>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        <p className="m-0 mb-6 text-[15px] text-text-muted">
          Recommandations expertes pour l'aménagement du domicile et le confort du patient.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PARCOURS_MAD.map((p, index) => {
            const cardStagger = Math.min((index % 5) + 1, 5);
            return (
              <Link
                key={p.href}
                href={p.href}
                className={`premium-card relative grid grid-cols-[90px_1fr_40px] gap-4 items-center min-h-[140px] p-4 group animate-fade-in-up stagger-${cardStagger}`}
              >
                <div className="w-[90px] h-[90px] rounded-2xl overflow-hidden bg-brand-page flex-shrink-0">
                  <Image
                    src={p.image}
                    alt={p.alt}
                    width={90}
                    height={90}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="min-w-0 flex flex-col justify-center gap-1.5">
                  <h3 className="m-0 text-[17px] font-bold text-text-main group-hover:text-brand-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="m-0 text-[13px] text-text-muted leading-snug line-clamp-2">
                    {p.text}
                  </p>
                </div>
                <div className="w-[36px] h-[36px] justify-self-end grid place-items-center rounded-xl bg-gray-50 border border-gray-100 text-brand-accent text-[14px] font-bold group-hover:bg-brand-accent group-hover:text-white transition-colors group-hover:border-brand-accent shadow-sm">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA questionnaire autonomie */}
      <div className="premium-card p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-br from-orange-50 to-white border-brand-accent/20 animate-fade-in-up stagger-4">
        <div>
          <p className="m-0 mb-1.5 text-[18px] font-extrabold text-orange-900">
            Pas sûr du parcours à suivre ?
          </p>
          <p className="m-0 text-[15px] text-orange-700 leading-relaxed max-w-2xl">
            Laissez l'assistant IA LGm@d évaluer le profil clinique du patient et recommander automatiquement les équipements adaptés au niveau d'autonomie.
          </p>
        </div>
        <Link href="/comptoir" className="btn-primary whitespace-nowrap">
          Ouvrir le Comptoir IA →
        </Link>
      </div>
    </div>
  );
}
