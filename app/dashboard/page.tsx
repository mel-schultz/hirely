import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import CandidateDashboard from '@/components/dashboard/CandidateDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { user, profile, isAdmin, isSuperAdmin } = await requireAuth()
  const supabase = await createClient()

  if (isAdmin) {
    const [{ data: candidates }, { data: appointments }, { data: documents }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'candidate').order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').order('uploaded_at', { ascending: false }),
    ])
    return (
      <AdminDashboard
        currentProfile={profile}
        isSuperAdmin={isSuperAdmin}
        candidates={candidates ?? []}
        appointments={appointments ?? []}
        documents={documents ?? []}
      />
    )
  }

  const [{ data: appointment }, { data: documents }] = await Promise.all([
    supabase.from('appointments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
  ])

  return (
    <CandidateDashboard
      profile={profile}
      appointment={appointment}
      documents={documents ?? []}
    />
  )
}
