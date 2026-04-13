// src/app/api/mp/verify-redirect/route.ts
// Verificación de pago por redirect (fallback del webhook).
// MP envía payment_id en la URL de retorno — lo usamos para actualizar la DB
// si el webhook aún no llegó (típico en desarrollo local sin ngrok).

import { NextRequest, NextResponse } from 'next/server'
import { mpPayment, parseRef } from '@/lib/mercadopago'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { emailPagoConfirmadoCita, emailConfirmacionEvento } from '@/lib/email'

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id')
  if (!paymentId || paymentId === 'null') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  try {
    const payment = await mpPayment.get({ id: paymentId })
    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true, status: payment.status })
    }

    const extRef = payment.external_reference || ''
    const { type: refType, parts } = parseRef(extRef)
    const referenceId = parts[0]
    if (!referenceId) return NextResponse.json({ ok: true, skipped: true })

    const supabase = createSupabaseAdmin()

    // Idempotencia: si el webhook ya procesó este pago, no hacer nada
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('mp_payment_id', paymentId)
      .maybeSingle()

    if (existing) return NextResponse.json({ ok: true, already_processed: true })

    // Registrar en payments
    await supabase.from('payments').insert({
      mp_payment_id:      paymentId,
      mp_status:          payment.status,
      mp_status_detail:   payment.status_detail,
      type:               refType,
      reference_id:       referenceId,
      amount:             payment.transaction_amount ?? 0,
      currency:           payment.currency_id,
      payer_email:        payment.payer?.email || null,
      external_reference: extRef,
      raw_payload:        payment as any,
    })

    // Actualizar la entidad correspondiente
    if (refType === 'appointment') {
      const { data: apt } = await supabase
        .from('appointments')
        .select('id, client_id, client_name, menter_name, date, start_time, price, modality, payment_status')
        .eq('id', referenceId)
        .single()

      if (apt && apt.payment_status !== 'pagado') {
        await supabase
          .from('appointments')
          .update({ payment_status: 'pagado' })
          .eq('id', referenceId)

        // Email de confirmación
        try {
          const { data: clientData } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', apt.client_id)
            .single()
          if (clientData?.email) {
            await emailPagoConfirmadoCita({
              clientName:  apt.client_name || '',
              clientEmail: clientData.email,
              menterName:  apt.menter_name,
              fecha:       apt.date,
              hora:        apt.start_time,
              modalidad:   apt.modality || 'online',
              precio:      Number(apt.price),
            })
          }
        } catch { /* email no crítico */ }
      }
    }

    if (refType === 'event_reg') {
      const { data: regData } = await supabase
        .from('event_registrations')
        .select('id, user_id, quantity, total_price, ticket_id, payment_status, event:event_id(id, title, date, start_time, location_address, meeting_link, modality), ticket:ticket_id(name)')
        .eq('id', referenceId)
        .single()

      if (regData && regData.payment_status !== 'pagado') {
        await supabase
          .from('event_registrations')
          .update({ payment_status: 'pagado' })
          .eq('id', referenceId)

        // Email de confirmación
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(regData.user_id)
          const evento = regData.event as any
          const ticket = regData.ticket as any
          if (userData?.user?.email && evento) {
            const fechaFormato = new Date(evento.date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
            await emailConfirmacionEvento({
              clientName:     userData.user.user_metadata?.nombre || userData.user.email,
              clientEmail:    userData.user.email,
              eventoTitulo:   evento.title,
              eventoFecha:    fechaFormato,
              eventoHora:     evento.start_time || '',
              eventoLugar:    evento.location_address || evento.meeting_link || 'Por confirmar',
              modalidad:      evento.modality || 'presencial',
              tipoEntrada:    ticket?.name || 'Entrada',
              cantidad:       regData.quantity || 1,
              precioTotal:    regData.total_price || 0,
              registrationId: regData.id,
              eventoId:       evento.id,
            })
          }
        } catch { /* email no crítico */ }
      }
    }

    return NextResponse.json({ ok: true, updated: refType })
  } catch (e) {
    console.error('[verify-redirect]', e)
    return NextResponse.json({ ok: true, error: String(e) })
  }
}
