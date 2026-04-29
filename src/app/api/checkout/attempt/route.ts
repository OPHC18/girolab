import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { plan, billing_cycle } = await req.json()

  const authUser = await admin.auth.admin.getUserById(user.id)
  const nombre = authUser.data.user?.user_metadata?.nombre || ''
  const email = user.email || ''

  // Upsert: si ya tiene un intento initiated reciente (< 10min), reutiliza
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: existing } = await admin
    .from('checkout_attempts')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'initiated')
    .gte('created_at', cutoff)
    .maybeSingle()

  if (existing) {
    await admin.from('checkout_attempts').update({ plan, billing_cycle }).eq('id', existing.id)
    return NextResponse.json({ ok: true })
  }

  await admin.from('checkout_attempts').insert({ user_id: user.id, email, nombre, plan, billing_cycle })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await admin
    .from('checkout_attempts')
    .update({ status: 'completed' })
    .eq('user_id', user.id)
    .eq('status', 'initiated')

  return NextResponse.json({ ok: true })
}
