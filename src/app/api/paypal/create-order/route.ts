// src/app/api/paypal/create-order/route.ts
// Crea una orden PayPal de pago único para comprar créditos de instrumentos

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPayPalToken } from '@/lib/paypal'
import { CREDIT_PACKS_BY_ID } from '@/lib/creditos'

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
const PAYPAL_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { pack_id } = await req.json()
  const pack = CREDIT_PACKS_BY_ID[pack_id]
  if (!pack) return NextResponse.json({ error: 'Pack inválido' }, { status: 400 })

  const token = await getPayPalToken()

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: pack.precio.toFixed(2),
        },
        description: `Giro Lab – ${pack.label}`,
        custom_id: JSON.stringify({ user_id: user.id, pack_id, creditos: pack.creditos }),
      }],
      application_context: {
        return_url: `${APP_URL}/dashboard?tab=instrumentos_empresa&pp=ok`,
        cancel_url: `${APP_URL}/dashboard?tab=instrumentos_empresa`,
        brand_name: 'Giro Lab',
        user_action: 'PAY_NOW',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `PayPal error: ${err}` }, { status: 500 })
  }

  const order = await res.json()
  const approveUrl = order.links?.find((l: any) => l.rel === 'approve')?.href

  return NextResponse.json({ order_id: order.id, approve_url: approveUrl })
}
