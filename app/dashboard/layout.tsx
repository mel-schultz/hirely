import { requireAuth } from '@/lib/auth'
import DashboardShell from '@/components/layout/DashboardShell'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Force headers read so Next.js never serves this from cache
  await headers()

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
