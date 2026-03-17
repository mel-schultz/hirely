'use client'

import { useState } from 'react'
import {
  Search, UserPlus, Edit2, Trash2, Loader2, X, Save,
  Shield, ShieldCheck, User, Eye, EyeOff, ChevronDown,
  AlertTriangle, CheckCircle2, Crown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, ROLE_COLORS, ONBOARDING_STEP_LABELS, SUPER_ADMIN_EMAIL } from '@/lib/constants'

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  cpf?: string
  rg?: string
  phone?: string
  birth_date?: string
  role: string
  onboarding_step: string
  created_at: string
}

interface Props {
  initialUsers: UserProfile[]
  isSuperAdmin: boolean
  currentUserId: string
}

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: 'candidate',
  phone: '',
  cpf: '',
}

const EMPTY_EDIT = {
  full_name: '',
  role: 'candidate',
  phone: '',
  cpf: '',
  rg: '',
  birth_date: '',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5',
      ROLE_COLORS[role] ?? ROLE_COLORS.candidate
    )}>
      {role === 'super_admin' && <Crown size={10} />}
      {role === 'admin' && <Shield size={10} />}
      {role === 'candidate' && <User size={10} />}
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function StepBadge({ step }: { step: string }) {
  const isDone = step === 'complete'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5',
      isDone
        ? 'text-brand-400 bg-brand-500/10 border-brand-500/20'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    )}>
      {isDone ? <CheckCircle2 size={10} /> : <Loader2 size={10} />}
      {ONBOARDING_STEP_LABELS[step] ?? step}
    </span>
  )
}

