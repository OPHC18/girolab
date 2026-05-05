import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

function isAuthorized(req: NextRequest) {
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const isInternal   = INTERNAL_SECRET && req.headers.get('authorization') === `Bearer ${INTERNAL_SECRET}`
  return isVercelCron || isInternal
}

async function sendEmail(tipo: string, data: object) {
  return fetch(`${APP_URL}/api/email`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    body:    JSON.stringify({ tipo, data }),
  }).catch(() => {})
}

// ── 1. CANCELAR CITAS PENDIENTES SIN RESPUESTA EN +24H ───────────────────────
async function cancelarCitasPendientes() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: pendientes, error } = await admin
    .from('appointments')
    .select('id, client_name, client_email, menter_name, date, start_time')
    .eq('status', 'pendiente')
    .lt('created_at', cutoff)

  if (error || !pendientes?.length) return { canceladas: 0 }

  await admin
    .from('appointments')
    .update({ status: 'cancelada', notas_cancelacion: 'Cancelada automáticamente: el Menter no respondió en 24 horas.', updated_at: new Date().toISOString() })
    .in('id', pendientes.map((c: any) => c.id))

  for (const c of pendientes) {
    if (!c.client_email) continue
    const fechaStr = new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    await sendEmail('cita_cancelada_auto', {
      clientName: c.client_name || 'Usuario', clientEmail: c.client_email,
      menterName: c.menter_name || 'el Menter', citaFecha: fechaStr,
      citaHora: c.start_time?.slice(0, 5) || '', dashboardUrl: `${APP_URL}/dashboard?tab=mis-citas`,
    })
  }
  return { canceladas: pendientes.length }
}

// ── 2. CHECKOUT ABANDONADO (intentos entre 1h y 24h sin email) ───────────────
async function checkoutAbandonado() {
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const to   = new Date(Date.now() -  1 * 60 * 60 * 1000).toISOString()

  const { data: abandonados, error } = await admin
    .from('checkout_attempts')
    .select('id, email, nombre, plan, billing_cycle')
    .eq('status', 'initiated')
    .gte('created_at', from)
    .lte('created_at', to)

  if (error || !abandonados?.length) return { enviados: 0 }

  let enviados = 0
  for (const a of abandonados) {
    if (!a.email) continue
    await sendEmail('checkout_abandonado', {
      nombre: a.nombre || 'por ahí', email: a.email,
      plan: a.plan, billing_cycle: a.billing_cycle,
      dashboardUrl: `${APP_URL}/dashboard?tab=membresia`,
    })
    await admin.from('checkout_attempts').update({ status: 'emailed', emailed_at: new Date().toISOString() }).eq('id', a.id)
    enviados++
  }
  return { enviados }
}

