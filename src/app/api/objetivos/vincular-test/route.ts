import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function makeClients(req: NextRequest) {
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  return { anon, admin }
}

async function getUser(req: NextRequest) {
  const { anon } = makeClients(req)
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const { data: { user } } = await anon.auth.getUser(auth.slice(7))
  return user || null
}

const RESULT_FIELDS = 'id, created_at, instrument_id, puntuacion_bruta, roadmap_objetivo_id, user_id'

// GET ?objetivo_id=&tipo=roadmap|empresa&disponibles=true&user_id=
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { admin } = makeClients(req)
  const { searchParams } = new URL(req.url)
  const objetivo_id = searchParams.get('objetivo_id')
  const tipo = searchParams.get('tipo') // 'roadmap' | 'empresa'
  const disponibles = searchParams.get('disponibles') === 'true'
  const target_user_id = searchParams.get('user_id') || user.id

  if (!objetivo_id || !tipo) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  if (disponibles) {
    const { data: results, error } = await admin
      .from('assessment_results')
      .select(RESULT_FIELDS)
      .eq('user_id', target_user_id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (tipo === 'roadmap') {
      const available = (results || []).filter((r: any) => r.roadmap_objetivo_id !== objetivo_id)
      return NextResponse.json({ results: available })
    } else {
      const { data: linked } = await admin
        .from('empresa_objetivo_assessments')
        .select('result_id')
        .eq('objetivo_id', objetivo_id)
      const linkedIds = new Set((linked || []).map((l: any) => l.result_id))
      const available = (results || []).filter((r: any) => !linkedIds.has(r.id))
      return NextResponse.json({ results: available })
    }
  }

  // Return linked tests for this objective
  if (tipo === 'roadmap') {
    const { data, error } = await admin
      .from('assessment_results')
      .select(RESULT_FIELDS)
      .eq('roadmap_objetivo_id', objetivo_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ results: data || [] })
  } else {
    const { data, error } = await admin
      .from('empresa_objetivo_assessments')
      .select(`result_id, created_at, result:assessment_results(${RESULT_FIELDS})`)
      .eq('objetivo_id', objetivo_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const results = (data || []).map((d: any) => d.result).filter(Boolean)
    return NextResponse.json({ results })
  }
}

// POST { objetivo_id, tipo, result_id }
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { admin } = makeClients(req)
  const { objetivo_id, tipo, result_id } = await req.json()

  if (!objetivo_id || !tipo || !result_id) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  if (tipo === 'roadmap') {
    const { error } = await admin
      .from('assessment_results')
      .update({ roadmap_objetivo_id: objetivo_id })
      .eq('id', result_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await admin
      .from('empresa_objetivo_assessments')
      .insert({ objetivo_id, result_id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE { objetivo_id, tipo, result_id }
export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { admin } = makeClients(req)
  const { objetivo_id, tipo, result_id } = await req.json()

  if (!objetivo_id || !tipo || !result_id) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  if (tipo === 'roadmap') {
    const { error } = await admin
      .from('assessment_results')
      .update({ roadmap_objetivo_id: null })
      .eq('id', result_id)
      .eq('roadmap_objetivo_id', objetivo_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await admin
      .from('empresa_objetivo_assessments')
      .delete()
      .eq('objetivo_id', objetivo_id)
      .eq('result_id', result_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
