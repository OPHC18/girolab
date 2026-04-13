/**
 * Helper del lado del cliente para llamar a /api/email
 * Nunca lanza excepción — falla silenciosamente para no interrumpir el flujo UX
 */
export async function dispararEmail(tipo: string, data: Record<string, any>): Promise<void> {
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tipo, data }),
    })
  } catch (e) {
    console.error('[email] Error al disparar:', tipo, e)
  }
}
