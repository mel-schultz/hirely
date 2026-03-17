'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, FileText, User, LogOut,
  Menu, X, ShieldCheck, ChevronRight, Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  profile: any
  user: any
}

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/schedule', label: 'Agendamento', icon: Calendar },
  { href: '/dashboard/documents', label: 'Documentos', icon: FileText },
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
]

export default function DashboardShell({ children, profile, user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Até logo!')
    router.push('/')
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isSuperAdmin = profile?.role === 'super_admin' || user?.email === 'mel.schultz@yahoo.com'

  const allNavItems = [
    ...navItems,
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Candidatos', icon: ShieldCheck }] : []),
    ...(isAdmin ? [{ href: '/dashboard/users', label: 'Usuários', icon: Users }] : []),
  ]

  const initials = profile?.full_name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?'

  function Sidebar({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">H</span>
            </div>
            <span className="font-display text-xl font-bold text-white">hirely</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors lg:hidden">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {allNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  active
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={18} className={active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-brand-500" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-slate-800 pt-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-brand-500/3 rounded-full blur-3xl" />
        <div className="noise-bg absolute inset-0" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/80 backdrop-blur-sm border-r border-slate-800 fixed top-0 left-0 bottom-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 w-64 h-full bg-slate-900 border-r border-slate-800">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64 flex-1 relative z-10">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">H</span>
            </div>
            <span className="font-display text-lg font-bold text-white">hirely</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Page content */}
        <main className="p-6 md:p-8 max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
