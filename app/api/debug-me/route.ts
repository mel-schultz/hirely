import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado', authError })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, email, role, onboarding_step, updated_at')
    .eq('user_id', user.id)
    .single()

  const isSuperAdminByEmail = user.email === SUPER_ADMIN_EMAIL
  const isSuperAdminByRole = profile?.role === 'super_admin'
  const isAdminByRole = profile?.role === 'admin'

  return NextResponse.json({
    auth: {
      id: user.id,
      email: user.email,
    },
    profile,
    profileError,
    computed: {
      isSuperAdminByEmail,
      isSuperAdminByRole,
      isAdminByRole,
      finalIsSuperAdmin: isSuperAdminByEmail || isSuperAdminByRole,
      finalIsAdmin: isSuperAdminByEmail || isSuperAdminByRole || isAdminByRole,
    },
    superAdminEmailConfigured: SUPER_ADMIN_EMAIL,
  })
}
