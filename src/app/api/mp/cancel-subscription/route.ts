// src/app/api/mp/cancel-subscription/route.ts
// Cancela la suscripción activa del Menter en MercadoPago y baja el plan a free

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mpPreApproval } from '@/lib/mercadopago'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createSupabaseAdmin()

  const { data: membership } = await supabase
    .from('menter_memberships')
    .select('mp_subscription_id, plan')
    .eq('menter_id', user.id)
    .single()

  if (!membership?.mp_subscription_id) {
    return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 400 })
  }

  try {
    // Cancelar en MP
    await mpPreApproval.update({
      id:   membership.mp_subscription_id,
      body: { status: 'cancelled' },
    })
  } catch (err) {
    console.error('[cancel-subscription] MP error:', err)
    // Continuamos aunque MP falle — actualizamos BD de todas formas
  }

  await supabase.from('menter_memberships')
    .update({
      plan:             'free',
      is_active:        false,
      mp_subscription_id: null,
      downgrade_reason: 'cancelled',
      updated_at:       new Date().toISOString(),
    })
    .eq('menter_id', user.id)

  return NextResponse.json({ ok: true, message: 'Suscripción cancelada. Tu plan ha bajado a Free.' })
}
