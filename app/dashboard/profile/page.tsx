import { requireAuth } from '@/lib/auth'
import { PageHeader } from '@/components/ui'
import ProfileForm from '@/components/forms/ProfileForm'
import { Crown, Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const { user, profile, isAdmin, isSuperAdmin } = await requireAuth()

  const roleIcon = isSuperAdmin ? Crown : isAdmin ? Shield : User
  const RoleIcon = roleIcon
  const roleColor = isSuperAdmin
    ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    : isAdmin
    ? 'text-brand-400 bg-brand-500/10 border-brand-500/20'
    : 'text-slate-400 bg-slate-700/50 border-slate-600/50'

  const role = profile?.role ?? 'candidate'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <PageHeader
          title="Meu Perfil"
          description="Gerencie suas informações pessoais e de contato."
          breadcrumb="Configurações"
        />
      </div>

      {/* Role card */}
      <div className="opacity-0 animate-fade-up glass-card p-5"
        style={{ animationFillMode: 'forwards', animationDelay: '60ms' }}>
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display border',
            roleColor
          )}>
            {profile?.full_name?.split(' ').filter(Boolean).slice(0, 2)
              .map((n: string) => n[0]).join('').toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{profile?.full_name}</p>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-0.5 mt-1.5', roleColor)}>
              <RoleIcon size={11} />
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        {/* Permissions summary */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Permissões</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Ver próprio perfil', ok: true },
              { label: 'Agendar exame', ok: !isAdmin },
              { label: 'Enviar documentos', ok: !isAdmin },
              { label: 'Ver candidatos', ok: isAdmin },
              { label: 'Gerenciar usuários', ok: isSuperAdmin },
              { label: 'Criar/excluir usuários', ok: isSuperAdmin },
            ].map(({ label, ok }) => (
              <span key={label} className={cn(
                'text-xs border rounded-full px-2.5 py-0.5',
                ok
                  ? 'text-brand-400 bg-brand-500/10 border-brand-500/20'
                  : 'text-slate-600 bg-slate-800/50 border-slate-700/50 line-through'
              )}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards', animationDelay: '120ms' }}>
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </div>
  )
}
