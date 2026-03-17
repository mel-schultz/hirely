'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, FileText, User, LogOut,
  Menu, X, Users, ChevronRight, Crown, Shield, UserCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { SUPER_ADMIN_EMAIL, ROLE_LABELS } from '@/lib/constants'

interface Props {
  children: React.ReactNode
  profile: any
  user: any
  isSuperAdmin: boolean
  isAdmin: boolean
}

export default function DashboardShell({ children, profile, user, isSuperAdmin, isAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isCandidate = !isAdmin

  interface NavItemType {
    href: string
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    exact?: boolean
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Até logo!')
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ?.split(' ').filter(Boolean).slice(0, 2)
    .map((n: string) => n[0]).join('').toUpperCase() || '?'

  const role = profile?.role ?? 'candidate'

  // ── Nav sections ─────────────────────────────────────────
  const candidateNav = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/schedule', label: 'Agendamento', icon: Calendar },
    { href: '/dashboard/documents', label: 'Documentos', icon: FileText },
  ]

  const adminNav = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/admin', label: 'Candidatos', icon: UserCheck },
    { href: '/dashboard/users', label: 'Usuários', icon: Users },
  ]

  const commonNav = [
    { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
  ]

  const mainNav = isAdmin ? adminNav : candidateNav
  const allNav = [...mainNav, ...commonNav]

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function NavItem({ href, label, icon: Icon, exact }: NavItemType) {
    const active = isActive(href, exact)
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
          active
            ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
        )}
      >
        <Icon
          size={17}
          className={active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}
        />
        <span className="flex-1">{label}</span>
        {active && <ChevronRight size={13} className="text-brand-500/60" />}
      </Link>
    )
  }

  function Sidebar({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex flex-col h-full">

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-sm font-display">H</span>
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">hirely</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-1">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest">
            {isAdmin ? 'Administração' : 'Minha admissão'}
          </p>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {mainNav.map(item => <NavItem key={item.href} {...item} />)}

          {/* Divider */}
          <div className="pt-3 pb-1 px-2">
            <div className="h-px bg-slate-800/60" />
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mt-3 mb-1 px-1">Conta</p>
          </div>

          {commonNav.map(item => <NavItem key={item.href} {...item} />)}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow',
              isSuperAdmin
                ? 'bg-gradient-to-br from-purple-500 to-purple-800'
                : isAdmin
                ? 'bg-gradient-to-br from-brand-500 to-brand-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-800'
            )}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate leading-tight">
                {profile?.full_name || 'Usuário'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {isSuperAdmin
                  ? <Crown size={10} className="text-purple-400" />
                  : isAdmin
                  ? <Shield size={10} className="text-brand-400" />
                  : <User size={10} className="text-slate-500" />
                }
                <span className={cn(
                  'text-xs font-medium',
                  isSuperAdmin ? 'text-purple-400' : isAdmin ? 'text-brand-400' : 'text-slate-500'
                )}>
                  {ROLE_LABELS[role] ?? 'Candidato'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[600px] h-[400px] bg-brand-500/3 rounded-full blur-3xl" />
        <div className="noise-bg absolute inset-0" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900/90 backdrop-blur-md border-r border-slate-800/80 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-60 h-full bg-slate-900 border-r border-slate-800">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="lg:ml-60 flex-1 relative z-10 flex flex-col min-h-screen">

        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">H</span>
            </div>
            <span className="font-display text-base font-bold text-white">hirely</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              'text-xs font-medium border rounded-full px-2 py-0.5 hidden sm:inline-flex items-center gap-1',
              isSuperAdmin
                ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                : isAdmin
                ? 'text-brand-400 bg-brand-500/10 border-brand-500/20'
                : 'text-slate-500 bg-slate-700/50 border-slate-600/50'
            )}>
              {isSuperAdmin ? <Crown size={9} /> : isAdmin ? <Shield size={9} /> : <User size={9} />}
              {ROLE_LABELS[role] ?? 'Candidato'}
            </span>
            <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
