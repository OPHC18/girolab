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

  // Verificar si ya está verificado o si hay un código reciente (cooldown 2 min)
  const { data: existing, error: existingError } = await admin
    .from('email_verifications')
    .select('verified, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingError) return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  if (existing?.verified) return NextResponse.json({ already_verified: true })

  // Si el usuario ya confirmó su email vía Supabase, marcarlo como verificado automáticamente.
  // Evita la doble verificación: Supabase ya envió su propio email de confirmación.
  if (user.email_confirmed_at) {
    await admin.from('email_verifications').upsert(
      { user_id: user.id, email: user.email!, code: '', verified: true, created_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    return NextResponse.json({ already_verified: true })
  }

  if (existing && Date.now() - new Date(existing.created_at).getTime() < 2 * 60 * 1000) {
    return NextResponse.json({ ok: true, cooldown: true })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  const { error: upsertError } = await admin.from('email_verifications').upsert(
    { user_id: user.id, email: user.email!, code, verified: false, created_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
  if (upsertError) return NextResponse.json({ error: 'No se pudo guardar el código. Contacta soporte.' }, { status: 500 })

  const nombre = user.user_metadata?.nombre || user.email!.split('@')[0]

  const { emailVerificacionCodigo } = await import('@/lib/email/templates/auth')
  const emailResult = await emailVerificacionCodigo({ email: user.email!, nombre, code })
  if (!emailResult.ok) {
    console.error('[send-verification] Brevo error:', emailResult.error)
    return NextResponse.json({ error: 'No se pudo enviar el código. Intenta de nuevo más tarde.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
