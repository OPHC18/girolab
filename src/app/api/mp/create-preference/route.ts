// src/app/api/mp/create-preference/route.ts
// Crea una preferencia de pago en MercadoPago para sesiones y eventos

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mpPreference, buildRef } from '@/lib/mercadopago'
import { createSupabaseAdmin } from '@/lib/supabase-server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
const WEBHOOK  = `${APP_URL}/api/mp/webhook?secret=${process.env.MP_WEBHOOK_SECRET}`

export async function POST(req: NextRequest) {
  // Autenticar usuario con cookie de sesión
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { type, id } = body as { type: 'appointment' | 'event_reg'; id: string }

  if (!type || !id) return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })

  const supabase = createSupabaseAdmin()

  // ── Cita / Sesión ──────────────────────────────────────────────────────────
  if (type === 'appointment') {
    const { data: apt, error } = await supabase
      .from('appointments')
      .select('id, client_id, menter_name, price, date, start_time, payment_status, mp_preference_id')
      .eq('id', id)
      .single()

    if (error || !apt) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    if (apt.client_id !== user.id) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    if (apt.payment_status === 'pagado') return NextResponse.json({ error: 'Ya pagado' }, { status: 400 })

    // Reutilizar preferencia si ya existe
    if (apt.mp_preference_id) {
      return NextResponse.json({ preference_id: apt.mp_preference_id })
    }

    const precio = Number(apt.price) || 0
    if (precio <= 0) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })

    const pref = await mpPreference.create({
      body: {
        items: [{
          id:          apt.id,
          title:       `Sesión con ${apt.menter_name}`,
          description: `${apt.date} a las ${apt.start_time}`,
          quantity:    1,
          unit_price:  precio,
          currency_id: 'USD',
        }],
        external_reference: buildRef('appointment', apt.id),
        back_urls: {
          success: `${APP_URL}/pago/exitoso?tipo=cita`,
          failure: `${APP_URL}/pago/error?tipo=cita&ref=${apt.id}`,
          pending: `${APP_URL}/pago/pendiente?tipo=cita`,
        },
        auto_return:      'approved',
        notification_url: WEBHOOK,
      }
    })

    // Guardar preference_id en la cita
    await supabase.from('appointments')
      .update({ mp_preference_id: pref.id })
      .eq('id', apt.id)

    return NextResponse.json({ preference_id: pref.id, init_point: pref.init_point })
  }

  // ── Registro de evento ────────────────────────────────────────────────────
  if (type === 'event_reg') {
    const { data: reg, error } = await supabase
      .from('event_registrations')
      .select('id, user_id, total_price, payment_status, mp_preference_id, event:event_id(title, date)')
      .eq('id', id)
      .single()

    if (error || !reg) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
    if (reg.user_id !== user.id) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    if (reg.payment_status === 'pagado') return NextResponse.json({ error: 'Ya pagado' }, { status: 400 })

    if (reg.mp_preference_id) {
      return NextResponse.json({ preference_id: reg.mp_preference_id })
    }

    const precio = Number(reg.total_price) || 0
    if (precio <= 0) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })

    const evento = reg.event as any
    const pref = await mpPreference.create({
      body: {
        items: [{
          id:          reg.id,
          title:       `Entrada: ${evento?.title || 'Evento'}`,
          description: evento?.date || '',
          quantity:    1,
          unit_price:  precio,
          currency_id: 'USD',
        }],
        external_reference: buildRef('event_reg', reg.id),
        back_urls: {
          success: `${APP_URL}/pago/exitoso?tipo=evento`,
          failure: `${APP_URL}/pago/error?tipo=evento&ref=${reg.id}`,
          pending: `${APP_URL}/pago/pendiente?tipo=evento`,
        },
        auto_return:      'approved',
        notification_url: WEBHOOK,
      }
    })

    await supabase.from('event_registrations')
      .update({ mp_preference_id: pref.id })
      .eq('id', reg.id)

    return NextResponse.json({ preference_id: pref.id, init_point: pref.init_point })
  }

  return NextResponse.json({ error: 'Tipo no soportado' }, { status: 400 })
}
