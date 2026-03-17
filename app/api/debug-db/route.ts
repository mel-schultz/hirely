import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Test 1: Can we read our profile?
  const { data: profile, error: readError } = await supabase
    .from('profiles')
    .select('id, user_id, email, role, full_name')
    .eq('user_id', user.id)
    .single()

  // Test 2: Can we write to our profile?
  const { data: writeResult, error: writeError } = await supabase
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select('updated_at')
    .single()

  // Test 3: Can we insert into appointments?
  const { error: appointmentError } = await supabase
    .from('appointments')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  // Test 4: Can we insert into documents?
  const { error: documentError } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    tests: {
      read_profile: readError ? { error: readError.message, code: readError.code } : { ok: true, role: profile?.role },
      write_profile: writeError ? { error: writeError.message, code: writeError.code } : { ok: true },
      read_appointments: appointmentError ? { error: appointmentError.message, code: appointmentError.code } : { ok: true },
      read_documents: documentError ? { error: documentError.message, code: documentError.code } : { ok: true },
    },
  })
}
