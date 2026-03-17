import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import UsersManager from '@/components/admin/UsersManager'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const { user, isSuperAdmin } = await requireAuth('admin')
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <PageHeader
          title="Usuários"
          description={
            isSuperAdmin
              ? 'Gerencie todos os usuários do sistema — crie, edite e controle permissões.'
              : 'Visualize os usuários cadastrados no sistema.'
          }
          breadcrumb="Administração"
        />
      </div>
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards', animationDelay: '80ms' }}>
        <UsersManager
          initialUsers={users ?? []}
          isSuperAdmin={isSuperAdmin}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
