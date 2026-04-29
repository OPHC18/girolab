import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const INTERNAL_SECRET = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const isInternal = INTERNAL_SECRET && auth === `Bearer ${INTERNAL_SECRET}`
  if (!isVercelCron && !isInternal) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Intentos iniciados hace más de 1h y menos de 24h, aún no enviados
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const to   = new Date(Date.now() -  1 * 60 * 60 * 1000).toISOString()

  const { data: abandonados, error } = await admin
    .from('checkout_attempts')
    .select('*')
    .eq('status', 'initiated')
    .gte('created_at', from)
    .lte('created_at', to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!abandonados || abandonados.length === 0) {
    return NextResponse.json({ enviados: 0, message: 'Sin abandonos pendientes' })
  }

  let enviados = 0
  for (const a of abandonados) {
    if (!a.email) continue
    try {
      await fetch(`${APP_URL}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
        body: JSON.stringify({
          tipo: 'checkout_abandonado',
          data: {
            nombre:       a.nombre || 'por ahí',
            email:        a.email,
            plan:         a.plan,
            billing_cycle: a.billing_cycle,
            dashboardUrl: `${APP_URL}/dashboard?tab=membresia`,
          },
        }),
      })
      await admin.from('checkout_attempts').update({ status: 'emailed', emailed_at: new Date().toISOString() }).eq('id', a.id)
      enviados++
    } catch {
      // fire-and-forget
    }
  }

  return NextResponse.json({ enviados, message: `${enviados} email(s) de recuperación enviados` })
}
