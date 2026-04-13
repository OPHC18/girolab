'use client'
// src/app/pago/pendiente/page.tsx

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function PagoPendienteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const tipo   = params?.get('tipo') || 'pago'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8fb', fontFamily: 'DM Sans, system-ui' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '90%', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#F57F17"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', fontFamily: 'Raleway, sans-serif' }}>
          Pago en espera
        </h1>
        <p style={{ fontSize: 15, color: '#666', margin: '0 0 16px', lineHeight: 1.6 }}>
          Tu pago está pendiente de confirmación. Esto puede ocurrir si elegiste pago en efectivo u otro método diferido.
        </p>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
          Una vez confirmado el pago recibirás un email y tu reserva quedará activa. Puede tomar hasta 2 días hábiles.
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          style={{ background: '#421869', color: '#fff', border: 'none', borderRadius: 30, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', width: '100%' }}
        >
          Ir al dashboard
        </button>
      </div>
    </div>
  )
}

export default function PagoPendientePage() {
  return (
    <Suspense>
      <PagoPendienteContent />
    </Suspense>
  )
}
