import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

// Helper: create server client for auth check
async function getSessionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any)) } catch {}
        },
      },
    }
  )
}

// Helper: admin client (bypasses RLS)
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Verify requester is admin or super_admin
async function verifyAdmin() {
  const supabase = await getSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null
  return { user, profile }
}

// Verify requester is super_admin
async function verifySuperAdmin() {
  const session = await verifyAdmin()
  if (!session) return null
  if (session.profile.role !== 'super_admin' && session.user.email !== SUPER_ADMIN_EMAIL) return null
  return session
}

// GET /api/users — list all users
export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: profiles })
}

// POST /api/users — create new user
export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin()
  if (!session) return NextResponse.json({ error: 'Apenas super admins podem criar usuários' }, { status: 403 })

  const { full_name, email, password, role, phone, cpf } = await req.json()

  if (!full_name || !email || !password) {
    return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Upsert profile (trigger may have already created it)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      user_id: authData.user.id,
      full_name,
      email,
      role: role || 'candidate',
      phone: phone || null,
      cpf: cpf || null,
      onboarding_step: role === 'candidate' ? 'schedule' : 'complete',
    }, { onConflict: 'user_id' })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// PATCH /api/users — update user
export async function PATCH(req: NextRequest) {
  const session = await verifySuperAdmin()
  if (!session) return NextResponse.json({ error: 'Apenas super admins podem editar usuários' }, { status: 403 })

  const { user_id, full_name, role, phone, cpf, birth_date, rg } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })

  // Prevent demoting the super admin
  const admin = getAdminClient()
  const { data: target } = await admin.from('profiles').select('email').eq('user_id', user_id).single()
  if (target?.email === SUPER_ADMIN_EMAIL && role !== 'super_admin') {
    return NextResponse.json({ error: 'Não é possível alterar o papel do super admin' }, { status: 403 })
  }

  const { error } = await admin
    .from('profiles')
    .update({ full_name, role, phone, cpf, birth_date, rg, updated_at: new Date().toISOString() })
    .eq('user_id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/users — delete user
export async function DELETE(req: NextRequest) {
  const session = await verifySuperAdmin()
  if (!session) return NextResponse.json({ error: 'Apenas super admins podem excluir usuários' }, { status: 403 })

  const { user_id } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })

  const admin = getAdminClient()

  // Prevent deleting super admin
  const { data: target } = await admin.from('profiles').select('email').eq('user_id', user_id).single()
  if (target?.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não é possível excluir o super admin' }, { status: 403 })
  }

  // Delete auth user (cascades to profiles via FK)
  const { error } = await admin.auth.admin.deleteUser(user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
