'use client'

import { useState } from 'react'
import {
  Search, CheckCircle2, Clock, AlertCircle,
  Calendar, FileText, User, ChevronDown, ChevronUp, Download, Eye
} from 'lucide-react'
import { cn, formatDateShort, getDocumentLabel } from '@/lib/utils'

interface Props {
  candidates: any[]
  appointments: any[]
  documents: any[]
}

function getStatusInfo(candidate: any, appointments: any[], documents: any[]) {
  const appt = appointments.find(a => a.user_id === candidate.user_id)
  const docs = documents.filter(d => d.user_id === candidate.user_id)
  const step = candidate.onboarding_step

  if (step === 'complete' || (appt && docs.length > 0)) {
    return { label: 'Completo', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20', icon: CheckCircle2 }
  }
  if (appt) {
    return { label: 'Aguardando docs', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock }
  }
  return { label: 'Aguardando início', color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700', icon: AlertCircle }
}

export default function AdminCandidates({ candidates, appointments, documents }: Props) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = candidates.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: candidates.length,
    complete: candidates.filter(c => {
      const appt = appointments.find(a => a.user_id === c.user_id)
      const docs = documents.filter(d => d.user_id === c.user_id)
      return appt && docs.length > 0
    }).length,
    pending: candidates.filter(c => !appointments.find(a => a.user_id === c.user_id)).length,
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Concluídos', value: stats.complete, color: 'text-brand-400' },
          { label: 'Aguardando', value: stats.pending, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={cn('font-display text-3xl font-bold', s.color)}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input-field pl-9"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <User size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum candidato encontrado</p>
          </div>
        ) : (
          filtered.map(candidate => {
            const status = getStatusInfo(candidate, appointments, documents)
            const StatusIcon = status.icon
            const appt = appointments.find(a => a.user_id === candidate.user_id)
            const docs = documents.filter(d => d.user_id === candidate.user_id)
            const isExpanded = expanded === candidate.id

            return (
              <div key={candidate.id} className="glass-card overflow-hidden">
                <button
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : candidate.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {candidate.full_name?.split(' ').filter(Boolean).slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white text-sm font-medium truncate">{candidate.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{candidate.email}</p>
                  </div>
                  <span className={cn('text-xs font-medium border rounded-full px-2.5 py-1 flex items-center gap-1.5', status.bg, status.color)}>
                    <StatusIcon size={11} />
                    {status.label}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4 space-y-4 bg-slate-900/40">
                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Informações</p>
                        <div className="space-y-1 text-slate-300">
                          {candidate.cpf && <p>CPF: {candidate.cpf}</p>}
                          {candidate.phone && <p>Tel: {candidate.phone}</p>}
                          <p>Desde: {new Date(candidate.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      {appt && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                            <Calendar size={11} /> Agendamento
                          </p>
                          <div className="space-y-1 text-slate-300 text-sm">
                            <p>{appt.clinic_name}</p>
                            <p>{formatDateShort(appt.scheduled_date)} às {appt.scheduled_time?.slice(0,5)}</p>
                            <p className="text-slate-500 text-xs">{appt.clinic_address}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    {docs.length > 0 && (
                      <div>
                        <p className="text-slate-500 text-xs mb-2 flex items-center gap-1">
                          <FileText size={11} /> Documentos enviados ({docs.length})
                        </p>
                        <div className="space-y-2">
                          {docs.map((doc: any) => (
                            <div key={doc.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2">
                              <FileText size={14} className="text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-300 text-xs font-medium truncate">{doc.file_name}</p>
                                <p className="text-slate-600 text-xs">{getDocumentLabel(doc.type)}</p>
                              </div>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                className="text-slate-500 hover:text-brand-400 transition-colors" title="Visualizar">
                                <Eye size={14} />
                              </a>
                              <a href={doc.file_url} download={doc.file_name}
                                className="text-slate-500 hover:text-blue-400 transition-colors" title="Baixar">
                                <Download size={14} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!appt && (
                      <p className="text-slate-600 text-xs">Candidato ainda não agendou o exame admissional.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
