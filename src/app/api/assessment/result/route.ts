// src/app/api/assessment/result/route.ts
// Devuelve un resultado de evaluación bypasando RLS con service role.
// El UUID del resultado actúa como secreto compartido; se valida formato y se aplica rate limit.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const rateMap = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now(); const e = rateMap.get(ip)
  if (!e || now > e.reset) { rateMap.set(ip, { count: 1, reset: now + 3_600_000 }); return true }
  if (e.count >= 30) return false; e.count++; return true
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (!checkRate(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const resultId = searchParams.get('r')

  if (!resultId || !UUID_RE.test(resultId)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('assessment_results')
    .select('resultado_json, puntuacion_bruta, severidad_label, screening_positivo')
    .eq('id', resultId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Resultado no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    resultado_json:     data.resultado_json,
    puntuacion_bruta:   data.puntuacion_bruta,
    severidad_label:    data.severidad_label,
    screening_positivo: data.screening_positivo,
  })
}
