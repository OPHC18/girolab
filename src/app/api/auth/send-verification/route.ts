import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar si ya está verificado
  const { data: existing } = await admin
    .from('email_verifications')
    .select('verified')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing?.verified) return NextResponse.json({ already_verified: true })

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  await admin.from('email_verifications').upsert(
    { user_id: user.id, email: user.email!, code, verified: false, created_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )

  const nombre = user.user_metadata?.nombre || user.email!.split('@')[0]
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

  await fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    body: JSON.stringify({
      tipo: 'verificacion_codigo',
      data: { nombre, email: user.email!, code },
    }),
  })

  return NextResponse.json({ ok: true })
}
