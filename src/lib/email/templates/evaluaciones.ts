// src/lib/email/templates/evaluaciones.ts
// Invitación a rendir una o varias evaluaciones desde un único link.

import { sendEmail } from '../brevo'
import { emailLayout, h1, p, btn, divider, infoTable, infoRow, escapeHtml } from '../layout'

export async function emailInvitacionEvaluacion(data: {
  email: string
  nombre?: string | null
  remitenteNombre: string
  titulo?: string | null
  mensaje?: string | null
  puestoNombre?: string | null
  instrumentos: string[]
  tiempoTotalMinutos: number
  url: string
}) {
  const saludo = data.nombre ? `Hola ${escapeHtml(data.nombre)},` : 'Hola,'
  const cuantos = data.instrumentos.length

  const lista = data.instrumentos
    .map((nombre, i) => `
      <tr>
        <td style="font-size:14px;color:#421869;font-weight:700;padding:6px 12px 6px 0;vertical-align:top;">${i + 1}.</td>
        <td style="font-size:14px;color:#333;padding:6px 0;vertical-align:top;">${escapeHtml(nombre)}</td>
      </tr>`)
    .join('')

  const html = emailLayout(`
    ${h1(cuantos > 1 ? 'Tienes evaluaciones por completar' : 'Tienes una evaluación por completar')}
    ${p(saludo)}
    ${p(`<strong>${escapeHtml(data.remitenteNombre)}</strong> te invitó a completar ${
      cuantos > 1 ? `<strong>${cuantos} evaluaciones</strong>` : 'una evaluación'
    } en Giro Lab.`)}
    ${data.mensaje ? p(`<em>${escapeHtml(data.mensaje)}</em>`) : ''}
    ${infoTable(
      (data.puestoNombre ? infoRow('Puesto', escapeHtml(data.puestoNombre)) : '') +
      (data.titulo       ? infoRow('Evaluación', escapeHtml(data.titulo))   : '') +
      infoRow('Tiempo estimado', `~${data.tiempoTotalMinutos} minutos`)
    )}
    ${p(cuantos > 1
      ? 'Desde un solo enlace vas a poder rendirlas todas, una tras otra:'
      : 'Ingresa al siguiente enlace para comenzar:')}
    <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;"><tbody>${lista}</tbody></table>
    ${btn(cuantos > 1 ? 'Comenzar las evaluaciones' : 'Comenzar la evaluación', data.url)}
    ${divider()}
    ${p('Puedes cerrar y retomar más tarde desde el mismo enlace: tu avance queda guardado. Tus respuestas son confidenciales.')}
  `, `${data.remitenteNombre} te invitó a completar ${cuantos > 1 ? `${cuantos} evaluaciones` : 'una evaluación'}`)

  return sendEmail({
    to:      [{ email: data.email, name: data.nombre || data.email }],
    subject: cuantos > 1
      ? `Tienes ${cuantos} evaluaciones por completar — Giro Lab`
      : 'Tienes una evaluación por completar — Giro Lab',
    htmlContent: html,
  })
}

/**
 * Aviso de que se acabaron los créditos. El link sigue funcionando a
 * propósito — nadie queda a medias de una evaluación — así que este correo
 * es el único mecanismo para que el dueño se entere y recargue.
 */
export async function emailSinCreditos(data: {
  destinatarioEmail: string
  destinatarioNombre: string
  saldo: number
  comprarUrl: string
}) {
  const enDeuda = data.saldo < 0

  const html = emailLayout(`
    ${h1(enDeuda ? 'Tus evaluaciones siguen corriendo sin créditos' : 'Te quedaste sin créditos')}
    ${p(`Hola ${escapeHtml(data.destinatarioNombre)},`)}
    ${p(enDeuda
      ? `Tus links siguen activos y las personas continúan respondiendo, pero ya no te quedan créditos: llevas <strong>${Math.abs(data.saldo)} evaluación${Math.abs(data.saldo) !== 1 ? 'es' : ''} pendiente${Math.abs(data.saldo) !== 1 ? 's' : ''} de pago</strong>.`
      : 'Acabas de usar tu último crédito. Tus links siguen funcionando con normalidad.')}
    ${p('No cerramos los links a propósito: nadie que esté rindiendo una evaluación se queda a medias. Pero para seguir recibiendo resultados necesitas recargar.')}
    ${btn('Comprar créditos', data.comprarUrl)}
    ${divider()}
    ${p('Recuerda que cada test que una persona completa consume 1 crédito. Si envías 3 tests a 4 personas, necesitas 12 créditos.')}
  `, enDeuda ? 'Tienes evaluaciones pendientes de pago' : 'Te quedaste sin créditos')

  return sendEmail({
    to:      [{ email: data.destinatarioEmail, name: data.destinatarioNombre }],
    subject: enDeuda ? 'Tienes evaluaciones pendientes de pago — Giro Lab' : 'Te quedaste sin créditos — Giro Lab',
    htmlContent: html,
  })
}

/**
 * Aviso al Menter/Empresa cuando alguien termina TODAS las evaluaciones de un
 * link. Reemplaza al correo por instrumento, que en un link multi-test sería
 * un correo por cada evaluación rendida.
 */
export async function emailResumenEvaluaciones(data: {
  destinatarioEmail: string
  destinatarioNombre: string
  evaluadoNombre: string
  evaluadoEmail: string
  esRegistrado: boolean
  puestoNombre?: string | null
  instrumentos: string[]
  dashboardUrl: string
}) {
  const html = emailLayout(`
    ${h1('Evaluaciones completadas')}
    ${p(`<strong>${escapeHtml(data.evaluadoNombre)}</strong> completó ${
      data.instrumentos.length > 1
        ? `las <strong>${data.instrumentos.length} evaluaciones</strong>`
        : 'la evaluación'
    } de tu enlace.`)}
    ${infoTable(
      infoRow('Evaluado', escapeHtml(data.evaluadoNombre)) +
      infoRow('Correo', escapeHtml(data.evaluadoEmail)) +
      infoRow('Cuenta', data.esRegistrado ? 'Registrado en Giro Lab' : 'Sin cuenta') +
      (data.puestoNombre ? infoRow('Puesto', escapeHtml(data.puestoNombre)) : '') +
      infoRow('Instrumentos', data.instrumentos.map(escapeHtml).join('<br />'))
    )}
    ${btn('Ver resultados', data.dashboardUrl)}
    ${divider()}
    ${p('Los resultados están en la pestaña Instrumentos de tu dashboard.')}
  `, `${data.evaluadoNombre} completó sus evaluaciones`)

  return sendEmail({
    to:      [{ email: data.destinatarioEmail, name: data.destinatarioNombre }],
    subject: `${data.evaluadoNombre} completó sus evaluaciones — Giro Lab`,
    htmlContent: html,
  })
}
