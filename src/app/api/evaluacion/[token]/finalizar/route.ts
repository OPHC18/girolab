// src/app/api/evaluacion/[token]/finalizar/route.ts
// Cierra el recorrido de un participante cuando ya rindió todos los
// instrumentos del link y avisa una sola vez a quien lo generó.
// Idempotente: si ya estaba cerrado, no reenvía nada.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { emailResumenEvaluaciones } from '@/lib/email'
import { nombresInstrumentos } from '@/lib/assessments/catalog'
import { sincronizarProgreso, type EvaluacionLink, type Participante } from '@/lib/assessments/links'

const TOKEN_RE = /^[a-f0-9]{8,64}$/i
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { participante_token: pt } = await req.json()

  if (!TOKEN_RE.test(token) || !pt || !TOKEN_RE.test(pt)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const admin = createSupabaseAdmin()

  const { data: link } = await admin
    .from('assessment_links')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!link) return NextResponse.json({ error: 'Link no encontrado' }, { status: 404 })

  const { data: participante } = await admin
    .from('assessment_link_participants')
    .select('*')
    .eq('participante_token', pt)
    .eq('link_id', link.id)
    .maybeSingle()

  if (!participante) return NextResponse.json({ error: 'Participante no encontrado' }, { status: 404 })
  if (participante.completado_at) return NextResponse.json({ ok: true, ya_notificado: true })

  const progreso = await sincronizarProgreso(
    admin,
    link as EvaluacionLink,
    participante as Participante
  )

  if (progreso.some(p => !p.completado)) {
    return NextResponse.json({ ok: false, pendientes: progreso.filter(p => !p.completado).length })
  }

  // Marcar primero: si el correo falla, no se reintenta en bucle
  await admin
    .from('assessment_link_participants')
    .update({ completado_at: new Date().toISOString() })
    .eq('id', participante.id)

  const { data: { user: owner } } = await admin.auth.admin.getUserById(link.owner_id)
  if (!owner?.email) return NextResponse.json({ ok: true, notificado: false })

  let puestoNombre: string | null = null
  if (link.job_profile_id) {
    const { data: perfil } = await admin
      .from('job_profiles')
      .select('nombre')
      .eq('id', link.job_profile_id)
      .maybeSingle()
    puestoNombre = perfil?.nombre ?? null
  }

  const meta = (owner.user_metadata ?? {}) as Record<string, string>
  const tab  = link.owner_tipo === 'empresa' ? 'instrumentos_empresa' : 'instrumentos'

  await emailResumenEvaluaciones({
    destinatarioEmail:  owner.email,
    destinatarioNombre: meta.nombre || meta.empresa || 'Equipo',
    evaluadoNombre:     participante.nombre || 'Un evaluado',
    evaluadoEmail:      participante.email || '',
    esRegistrado:       participante.persona_id !== null,
    puestoNombre,
    instrumentos:       nombresInstrumentos(link.instrument_ids),
    dashboardUrl:       `${APP_URL}/dashboard?tab=${tab}`,
  })

  return NextResponse.json({ ok: true, notificado: true })
}
