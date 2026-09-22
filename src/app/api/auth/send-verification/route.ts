import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Aceptar tanto Bearer token como cookies
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  let user: any = null

  if (token) {
    const { data } = await admin.auth.getUser(token)
    user = data.user
  }

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: existing } = await admin
    .from('email_verifications')
    .select('verified, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

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
  if (upsertError) return NextResponse.json({ error: 'No se pudo guardar el código.' }, { status: 500 })

  const nombre = user.user_metadata?.nombre || user.email!.split('@')[0]

  const { emailVerificacionCodigo } = await import('@/lib/email/templates/auth')
  const emailResult = await emailVerificacionCodigo({ email: user.email!, nombre, code })
  if (!emailResult.ok) {
    console.error('[send-verification] Brevo error:', emailResult.error)
    return NextResponse.json({ error: 'No se pudo enviar el código. Intenta de nuevo más tarde.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}