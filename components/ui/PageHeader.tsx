import { cn } from '@/lib/utils'

interface Props {
  title: string
  description?: string
  badge?: { label: string; color?: string }
  action?: React.ReactNode
  className?: string
}

export default function PageHeader({ title, description, badge, action, className }: Props) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4', className)}>
      <div>
        {badge && (
          <span className={cn(
            'inline-block text-xs font-medium border rounded-full px-2.5 py-0.5 mb-2',
            badge.color ?? 'text-slate-400 bg-slate-700/50 border-slate-600/50'
          )}>
            {badge.label}
          </span>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        {description && (
          <p className="text-slate-400 mt-1 text-sm sm:text-base max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
