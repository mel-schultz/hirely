import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentsSection from '@/components/DocumentsSection'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Documentos</h1>
        <p className="text-slate-400">
          Envie os documentos preenchidos após realizar seus exames admissionais.
        </p>
      </div>

      <div className="opacity-0 animate-fade-up animate-delay-100" style={{ animationFillMode: 'forwards' }}>
        <DocumentsSection documents={documents ?? []} userId={user.id} />
      </div>
    </div>
  )
}
