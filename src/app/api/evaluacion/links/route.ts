// src/app/api/evaluacion/links/route.ts
// Crea un link de evaluación multiuso y, opcionalmente, lo envía por correo
// a las personas a evaluar.
//
// Generar el link es gratis: se cobra 1 crédito por cada test que una persona
// termina (ver src/lib/assessments/cobro.ts).

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionUser } from '@/lib/admin'
import { crearLinkDeEvaluacion, validarDatosLink } from '@/lib/assessments/crear-link'
import { normalizarDestinatarios } from '@/lib/assessments/invitaciones'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const error = validarDatosLink(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const admin = createSupabaseAdmin()

  try {
    const { link, url, emails } = await crearLinkDeEvaluacion(admin, user, {
      instrumentos:   [...new Set((body.instrument_ids as string[]).map(String))],
      titulo:         body.titulo,
      mensaje:        body.mensaje,
      jobProfileId:   body.job_profile_id || null,
      contexto:       body.contexto,
      maxUsos:        body.max_usos ?? null,
      expiresAt:      body.expires_at || null,
      destinatarios:  normalizarDestinatarios(body.destinatarios),
      enviarEmail:    !!body.enviar_email,
    })

    return NextResponse.json({
      ok: true,
      link: {
        id:             link.id,
        token:          link.token,
        url,
        instrument_ids: link.instrument_ids,
        titulo:         link.titulo,
        created_at:     link.created_at,
        activo:         link.activo,
        max_usos:       link.max_usos,
        expires_at:     link.expires_at,
      },
      emails,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'No se pudo crear el link'
    const status = msg === 'PERFIL_NO_ENCONTRADO' ? 404 : 500
    console.error('[evaluacion/links]', e)
    return NextResponse.json(
      { error: status === 404 ? 'Perfil de puesto no encontrado' : 'No se pudo crear el link' },
      { status }
    )
  }
}
