// src/lib/mercadopago.ts
// MercadoPago SDK — cliente singleton + helpers para Giro Lab

import { MercadoPagoConfig, Preference, PreApproval, Payment } from 'mercadopago'

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export const mpPreference = new Preference(mpClient)
export const mpPreApproval = new PreApproval(mpClient)
export const mpPayment     = new Payment(mpClient)

// ── Precios por plan (USD) ────────────────────────────────────────────────────
export const PLAN_PRICES: Record<string, { monthly: number; annual: number; label: string }> = {
  starter: { monthly: 20.00, annual: 216.00, label: 'Starter' },
  premium: { monthly: 28.00, annual: 303.00, label: 'Premium' },
}

// ── external_reference helpers ───────────────────────────────────────────────
export function buildRef(type: 'appointment' | 'event_reg' | 'subscription', ...parts: string[]) {
  return [type, ...parts].join(':')
}

export function parseRef(ref: string): { type: string; parts: string[] } {
  const [type, ...parts] = ref.split(':')
  return { type, parts }
}

