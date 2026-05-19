import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncB2bContact } from '@/lib/brevo-contacts'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

// Rate limiting: 5 leads por IP por hora
const tpeRateMap = new Map<string, { count: number; reset: number }>()
function checkTpeRate(ip: string): boolean {
  const now = Date.now()
  const entry = tpeRateMap.get(ip)
  if (!entry || now > entry.reset) {
    tpeRateMap.set(ip, { count: 1, reset: now + 3_600_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (!checkTpeRate(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
  }

  const body = await req.json()
  const { nombre, empresa, email, telefono, servicios, coaching_areas, uniformes, merchandising } = body

  // Validaciones básicas
  if (!nombre || !empresa || !email) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }
  if (
    String(nombre).length > 120 ||
    String(empresa).length > 200 ||
    String(email).length > 200
  ) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!Array.isArray(servicios) || servicios.length === 0) {
    return NextResponse.json({ error: 'Selecciona al menos un servicio' }, { status: 400 })
  }

  // Guardar en Supabase — misma tabla que b2b_leads con columnas adicionales
  const { error } = await admin.from('tpe_leads').insert({
    nombre,
    empresa,
    email,
    telefono:       telefono || null,
    servicios,
    coaching_areas: coaching_areas || [],
    uniformes:      uniformes      || [],
    merchandising:  merchandising  || '',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sincronizar con Brevo (no bloquea la respuesta)
  syncB2bContact({
    email,
    nombres:  nombre,
    empresa,
    telefono: telefono || undefined,
    servicio: servicios.join(', '),
  }).catch(() => {})

  // Email interno a Omar
  const resumenServicios = [
    servicios.includes('coaching') && coaching_areas?.length
      ? `Coaching: ${coaching_areas.join(', ')}`
      : servicios.includes('coaching') ? 'Coaching (sin áreas especificadas)' : null,
    servicios.includes('uniformes') && Array.isArray(uniformes) && uniformes.length
      ? `Uniformes: ${uniformes.map((p: { nombre: string; cantidad: number }) => `${p.nombre} (${p.cantidad})`).join(', ')}`
      : servicios.includes('uniformes') ? 'Uniformes (sin detalle)' : null,
    servicios.includes('merchandising') && merchandising
      ? `Merchandising: ${merchandising}`
      : servicios.includes('merchandising') ? 'Merchandising (sin detalle)' : null,
  ].filter(Boolean).join('\n')

  await fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    body: JSON.stringify({
      tipo: 'tpe_lead_interno',
      data: { nombre, empresa, email, telefono, resumenServicios },
    }),
  }).catch(() => {})

  // Email de confirmación al lead
  await fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    body: JSON.stringify({
      tipo: 'tpe_lead_confirmacion',
      data: { nombre, empresa, email, servicios },
    }),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}