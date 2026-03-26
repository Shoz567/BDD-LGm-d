import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/data'

interface ProductCardProps {
  product: Product
  className?: string
}

const badgeStyles = {
  vente: 'bg-success/10 text-success',
  location: 'bg-accent-soft text-accent',
  prestataire: 'bg-surface-muted text-text-secondary'
}

const badgeLabels = {
  vente: 'Vente',
  location: 'Location',
  prestataire: 'Prestataire'
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link
      href={`/produits/${product.reference}`}
      className={cn(
        'group block bg-surface-elevated rounded-2xl border border-border p-4',
        'shadow-warm transition-lift hover-lift hover:shadow-warm-md',
        className
      )}
    >
      {/* Image placeholder */}
      <div className="aspect-square rounded-xl bg-surface-muted mb-4 flex items-center justify-center overflow-hidden">
        <Package className="w-12 h-12 text-text-tertiary" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {product.badges.map((badge) => (
          <span
            key={badge}
            className={cn(
              'px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-md',
              badgeStyles[badge]
            )}
          >
            {badgeLabels[badge]}
          </span>
        ))}
      </div>

      {/* Product name */}
      <h3 className="font-semibold text-text-primary leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {product.nom}
      </h3>

      {/* Reference */}
      <p className="text-xs text-text-tertiary mb-3">
        Réf. {product.reference}
      </p>

      {/* Price */}
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-lg font-bold text-text-primary">
            {product.prixTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          {product.baseLPPR > 0 && (
            <p className="text-xs text-text-secondary">
              Base LPPR : {product.baseLPPR.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>
      </div>

      {/* Link */}
      <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
        <span>Voir la fiche</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
