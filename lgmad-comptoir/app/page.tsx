'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{
        width: '80px', height: '80px',
        background: 'linear-gradient(135deg, #1a56db, #06b6d4)',
        borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
        marginBottom: '24px',
        boxShadow: '0 0 40px rgba(26, 86, 219, 0.4)',
      }}>
        🏥
      </div>

      <h1 style={{ fontSize: '2.25rem', marginBottom: '12px', color: 'var(--color-text)' }}>
        LGm@d
      </h1>

      <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
        Assistant virtuel IA — Matériel de Maintien à Domicile
      </p>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '440px', marginBottom: '40px', lineHeight: '1.6' }}>
        Orientez vos patients vers les équipements MAD les plus adaptés à leur niveau
        de dépendance grâce à un entretien conversationnel guidé.
      </p>

      <Link
        href="/comptoir"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #1a56db, #1e40af)',
          color: 'white',
          borderRadius: '999px',
          padding: '16px 36px',
          fontSize: '1rem',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(26, 86, 219, 0.5)',
          transition: 'all 200ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(26, 86, 219, 0.6)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(26, 86, 219, 0.5)';
        }}
      >
        🚀 Démarrer le Mode Comptoir
      </Link>

      {/* Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '56px',
        maxWidth: '720px',
        width: '100%',
      }}>
        {[
          { icon: '💬', title: 'IA Conversationnelle', desc: 'Entretien naturel guidé par Mistral Large' },
          { icon: '📊', title: 'Score GIR Dynamique', desc: 'Classification en temps réel sur 6 niveaux' },
          { icon: '📄', title: 'Analyse d\'ordonnance', desc: 'OCR intelligent via Mistral Vision' },
        ].map((feat, i) => (
          <div key={i} style={{
            background: 'rgba(26, 34, 53, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '10px' }}>{feat.icon}</div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '6px' }}>{feat.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{feat.desc}</p>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '48px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        POC — LGm@d © 2026 — Données traitées conformément au RGPD
      </p>
    </div>
  );
}
