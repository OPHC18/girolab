// src/lib/assessments/links.ts
// Lógica server-side de los links de evaluación multiuso.
// Un link es una plantilla: guarda qué instrumentos hay que rendir y quién
// lo creó. Cada persona que entra genera su propio participante y sus propias
// sesiones, así que los registros quedan independientes entre sí.

import { randomBytes } from 'crypto'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { CATALOG } from './catalog'

export type OwnerTipo = 'menter' | 'empresa'

export interface EvaluacionLink {
  id: string
  token: string
  owner_id: string
  owner_tipo: OwnerTipo
  instrument_ids: string[]
  titulo: string | null
  mensaje: string | null
  job_profile_id: string | null
  contexto: string | null
  max_usos: number | null
  expires_at: string | null
  activo: boolean
}

export interface Participante {
  id: string
  link_id: string
  participante_token: string
  persona_id: string | null
  nombre: string | null
  email: string | null
  invitado: boolean
  iniciado_at: string | null
  completado_at: string | null
}

/** Estado de un instrumento dentro del recorrido de un participante. */
export interface PasoProgreso {
  instrument_id: string
  nombre: string
  session_token: string
  completado: boolean
  result_id: string | null
}

export type EstadoLink = 'activo' | 'inactivo' | 'expirado' | 'cupo_lleno'

export function generarToken(bytes = 12): string {
  return randomBytes(bytes).toString('hex')
}

/** Perfil de quien genera el link: define si consume créditos y qué nombre se muestra. */
export async function resolverOwner(
  admin: SupabaseClient,
  user: User
): Promise<{ ownerTipo: OwnerTipo; plan: string; nombre: string }> {
  const meta = (user.user_metadata ?? {}) as Record<string, string>
  const ownerTipo: OwnerTipo = meta.role === 'empresa' ? 'empresa' : 'menter'

  const { data: membership } = await admin
    .from('menter_memberships')
    .select('plan, is_active')
    .eq('menter_id', user.id)
    .maybeSingle()

  const plan = membership?.is_active ? (membership.plan || 'free') : 'free'

  const nombre =
    (ownerTipo === 'empresa' ? meta.empresa : '') ||
    [meta.nombre, meta.apellidos].filter(Boolean).join(' ').trim() ||
    'Giro Lab'

  return { ownerTipo, plan, nombre }
}

/** Vigencia del link, contando cuántas personas ya lo usaron. */
export function estadoLink(link: EvaluacionLink, usos: number): EstadoLink {
  if (!link.activo) return 'inactivo'
  if (link.expires_at && new Date(link.expires_at) < new Date()) return 'expirado'
  if (link.max_usos !== null && usos >= link.max_usos) return 'cupo_lleno'
  return 'activo'
}

/**
 * Crea las sesiones que le falten al participante (una por instrumento del
 * link) y devuelve su progreso en el orden en que debe rendirlas.
 * Es idempotente: reanudar no duplica sesiones ni pierde lo ya respondido.
 */
export async function sincronizarProgreso(
  admin: SupabaseClient,
  link: EvaluacionLink,
  participante: Participante,
  metadata: Record<string, unknown> = {}
): Promise<PasoProgreso[]> {
  const { data: sesiones } = await admin
    .from('assessment_sessions')
    .select('id, instrument_id, session_token')
    .eq('participante_id', participante.id)

  const existentes = new Map((sesiones ?? []).map(s => [s.instrument_id, s]))

  const faltantes = link.instrument_ids
    .filter(id => !existentes.has(id))
    .map(id => ({
      instrument_id:   id,
      session_token:   generarToken(20),
      menter_id:       link.owner_tipo === 'menter'  ? link.owner_id : null,
      empresa_id:      link.owner_tipo === 'empresa' ? link.owner_id : null,
      persona_id:      participante.persona_id,
      candidato_nombre: participante.nombre,
      candidato_email:  participante.email,
      job_profile_id:  link.job_profile_id,
      contexto:        link.contexto,
      estado:          'pendiente',
      // assessment_sessions.fuente tiene un CHECK que solo admite
      // 'menter_share' y 'landing'. Lo que identifica a una sesión de link es
      // link_id, no la fuente, así que se usa el valor válido de siempre.
      fuente:          'menter_share',
      link_id:         link.id,
      participante_id: participante.id,
      metadata,
    }))

  if (faltantes.length > 0) {
    const { data: creadas, error } = await admin
      .from('assessment_sessions')
      .insert(faltantes)
      .select('id, instrument_id, session_token')

    if (error) throw new Error(`No se pudieron crear las sesiones: ${error.message}`)
    for (const s of creadas ?? []) existentes.set(s.instrument_id, s)
  }

  // Un instrumento cuenta como rendido cuando ya tiene resultado guardado
  const ids = [...existentes.values()].map(s => s.id)
  const { data: resultados } = ids.length
    ? await admin.from('assessment_results').select('id, session_id').in('session_id', ids)
    : { data: [] as { id: string; session_id: string }[] }

  const resultadoPorSesion = new Map((resultados ?? []).map(r => [r.session_id, r.id]))

  return link.instrument_ids.map(id => {
    const sesion   = existentes.get(id)!
    const resultId = resultadoPorSesion.get(sesion.id) ?? null
    return {
      instrument_id: id,
      nombre:        CATALOG[id]?.nombre ?? id,
      session_token: sesion.session_token,
      completado:    resultId !== null,
      result_id:     resultId,
    }
  })
}

/** Primer instrumento pendiente, o null si ya rindió todo. */
export function siguientePaso(progreso: PasoProgreso[]): PasoProgreso | null {
  return progreso.find(p => !p.completado) ?? null
}

/** URL pública del link. */
export function urlLink(token: string, participanteToken?: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
  return participanteToken
    ? `${base}/e/${token}?p=${participanteToken}`
    : `${base}/e/${token}`
}
