import Link from 'next/link'
import { 
  Footprints, 
  Bed, 
  Accessibility, 
  ShowerHead, 
  Toilet,
  Wrench,
  Stethoscope,
  Dumbbell,
  Building2,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pathway } from '@/lib/data'

interface PathwayCardProps {
  pathway: Pathway
  variant?: 'default' | 'pro'
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  'walking-cane': Footprints,
  'bed': Bed,
  'wheelchair': Accessibility,
  'shower': ShowerHead,
  'toilet': Toilet,
  'tools': Wrench,
  'medical': Stethoscope,
  'rehabilitation': Dumbbell,
  'clinic': Building2
}

export function PathwayCard({ pathway, variant = 'default', className }: PathwayCardProps) {
  const Icon = iconMap[pathway.icon] || Wrench
  const isPro = variant === 'pro' || pathway.isPro

  if (pathway.comingSoon) {
    return (
      <div
        className={cn(
          'relative block bg-surface-elevated rounded-2xl border border-dashed border-border-strong p-5',
          'opacity-75',
          className
        )}
      >
        {/* Coming soon badge */}
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-md bg-surface-muted text-text-tertiary">
          Bientôt
        </span>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-text-tertiary" />
        </div>

        {/* Content */}
        <h3 className="font-semibold text-text-secondary mb-1">{pathway.nom}</h3>
        <p className="text-sm text-text-tertiary line-clamp-2">{pathway.description}</p>
      </div>
    )
  }

  return (
    <Link
      href={`/parcours/${pathway.slug}`}
      className={cn(
        'group relative block rounded-2xl p-5 transition-lift hover-lift',
        isPro 
          ? 'bg-surface-elevated border-2 border-dashed border-border-strong hover:border-primary/30'
          : 'bg-surface-elevated border border-border shadow-warm hover:shadow-warm-md',
        className
      )}
    >
      {/* PRO badge */}
      {isPro && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-md bg-primary-soft text-primary">
          PRO
        </span>
      )}

      {/* Icon */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
        isPro ? 'bg-primary-soft' : 'bg-primary-soft'
      )}>
        <Icon className={cn('w-6 h-6', isPro ? 'text-primary' : 'text-primary')} />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
        {pathway.nom}
      </h3>
      <p className="text-sm text-text-secondary line-clamp-2 mb-3">{pathway.description}</p>

      {/* Product count & arrow */}
      <div className="flex items-center justify-between">
        {pathway.productCount > 0 && (
          <span className="text-xs text-text-tertiary">
            {pathway.productCount} produits
          </span>
        )}
        <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  )
}
