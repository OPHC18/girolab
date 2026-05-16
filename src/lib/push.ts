import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = req.headers.get('x-internal-secret')
  if (secret && secret === process.env.INTERNAL_API_SECRET) return true
  const token = (req.headers.get('authorization') || '').slice(7)
  if (!token) return false
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  return !!(user)
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { user_id, title, body, url } = await req.json()
  if (!title) return NextResponse.json({ error: 'Falta title' }, { status: 400 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  let userIds: string[] = []

  if (user_id) {
    // Notificar a un usuario específico
    userIds = [user_id]
  } else {
    // Sin user_id → notificar solo a admins (comportamiento original)
    await Promise.all(ADMIN_EMAILS.map(async email => {
      try {
        const { data } = await (admin.auth.admin as any).getUserByEmail(email)
        if (data?.user?.id) userIds.push(data.user.id)
      } catch {}
    }))
  }

  if (userIds.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('user_id, subscription')
    .in('user_id', userIds)

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  let sent = 0
  await Promise.all(subs.map(async (row: any) => {
    try {
      await webpush.sendNotification(
        row.subscription,
        JSON.stringify({ title, body: body || '', url: url || '/' })
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