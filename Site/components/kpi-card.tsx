import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPI, ActionMetric } from '@/lib/data'

interface KPICardProps {
  kpi: KPI
  className?: string
}

export function KPICard({ kpi, className }: KPICardProps) {
  return (
    <div
      className={cn(
        'bg-surface-elevated rounded-2xl border border-border p-6 shadow-warm',
        className
      )}
    >
      <p className="text-sm font-medium text-text-secondary mb-2">{kpi.label}</p>
      <div className="flex items-end justify-between gap-4">
        <p className="text-3xl font-bold text-text-primary">{kpi.value}</p>
        {kpi.trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
              kpi.trendPositive 
                ? 'bg-success/10 text-success' 
                : 'bg-danger/10 text-danger'
            )}
          >
            {kpi.trendPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{kpi.trend}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface ActionMetricCardProps {
  metric: ActionMetric
  className?: string
}

export function ActionMetricCard({ metric, className }: ActionMetricCardProps) {
  return (
    <div
      className={cn(
        'relative bg-surface-elevated rounded-xl border border-border p-4 shadow-warm-sm',
        className
      )}
    >
      {/* Notification/Alert dot */}
      {(metric.hasAlert || metric.hasNotification) && (
        <span 
          className={cn(
            'absolute top-3 right-3 w-2.5 h-2.5 rounded-full',
            metric.hasAlert ? 'bg-danger' : 'bg-accent'
          )}
        />
      )}

      <p className="text-2xl font-bold text-text-primary mb-1">{metric.value}</p>
      <p className="text-sm text-text-secondary">{metric.label}</p>
    </div>
  )
}
