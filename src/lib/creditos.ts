// src/lib/creditos.ts
// Packs de créditos y regla de cobro. Fuente única: la usan el modal de
// compra (Menter y Empresa), la orden de PayPal y la creación de links.

export interface CreditPack {
  id: string;
  creditos: number;
  precio: number;
  label: string;
  ahorro: string | null;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'pack_1',  creditos: 1,  precio: 5,  label: '1 evaluación',   ahorro: null },
  { id: 'pack_5',  creditos: 5,  precio: 20, label: '5 evaluaciones',  ahorro: 'Ahorra $5' },
  { id: 'pack_10', creditos: 10, precio: 35, label: '10 evaluaciones', ahorro: 'Ahorra $15' },
  { id: 'pack_20', creditos: 20, precio: 60, label: '20 evaluaciones', ahorro: 'Ahorra $40' },
];

export const CREDIT_PACKS_BY_ID: Record<string, CreditPack> =
  Object.fromEntries(CREDIT_PACKS.map(p => [p.id, p]));

/**
 * Regla de cobro vigente (definida por Omar, agosto 2026):
 *
 *   · Generar un link es GRATIS.
 *   · Se cobra 1 crédito por cada test que una persona TERMINA.
 *     1 test  × 1 persona = 1 crédito
 *     3 tests × 1 persona = 3 créditos
 *   · Un test abandonado a la mitad no cobra nada.
 *   · Quedarse sin créditos NO bloquea el link: la gente sigue
 *     respondiendo y al dueño le llega un aviso por correo. El saldo
 *     puede quedar negativo, y eso es a propósito: es la deuda.
 *
 * El cobro se aplica server-side en /api/assessment/save-result, una sola
 * vez por sesión (ver assessment_sessions.credito_cobrado_at).
 */
export const CREDITOS_POR_TEST_TERMINADO = 1;

/** Cuántos créditos consumirá una persona que rinda todos los tests del link. */
export function costoEstimadoPorPersona(instrumentIds: string[]): number {
  return instrumentIds.length * CREDITOS_POR_TEST_TERMINADO;
}

/** Planes que generan links sin consumir créditos. */
export function requiereCreditos(opts: { ownerTipo: 'menter' | 'empresa'; plan?: string }): boolean {
  if (opts.ownerTipo === 'menter') {
    return !['premium', 'master'].includes(opts.plan ?? 'free');
  }
  return opts.plan !== 'master';
}
