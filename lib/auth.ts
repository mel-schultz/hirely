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

  // Always get fresh user from Supabase Auth (validates JWT server-side)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/auth/login')

  // Force fresh profile read — no cache
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // isSuperAdmin: check both DB role AND email as fallback
  const isSuperAdmin = profile?.role === 'super_admin' || user.email === SUPER_ADMIN_EMAIL
  const isAdmin = isSuperAdmin || profile?.role === 'admin'
  const isCandidate = !isAdmin

  // If user is super_admin by email but DB still shows wrong role, patch it
  if (user.email === SUPER_ADMIN_EMAIL && profile?.role !== 'super_admin') {
    await supabase
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('user_id', user.id)
  }

  if (minLevel === 'super_admin' && !isSuperAdmin) redirect('/dashboard')
  if (minLevel === 'admin' && !isAdmin) redirect('/dashboard')

  return { user, profile, isSuperAdmin, isAdmin, isCandidate }
}
