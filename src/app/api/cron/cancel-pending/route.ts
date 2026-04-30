// src/app/api/cron/cancel-pending/route.ts
// Cancela automáticamente citas pendientes con más de 24h sin respuesta del Menter.
// Llamado cada hora por Vercel Cron (vercel.json).
// También puede ejecutarse manualmente desde el admin.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || ''

export async function GET(req: NextRequest) {
  // Verificar autorización (cron de Vercel o llamada interna)
  const auth = req.headers.get('authorization') || ''
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const isInternal = INTERNAL_SECRET && auth === `Bearer ${INTERNAL_SECRET}`

  if (!isVercelCron && !isInternal) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Buscar citas pendientes con más de 24h
  const { data: pendientes, error: fetchErr } = await supabase
    .from('appointments')
    .select('id, menter_id, menter_name, client_name, client_email, menter_email, date, start_time, created_at')
    .eq('status', 'pendiente')
    .lt('created_at', cutoff)

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  if (!pendientes || pendientes.length === 0) {
    return NextResponse.json({ canceladas: 0, message: 'Sin pendientes vencidos' })
  }

  const ids = pendientes.map((c: any) => c.id)

  // Cancelar todas
  const { error: updateErr } = await supabase
    .from('appointments')
    .update({
      status: 'cancelada',
      notas_cancelacion: 'Cancelada automáticamente: el Menter no respondió en 24 horas.',
      updated_at: new Date().toISOString(),
    })
    .in('id', ids)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Notificar a los clientes por email (fire-and-forget)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
  for (const c of pendientes) {
    if (c.client_email) {
      const fechaStr = new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
      fetch(`${appUrl}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          tipo: 'cita_cancelada_auto',
          data: {
            clientName:   c.client_name || 'Usuario',
            clientEmail:  c.client_email,
            menterName:   c.menter_name || 'el Menter',
            citaFecha:    fechaStr,
            citaHora:     c.start_time?.slice(0, 5) || '',
            dashboardUrl: `${appUrl}/dashboard?tab=mis-citas`,
          },
        }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({
    canceladas: pendientes.length,
    ids,
    message: `${pendientes.length} cita(s) canceladas automáticamente`,
  })
}
