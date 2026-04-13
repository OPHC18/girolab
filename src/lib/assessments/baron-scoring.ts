// src/lib/assessments/baron-scoring.ts
// Engine de scoring completo para el BarOn ICE
// Ugarriza (2001) — Baremos Lima Metropolitana, muestra adulta mixta

import { BARON_SUBSCALE_MAP, BARON_INVERSOS, BARON_PARES_INCONSISTENCIA } from './items/baron'
import type { Responses } from './instruments'

// ── Nombres ──────────────────────────────────────────────────────────────────
export const BARON_NOMBRE_SUBESCALA: Record<string, string> = {
  CM: 'Autoconciencia Emocional',
  AS: 'Asertividad',
  AC: 'Autoconcepto',
  AR: 'Autorrealización',
  IN: 'Independencia',
  EM: 'Empatía',
  RS: 'Responsabilidad Social',
  RI: 'Relaciones Interpersonales',
  PR: 'Prueba de Realidad',
  FL: 'Flexibilidad',
  SP: 'Solución de Problemas',
  TE: 'Tolerancia al Estrés',
  CI: 'Control de Impulsos',
  FE: 'Felicidad',
  OP: 'Optimismo',
}

export const BARON_NOMBRE_COMPONENTE: Record<string, string> = {
  IA: 'Intrapersonal',
  IE: 'Interpersonal',
  AE: 'Adaptabilidad',
  ME: 'Manejo del Estrés',
  AG: 'Ánimo General',
}

export const BARON_SUBESCALAS_DE_COMPONENTE: Record<string, string[]> = {
  IA: ['CM', 'AS', 'AC', 'AR', 'IN'],
  IE: ['EM', 'RS', 'RI'],
  AE: ['PR', 'FL', 'SP'],
  ME: ['TE', 'CI'],
  AG: ['FE', 'OP'],
}

// ── Baremos Lima Metropolitana — adultos mixtos (Ugarriza, 2001) ─────────────
// Media y desviación estándar de PD por subescala y componente
// Fórmula: PE = ((PD − media) / ds) × 15 + 100  →  redondeado, entre 55-145
const BAREMOS: Record<string, { media: number; ds: number }> = {
  // Subescalas
  CM:  { media: 30.8, ds: 5.4  },
  AS:  { media: 29.4, ds: 6.1  },
  AC:  { media: 48.2, ds: 8.3  },
  AR:  { media: 38.6, ds: 6.2  },
  IN:  { media: 28.6, ds: 5.4  },
  EM:  { media: 31.2, ds: 5.2  },
  RS:  { media: 31.5, ds: 5.1  },
  RI:  { media: 38.4, ds: 6.3  },
  PR:  { media: 38.6, ds: 6.4  },
  FL:  { media: 26.4, ds: 4.7  },
  SP:  { media: 25.8, ds: 5.3  },
  TE:  { media: 29.7, ds: 6.8  },
  CI:  { media: 28.5, ds: 6.5  },
  FE:  { media: 39.4, ds: 6.2  },
  OP:  { media: 30.1, ds: 5.8  },
  // Componentes
  IA:  { media: 175.6, ds: 24.8 },
  IE:  { media: 101.1, ds: 13.6 },
  AE:  { media: 90.8,  ds: 13.4 },
  ME:  { media: 58.2,  ds: 11.6 },
  AG:  { media: 69.5,  ds: 10.4 },
  // CE Total (suma de todos los ítems directos, no de componentes)
  CE:  { media: 495.2, ds: 55.0 },
}

// ── Corrección de ítem ────────────────────────────────────────────────────────
function corregirItem(numero: number, valor: number): number {
  return BARON_INVERSOS.has(numero) ? (6 - valor) : valor
}

// ── PD por subescala ──────────────────────────────────────────────────────────
function calcularPD(subescala: keyof typeof BARON_SUBSCALE_MAP, responses: Responses): number {
  const items = BARON_SUBSCALE_MAP[subescala] as readonly number[]
  return items.reduce((sum, num) => {
    const val = responses[num]
    return val ? sum + corregirItem(num, val) : sum
  }, 0)
}

// ── PD → PE ───────────────────────────────────────────────────────────────────
export function pdToPe(pd: number, clave: string): number {
  const baremo = BAREMOS[clave]
  if (!baremo || baremo.ds === 0) return 100
  const pe = ((pd - baremo.media) / baremo.ds) * 15 + 100
  return Math.round(Math.min(145, Math.max(55, pe)))
}

// ── Semáforo ──────────────────────────────────────────────────────────────────
export type SemaforoColor = 'verde' | 'amarillo' | 'rojo'

export interface Semaforo {
  color:       SemaforoColor
  hex:         string
  label:       string
  descripcion: string
}

export function semaforo(pe: number): Semaforo {
  if (pe > 110) return {
    color: 'verde', hex: '#16a34a',
    label: 'Capacidad Muy Desarrollada',
    descripcion: 'Por encima del promedio poblacional. Fortaleza emocional destacada.',
  }
  if (pe >= 90) return {
    color: 'amarillo', hex: '#d97706',
    label: 'Capacidad Adecuada',
    descripcion: 'Dentro del rango promedio. Funciona bien en condiciones normales.',
  }
  return {
    color: 'rojo', hex: '#dc2626',
    label: 'Área de Oportunidad',
    descripcion: 'Por debajo del promedio. Requiere desarrollo activo con acompañamiento.',
  }
}

