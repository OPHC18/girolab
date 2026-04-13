// src/lib/paypal.ts
// Cliente PayPal + helpers para Giro Lab
// Usamos la REST API directamente (fetch) para máxima compatibilidad con Next.js edge/server

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'
const BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const CLIENT_ID = PAYPAL_MODE === 'live'
  ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE!
  : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX!

const SECRET = PAYPAL_MODE === 'live'
  ? process.env.PAYPAL_SECRET_LIVE!
  : process.env.PAYPAL_SECRET_SANDBOX!

// ── Access token (cached en memoria, expira en ~9h) ──────────────────────────
let _token: string | null = null
let _tokenExpiry = 0

export async function getPayPalToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal auth error: ${err}`)
  }

  const data = await res.json()
  _token = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _token!
}

async function paypalFetch(path: string, options: RequestInit = {}) {
  const token = await getPayPalToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw Object.assign(new Error(json.message || 'PayPal error'), { status: res.status, data: json })
  return json
}

// ── Precios por plan (USD) ────────────────────────────────────────────────────
export const PLAN_PRICES: Record<string, { monthly: number; annual: number; label: string }> = {
  starter: { monthly: 20.00, annual: 216.00, label: 'Starter' },
  premium: { monthly: 28.00, annual: 303.00, label: 'Premium' },
}

// ── Productos y Planes PayPal ─────────────────────────────────────────────────
// Los IDs de producto/plan se crean una vez y se reutilizan.
// En sandbox los creamos dinámicamente. En producción se guardan en env.

export async function createOrGetProduct(): Promise<string> {
  // En producción usar PAYPAL_PRODUCT_ID si ya existe
  if (process.env.PAYPAL_PRODUCT_ID) return process.env.PAYPAL_PRODUCT_ID

  const product = await paypalFetch('/v1/catalogs/products', {
    method: 'POST',
    body: JSON.stringify({
      name:        'Giro Lab — Membresía Menter',
      description: 'Acceso a la plataforma Giro Lab para Menters',
      type:        'SERVICE',
      category:    'SOFTWARE',
    }),
  })
  return product.id
}

export async function createPayPalPlan(params: {
  productId: string
  plan: 'starter' | 'premium'
  billingCycle: 'monthly' | 'annual'
}): Promise<string> {
  const price = PLAN_PRICES[params.plan]
  const amount = params.billingCycle === 'annual' ? price.annual : price.monthly
  const intervalCount = params.billingCycle === 'annual' ? 12 : 1

  const ppPlan = await paypalFetch('/v1/billing/plans', {
    method: 'POST',
    body: JSON.stringify({
      product_id:  params.productId,
      name:        `Giro Lab ${price.label} — ${params.billingCycle === 'annual' ? 'Anual' : 'Mensual'}`,
      status:      'ACTIVE',
      billing_cycles: [
        // Trial gratuito 15 días
        {
          frequency:     { interval_unit: 'DAY', interval_count: 15 },
          tenure_type:   'TRIAL',
          sequence:      1,
          total_cycles:  1,
          pricing_scheme: { fixed_price: { value: '0', currency_code: 'USD' } },
        },
        // Ciclo regular
        {
          frequency:     { interval_unit: 'MONTH', interval_count: intervalCount },
          tenure_type:   'REGULAR',
          sequence:      2,
          total_cycles:  0, // 0 = indefinido
          pricing_scheme: { fixed_price: { value: amount.toFixed(2), currency_code: 'USD' } },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding:     true,
        setup_fee_failure_action:  'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })
  return ppPlan.id
}

export async function createSubscription(params: {
  planId:    string
  email:     string
  returnUrl: string
  cancelUrl: string
  userId:    string
  plan:      string
  cycle:     string
}): Promise<{ id: string; approveUrl: string }> {
  const sub = await paypalFetch('/v1/billing/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id:     params.planId,
      subscriber:  { email_address: params.email },
      custom_id:   `${params.userId}:${params.plan}:${params.cycle}`,
      application_context: {
        brand_name:          'Giro Lab',
        locale:              'es-PE',
        shipping_preference: 'NO_SHIPPING',
        user_action:         'SUBSCRIBE_NOW',
        return_url:          params.returnUrl,
        cancel_url:          params.cancelUrl,
      },
    }),
  })

  const approveLink = sub.links?.find((l: any) => l.rel === 'approve')
  return { id: sub.id, approveUrl: approveLink?.href || '' }
}

export async function cancelSubscription(subscriptionId: string, reason = 'Cancelado por el usuario'): Promise<void> {
  await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export async function getSubscription(subscriptionId: string): Promise<any> {
  return paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`)
}
