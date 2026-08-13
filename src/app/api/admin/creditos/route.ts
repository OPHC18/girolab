// src/app/api/admin/creditos/route.ts
// Consulta y asignación manual de créditos de evaluación desde el panel admin.
// Permite que perfiles Menter y Empresa prueben las evaluaciones sin pagar.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getAdminUser } from '@/lib/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_DELTA = 500
const MAX_IDS   = 200

// GET ?ids=uuid,uuid,… → saldo de cada usuario (los que no tienen fila van en 0)
export async function GET(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const ids = (new URL(req.url).searchParams.get('ids') || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => UUID_RE.test(s))

  if (ids.length === 0)        return NextResponse.json({ saldos: {} })
  if (ids.length > MAX_IDS)    return NextResponse.json({ error: 'Demasiados ids' }, { status: 400 })

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('instrumento_creditos')
    .select('empresa_id, creditos')
    .in('empresa_id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const saldos = Object.fromEntries(ids.map(id => [id, 0])) as Record<string, number>
  for (const row of data || []) saldos[row.empresa_id] = row.creditos ?? 0

  return NextResponse.json({ saldos })
}

// POST { userId, delta, nota } → suma (o resta con delta negativo) créditos
export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId, delta, nota } = await req.json()

  if (!userId || !UUID_RE.test(String(userId))) {
    return NextResponse.json({ error: 'userId inválido' }, { status: 400 })
  }
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > MAX_DELTA) {
    return NextResponse.json(
      { error: `delta debe ser un entero distinto de 0 y hasta ±${MAX_DELTA}` },
      { status: 400 }
    )
  }
  if (nota && String(nota).length > 300) {
    return NextResponse.json({ error: 'Nota demasiado larga' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  // Atómico: nunca deja el saldo bajo cero (ver migración 20260803)
  const { data: saldo, error } = await supabase.rpc('ajustar_creditos', {
    p_user_id: userId,
    p_delta:   delta,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auditoría — instrumento_compras es el libro mayor de créditos
  await supabase.from('instrumento_compras').insert({
    empresa_id:         userId,
    pack_id:            'admin_grant',
    creditos_comprados: delta,
    monto_usd:          0,
    nota:               String(nota || '').trim() || `Ajuste manual de ${delta} crédito(s) por admin`,
    otorgado_por:       admin.id,
  })

  return NextResponse.json({ ok: true, creditos: saldo })
}
