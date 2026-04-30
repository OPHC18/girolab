import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

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

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')       // 'persona' | 'empresa' | null (todos)
  const ids  = searchParams.get('ids')        // IDs separados por coma

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const VALID_ROLES = ['persona', 'empresa', 'menter']

  let query = admin.from('user_public_data').select('*').order('created_at', { ascending: false }).limit(500)

  if (role) {
    if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
    query = query.eq('role', role)
  }
  if (ids) {
    const parsed = ids.split(',').map(s => s.trim()).filter(id => UUID_RE.test(id))
    if (!parsed.length) return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 })
    query = query.in('id', parsed)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ users: data || [] }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
