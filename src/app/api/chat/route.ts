import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/chat — crear chat o enviar mensaje
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'create_chat') {
    const { user_name, user_email, user_id, email_consent } = body
    const { data, error } = await admin
      .from('support_chats')
      .insert({ user_name, user_email, user_id: user_id || null, status: 'open', email_consent: !!email_consent })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ chat_id: data.id })
  }

  if (action === 'send_message') {
    const { chat_id, content, sender } = body
    if (!chat_id || !content || !sender) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    const { data, error } = await admin
      .from('support_messages')
      .insert({ chat_id, content, sender })
      .select('id, created_at')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // Actualizar updated_at del chat
    await admin.from('support_chats').update({ updated_at: new Date().toISOString() }).eq('id', chat_id)
    return NextResponse.json({ message_id: data.id, created_at: data.created_at })
  }

  if (action === 'request_human') {
    const { chat_id } = body
    await admin.from('support_chats').update({ status: 'needs_human', updated_at: new Date().toISOString() }).eq('id', chat_id)
    // Notificar admins
    const { data: subs } = await admin.from('push_subscriptions').select('user_id, subscription')
    const { data: adminUsers } = await admin.from('user_public_data').select('id').in('id',
      (subs || []).map((s: any) => s.user_id)
    )
    // Enviar a todos los admins que tengan push subscription
    // (simplificado: notificar a todos los suscriptores admin via notify-admins pattern)
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/notify-admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET! },
      body: JSON.stringify({ title: 'Chat de soporte', body: 'Un usuario solicita hablar con un asesor', url: '/admin?tab=soporte' }),
    }).catch(() => {})
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
}

// GET /api/chat?chat_id=xxx — obtener mensajes (admin o dueño)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chat_id = searchParams.get('chat_id')
  const all = searchParams.get('all') // solo admins

  if (all) {
    // Verificar que es admin o asesor
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
    const { data: chatsData } = await admin
      .from('support_chats')
      .select('*, support_messages(id, sender, content, created_at)')
      .order('updated_at', { ascending: false })
      .limit(500)

    // Enriquecer con is_registered
    const emails = (chatsData || []).map((c: any) => c.user_email).filter(Boolean)
    const { data: registrados } = emails.length
      ? await admin.from('user_profiles').select('user_id').limit(1000)
      : { data: [] }
    // Buscar por email en auth.users
    const registradosEmails = new Set<string>()
    if (emails.length) {
      const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      authUsers?.users?.forEach((u: any) => { if (u.email) registradosEmails.add(u.email.toLowerCase()) })
    }
    const chats = (chatsData || []).map((c: any) => ({
      ...c,
      is_registered: c.user_email ? registradosEmails.has(c.user_email.toLowerCase()) : false,
    }))
    return NextResponse.json({ chats })
  }

  if (chat_id) {
    const { data } = await admin
      .from('support_messages')
      .select('*')
      .eq('chat_id', chat_id)
      .order('created_at', { ascending: true })
    return NextResponse.json({ messages: data || [] })
  }

  return NextResponse.json({ error: 'Falta chat_id' }, { status: 400 })
}

// PATCH /api/chat — admin responde o cierra chat
export async function PATCH(req: NextRequest) {
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

  const body = await req.json()
  const { chat_id, status } = body

  if (status) {
    await admin.from('support_chats').update({ status, updated_at: new Date().toISOString() }).eq('id', chat_id)
  }

  return NextResponse.json({ ok: true })
}
