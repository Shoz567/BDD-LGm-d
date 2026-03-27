import Topbar from '@/components/Topbar';
import Link from 'next/link';

export default function Catalogue() {
  return (
    <>
      <Topbar />
      <div style={{
        paddingTop: 'calc(var(--topbar-height) + 48px)',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'calc(var(--topbar-height) + 48px) 32px 80px',
      }}>
        <div style={{ marginBottom: 40 }}>
          <p className="section-label">Catalogue LGm@d</p>
          <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 36, letterSpacing: '-0.025em', color: 'var(--color-text)', marginBottom: 8 }}>
            2 470 références <em style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', color: 'var(--color-brand)' }}>MAD</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>
            Aide à la marche, fauteuils roulants, salle de bain, chambre et plus.
          </p>
        </div>

        {/* Barre de filtre */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 0',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 32,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#ffffff', border: '1px solid var(--color-border)',
            borderRadius: 6, padding: '0 12px', height: 36, flex: 1, maxWidth: 320,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Rechercher une référence..." style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 13,
              fontFamily: 'var(--font-body)', color: 'var(--color-text)', background: 'none',
            }} />
          </div>
          {['Tout', 'Aide à la marche', 'Fauteuils', 'Salle de bain', 'Chambre'].map(cat => (
            <button key={cat} style={{
              fontSize: 12, fontWeight: 500, padding: '5px 12px',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              color: cat === 'Tout' ? 'var(--color-brand)' : 'var(--color-muted)',
              background: cat === 'Tout' ? 'var(--color-surface)' : '#fff',
              cursor: 'pointer',
            }}>{cat}</button>
          ))}
        </div>

        {/* Grille de produits placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: '#fff',
            }}>
              <div style={{ height: 140, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>Réf. MAD-{1000 + i}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                  Produit MAD {i + 1}
                </p>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-brand)' }}>
                  {(49 + i * 23).toFixed(2).replace('.', ',')} €
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Le catalogue complet est chargé depuis la base de données.{' '}
            <Link href="/admin" style={{ color: 'var(--color-brand)', borderBottom: '1px solid #294e4640' }}>
              Accéder à l'administration →
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
