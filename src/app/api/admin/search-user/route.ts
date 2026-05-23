import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ADMIN_EMAILS } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email || email.length < 3 || email.length > 200) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  // Search in auth.users via admin API — filter server-side, max 25 results
  const { data: { users }, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const found = users.filter(u => u.email?.toLowerCase().includes(email)).slice(0, 25)

  const result = found.map(u => ({
    id: u.id,
    email: u.email,
    nombre: u.user_metadata?.nombre || '',
    apellidos: u.user_metadata?.apellidos || '',
    role: u.user_metadata?.role || 'persona',
    created_at: u.created_at,
    confirmed: !!u.confirmed_at,
    last_sign_in: u.last_sign_in_at,
  }))

  return NextResponse.json({ users: result })
}
