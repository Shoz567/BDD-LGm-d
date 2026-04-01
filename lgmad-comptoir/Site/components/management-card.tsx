import Link from 'next/link'
import { 
  Users, 
  Package, 
  BookOpen, 
  GraduationCap, 
  Folder,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ManagementCardData {
  id: string
  titre: string
  description: string
  icon: string
  hasNotification?: boolean
  alertBadge?: string
}

interface ManagementCardProps {
  card: ManagementCardData
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  package: Package,
  book: BookOpen,
  graduation: GraduationCap,
  folder: Folder
}

export function ManagementCard({ card, className }: ManagementCardProps) {
  const Icon = iconMap[card.icon] || Folder

  return (
    <Link
      href="/bientot-disponible"
      className={cn(
        'group relative block bg-surface-elevated rounded-2xl border border-border p-6',
        'shadow-warm transition-lift hover-lift hover:shadow-warm-md',
        className
      )}
    >
      {/* Notification dot */}
      {card.hasNotification && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-accent rounded-full" />
      )}

      {/* Alert badge */}
      {card.alertBadge && (
        <span className="absolute top-4 right-4 px-2 py-1 text-[11px] font-semibold rounded-lg bg-danger/10 text-danger">
          {card.alertBadge}
        </span>
      )}

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
        {card.titre}
      </h3>
      <p className="text-sm text-text-secondary mb-4">{card.description}</p>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  )
}
