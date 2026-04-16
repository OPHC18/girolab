import { NextRequest, NextResponse } from 'next/server'
import {
  emailNuevaSolicitudMenter,
  emailConfirmacionCliente,
  emailRecordatorioMenter,
  emailRecordatorioCliente,
  emailRechazoCliente,
  emailSolicitudReprogramacion,
  emailReprogramacionAceptada,
  emailReprogramacionRechazada,
  emailCompraEntrada,
  emailConfirmacionEvento,
  emailEventoCancelado,
  emailBienvenidaDia1,
  emailMentersDia2,
  emailEducacionDia3,
  emailNudgeDia7,
  emailDespedida,
  emailEliminadoPorAdmin,
  emailCitaCanceladaAuto,
} from '@/lib/email'

// ── Rate limiting en memoria (10 emails por usuario por minuto) ──────────────
const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60_000 // 1 minuto

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  // Verificar que el caller sea usuario autenticado O llamada interna con secreto
  const internalSecret = req.headers.get('x-internal-secret')
  const isInternal = internalSecret && internalSecret === process.env.INTERNAL_API_SECRET

  let userId = 'internal'

  if (!isInternal) {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    userId = user.id
  }

  // Rate limiting por usuario/IP
  const rateLimitKey = isInternal
    ? 'internal'
    : `${userId}:${req.headers.get('x-forwarded-for') || 'local'}`

  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
  }

  const body = await req.json()
  const { tipo, data } = body

  if (!tipo || !data || typeof tipo !== 'string') {
    return NextResponse.json({ error: 'Faltan tipo y data' }, { status: 400 })
  }

  let result

  switch (tipo) {
    case 'nueva_solicitud_menter':
      result = await emailNuevaSolicitudMenter(data); break
    case 'confirmacion_cliente':
      result = await emailConfirmacionCliente(data); break
    case 'recordatorio_menter':
      result = await emailRecordatorioMenter(data); break
    case 'recordatorio_cliente':
      result = await emailRecordatorioCliente(data); break
    case 'rechazo_cliente':
      result = await emailRechazoCliente(data); break
    case 'solicitud_reprogramacion':
      result = await emailSolicitudReprogramacion(data); break
    case 'reprogramacion_aceptada':
      result = await emailReprogramacionAceptada(data); break
    case 'reprogramacion_rechazada':
      result = await emailReprogramacionRechazada(data); break
    case 'compra_entrada':
      result = await emailCompraEntrada(data); break
    case 'confirmacion_evento':
      result = await emailConfirmacionEvento(data); break
    case 'evento_cancelado':
      result = await emailEventoCancelado(data); break
    case 'bienvenida_dia1':
      result = await emailBienvenidaDia1(data); break
    case 'menters_dia2':
      result = await emailMentersDia2(data); break
    case 'educacion_dia3':
      result = await emailEducacionDia3(data); break
    case 'nudge_dia7':
      result = await emailNudgeDia7(data); break
    case 'despedida':
      result = await emailDespedida(data); break
    case 'eliminado_por_admin':
      result = await emailEliminadoPorAdmin(data); break
    case 'cita_cancelada_auto':
      result = await emailCitaCanceladaAuto(data); break
    default:
      return NextResponse.json({ error: 'Tipo de email no permitido' }, { status: 400 })
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
