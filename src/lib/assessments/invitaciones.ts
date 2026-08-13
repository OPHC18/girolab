// src/lib/assessments/invitaciones.ts
// Alta de participantes invitados por correo. Lo usan tanto la creación de un
// link como el envío posterior desde la pestaña Candidatos.

import type { SupabaseClient } from '@supabase/supabase-js'
import { emailInvitacionEvaluacion } from '@/lib/email'
import { nombresInstrumentos, tiempoTotalMinutos } from './catalog'
import { generarToken, urlLink, type EvaluacionLink } from './links'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MAX_DESTINATARIOS = 50

export interface Destinatario { nombre?: string; email: string }

export interface ResultadoInvitacion {
  enviados: string[]
  fallidos: string[]
  yaInvitados: string[]
}

/** Normaliza y descarta correos inválidos, recortando al máximo permitido. */
export function normalizarDestinatarios(lista: unknown): Destinatario[] {
  if (!Array.isArray(lista)) return []
  const vistos = new Set<string>()
  const out: Destinatario[] = []

  for (const d of lista) {
    const email = String(d?.email || '').trim().toLowerCase()
    if (!EMAIL_RE.test(email) || email.length > 200 || vistos.has(email)) continue
    vistos.add(email)
    out.push({ nombre: String(d?.nombre || '').trim().slice(0, 120) || undefined, email })
    if (out.length >= MAX_DESTINATARIOS) break
  }
  return out
}

/**
 * Registra a cada invitado como participante del link y le manda el correo.
 * A quien ya estaba invitado no se le duplica la fila: se reenvía su enlace,
 * que conserva el avance que tuviera.
 */
export async function invitarParticipantes(
  admin: SupabaseClient,
  link: EvaluacionLink,
  destinatarios: Destinatario[],
  opts: { remitenteNombre: string; puestoNombre?: string | null; enviarEmail: boolean }
): Promise<ResultadoInvitacion> {
  const resultado: ResultadoInvitacion = { enviados: [], fallidos: [], yaInvitados: [] }
  if (destinatarios.length === 0) return resultado

  const { data: existentes } = await admin
    .from('assessment_link_participants')
    .select('participante_token, nombre, email')
    .eq('link_id', link.id)
    .in('email', destinatarios.map(d => d.email))

  const porEmail = new Map((existentes ?? []).map(p => [String(p.email).toLowerCase(), p]))

  const nuevos = destinatarios.filter(d => !porEmail.has(d.email))
  if (nuevos.length > 0) {
    const { data: creados } = await admin
      .from('assessment_link_participants')
      .insert(nuevos.map(d => ({
        link_id:            link.id,
        participante_token: generarToken(16),
        nombre:             d.nombre ?? null,
        email:              d.email,
        invitado:           true,
        invitado_at:        new Date().toISOString(),
      })))
      .select('participante_token, nombre, email')

    for (const p of creados ?? []) porEmail.set(String(p.email).toLowerCase(), p)
  }

  for (const d of destinatarios) {
    if (!nuevos.includes(d)) resultado.yaInvitados.push(d.email)
  }

  if (!opts.enviarEmail) return resultado

  const nombres = nombresInstrumentos(link.instrument_ids)
  const minutos = tiempoTotalMinutos(link.instrument_ids)

  const envios = await Promise.allSettled(
    destinatarios.map(d => {
      const p = porEmail.get(d.email)
      if (!p) return Promise.resolve({ ok: false })
      return emailInvitacionEvaluacion({
        email:              d.email,
        nombre:             d.nombre ?? p.nombre,
        remitenteNombre:    opts.remitenteNombre,
        titulo:             link.titulo,
        mensaje:            link.mensaje,
        puestoNombre:       opts.puestoNombre ?? null,
        instrumentos:       nombres,
        tiempoTotalMinutos: minutos,
        url:                urlLink(link.token, p.participante_token),
      })
    })
  )

  envios.forEach((r, i) => {
    const email = destinatarios[i].email
    if (r.status === 'fulfilled' && (r.value as { ok: boolean }).ok) resultado.enviados.push(email)
    else resultado.fallidos.push(email)
  })

  return resultado
}
