// src/app/api/mp/webhook/route.ts
// Webhook unificado para todas las notificaciones de MercadoPago
// Maneja: payments (sesiones y eventos) + subscription_preapproval (membresías Menter)

import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { mpPayment, mpPreApproval, parseRef } from '@/lib/mercadopago'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { emailPagoConfirmadoCita, emailSuscripcionActivada, emailPlanRebajado } from '@/lib/email'

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || ''

/**
 * Valida la firma HMAC-SHA256 que MercadoPago envía en el header x-signature.
 * Docs: https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks
 */
function validateMPSignature(req: NextRequest, dataId: string): boolean {
  if (!WEBHOOK_SECRET) return false

  // Validación mediante firma HMAC (método preferido de MercadoPago)
  const xSignature  = req.headers.get('x-signature')
  const xRequestId  = req.headers.get('x-request-id')

  if (!xSignature || !xRequestId) return false

  // Extraer ts y v1 del header x-signature: "ts=...,v1=..."
  const parts: Record<string, string> = {}
  xSignature.split(',').forEach(part => {
    const [key, value] = part.split('=')
    if (key && value) parts[key.trim()] = value.trim()
  })

  const { ts, v1 } = parts
  if (!ts || !v1) return false

  // Rechazar mensajes con más de 5 minutos de antigüedad (replay attack)
  if (Math.abs(Date.now() - Number(ts) * 1000) > 5 * 60 * 1000) return false

  // Construir el manifest para la firma
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const computed  = createHmac('sha256', WEBHOOK_SECRET).update(manifest).digest('hex')

  return computed === v1
}

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const type   = body?.type   || body?.action?.split('.')[0] || ''
  const dataId = body?.data?.id?.toString() || ''

  if (!dataId) return NextResponse.json({ ok: true })

  // Validar firma de MercadoPago
  if (!validateMPSignature(req, dataId)) {
    console.warn('[webhook] firma inválida — dataId:', dataId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()

  try {
    // ── PAGO ÚNICO (sesiones y eventos) ──────────────────────────────────────
    if (type === 'payment') {
      const payment = await mpPayment.get({ id: dataId })
      const status  = payment.status
      const extRef  = payment.external_reference || ''
      const { type: refType, parts } = parseRef(extRef)
      const referenceId = parts[0]
      const paidAmount  = payment.transaction_amount ?? 0

      // Idempotencia: evitar procesar el mismo pago dos veces
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('mp_payment_id', dataId)
        .maybeSingle()

      if (!existing) {
        await supabase.from('payments').insert({
          mp_payment_id:      dataId,
          mp_status:          status,
          mp_status_detail:   payment.status_detail,
          type:               refType,
          reference_id:       referenceId || null,
          amount:             paidAmount,
          currency:           payment.currency_id,
          payer_email:        payment.payer?.email || null,
          external_reference: extRef,
          raw_payload:        payment as any,
        })
      } else {
        await supabase.from('payments')
          .update({ mp_status: status, mp_status_detail: payment.status_detail })
          .eq('mp_payment_id', dataId)
      }

      if (status === 'approved') {
        // ── Cita / Sesión ──
        if (refType === 'appointment' && referenceId) {
          // Validar que el monto pagado corresponde al precio en BD (protección contra manipulación)
          const { data: apt } = await supabase
            .from('appointments')
            .select('id, price, client_name, menter_name, date, start_time, modality, payment_status')
            .eq('id', referenceId)
            .single()

          if (!apt) {
            console.error('[webhook] cita no encontrada:', referenceId)
            return NextResponse.json({ ok: true })
          }

          const expectedAmount = Number(apt.price)
          if (paidAmount < expectedAmount * 0.99) {
            console.error(`[webhook] monto pagado (${paidAmount}) menor al esperado (${expectedAmount}) — cita ${referenceId}`)
            return NextResponse.json({ ok: true }) // No confirmar pago insuficiente
          }

          if (apt.payment_status !== 'pagado') {
            const { data: aptUpdated } = await supabase
              .from('appointments')
              .update({ payment_status: 'pagado' })
              .eq('id', referenceId)
              .select('*, client:client_id(email)')
              .single()

            if (aptUpdated) {
              try {
                const clientEmail = (aptUpdated as any).client?.email || (aptUpdated as any).client_email
                if (clientEmail) {
                  await emailPagoConfirmadoCita({
                    clientName:  aptUpdated.client_name,
                    clientEmail,
                    menterName:  aptUpdated.menter_name,
                    fecha:       aptUpdated.date,
                    hora:        aptUpdated.start_time,
                    modalidad:   aptUpdated.modality,
                    precio:      aptUpdated.price,
                  })
                }
              } catch (e) { console.error('[webhook] email pago cita:', e) }
            }
          }
        }

        // ── Registro de evento ──
        if (refType === 'event_reg' && referenceId) {
          const { data: reg } = await supabase
            .from('event_registrations')
            .select('id, total_price, payment_status')
            .eq('id', referenceId)
            .single()

          if (reg && reg.payment_status !== 'pagado') {
            const expectedAmount = Number(reg.total_price)
            if (paidAmount < expectedAmount * 0.99) {
              console.error(`[webhook] monto pagado (${paidAmount}) menor al esperado (${expectedAmount}) — evento ${referenceId}`)
              return NextResponse.json({ ok: true })
            }
            await supabase
              .from('event_registrations')
              .update({ payment_status: 'pagado' })
              .eq('id', referenceId)
          }
        }
      }

      if (status === 'rejected') {
        if (refType === 'appointment' && referenceId) {
          await supabase
            .from('appointments')
            .update({ payment_status: 'pendiente', status: 'pendiente' })
            .eq('id', referenceId)
        }
        if (refType === 'event_reg' && referenceId) {
          await supabase
            .from('event_registrations')
            .update({ payment_status: 'pendiente' })
            .eq('id', referenceId)
        }
      }
    }

    // ── SUBSCRIPCIÓN (membresías Menter) ─────────────────────────────────────
    if (type === 'subscription_preapproval' || body?.action?.startsWith('subscription_preapproval')) {
      const subscription = await mpPreApproval.get({ id: dataId })
      const mpStatus     = subscription.status
      const extRef       = subscription.external_reference || ''
      const { parts }    = parseRef(extRef)
      const menterId     = parts[0]

      if (!menterId) {
        console.error('[webhook] subscription sin menterId en external_reference')
        return NextResponse.json({ ok: true })
      }

      if (mpStatus === 'authorized') {
        await supabase.from('menter_memberships')
          .update({
            is_active:          true,
            mp_subscription_id: dataId,
            updated_at:         new Date().toISOString(),
          })
          .eq('menter_id', menterId)

        try {
          const { data: menterData } = await supabase.auth.admin.getUserById(menterId)
          const menterEmail = menterData?.user?.email
          const menterName  = menterData?.user?.user_metadata?.nombre || 'Menter'
          const { data: membershipData } = await supabase
            .from('menter_memberships')
            .select('plan, trial_ends_at')
            .eq('menter_id', menterId)
            .single()
          if (menterEmail) {
            await emailSuscripcionActivada({
              menterEmail,
              menterName,
              plan:      membershipData?.plan || parts[1] || 'starter',
              trialEnds: membershipData?.trial_ends_at || undefined,
            })
          }
        } catch (e) { console.error('[webhook] email suscripcion error:', e) }
      }

      if (mpStatus === 'paused') {
        await supabase.from('menter_memberships')
          .update({
            plan:             'free',
            is_active:        false,
            downgrade_reason: 'payment_failed',
            updated_at:       new Date().toISOString(),
          })
          .eq('menter_id', menterId)

        try {
          const { data: menterData } = await supabase.auth.admin.getUserById(menterId)
          const menterEmail = menterData?.user?.email
          const menterName  = menterData?.user?.user_metadata?.nombre || 'Menter'
          if (menterEmail) {
            await emailPlanRebajado({ menterEmail, menterName, razon: 'payment_failed' })
          }
        } catch (e) { console.error('[webhook] email downgrade error:', e) }
      }

      if (mpStatus === 'cancelled') {
        await supabase.from('menter_memberships')
          .update({
            plan:               'free',
            is_active:          false,
            downgrade_reason:   'cancelled',
            mp_subscription_id: null,
            updated_at:         new Date().toISOString(),
          })
          .eq('menter_id', menterId)
      }
    }

  } catch (err) {
    console.error('[webhook] error procesando evento MP:', err)
  }

  return NextResponse.json({ ok: true })
}
