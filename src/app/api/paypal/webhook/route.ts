// src/app/api/paypal/webhook/route.ts
// Webhook unificado para notificaciones de PayPal Subscriptions
// Maneja: BILLING.SUBSCRIPTION.ACTIVATED | CANCELLED | SUSPENDED | EXPIRED
//         PAYMENT.SALE.COMPLETED | PAYMENT.SALE.DENIED

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getPayPalToken } from '@/lib/paypal'
import { emailSuscripcionActivada, emailPlanRebajado } from '@/lib/email'

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || ''

/**
 * Verifica la firma del webhook usando la API de PayPal.
 * Docs: https://developer.paypal.com/api/rest/webhooks/rest/
 */
async function verifyPayPalWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  if (!WEBHOOK_ID) {
    console.warn('[paypal/webhook] PAYPAL_WEBHOOK_ID no configurado — omitiendo verificación')
    return true // En desarrollo, aceptar sin verificar
  }

  try {
    const token = await getPayPalToken()
    const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
    const BASE_URL = PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const res = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo:         req.headers.get('paypal-auth-algo'),
        cert_url:          req.headers.get('paypal-cert-url'),
        transmission_id:   req.headers.get('paypal-transmission-id'),
        transmission_sig:  req.headers.get('paypal-transmission-sig'),
        transmission_time: req.headers.get('paypal-transmission-time'),
        webhook_id:        WEBHOOK_ID,
        webhook_event:     JSON.parse(rawBody),
      }),
    })

    const data = await res.json()
    return data.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('[paypal/webhook] error verificando firma:', err)
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const valid = await verifyPayPalWebhook(req, rawBody)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: true })
  }

  const eventType     = event?.event_type || ''
  const resource      = event?.resource || {}
  const subscriptionId = resource?.id || resource?.billing_agreement_id || ''

  if (!subscriptionId) return NextResponse.json({ ok: true })

  const supabase = createSupabaseAdmin()

  try {
    // ── SUSCRIPCIÓN ACTIVADA ────────────────────────────────────────────────
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const { data: membership } = await supabase
        .from('menter_memberships')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)
        .select('menter_id, plan, trial_ends_at')
        .single()

      if (membership) {
        try {
          const { data: menterData } = await supabase.auth.admin.getUserById(membership.menter_id)
          const menterEmail = menterData?.user?.email
          const menterName  = menterData?.user?.user_metadata?.nombre || 'Menter'
          if (menterEmail) {
            await emailSuscripcionActivada({
              menterEmail,
              menterName,
              plan:      membership.plan,
              trialEnds: membership.trial_ends_at || undefined,
            })
          }
        } catch (e) { console.error('[paypal/webhook] email suscripcion:', e) }
      }
    }

    // ── SUSCRIPCIÓN CANCELADA ───────────────────────────────────────────────
    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const { data: membership } = await supabase
        .from('menter_memberships')
        .update({
          plan:                   'free',
          is_active:              false,
          paypal_subscription_id: null,
          downgrade_reason:       'cancelled',
          updated_at:             new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)
        .select('menter_id')
        .single()

      if (membership) {
        try {
          const { data: menterData } = await supabase.auth.admin.getUserById(membership.menter_id)
          const menterEmail = menterData?.user?.email
          const menterName  = menterData?.user?.user_metadata?.nombre || 'Menter'
          if (menterEmail) {
            await emailPlanRebajado({ menterEmail, menterName, razon: 'cancelled' })
          }
        } catch (e) { console.error('[paypal/webhook] email cancelacion:', e) }
      }
    }

    // ── SUSCRIPCIÓN SUSPENDIDA (pago fallido) ───────────────────────────────
    if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
      const { data: membership } = await supabase
        .from('menter_memberships')
        .update({
          plan:             'free',
          is_active:        false,
          downgrade_reason: 'payment_failed',
          updated_at:       new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)
        .select('menter_id')
        .single()

      if (membership) {
        try {
          const { data: menterData } = await supabase.auth.admin.getUserById(membership.menter_id)
          const menterEmail = menterData?.user?.email
          const menterName  = menterData?.user?.user_metadata?.nombre || 'Menter'
          if (menterEmail) {
            await emailPlanRebajado({ menterEmail, menterName, razon: 'payment_failed' })
          }
        } catch (e) { console.error('[paypal/webhook] email suspension:', e) }
      }
    }

    // ── SUSCRIPCIÓN EXPIRADA ────────────────────────────────────────────────
    if (eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
      await supabase
        .from('menter_memberships')
        .update({
          plan:             'free',
          is_active:        false,
          downgrade_reason: 'expired',
          updated_at:       new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)
    }

    // ── PAGO COMPLETADO (idempotente, solo log) ─────────────────────────────
    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      const amount       = resource?.amount?.total || resource?.amount?.value || '0'
      const currency     = resource?.amount?.currency || resource?.amount?.currency_code || 'USD'
      const payerEmail   = resource?.payer?.payer_info?.email || ''

      await supabase.from('payments').upsert({
        mp_payment_id:    resource?.id || `pp_${Date.now()}`,
        mp_status:        'approved',
        type:             'subscription',
        reference_id:     subscriptionId,
        amount:           parseFloat(amount),
        currency,
        payer_email:      payerEmail,
        external_reference: subscriptionId,
        raw_payload:      event,
      }, { onConflict: 'mp_payment_id', ignoreDuplicates: true })
    }

  } catch (err) {
    console.error('[paypal/webhook] error procesando evento:', eventType, err)
  }

  return NextResponse.json({ ok: true })
}
