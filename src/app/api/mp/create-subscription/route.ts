// src/app/api/mp/create-subscription/route.ts
// Crea una suscripción (preapproval) en MercadoPago para membresías de Menter
// Incluye 15 días de prueba gratuita en el primer pago

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mpPreApproval, PLAN_PRICES, buildRef } from '@/lib/mercadopago'
import { createSupabaseAdmin } from '@/lib/supabase-server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function POST(req: NextRequest) {
  // Autenticar
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { plan, billing_cycle } = body as { plan: 'starter' | 'premium'; billing_cycle: 'monthly' | 'annual' }

  if (!plan || !billing_cycle || !PLAN_PRICES[plan]) {
    return NextResponse.json({ error: 'Plan o ciclo inválido' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  // Verificar rol Menter
  const { data: meta } = await supabase.auth.admin.getUserById(user.id)
  const role = meta?.user?.user_metadata?.role
  if (role !== 'menter') {
    return NextResponse.json({ error: 'Solo Menters pueden suscribirse' }, { status: 403 })
  }

  // Verificar suscripción activa existente
  const { data: membership } = await supabase
    .from('menter_memberships')
    .select('plan, mp_subscription_id, is_active')
    .eq('menter_id', user.id)
    .single()

  if (membership?.mp_subscription_id && membership?.is_active && membership?.plan !== 'free') {
    return NextResponse.json({
      error: 'Ya tienes una suscripción activa. Cancela la actual antes de cambiar de plan.',
    }, { status: 409 })
  }

  const precio    = PLAN_PRICES[plan]
  const amount    = billing_cycle === 'annual' ? precio.annual : precio.monthly
  const frequency = billing_cycle === 'annual' ? 12 : 1

  const trialEnds = new Date()
  trialEnds.setDate(trialEnds.getDate() + 15)

  try {
    const preapproval = await mpPreApproval.create({
      body: {
        payer_email:        user.email!,
        reason:             `Giro Lab ${precio.label} — ${billing_cycle === 'annual' ? 'Anual' : 'Mensual'}`,
        external_reference: buildRef('subscription', user.id, plan, billing_cycle),
        back_url:           `${APP_URL}/dashboard?tab=membresia&sub=ok`,
        auto_recurring: {
          frequency:          frequency,
          frequency_type:     'months',
          transaction_amount: amount,
          currency_id:        'PEN',
          free_trial: {
            frequency:      15,
            frequency_type: 'days',
          },
        } as any,
        status: 'pending',
      }
    })

    // Actualizar membresía: plan activo + trial period + mp_subscription_id
    await supabase.from('menter_memberships')
      .update({
        plan,
        billing_cycle,
        is_active:          true,
        mp_subscription_id: preapproval.id,
        trial_ends_at:      trialEnds.toISOString(),
        starts_at:          new Date().toISOString(),
        expires_at:         null,
        downgrade_reason:   null,
        updated_at:         new Date().toISOString(),
      })
      .eq('menter_id', user.id)

    return NextResponse.json({
      subscription_id: preapproval.id,
      init_point:      preapproval.init_point,
      trial_ends_at:   trialEnds.toISOString(),
    })

  } catch (err: any) {
    console.error('[create-subscription] MP error:', err)
    return NextResponse.json({ error: 'Error al crear suscripción con MercadoPago' }, { status: 500 })
  }
}
