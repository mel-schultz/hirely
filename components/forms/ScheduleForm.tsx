'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Building2, MapPin, Phone, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Props {
  existingAppointment: any
  userId: string
}

// Pre-filled clinic data from the uploaded documents
const SUGGESTED_CLINIC = {
  name: 'BELO HORIZONTE - MG - MEDIAR',
  address: 'Rua dos Carijós 424, 18º andar, sala 1812, Centro, Belo Horizonte - MG, CEP: 30120901',
  phone: '(31) 3271-9454',
  email: 'mediar@clinicamediar.com.br',
  date: '2026-03-16',
  time: '09:00',
}

export default function ScheduleForm({ existingAppointment, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    clinic_name: existingAppointment?.clinic_name ?? '',
    clinic_address: existingAppointment?.clinic_address ?? '',
    clinic_phone: existingAppointment?.clinic_phone ?? '',
    clinic_email: existingAppointment?.clinic_email ?? '',
    scheduled_date: existingAppointment?.scheduled_date ?? '',
    scheduled_time: existingAppointment?.scheduled_time?.slice(0, 5) ?? '',
    notes: existingAppointment?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  function fillSuggested() {
    setForm(prev => ({
      ...prev,
      clinic_name: SUGGESTED_CLINIC.name,
      clinic_address: SUGGESTED_CLINIC.address,
      clinic_phone: SUGGESTED_CLINIC.phone,
      clinic_email: SUGGESTED_CLINIC.email,
      scheduled_date: SUGGESTED_CLINIC.date,
      scheduled_time: SUGGESTED_CLINIC.time,
    }))
    toast.success('Dados da clínica preenchidos automaticamente!')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (existingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', existingAppointment.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert({ ...form, user_id: userId })
        if (error) throw error

        // Update onboarding step
        await supabase
          .from('profiles')
          .update({ onboarding_step: 'documents' })
          .eq('user_id', userId)
      }
      toast.success('Agendamento salvo com sucesso!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar agendamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Suggestion banner */}
      {!existingAppointment && (
        <div className="glass-card p-4 border-brand-500/20 bg-brand-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <CheckCircle2 size={18} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Clínica detectada nos seus documentos</p>
                <p className="text-slate-400 text-xs mt-0.5">Encontramos os dados da Mediar BH na sua Guia de Encaminhamento</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillSuggested}
              className="text-brand-400 hover:text-brand-300 text-sm font-semibold border border-brand-500/30 hover:border-brand-500/50 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              Preencher automaticamente
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="label-text flex items-center gap-2">
            <Building2 size={14} className="text-slate-500" />
            Nome da Clínica
          </label>
          <input className="input-field" placeholder="Ex: Clínica Mediar BH" value={form.clinic_name} onChange={update('clinic_name')} required />
        </div>

        <div>
          <label className="label-text flex items-center gap-2">
            <MapPin size={14} className="text-slate-500" />
            Endereço Completo
          </label>
          <input className="input-field" placeholder="Rua, número, bairro, cidade" value={form.clinic_address} onChange={update('clinic_address')} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text flex items-center gap-2">
              <Phone size={14} className="text-slate-500" />
              Telefone da Clínica
            </label>
            <input className="input-field" placeholder="(00) 0000-0000" value={form.clinic_phone} onChange={update('clinic_phone')} />
          </div>
          <div>
            <label className="label-text flex items-center gap-2">
              <Mail size={14} className="text-slate-500" />
              E-mail da Clínica
            </label>
            <input type="email" className="input-field" placeholder="clinica@email.com" value={form.clinic_email} onChange={update('clinic_email')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text flex items-center gap-2">
              <Calendar size={14} className="text-slate-500" />
              Data do Exame
            </label>
            <input type="date" className="input-field" value={form.scheduled_date} onChange={update('scheduled_date')} required />
          </div>
          <div>
            <label className="label-text flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              Horário
            </label>
            <input type="time" className="input-field" value={form.scheduled_time} onChange={update('scheduled_time')} required />
          </div>
        </div>

        <div>
          <label className="label-text">Observações (opcional)</label>
          <textarea
            className="input-field resize-none h-24"
            placeholder="Informações adicionais sobre o agendamento..."
            value={form.notes}
            onChange={update('notes')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Salvando...</>
          ) : (
            <><Save size={18} /> {existingAppointment ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}</>
          )}
        </button>
      </form>
    </div>
  )
}
