// src/app/api/account/sync-contact/route.ts
// Sincroniza los datos del usuario autenticado como contacto en Brevo.
// Se llama desde el dashboard después de guardar el perfil.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { syncBrevoContact } from '@/lib/brevo-contacts'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createSupabaseAdmin()

  // Leer metadata del usuario
  const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
  const meta = authUser?.user?.user_metadata || {}
  const role = meta.role as 'persona' | 'menter' | 'empresa' | undefined

  // Leer perfil extendido
  const { data: perfil } = await supabase
    .from('menter_profiles')
    .select('pais, casos_que_atiende, especialidad')
    .eq('menter_id', user.id)
    .maybeSingle()

  // Calcular fecha de nacimiento desde cumpleanos (formato YYYY-MM-DD)
  let fechaNac: string | undefined
  if (meta.cumpleanos) {
    // cumpleanos puede venir como DD/MM/YYYY o YYYY-MM-DD
    const raw = meta.cumpleanos as string
    if (raw.includes('/')) {
      const [d, m, y] = raw.split('/')
      fechaNac = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
    } else {
      fechaNac = raw
    }
  }

  // Especialidades: combinar casos_que_atiende + especialidad del perfil Menter
  const especialidades: string[] = []
  if (perfil?.especialidad)        especialidades.push(perfil.especialidad)
  if (perfil?.casos_que_atiende)   especialidades.push(...perfil.casos_que_atiende)

  // Leer plan de membresía (solo Menters)
  let plan: string | undefined
  if (role === 'menter') {
    const { data: mem } = await supabase
      .from('menter_memberships')
      .select('plan')
      .eq('menter_id', user.id)
      .maybeSingle()
    plan = mem?.plan
  }

  await syncBrevoContact({
    email:         user.email!,
    nombre:        meta.nombre,
    apellidos:     meta.apellidos,
    perfil:        role,
    pais:          meta.pais || perfil?.pais,
    fechaNac,
    especialidades: especialidades.length ? especialidades : undefined,
    plan,
  })

  return NextResponse.json({ ok: true })
}
