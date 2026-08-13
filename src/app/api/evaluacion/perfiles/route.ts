// src/app/api/evaluacion/perfiles/route.ts
// Perfiles de puesto. Crear un perfil genera además su link de evaluación con
// los tests elegidos, para que el Menter o la Empresa no tengan que armarlo
// aparte cada vez.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionUser } from '@/lib/admin'
import { crearLinkDeEvaluacion, validarDatosLink } from '@/lib/assessments/crear-link'
import { normalizarDestinatarios } from '@/lib/assessments/invitaciones'
import { urlLink } from '@/lib/assessments/links'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface CuerpoPerfil {
  nombre?: string
  instrument_ids?: string[]
  disc_d_target?: number; disc_i_target?: number
  disc_s_target?: number; disc_c_target?: number
  hexaco_minimo?: number
  candidatos?: unknown
  enviar_email?: boolean
}

function camposPerfil(body: CuerpoPerfil) {
  const pct = (n: unknown, def: number) =>
    typeof n === 'number' && n >= 0 && n <= 100 ? Math.round(n) : def

  return {
    nombre:         String(body.nombre || '').trim().slice(0, 120),
    instrument_ids: [...new Set((body.instrument_ids || []).map(String))],
    disc_d_target:  pct(body.disc_d_target, 70),
    disc_i_target:  pct(body.disc_i_target, 60),
    disc_s_target:  pct(body.disc_s_target, 40),
    disc_c_target:  pct(body.disc_c_target, 50),
    hexaco_minimo:  typeof body.hexaco_minimo === 'number' && body.hexaco_minimo >= 1 && body.hexaco_minimo <= 5
      ? body.hexaco_minimo : 3.5,
    candidatos:     normalizarDestinatarios(body.candidatos),
  }
}

/** Verifica que el perfil exista y sea del usuario. */
async function perfilPropio(admin: ReturnType<typeof createSupabaseAdmin>, id: string, userId: string) {
  const { data } = await admin
    .from('job_profiles')
    .select('id, empresa_id, menter_id, link_id')
    .eq('id', id)
    .maybeSingle()

  if (!data || (data.empresa_id !== userId && data.menter_id !== userId)) return null
  return data
}

// ── POST: crear perfil + su link ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json() as CuerpoPerfil
  const campos = camposPerfil(body)

  if (!campos.nombre) return NextResponse.json({ error: 'Ponle un nombre al puesto' }, { status: 400 })

  const errorLink = validarDatosLink({
    instrument_ids: campos.instrument_ids,
    destinatarios:  campos.candidatos,
  })
  if (errorLink) return NextResponse.json({ error: errorLink }, { status: 400 })

  const admin = createSupabaseAdmin()
  const esEmpresa = (user.user_metadata as Record<string, string>)?.role === 'empresa'

  const { data: perfil, error } = await admin
    .from('job_profiles')
    .insert({
      empresa_id: esEmpresa ? user.id : null,
      menter_id:  esEmpresa ? null : user.id,
      ...campos,
      activo: true,
    })
    .select('*')
    .single()

  if (error || !perfil) {
    console.error('[perfiles] No se pudo crear el perfil:', error)
    return NextResponse.json({ error: 'No se pudo crear el perfil' }, { status: 500 })
  }

  try {
    const { link, url, emails } = await crearLinkDeEvaluacion(admin, user, {
      instrumentos:  campos.instrument_ids,
      titulo:        `Evaluación · ${campos.nombre}`,
      jobProfileId:  perfil.id,
      contexto:      'seleccion_talento',
      destinatarios: campos.candidatos,
      enviarEmail:   !!body.enviar_email,
    })

    await admin.from('job_profiles').update({ link_id: link.id }).eq('id', perfil.id)

    return NextResponse.json({ ok: true, perfil: { ...perfil, link_id: link.id }, link_token: link.token, url, emails })
  } catch (e) {
    // Sin link el perfil no sirve para nada: se deshace para no dejar basura
    await admin.from('job_profiles').delete().eq('id', perfil.id)
    console.error('[perfiles] No se pudo crear el link del perfil:', e)
    return NextResponse.json({ error: 'No se pudo crear el link del perfil' }, { status: 500 })
  }
}

// ── PATCH: editar perfil ─────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json() as CuerpoPerfil & { id?: string }
  if (!body.id || !UUID_RE.test(body.id)) return NextResponse.json({ error: 'id inválido' }, { status: 400 })

  const campos = camposPerfil(body)
  if (!campos.nombre) return NextResponse.json({ error: 'Ponle un nombre al puesto' }, { status: 400 })

  const errorLink = validarDatosLink({ instrument_ids: campos.instrument_ids, destinatarios: campos.candidatos })
  if (errorLink) return NextResponse.json({ error: errorLink }, { status: 400 })

  const admin = createSupabaseAdmin()
  const actual = await perfilPropio(admin, body.id, user.id)
  if (!actual) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const { data: perfil, error } = await admin
    .from('job_profiles')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', body.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })

  // El link conserva su token — lo que ya se repartió sigue sirviendo — pero
  // pasa a pedir los tests que ahora tiene el puesto.
  if (actual.link_id) {
    await admin
      .from('assessment_links')
      .update({ instrument_ids: campos.instrument_ids, titulo: `Evaluación · ${campos.nombre}` })
      .eq('id', actual.link_id)
  }

  return NextResponse.json({ ok: true, perfil })
}

// ── DELETE: eliminar perfil y cerrar su link ─────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await req.json()
  if (!id || !UUID_RE.test(String(id))) return NextResponse.json({ error: 'id inválido' }, { status: 400 })

  const admin = createSupabaseAdmin()
  const actual = await perfilPropio(admin, id, user.id)
  if (!actual) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  // El link se desactiva en vez de borrarse: sus sesiones y resultados son
  // historial que no se puede perder.
  if (actual.link_id) {
    await admin.from('assessment_links').update({ activo: false }).eq('id', actual.link_id)
  }
  await admin.from('job_profiles').update({ activo: false }).eq('id', id)

  return NextResponse.json({ ok: true })
}

// ── GET: perfiles del usuario con su link ────────────────────────────────
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createSupabaseAdmin()
  const { data } = await admin
    .from('job_profiles')
    .select('*')
    .or(`empresa_id.eq.${user.id},menter_id.eq.${user.id}`)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  // Se resuelven los tokens aparte en vez de con un embed de PostgREST: el
  // nombre de la FK es un detalle interno y no vale la pena depender de él.
  const linkIds = (data || []).map(p => p.link_id).filter(Boolean)
  const { data: links } = linkIds.length
    ? await admin.from('assessment_links').select('id, token').in('id', linkIds)
    : { data: [] as { id: string; token: string }[] }

  const tokenPorId = new Map((links ?? []).map(l => [l.id, l.token]))

  const perfiles = (data || []).map(p => {
    const token = p.link_id ? tokenPorId.get(p.link_id) ?? null : null
    return { ...p, link_token: token, link_url: token ? urlLink(token) : null }
  })

  return NextResponse.json({ perfiles })
}
