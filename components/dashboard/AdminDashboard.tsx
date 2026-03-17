'use client'

import Link from 'next/link'
import {
  Users, Calendar, FileText, CheckCircle2, Clock,
  AlertCircle, ArrowRight, TrendingUp, Crown, Shield
} from 'lucide-react'
import { cn, formatDateShort, getDocumentLabel } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { ROLE_LABELS } from '@/lib/constants'

interface Props {
  currentProfile: any
  isSuperAdmin: boolean
  candidates: any[]
  appointments: any[]
  documents: any[]
}

export default function AdminDashboard({
  currentProfile, isSuperAdmin, candidates, appointments, documents
}: Props) {
  const firstName = currentProfile?.full_name?.split(' ')[0] || 'Admin'

  // Metrics
  const total = candidates.length
  const complete = candidates.filter(c => {
    const hasAppt = appointments.some(a => a.user_id === c.user_id)
    const hasDocs = documents.some(d => d.user_id === c.user_id)
    return hasAppt && hasDocs
  }).length
  const waitingDocs = candidates.filter(c => {
    const hasAppt = appointments.some(a => a.user_id === c.user_id)
    const hasDocs = documents.some(d => d.user_id === c.user_id)
    return hasAppt && !hasDocs
  }).length
  const notStarted = candidates.filter(c =>
    !appointments.some(a => a.user_id === c.user_id)
  ).length

  // Recent candidates (last 5)
  const recentCandidates = candidates.slice(0, 5)

  // Recent documents (last 5)
  const recentDocuments = documents.slice(0, 5)

  const metrics = [
    { label: 'Total de candidatos', value: total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Concluídos', value: complete, icon: CheckCircle2, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Aguardando docs', value: waitingDocs, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Não iniciados', value: notStarted, icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-700/50' },
  ]

  function getCandidateStatus(candidate: any) {
    const hasAppt = appointments.some(a => a.user_id === candidate.user_id)
    const hasDocs = documents.some(d => d.user_id === candidate.user_id)
    if (hasAppt && hasDocs) return { label: 'Concluído', variant: 'green' as const }
    if (hasAppt) return { label: 'Aguardando docs', variant: 'amber' as const }
    return { label: 'Não iniciado', variant: 'slate' as const }
  }

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-2 mb-1">
          {isSuperAdmin
            ? <Crown size={16} className="text-purple-400" />
            : <Shield size={16} className="text-brand-400" />
          }
          <p className="text-slate-500 text-sm">
            {isSuperAdmin ? 'Super Admin' : 'Administrador'}
          </p>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">
          Olá, {firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Aqui está um resumo do processo de admissão.
        </p>
      </div>

      {/* Metrics */}
      <div
        className="opacity-0 animate-fade-up grid grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ animationFillMode: 'forwards', animationDelay: '80ms' }}
      >
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider leading-tight">{label}</p>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className={cn('font-display text-3xl font-bold', color)}>{value}</p>
            {total > 0 && (
              <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', color.replace('text-', 'bg-').replace('-400', '-500'))}
                  style={{ width: `${Math.round((value / total) * 100)}%`, opacity: 0.6 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div
        className="opacity-0 animate-fade-up grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{ animationFillMode: 'forwards', animationDelay: '160ms' }}
      >
        {/* Recent candidates */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white">Candidatos recentes</h3>
              <p className="text-slate-500 text-xs mt-0.5">Últimos {recentCandidates.length} cadastrados</p>
            </div>
            <Link
              href="/dashboard/admin"
              className="text-brand-400 hover:text-brand-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {recentCandidates.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Nenhum candidato ainda</p>
          ) : (
            <div className="space-y-3">
              {recentCandidates.map(c => {
                const status = getCandidateStatus(c)
                const initials = c.full_name?.split(' ').filter(Boolean).slice(0, 2)
                  .map((n: string) => n[0]).join('').toUpperCase() || '?'
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.full_name}</p>
                      <p className="text-slate-500 text-xs truncate">{c.email}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent documents */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white">Documentos recentes</h3>
              <p className="text-slate-500 text-xs mt-0.5">Últimos {recentDocuments.length} enviados</p>
            </div>
            <Link
              href="/dashboard/admin"
              className="text-brand-400 hover:text-brand-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Nenhum documento enviado ainda</p>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc: any) => {
                const candidate = candidates.find(c => c.user_id === doc.user_id)
                return (
                  <div key={doc.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.file_name}</p>
                      <p className="text-slate-500 text-xs truncate">
                        {candidate?.full_name ?? 'Candidato'} · {getDocumentLabel(doc.type)}
                      </p>
                    </div>
                    <span className="text-slate-600 text-xs flex-shrink-0">
                      {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div
        className="opacity-0 animate-fade-up"
        style={{ animationFillMode: 'forwards', animationDelay: '240ms' }}
      >
        <h2 className="font-semibold text-white mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: '/dashboard/admin',
              icon: Users,
              label: 'Candidatos',
              desc: 'Ver todos os candidatos e status',
              color: 'text-brand-400',
              bg: 'bg-brand-500/10',
            },
            {
              href: '/dashboard/users',
              icon: Shield,
              label: 'Usuários',
              desc: isSuperAdmin ? 'Gerenciar todos os usuários' : 'Ver usuários do sistema',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
            },
            {
              href: '/dashboard/profile',
              icon: Crown,
              label: 'Meu perfil',
              desc: 'Atualizar suas informações',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
          ].map(({ href, icon: Icon, label, desc, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="glass-card-hover p-4 flex items-center gap-4 group"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                <Icon size={18} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-slate-500 text-xs truncate">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
