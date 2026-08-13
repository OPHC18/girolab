import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { session_token, result_id, instrument_name, raw_id } = await req.json()
  
  const supabase = createSupabaseAdmin()
  
  // persona_nombre/persona_email no existen en assessment_sessions: pedirlas
  // hacía fallar el select entero y el Menter nunca recibía el aviso.
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('menter_id, candidato_nombre, candidato_email, link_id')
    .eq('session_token', session_token)
    .single()

  if (!session?.menter_id) return NextResponse.json({ ok: false })

  // En un link multiuso el aviso se manda una sola vez, al terminar todas las
  // evaluaciones (/api/evaluacion/[token]/finalizar), no una por instrumento.
  if (session.link_id) return NextResponse.json({ ok: true, omitido: 'link_multiuso' })

  const { data: menterProfile } = await supabase
    .from('menter_public_profiles')
    .select('nombre')
    .eq('id', session.menter_id)
    .single()

  if (!menterProfile) return NextResponse.json({ ok: false })

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'resultado_test_menter',
      data: {
        menter_id: session.menter_id,
        menterNombre: menterProfile.nombre,
        personaNombre: session.candidato_nombre || 'Un usuario',
        personaEmail: session.candidato_email || '',
        instrumentoNombre: instrument_name,
        resultadoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/test/${raw_id}/resultado?r=${result_id}&t=${session_token}`,
      },
    }),
  })
  
  return NextResponse.json({ ok: true })
}