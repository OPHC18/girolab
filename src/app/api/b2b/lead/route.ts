import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
const OMAR_WA  = process.env.OMAR_WHATSAPP_NUMBER || '51999999999'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombres, apellidos, empresa, cargo, correo, telefono, conversacion, resumen } = body
  if (!nombres || !correo || !empresa) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Guardar en Supabase
  const { error } = await admin.from('b2b_leads').insert({
    nombres, apellidos, empresa, cargo,
    correo, telefono: telefono || null,
    conversacion: conversacion || [],
    resumen: resumen || '',
    created_at: new Date().toISOString(),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const nombreCompleto = `${nombres} ${apellidos || ''}`.trim()
  const whatsappUrl = telefono
    ? `https://wa.me/${telefono.replace(/\D/g, '')}?text=Hola ${nombreCompleto}, soy Omar de Giro Lab. Gracias por tu consulta sobre nuestros servicios para ${empresa}.`
    : null

  // Email interno a Omar
  await fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    body: JSON.stringify({
      tipo: 'b2b_lead_interno',
      data: { nombreCompleto, empresa, cargo, correo, telefono, resumen, whatsappUrl },
    }),
  }).catch(() => {})

  // Email al lead (confirmación + "te enviamos la presentación pronto")
  await fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
    body: JSON.stringify({
      tipo: 'b2b_lead_confirmacion',
      data: { nombres, empresa, correo },
    }),
  }).catch(() => {})

  return NextResponse.json({ ok: true, whatsappUrl })
}
