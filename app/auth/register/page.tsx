'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  function formatCPF(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  }

  function formatPhone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    if (form.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName },
        },
      })
      if (error) throw error

      // Update additional profile fields
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          phone: form.phone,
          cpf: form.cpf,
        }).eq('user_id', user.id)
      }

      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        toast.error('Este e-mail já está cadastrado')
      } else {
        toast.error(err.message || 'Erro ao criar conta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Criar conta</h1>
        <p className="text-slate-400">Comece sua jornada de admissão agora</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="label-text">Nome completo</label>
            <input
              type="text"
              className="input-field"
              placeholder="Seu nome completo"
              value={form.fullName}
              onChange={update('fullName')}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">CPF</label>
              <input
                type="text"
                className="input-field"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={e => setForm(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
              />
            </div>
            <div>
              <label className="label-text">Telefone</label>
              <input
                type="text"
                className="input-field"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="label-text">E-mail</label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={form.email}
              onChange={update('email')}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label-text">Senha</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={update('password')}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label-text">Confirmar senha</label>
            <input
              type={showPw ? 'text' : 'password'}
              className="input-field"
              placeholder="Repita sua senha"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Criando conta...</>
            ) : (
              <><UserPlus size={18} /> Criar minha conta</>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
