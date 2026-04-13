'use client'
// src/app/pago/exitoso/page.tsx

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function PagoExitosoContent() {
  const params    = useSearchParams()
  const router    = useRouter()
  const tipo      = params?.get('tipo') || 'pago'
  const status    = params?.get('status') || 'approved'
  const paymentId = params?.get('payment_id') || null
  const [secs, setSecs]       = useState(6)
  const [verified, setVerified] = useState(false)

  const isPending = status === 'pending' || status === 'in_process'
  const destino   = tipo === 'cita' ? '/dashboard?tab=mis-citas' : tipo === 'evento' ? '/dashboard?tab=compras' : '/dashboard'

  // Fallback: actualizar DB con el payment_id que MP envía en la URL de retorno.
  // Garantiza que la DB se actualice aunque el webhook no haya llegado todavía
  // (habitual en desarrollo local sin ngrok expuesto).
  useEffect(() => {
    if (!paymentId || isPending || verified) return
    setVerified(true)
    fetch(`/api/mp/verify-redirect?payment_id=${paymentId}`).catch(() => {})
  }, [paymentId, isPending, verified])

  useEffect(() => {
    if (secs <= 0) { router.push(destino); return }
    const t = setTimeout(() => setSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs, destino, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8fb', fontFamily: 'DM Sans, system-ui' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '90%', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: isPending ? '#FFF8E1' : '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          {isPending ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#F57F17"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#2E7D32"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          )}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', fontFamily: 'Raleway, sans-serif' }}>
          {isPending ? 'Pago en proceso' : '¡Pago confirmado!'}
        </h1>
        <p style={{ fontSize: 15, color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
          {isPending
            ? 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
            : tipo === 'cita'
              ? 'Tu sesión ha sido reservada. El Menter recibirá la solicitud y la confirmará.'
              : tipo === 'evento'
                ? 'Tu entrada ha sido confirmada. Revisa tu email para los detalles.'
                : 'Tu pago ha sido procesado exitosamente.'}
        </p>

        <button
          onClick={() => router.push(destino)}
          style={{ background: '#421869', color: '#fff', border: 'none', borderRadius: 30, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', marginBottom: 16, width: '100%' }}
        >
          {tipo === 'cita' ? 'Ver mis citas' : tipo === 'evento' ? 'Ver mis compras' : 'Ir al dashboard'}
        </button>
        <p style={{ fontSize: 12, color: '#bbb' }}>Redirigiendo en {secs}s…</p>
      </div>
    </div>
  )
}

export default function PagoExitosoPage() {
  return (
    <Suspense>
      <PagoExitosoContent />
    </Suspense>
  )
}
