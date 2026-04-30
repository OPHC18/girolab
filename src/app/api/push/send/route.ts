import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = req.headers.get('x-internal-secret')
  if (secret && secret === process.env.INTERNAL_API_SECRET) return true
  const token = (req.headers.get('authorization') || '').slice(7)
  if (!token) return false
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  return !!user
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { user_id, title, body, url } = await req.json()
  if (!user_id || !title) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', user_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Sin suscripción' }, { status: 404 })

  try {
    await webpush.sendNotification(
      data.subscription,
      JSON.stringify({ title, body, url: url || '/dashboard' })
    )
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    // Si la suscripción expiró, la eliminamos
    if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
      await supabase.from('push_subscriptions').delete().eq('user_id', user_id)
    }
    return NextResponse.json({ error: 'Error enviando notificación' }, { status: 500 })
  }
}
