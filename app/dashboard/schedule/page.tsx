import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, AccessDenied } from '@/components/ui'
import ScheduleForm from '@/components/forms/ScheduleForm'
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const { user, isAdmin } = await requireAuth()
  const supabase = await createClient()

  // Admins não têm agendamento próprio
  if (isAdmin) return <AccessDenied />

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
        <PageHeader
          title="Agendamento"
          description="Informe os dados da clínica e da data do seu exame admissional."
          breadcrumb="Minha admissão"
        />
      </div>

      {/* Status card when appointment exists */}
      {appointment && (
        <div className="opacity-0 animate-fade-up glass-card p-5 border-brand-500/20 bg-brand-500/5"
          style={{ animationFillMode: 'forwards', animationDelay: '60ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-brand-400" />
            <span className="text-brand-300 text-sm font-semibold">Consulta agendada</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar size={14} className="text-brand-500 flex-shrink-0" />
              {formatDate(appointment.scheduled_date)}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock size={14} className="text-brand-500 flex-shrink-0" />
              {appointment.scheduled_time?.slice(0, 5)}h
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={14} className="text-brand-500 flex-shrink-0" />
              {appointment.clinic_name}
            </div>
          </div>
        </div>
      )}

      <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards', animationDelay: '120ms' }}>
        <ScheduleForm existingAppointment={appointment} userId={user.id} />
      </div>
    </div>
  )
}
