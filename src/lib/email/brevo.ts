/**
 * Cliente Brevo — envío de emails transaccionales
 * Usa la API REST directamente (sin SDK) para máxima compatibilidad con Edge/Node
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_API_KEY = process.env.BREVO_API_KEY!
const SENDER_EMAIL  = process.env.BREVO_SENDER_EMAIL || 'contacto@girolab.net'
const SENDER_NAME   = process.env.BREVO_SENDER_NAME  || 'Giro Lab'

export interface EmailPayload {
  to:       { email: string; name?: string }[]
  subject:  string
  htmlContent: string
  replyTo?: { email: string; name?: string }
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || SENDER_EMAIL
  const senderName  = process.env.BREVO_SENDER_NAME  || SENDER_NAME

  console.log('[brevo] API_KEY presente:', !!apiKey, '| sender:', senderEmail)

  if (!apiKey) {
    console.error('[brevo] BREVO_API_KEY no configurada')
    return { ok: false, error: 'BREVO_API_KEY no configurada' }
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: payload.to.map(({ email, name }) =>
          name?.trim() ? { email, name: name.trim() } : { email }
        ),
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Brevo] Error:', err)
      return { ok: false, error: err }
    }

    return { ok: true }
  } catch (e: any) {
    console.error('[Brevo] Exception:', e)
    return { ok: false, error: e.message }
  }
}
