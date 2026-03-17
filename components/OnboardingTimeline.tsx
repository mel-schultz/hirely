'use client'

import Link from 'next/link'
import { CheckCircle2, Clock, ArrowRight, Calendar, Upload, FileCheck, Loader } from 'lucide-react'
import { cn, formatDateShort, getDocumentLabel } from '@/lib/utils'

interface Props {
  profile: any
  appointment: any
  documents: any[]
}

const STEPS = [
  {
    id: 'schedule',
    label: 'Agendamento do Exame',
    description: 'Informe a clínica e data do seu exame admissional',
    icon: Calendar,
    href: '/dashboard/schedule',
    cta: 'Agendar agora',
  },
  {
    id: 'documents',
    label: 'Envio de Documentos',
    description: 'Faça upload dos documentos preenchidos após o exame',
    icon: Upload,
    href: '/dashboard/documents',
    cta: 'Enviar documentos',
  },
  {
    id: 'complete',
    label: 'Processo Concluído',
    description: 'Tudo certo! Sua documentação está completa',
    icon: FileCheck,
    href: '/dashboard',
    cta: null,
  },
]

function getStepStatus(stepId: string, currentStep: string, appointment: any, documents: any[]) {
  if (stepId === 'schedule') {
    if (appointment) return 'done'
    return currentStep === 'schedule' ? 'active' : 'pending'
  }
  if (stepId === 'documents') {
    if (!appointment) return 'pending'
    if (documents.length > 0) return 'done'
    return 'active'
  }
  if (stepId === 'complete') {
    if (documents.length > 0 && appointment) return 'done'
    return 'pending'
  }
  return 'pending'
}

export default function OnboardingTimeline({ profile, appointment, documents }: Props) {
  const currentStep = profile?.onboarding_step ?? 'schedule'

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-white">Sua jornada de admissão</h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-10 bottom-10 w-px bg-slate-800 hidden sm:block" />

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.id, currentStep, appointment, documents)
            const Icon = step.icon
            const isDone = status === 'done'
            const isActive = status === 'active'
            const isPending = status === 'pending'

            return (
              <div
                key={step.id}
                className={cn(
                  'relative flex gap-4 sm:gap-6 p-5 sm:pl-14 rounded-2xl border transition-all duration-300',
                  isDone && 'glass-card border-brand-500/20 bg-brand-500/5',
                  isActive && 'glass-card border-brand-500/40 bg-brand-500/10 glow-green',
                  isPending && 'bg-slate-900/40 border-slate-800'
                )}
              >
                {/* Step indicator - positioned on the line */}
                <div className={cn(
                  'hidden sm:flex absolute left-0 w-10 h-10 rounded-full items-center justify-center border-2 z-10 bg-slate-950 flex-shrink-0',
                  isDone && 'border-brand-500 bg-brand-500',
                  isActive && 'border-brand-500 bg-brand-500/20',
                  isPending && 'border-slate-700 bg-slate-900'
                )}>
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : isActive ? (
                    <Loader size={16} className="text-brand-400 animate-spin" />
                  ) : (
                    <span className="text-slate-600 text-sm font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Mobile step indicator */}
                <div className={cn(
                  'sm:hidden flex w-10 h-10 rounded-full items-center justify-center border-2 flex-shrink-0',
                  isDone && 'border-brand-500 bg-brand-500',
                  isActive && 'border-brand-500 bg-brand-500/20',
                  isPending && 'border-slate-700 bg-slate-900'
                )}>
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : (
                    <Icon size={16} className={isActive ? 'text-brand-400' : 'text-slate-600'} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={cn(
                          'font-semibold text-base',
                          isDone ? 'text-brand-300' : isActive ? 'text-white' : 'text-slate-500'
                        )}>
                          {step.label}
                        </h3>
                        {isDone && (
                          <span className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full px-2 py-0.5">
                            Concluído
                          </span>
                        )}
                        {isActive && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
                            Em andamento
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        'text-sm',
                        isDone ? 'text-slate-400' : isActive ? 'text-slate-300' : 'text-slate-600'
                      )}>
                        {step.description}
                      </p>
                    </div>

                    {step.cta && (isActive || (isDone && step.id !== 'complete')) && (
                      <Link
                        href={step.href}
                        className={cn(
                          'flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                          isDone
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                            : 'btn-primary text-sm py-2'
                        )}
                      >
                        {isDone ? 'Ver detalhes' : step.cta}
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>

                  {/* Detail preview */}
                  {isDone && step.id === 'schedule' && appointment && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-800/80 rounded-lg px-3 py-1.5">
                        <Calendar size={12} className="text-brand-500" />
                        {formatDateShort(appointment.scheduled_date)} às {appointment.scheduled_time?.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-800/80 rounded-lg px-3 py-1.5">
                        {appointment.clinic_name}
                      </span>
                    </div>
                  )}

                  {isDone && step.id === 'documents' && documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {documents.slice(0, 3).map((doc: any) => (
                        <span key={doc.id} className="text-xs bg-slate-800/80 rounded-lg px-3 py-1.5 text-slate-400 flex items-center gap-1">
                          <FileCheck size={11} className="text-brand-500" />
                          {getDocumentLabel(doc.type)}
                        </span>
                      ))}
                      {documents.length > 3 && (
                        <span className="text-xs text-slate-500 px-2 py-1.5">
                          +{documents.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
