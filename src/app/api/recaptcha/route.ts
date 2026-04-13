// src/app/api/recaptcha/route.ts
// Verifica tokens de reCAPTCHA v3 — llamado server-side antes de procesar cualquier form

import { NextRequest, NextResponse } from 'next/server'

const MIN_SCORE = 0.6 // 0.0 = bot, 1.0 = humano

// Acciones permitidas — cualquier otra se rechaza
const VALID_ACTIONS = new Set([
  'registro', 'login', 'comentario', 'agendar_cita', 'contacto',
])

export async function POST(req: NextRequest) {
  const { token, action } = await req.json()

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 400 })
  }

  if (!action || !VALID_ACTIONS.has(action)) {
    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 })
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ success: false, error: 'reCAPTCHA no configurado' }, { status: 500 })
  }

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${encodeURIComponent(token)}`,
  })

  const data = await res.json()

  if (!data.success) {
    console.warn('[recaptcha] fallo de Google — action:', action, '| errors:', data['error-codes'])
    return NextResponse.json(
      { success: false, error: 'Verificación de seguridad fallida' },
      { status: 400 }
    )
  }

  // Validar que la acción coincida con la esperada (evita reutilización de tokens)
  if (data.action !== action) {
    console.warn('[recaptcha] action mismatch — esperado:', action, '| recibido:', data.action)
    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 })
  }

  if (data.score < MIN_SCORE) {
    console.warn('[recaptcha] score bajo — score:', data.score, '| action:', action)
    return NextResponse.json(
      { success: false, score: data.score, error: 'Verificación de seguridad fallida' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, score: data.score })
}
