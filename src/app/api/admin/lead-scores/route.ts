import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAdmin(req: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return false
  if (ADMIN_EMAILS.includes(user.email!)) return true
  const { data: staff } = await admin.from('staff_roles').select('role').eq('user_id', user.id).maybeSingle()
  return !!staff
}

async function scoreMenter(userId: string, authUser: any): Promise<{ score: number; factores: Record<string, number> }> {
  const factores: Record<string, number> = {}

  const [
    { data: perfil },
    { data: membership },
    { data: citas },
    { data: eventos },
    { data: reviews },
  ] = await Promise.all([
    admin.from('menter_public_profiles').select('avatar_url, bio, especialidad, precio_sesion').eq('menter_id', userId).maybeSingle(),
    admin.from('menter_memberships').select('plan').eq('menter_id', userId).maybeSingle(),
    admin.from('appointments').select('status').eq('menter_id', userId).limit(200),
    admin.from('events').select('id').eq('menter_id', userId).limit(50),
    admin.from('reviews').select('estrellas').eq('reviewed_id', userId).limit(100),
  ])

  // Perfil completo: foto + bio + especialidad + precio (20 pts)
  const profilePts =
    (perfil?.avatar_url ? 5 : 0) +
    (perfil?.bio && perfil.bio.length > 30 ? 5 : 0) +
    (perfil?.especialidad ? 5 : 0) +
    (perfil?.precio_sesion ? 5 : 0)
  factores.perfil = profilePts

  // Plan (20 pts)
  const planMap: Record<string, number> = { master: 15, premium: 20, starter: 8, free: 0 }
  factores.plan = planMap[membership?.plan || 'free'] ?? 0

  // Citas confirmadas (15 pts)
  const confirmadas = (citas || []).filter((c: any) => c.status === 'confirmada').length
  factores.citas_confirmadas = confirmadas > 0 ? 15 : 0

  // Citas completadas (15 pts)
  const completadas = (citas || []).filter((c: any) => c.status === 'completada').length
  factores.citas_completadas = completadas > 0 ? 15 : 0

  // Tiene eventos (10 pts)
  factores.eventos = (eventos || []).length > 0 ? 10 : 0

  // Reseñas avg >= 4 (10 pts)
  const totalResenas = (reviews || []).length
  const avgResenas = totalResenas > 0
    ? (reviews || []).reduce((s: number, r: any) => s + (r.estrellas || 0), 0) / totalResenas
    : 0
  factores.resenas = totalResenas > 0 && avgResenas >= 4 ? 10 : 0

  // Último login < 7 días (10 pts)
  const lastLogin = authUser?.last_sign_in_at
  const diasDesdeLogin = lastLogin
    ? (Date.now() - new Date(lastLogin).getTime()) / 86400000
    : 999
  factores.actividad_reciente = diasDesdeLogin < 7 ? 10 : 0

  const score = Math.min(100, Object.values(factores).reduce((a, b) => a + b, 0))
  return { score, factores }
}

async function scoreEmpresa(userId: string, authUser: any): Promise<{ score: number; factores: Record<string, number> }> {
  const factores: Record<string, number> = {}

  const [
    { data: perfil },
    { data: objetivos },
    { data: citas },
  ] = await Promise.all([
    admin.from('user_profiles').select('avatar_url, bio').eq('user_id', userId).maybeSingle(),
    admin.from('empresa_objetivos').select('id').eq('empresa_id', userId).limit(50),
    admin.from('appointments').select('id').eq('client_id', userId).limit(50),
  ])

  const objetivoIds = (objetivos || []).map((o: any) => o.id)

  const [
    { data: colaboradores },
    { data: mentersAsignados },
  ] = await Promise.all([
    objetivoIds.length > 0
      ? admin.from('empresa_objetivo_colaboradores').select('id').in('objetivo_id', objetivoIds).limit(100)
      : { data: [] },
    objetivoIds.length > 0
      ? admin.from('empresa_objetivo_menter').select('id').in('objetivo_id', objetivoIds).limit(50)
      : { data: [] },
  ])

  // Perfil completo: logo + bio + (sector inferred) (20 pts)
  factores.perfil = (perfil?.avatar_url ? 10 : 0) + (perfil?.bio && perfil.bio.length > 20 ? 10 : 0)

  // Tiene objetivos empresariales (20 pts)
  factores.objetivos = (objetivos || []).length > 0 ? 20 : 0

  // Tiene colaboradores (20 pts)
  factores.colaboradores = (colaboradores || []).length > 0 ? 20 : 0

  // Tiene menter asignado (15 pts)
  factores.menter_asignado = (mentersAsignados || []).length > 0 ? 15 : 0

  // Tiene citas con menters (15 pts)
  factores.citas = (citas || []).length > 0 ? 15 : 0

  // Último login < 7 días (10 pts)
  const lastLogin = authUser?.last_sign_in_at
  const diasDesdeLogin = lastLogin
    ? (Date.now() - new Date(lastLogin).getTime()) / 86400000
    : 999
  factores.actividad_reciente = diasDesdeLogin < 7 ? 10 : 0

  const score = Math.min(100, Object.values(factores).reduce((a, b) => a + b, 0))
  return { score, factores }
}

// POST /api/admin/lead-scores
// body: { role: 'menter'|'empresa', userIds: string[] }
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { role, userIds } = await req.json()
  if (!role || !userIds?.length) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })

  // Obtener last_sign_in_at para todos de una vez
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const authMap = Object.fromEntries((authUsers || []).map((u: any) => [u.id, u]))

  const results: Record<string, { score: number; factores: Record<string, number> }> = {}

  await Promise.all(
    userIds.map(async (uid: string) => {
      const authUser = authMap[uid]
      if (role === 'menter') {
        results[uid] = await scoreMenter(uid, authUser)
      } else {
        results[uid] = await scoreEmpresa(uid, authUser)
      }
    })
  )

  // Persistir en lead_scores (upsert)
  const rows = Object.entries(results).map(([user_id, { score, factores }]) => ({
    user_id,
    role,
    score,
    factores,
    updated_at: new Date().toISOString(),
  }))
  await admin.from('lead_scores').upsert(rows, { onConflict: 'user_id' }).catch(() => {})

  return NextResponse.json({ scores: results })
}
