import Link from 'next/link';
import Image from 'next/image';
import { Topbar } from '@/components/layout/topbar';
import { Footer } from '@/components/layout/footer';
import { HelliaChat } from '@/components/home/HelliaChat';

const PARCOURS_MAD = [
  { href: '/parcours/aide-marche', img: '/images/parcours-marche.png', title: 'Aide à la marche', desc: "Choisir l'aide adaptée selon l'autonomie." },
  { href: '/parcours/chambre', img: '/images/parcours-chambre.png', title: 'La chambre', desc: 'Faciliter le lever et améliorer le confort.' },
  { href: '/parcours/fauteuils', img: '/images/parcours-fauteuils.png', title: 'Fauteuils roulants', desc: 'Trouver la solution de mobilité adaptée.' },
  { href: '/parcours/salle-de-bain', img: '/images/parcours-salle-de-bain.png', title: 'Salle de bain', desc: 'Sécuriser les usages et prévenir les chutes.' },
  { href: '/parcours/toilettes', img: '/images/parcours-toilettes.png', title: 'Toilettes', desc: 'Faciliter les transferts au quotidien.' },
  { href: '/parcours/aides-techniques', img: '/images/parcours-aides-techniques.png', title: 'Aides techniques', desc: 'Simplifier les gestes de la vie quotidienne.' },
];

const ACTION_CARDS = [
  { href: '/comptoir', title: 'Questionnaire\nautonomie', sub: 'Qualifier rapidement la situation d\'un patient.', bar: 'bg-brand-accent' },
  { href: '/parcours', title: 'Parcours\nconseil', sub: 'Guider le conseil selon la pathologie.', bar: 'bg-brand-primary-light' },
  { href: '/gestion/catalogue', title: 'Catalogue\nproduits', sub: 'Accéder aux références fournisseurs.', bar: 'bg-brand-primary-dark' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <main className="flex-1 mx-auto w-[min(1320px,calc(100%-40px))] pb-16 animate-fade-in">

        {/* ─── HERO ─── */}
        <section className="py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] items-center gap-8">

            {/* Gauche : texte + raccourcis */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-[38px] lg:text-[46px] font-extrabold leading-[1.05] tracking-tight text-brand-primary">
                  Le réflexe MAD<br />pour la pharmacie
                </h1>
                <p className="mt-3 text-[15px] lg:text-[16px] leading-[1.65] text-text-muted max-w-[520px]">
                  Conseillez et orientez vos patients en matériel de Maintien À Domicile grâce à l'assistant IA et aux parcours experts.
                </p>
              </div>

              {/* Raccourcis d'action */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ACTION_CARDS.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="relative flex flex-col justify-between p-4 premium-card group overflow-hidden min-h-[100px]"
                  >
                    <span className={`absolute top-0 left-0 right-0 h-[3px] ${card.bar}`} />
                    <span className="text-[13px] font-extrabold leading-tight text-text-main whitespace-pre-line mt-1.5 group-hover:text-brand-primary transition-colors">
                      {card.title}
                    </span>
                    <span className="text-[12px] text-text-muted leading-snug mt-2">
                      {card.sub}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Droite : chat Hellia */}
            <HelliaChat />
          </div>
        </section>

        {/* ─── PARCOURS MAD ─── */}
        <section className="py-4 pb-8">
          <div className="glass-panel p-6 sm:p-8 rounded-[24px]">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white bg-brand-primary">MAD</span>
                  <h2 className="m-0 text-[20px] font-extrabold text-brand-primary">Parcours conseil</h2>
                </div>
                <p className="text-[14px] text-text-muted">Parcours structurés pour orienter vos patients visuellement.</p>
              </div>
              <Link href="/parcours" className="btn-secondary text-[13px] whitespace-nowrap">
                Voir tous →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {PARCOURS_MAD.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group premium-card flex flex-col gap-2.5 p-3 text-center"
                >
                  <div className="overflow-hidden rounded-[12px] bg-brand-page aspect-square w-full relative">
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    />
                  </div>
                  <div className="px-0.5 flex-1 flex flex-col">
                    <h3 className="m-0 text-[13px] font-bold leading-tight text-text-main group-hover:text-brand-primary transition-colors">{p.title}</h3>
                    <p className="mt-1 text-[11px] text-text-muted leading-snug line-clamp-2">{p.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA MODE GESTION ─── */}
        <section className="pb-4">
          <div className="rounded-3xl bg-gradient-to-r from-brand-primary-dark to-brand-primary p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-72 h-72 bg-brand-primary-light/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-accent mb-2">Mode Gestion</p>
              <h2 className="text-[26px] font-extrabold text-white mb-2">Tableau de bord pharmacien</h2>
              <p className="text-[15px] text-white/65 max-w-lg leading-relaxed">
                Accédez au pilotage de votre activité MAD : commandes, catalogue, KPIs et assistant IA commercial.
              </p>
            </div>
            <Link href="/gestion" className="relative z-10 shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-bold text-brand-primary hover:bg-brand-page hover:shadow-2xl hover:scale-105 transition-all whitespace-nowrap shadow-xl">
              Ouvrir la gestion →
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
