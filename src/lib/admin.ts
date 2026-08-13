// src/lib/admin.ts — solo server-side (usa next/headers)

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS ||
  'omar@girolab.net,admin@girolab.net,omarphc@hotmail.com,omarphc180726@gmail.com,luana@girolab.net,daniela@girolab.net'
)
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)

/** Usuario de la sesión actual leída de cookies, o null. */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** Usuario de la sesión actual solo si es administrador, o null. */
export async function getAdminUser(): Promise<User | null> {
  const user = await getSessionUser()
  return user && ADMIN_EMAILS.includes(user.email!) ? user : null
}
