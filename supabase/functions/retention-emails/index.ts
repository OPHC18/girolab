/**
 * Edge Function: retention-emails
 * Disparada por pg_cron cada día a las 9:00 AM UTC.
 * Envía el email de día 3 y día 7 a los usuarios correspondientes.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BREVO_API_URL   = 'https://api.brevo.com/v3/smtp/email'
const SENDER_EMAIL    = 'contacto@girolab.net'
const SENDER_NAME     = 'Giro Lab'
const APP_URL         = 'https://girolab.net'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Brevo: enviar email ───────────────────────────────────────────────────────
async function sendEmail(to: { email: string; name?: string }, subject: string, html: string) {
  const apiKey = Deno.env.get('BREVO_API_KEY')
  if (!apiKey) { console.error('[brevo] BREVO_API_KEY no configurada'); return }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [to.name ? { email: to.email, name: to.name } : { email: to.email }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) console.error('[brevo] Error enviando a', to.email, await res.text())
}

// ── HTML helpers ──────────────────────────────────────────────────────────────
function layout(content: string, preheader = '') {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f0fa;font-family:'DM Sans',Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0fa;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td style="background:#421869;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
<span style="font-family:Raleway,Arial,sans-serif;font-size:26px;font-weight:900;color:#fff;">Giro <span style="color:#ffa719;">Lab</span></span>
</td></tr>
<tr><td style="background:#fff;padding:40px;border-radius:0 0 16px 16px;">${content}</td></tr>
<tr><td style="padding:24px 40px;text-align:center;">
<p style="margin:0 0 6px;font-size:12px;color:#999;">Giro Lab · Tu plataforma de bienestar integral</p>
<p style="margin:0;font-size:11px;color:#bbb;">Recibiste este correo porque tienes una cuenta en Giro Lab. <a href="${APP_URL}/dashboard" style="color:#421869;text-decoration:none;">Ir al Dashboard</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

const h1 = (t: string) => `<h1 style="font-family:Raleway,Arial,sans-serif;font-size:26px;font-weight:900;color:#421869;margin:0 0 16px;">${t}</h1>`
const h2 = (t: string) => `<h2 style="font-family:Raleway,Arial,sans-serif;font-size:18px;font-weight:800;color:#421869;margin:24px 0 8px;">${t}</h2>`
const p  = (t: string) => `<p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 14px;">${t}</p>`
const btn = (text: string, url: string, color = '#421869') =>
  `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background:${color};border-radius:30px;padding:14px 32px;text-align:center;"><a href="${url}" style="color:#fff;font-family:Raleway,Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;">${text}</a></td></tr></table>`
const divider = () => `<hr style="border:none;border-top:1px solid #f0e8ff;margin:24px 0;"/>`

// ── Menter card HTML (igual que en el template Next.js) ──────────────────────
function menterCardHtml(m: any, appUrl: string): string {
  const nombre  = `${m.nombre || ''}${m.apellidos ? ' ' + m.apellidos : ''}`.trim()
  const inicial = nombre[0]?.toUpperCase() || 'M'
  const avatar  = m.avatar_url
    ? `<img src="${m.avatar_url}" alt="${nombre}" width="56" height="56" style="border-radius:50%;object-fit:cover;border:2px solid #e9d5ff;display:block;" />`
    : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#421869,#995bd5);text-align:center;line-height:56px;font-size:22px;font-weight:700;color:white;">${inicial}</div>`
  const casos = (m.casos_que_atiende || []).slice(0, 3)
  const pills  = casos.map((c: string) =>
    `<span style="display:inline-block;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;background:#f3e8ff;color:#6d28d9;margin:0 4px 4px 0;">${c}</span>`
  ).join('')
  const precio     = m.precio_sesion ? `<span style="font-size:12px;color:#888;">Desde <strong style="color:#421869;">$${m.precio_sesion} USD</strong></span>` : ''
  const modalidad  = m.modalidad === 'virtual' ? 'Virtual' : m.modalidad === 'presencial' ? 'Presencial' : m.modalidad === 'ambas' ? 'Virtual · Presencial' : ''
  const rawBio     = (m.bio || '').replace(/<[^>]*>/g, '')
  const bioCorta   = rawBio.length > 90 ? rawBio.slice(0, 90) + '…' : rawBio
  const planBadge  = m.plan && m.plan !== 'free'
    ? `<span style="font-size:9px;font-weight:800;padding:2px 7px;border-radius:10px;background:${m.plan === 'master' ? '#fff3e0' : '#f3e5f5'};color:${m.plan === 'master' ? '#e65100' : '#6a1b9a'};text-transform:uppercase;letter-spacing:0.5px;margin-left:6px;">${m.plan}</span>`
    : ''
  const menterId = m.menter_id || m.id
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#faf5ff;border-radius:14px;border:1px solid #e9d5ff;margin-bottom:14px;">
    <tr>
      <td style="width:72px;padding:16px 0 16px 16px;vertical-align:top;">${avatar}</td>
      <td style="padding:16px 16px 16px 12px;vertical-align:top;">
        <div style="font-family:Raleway,Arial,sans-serif;font-size:15px;font-weight:800;color:#421869;line-height:1.2;">${nombre}${planBadge}</div>
        ${modalidad ? `<div style="font-size:11px;color:#888;margin:3px 0 6px;">${modalidad}</div>` : '<div style="margin-bottom:6px;"></div>'}
        <div style="margin-bottom:8px;">${pills}</div>
        ${bioCorta ? `<div style="font-size:13px;color:#555;line-height:1.5;margin-bottom:10px;">${bioCorta}</div>` : ''}
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          ${precio ? `<td style="padding-right:12px;vertical-align:middle;">${precio}</td>` : ''}
          <td style="vertical-align:middle;"><a href="${appUrl}/menter/${menterId}" style="display:inline-block;padding:7px 18px;background:#421869;color:white;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;font-family:Raleway,Arial,sans-serif;">Ver perfil →</a></td>
        </tr></table>
      </td>
    </tr>
  </table>`
}

// ── Email Día 2 ───────────────────────────────────────────────────────────────
async function enviarDia2(email: string, nombre: string, menters: any[], motivo?: string, generoLabel?: string) {
  const firstName   = nombre.split(' ')[0] || nombre
  const total       = menters.length
  const motivoTexto = motivo ? ` para trabajar en <strong>${motivo}</strong>` : ''
  const generoTexto = generoLabel ? ` (${generoLabel === 'hombre' ? 'Menters hombres' : 'Menters mujeres'})` : ''
  const tarjetas    = menters.map(m => menterCardHtml(m, APP_URL)).join('')

  const html = layout(`
    ${h1(`${firstName}, estos Menters son para ti`)}
    ${p(`Seleccionamos <strong>${total} Menters</strong>${motivoTexto}${generoTexto} que se ajustan a tu perfil. Revisa cada uno y elige el que más conecte contigo.`)}
    <hr style="border:none;border-top:1px solid #f0e8ff;margin:24px 0;"/>
    ${tarjetas}
    <hr style="border:none;border-top:1px solid #f0e8ff;margin:24px 0;"/>
    ${p('¿No encuentras lo que buscas? Hay más Menters esperando en el directorio.')}
    ${btn('Ver todos los Menters', `${APP_URL}/dashboard`, '#ffa719')}
  `, `Estos ${total} Menters pueden acompañarte`)

  await sendEmail({ email, name: nombre }, `${firstName}, encontramos Menters que hacen match contigo`, html)
}

// ── Email Día 3 ───────────────────────────────────────────────────────────────
async function enviarDia3(email: string, nombre: string) {
  const firstName = nombre.split(' ')[0] || nombre

  const html = layout(`
    ${h1('¿Qué es un Menter y por qué no es lo que imaginas?')}
    ${p(`${firstName}, hace 3 días empezaste tu camino en Giro Lab. Queremos que entiendas bien qué hace diferente a un Menter.`)}
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
    ${btn('Explorar Menters', `${APP_URL}/dashboard`)}
  `, 'Un Menter no es lo que imaginas — 3 principios clave')

  await sendEmail({ email, name: nombre }, '¿Qué es un Menter y por qué no es lo que imaginas?', html)
}

// ── Email Día 7 ───────────────────────────────────────────────────────────────
async function enviarDia7(email: string, nombre: string, activado: boolean, menterId?: string) {
  const firstName = nombre.split(' ')[0] || nombre

  const activadoContent = `
    ${h2(`¿Cómo fue tu sesión?`)}
    ${p('Una semana ha pasado. Eso es un primer paso real. Queremos saber cómo fue tu experiencia y animarte a dar el siguiente.')}
    ${p('Muchas personas notan que la <strong>segunda sesión</strong> es donde el trabajo real comienza — el Menter ya te conoce y puedes profundizar.')}
    ${btn('Agendar segunda sesión', menterId ? `${APP_URL}/menter/${menterId}` : `${APP_URL}/dashboard`, '#ffa719')}
    ${divider()}
    ${btn('Ver qué hay en Giro Lab', `${APP_URL}/dashboard`)}
  `
  const noActivadoContent = `
    ${h2('Una semana. Es hora de tu primer Giro.')}
    ${p('Llevas una semana en Giro Lab y aún no has agendado tu primera sesión. Lo entendemos — dar el primer paso no siempre es fácil.')}
    ${p('Pero aquí está la verdad: <strong>la primera sesión es la más difícil de agendar y la más fácil de completar</strong>. La mayoría de personas salen de ella con más claridad de la que esperaban.')}
    ${btn('Agendar mi primera sesión', `${APP_URL}/dashboard`, '#ffa719')}
    ${divider()}
    ${btn('Explorar Menters', `${APP_URL}/dashboard`)}
  `

  const html = layout(`
    ${h1(`Una semana en Giro Lab, ${firstName}`)}
    ${activado ? activadoContent : noActivadoContent}
    ${divider()}
    ${p('El bienestar no es un destino, es una práctica. Estamos aquí para acompañarte.')}
    <p style="font-size:14px;color:#888;font-style:italic;margin:0;">— El equipo de Giro Lab</p>
  `, activado ? 'Sigue tu camino en Giro Lab' : 'Una semana. Es hora de tu primer Giro.')

  await sendEmail({ email, name: nombre }, `Una semana. ¿Cómo ha sido tu primera semana con Giro?`, html)
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Verificar secret para que solo pg_cron pueda invocarla
  const authHeader = req.headers.get('Authorization')
  const expectedSecret = Deno.env.get('CRON_SECRET')
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const resultados = { dia2: 0, dia3: 0, dia7: 0, errores: 0 }

  try {
    // ── Usuarios del día 2 ──────────────────────────────────────────────────
    const { data: usuarios2, error: err2 } = await supabase.rpc('get_usuarios_retencion', { dias: 2 })
    if (err2) console.error('[retention] Error día 2:', err2)

    for (const u of (usuarios2 ?? [])) {
      try {
        // Preferencias del usuario
        const motivo: string | undefined      = u.motivo || undefined
        const genero: string | undefined      = u.genero_preferencia || undefined  // 'hombre' | 'mujer' | null
        const casos: string[]                 = u.casos || []

        // Buscar Menters que hagan match
        let query = supabase
          .from('menter_public_profiles')
          .select('menter_id, nombre, apellidos, avatar_url, bio, precio_sesion, modalidad, plan, casos_que_atiende, genero')
          .in('plan', ['premium', 'master', 'starter'])
          .order('plan', { ascending: false })
          .limit(20)

        if (genero && genero !== 'indiferente') {
          query = query.eq('genero', genero)
        }

        const { data: todosLosMenuters } = await query

        // Filtrar por casos si el usuario tiene preferencia
        let menters = todosLosMenuters || []
        if (casos.length > 0) {
          const conMatch = menters.filter(m =>
            (m.casos_que_atiende || []).some((c: string) => casos.includes(c))
          )
          menters = conMatch.length >= 3 ? conMatch : menters
        }

        menters = menters.slice(0, 10)

        if (menters.length === 0) {
          console.log('[retention] Sin Menters para día 2, usuario:', u.email)
          continue
        }

        const generoLabel = genero && genero !== 'indiferente' ? genero : undefined
        await enviarDia2(u.email, u.nombre || u.email, menters, motivo, generoLabel)
        resultados.dia2++
      } catch (e) {
        console.error('[retention] Fallo día 2 para', u.email, e)
        resultados.errores++
      }
    }

    // ── Usuarios del día 3 ──────────────────────────────────────────────────
    const { data: usuarios3, error: err3 } = await supabase.rpc('get_usuarios_retencion', { dias: 3 })
    if (err3) console.error('[retention] Error día 3:', err3)

    for (const u of (usuarios3 ?? [])) {
      try {
        await enviarDia3(u.email, u.nombre || u.email)
        resultados.dia3++
      } catch (e) {
        console.error('[retention] Fallo día 3 para', u.email, e)
        resultados.errores++
      }
    }

    // ── Usuarios del día 7 ──────────────────────────────────────────────────
    const { data: usuarios7, error: err7 } = await supabase.rpc('get_usuarios_retencion', { dias: 7 })
    if (err7) console.error('[retention] Error día 7:', err7)

    for (const u of (usuarios7 ?? [])) {
      try {
        // Verificar si tiene al menos 1 cita completada
        const { count } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', u.user_id)
          .eq('status', 'completada')

        const activado = (count ?? 0) > 0

        // Obtener último menter con cita completada (para el botón del email)
        let menterId: string | undefined
        if (activado) {
          const { data: ultimaCita } = await supabase
            .from('appointments')
            .select('menter_id')
            .eq('client_id', u.user_id)
            .eq('status', 'completada')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          menterId = ultimaCita?.menter_id
        }

        await enviarDia7(u.email, u.nombre || u.email, activado, menterId)
        resultados.dia7++
      } catch (e) {
        console.error('[retention] Fallo día 7 para', u.email, e)
        resultados.errores++
      }
    }
  } catch (e) {
    console.error('[retention] Error general:', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }

  console.log('[retention] Completado:', resultados)
  return new Response(JSON.stringify(resultados), {
    headers: { 'Content-Type': 'application/json' },
  })
})
