// src/app/api/paypal/create-subscription/route.ts
// Crea una suscripción PayPal para membresías Menter con 15 días de prueba gratuita.
// Flujo: crea/obtiene producto → crea/obtiene plan → crea suscripción → devuelve approveUrl

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import {
  PLAN_PRICES,
  createOrGetProduct,
  createPayPalPlan,
  createSubscription,
} from '@/lib/paypal'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

// Plan IDs pre-creados en PayPal (se guardan en env para evitar crearlos en cada deploy)
const PLAN_IDS: Record<string, string | undefined> = {
  starter_monthly: process.env.PAYPAL_PLAN_ID_STARTER_MONTHLY,
  starter_annual:  process.env.PAYPAL_PLAN_ID_STARTER_ANNUAL,
  premium_monthly: process.env.PAYPAL_PLAN_ID_PREMIUM_MONTHLY,
  premium_annual:  process.env.PAYPAL_PLAN_ID_PREMIUM_ANNUAL,
}

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
    .select('plan, paypal_subscription_id, is_active')
    .eq('menter_id', user.id)
    .single()

  if (membership?.paypal_subscription_id && membership?.is_active && membership?.plan !== 'free') {
    return NextResponse.json({
      error: 'Ya tienes una suscripción activa. Cancela la actual antes de cambiar de plan.',
    }, { status: 409 })
  }

  try {
    // Obtener o crear plan PayPal
    const planKey = `${plan}_${billing_cycle}`
    let planId = PLAN_IDS[planKey]

    if (!planId) {
      const productId = await createOrGetProduct()
      planId = await createPayPalPlan({ productId, plan, billingCycle: billing_cycle })
    }

    // Calcular trial end
    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 15)

    // Crear suscripción
    const { id: subscriptionId, approveUrl } = await createSubscription({
      planId,
      email:     user.email!,
      returnUrl: `${APP_URL}/dashboard?tab=membresia&pp=ok`,
      cancelUrl: `${APP_URL}/dashboard?tab=membresia`,
      userId:    user.id,
      plan,
      cycle:     billing_cycle,
    })

    // Guardar en BD como pendiente (se activa con webhook BILLING.SUBSCRIPTION.ACTIVATED)
    await supabase.from('menter_memberships')
      .update({
        plan,
        billing_cycle,
        paypal_subscription_id: subscriptionId,
        trial_ends_at:  trialEnds.toISOString(),
        starts_at:      new Date().toISOString(),
        expires_at:     null,
        downgrade_reason: null,
        updated_at:     new Date().toISOString(),
        // is_active se pone en true cuando PayPal confirma via webhook
      })
      .eq('menter_id', user.id)

    return NextResponse.json({
      subscription_id: subscriptionId,
      approve_url:     approveUrl,
      trial_ends_at:   trialEnds.toISOString(),
    })

  } catch (err: any) {
    const msg = err?.message || 'Error desconocido'
    const detail = err?.data ? JSON.stringify(err.data) : ''
    console.error('[paypal/create-subscription] error:', msg, detail)
    // Detectar problemas comunes de configuración
    if (msg.includes('auth') || msg.includes('401') || msg.includes('credentials')) {
      return NextResponse.json({ error: 'Credenciales PayPal inválidas o no configuradas en Vercel' }, { status: 500 })
    }
    return NextResponse.json({ error: `Error PayPal: ${msg}` }, { status: 500 })
  }
}
