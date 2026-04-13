import { emailLayout, btn, divider, h1, h2, p } from '../layout'
import { sendEmail } from '../brevo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

// ── DÍA 1 — Bienvenida + Match ────────────────────────────────────────────────
export async function emailBienvenidaDia1(data: {
  userName:       string
  userEmail:      string
  menterNombre?:  string
  menterId?:      string
  menterEspecialidad?: string
  menterAvatar?:  string
}) {
  const menterSection = data.menterNombre ? `
    ${h2('Tu Menter sugerido')}
    <table cellpadding="0" cellspacing="0" border="0" style="background:#faf5ff;border-radius:14px;padding:20px;margin:16px 0;width:100%;">
      <tr>
        ${data.menterAvatar
          ? `<td style="width:64px;padding-right:16px;vertical-align:top;"><img src="${data.menterAvatar}" alt="${data.menterNombre}" width="64" height="64" style="border-radius:50%;object-fit:cover;border:2px solid #e9d5ff;" /></td>`
          : `<td style="width:64px;padding-right:16px;vertical-align:top;"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#421869,#995bd5);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:white;">${data.menterNombre[0]}</div></td>`
        }
        <td style="vertical-align:top;">
          <div style="font-family:Raleway,Arial,sans-serif;font-size:17px;font-weight:800;color:#421869;margin-bottom:4px;">${data.menterNombre}</div>
          ${data.menterEspecialidad ? `<div style="font-size:13px;color:#888;">${data.menterEspecialidad}</div>` : ''}
        </td>
      </tr>
    </table>
    ${btn('Conocer a mi Menter', `${APP_URL}/menter/${data.menterId || ''}`, '#ffa719')}
  ` : ''

  const html = emailLayout(`
    ${h1(`Tu Giro comienza hoy, ${data.userName.split(' ')[0]}`)}
    ${p('Bienvenido a <strong>Giro Lab</strong>. Tomaste una decisión importante — la de invertir en tu bienestar con acompañamiento real.')}
    ${p('No somos una app de meditación ni un directorio genérico. Giro Lab conecta personas con <strong>Menters</strong>: profesionales del bienestar que combinan metodología, experiencia y presencia humana.')}

    ${menterSection}

    ${divider()}

    ${h2('Próximos pasos')}
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:8px 0;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0e8ff;">
        <span style="display:inline-block;width:28px;height:28px;background:#421869;border-radius:50%;color:white;font-weight:700;font-size:13px;text-align:center;line-height:28px;margin-right:12px;">1</span>
        <span style="font-size:14px;color:#444;">Revisa el perfil de tu Menter sugerido</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0e8ff;">
        <span style="display:inline-block;width:28px;height:28px;background:#421869;border-radius:50%;color:white;font-weight:700;font-size:13px;text-align:center;line-height:28px;margin-right:12px;">2</span>
        <span style="font-size:14px;color:#444;">Agenda tu primera sesión gratuita o de exploración</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="display:inline-block;width:28px;height:28px;background:#421869;border-radius:50%;color:white;font-weight:700;font-size:13px;text-align:center;line-height:28px;margin-right:12px;">3</span>
        <span style="font-size:14px;color:#444;">Si no encaja, explora otros Menters — sin costo</span>
      </td></tr>
    </table>

    ${btn('Ir a mi Dashboard', `${APP_URL}/dashboard`)}
    ${divider()}
    ${p('¿No te convence el match? <a href="${APP_URL}/dashboard" style="color:#421869;font-weight:600;">Ajusta tus preferencias aquí</a> y te sugerimos otros perfiles.'.replace('${APP_URL}', APP_URL))}
  `, 'Tu Giro comienza hoy — encuentra a tu Menter')

  return sendEmail({
    to:      [{ email: data.userEmail, name: data.userName }],
    subject: 'Tu Giro comienza hoy 🌀',
    htmlContent: html,
  })
}

// ── DÍA 2 — Menters sugeridos ─────────────────────────────────────────────────
export type MenterCard = {
  id:                 string
  nombre:             string
  apellidos?:         string
  avatar_url?:        string
  casos_que_atiende?: string[]
  bio?:               string
  precio_sesion?:     number | string | null
  modalidad?:         string
  plan?:              string
}

function menterCardHtml(m: MenterCard, appUrl: string): string {
  const nombre    = `${m.nombre}${m.apellidos ? ' ' + m.apellidos : ''}`
  const inicial   = nombre.trim()[0]?.toUpperCase() || 'M'
  const avatar    = m.avatar_url
    ? `<img src="${m.avatar_url}" alt="${nombre}" width="56" height="56" style="border-radius:50%;object-fit:cover;border:2px solid #e9d5ff;display:block;" />`
    : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#421869,#995bd5);text-align:center;line-height:56px;font-size:22px;font-weight:700;color:white;">${inicial}</div>`

  const casos = (m.casos_que_atiende || []).slice(0, 3)
  const pills  = casos.map(c =>
    `<span style="display:inline-block;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;background:#f3e8ff;color:#6d28d9;margin:0 4px 4px 0;">${c}</span>`
  ).join('')

  const precio = m.precio_sesion ? `<span style="font-size:12px;color:#888;">Desde <strong style="color:#421869;">$${m.precio_sesion} USD</strong></span>` : ''
  const modalidad = m.modalidad === 'virtual' ? 'Virtual' : m.modalidad === 'presencial' ? 'Presencial' : m.modalidad === 'ambas' ? 'Virtual · Presencial' : ''
  const bioCorta = m.bio ? m.bio.replace(/<[^>]*>/g, '').slice(0, 90) + (m.bio.length > 90 ? '…' : '') : ''

  const planBadge = m.plan && m.plan !== 'free'
    ? `<span style="font-size:9px;font-weight:800;padding:2px 7px;border-radius:10px;background:${m.plan === 'master' ? '#fff3e0' : '#f3e5f5'};color:${m.plan === 'master' ? '#e65100' : '#6a1b9a'};text-transform:uppercase;letter-spacing:0.5px;margin-left:6px;">${m.plan}</span>`
    : ''

  return `
  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#faf5ff;border-radius:14px;border:1px solid #e9d5ff;margin-bottom:14px;">
    <tr>
      <td style="width:72px;padding:16px 0 16px 16px;vertical-align:top;">${avatar}</td>
      <td style="padding:16px 16px 16px 12px;vertical-align:top;">
        <div style="font-family:Raleway,Arial,sans-serif;font-size:15px;font-weight:800;color:#421869;line-height:1.2;">
          ${nombre}${planBadge}
        </div>
        ${modalidad ? `<div style="font-size:11px;color:#888;margin:3px 0 6px;">${modalidad}</div>` : '<div style="margin-bottom:6px;"></div>'}
        <div style="margin-bottom:8px;">${pills}</div>
        ${bioCorta ? `<div style="font-size:13px;color:#555;line-height:1.5;margin-bottom:10px;">${bioCorta}</div>` : ''}
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${precio ? `<td style="padding-right:12px;vertical-align:middle;">${precio}</td>` : ''}
            <td style="vertical-align:middle;">
              <a href="${appUrl}/menter/${m.id}" style="display:inline-block;padding:7px 18px;background:#421869;color:white;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;font-family:Raleway,Arial,sans-serif;">Ver perfil →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

export async function emailMentersDia2(data: {
  userName:      string
  userEmail:     string
  menters:       MenterCard[]
  motivo?:       string
  generoLabel?:  string   // 'hombre' | 'mujer' | null
}) {
  const firstName    = data.userName.split(' ')[0]
  const total        = data.menters.length
  const motivoTexto  = data.motivo ? ` para trabajar en <strong>${data.motivo}</strong>` : ''
  const generoTexto  = data.generoLabel ? ` (${data.generoLabel === 'hombre' ? 'Menters hombres' : 'Menters mujeres'})` : ''
  const tarjetas     = data.menters.map(m => menterCardHtml(m, APP_URL)).join('')

  const html = emailLayout(`
    ${h1(`${firstName}, estos Menters son para ti`)}
    ${p(`Seleccionamos <strong>${total} Menters</strong>${motivoTexto}${generoTexto} que se ajustan a tu perfil. Revisa cada uno y elige el que más conecte contigo.`)}
    ${divider()}
    ${tarjetas}
    ${divider()}
    ${p('¿No encuentras lo que buscas? Hay más Menters esperando en el directorio.')}
    ${btn('Ver todos los Menters', `${APP_URL}/dashboard`, '#ffa719')}
  `, `Estos ${total} Menters pueden acompañarte`)

  return sendEmail({
    to:          [{ email: data.userEmail, name: data.userName }],
    subject:     `${firstName}, encontramos Menters que hacen match contigo`,
    htmlContent: html,
  })
}

// ── DÍA 3 — Educación ─────────────────────────────────────────────────────────
export async function emailEducacionDia3(data: {
  userName:  string
  userEmail: string
}) {
  const html = emailLayout(`
    ${h1('¿Qué es un Menter y por qué no es lo que imaginas?')}
    ${p(`${data.userName.split(' ')[0]}, hace 3 días empezaste tu camino en Giro Lab. Queremos que entiendas bien qué hace diferente a un Menter.`)}

    ${divider()}

    ${h2('Menter ≠ Coach genérico')}
    ${p('Un coach genérico aplica un método estándar. Un <strong>Menter</strong> tiene una especialidad real — bienestar emocional, liderazgo, finanzas personales, relaciones — y trabaja contigo desde un diagnóstico profundo, no desde una plantilla.')}

    ${h2('Menter ≠ Terapeuta clínico')}
    ${p('Un terapeuta trabaja con el pasado. Un <strong>Menter</strong> trabaja con el presente y el futuro: qué bloqueos tienes hoy y cómo construyes el bienestar que quieres.')}

    ${h2('Los 3 principios del método Giro')}
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;">
      <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8ff;">
        <div style="font-family:Raleway,Arial,sans-serif;font-size:15px;font-weight:800;color:#421869;margin-bottom:4px;">1. Diagnóstico antes que recetas</div>
        <div style="font-size:14px;color:#555;line-height:1.6;">Antes de darte cualquier herramienta, tu Menter entiende tu situación real.</div>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8ff;">
        <div style="font-family:Raleway,Arial,sans-serif;font-size:15px;font-weight:800;color:#421869;margin-bottom:4px;">2. Acompañamiento, no dependencia</div>
        <div style="font-size:14px;color:#555;line-height:1.6;">El objetivo es que tú desarrolles la capacidad, no que siempre necesites al Menter.</div>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <div style="font-family:Raleway,Arial,sans-serif;font-size:15px;font-weight:800;color:#421869;margin-bottom:4px;">3. Resultados medibles</div>
        <div style="font-size:14px;color:#555;line-height:1.6;">Cada sesión tiene un propósito claro y puedes medir tu progreso en el tiempo.</div>
      </td></tr>
    </table>

    ${divider()}

    ${h2('Preguntas frecuentes')}
    ${p('<strong>¿Es terapia?</strong><br/>No. La mentería se enfoca en el crecimiento y el bienestar presente, no en el tratamiento de condiciones clínicas.')}
    ${p('<strong>¿Cuánto tiempo toma ver resultados?</strong><br/>Muchos usuarios notan claridad y dirección desde la primera sesión. Los cambios profundos se consolidan entre 4 y 12 semanas.')}
    ${p('<strong>¿Qué pasa si el Menter no encaja conmigo?</strong><br/>Puedes cambiar en cualquier momento sin costo. Tu bienestar no debe depender de un solo perfil.')}

    ${btn('Explorar más Menters', `${APP_URL}/dashboard`)}
  `, 'Un Menter no es lo que imaginas — 3 principios clave')

  return sendEmail({
    to:      [{ email: data.userEmail, name: data.userName }],
    subject: '¿Qué es un Menter y por qué no es lo que imaginas?',
    htmlContent: html,
  })
}

// ── DÍA 7 — Activación + Nudge ────────────────────────────────────────────────
export async function emailNudgeDia7(data: {
  userName:   string
  userEmail:  string
  activado:   boolean   // true = ya tuvo al menos 1 cita completada
  menterNombre?: string
  menterAvatar?: string
  menterId?: string
}) {
  const activadoContent = `
    ${h2(`¿Cómo fue tu sesión con ${data.menterNombre || 'tu Menter'}?`)}
    ${p('Una semana ha pasado. Eso es un primer paso real. Queremos saber cómo fue tu experiencia y animarte a dar el siguiente.')}
    ${p('Muchas personas notan que la <strong>segunda sesión</strong> es donde el trabajo real comienza — el Menter ya te conoce y puedes profundizar.')}
    ${btn('Agendar segunda sesión', data.menterId ? `${APP_URL}/menter/${data.menterId}` : `${APP_URL}/dashboard`, '#ffa719')}
    ${divider()}
    ${p('También puedes explorar otros servicios: talleres, eventos en vivo, y contenido exclusivo de tus Menters favoritos.')}
    ${btn('Ver qué hay en Giro Lab', `${APP_URL}/dashboard`)}
  `

  const noActivadoContent = `
    ${h2('Una semana. Es hora de tu primer Giro.')}
    ${p('Llevas una semana en Giro Lab y aún no has agendado tu primera sesión. Lo entendemos — dar el primer paso no siempre es fácil.')}
    ${p('Pero aquí está la verdad: <strong>la primera sesión es la más difícil de agendar y la más fácil de completar</strong>. La mayoría de personas salen de ella con más claridad de la que esperaban.')}
    ${btn('Agendar mi primera sesión', `${APP_URL}/dashboard`, '#ffa719')}
    ${divider()}
    ${p('¿Tienes dudas sobre qué esperar? Puedes explorar los perfiles de los Menters, leer sus reseñas y elegir sin presión.')}
    ${btn('Explorar Menters', `${APP_URL}/dashboard`)}
  `

  const html = emailLayout(`
    ${h1(`Una semana en Giro Lab, ${data.userName.split(' ')[0]}`)}
    ${data.activado ? activadoContent : noActivadoContent}
    ${divider()}
    ${p('El bienestar no es un destino, es una práctica. Estamos aquí para acompañarte.')}
    <p style="font-size:14px;color:#888;font-style:italic;margin:0;">— El equipo de Giro Lab</p>
  `, data.activado ? 'Sigue tu camino en Giro Lab' : 'Una semana. Es hora de tu primer Giro.')

  return sendEmail({
    to:      [{ email: data.userEmail, name: data.userName }],
    subject: `Una semana. ¿Cómo ha sido tu primera semana con Giro?`,
    htmlContent: html,
  })
}

// ── ELIMINACIÓN POR ADMIN — Cuenta suspendida por políticas ──────────────────
export async function emailEliminadoPorAdmin(data: {
  userName:  string
  userEmail: string
}) {
  const html = emailLayout(`
    ${h1(`Hola, ${data.userName.split(' ')[0]}`)}
    ${p('Te informamos que tu cuenta en <strong>Giro Lab</strong> ha sido eliminada por nuestro equipo de moderación.')}
    ${p('Esto ocurrió porque detectamos que tu cuenta o actividad no cumple con nuestras políticas de uso, las cuales puedes consultar en cualquier momento en <a href="https://girolab.net/terminos" style="color:#421869;">girolab.net/terminos</a>.')}
    ${divider()}
    ${p('Si consideras que esto es un error o deseas apelar esta decisión, escríbenos directamente:')}
    ${btn('Contactar al equipo', 'mailto:contacto@girolab.net', '#421869')}
    ${divider()}
    <p style="font-size:14px;color:#888;font-style:italic;margin:0;">— El equipo de Giro Lab</p>
  `, 'Tu cuenta en Giro Lab ha sido eliminada')

  return sendEmail({
    to:      [{ email: data.userEmail, name: data.userName }],
    subject: 'Tu cuenta en Giro Lab ha sido suspendida',
    htmlContent: html,
  })
}

// ── DESPEDIDA — Cuenta eliminada ──────────────────────────────────────────────
export async function emailDespedida(data: {
  userName:  string
  userEmail: string
}) {
  const html = emailLayout(`
    ${h1(`Hasta pronto, ${data.userName.split(' ')[0]}`)}
    ${p('Tu cuenta en Giro Lab ha sido eliminada correctamente. Todos tus datos han sido borrados de nuestra plataforma de forma permanente.')}
    ${divider()}
    ${p('Sabemos que los caminos tienen ritmos distintos. Si en algún momento decides volver, las puertas de Giro Lab estarán abiertas.')}
    ${p('Si eliminaste tu cuenta por error o tienes alguna duda, escríbenos antes de que pasen 24 horas — podríamos ayudarte.')}
    ${btn('Volver a Giro Lab', 'https://girolab.net', '#421869')}
    ${divider()}
    <p style="font-size:14px;color:#888;font-style:italic;margin:0;">Gracias por haber sido parte de este espacio.<br/>— El equipo de Giro Lab</p>
  `, 'Tu cuenta en Giro Lab ha sido eliminada')

  return sendEmail({
    to:      [{ email: data.userEmail, name: data.userName }],
    subject: 'Hasta pronto — tu cuenta en Giro Lab ha sido eliminada',
    htmlContent: html,
  })
}
