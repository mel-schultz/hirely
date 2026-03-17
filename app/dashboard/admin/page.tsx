import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminCandidates from '@/components/admin/AdminCandidates'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: candidates } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'candidate')
    .order('created_at', { ascending: false })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Painel Admin</h1>
        <p className="text-slate-400">Acompanhe o status de admissão de todos os candidatos.</p>
      </div>
      <AdminCandidates
        candidates={candidates ?? []}
        appointments={appointments ?? []}
        documents={documents ?? []}
      />
    </div>
  )
}
