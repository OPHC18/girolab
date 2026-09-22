// src/app/api/paypal/capture-order/route.ts
// Captura el pago y acredita los créditos al usuario

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPayPalToken } from '@/lib/paypal'
import { createSupabaseAdmin } from '@/lib/supabase-server'

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
const PAYPAL_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { order_id } = await req.json()
  if (!order_id) return NextResponse.json({ error: 'Falta order_id' }, { status: 400 })

  const token = await getPayPalToken()

  // Capturar el pago
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${order_id}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `PayPal error: ${err}` }, { status: 500 })
  }

  const capture = await res.json()
  if (capture.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Pago no completado' }, { status: 400 })
  }

  // Leer custom_id para obtener créditos
  const customId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id
  let creditos = 0
  let packId = ''
  try {
    const parsed = JSON.parse(customId)
    // Verificar que el user_id coincide
    if (parsed.user_id !== user.id) {
      return NextResponse.json({ error: 'Usuario no coincide' }, { status: 403 })
    }
    creditos = parsed.creditos
    packId = parsed.pack_id
  } catch {
    return NextResponse.json({ error: 'custom_id inválido' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  // Acreditar de forma atómica (evita perder créditos si hay capturas simultáneas)
  const { data: nuevosCreditos, error: creditoError } = await supabase.rpc('ajustar_creditos', {
    p_user_id: user.id,
    p_delta:   creditos,
  })

  if (creditoError) {
    console.error('[capture-order] No se pudieron acreditar los créditos:', creditoError)
    return NextResponse.json({ error: 'No se pudieron acreditar los créditos' }, { status: 500 })
  }

  // Registrar la compra
  await supabase.from('instrumento_compras').insert({
    empresa_id: user.id,
    pack_id: packId,
    creditos_comprados: creditos,
    paypal_order_id: order_id,
    monto_usd: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
  })

  return NextResponse.json({ ok: true, creditos_nuevos: nuevosCreditos })
}
