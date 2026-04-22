import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  if (!ADMIN_EMAILS.includes(user.email!)) {
    const { data: staffRow } = await admin.from('staff_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (!staffRow) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const [paymentsRes, membershipsRes, authRes] = await Promise.all([
    admin.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
    admin.from('menter_memberships').select('*').order('updated_at', { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const userByEmail: Record<string, { nombre: string }> = {}
  const userById: Record<string, { email: string; nombre: string }> = {}
  authRes.data?.users?.forEach((u: any) => {
    if (u.email) userByEmail[u.email.toLowerCase()] = { nombre: u.user_metadata?.nombre || '' }
    userById[u.id] = { email: u.email || '', nombre: u.user_metadata?.nombre || '' }
  })

  const memberships = (membershipsRes.data || []).map((m: any) => ({
    ...m,
    email: userById[m.menter_id]?.email || '',
    nombre: userById[m.menter_id]?.nombre || '',
  }))

  const payments = (paymentsRes.data || []).map((p: any) => ({
    ...p,
    payer_nombre: p.payer_email ? (userByEmail[p.payer_email.toLowerCase()]?.nombre || '') : '',
  }))

  return NextResponse.json({ payments, memberships })
}
