import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json()
  const { nombre, apellidos, telefono, pais, cumpleanos, empresa, cargo } = body

  // Actualizar user_metadata si vienen nombre/apellidos
  if (nombre !== undefined || apellidos !== undefined) {
    const { data: { user: freshUser } } = await admin.auth.admin.getUserById(user.id)
    const currentMeta = freshUser?.user_metadata || {}
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...currentMeta,
        ...(nombre    !== undefined && { nombre }),
        ...(apellidos !== undefined && { apellidos }),
      }
    })
  }

  // Upsert en user_profiles
  const profileData: Record<string, unknown> = { user_id: user.id }
  if (telefono   !== undefined) profileData.telefono   = telefono   || null
  if (pais       !== undefined) profileData.pais       = pais       || null
  if (cumpleanos !== undefined) profileData.cumpleanos = cumpleanos || null
  if (empresa    !== undefined) profileData.empresa    = empresa    || null
  if (cargo      !== undefined) profileData.cargo      = cargo      || null

  const { error } = await admin
    .from('user_profiles')
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