export default function UsersManager({ initialUsers, isSuperAdmin, currentUserId }: Props) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })
  const [showPw, setShowPw] = useState(false)
  const [creating, setCreating] = useState(false)

  // Edit modal
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT })
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function refreshUsers() {
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
  }

  // ── CREATE ──────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (createForm.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Usuário criado com sucesso!')
      setShowCreate(false)
      setCreateForm({ ...EMPTY_FORM })
      await refreshUsers()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar usuário')
    } finally {
      setCreating(false)
    }
  }

  // ── EDIT ─────────────────────────────────────────────────
  function openEdit(user: UserProfile) {
    setEditUser(user)
    setEditForm({
      full_name: user.full_name ?? '',
      role: user.role ?? 'candidate',
      phone: user.phone ?? '',
      cpf: user.cpf ?? '',
      rg: user.rg ?? '',
      birth_date: user.birth_date ?? '',
    })
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: editUser.user_id, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Usuário atualizado!')
      setEditUser(null)
      await refreshUsers()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // ── DELETE ────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteUser) return
    setDeleting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: deleteUser.user_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Usuário excluído')
      setDeleteUser(null)
      await refreshUsers()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

  // ── FILTER ───────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.cpf?.includes(search)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const stats = {
    total: users.length,
    superAdmin: users.filter(u => u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    candidate: users.filter(u => u.role === 'candidate').length,
    complete: users.filter(u => u.onboarding_step === 'complete').length,
  }

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Super Admins', value: stats.superAdmin, color: 'text-purple-400' },
          { label: 'Admins', value: stats.admin, color: 'text-brand-400' },
          { label: 'Candidatos', value: stats.candidate, color: 'text-slate-300' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={cn('font-display text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-9"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            className="input-field pr-8 appearance-none cursor-pointer"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos os perfis</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="candidate">Candidato</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus size={16} />
            Novo usuário
          </button>
        )}
      </div>

      {/* Users table */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <User size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Contato</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Perfil</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Cadastro</th>
                  {isSuperAdmin && (
                    <th className="px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider text-right">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(user => {
                  const isCurrentUser = user.user_id === currentUserId
                  const isSuperAdminUser = user.email === SUPER_ADMIN_EMAIL || user.role === 'super_admin'
                  const initials = user.full_name
                    ?.split(' ').filter(Boolean).slice(0, 2)
                    .map((n: string) => n[0]).join('').toUpperCase() || '?'

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        'transition-colors hover:bg-slate-800/30',
                        isCurrentUser && 'bg-brand-500/5'
                      )}
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                            isSuperAdminUser
                              ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                              : user.role === 'admin'
                              ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
                              : 'bg-slate-700 text-slate-300'
                          )}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-white font-medium truncate max-w-[140px]">
                                {user.full_name}
                              </p>
                              {isCurrentUser && (
                                <span className="text-xs text-brand-500 font-medium">(você)</span>
                              )}
                            </div>
                            <p className="text-slate-500 text-xs truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-slate-400 text-xs space-y-0.5">
                          {user.cpf && <p>CPF: {user.cpf}</p>}
                          {user.phone && <p>{user.phone}</p>}
                          {!user.cpf && !user.phone && <p className="text-slate-600">—</p>}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Onboarding */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {user.role === 'candidate'
                          ? <StepBadge step={user.onboarding_step} />
                          : <span className="text-slate-600 text-xs">—</span>
                        }
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-slate-500 text-xs">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>

                      {/* Actions */}
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(user)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            {!isSuperAdminUser && (
                              <button
                                onClick={() => setDeleteUser(user)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ──────────────────────────────── */}
      {showCreate && (
        <Modal title="Novo Usuário" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label-text">Nome completo *</label>
              <input
                className="input-field"
                placeholder="Nome completo"
                value={createForm.full_name}
                onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-text">E-mail *</label>
              <input
                type="email"
                className="input-field"
                placeholder="email@exemplo.com"
                value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-text">Senha *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Mínimo 6 caracteres"
                  value={createForm.password}
                  onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">CPF</label>
                <input
                  className="input-field"
                  placeholder="000.000.000-00"
                  value={createForm.cpf}
                  onChange={e => setCreateForm(p => ({ ...p, cpf: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-text">Telefone</label>
                <input
                  className="input-field"
                  placeholder="(00) 00000-0000"
                  value={createForm.phone}
                  onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label-text">Perfil</label>
              <div className="relative">
                <select
                  className="input-field appearance-none cursor-pointer pr-8"
                  value={createForm.role}
                  onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="candidate">Candidato</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {creating ? <><Loader2 size={15} className="animate-spin" />Criando...</> : <><UserPlus size={15} />Criar usuário</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── EDIT MODAL ────────────────────────────────── */}
      {editUser && (
        <Modal title={`Editar: ${editUser.full_name}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="label-text">Nome completo</label>
              <input
                className="input-field"
                value={editForm.full_name}
                onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">CPF</label>
                <input
                  className="input-field"
                  placeholder="000.000.000-00"
                  value={editForm.cpf}
                  onChange={e => setEditForm(p => ({ ...p, cpf: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-text">RG</label>
                <input
                  className="input-field"
                  placeholder="00.000.000-0"
                  value={editForm.rg}
                  onChange={e => setEditForm(p => ({ ...p, rg: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Telefone</label>
                <input
                  className="input-field"
                  placeholder="(00) 00000-0000"
                  value={editForm.phone}
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-text">Nascimento</label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.birth_date}
                  onChange={e => setEditForm(p => ({ ...p, birth_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label-text">Perfil</label>
              <div className="relative">
                <select
                  className="input-field appearance-none cursor-pointer pr-8"
                  value={editForm.role}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                  disabled={editUser.email === SUPER_ADMIN_EMAIL}
                >
                  <option value="candidate">Candidato</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              {editUser.email === SUPER_ADMIN_EMAIL && (
                <p className="text-xs text-slate-600 mt-1">O perfil do super admin não pode ser alterado.</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : <><Save size={15} />Salvar</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DELETE CONFIRM MODAL ─────────────────────── */}
      {deleteUser && (
        <Modal title="Confirmar exclusão" onClose={() => setDeleteUser(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">Esta ação é irreversível</p>
                <p className="text-slate-400 text-xs mt-1">
                  O usuário <strong className="text-white">{deleteUser.full_name}</strong> ({deleteUser.email}) será excluído permanentemente, incluindo todos os seus dados, agendamentos e documentos.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUser(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting
                  ? <><Loader2 size={15} className="animate-spin" />Excluindo...</>
                  : <><Trash2 size={15} />Excluir definitivamente</>
                }
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Reusable Modal ────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
