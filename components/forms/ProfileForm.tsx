'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: any
  userId: string
}

export default function ProfileForm({ profile, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    cpf: profile?.cpf ?? '',
    rg: profile?.rg ?? '',
    birth_date: profile?.birth_date ?? '',
  })
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (error) throw error
      toast.success('Perfil atualizado!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const initials = form.full_name
    ?.split(' ').filter(Boolean).slice(0, 2)
    .map((n: string) => n[0]).join('').toUpperCase() || '?'

  return (
    <div className="glass-card p-6">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div>
          <p className="text-white font-semibold">{form.full_name || 'Seu nome'}</p>
          <p className="text-slate-500 text-sm">{profile?.email}</p>
          <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-2 py-0.5 mt-1 inline-block">
            {profile?.role === 'admin' ? 'Administrador' : 'Candidato'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">Nome completo</label>
          <input className="input-field" value={form.full_name} onChange={update('full_name')} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">CPF</label>
            <input className="input-field" placeholder="000.000.000-00" value={form.cpf} onChange={update('cpf')} />
          </div>
          <div>
            <label className="label-text">RG</label>
            <input className="input-field" placeholder="00.000.000-0" value={form.rg} onChange={update('rg')} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Telefone</label>
            <input className="input-field" placeholder="(00) 00000-0000" value={form.phone} onChange={update('phone')} />
          </div>
          <div>
            <label className="label-text">Data de Nascimento</label>
            <input type="date" className="input-field" value={form.birth_date} onChange={update('birth_date')} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar alterações</>}
        </button>
      </form>
    </div>
  )
}
