'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';

interface ProductCardProps {
  product: Product & { justification?: string; priorite?: number };
}

export function ProductCard({ product }: ProductCardProps) {
  const hasLPPR = product.base_lppr && product.base_lppr > 0;
  const { add } = useCart();

  return (
    <div className="product-card">
      {/* Image or Placeholder */}
      <div style={{
        height: '140px',
        background: 'linear-gradient(135deg, #111827, #1a2235)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.nom}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: '3rem', opacity: 0.3 }}>🏥</span>
        )}
        {product.priorite && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(26, 86, 219, 0.9)',
            color: 'white',
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '0.7rem',
            fontWeight: '700',
          }}>
            #{product.priorite}
          </div>
        )}
        {hasLPPR && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(132, 204, 22, 0.9)',
            color: '#1a2235',
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '0.7rem',
            fontWeight: '700',
          }}>
            LPPR
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '4px', fontFamily: 'monospace' }}>
          {product.reference}
        </p>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px', lineHeight: '1.4' }}>
          {product.nom}
        </h3>

        {/* Justification IA */}
        {product.justification && (
          <div style={{
            background: 'rgba(26, 86, 219, 0.08)',
            border: '1px solid rgba(26, 86, 219, 0.2)',
            borderRadius: '8px',
            padding: '8px 10px',
            marginBottom: '12px',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', lineHeight: '1.5' }}>
              💡 {product.justification}
            </p>
          </div>
        )}

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {product.prix_ttc.toFixed(2)} €
            </span>
            {hasLPPR && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Base : {product.base_lppr?.toFixed(2)} €
              </span>
            )}
          </div>
          {hasLPPR && product.base_lppr && (
            <span style={{
              fontSize: '0.7rem',
              background: 'rgba(132, 204, 22, 0.1)',
              color: '#86efac',
              border: '1px solid rgba(132, 204, 22, 0.25)',
              borderRadius: '999px',
              padding: '2px 8px',
            }}>
              Remboursable
            </span>
          )}
        </div>

        {/* Fiche PDF */}
        {product.pdf_url && (
          <a
            href={product.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '12px',
              fontSize: '0.75rem',
              color: 'var(--color-primary-light)',
              textDecoration: 'none',
              padding: '6px 10px',
              border: '1px solid rgba(26, 86, 219, 0.3)',
              borderRadius: '6px',
              background: 'rgba(26, 86, 219, 0.05)',
            }}
          >
            📄 Fiche technique PDF
          </a>
        )}

        {/* Ajouter au panier */}
        <button
          onClick={() => add({
            reference: product.reference,
            nom: product.nom,
            prix_ttc: product.prix_ttc ?? null,
            image_url: product.image_url ?? null,
          })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '8px',
            width: '100%',
            padding: '7px 10px',
            border: '1px solid rgba(41, 78, 70, 0.3)',
            borderRadius: '6px',
            background: 'rgba(41, 78, 70, 0.05)',
            color: 'var(--brand-primary, #294e46)',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🛒 Ajouter au panier
        </button>
      </div>
    </div>
  );
}
