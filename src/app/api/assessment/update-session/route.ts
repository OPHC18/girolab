import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { token, nombre, email } = await req.json()

  if (!token || (!nombre && !email)) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      ...(nombre ? { persona_nombre: nombre } : {}),
      ...(email  ? { persona_email:  email  } : {}),
    })
    .eq('session_token', token)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
