import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCallerUser() {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  return user
}

// GET — admin: list all staff / asesor: check own role
export async function GET(req: NextRequest) {
  const user = await getCallerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const isAdmin = ADMIN_EMAILS.includes(user.email!)

  if (isAdmin) {
    const { data } = await admin.from('staff_roles').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ staff: data || [] })
  }

  // Check if the caller is staff
  const { data } = await admin.from('staff_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (data) return NextResponse.json({ role: data.role })
  return NextResponse.json({ role: null }, { status: 403 })
}

// POST — admin only: add asesor by email
export async function POST(req: NextRequest) {
  const user = await getCallerUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { email, nombre } = await req.json()
  if (!email) return NextResponse.json({ error: 'Falta email' }, { status: 400 })

  // Find user by email in auth
  const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const target = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
  if (!target) return NextResponse.json({ error: 'No existe una cuenta con ese correo' }, { status: 404 })
  if (ADMIN_EMAILS.includes(target.email!)) return NextResponse.json({ error: 'Ese correo ya es administrador' }, { status: 400 })

  const { error } = await admin.from('staff_roles').upsert({
    user_id: target.id,
    email: target.email,
    nombre: nombre || target.user_metadata?.nombre || '',
    role: 'asesor',
  }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — admin only: remove staff member
export async function DELETE(req: NextRequest) {
  const user = await getCallerUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { user_id } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'Falta user_id' }, { status: 400 })

  await admin.from('staff_roles').delete().eq('user_id', user_id)
  return NextResponse.json({ ok: true })
}
