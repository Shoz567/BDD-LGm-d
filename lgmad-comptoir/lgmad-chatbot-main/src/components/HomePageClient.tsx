'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Mode = 'comptoir' | 'gestion';

const PARCOURS = [
  { slug: 'aide-marche',      label: 'Aide à la marche',    img: '/images/parcours-marche.png',       desc: 'Déambulateurs, cannes, rollators' },
  { slug: 'chambre',          label: 'La chambre',          img: '/images/parcours-chambre.png',      desc: 'Lits médicalisés, matelas, tables' },
  { slug: 'fauteuils',        label: 'Fauteuils roulants',  img: '/images/parcours-fauteuils.png',    desc: 'Manuel, électrique, confort' },
  { slug: 'salle-de-bain',    label: 'Salle de bain',       img: '/images/parcours-salle-de-bain.png',desc: 'Sièges, barres, tapis antidérapants' },
  { slug: 'toilettes',        label: 'Toilettes',           img: '/images/parcours-toilettes.png',    desc: 'Rehausseurs, cadres, commodes' },
  { slug: 'aides-techniques', label: 'Aides techniques',    img: '/images/parcours-aides-techniques.png', desc: 'Préhension, habillage, communication' },
];

const MGMT_TOOLS = [
  { label: 'Clients',     metric: '213 actifs',            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { label: 'Commandes',   metric: '12 en cours',           icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, alert: '3 bloquées' },
  { label: 'Catalogues',  metric: '4 fournisseurs',        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
  { label: 'Formations',  metric: '2 nouveaux',            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
  { label: 'Ressources',  metric: 'Mis à jour',            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
];

const KPIS = [
  { label: 'CA HT total',        value: '128 450 €', delta: '+8%',  positive: true },
  { label: 'Devis en attente',   value: '7',         delta: '+2',   positive: false },
  { label: 'Commandes validées', value: '94',        delta: '+12%', positive: true },
  { label: 'Marge brute',        value: '31,2%',     delta: '+1.4%',positive: true },
];

export default function HomePageClient() {
  const [mode, setMode] = useState<Mode>('comptoir');
  const [helliaInput, setHelliaInput] = useState('');

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>

      {/* ── NAVIGATION ── */}
      <nav style={{
        position: 'fixed',
        top: 'var(--topbar-height)',
        left: 0, right: 0,
        zIndex: 900,
        height: 'var(--nav-height)',
        background: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        ...(mode === 'gestion' ? { borderTop: '3px solid var(--color-brand)' } : {}),
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 32,
      }}>
        {/* Mode gestion badge */}
        {mode === 'gestion' && (
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'white', background: 'var(--color-brand)',
            padding: '2px 8px', borderRadius: 'var(--radius-sm)',
          }}>Mode gestion</span>
        )}

        {/* Liens nav */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[
            { href: '/', label: 'Accueil' },
            { href: '/catalogue', label: 'Catalogue' },
            { href: '#', label: 'Documentation' },
          ].map(({ href, label }) => (
            <Link key={label} href={href} style={{
              fontSize: 13, fontWeight: 500, color: 'var(--color-muted)',
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >{label}</Link>
          ))}
        </div>

        {/* Mode switch */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 3,
          gap: 2,
          position: 'relative',
        }}>
          {(['comptoir', 'gestion'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontSize: 12, fontWeight: 500,
                padding: '5px 14px',
                borderRadius: 6,
                color: mode === m ? 'var(--color-brand)' : 'var(--color-muted)',
                background: mode === m ? '#ffffff' : 'transparent',
                boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          MODE COMPTOIR
      ══════════════════════════════════════════ */}
      {mode === 'comptoir' && (
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '48px 32px 80px' }}>

          {/* ── HERO ── */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 48,
            alignItems: 'flex-start',
            marginBottom: 64,
            padding: '48px 0',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {/* Left — Editorial */}
            <div>
              <p className="section-label">Plateforme MAD · Pharmaciens partenaires</p>
              <h1 style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: 42,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                color: 'var(--color-text)',
                marginBottom: 16,
              }}>
                Le réflexe{' '}
                <em style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontWeight: 400, color: 'var(--color-brand)' }}>MAD</em>
                <br/>de la pharmacie
              </h1>
              <p style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 32, maxWidth: 420, lineHeight: 1.6 }}>
                Conseillez, orientez et accédez aux bonnes solutions MAD depuis un seul espace.
              </p>

              {/* 3 liens texte */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { href: '/questionnaire', label: 'Questionnaire autonomie' },
                  { href: '/parcours/conseil', label: 'Parcours conseil' },
                  { href: '/catalogue', label: 'Catalogue produits' },
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 14, fontWeight: 500, color: 'var(--color-brand)',
                      borderBottom: '1px solid #294e4640',
                      paddingBottom: 2,
                      width: 'fit-content',
                    }}
                    onMouseEnter={e => {
                      const arrow = e.currentTarget.querySelector('span') as HTMLElement;
                      if (arrow) arrow.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      const arrow = e.currentTarget.querySelector('span') as HTMLElement;
                      if (arrow) arrow.style.transform = 'translateX(0)';
                    }}
                  >
                    {label}
                    <span style={{ transition: 'transform 0.15s ease', display: 'inline-block' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right — Bloc Hellia */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid #E2EAE6',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              position: 'relative',
            }}>
              {/* Badge IA bêta */}
              <span style={{
                position: 'absolute', top: 14, right: 14,
                background: 'var(--color-brand)',
                color: 'white',
                fontSize: 10, fontWeight: 500, letterSpacing: '0.04em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
              }}>IA · bêta</span>

              {/* Header Hellia */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 'var(--radius-pill)',
                    border: '2px solid #456f65',
                    overflow: 'hidden',
                    background: 'var(--color-border)',
                  }}>
                    <Image src="/images/hellia.png" alt="Hellia" width={52} height={52} style={{ objectFit: 'cover' }} />
                  </div>
                  <span style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 10, height: 10,
                    background: '#22c55e',
                    border: '2px solid white',
                    borderRadius: 'var(--radius-pill)',
                  }}/>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>Hellia</p>
                  <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>Conseillère MAD · en ligne</p>
                </div>
              </div>

              {/* Bulle */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #dce8e3',
                borderRadius: '0 12px 12px 12px',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--color-text)',
                marginBottom: 12,
                lineHeight: 1.5,
              }}>
                Comment puis-je vous conseiller aujourd'hui ?
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={helliaInput}
                  onChange={e => setHelliaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && helliaInput.trim()) window.location.href = '/chatbot/comptoir'; }}
                  placeholder="Décrivez la situation du patient..."
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    border: '1px solid #dce8e3',
                    borderRadius: 8,
                    height: 40,
                    padding: '0 12px',
                    fontSize: 13,
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
                <Link href="/chatbot/comptoir" style={{
                  width: 40, height: 40,
                  background: 'var(--color-brand)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
                  </svg>
                </Link>
              </div>

              {/* CTA secondaire */}
              <Link href="/chatbot/comptoir" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: 12,
                fontSize: 12, fontWeight: 500, color: 'var(--color-brand-mid)',
              }}>
                Lancer un questionnaire personnalisé
                <span>→</span>
              </Link>
            </div>
          </section>

          {/* ── PARCOURS MAD ── */}
          <section style={{ marginBottom: 56 }}>
            <p className="section-label">Parcours MAD</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 16,
            }}>
              {PARCOURS.map(p => (
                <Link
                  key={p.slug}
                  href={`/parcours/${p.slug}`}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-brand)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ height: 80, overflow: 'hidden', background: 'var(--color-surface)' }}>
                    <Image src={p.img} alt={p.label} width={200} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '10px 12px 28px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{p.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4 }}>{p.desc}</p>
                  </div>
                  <span style={{
                    position: 'absolute', bottom: 10, right: 12,
                    fontSize: 13, color: 'var(--color-brand)',
                  }}>›</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── OUTILS ── */}
          <section style={{ marginBottom: 56 }}>
            <p className="section-label">Les outils LGm@d</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Questionnaires autonomie', desc: 'Qualifier la situation du patient en quelques minutes' },
                { label: 'Parcours conseils', desc: 'Guider le pharmacien selon la situation clinique' },
                { label: 'Guides autonomie', desc: 'Documentation pour les patients et les aidants' },
                { label: 'Contenus patient', desc: 'Fiches et supports imprimables en pharmacie' },
              ].map(t => (
                <Link key={t.label} href="/bientot-disponible" style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 16px',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand-mid)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4 }}>{t.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODE GESTION
      ══════════════════════════════════════════ */}
      {mode === 'gestion' && (
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '48px 32px 80px' }}>

          {/* ── KPI ROW ── */}
          <section style={{ marginBottom: 56 }}>
            <p className="section-label">Activité du mois</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid var(--color-border)',
            }}>
              {KPIS.map((kpi, i) => (
                <div key={kpi.label} style={{
                  padding: '24px 24px 24px',
                  borderRight: i < KPIS.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 8 }}>
                    {kpi.label}
                  </p>
                  <p style={{ fontSize: 28, fontWeight: 300, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {kpi.value}
                  </p>
                  <span style={{ fontSize: 12, color: kpi.positive ? '#16a34a' : 'var(--color-accent)', fontWeight: 500 }}>
                    {kpi.delta}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── OUTILS DE GESTION ── */}
          <section style={{ marginBottom: 56 }}>
            <p className="section-label">Gestion de l'activité</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {MGMT_TOOLS.map(t => (
                <Link key={t.label} href="/bientot-disponible" style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 16px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <span style={{ color: 'var(--color-brand)' }}>{t.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{t.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>{t.metric}</p>
                  </div>
                  {t.alert && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      fontSize: 10, fontWeight: 500, color: 'var(--color-accent)',
                      background: '#fef3ec', borderRadius: 'var(--radius-sm)',
                      padding: '2px 6px',
                    }}>{t.alert}</span>
                  )}
                  <span style={{ position: 'absolute', bottom: 12, right: 12, color: 'var(--color-brand-light)', fontSize: 14 }}>›</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── ACTIONS ── */}
          <section style={{ marginBottom: 56 }}>
            <p className="section-label">Actions requises</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 24, background: '#fff' }}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 12 }}>Devis en attente</p>
                <p style={{ fontSize: 28, fontWeight: 300, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>7</p>
                <p style={{ fontSize: 12, color: 'var(--color-accent)', marginTop: 4 }}>+2 depuis hier</p>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 24, background: '#fff' }}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 12 }}>Commandes à valider</p>
                <p style={{ fontSize: 28, fontWeight: 300, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>12</p>
                <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>Délai moyen : 1,4 jours</p>
              </div>
            </div>
          </section>

          {/* ── CHATBOT GESTION ── */}
          <section>
            <p className="section-label">Assistance</p>
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              background: 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 4 }}>
                  Support LGm@d disponible 24h/24
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                  Commandes, catalogue, devis — réponses immédiates.
                </p>
              </div>
              <Link href="/chatbot/gestion" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--color-brand)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 13, fontWeight: 500,
              }}>
                Ouvrir l'assistant
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
