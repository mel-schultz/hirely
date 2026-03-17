import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScheduleForm from '@/components/forms/ScheduleForm'

export default async function SchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Agendar Consulta</h1>
        <p className="text-slate-400">
          Informe os dados da clínica de medicina do trabalho onde você realizará seu exame admissional.
        </p>
      </div>

      <div className="opacity-0 animate-fade-up animate-delay-100" style={{ animationFillMode: 'forwards' }}>
        <ScheduleForm existingAppointment={appointment} userId={user.id} />
      </div>
    </div>
  )
}
