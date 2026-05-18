import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { session_token } = await req.json()
  if (!session_token) return NextResponse.json({ error: 'Missing session_token' }, { status: 400 })

  const { data: session } = await admin
    .from('assessment_sessions')
    .select('id')
    .eq('session_token', session_token)
    .single()

  if (!session?.id) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  await admin
    .from('assessment_results')
    .update({ persona_id: user.id })
    .eq('session_id', session.id)
    .is('persona_id', null)

  return NextResponse.json({ ok: true })
}