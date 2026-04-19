import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

async function getUser(req: NextRequest) {
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const auth = req.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) {
    const { data } = await anon.auth.getUser(auth.slice(7))
    if (data.user) return data.user
  }
  return null
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { post_id, contenido } = await req.json()
  if (!post_id || !contenido?.trim()) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await admin.from('community_comments').insert({
    post_id,
    user_id: user.id,
    contenido: contenido.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { comment_id, post_id } = await req.json()
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const isAdmin = ADMIN_EMAILS.includes(user.email || '')

  if (comment_id) {
    if (!isAdmin) {
      const { data } = await admin.from('community_comments').select('user_id').eq('id', comment_id).single()
      if (!data || data.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    const { error } = await admin.from('community_comments').delete().eq('id', comment_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (post_id) {
    if (!isAdmin) {
      const { data } = await admin.from('community_posts').select('user_id').eq('id', post_id).single()
      if (!data || data.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    await admin.from('community_comments').delete().eq('post_id', post_id)
    const { error } = await admin.from('community_posts').delete().eq('id', post_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
