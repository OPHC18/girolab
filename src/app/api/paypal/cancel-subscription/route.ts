// src/app/api/paypal/cancel-subscription/route.ts
// Cancela la suscripción PayPal activa del Menter y baja el plan a free

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cancelSubscription } from '@/lib/paypal'
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
    .select('paypal_subscription_id, plan')
    .eq('menter_id', user.id)
    .single()

  if (!membership?.paypal_subscription_id) {
    return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 400 })
  }

  try {
    await cancelSubscription(membership.paypal_subscription_id)
  } catch (err) {
    console.error('[paypal/cancel-subscription] PayPal error:', err)
    // Continuamos aunque PayPal falle — actualizamos BD de todas formas
  }

  await supabase.from('menter_memberships')
    .update({
      plan:                   'free',
      is_active:              false,
      paypal_subscription_id: null,
      downgrade_reason:       'cancelled',
      updated_at:             new Date().toISOString(),
    })
    .eq('menter_id', user.id)

  return NextResponse.json({ ok: true, message: 'Suscripción cancelada. Tu plan es ahora Free.' })
}
