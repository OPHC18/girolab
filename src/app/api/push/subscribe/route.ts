import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUser(req: NextRequest) {
  const token = (req.headers.get('authorization') || '').slice(7)
  if (!token) return null
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  return user
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { subscription } = await req.json()
  if (!subscription) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert({ user_id: user.id, subscription }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
