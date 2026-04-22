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
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const [paymentsRes, membershipsRes, authRes] = await Promise.all([
    admin.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
    admin.from('menter_memberships').select('*').order('updated_at', { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const userMap: Record<string, { email: string; nombre: string }> = {}
  authRes.data?.users?.forEach((u: any) => {
    userMap[u.id] = { email: u.email || '', nombre: u.user_metadata?.nombre || '' }
  })

  const memberships = (membershipsRes.data || []).map((m: any) => ({
    ...m,
    email: userMap[m.menter_id]?.email || '',
    nombre: userMap[m.menter_id]?.nombre || '',
  }))

  return NextResponse.json({ payments: paymentsRes.data || [], memberships })
}
