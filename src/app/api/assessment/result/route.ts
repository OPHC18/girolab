// src/app/api/assessment/result/route.ts
// Devuelve un resultado de evaluación bypasando RLS con service role.
// El UUID del resultado ya actúa como secreto — no requiere validación adicional de token.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const resultId = searchParams.get('r')

  if (!resultId) {
    return NextResponse.json({ error: 'Parámetros faltantes' }, { status: 400 })
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
