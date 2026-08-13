// src/lib/assessments/crear-link.ts
// Alta de un link de evaluación. Vive aparte de la API route porque la
// creación de un perfil de puesto también genera su link, y no tiene sentido
// que ese flujo duplique validación, alta e invitaciones.

import type { SupabaseClient, User } from '@supabase/supabase-js'
import { isInstrumentId } from './catalog'
import { generarToken, resolverOwner, urlLink, type EvaluacionLink } from './links'
import {
  invitarParticipantes,
  MAX_DESTINATARIOS,
  type Destinatario,
  type ResultadoInvitacion,
} from './invitaciones'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const MAX_INSTRUMENTOS = 10

export interface DatosLink {
  instrumentos: string[]
  titulo?: string | null
  mensaje?: string | null
  jobProfileId?: string | null
  contexto?: string | null
  maxUsos?: number | null
  expiresAt?: string | null
  destinatarios?: Destinatario[]
  enviarEmail?: boolean
}

/** Valida el cuerpo de la petición. Devuelve el mensaje de error o null. */
export function validarDatosLink(body: Record<string, unknown>): string | null {
  const ids = body.instrument_ids
  if (!Array.isArray(ids) || ids.length === 0) return 'Selecciona al menos un instrumento'
  if (ids.length > MAX_INSTRUMENTOS) return `Máximo ${MAX_INSTRUMENTOS} instrumentos por link`

  const invalido = ids.map(String).find(id => !isInstrumentId(id))
  if (invalido) return `Instrumento desconocido: ${invalido}`

  if (body.job_profile_id && !UUID_RE.test(String(body.job_profile_id))) return 'Perfil de puesto inválido'
  if (body.titulo && String(body.titulo).length > 120) return 'Título demasiado largo'
  if (body.mensaje && String(body.mensaje).length > 500) return 'Mensaje demasiado largo'

  const max = body.max_usos
  if (max != null && (!Number.isInteger(max) || (max as number) < 1 || (max as number) > 10_000)) {
    return 'El cupo debe ser un entero entre 1 y 10000'
  }
  if (body.expires_at && Number.isNaN(Date.parse(String(body.expires_at)))) return 'Fecha de expiración inválida'
  if (Array.isArray(body.destinatarios) && body.destinatarios.length > MAX_DESTINATARIOS) {
    return `Máximo ${MAX_DESTINATARIOS} destinatarios por envío`
  }
  return null
}

export async function crearLinkDeEvaluacion(
  admin: SupabaseClient,
  user: User,
  datos: DatosLink
): Promise<{ link: EvaluacionLink & { created_at: string }; url: string; emails: ResultadoInvitacion }> {
  const { ownerTipo, nombre: ownerNombre } = await resolverOwner(admin, user)

  // El perfil de puesto tiene que ser del propio usuario
  let puestoNombre: string | null = null
  if (datos.jobProfileId) {
    const { data: perfil } = await admin
      .from('job_profiles')
      .select('id, nombre, empresa_id, menter_id')
      .eq('id', datos.jobProfileId)
      .maybeSingle()

    if (!perfil || (perfil.empresa_id !== user.id && perfil.menter_id !== user.id)) {
      throw new Error('PERFIL_NO_ENCONTRADO')
    }
    puestoNombre = perfil.nombre
  }

  const { data: link, error } = await admin
    .from('assessment_links')
    .insert({
      token:          generarToken(),
      owner_id:       user.id,
      owner_tipo:     ownerTipo,
      instrument_ids: datos.instrumentos,
      titulo:         String(datos.titulo || '').trim() || null,
      mensaje:        String(datos.mensaje || '').trim() || null,
      job_profile_id: datos.jobProfileId || null,
      contexto:       datos.contexto || (ownerTipo === 'empresa' ? 'seleccion_talento' : 'bienestar'),
      max_usos:       datos.maxUsos ?? null,
      expires_at:     datos.expiresAt || null,
    })
    .select('*')
    .single()

  if (error || !link) throw new Error(error?.message || 'No se pudo crear el link')

  const emails = await invitarParticipantes(admin, link as EvaluacionLink, datos.destinatarios ?? [], {
    remitenteNombre: ownerNombre,
    puestoNombre,
    enviarEmail: !!datos.enviarEmail,
  })

  return { link, url: urlLink(link.token), emails }
}
