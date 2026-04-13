'use client'
// src/app/pago/error/page.tsx

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function PagoErrorContent() {
  const params = useSearchParams()
  const router = useRouter()
  const tipo   = params?.get('tipo') || 'pago'
  const ref    = params?.get('ref') || ''

  const volver = tipo === 'cita' ? '/dashboard?tab=mis-citas' : tipo === 'evento' ? '/dashboard?tab=compras' : '/dashboard'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8fb', fontFamily: 'DM Sans, system-ui' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '90%', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#B71C1C"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', fontFamily: 'Raleway, sans-serif' }}>
          Pago no completado
        </h1>
        <p style={{ fontSize: 15, color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
          Tu pago no pudo procesarse. No se hizo ningún cargo. Puedes intentarlo nuevamente o elegir otro método de pago.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ref && (
            <button
              onClick={async () => {
                const type = tipo === 'cita' ? 'appointment' : 'event_reg'
                const res  = await fetch('/api/mp/create-preference', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type, id: ref }),
                })
                const data = await res.json()
                if (data.init_point) window.location.href = data.init_point
              }}
              style={{ background: '#421869', color: '#fff', border: 'none', borderRadius: 30, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}
            >
              Intentar de nuevo
            </button>
          )}
          <button
            onClick={() => router.push(volver)}
            style={{ background: 'transparent', color: '#421869', border: '2px solid #421869', borderRadius: 30, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PagoErrorPage() {
  return (
    <Suspense>
      <PagoErrorContent />
    </Suspense>
  )
}
