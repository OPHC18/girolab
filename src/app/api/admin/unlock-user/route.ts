import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const rateMap = new Map<string, { count: number; reset: number }>()
function checkAdminRate(id: string) {
  const now = Date.now(); const e = rateMap.get(id)
  if (!e || now > e.reset) { rateMap.set(id, { count: 1, reset: now + 60_000 }); return true }
  if (e.count >= 60) return false; e.count++; return true
}

export async function POST(req: NextRequest) {
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
  if (!checkAdminRate(user.id)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { userId } = await req.json()
  if (!userId || !UUID_RE.test(userId)) return NextResponse.json({ error: 'userId inválido' }, { status: 400 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Confirm email in auth + update user_profiles to remove suspendido
  const [authResult, profileResult] = await Promise.all([
    admin.auth.admin.updateUserById(userId, { email_confirm: true }),
    admin.from('user_profiles').update({ suspendido: false }).eq('user_id', userId),
  ])

  if (authResult.error) {
    return NextResponse.json({ error: authResult.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
