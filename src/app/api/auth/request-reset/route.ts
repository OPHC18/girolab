import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailResetPassword } from '@/lib/email/templates/auth'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Falta email' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Generate branded recovery link via admin API
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: email.trim().toLowerCase(),
    options: { redirectTo: `${APP_URL}/reset-password` },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const resetLink = data.properties?.action_link
  if (!resetLink) return NextResponse.json({ error: 'No se pudo generar el enlace' }, { status: 500 })

  // Look up user name from auth metadata
  const userName = (data.user?.user_metadata?.nombre || '') + (data.user?.user_metadata?.apellidos ? ` ${data.user.user_metadata.apellidos}` : '')

  await emailResetPassword({
    userEmail: email.trim().toLowerCase(),
    userName: userName.trim(),
    resetLink,
  })

  return NextResponse.json({ ok: true })
}
