import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

export type AccessLevel = 'candidate' | 'admin' | 'super_admin'

interface AuthResult {
  user: any
  profile: any
  isSuperAdmin: boolean
  isAdmin: boolean
  isCandidate: boolean
}

/**
 * Server-side access guard.
 * Call at the top of any page/layout that requires authentication.
 * Redirects to login if unauthenticated, or to /dashboard if unauthorized.
 */
export async function requireAuth(minLevel?: AccessLevel): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin' || user.email === SUPER_ADMIN_EMAIL
  const isAdmin = isSuperAdmin || profile?.role === 'admin'
  const isCandidate = !isAdmin

  if (minLevel === 'super_admin' && !isSuperAdmin) redirect('/dashboard')
  if (minLevel === 'admin' && !isAdmin) redirect('/dashboard')

  return { user, profile, isSuperAdmin, isAdmin, isCandidate }
}
