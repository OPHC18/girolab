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

  const { code } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: 'Falta el código' }, { status: 400 })

  const { data: row } = await admin
    .from('email_verifications')
    .select('code, verified, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row) return NextResponse.json({ error: 'No hay código pendiente' }, { status: 400 })
  if (row.verified) return NextResponse.json({ ok: true, already_verified: true })

  // Expirar después de 30 minutos
  const age = Date.now() - new Date(row.created_at).getTime()
  if (age > 30 * 60 * 1000) return NextResponse.json({ error: 'El código expiró. Solicita uno nuevo.' }, { status: 400 })

  if (row.code !== code.trim()) return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })

  await admin.from('email_verifications').update({ verified: true }).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
