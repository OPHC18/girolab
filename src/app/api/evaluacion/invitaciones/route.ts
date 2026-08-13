// src/app/api/evaluacion/invitaciones/route.ts
// Envía la invitación de un link ya existente a nuevas personas.
// Es lo que usa la pestaña Candidatos: el link se creó junto con el perfil de
// puesto, y acá solo se suma gente a evaluar.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionUser } from '@/lib/admin'
import { resolverOwner, type EvaluacionLink } from '@/lib/assessments/links'
import { invitarParticipantes, normalizarDestinatarios, MAX_DESTINATARIOS } from '@/lib/assessments/invitaciones'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { link_token, destinatarios, enviar_email = true } = await req.json()

  if (!link_token || !/^[a-f0-9]{8,64}$/i.test(String(link_token))) {
    return NextResponse.json({ error: 'Link inválido' }, { status: 400 })
  }

  const invitados = normalizarDestinatarios(destinatarios)
  if (invitados.length === 0) {
    return NextResponse.json({ error: 'Agrega al menos un correo válido' }, { status: 400 })
  }
  if (Array.isArray(destinatarios) && destinatarios.length > MAX_DESTINATARIOS) {
    return NextResponse.json({ error: `Máximo ${MAX_DESTINATARIOS} personas por envío` }, { status: 400 })
  }

  const admin = createSupabaseAdmin()

  const { data: link } = await admin
    .from('assessment_links')
    .select('*')
    .eq('token', link_token)
    .maybeSingle()

  if (!link || link.owner_id !== user.id) {
    return NextResponse.json({ error: 'Link no encontrado' }, { status: 404 })
  }

  let puestoNombre: string | null = null
  if (link.job_profile_id) {
    const { data: perfil } = await admin
      .from('job_profiles')
      .select('nombre')
      .eq('id', link.job_profile_id)
      .maybeSingle()
    puestoNombre = perfil?.nombre ?? null
  }

  const { nombre: ownerNombre } = await resolverOwner(admin, user)

  const emails = await invitarParticipantes(admin, link as EvaluacionLink, invitados, {
    remitenteNombre: ownerNombre,
    puestoNombre,
    enviarEmail: !!enviar_email,
  })

  return NextResponse.json({ ok: true, emails })
}
