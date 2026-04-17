import { emailLayout, btn, divider, h1, h2, p, infoRow, infoTable } from '../layout'
import { sendEmail } from '../brevo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export interface CitaData {
  clientName:   string
  clientEmail:  string
  menterName:   string
  menterEmail:  string
  date:         string   // ej: "Martes 8 de abril de 2025"
  startTime:    string   // ej: "10:00"
  endTime:      string   // ej: "11:00"
  modality:     string   // "online" | "presencial"
  price:        number
  appointmentId: string
  service?:     string
}

// ── 1. Nueva solicitud → Menter ──────────────────────────────────────────────
export async function emailNuevaSolicitudMenter(data: CitaData) {
  const html = emailLayout(`
    ${h1('Tienes una nueva solicitud de sesión')}
    ${p(`<strong>${data.clientName}</strong> quiere agendar una sesión contigo. Revisa los detalles y confírmala desde tu dashboard.`)}
    ${infoTable(
      infoRow('Cliente', data.clientName) +
      infoRow('Fecha', data.date) +
      infoRow('Hora', `${data.startTime} – ${data.endTime}`) +
      infoRow('Modalidad', data.modality === 'online' ? 'Online (videollamada)' : 'Presencial') +
      infoRow('Precio', `S/ ${data.price}`)
    )}
    ${btn('Revisar solicitud', `${APP_URL}/dashboard?tab=citas`)}
    ${divider()}
    ${p('Si tienes algún problema, puedes rechazar o reprogramar la sesión desde tu dashboard.')}
  `, `${data.clientName} quiere sesionar contigo`)

  return sendEmail({
    to:      [{ email: data.menterEmail, name: data.menterName }],
    subject: `Nueva solicitud de sesión — ${data.clientName}`,
    htmlContent: html,
  })
}

// ── 2. Confirmación → Cliente ────────────────────────────────────────────────
export async function emailConfirmacionCliente(data: CitaData) {
  const html = emailLayout(`
    ${h1('¡Tu sesión está confirmada!')}
    ${p(`Tu sesión con <strong>${data.menterName}</strong> ha sido confirmada. Aquí tienes los detalles:`)}
    ${infoTable(
      infoRow('Menter', data.menterName) +
      infoRow('Fecha', data.date) +
      infoRow('Hora', `${data.startTime} – ${data.endTime}`) +
      infoRow('Modalidad', data.modality === 'online' ? 'Online (videollamada)' : 'Presencial') +
      infoRow('Precio', `S/ ${data.price}`)
    )}
    ${btn('Ver mis citas', `${APP_URL}/dashboard?tab=mis-citas`)}
    ${divider()}
    ${p('Te enviaremos un recordatorio 24 horas antes de tu sesión. Si necesitas cancelar o reprogramar, hazlo con al menos 24h de anticipación.')}
  `, `Tu sesión con ${data.menterName} está confirmada`)

  return sendEmail({
    to:      [{ email: data.clientEmail, name: data.clientName }],
    subject: `Sesión confirmada con ${data.menterName} — ${data.date}`,
    htmlContent: html,
  })
}

// ── 3. Recordatorio 24h → Menter ─────────────────────────────────────────────
export async function emailRecordatorioMenter(data: CitaData) {
  const html = emailLayout(`
    ${h1('Recordatorio: sesión mañana')}
    ${p(`Mañana tienes una sesión con <strong>${data.clientName}</strong>. Prepárate con anticipación.`)}
    ${infoTable(
      infoRow('Cliente', data.clientName) +
      infoRow('Fecha', data.date) +
      infoRow('Hora', `${data.startTime} – ${data.endTime}`) +
      infoRow('Modalidad', data.modality === 'online' ? 'Online (videollamada)' : 'Presencial')
    )}
    ${btn('Ver mis citas', `${APP_URL}/dashboard?tab=citas`)}
  `, `Mañana: sesión con ${data.clientName}`)

  return sendEmail({
    to:      [{ email: data.menterEmail, name: data.menterName }],
    subject: `Recordatorio — Sesión con ${data.clientName} mañana a las ${data.startTime}`,
    htmlContent: html,
  })
}

