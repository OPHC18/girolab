import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60 // cache 1 min

export async function GET() {
  const now = new Date().toISOString()
  const { data } = await admin
    .from('promos')
    .select('id, nombre, tipo, trial_dias, aplica_plan, expires_at')
    .eq('is_active', true)
    .lte('starts_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return NextResponse.json({ promo: null })
  return NextResponse.json({ promo: data })
}
