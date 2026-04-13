import { emailLayout, btn, divider, h1, h2, p, infoRow, infoTable } from '../layout'
import { sendEmail } from '../brevo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export interface TicketData {
  clientName:   string
  clientEmail:  string
  eventoTitulo: string
  eventoFecha:  string
  eventoHora:   string
  eventoLugar:  string   // "Online" o dirección
  modalidad:    string
  cantidad:     number
  precioTotal:  number
  ticketCodes:  string[]  // códigos QR o IDs de tickets
  eventoId:     string
}

// ── Confirmación de inscripción → Cliente ────────────────────────────────────
export async function emailConfirmacionEvento(data: {
  clientName:      string
  clientEmail:     string
  eventoTitulo:    string
  eventoFecha:     string
  eventoHora:      string
  eventoLugar:     string
  modalidad:       string
  tipoEntrada:     string
  cantidad:        number
  precioTotal:     number
  registrationId:  string
  eventoId:        string
}) {
  const esGratis = data.precioTotal === 0
  const lugar    = data.modalidad === 'virtual' || data.modalidad === 'online'
    ? 'Online (enlace disponible antes del evento)'
    : data.eventoLugar || 'Por confirmar'

  const html = emailLayout(`
    ${h1('¡Inscripción confirmada!')}
    ${p(`Hola <strong>${data.clientName.split(' ')[0]}</strong>, tu inscripción en <strong>${data.eventoTitulo}</strong> está confirmada. Guarda este correo como comprobante.`)}

    ${infoTable(
      infoRow('Evento',    data.eventoTitulo) +
      infoRow('Fecha',     data.eventoFecha) +
      infoRow('Hora',      data.eventoHora) +
      infoRow('Lugar',     lugar) +
      infoRow('Entrada',   `${data.tipoEntrada} × ${data.cantidad}`) +
      infoRow('Total',     esGratis ? 'Gratis' : `$${data.precioTotal.toFixed(2)} USD`)
    )}

    <p style="font-size:13px;color:#888;margin:8px 0 20px;">Código de confirmación: <strong style="font-family:monospace;color:#421869;letter-spacing:1px;">${data.registrationId.slice(0, 8).toUpperCase()}</strong></p>

    ${divider()}
    ${h2('¿Qué sigue?')}
    ${p(data.modalidad === 'virtual' || data.modalidad === 'online'
      ? 'El enlace de acceso al evento se enviará a este correo poco antes de la fecha.'
      : `Recuerda llegar puntual. Lugar: <strong>${data.eventoLugar}</strong>`
    )}
    ${btn('Ver detalles del evento', `${APP_URL}/eventos/${data.eventoId}`, '#ffa719')}
    ${divider()}
    ${p('¿Tienes preguntas? Escríbenos a <a href="mailto:contacto@girolab.net" style="color:#421869;">contacto@girolab.net</a>')}
  `, `Inscripción confirmada — ${data.eventoTitulo}`)

  return sendEmail({
    to:          [{ email: data.clientEmail, name: data.clientName }],
    subject:     `Confirmación de inscripción — ${data.eventoTitulo}`,
    htmlContent: html,
  })
}

// ── Cancelación de evento → Inscritos ────────────────────────────────────────
export async function emailEventoCancelado(data: {
  clientName:   string
  clientEmail:  string
  eventoTitulo: string
  eventoFecha:  string
  tuvioPago:    boolean   // true = pagó, hay que gestionar reembolso
}) {
  const html = emailLayout(`
    ${h1('Evento cancelado')}
    ${p(`Hola <strong>${data.clientName.split(' ')[0]}</strong>, lamentamos informarte que el evento <strong>${data.eventoTitulo}</strong> programado para el <strong>${data.eventoFecha}</strong> ha sido cancelado.`)}

    ${divider()}

    ${data.tuvioPago ? `
      ${h2('Sobre tu reembolso')}
      ${p('Como realizaste un pago, te contactaremos dentro de los próximos <strong>3 días hábiles</strong> para coordinar el reembolso correspondiente según nuestra <a href="${APP_URL}/devoluciones" style="color:#421869;">Política de Devoluciones</a>.'.replace('${APP_URL}', APP_URL))}
    ` : `
      ${h2('Tu inscripción fue cancelada')}
      ${p('Como tu inscripción era gratuita, no hay ningún cargo que procesar.')}
    `}

    ${divider()}
    ${p('Disculpa los inconvenientes. Te invitamos a explorar otros eventos disponibles en la plataforma.')}
    ${btn('Ver otros eventos', `${APP_URL}/dashboard`, '#421869')}
    ${divider()}
    ${p('¿Tienes preguntas? Escríbenos a <a href="mailto:contacto@girolab.net" style="color:#421869;">contacto@girolab.net</a>')}
    <p style="font-size:14px;color:#888;font-style:italic;margin:16px 0 0;">— El equipo de Giro Lab</p>
  `, `El evento ${data.eventoTitulo} ha sido cancelado`)

  return sendEmail({
    to:          [{ email: data.clientEmail, name: data.clientName }],
    subject:     `Evento cancelado — ${data.eventoTitulo}`,
    htmlContent: html,
  })
}

// ── Compra de entradas → Cliente ─────────────────────────────────────────────
export async function emailCompraEntrada(data: TicketData) {
  const ticketsList = data.ticketCodes.map((code, i) =>
    `<tr><td style="font-size:13px;color:#888;padding:4px 12px 4px 0;">Entrada ${i + 1}</td>
     <td style="font-family:monospace;font-size:14px;color:#421869;font-weight:700;padding:4px 0;letter-spacing:1px;">${code}</td></tr>`
  ).join('')

  const html = emailLayout(`
    ${h1('¡Tus entradas están listas!')}
    ${p(`Gracias por inscribirte en <strong>${data.eventoTitulo}</strong>. Aquí tienes los detalles de tu compra:`)}

    ${infoTable(
      infoRow('Evento', data.eventoTitulo) +
      infoRow('Fecha', data.eventoFecha) +
      infoRow('Hora', data.eventoHora) +
      infoRow('Lugar', data.eventoLugar) +
      infoRow('Modalidad', data.modalidad === 'online' ? 'Online (videollamada)' : `Presencial — ${data.eventoLugar}`) +
      infoRow('Cantidad', `${data.cantidad} entrada${data.cantidad > 1 ? 's' : ''}`) +
      infoRow('Total pagado', `S/ ${data.precioTotal.toFixed(2)}`)
    )}

    <p style="font-size:14px;color:#444;margin:20px 0 8px;font-weight:600;">Tus códigos de entrada:</p>
    <table cellpadding="0" cellspacing="0" border="0" style="background:#faf5ff;border-radius:12px;padding:16px 20px;width:100%;">
      <tbody>${ticketsList}</tbody>
    </table>

    ${divider()}
    ${p('Guarda este correo — necesitarás tu código de entrada el día del evento.')}
    ${btn('Ver evento', `${APP_URL}/dashboard`)}
    ${divider()}
    ${p('¿Tienes preguntas? Escríbenos a <a href="mailto:contacto@girolab.net" style="color:#421869;">contacto@girolab.net</a>')}
  `, `Tus entradas para ${data.eventoTitulo}`)

  return sendEmail({
    to:      [{ email: data.clientEmail, name: data.clientName }],
    subject: `Tus entradas — ${data.eventoTitulo}`,
    htmlContent: html,
  })
}
