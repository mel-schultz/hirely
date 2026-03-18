import { createClient } from '@supabase/supabase-js'

/**
 * Admin client — bypasses RLS completely.
 * Use ONLY in Server Components / API routes, never in client components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
