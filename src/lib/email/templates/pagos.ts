// src/lib/email/templates/pagos.ts
// Emails transaccionales de pagos y suscripciones MercadoPago

import { emailLayout, btn, h1, p, infoRow, infoTable } from '../layout'
import { sendEmail } from '../brevo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

// ── 1. Pago de cita confirmado → Cliente ─────────────────────────────────────
export async function emailPagoConfirmadoCita(data: {
  clientName:  string
  clientEmail: string
  menterName:  string
  fecha:       string
  hora:        string
  modalidad:   string
  precio:      number
}) {
  const htmlContent = emailLayout(`
    ${h1('¡Tu pago fue confirmado!')}
    ${p(`Tu sesión con <strong>${data.menterName}</strong> ha sido pagada exitosamente. El Menter recibirá la solicitud y la confirmará en breve.`)}
    ${infoTable(
      infoRow('Menter', data.menterName) +
      infoRow('Fecha', data.fecha) +
      infoRow('Hora', data.hora) +
      infoRow('Modalidad', data.modalidad === 'online' ? 'Online (videollamada)' : 'Presencial') +
      infoRow('Monto pagado', `USD ${data.precio.toFixed(2)}`)
    )}
    ${btn('Ver mis citas', `${APP_URL}/dashboard?tab=mis-citas`)}
    ${p('Guarda este email como comprobante de tu pago.')}
  `)
  return sendEmail({ to: [{ email: data.clientEmail, name: data.clientName }], subject: 'Pago confirmado — Giro Lab', htmlContent })
}

// ── 2. Suscripción activada → Menter ─────────────────────────────────────────
export async function emailSuscripcionActivada(data: {
  menterEmail: string
  menterName:  string
  plan:        string
  trialEnds?:  string  // fecha de fin del período de prueba
}) {
  const planLabel = data.plan === 'starter' ? 'Starter' : data.plan === 'premium' ? 'Premium' : data.plan
  const htmlContent = emailLayout(`
    ${h1(`¡Suscripción ${planLabel} activada!`)}
    ${p(`Hola <strong>${data.menterName}</strong>, tu membresía <strong>${planLabel}</strong> en Giro Lab está activa.`)}
    ${data.trialEnds ? p(`Tu período de prueba gratuito corre hasta el <strong>${new Date(data.trialEnds).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. No se realizará ningún cobro hasta esa fecha.`) : ''}
    ${p('Ahora tienes acceso a todas las funcionalidades de tu plan. Completa tu perfil para que los clientes te encuentren más fácilmente.')}
    ${btn('Ir a mi dashboard', `${APP_URL}/dashboard?tab=perfil-pro`)}
  `)
  return sendEmail({ to: [{ email: data.menterEmail, name: data.menterName }], subject: `Membresía ${planLabel} activa — Giro Lab`, htmlContent })
}

// ── 3. Plan rebajado por pago fallido → Menter ───────────────────────────────
export async function emailPlanRebajado(data: {
  menterEmail: string
  menterName:  string
  razon:       'payment_failed' | 'cancelled'
}) {
  const htmlContent = emailLayout(`
    ${h1('Tu plan de Giro Lab ha cambiado')}
    ${p(`Hola <strong>${data.menterName}</strong>, ${data.razon === 'payment_failed'
      ? 'no pudimos procesar tu pago de suscripción. Tu plan ha sido ajustado al nivel <strong>Free</strong> temporalmente.'
      : 'tu suscripción fue cancelada. Tu plan es ahora <strong>Free</strong>.'
    }`)}
    ${data.razon === 'payment_failed' ? p('Para recuperar el acceso a tu plan, ingresa a tu dashboard y suscríbete nuevamente con un método de pago válido.') : ''}
    ${p('Tus datos, reseñas y perfil están completamente a salvo. Solo algunas funcionalidades quedan pausadas hasta renovar tu plan.')}
    ${btn('Renovar mi plan', `${APP_URL}/dashboard?tab=membresia`)}
  `)
  return sendEmail({ to: [{ email: data.menterEmail, name: data.menterName }], subject: 'Cambio en tu membresía Giro Lab', htmlContent })
}

// ── 4. Trial termina pronto → Menter (enviar 3 días antes) ───────────────────
export async function emailTrialTermina(data: {
  menterEmail: string
  menterName:  string
  plan:        string
  diasRestantes: number
  trialEnds:   string
}) {
  const planLabel = data.plan === 'starter' ? 'Starter' : 'Premium'
  const htmlContent = emailLayout(`
    ${h1(`Tu prueba gratuita termina en ${data.diasRestantes} días`)}
    ${p(`Hola <strong>${data.menterName}</strong>, tu período de prueba <strong>${planLabel}</strong> vence el <strong>${new Date(data.trialEnds).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.`)}
    ${p('Después de esa fecha, tu tarjeta registrada será cobrada automáticamente para mantener tu plan activo. Si no deseas continuar, puedes cancelar tu suscripción desde el dashboard antes de esa fecha.')}
    ${btn('Administrar mi suscripción', `${APP_URL}/dashboard?tab=membresia`)}
  `)
  return sendEmail({ to: [{ email: data.menterEmail, name: data.menterName }], subject: `Tu prueba ${planLabel} termina pronto — Giro Lab`, htmlContent })
}
