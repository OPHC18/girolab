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

  const [
    { data: { users }, error },
    { data: profiles },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('user_profiles').select('user_id, respuestas'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build lookup from user_profiles.respuestas as fallback
  const profilesMap: Record<string, any> = {}
  ;(profiles || []).forEach((p: any) => {
    if (p.respuestas) profilesMap[p.user_id] = p.respuestas
  })

  const result = users.map(u => {
    const fromMeta = u.user_metadata?.respuestas
    const fromProfile = profilesMap[u.id]
    // Merge both sources — some fields may live in one but not the other
    const merged = (fromMeta || fromProfile)
      ? { ...(fromProfile || {}), ...(fromMeta || {}) }
      : null
    return { id: u.id, respuestas: merged, email: u.email }
  })

  return NextResponse.json({ users: result }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
