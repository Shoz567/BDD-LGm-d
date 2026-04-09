'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Step {
  label: string;
  href?: string;
  active?: boolean;
}

interface Hint {
  label: string;
}

interface Product {
  title: string;
  price: string;
  image?: string;
  ref?: string;
  badge?: string;
}

interface ParcoursShellProps {
  title: string;
  subtitle: string;
  steps: Step[];
  hints: Hint[];
  products: Product[];
  accentColor?: string;
  nextHref?: string;
  nextLabel?: string;
}

export function ParcoursShell({
  title,
  subtitle,
  steps,
  hints,
  products,
  accentColor = '#294e46',
  nextHref,
  nextLabel = 'Étape suivante →',
}: ParcoursShellProps) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Breadcrumb + title */}
      <div
        style={{
          padding: '22px 24px',
          borderRadius: '26px',
          background: 'linear-gradient(180deg, rgba(255,255,255,.82) 0%, rgba(255,255,255,.66) 100%)',
          border: '1px solid rgba(227,233,229,.92)',
          boxShadow: '0 10px 24px rgba(23,33,43,.05)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#667085', marginBottom: '10px' }}>
          <Link href="/" style={{ color: '#294e46', fontWeight: 700 }}>Accueil</Link>
          <span>›</span>
          <Link href="/parcours" style={{ color: '#294e46', fontWeight: 700 }}>Parcours conseil</Link>
          <span>›</span>
          <span>{title}</span>
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: '34px', lineHeight: '1.05', letterSpacing: '-.03em', color: '#294e46', fontWeight: 800 }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.48', color: '#53636e' }}>
          {subtitle}
        </p>
      </div>

      {/* Steps nav */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {steps.map((step, i) => (
          step.href && !step.active ? (
            <Link
              key={i}
              href={step.href}
              style={{
                padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                background: '#fff', border: '1px solid #e3e9e5', color: '#294e46',
                textDecoration: 'none', boxShadow: '0 2px 8px rgba(23,33,43,.04)',
                transition: '.16s ease',
              }}
            >
              {step.label}
            </Link>
          ) : (
            <div
              key={i}
              style={{
                padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                background: step.active ? accentColor : '#fff',
                border: `1px solid ${step.active ? accentColor : '#e3e9e5'}`,
                color: step.active ? '#fff' : '#667085',
                boxShadow: step.active ? `0 4px 12px ${accentColor}33` : '0 2px 8px rgba(23,33,43,.04)',
              }}
            >
              {step.label}
            </div>
          )
        ))}
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {hints.map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: '12px', fontWeight: 800, padding: '6px 12px',
                borderRadius: '999px', border: '1px solid #d8e6df',
                background: '#edf5f1', color: '#294e46',
              }}
            >
              {h.label}
            </span>
          ))}
        </div>
      )}

      {/* Products grid */}
      <div
        style={{
          padding: '22px',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)',
          border: '1px solid rgba(227,233,229,.92)',
          boxShadow: '0 10px 24px rgba(23,33,43,.05)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: '12px', marginBottom: '18px', paddingLeft: '14px',
            borderLeft: `6px solid ${accentColor}`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', lineHeight: '1.12', fontWeight: 800, letterSpacing: '-.02em', color: '#294e46' }}>
              {title}
            </h2>
            <p style={{ margin: '6px 0 0', color: '#667085', fontSize: '14px' }}>
              {products.length} produits · Prix publics TTC
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {products.map((product, i) => (
            <div
              key={i}
              style={{
                background: '#fff', border: '1px solid #dce6e1', borderRadius: '16px',
                overflow: 'hidden', boxShadow: '0 8px 20px rgba(23,33,43,.04)',
                transition: 'transform .18s ease, box-shadow .18s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 28px rgba(23,33,43,.09)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(23,33,43,.04)';
              }}
            >
              {/* Image */}
              <div style={{
                height: '140px', background: '#f6fbf8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid #eef2f0',
                position: 'relative',
              }}>
                {product.badge && (
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    fontSize: '11px', fontWeight: 800, padding: '4px 8px',
                    borderRadius: '7px', color: '#fff',
                    background: accentColor,
                  }}>
                    {product.badge}
                  </span>
                )}
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={120}
                    height={120}
                    style={{ maxHeight: '120px', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>📦</span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '14px' }}>
                {product.ref && (
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#667085', fontWeight: 700 }}>
                    Réf. {product.ref}
                  </p>
                )}
                <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#123127', lineHeight: '1.3' }}>
                  {product.title}
                </p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46', letterSpacing: '-.02em' }}>
                  {product.price}
                </p>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderTop: '1px solid #edf1ef',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#294e46' }}>Voir la fiche</span>
                <span style={{
                  width: '30px', height: '30px', display: 'grid', placeItems: 'center',
                  borderRadius: '9px', background: '#edf5f1', color: '#294e46', fontWeight: 800, fontSize: '14px',
                }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          padding: '16px 24px', borderRadius: '20px',
          background: 'linear-gradient(180deg, rgba(255,255,255,.82) 0%, rgba(255,255,255,.66) 100%)',
          border: '1px solid rgba(227,233,229,.92)',
          boxShadow: '0 10px 24px rgba(23,33,43,.05)',
        }}
      >
        <div style={{ fontSize: '14px', color: '#667085', fontWeight: 600 }}>
          {products.length} produit{products.length > 1 ? 's' : ''} dans ce parcours
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            href="/comptoir"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
              background: '#fff', border: '1px solid #e3e9e5', color: '#294e46',
              textDecoration: 'none', boxShadow: '0 2px 8px rgba(23,33,43,.04)',
            }}
          >
            🤖 Comptoir IA
          </Link>
          {nextHref && (
            <Link
              href={nextHref}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                background: 'linear-gradient(180deg, #f28a45 0%, #e97123 100%)',
                color: '#fff', textDecoration: 'none',
                boxShadow: '0 8px 18px rgba(233,113,35,.22)',
              }}
            >
              {nextLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
