// src/lib/assessments/cobro.ts
// Cobro de créditos por test terminado.
//
// Regla (ver src/lib/creditos.ts): 1 crédito por cada test que una persona
// completa. Nunca bloquea: si el dueño se quedó sin saldo, la evaluación se
// guarda igual y el saldo queda negativo, reflejando la deuda. El aviso va
// por correo, una sola vez por agotamiento.

import type { SupabaseClient } from '@supabase/supabase-js'
import { CREDITOS_POR_TEST_TERMINADO, requiereCreditos } from '@/lib/creditos'
import { emailSinCreditos } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

interface SesionCobrable {
  id: string
  link_id: string | null
  menter_id: string | null
  empresa_id: string | null
  credito_cobrado_at: string | null
}

/**
 * Cobra un crédito por un test recién terminado.
 * No lanza: un fallo de cobro nunca debe impedir que se guarde el resultado
 * de una persona que ya invirtió su tiempo respondiendo.
 */
export async function cobrarTestTerminado(
  admin: SupabaseClient,
  sesion: SesionCobrable
): Promise<void> {
  // Solo cobran las sesiones de un link de evaluación. El tráfico que llega
  // suelto a /test/[instrument] desde un anuncio nunca se cobró.
  if (!sesion.link_id) return

  // Idempotencia: un reintento al guardar no puede cobrar dos veces
  if (sesion.credito_cobrado_at) return

  const ownerId = sesion.empresa_id || sesion.menter_id
  if (!ownerId) return

  try {
    const { data: membership } = await admin
      .from('menter_memberships')
      .select('plan, is_active')
      .eq('menter_id', ownerId)
      .maybeSingle()

    const plan = membership?.is_active ? (membership.plan || 'free') : 'free'
    const ownerTipo = sesion.empresa_id ? 'empresa' : 'menter'

    // Premium y Master no consumen créditos
    if (!requiereCreditos({ ownerTipo, plan })) return

    // Marcar primero: si el cobro falla después, se pierde un crédito, pero
    // nunca se cobra de más. Es el lado seguro del error.
    const { data: marcada } = await admin
      .from('assessment_sessions')
      .update({ credito_cobrado_at: new Date().toISOString() })
      .eq('id', sesion.id)
      .is('credito_cobrado_at', null)
      .select('id')
      .maybeSingle()

    if (!marcada) return // otra ejecución ya lo cobró

    const { data: saldo, error } = await admin.rpc('consumir_credito_test', {
      p_user_id:  ownerId,
      p_cantidad: CREDITOS_POR_TEST_TERMINADO,
    })

    if (error) {
      console.error('[cobro] No se pudo descontar el crédito:', error)
      return
    }

    if (typeof saldo === 'number' && saldo <= 0) {
      await avisarSinCreditos(admin, ownerId, saldo)
    }
  } catch (e) {
    console.error('[cobro] Error inesperado al cobrar el test:', e)
  }
}

/** Avisa por correo que se acabaron los créditos, una sola vez por agotamiento. */
async function avisarSinCreditos(admin: SupabaseClient, ownerId: string, saldo: number) {
  const { data: fila } = await admin
    .from('instrumento_creditos')
    .select('aviso_sin_creditos_at')
    .eq('empresa_id', ownerId)
    .maybeSingle()

  if (fila?.aviso_sin_creditos_at) return // ya se avisó y aún no ha recargado

  const { data: marcado } = await admin
    .from('instrumento_creditos')
    .update({ aviso_sin_creditos_at: new Date().toISOString() })
    .eq('empresa_id', ownerId)
    .is('aviso_sin_creditos_at', null)
    .select('empresa_id')
    .maybeSingle()

  if (!marcado) return

  const { data: { user } } = await admin.auth.admin.getUserById(ownerId)
  if (!user?.email) return

  const meta = (user.user_metadata ?? {}) as Record<string, string>
  const tab  = meta.role === 'empresa' ? 'instrumentos_empresa' : 'instrumentos'

  await emailSinCreditos({
    destinatarioEmail:  user.email,
    destinatarioNombre: meta.nombre || meta.empresa || 'Hola',
    saldo,
    comprarUrl: `${APP_URL}/dashboard?tab=${tab}`,
  })
}
