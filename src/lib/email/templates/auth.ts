import { emailLayout, btn, divider, p, h1 } from '../layout'
import { sendEmail } from '../brevo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function emailResetPassword(data: {
  userEmail: string
  userName: string
  resetLink: string
}) {
  const html = emailLayout(`
    ${h1('Restablece tu contraseña')}
    ${p(`Hola${data.userName ? ` <strong>${data.userName}</strong>` : ''}, recibimos una solicitud para restablecer la contraseña de tu cuenta en Giro Lab.`)}
    ${p('Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.')}
    ${btn('Restablecer contraseña', data.resetLink)}
    ${divider()}
    ${p('Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo la misma.')}
    ${p('<span style="font-size:13px;color:#999;">Por seguridad, nunca compartas este enlace con nadie.</span>')}
  `, 'Restablecer tu contraseña de Giro Lab')

  return sendEmail({
    to: [{ email: data.userEmail, name: data.userName || data.userEmail }],
    subject: 'Restablece tu contraseña — Giro Lab',
    htmlContent: html,
  })
}
