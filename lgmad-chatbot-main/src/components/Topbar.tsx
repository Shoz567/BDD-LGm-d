// src/components/Topbar.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Topbar() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: 'var(--topbar-height)',
      background: '#ffffff',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      gap: '24px',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--color-brand)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
          LGm<span style={{ color: 'var(--color-accent)' }}>@</span>d
        </span>
      </Link>

      {/* Barre de recherche */}
      <div style={{ flex: 1, maxWidth: 400, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          padding: '0 12px',
          height: 36,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit, une pathologie..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      </div>

      {/* Actions droite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {/* Messagerie */}
        <button style={{ position: 'relative', padding: 6, color: 'var(--color-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 14, height: 14,
            background: 'var(--color-accent)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 9, fontWeight: 600, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>3</span>
        </button>

        {/* Panier */}
        <button style={{ position: 'relative', padding: 6, color: 'var(--color-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
          </svg>
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 14, height: 14,
            background: 'var(--color-brand)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 9, fontWeight: 600, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>12</span>
        </button>

        {/* Utilisateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: 'var(--color-brand)',
          }}>AP</div>
          <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Pharmacie Aprium
          </span>
        </div>

        {/* Déconnexion */}
        <button style={{ padding: 6, color: 'var(--color-subtle)' }} title="Se déconnecter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