// ── 4. Recordatorio 24h → Cliente ────────────────────────────────────────────
export async function emailRecordatorioCliente(data: CitaData) {
  const html = emailLayout(`
    ${h1('Tu sesión es mañana')}
    ${p(`Recuerda que mañana tienes una sesión con <strong>${data.menterName}</strong>.`)}
    ${infoTable(
      infoRow('Menter', data.menterName) +
      infoRow('Fecha', data.date) +
      infoRow('Hora', `${data.startTime} – ${data.endTime}`) +
      infoRow('Modalidad', data.modality === 'online' ? 'Online (videollamada)' : 'Presencial')
    )}
    ${btn('Ver mis citas', `${APP_URL}/dashboard?tab=mis-citas`)}
    ${divider()}
    ${p('Si no puedes asistir, cancela o solicita reprogramación desde tu dashboard con anticipación.')}
  `, `Mañana: tu sesión con ${data.menterName}`)

  return sendEmail({
    to:      [{ email: data.clientEmail, name: data.clientName }],
    subject: `Recordatorio — Tu sesión con ${data.menterName} es mañana a las ${data.startTime}`,
    htmlContent: html,
  })
}

// ── 5. Rechazo de cita → Cliente ─────────────────────────────────────────────
export async function emailRechazoCliente(data: CitaData & { motivo?: string }) {
  const html = emailLayout(`
    ${h1('Tu solicitud no pudo confirmarse')}
    ${p(`Lamentablemente, <strong>${data.menterName}</strong> no pudo aceptar tu solicitud de sesión para el ${data.date}.`)}
    ${data.motivo ? infoTable(infoRow('Motivo', data.motivo)) : ''}
    ${p('No te preocupes, puedes explorar otros Menters disponibles y agendar tu sesión sin problema.')}
    ${btn('Explorar Menters', `${APP_URL}/dashboard`)}
    ${divider()}
    ${p('Si crees que esto es un error, escríbenos a <a href="mailto:contacto@girolab.net" style="color:#421869;">contacto@girolab.net</a>')}
  `, `Tu solicitud con ${data.menterName} no fue aceptada`)

  return sendEmail({
    to:      [{ email: data.clientEmail, name: data.clientName }],
    subject: `Actualización sobre tu solicitud con ${data.menterName}`,
    htmlContent: html,
  })
}

// ── 6. Solicitud de reprogramación → destinatario ────────────────────────────
export async function emailSolicitudReprogramacion(data: {
  destinatarioEmail: string
  destinatarioName:  string
  solicitanteNombre: string
  citaOriginal:      { date: string; startTime: string }
  nuevaFecha:        string
  nuevaHoraInicio:   string
  nuevaHoraFin:      string
  appointmentId:     string
}) {
  const html = emailLayout(`
    ${h1('Solicitud de reprogramación')}
    ${p(`<strong>${data.solicitanteNombre}</strong> ha solicitado reprogramar la siguiente sesión:`)}
    ${infoTable(
      infoRow('Fecha original', `${data.citaOriginal.date} a las ${data.citaOriginal.startTime}`) +
      infoRow('Nueva fecha propuesta', data.nuevaFecha) +
      infoRow('Nuevo horario', `${data.nuevaHoraInicio} – ${data.nuevaHoraFin}`)
    )}
    ${p('Entra a tu dashboard para aceptar o rechazar la reprogramación.')}
    ${btn('Responder solicitud', `${APP_URL}/dashboard?tab=citas`)}
  `, `${data.solicitanteNombre} solicita reprogramar su sesión`)

  return sendEmail({
    to:      [{ email: data.destinatarioEmail, name: data.destinatarioName }],
    subject: `Solicitud de reprogramación — ${data.solicitanteNombre}`,
    htmlContent: html,
  })
}

// ── 7a. Reprogramación aceptada → solicitante ─────────────────────────────────
export async function emailReprogramacionAceptada(data: {
  destinatarioEmail: string
  destinatarioName:  string
  contraparte:       string
  nuevaFecha:        string
  nuevaHoraInicio:   string
  nuevaHoraFin:      string
}) {
  const html = emailLayout(`
    ${h1('Reprogramación confirmada')}
    ${p(`<strong>${data.contraparte}</strong> ha aceptado la reprogramación. Aquí están los nuevos detalles:`)}
    ${infoTable(
      infoRow('Nueva fecha', data.nuevaFecha) +
      infoRow('Nuevo horario', `${data.nuevaHoraInicio} – ${data.nuevaHoraFin}`)
    )}
    ${btn('Ver mis citas', `${APP_URL}/dashboard`)}
  `, `${data.contraparte} aceptó la reprogramación`)

  return sendEmail({
    to:      [{ email: data.destinatarioEmail, name: data.destinatarioName }],
    subject: `Reprogramación aceptada — ${data.nuevaFecha} a las ${data.nuevaHoraInicio}`,
    htmlContent: html,
  })
}

