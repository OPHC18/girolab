// src/app/api/evaluacion/resultados/route.ts
// Resultados de las evaluaciones que envió el usuario, sea Menter o Empresa.
//
// No usa v_empresa_assessment_results porque esa vista filtra por empresa_id,
// y un Menter Master que evalúa candidatos guarda sus sesiones bajo menter_id:
// sus propios resultados le salían vacíos. Acá el criterio es el dueño de la
// sesión, que cubre los dos casos y también el flujo antiguo.

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionUser } from '@/lib/admin'
import { CATALOG } from '@/lib/assessments/catalog'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createSupabaseAdmin()

  const { data: sesiones } = await admin
    .from('assessment_sessions')
    .select('id, candidato_nombre, candidato_email, job_profile_id, persona_id, link_id')
    .or(`menter_id.eq.${user.id},empresa_id.eq.${user.id}`)
    .limit(500)

  if (!sesiones?.length) return NextResponse.json({ resultados: [] })

  const { data: resultados } = await admin
    .from('assessment_results')
    .select('id, session_id, instrument_id, puntuacion_bruta, severidad_label, screening_positivo, resultado_json, match_total, match_disc, match_hexaco, match_apto, match_json, created_at')
    .in('session_id', sesiones.map(s => s.id))
    .order('created_at', { ascending: false })

  if (!resultados?.length) return NextResponse.json({ resultados: [] })

  // Nombre del puesto, para mostrarlo junto al match
  const perfilIds = [...new Set(sesiones.map(s => s.job_profile_id).filter(Boolean))]
  const { data: perfiles } = perfilIds.length
    ? await admin.from('job_profiles').select('id, nombre').in('id', perfilIds)
    : { data: [] as { id: string; nombre: string }[] }

  const perfilPorId = new Map((perfiles ?? []).map(p => [p.id, p.nombre]))
  const sesionPorId = new Map(sesiones.map(s => [s.id, s]))

  return NextResponse.json({
    resultados: resultados.map(r => {
      const s = sesionPorId.get(r.session_id)
      return {
        ...r,
        candidato_nombre:   s?.candidato_nombre ?? null,
        candidato_email:    s?.candidato_email ?? null,
        es_registrado:      !!s?.persona_id,
        job_profile_nombre: s?.job_profile_id ? perfilPorId.get(s.job_profile_id) ?? null : null,
        instrumento_nombre: CATALOG[r.instrument_id]?.nombre ?? r.instrument_id,
      }
    }),
  })
}
