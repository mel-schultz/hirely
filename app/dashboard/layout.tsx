import { requireAuth } from '@/lib/auth'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isSuperAdmin, isAdmin } = await requireAuth()
  return (
    <DashboardShell
      profile={profile}
      user={user}
      isSuperAdmin={isSuperAdmin}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  )
}
