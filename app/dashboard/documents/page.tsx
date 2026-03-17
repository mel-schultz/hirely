import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, AccessDenied } from '@/components/ui'
import DocumentsSection from '@/components/DocumentsSection'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const { user, isAdmin } = await requireAuth()
  const supabase = await createClient()

  if (isAdmin) return <AccessDenied />

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <PageHeader
          title="Documentos"
          description="Envie os documentos preenchidos após realizar seu exame admissional."
          breadcrumb="Minha admissão"
        />
      </div>
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards', animationDelay: '80ms' }}>
        <DocumentsSection documents={documents ?? []} userId={user.id} />
      </div>
    </div>
  )
}
