// POST /api/admin/set-promo
// Da acceso manual a un plan por N días a un Menter específico (trial manual o promoción).
// Actualiza directamente menter_memberships sin pasar por PayPal.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_PLANS = ['starter', 'premium', 'master']

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { menterId, plan, dias, nota } = body

  if (!menterId || !UUID_RE.test(menterId)) {
    return NextResponse.json({ error: 'menterId inválido' }, { status: 400 })
  }
  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }
  if (!dias || typeof dias !== 'number' || dias < 1 || dias > 365) {
    return NextResponse.json({ error: 'dias debe ser entre 1 y 365' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const trialEndsAt = new Date(Date.now() + dias * 86_400_000).toISOString()
  const now = new Date().toISOString()

  const { error } = await admin
    .from('menter_memberships')
    .update({
      plan,
      trial_ends_at:   trialEndsAt,
      is_active:       true,
      promo_nota:      nota?.trim() || `Trial manual ${dias}d — activado por admin`,
      downgrade_reason: null,
      updated_at:      now,
    })
    .eq('menter_id', menterId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, trial_ends_at: trialEndsAt })
}
