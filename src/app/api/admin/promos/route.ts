import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

async function getAdminUser(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) return null
  return user
}

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/promos → lista todas las promos
export async function GET(req: NextRequest) {
  const user = await getAdminUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { data, error } = await admin()
    .from('promos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promos: data })
}

// POST /api/admin/promos → crear promo
export async function POST(req: NextRequest) {
  const user = await getAdminUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const { nombre, tipo, trial_dias, aplica_plan, expires_at, nota } = body

  if (!nombre?.trim() || !tipo || !trial_dias || trial_dias < 1 || trial_dias > 365) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  if (!['trial', 'acceso'].includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const { data, error } = await admin()
    .from('promos')
    .insert({
      nombre: nombre.trim(),
      tipo,
      trial_dias,
      aplica_plan: aplica_plan || null,
      expires_at:  expires_at || null,
      nota:        nota?.trim() || null,
      is_active:   false,
      created_by:  user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promo: data })
}

// PATCH /api/admin/promos → activar/desactivar promo
export async function PATCH(req: NextRequest) {
  const user = await getAdminUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, is_active } = await req.json()
  if (!id || typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'id e is_active requeridos' }, { status: 400 })
  }

  const db = admin()

  // Si activando, desactivar otras del mismo tipo primero
  if (is_active) {
    const { data: promo } = await db.from('promos').select('tipo').eq('id', id).single()
    if (promo) {
      await db.from('promos')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('tipo', promo.tipo)
        .neq('id', id)
    }
  }

  const { error } = await db
    .from('promos')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/promos → eliminar promo
export async function DELETE(req: NextRequest) {
  const user = await getAdminUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { error } = await admin().from('promos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
