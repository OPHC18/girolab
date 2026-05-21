import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { session_token } = await req.json()

  // 1. Vincular por session_token (flujo desde botón en resultado)
  if (session_token) {
    const { data: session } = await admin
      .from('assessment_sessions')
      .select('id')
      .eq('session_token', session_token)
      .single()

    if (session?.id) {
      await admin
        .from('assessment_results')
        .update({ persona_id: user.id })
        .eq('session_id', session.id)
        .is('persona_id', null)
    }
  }

  // 2. Vincular por email (flujo donde el usuario se registró por otra ruta)
  if (user.email) {
    const { data: sessions } = await admin
      .from('assessment_sessions')
      .select('id')
      .eq('email', user.email)

    if (sessions?.length) {
      const sessionIds = sessions.map(s => s.id)
      await admin
        .from('assessment_results')
        .update({ persona_id: user.id })
        .in('session_id', sessionIds)
        .is('persona_id', null)
    }
  }

  return NextResponse.json({ ok: true })
}
