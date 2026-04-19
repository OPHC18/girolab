import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-internal-secret')
  if (auth !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { title, body, url } = await req.json()
  if (!title) return NextResponse.json({ error: 'Falta title' }, { status: 400 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Resolve admin user IDs from their emails
  const adminUserIds = new Set<string>()
  await Promise.all(ADMIN_EMAILS.map(async email => {
    try {
      const { data } = await admin.auth.admin.getUserByEmail(email)
      if (data?.user?.id) adminUserIds.add(data.user.id)
    } catch {}
  }))

  if (adminUserIds.size === 0) return NextResponse.json({ ok: true, sent: 0 })

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('user_id, subscription')
    .in('user_id', Array.from(adminUserIds))

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  let sent = 0
  await Promise.all(subs.map(async (row: any) => {
    try {
      await webpush.sendNotification(
        row.subscription,
        JSON.stringify({ title, body: body || '', url: url || '/admin' })
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
