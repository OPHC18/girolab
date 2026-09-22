// src/lib/assessments/match.ts
// Compatibilidad entre el resultado de un evaluado y el perfil de puesto que
// definió el Menter o la Empresa.
//
// Las columnas match_* de assessment_results existían pero estaban en NULL en
// todas las filas: el cálculo nunca se llegó a aplicar. Esta es la primera
// implementación, así que el criterio queda documentado acá y en un solo lugar.
//
// Solo DISC y HEXACO tienen objetivo definido en el perfil de puesto. Los demás
// instrumentos se pueden incluir en el link, pero son informativos: no suman ni
// restan al match.

export interface PerfilPuesto {
  disc_d_target: number | null
  disc_i_target: number | null
  disc_s_target: number | null
  disc_c_target: number | null
  disc_d_peso: number | null
  disc_i_peso: number | null
  disc_s_peso: number | null
  disc_c_peso: number | null
  hexaco_minimo: number | null
}

export interface MatchCalculado {
  match_disc: number | null
  match_hexaco: number | null
  match_total: number | null
  match_apto: boolean | null
  match_json: Record<string, unknown> | null
}

/** Umbral a partir del cual se considera que el candidato encaja con el puesto. */
export const UMBRAL_APTO = 65

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/** Trozos del resultado que interesan para el match, sin acoplarse al resto. */
interface ResultadoDISC {
  percentiles?: { adaptado?: { D: number; I: number; S: number; C: number } }
}
interface ResultadoHEXACO {
  scoreTotal?: number
  nivelIntegridad?: string
  recomendacionContratacion?: string
}
export type ResultadoEvaluado = ResultadoDISC & ResultadoHEXACO & Record<string, unknown>

/**
 * DISC: qué tan cerca está cada factor del percentil buscado.
 * Una diferencia de 0 puntos vale 100; una de 100, vale 0. Cada factor pesa
 * lo que el perfil indique (por defecto, todos igual).
 */
function matchDISC(resultado: ResultadoDISC, perfil: PerfilPuesto) {
  // El perfil adaptado es el comportamiento que la persona muestra en el
  // trabajo, que es lo que interesa para un puesto.
  const percentiles = resultado?.percentiles?.adaptado
  if (!percentiles) return null

  const factores = ([
    { k: 'D', obtenido: percentiles.D, target: perfil.disc_d_target, peso: perfil.disc_d_peso },
    { k: 'I', obtenido: percentiles.I, target: perfil.disc_i_target, peso: perfil.disc_i_peso },
    { k: 'S', obtenido: percentiles.S, target: perfil.disc_s_target, peso: perfil.disc_s_peso },
    { k: 'C', obtenido: percentiles.C, target: perfil.disc_c_target, peso: perfil.disc_c_peso },
  ] as const).filter((f): f is typeof f & { obtenido: number; target: number } =>
    typeof f.obtenido === 'number' && typeof f.target === 'number')

  if (factores.length === 0) return null

  let sumaPonderada = 0
  let sumaPesos = 0
  const detalle: Record<string, { obtenido: number; objetivo: number; afinidad: number }> = {}

  for (const f of factores) {
    const afinidad = clamp(100 - Math.abs(f.obtenido - f.target))
    const peso = f.peso ?? 1
    sumaPonderada += afinidad * peso
    sumaPesos += peso
    detalle[f.k] = { obtenido: Math.round(f.obtenido), objetivo: f.target, afinidad }
  }

  return { valor: clamp(sumaPonderada / (sumaPesos || 1)), detalle }
}

/**
 * HEXACO: la integridad es un mínimo, no un objetivo a igualar. Llegar al
 * mínimo ya es 100; por debajo, baja proporcionalmente.
 */
function matchHEXACO(resultado: ResultadoHEXACO, perfil: PerfilPuesto) {
  const total = resultado?.scoreTotal
  const minimo = perfil.hexaco_minimo
  if (typeof total !== 'number' || typeof minimo !== 'number' || minimo <= 0) return null

  const valor = total >= minimo ? 100 : clamp((total / minimo) * 100)
  const critico = resultado?.nivelIntegridad === 'Crítico'

  return {
    valor: critico ? 0 : valor,
    detalle: {
      obtenido: total,
      minimo,
      nivelIntegridad: resultado?.nivelIntegridad ?? null,
      recomendacion:   resultado?.recomendacionContratacion ?? null,
    },
  }
}

/**
 * Calcula el match de un resultado contra el perfil. Devuelve todo en null
 * cuando el instrumento no aporta al match (por ejemplo BDI o Big Five).
 */
export function calcularMatch(
  instrumentId: string,
  resultado: ResultadoEvaluado,
  perfil: PerfilPuesto
): MatchCalculado {
  const vacio: MatchCalculado = {
    match_disc: null, match_hexaco: null, match_total: null, match_apto: null, match_json: null,
  }

  if (instrumentId === 'DISC') {
    const disc = matchDISC(resultado, perfil)
    if (!disc) return vacio
    return {
      match_disc:   disc.valor,
      match_hexaco: null,
      match_total:  disc.valor,
      match_apto:   disc.valor >= UMBRAL_APTO,
      match_json:   { disc: disc.detalle, umbral: UMBRAL_APTO },
    }
  }

  if (instrumentId === 'HEXACO_HH') {
    const hex = matchHEXACO(resultado, perfil)
    if (!hex) return vacio
    // La integridad es descartante: por debajo del mínimo no es apto aunque
    // el resto encaje.
    const cumpleMinimo = hex.detalle.obtenido >= hex.detalle.minimo
    return {
      match_disc:   null,
      match_hexaco: hex.valor,
      match_total:  hex.valor,
      match_apto:   cumpleMinimo && hex.valor >= UMBRAL_APTO,
      match_json:   { hexaco: hex.detalle, umbral: UMBRAL_APTO },
    }
  }

  return vacio
}
