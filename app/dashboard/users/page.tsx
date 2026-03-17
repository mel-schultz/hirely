import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'
import UsersManager from '@/components/admin/UsersManager'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('user_id', user.id)
    .single()

  // Only admin or super_admin can access
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const isSuperAdmin = profile.role === 'super_admin' || user.email === SUPER_ADMIN_EMAIL

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Gerenciar Usuários
        </h1>
        <p className="text-slate-400">
          {isSuperAdmin
            ? 'Crie, edite e exclua usuários do sistema.'
            : 'Visualize os usuários cadastrados no sistema.'}
        </p>
      </div>

      <div className="opacity-0 animate-fade-up animate-delay-100" style={{ animationFillMode: 'forwards' }}>
        <UsersManager
          initialUsers={users ?? []}
          isSuperAdmin={isSuperAdmin}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
