import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingTimeline from '@/components/OnboardingTimeline'
import StatsRow from '@/components/StatsRow'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: appointment }, { data: documents }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('appointments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <p className="text-slate-400 text-sm mb-1">Bem-vindo,</p>
        <h1 className="font-display text-3xl font-bold text-white">
          {profile?.full_name?.split(' ')[0] || 'Candidato'} 👋
        </h1>
      </div>

      {/* Stats */}
      <div className="opacity-0 animate-fade-up animate-delay-100" style={{ animationFillMode: 'forwards' }}>
        <StatsRow
          appointment={appointment}
          documentsCount={documents?.length ?? 0}
          step={profile?.onboarding_step ?? 'schedule'}
        />
      </div>

      {/* Timeline */}
      <div className="opacity-0 animate-fade-up animate-delay-200" style={{ animationFillMode: 'forwards' }}>
        <OnboardingTimeline
          profile={profile}
          appointment={appointment}
          documents={documents ?? []}
        />
      </div>
    </div>
  )
}