// ── 3. EMAILS DE RETENCIÓN (días 2, 3 y 7 tras el registro) ──────────────────
async function retencionEmails() {
  // Ventana de 24h para cada día (el cron corre 1 vez/día así que cada user cae exactamente 1 vez)
  function ventana(diasAtras: number) {
    const fin   = new Date(Date.now() - diasAtras       * 86400_000).toISOString()
    const inicio = new Date(Date.now() - (diasAtras + 1) * 86400_000).toISOString()
    return { inicio, fin }
  }

  // Obtener top Menters para el email del día 2
  const { data: topMenters } = await admin
    .from('menter_public_profiles')
    .select('menter_id, nombre, apellidos, avatar_url, bio, especialidad, precio_sesion, casos_que_atiende')
    .limit(3)

  const mentersCards = (topMenters || []).map((m: any) => ({
    id: m.menter_id, nombre: `${m.nombre} ${m.apellidos}`.trim(),
    avatar_url: m.avatar_url, bio: m.bio, especialidad: m.especialidad,
    precio_sesion: m.precio_sesion, casos: m.casos_que_atiende,
  }))

  const resultados: Record<string, number> = { dia2: 0, dia3: 0, dia7: 0 }

  // Obtener todos los usuarios activos de auth
  const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (usersErr || !users?.length) return resultados

  for (const u of users) {
    if (!u.email || !u.created_at) continue
    const createdAt = u.created_at
    const nombre = u.user_metadata?.nombre || u.email.split('@')[0]
    const apellidos = u.user_metadata?.apellidos || ''
    const userName = apellidos ? `${nombre} ${apellidos}`.trim() : nombre

    // Día 2
    const v2 = ventana(2)
    if (createdAt >= v2.inicio && createdAt < v2.fin) {
      await sendEmail('menters_dia2', { userName, userEmail: u.email, menters: mentersCards })
      resultados.dia2++
    }

    // Día 3
    const v3 = ventana(3)
    if (createdAt >= v3.inicio && createdAt < v3.fin) {
      await sendEmail('educacion_dia3', { userName, userEmail: u.email })
      resultados.dia3++
    }

    // Día 7 — verificar si ya tuvo al menos una cita completada
    const v7 = ventana(7)
    if (createdAt >= v7.inicio && createdAt < v7.fin) {
      const { data: citas } = await admin
        .from('appointments')
        .select('id, menter_name, menter_id')
        .eq('client_id', u.id)
        .eq('status', 'completada')
        .limit(1)

      const activado      = !!(citas && citas.length > 0)
      const menterNombre  = citas?.[0]?.menter_name || undefined
      const menterId      = citas?.[0]?.menter_id   || undefined
      await sendEmail('nudge_dia7', { userName, userEmail: u.email, activado, menterNombre, menterId })
      resultados.dia7++
    }
  }

  return resultados
}

// ── 4. RECORDATORIOS 24H ANTES DE LA CITA ────────────────────────────────────
async function recordatoriosCitas() {
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: citas, error } = await admin
    .from('appointments')
    .select('id, client_id, client_name, client_email, menter_name, menter_id, date, start_time, end_time, modality, price')
    .eq('date', tomorrowStr)
    .eq('status', 'confirmada')

  if (error || !citas?.length) return { enviados: 0 }

  let enviados = 0
  for (const c of citas) {
    const fechaStr = new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const base = {
      clientName:    c.client_name || 'Cliente',
      clientEmail:   c.client_email || '',
      menterName:    c.menter_name || 'tu Menter',
      menterEmail:   '',
      date:          fechaStr,
      startTime:     c.start_time?.slice(0, 5) || '',
      endTime:       c.end_time?.slice(0, 5) || '',
      modality:      c.modality || 'online',
      price:         c.price || 0,
      appointmentId: c.id,
    }

    if (c.client_email) {
      await sendEmail('recordatorio_cliente', base)
      enviados++
    }

    if (c.menter_id) {
      const { data: { user: mu } } = await admin.auth.admin.getUserById(c.menter_id)
      if (mu?.email) {
        await sendEmail('recordatorio_menter', { ...base, menterEmail: mu.email })
        enviados++
      }
    }

    // Push reminders (fire-and-forget)
    const pushReminder = (uid: string, title: string, body: string, url: string) =>
      fetch(`${APP_URL}/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL_SECRET },
        body: JSON.stringify({ user_id: uid, title, body, url }),
      }).catch(() => {})

    if (c.client_id) pushReminder(c.client_id, 'Recordatorio de sesión', `Tu sesión con ${base.menterName} es mañana a las ${base.startTime}.`, '/dashboard?tab=mis-citas')
    if (c.menter_id) pushReminder(c.menter_id, 'Sesión mañana', `Tienes sesión con ${base.clientName} mañana a las ${base.startTime}.`, '/dashboard?tab=citas')
  }
  return { enviados }
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [r1, r2, r3, r4] = await Promise.all([
    cancelarCitasPendientes(),
    checkoutAbandonado(),
    retencionEmails(),
    recordatoriosCitas(),
  ])

  return NextResponse.json({
    ok: true,
    canceladas:         r1.canceladas,
    checkout_enviados:  r2.enviados,
    retencion:          r3,
    recordatorios:      r4.enviados,
    timestamp:          new Date().toISOString(),
  })
}
