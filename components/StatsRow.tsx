import { Calendar, FileText, CheckCircle2, Clock } from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'

interface Props {
  appointment: any
  documentsCount: number
  step: string
}

export default function StatsRow({ appointment, documentsCount, step }: Props) {
  const completedSteps = step === 'complete' ? 3 : step === 'documents' ? 1 : 0
  const totalSteps = 3
  const progress = Math.round((completedSteps / totalSteps) * 100)

  const stats = [
    {
      label: 'Status',
      value: step === 'complete' ? 'Concluído' : step === 'documents' ? 'Em andamento' : 'Aguardando',
      icon: CheckCircle2,
      color: step === 'complete' ? 'text-brand-400' : step === 'documents' ? 'text-amber-400' : 'text-slate-400',
      bg: step === 'complete' ? 'bg-brand-500/10' : step === 'documents' ? 'bg-amber-500/10' : 'bg-slate-800',
    },
    {
      label: 'Consulta',
      value: appointment ? formatDateShort(appointment.scheduled_date) : 'Não agendada',
      icon: Calendar,
      color: appointment ? 'text-blue-400' : 'text-slate-500',
      bg: appointment ? 'bg-blue-500/10' : 'bg-slate-800',
    },
    {
      label: 'Documentos',
      value: `${documentsCount} arquivo${documentsCount !== 1 ? 's' : ''}`,
      icon: FileText,
      color: documentsCount > 0 ? 'text-purple-400' : 'text-slate-500',
      bg: documentsCount > 0 ? 'bg-purple-500/10' : 'bg-slate-800',
    },
    {
      label: 'Progresso',
      value: `${completedSteps}/${totalSteps} etapas`,
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      showBar: true,
      progress,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg, showBar, progress }) => (
        <div key={label} className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
              <Icon size={15} className={color} />
            </div>
          </div>
          <p className={cn('font-semibold text-sm', color)}>{value}</p>
          {showBar && (
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
