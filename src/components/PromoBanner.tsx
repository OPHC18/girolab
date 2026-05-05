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

function useCountdown(expiresAt: string | null) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    if (!expiresAt) return
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft(''); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      if (d > 0) setTimeLeft(`${d}d ${h}h`)
      else if (h > 0) setTimeLeft(`${h}h ${m}m`)
      else setTimeLeft(`${m} min`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [expiresAt])
  return timeLeft
}

export default function PromoBanner() {
  const [promo, setPromo] = useState<Promo | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const timeLeft = useCountdown(promo?.expires_at ?? null)

  useEffect(() => {
    setMounted(true)
    const key = 'promo_banner_dismissed'
    const stored = sessionStorage.getItem(key)
    fetch('/api/promos/active')
      .then(r => r.json())
      .then(({ promo: p }) => {
        if (!p) return
        if (stored === p.id) { setDismissed(true); return }
        setPromo(p)
      })
      .catch(() => {})
  }, [])

  const dismiss = () => {
    if (promo) sessionStorage.setItem('promo_banner_dismissed', promo.id)
    setDismissed(true)
  }

  if (!mounted || !promo || dismissed) return null

  const planText = promo.aplica_plan
    ? `plan ${promo.aplica_plan.charAt(0).toUpperCase() + promo.aplica_plan.slice(1)}`
    : 'cualquier plan'

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, #421869 0%, #7c3aed 50%, #421869 100%)',
      backgroundSize: '200% 100%',
      color: 'white',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      position: 'relative',
      zIndex: 1000,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 16 }}>🎁</span>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, fontFamily: 'Raleway, sans-serif', textAlign: 'center' }}>
        {promo.nombre}:
        <span style={{ color: '#ffa719', marginLeft: 6 }}>
          {promo.trial_dias} días de prueba gratis
        </span>
        <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.9 }}>
          para Menters — {planText}
        </span>
        {timeLeft && (
          <span style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            Vence en {timeLeft}
          </span>
        )}
      </p>
      <button
        onClick={() => router.push('/dashboard?tab=membresia')}
        style={{
          background: '#ffa719', color: '#2d2926', border: 'none',
          borderRadius: 20, padding: '5px 16px', fontWeight: 800,
          fontSize: 12, cursor: 'pointer', fontFamily: 'Raleway, sans-serif',
          whiteSpace: 'nowrap' as const, flexShrink: 0,
        }}>
        Activar prueba →
      </button>
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
          borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
          fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        ✕
      </button>
    </div>
  )
}
