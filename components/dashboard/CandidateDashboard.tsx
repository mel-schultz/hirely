'use client'

import Link from 'next/link'
import { Calendar, FileText, ArrowRight, CheckCircle2, Clock, AlertCircle, FileCheck, Upload, Loader } from 'lucide-react'
import { cn, formatDateShort, getDocumentLabel } from '@/lib/utils'
import { Badge } from '@/components/ui'

interface Props {
  profile: any
  appointment: any
  documents: any[]
}

function getStepStatus(stepId: string, appointment: any, documents: any[]) {
  if (stepId === 'schedule') return appointment ? 'done' : 'active'
  if (stepId === 'documents') {
    if (!appointment) return 'pending'
    return documents.length > 0 ? 'done' : 'active'
  }
  if (stepId === 'complete') return (appointment && documents.length > 0) ? 'done' : 'pending'
  return 'pending'
}

const STEPS = [
  {
    id: 'schedule',
    num: '01',
    label: 'Agendar consulta',
    description: 'Informe a clínica e a data do seu exame admissional.',
    icon: Calendar,
    href: '/dashboard/schedule',
    cta: 'Agendar agora',
  },
  {
    id: 'documents',
    label: 'Enviar documentos',
    num: '02',
    description: 'Faça upload dos documentos preenchidos após o exame.',
    icon: Upload,
    href: '/dashboard/documents',
    cta: 'Enviar documentos',
  },
  {
    id: 'complete',
    num: '03',
    label: 'Processo concluído',
    description: 'Sua documentação está completa. Tudo certo!',
    icon: FileCheck,
    href: '/dashboard',
    cta: null,
  },
]

export default function CandidateDashboard({ profile, appointment, documents }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'Candidato'
  const completedSteps = [
    !!appointment,
    documents.length > 0,
    appointment && documents.length > 0,
  ].filter(Boolean).length

  const progress = Math.round((completedSteps / 3) * 100)

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <p className="text-slate-500 text-sm mb-0.5">Bem-vindo de volta,</p>
        <h1 className="font-display text-3xl font-bold text-white">{firstName} 👋</h1>
      </div>

      {/* Progress banner */}
      <div
        className="opacity-0 animate-fade-up"
        style={{ animationFillMode: 'forwards', animationDelay: '80ms' }}
      >
        <div className={cn(
          'glass-card p-5 border',
          completedSteps === 3
            ? 'border-brand-500/30 bg-brand-500/5'
            : 'border-slate-700/50'
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium">
                  {completedSteps === 3
                    ? '🎉 Admissão concluída!'
                    : `Etapa ${completedSteps + 1} de 3`}
                </p>
                <span className="text-brand-400 text-sm font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {completedSteps < 3 && (
              <Link
                href={!appointment ? '/dashboard/schedule' : '/dashboard/documents'}
                className="btn-primary text-sm py-2.5 whitespace-nowrap flex items-center gap-1.5"
              >
                Continuar <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div
        className="opacity-0 animate-fade-up grid grid-cols-2 sm:grid-cols-3 gap-3"
        style={{ animationFillMode: 'forwards', animationDelay: '160ms' }}
      >
        {[
          {
            label: 'Agendamento',
            value: appointment ? formatDateShort(appointment.scheduled_date) : 'Pendente',
            icon: Calendar,
            ok: !!appointment,
          },
          {
            label: 'Documentos',
            value: `${documents.length} enviado${documents.length !== 1 ? 's' : ''}`,
            icon: FileText,
            ok: documents.length > 0,
          },
          {
            label: 'Status geral',
            value: completedSteps === 3 ? 'Concluído' : 'Em andamento',
            icon: CheckCircle2,
            ok: completedSteps === 3,
          },
        ].map(({ label, value, icon: Icon, ok }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={ok ? 'text-brand-400' : 'text-slate-500'} />
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn('font-semibold text-sm', ok ? 'text-brand-300' : 'text-slate-400')}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Steps timeline */}
      <div
        className="opacity-0 animate-fade-up space-y-3"
        style={{ animationFillMode: 'forwards', animationDelay: '240ms' }}
      >
        <h2 className="font-semibold text-white text-lg">Sua jornada</h2>

        {STEPS.map((step, i) => {
          const status = getStepStatus(step.id, appointment, documents)
          const Icon = step.icon
          const isDone = status === 'done'
          const isActive = status === 'active'
          const isPending = status === 'pending'

          return (
            <div key={step.id} className={cn(
              'relative p-5 rounded-2xl border transition-all duration-300',
              isDone && 'bg-brand-500/5 border-brand-500/20',
              isActive && 'bg-slate-800/60 border-brand-500/40 shadow-lg shadow-brand-500/5',
              isPending && 'bg-slate-900/40 border-slate-800/50 opacity-60',
            )}>
              <div className="flex items-start gap-4">
                {/* Step icon */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                  isDone && 'bg-brand-500 border-brand-500',
                  isActive && 'bg-brand-500/20 border-brand-500/40',
                  isPending && 'bg-slate-800 border-slate-700',
                )}>
                  {isDone
                    ? <CheckCircle2 size={18} className="text-white" />
                    : isActive
                    ? <Loader size={16} className="text-brand-400 animate-spin" />
                    : <Icon size={16} className="text-slate-600" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-slate-600 font-mono text-xs">{step.num}</span>
                    <h3 className={cn(
                      'font-semibold',
                      isDone ? 'text-brand-300' : isActive ? 'text-white' : 'text-slate-500'
                    )}>
                      {step.label}
                    </h3>
                    {isDone && <Badge variant="green">Concluído</Badge>}
                    {isActive && <Badge variant="amber">Em andamento</Badge>}
                  </div>
                  <p className={cn('text-sm', isDone ? 'text-slate-400' : isActive ? 'text-slate-300' : 'text-slate-600')}>
                    {step.description}
                  </p>

                  {/* Detail previews */}
                  {isDone && step.id === 'schedule' && appointment && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-slate-800/80 rounded-lg px-3 py-1.5 text-slate-400 flex items-center gap-1.5">
                        <Calendar size={11} className="text-brand-500" />
                        {formatDateShort(appointment.scheduled_date)} às {appointment.scheduled_time?.slice(0, 5)}
                      </span>
                      <span className="text-xs bg-slate-800/80 rounded-lg px-3 py-1.5 text-slate-400">
                        {appointment.clinic_name}
                      </span>
                    </div>
                  )}
                  {isDone && step.id === 'documents' && documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {documents.slice(0, 3).map((d: any) => (
                        <span key={d.id} className="text-xs bg-slate-800/80 rounded-lg px-3 py-1.5 text-slate-400 flex items-center gap-1.5">
                          <FileCheck size={11} className="text-brand-500" />
                          {getDocumentLabel(d.type)}
                        </span>
                      ))}
                      {documents.length > 3 && (
                        <span className="text-xs text-slate-600 px-2 py-1.5">+{documents.length - 3} mais</span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA */}
                {step.cta && (isActive || isDone) && (
                  <Link
                    href={step.href}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                      isActive
                        ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                    )}
                  >
                    {isDone ? 'Editar' : step.cta}
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
