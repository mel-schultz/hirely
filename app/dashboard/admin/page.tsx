import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/ui'
import AdminCandidates from '@/components/admin/AdminCandidates'

export const dynamic = 'force-dynamic'

export default async function CandidatesPage() {
  const { isSuperAdmin } = await requireAuth('admin')
  const admin = createAdminClient()

  const [{ data: candidates }, { data: appointments }, { data: documents }] = await Promise.all([
    admin.from('profiles').select('*').eq('role', 'candidate').order('created_at', { ascending: false }),
    admin.from('appointments').select('*').order('created_at', { ascending: false }),
    admin.from('documents').select('*').order('uploaded_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <PageHeader
          title="Candidatos"
          description="Acompanhe o status de admissão de todos os candidatos cadastrados."
          breadcrumb="Administração"
        />
      </div>
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards', animationDelay: '80ms' }}>
        <AdminCandidates
          candidates={candidates ?? []}
          appointments={appointments ?? []}
          documents={documents ?? []}
        />
      </div>
    </div>
  )
}