// ── Tipos de resultado ────────────────────────────────────────────────────────
export interface BarOnSubescalaResult {
  clave:       string
  nombre:      string
  componente:  string
  pd:          number
  pe:          number
  semaforo:    Semaforo
}

export interface BarOnComponenteResult {
  clave:      string
  nombre:     string
  pd:         number
  pe:         number
  semaforo:   Semaforo
  subescalas: BarOnSubescalaResult[]
}

export interface BarOnAlertas {
  omision:        boolean   // > 10 ítems sin respuesta
  inconsistencia: boolean   // ≥ 9 pares inconsistentes
  ipElevado:      boolean   // Impresión Positiva excesiva (> 28)
}

export interface BarOnResult {
  // Compatibilidad con AssessmentResult existente
  instrumentId:      string
  puntuacionBruta:   number          // CE Total PD
  severidadLabel:    string          // etiqueta del semáforo CE
  tagsMenters:       string[]
  interpretacion:    string
  dimensiones:       { dimension: string; score: number; label: string }[]
  // BarOn-específico
  ceTotal:           number          // CE Total PE (0-145)
  semaforoCE:        Semaforo
  componentes:       BarOnComponenteResult[]
  subescalas:        BarOnSubescalaResult[]
  alertas:           BarOnAlertas
  valido:            boolean
  omitidos:          number
  scoreInconsistencia: number
  scoreIP:           number
}

// ── SCORER PRINCIPAL ──────────────────────────────────────────────────────────
export function scoreBarOn(responses: Responses): BarOnResult {

  // 1. Validez
  const respondidos       = Object.values(responses).filter(v => v > 0).length
  const omitidos          = 133 - respondidos
  const IP_ITEMS          = BARON_SUBSCALE_MAP.IP as readonly number[]
  const scoreIP           = IP_ITEMS.reduce((s, i) => s + (responses[i] ?? 3), 0)
  const scoreInconsistencia = BARON_PARES_INCONSISTENCIA.reduce((n, [a, b]) => {
    const diff = Math.abs((responses[a] ?? 3) - (responses[b] ?? 3))
    return n + (diff >= 3 ? 1 : 0)
  }, 0)
  const alertas: BarOnAlertas = {
    omision:        omitidos > 10,
    inconsistencia: scoreInconsistencia >= 9,
    ipElevado:      scoreIP > 28,
  }
  const valido = !alertas.omision && !alertas.inconsistencia

  // 2. PD por subescala
  const subescalaKeys = Object.keys(BARON_SUBSCALE_MAP).filter(k => k !== 'IP') as
    (keyof typeof BARON_SUBSCALE_MAP)[]

  const subescalas: BarOnSubescalaResult[] = subescalaKeys.map(clave => {
    const pd = calcularPD(clave, responses)
    const pe = pdToPe(pd, clave)
    const componenteKey = Object.entries(BARON_SUBESCALAS_DE_COMPONENTE)
      .find(([, subs]) => subs.includes(clave))?.[0] ?? ''
    return {
      clave,
      nombre:     BARON_NOMBRE_SUBESCALA[clave] ?? clave,
      componente: componenteKey,
      pd,
      pe,
      semaforo:   semaforo(pe),
    }
  })

  // 3. PD por componente (suma de PD de sus subescalas)
  const componentes: BarOnComponenteResult[] = Object.entries(BARON_SUBESCALAS_DE_COMPONENTE)
    .map(([compKey, subs]) => {
      const suesDelComp = subescalas.filter(s => subs.includes(s.clave))
      const pd  = suesDelComp.reduce((s, sub) => s + sub.pd, 0)
      const pe  = pdToPe(pd, compKey)
      return {
        clave:      compKey,
        nombre:     BARON_NOMBRE_COMPONENTE[compKey] ?? compKey,
        pd,
        pe,
        semaforo:   semaforo(pe),
        subescalas: suesDelComp,
      }
    })

  // 4. CE Total — PD = suma directa de TODOS los ítems corregidos (133)
  const pdCE = Object.entries(responses).reduce((sum, [num, val]) => {
    return val > 0 ? sum + corregirItem(Number(num), val) : sum
  }, 0)
  const peTotal  = pdToPe(pdCE, 'CE')
  const semaforoCE = semaforo(peTotal)

  // 5. Dimensiones en formato compatible con AssessmentResult
  const dimensiones = componentes.map(c => ({
    dimension: c.nombre,
    score:     c.pe,
    label:     c.semaforo.label,
  }))

  return {
    instrumentId:    'BARON_ICE',
    puntuacionBruta: pdCE,
    severidadLabel:  semaforoCE.label,
    tagsMenters:     ['inteligencia_emocional', 'bienestar', 'coaching', 'desarrollo_personal'],
    interpretacion:  `CE Total: ${peTotal} — ${semaforoCE.label}`,
    dimensiones,
    ceTotal:         peTotal,
    semaforoCE,
    componentes,
    subescalas,
    alertas,
    valido,
    omitidos,
    scoreInconsistencia,
    scoreIP,
  }
}
