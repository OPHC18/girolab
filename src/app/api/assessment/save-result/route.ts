import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const {
    session_token,
    persona_id,
    instrument_id,
    puntuacion_bruta,
    resultado_json,
    screening_positivo,
    severidad_label,
    tags_menters,
  } = await req.json()

  if (!session_token || !instrument_id || !resultado_json) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, menter_id')
    .eq('session_token', session_token)
    .single()

  if (!session?.id) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      session_id:         session.id,
      persona_id:         persona_id || null,
      menter_id:          session.menter_id || null,
      instrument_id,
      puntuacion_bruta:   puntuacion_bruta ?? null,
      resultado_json,
      screening_positivo: screening_positivo ?? null,
      severidad_label:    severidad_label ?? null,
      tags_menters:       tags_menters || [],
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[save-result] DB error:', error)
    return NextResponse.json({ error: 'Error al guardar resultado' }, { status: 500 })
  }

  return NextResponse.json({ result_id: data.id })
}
