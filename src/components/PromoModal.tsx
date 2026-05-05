'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Promo {
  id: string
  nombre: string
  tipo: string
  trial_dias: number
  aplica_plan: string | null
  expires_at: string | null
}

export default function PromoModal() {
  const [promo, setPromo] = useState<Promo | null>(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/promos/active')
      .then(r => r.json())
      .then(({ promo: p }) => {
        if (!p) return
        const key = `promo_modal_seen_${p.id}`
        if (sessionStorage.getItem(key)) return
        setPromo(p)
        // Mostrar después de 3s para no interrumpir la carga
        setTimeout(() => setVisible(true), 3000)
      })
      .catch(() => {})
  }, [])

  const close = () => {
    if (promo) sessionStorage.setItem(`promo_modal_seen_${promo.id}`, '1')
    setVisible(false)
  }

  const activate = () => {
    close()
    router.push('/dashboard?tab=membresia')
  }

  if (!promo || !visible) return null

  const planText = promo.aplica_plan
    ? `el plan ${promo.aplica_plan.charAt(0).toUpperCase() + promo.aplica_plan.slice(1)}`
    : 'cualquier plan Menter'

  const expiresStr = promo.expires_at
    ? new Date(promo.expires_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
    : null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.3s ease',
      }}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 24, width: '100%', maxWidth: 420,
          overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.35s ease',
        }}>
        {/* Header degradado */}
        <div style={{
          background: 'linear-gradient(135deg, #421869 0%, #7c3aed 100%)',
          padding: '28px 28px 24px', textAlign: 'center', position: 'relative',
        }}>
          <button
            onClick={close}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎁</div>
          <h2 style={{ margin: 0, color: 'white', fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 900 }}>
            {promo.nombre}
          </h2>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            Oferta exclusiva para Menters
          </p>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{
            background: '#f3e8ff', borderRadius: 16, padding: '18px 20px',
            textAlign: 'center', marginBottom: 20,
          }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: '#421869', fontFamily: 'Raleway, sans-serif', lineHeight: 1 }}>
              {promo.trial_dias}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#421869', marginTop: 2 }}>
              días de prueba completamente gratis
            </div>
            <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 4 }}>
              en {planText}
            </div>
          </div>

          <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Solo necesitas registrar tu tarjeta',
              'Sin cobro hasta que termine la prueba',
              'Cancela cuando quieras, sin penalidad',
              'Acceso completo desde el primer día',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#444' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          {expiresStr && (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#e65100', fontWeight: 600, marginBottom: 16 }}>
              Oferta válida hasta el {expiresStr}
            </div>
          )}

          <button
            onClick={activate}
            style={{
              width: '100%', padding: '14px', borderRadius: 30, border: 'none',
              background: 'linear-gradient(90deg, #421869, #7c3aed)',
              color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              fontFamily: 'Raleway, sans-serif', marginBottom: 10,
            }}>
            Activar mi prueba gratis →
          </button>
          <button
            onClick={close}
            style={{
              width: '100%', padding: '10px', borderRadius: 30, border: 'none',
              background: 'transparent', color: '#999', fontWeight: 600,
              fontSize: 13, cursor: 'pointer',
            }}>
            No, gracias
          </button>
        </div>
      </div>
    </div>
  )
}
