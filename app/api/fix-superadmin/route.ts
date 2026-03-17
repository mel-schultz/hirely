import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Uses service role key — bypasses RLS completely
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Step 1: Fix constraint
  const { error: constraintError } = await admin.rpc('fix_super_admin_constraint')

  // Step 2: Update role directly
  const { data, error } = await admin
    .from('profiles')
    .update({ role: 'super_admin', updated_at: new Date().toISOString() })
    .eq('email', SUPER_ADMIN_EMAIL)
    .select('email, role, updated_at')

  if (error) {
    // Constraint might be blocking — try raw approach
    const { data: data2, error: error2 } = await admin
      .from('profiles')
      .select('email, role')
      .eq('email', SUPER_ADMIN_EMAIL)
      .single()

    return NextResponse.json({
      message: 'Update falhou — veja o erro abaixo',
      currentState: data2,
      error: error.message,
      hint: 'Execute o SQL de migration no Supabase SQL Editor',
    }, { status: 500 })
  }

  return NextResponse.json({
    message: '✅ Super admin promovido com sucesso!',
    result: data,
  })
}
