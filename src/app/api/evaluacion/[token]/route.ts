// src/app/api/evaluacion/[token]/route.ts
// Endpoint público del link de evaluación.
//   GET  → qué evaluaciones incluye, si sigue vigente y el avance del participante
//   POST → registra (o reanuda) al participante y crea sus sesiones
// Todo pasa por service role: el link es multiuso y quien lo abre puede ser anónimo.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { CATALOG, tiempoTotalMinutos } from '@/lib/assessments/catalog'
import {
  estadoLink,
  generarToken,
  sincronizarProgreso,
  siguientePaso,
  type EvaluacionLink,
  type Participante,
} from '@/lib/assessments/links'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_RE = /^[a-f0-9]{8,64}$/i

type Ctx = { params: Promise<{ token: string }> }

async function cargarLink(admin: ReturnType<typeof createSupabaseAdmin>, token: string) {
  const { data } = await admin
    .from('assessment_links')
    .select('*')
    .eq('token', token)
    .maybeSingle()
  return data as EvaluacionLink | null
}

async function contarUsos(admin: ReturnType<typeof createSupabaseAdmin>, linkId: string) {
  const { count } = await admin
    .from('assessment_link_participants')
    .select('id', { count: 'exact', head: true })
    .eq('link_id', linkId)
    .not('iniciado_at', 'is', null)
  return count ?? 0
}

function resumenLink(link: EvaluacionLink) {
  return {
    titulo:  link.titulo,
    mensaje: link.mensaje,
    instrumentos: link.instrument_ids.map(id => {
      const inst = CATALOG[id]
      return {
        id,
        nombre:        inst?.nombre ?? id,
        descripcion:   inst?.descripcion ?? '',
        color:         inst?.color ?? '#421869',
        totalItems:    inst?.totalItems ?? 0,
        tiempoMinutos: inst?.tiempoMinutos ?? 0,
      }
    }),
    tiempoTotalMinutos: tiempoTotalMinutos(link.instrument_ids),
  }
}

/** Usuario autenticado a partir del Bearer token; nunca se confía en el body. */
async function personaDesdeHeader(
  admin: ReturnType<typeof createSupabaseAdmin>,
  req: NextRequest
): Promise<{ id: string; email?: string; nombre?: string } | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null

  const { data: { user } } = await admin.auth.getUser(auth.slice(7))
  if (!user) return null

  const meta = (user.user_metadata ?? {}) as Record<string, string>
  return {
    id:     user.id,
    email:  user.email ?? undefined,
    nombre: [meta.nombre, meta.apellidos].filter(Boolean).join(' ').trim() || undefined,
  }
}

// ── GET ───────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Ctx) {
  const { token } = await params
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ error: 'Link inválido' }, { status: 400 })
  }

  const admin = createSupabaseAdmin()
  const link  = await cargarLink(admin, token)
  if (!link) return NextResponse.json({ error: 'Link no encontrado' }, { status: 404 })

  const estado = estadoLink(link, await contarUsos(admin, link.id))

  // ?p= identifica a quien fue invitado por correo o ya empezó a rendir
  const participanteToken = new URL(req.url).searchParams.get('p')
  let participante: Participante | null = null
  let progreso = null

  if (participanteToken && TOKEN_RE.test(participanteToken)) {
    const { data } = await admin
      .from('assessment_link_participants')
      .select('*')
      .eq('participante_token', participanteToken)
      .eq('link_id', link.id)
      .maybeSingle()

    participante = data as Participante | null

    // Solo hay progreso si ya empezó: invitar no crea sesiones ni consume nada
    if (participante?.iniciado_at) {
      progreso = await sincronizarProgreso(admin, link, participante)
    }
  }

  return NextResponse.json({
    estado,
    link: resumenLink(link),
    participante: participante && {
      nombre:             participante.nombre,
      email:              participante.email,
      participante_token: participante.participante_token,
      completado:         participante.completado_at !== null,
    },
    progreso,
    siguiente: progreso ? siguientePaso(progreso) : null,
  })
}

// ── POST: iniciar o reanudar ──────────────────────────────────────────────
export async function POST(req: NextRequest, { params }: Ctx) {
  const { token } = await params
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ error: 'Link inválido' }, { status: 400 })
  }

  const admin = createSupabaseAdmin()
  const link  = await cargarLink(admin, token)
  if (!link) return NextResponse.json({ error: 'Link no encontrado' }, { status: 404 })

  const { nombre, email, participante_token: ptEntrante, metadata } = await req.json()
  const persona = await personaDesdeHeader(admin, req)

  const nombreFinal = String(nombre || persona?.nombre || '').trim().slice(0, 120)
  const emailFinal  = String(email  || persona?.email  || '').trim().toLowerCase().slice(0, 200)

  if (!nombreFinal || !EMAIL_RE.test(emailFinal)) {
    return NextResponse.json({ error: 'Necesitamos tu nombre y un correo válido' }, { status: 400 })
  }

  // Reanudar tiene prioridad: un participante que vuelve no vuelve a ocupar cupo
  let participante: Participante | null = null

  if (ptEntrante && TOKEN_RE.test(ptEntrante)) {
    const { data } = await admin
      .from('assessment_link_participants')
      .select('*')
      .eq('participante_token', ptEntrante)
      .eq('link_id', link.id)
      .maybeSingle()
    participante = data as Participante | null
  }

  if (!participante) {
    // Misma persona entrando de nuevo al link sin su token: retomar lo suyo
    const { data } = await admin
      .from('assessment_link_participants')
      .select('*')
      .eq('link_id', link.id)
      .ilike('email', emailFinal)
      .is('completado_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    participante = data as Participante | null
  }

  // El cupo solo aplica a gente nueva
  if (!participante) {
    const estado = estadoLink(link, await contarUsos(admin, link.id))
    if (estado !== 'activo') {
      return NextResponse.json({ error: 'Este link ya no está disponible', estado }, { status: 410 })
    }

    const { data, error } = await admin
      .from('assessment_link_participants')
      .insert({
        link_id:            link.id,
        participante_token: generarToken(16),
        persona_id:         persona?.id ?? null,
        nombre:             nombreFinal,
        email:              emailFinal,
        iniciado_at:        new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('[evaluacion] No se pudo registrar al participante:', error)
      return NextResponse.json({ error: 'No se pudo iniciar la evaluación' }, { status: 500 })
    }
    participante = data as Participante
  } else {
    const { data } = await admin
      .from('assessment_link_participants')
      .update({
        nombre:      nombreFinal,
        email:       emailFinal,
        persona_id:  persona?.id ?? participante.persona_id,
        iniciado_at: participante.iniciado_at ?? new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', participante.id)
      .select('*')
      .single()
    participante = (data as Participante) ?? participante
  }

  // Sin este try la excepción sale como una página HTML de error, el cliente
  // revienta al parsearla y la persona solo ve "intenta de nuevo" sin causa.
  try {
    const progreso = await sincronizarProgreso(
      admin,
      link,
      participante,
      typeof metadata === 'object' && metadata !== null ? metadata : {}
    )

    return NextResponse.json({
      ok: true,
      participante_token: participante.participante_token,
      progreso,
      siguiente: siguientePaso(progreso),
    })
  } catch (e) {
    console.error('[evaluacion] No se pudieron preparar las evaluaciones:', e)
    return NextResponse.json(
      { error: 'No se pudieron preparar las evaluaciones. Avisa a quien te envió el enlace.' },
      { status: 500 }
    )
  }
}
