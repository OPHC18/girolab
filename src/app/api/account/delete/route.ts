import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { emailEliminadoPorAdmin } from '@/lib/email'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'luana@girolab.net', 'daniela@girolab.net', 'omarphc@hotmail.com']

export async function POST(req: NextRequest) {
  // 1. Verificar sesión del usuario que hace la petición
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user: sessionUser } } = await supabaseUser.auth.getUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let userId: string
  try {
    const body = await req.json()
    userId = body.userId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  }

  // 2. Solo puedes borrar tu propia cuenta (admins pueden borrar cualquiera)
  const isAdmin = ADMIN_EMAILS.includes(sessionUser.email ?? '')
  if (sessionUser.id !== userId && !isAdmin) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  console.log('[delete-account] iniciado por:', sessionUser.id.slice(0, 8), '| objetivo:', userId.slice(0, 8))

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Variables de entorno no configuradas' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Borrar datos en cascada — el orden importa (hijos antes que padres)
  const tables = [
    // Community
    { table: 'community_likes',                col: 'user_id' },
    { table: 'community_comments',             col: 'user_id' },
    { table: 'community_posts',                col: 'user_id' },
    // Blog
    { table: 'blog_likes',                     col: 'user_id' },
    { table: 'blog_comments',                  col: 'user_id' },
    { table: 'blog_posts',                     col: 'menter_id' },
    // Reseñas
    { table: 'reviews',                        col: 'reviewer_id' },
    { table: 'reviews',                        col: 'reviewed_id' },
    // Eventos y registros
    { table: 'event_registrations',            col: 'user_id' },
    { table: 'event_tickets',                  col: 'menter_id' },
    { table: 'events',                         col: 'menter_id' },
    // Citas
    { table: 'appointments',                   col: 'client_id' },
    { table: 'appointments',                   col: 'menter_id' },
    // Assessments
    { table: 'assessment_results',             col: 'vinculado_por' },
    { table: 'assessment_results',             col: 'persona_id' },
    { table: 'assessment_results',             col: 'menter_id' },
    { table: 'assessment_results',             col: 'empresa_id' },
    { table: 'assessment_sessions',            col: 'persona_id' },
    { table: 'assessment_sessions',            col: 'menter_id' },
    { table: 'assessment_sessions',            col: 'empresa_id' },
    // Empresa objectives
    { table: 'empresa_objetivo_colaboradores', col: 'user_id' },
    { table: 'empresa_objetivo_menters',       col: 'menter_id' },
    { table: 'empresa_objetivo_menter',        col: 'menter_id' },
    { table: 'empresa_hitos',                  col: 'autor_id' },
    { table: 'empresa_objetivos',              col: 'empresa_id' },
    // Job profiles
    { table: 'job_profiles',                   col: 'menter_id' },
    { table: 'job_profiles',                   col: 'empresa_id' },
    // Insignias y membresías
    { table: 'menter_insignias',               col: 'menter_id' },
    { table: 'menter_memberships',             col: 'granted_by' },
    { table: 'menter_memberships',             col: 'menter_id' },
    // Disponibilidad y perfiles Menter
    { table: 'menter_availability',            col: 'menter_id' },
    { table: 'menter_profile',                 col: 'menter_id' },
    { table: 'menter_public_profiles',         col: 'menter_id' },
    // Roadmap
    { table: 'roadmap_milestones',             col: 'autor_id' },
    { table: 'roadmap_objectives',             col: 'autor_id' },
    { table: 'roadmaps',                       col: 'client_id' },
    { table: 'roadmaps',                       col: 'menter_id' },
    { table: 'roadmap_items',                  col: 'user_id' },
    { table: 'user_roadmap',                   col: 'user_id' },
    // Instruments y tests
    { table: 'user_instruments',               col: 'user_id' },
    { table: 'user_test_results',              col: 'user_id' },
    // Perfil de usuario y tabla users
    { table: 'user_profiles',                  col: 'user_id' },
    { table: 'users',                          col: 'id' },
  ]

  for (const { table, col } of tables) {
    const { error } = await supabaseAdmin.from(table).delete().eq(col, userId)
    if (error) {
      console.warn(`[delete-account] ${table}.${col}: ${error.code} — ${error.message}`)
    }
  }

  // Obtener datos del usuario antes de eliminar (para el email)
  const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId)
  const targetEmail = targetUser?.user?.email
  const targetName  = targetUser?.user?.user_metadata?.nombre
    ? `${targetUser.user.user_metadata.nombre} ${targetUser.user.user_metadata.apellidos || ''}`.trim()
    : targetUser?.user?.email ?? ''

  // Enviar email de notificación server-side (antes de borrar el auth record)
  if (targetEmail && isAdmin) {
    emailEliminadoPorAdmin({ userName: targetName, userEmail: targetEmail }).catch(e =>
      console.warn('[delete-account] email fallido:', e)
    )
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (authError) {
    console.warn('[delete-account] deleteUser falló, intentando anonimizar:', authError.message)

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: `deleted_${userId}@deleted.invalid`,
      password: crypto.randomUUID(),
      user_metadata: {},
      app_metadata: { deleted: true, deleted_at: new Date().toISOString() },
      ban_duration: '876000h',
    })

    if (updateError) {
      console.error('[delete-account] anonimizar también falló:', updateError.message)
      return NextResponse.json(
        { error: `No se pudo eliminar la cuenta: ${authError.message}` },
        { status: 500 }
      )
    }

    console.log('[delete-account] Usuario anonimizado')
  } else {
    console.log('[delete-account] OK — usuario eliminado de Auth')
  }

  return NextResponse.json({ ok: true })
}
