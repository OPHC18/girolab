// src/app/api/paypal/create-order/route.ts
// Crea una orden PayPal de pago único para comprar créditos de instrumentos

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPayPalToken } from '@/lib/paypal'

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
const PAYPAL_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

// Packs de créditos disponibles
export const CREDIT_PACKS: Record<string, { creditos: number; precio: number; label: string }> = {
  pack_1:  { creditos: 1,  precio: 5,  label: '1 evaluación'  },
  pack_5:  { creditos: 5,  precio: 20, label: '5 evaluaciones' },
  pack_10: { creditos: 10, precio: 35, label: '10 evaluaciones' },
  pack_20: { creditos: 20, precio: 60, label: '20 evaluaciones' },
}

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
  const pack = CREDIT_PACKS[pack_id]
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
