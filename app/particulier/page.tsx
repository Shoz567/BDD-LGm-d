'use client';

import Link from 'next/link';
import Image from 'next/image';

const SITUATIONS = [
  { href: '/particulier/catalogue?cat=aide_marche', img: '/images/parcours-marche.png', label: "J'ai du mal à marcher" },
  { href: '/particulier/catalogue?cat=salle_de_bain', img: '/images/parcours-salle-de-bain.png', label: 'Sécuriser la salle de bain' },
  { href: '/particulier/catalogue?cat=chambre', img: '/images/parcours-chambre.png', label: 'Mieux dormir / se lever' },
  { href: '/particulier/catalogue?cat=fauteuils', img: '/images/parcours-fauteuils.png', label: 'Se déplacer en fauteuil' },
  { href: '/particulier/catalogue?cat=toilettes', img: '/images/parcours-toilettes.png', label: 'Confort aux toilettes' },
  { href: '/particulier/catalogue?cat=aides_techniques', img: '/images/parcours-aides-techniques.png', label: 'Autres aides pratiques' },
];

export default function ParticulierHome() {
  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '520px', display: 'flex', alignItems: 'center' }}>
        {/* Image de fond */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/images/photo-hero.png"
            alt="Personne âgée à domicile"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            priority
          />
          {/* Dégradé pour lisibilité */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,40,35,0.82) 0%, rgba(20,40,35,0.55) 55%, rgba(20,40,35,0.1) 100%)' }} />
        </div>

        {/* Contenu hero */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '64px 32px', width: '100%' }}>
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Espace particulier</span>
            </div>

            <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(36px, 5.5vw, 58px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Restez chez vous,<br />
              <span style={{ color: '#7dd4b0' }}>en toute sécurité</span>
            </h1>

            <p style={{ margin: '0 0 36px', fontSize: '18px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: '460px' }}>
              Que vous cherchiez des équipements pour vous ou un proche, nous vous guidons simplement — sans jargon médical.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/particulier/chat" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px', borderRadius: '16px',
                background: '#fff', color: '#294e46',
                fontSize: '15px', fontWeight: 800, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}>
                💬 Parler à Hellia
              </Link>
              <Link href="/particulier/catalogue" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '15px', fontWeight: 700, textDecoration: 'none',
              }}>
                Voir les équipements →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HELLIA SECTION ── */}
      <section style={{ background: 'linear-gradient(135deg, #1a3530 0%, #294e46 100%)', padding: '64px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Texte */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(125,212,176,0.15)', border: '1px solid rgba(125,212,176,0.3)', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7dd4b0', textTransform: 'uppercase', letterSpacing: '.08em' }}>Votre guide personnel</span>
            </div>
            <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Hellia vous accompagne,<br />
              <span style={{ color: '#7dd4b0' }}>pas à pas</span>
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              Hellia est votre conseillère virtuelle. Elle vous pose quelques questions simples et vous recommande les équipements les mieux adaptés à votre situation — en moins de 5 minutes.
            </p>
            <ul style={{ margin: '0 0 32px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Questions simples, sans jargon médical', 'Recommandations personnalisées à votre situation', 'Infos sur les remboursements possibles'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(125,212,176,0.2)', border: '1px solid rgba(125,212,176,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', color: '#7dd4b0' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/particulier/chat" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 28px', borderRadius: '16px',
              background: '#7dd4b0', color: '#1a3530',
              fontSize: '15px', fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(125,212,176,0.3)',
            }}>
              💬 Commencer avec Hellia
            </Link>
          </div>

          {/* Hellia image */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '300px', height: '360px' }}>
              <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'rgba(125,212,176,0.08)', filter: 'blur(40px)' }} />
              <Image
                src="/hellia.png"
                alt="Hellia, votre conseillère"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PAR SITUATION ── */}
      <section style={{ padding: '72px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#17212b', letterSpacing: '-0.02em' }}>
              Trouver par situation de vie
            </h2>
            <p style={{ margin: 0, fontSize: '17px', color: '#53636e', maxWidth: '480px', marginInline: 'auto', lineHeight: 1.6 }}>
              Choisissez ce qui vous correspond — pas besoin de connaître les noms techniques.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {SITUATIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  height: '180px',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <Image src={s.img} alt={s.label} fill style={{ objectFit: 'cover', transition: 'transform .4s ease' }} sizes="350px" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(20,40,35,0.75) 0%, rgba(20,40,35,0.1) 60%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>{s.label}</p>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link href="/particulier/catalogue" style={{ fontSize: '14px', fontWeight: 700, color: '#294e46', textDecoration: 'none', borderBottom: '2px solid #c6ddd7', paddingBottom: '2px' }}>
              Voir tout le catalogue →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3 ENTRÉES ── */}
      <section style={{ padding: '72px 32px', background: 'linear-gradient(160deg, #f0faf6 0%, #fdf6ee 60%, #f5f0fa 100%)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

            {/* Droits */}
            <Link href="/particulier/droits" style={{
              borderRadius: '24px', background: '#fff', border: '1px solid #e3e9e5',
              padding: '32px', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(23,33,43,0.05)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eef3fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                📋
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#17212b', letterSpacing: '-0.01em' }}>Mes droits</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#53636e', lineHeight: 1.6 }}>
                  APA, Sécurité Sociale, mutuelle — on vous explique simplement ce à quoi vous avez droit.
                </p>
              </div>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: '#4c7ecf' }}>Comprendre mes droits →</span>
            </Link>

            {/* Conseils */}
            <Link href="/particulier/conseils" style={{
              borderRadius: '24px', background: '#fff', border: '1px solid #e3e9e5',
              padding: '32px', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(23,33,43,0.05)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f3effe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                📖
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#17212b', letterSpacing: '-0.01em' }}>Conseils pratiques</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#53636e', lineHeight: 1.6 }}>
                  Aménager la salle de bain, choisir un déambulateur, préparer un retour à domicile...
                </p>
              </div>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>Lire les fiches →</span>
            </Link>

            {/* Ma liste */}
            <Link href="/particulier/panier" style={{
              borderRadius: '24px', background: 'linear-gradient(135deg, #e97123 0%, #f09a55 100%)',
              padding: '32px', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(233,113,35,0.2)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                🗒️
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Ma liste</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                  Constituez votre liste d&apos;équipements et montrez-la à votre pharmacien pour vous faire conseiller.
                </p>
              </div>
              <span style={{ marginTop: 'auto', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Voir ma liste →</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ── PHARMACIEN ── */}
      <section style={{ padding: '64px 32px', background: '#fff', borderTop: '1px solid #f0f4f2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#7aa087', textTransform: 'uppercase', letterSpacing: '.08em' }}>Proche de chez vous</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#17212b', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Votre pharmacien est là pour vous
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#53636e', lineHeight: 1.7 }}>
              Tous les équipements peuvent être essayés, commandés et livrés par votre pharmacien partenaire LGm@d. Il peut aussi vous accompagner dans les démarches de remboursement.
            </p>
            <Link href="/particulier/chat" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '14px',
              background: '#294e46', color: '#fff',
              fontSize: '14px', fontWeight: 700, textDecoration: 'none',
            }}>
              💬 Poser une question à Hellia
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            {[
              { emoji: '🏪', label: 'En pharmacie', desc: 'Essayez avant d\'acheter' },
              { emoji: '🚚', label: 'Livraison', desc: 'À domicile sur commande' },
              { emoji: '💊', label: 'Remboursement', desc: 'Aide aux démarches' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '20px 16px', borderRadius: '16px', background: '#f6fbf8', border: '1px solid #e3e9e5', textAlign: 'center', width: '110px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '26px' }}>{item.emoji}</p>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 800, color: '#17212b' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#7aa087', lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