// ── 7b. Reprogramación rechazada → solicitante ───────────────────────────────
export async function emailReprogramacionRechazada(data: {
  destinatarioEmail: string
  destinatarioName:  string
  contraparte:       string
  fechaOriginal:     string
  horaOriginal:      string
}) {
  const html = emailLayout(`
    ${h1('Reprogramación no aceptada')}
    ${p(`<strong>${data.contraparte}</strong> no pudo aceptar la reprogramación. Tu sesión se mantiene en la fecha original:`)}
    ${infoTable(
      infoRow('Fecha', data.fechaOriginal) +
      infoRow('Hora', data.horaOriginal)
    )}
    ${p('Si necesitas cancelar o proponer otra fecha, hazlo desde tu dashboard.')}
    ${btn('Ir al Dashboard', `${APP_URL}/dashboard`)}
  `, `${data.contraparte} no aceptó la reprogramación`)

  return sendEmail({
    to:      [{ email: data.destinatarioEmail, name: data.destinatarioName }],
    subject: `Reprogramación no aceptada — ${data.contraparte}`,
    htmlContent: html,
  })
}

// ── 8. Cancelación automática (24 h sin respuesta) → Cliente ─────────────────
export async function emailCitaCanceladaAuto(data: {
  clientName:   string
  clientEmail:  string
  menterName:   string
  citaFecha:    string
  citaHora:     string
  dashboardUrl: string
}) {
  const html = emailLayout(`
    ${h1('Tu solicitud fue cancelada automáticamente')}
    ${p(`Tu solicitud de sesión con <strong>${data.menterName}</strong> fue cancelada porque el Menter no respondió dentro de las 24 horas.`)}
    ${infoTable(
      infoRow('Menter', data.menterName) +
      infoRow('Fecha solicitada', data.citaFecha) +
      infoRow('Hora', data.citaHora)
    )}
    ${p('Puedes explorar otros Menters disponibles y agendar una nueva sesión cuando quieras.')}
    ${btn('Explorar Menters', data.dashboardUrl)}
    ${divider()}
    ${p('Si crees que esto es un error, contáctanos en <a href="mailto:contacto@girolab.net" style="color:#421869;">contacto@girolab.net</a>')}
  `, `Tu solicitud con ${data.menterName} fue cancelada automáticamente`)

  return sendEmail({
    to:      [{ email: data.clientEmail, name: data.clientName }],
    subject: `Tu solicitud de sesión fue cancelada — ${data.menterName}`,
    htmlContent: html,
  })
}

// ── Resultado de test → Menter ───────────────────────────────────────────────
export async function emailResultadoTestMenter(data: {
  menterEmail: string
  menterNombre: string
  personaNombre: string
  personaEmail: string
  instrumentoNombre: string
  resultadoUrl: string
}) {
  const html = emailLayout(`
    ${h1('Un usuario completó un test')}
    ${p(`<strong>${data.personaNombre}</strong> completó el test <em>${data.instrumentoNombre}</em> a través de tu enlace.`)}
    ${infoTable(
      infoRow('Usuario', data.personaNombre) +
      (data.personaEmail ? infoRow('Correo', data.personaEmail) : '') +
      infoRow('Instrumento', data.instrumentoNombre)
    )}
    ${btn('Ver resultado', data.resultadoUrl)}
    ${divider()}
    ${p('Puedes ver el resultado completo y contactar al usuario desde tu dashboard.')}
  `, `${data.personaNombre} completó ${data.instrumentoNombre}`)

  return sendEmail({
    to:      [{ email: data.menterEmail, name: data.menterNombre }],
    subject: `${data.personaNombre} completó el test ${data.instrumentoNombre}`,
    htmlContent: html,
  })
}
