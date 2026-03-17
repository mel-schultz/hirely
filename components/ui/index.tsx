import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

// ── PageHeader ────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumb?: string
}
export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        {breadcrumb && (
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{breadcrumb}</p>
        )}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{title}</h1>
        {description && <p className="text-slate-400 text-sm mt-1 max-w-xl">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: string; positive: boolean }
  subtext?: string
}
export function StatCard({ label, value, icon: Icon, iconColor = 'text-brand-400', iconBg = 'bg-brand-500/10', trend, subtext }: StatCardProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
      {trend && (
        <p className={cn('text-xs mt-1 font-medium', trend.positive ? 'text-brand-400' : 'text-red-400')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-slate-600" />
      </div>
      <p className="text-white font-medium mb-1">{title}</p>
      {description && <p className="text-slate-500 text-sm max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'slate'
  size?: 'sm' | 'md'
}
export function Badge({ children, variant = 'slate', size = 'sm' }: BadgeProps) {
  const variants = {
    green:  'text-brand-400 bg-brand-500/10 border-brand-500/20',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red:    'text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    slate:  'text-slate-400 bg-slate-700/50 border-slate-600/50',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 border rounded-full font-medium',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
      variants[variant]
    )}>
      {children}
    </span>
  )
}

// ── SectionCard ───────────────────────────────────────────
interface SectionCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}
export function SectionCard({ title, description, children, action, className }: SectionCardProps) {
  return (
    <div className={cn('glass-card p-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="font-semibold text-white">{title}</h3>}
            {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── AccessDenied ──────────────────────────────────────────
export function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Acesso negado</h2>
        <p className="text-slate-400 text-sm">Você não tem permissão para acessar esta página.</p>
      </div>
    </div>
  )
}
