import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-internal-secret')
  if (auth !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { title, body, url } = await req.json()
  if (!title) return NextResponse.json({ error: 'Falta title' }, { status: 400 })

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('user_id, subscription')

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  let sent = 0
  await Promise.all(subs.map(async (row: any) => {
    try {
      await webpush.sendNotification(
        row.subscription,
        JSON.stringify({ title, body: body || '', url: url || '/dashboard' })
      )
      sent++
    } catch (err: any) {
      if (err?.statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('user_id', row.user_id)
      }
    }
  }))

  return NextResponse.json({ ok: true, sent })
}
