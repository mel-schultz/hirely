import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: string; positive?: boolean }
  className?: string
}

export default function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend, className }: Props) {
  return (
    <div className={cn('glass-card p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg ?? 'bg-slate-800')}>
          <Icon size={16} className={iconColor ?? 'text-slate-400'} />
        </div>
      </div>
      <p className="text-white text-2xl font-bold font-display">{value}</p>
      {trend && (
        <p className={cn('text-xs mt-1', trend.positive ? 'text-brand-400' : 'text-slate-500')}>
          {trend.value}
        </p>
      )}
    </div>
  )
}
