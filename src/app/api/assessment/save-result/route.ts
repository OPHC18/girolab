// src/app/api/assessment/save-result/route.ts
// Punto único donde se cierra una evaluación: guarda el resultado, calcula el
// match contra el perfil de puesto si lo hay, y cobra el crédito del test.
// Es idempotente: un reintento devuelve el resultado ya guardado sin duplicar
// filas ni volver a cobrar.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { calcularMatch } from '@/lib/assessments/match'
import { cobrarTestTerminado } from '@/lib/assessments/cobro'

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
    .select('id, menter_id, empresa_id, job_profile_id, link_id, credito_cobrado_at')
    .eq('session_token', session_token)
    .single()

  if (!session?.id) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  // Idempotencia: si la sesión ya tiene resultado, se devuelve ese
  const { data: yaGuardado } = await supabase
    .from('assessment_results')
    .select('id')
    .eq('session_id', session.id)
    .maybeSingle()

  if (yaGuardado?.id) {
    return NextResponse.json({ result_id: yaGuardado.id, repetido: true })
  }

  // Match contra el perfil de puesto (solo DISC y HEXACO tienen objetivo)
  let match = {
    match_disc: null as number | null,
    match_hexaco: null as number | null,
    match_total: null as number | null,
    match_apto: null as boolean | null,
    match_json: null as Record<string, unknown> | null,
  }

  if (session.job_profile_id) {
    const { data: perfil } = await supabase
      .from('job_profiles')
      .select('disc_d_target, disc_i_target, disc_s_target, disc_c_target, disc_d_peso, disc_i_peso, disc_s_peso, disc_c_peso, hexaco_minimo')
      .eq('id', session.job_profile_id)
      .maybeSingle()

    if (perfil) match = calcularMatch(instrument_id, resultado_json, perfil)
  }

  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      session_id:         session.id,
      persona_id:         persona_id || null,
      menter_id:          session.menter_id || null,
      empresa_id:         session.empresa_id || null,
      job_profile_id:     session.job_profile_id || null,
      instrument_id,
      puntuacion_bruta:   puntuacion_bruta ?? null,
      resultado_json,
      screening_positivo: screening_positivo ?? null,
      severidad_label:    severidad_label ?? null,
      tags_menters:       tags_menters || [],
      ...match,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[save-result] DB error:', error)
    return NextResponse.json({ error: 'Error al guardar resultado' }, { status: 500 })
  }

  await supabase
    .from('assessment_sessions')
    .update({ estado: 'completado', completed_at: new Date().toISOString() })
    .eq('id', session.id)

  // El cobro va al final y nunca lanza: la persona ya respondió, su resultado
  // no puede perderse por un problema de créditos.
  await cobrarTestTerminado(supabase, session)

  return NextResponse.json({ result_id: data.id })
}
