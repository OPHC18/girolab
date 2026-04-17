'use client'

import { useEffect, useRef, useState } from 'react'

// Version baked in at build time (VERCEL_GIT_COMMIT_SHA via next.config.ts)
const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || ''

export function UpdateBanner() {
  const [show, setShow] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // No polling in local dev where BUILD_VERSION is empty
    if (!BUILD_VERSION) return

    const check = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { version } = await res.json()
        if (version && version !== BUILD_VERSION) {
          setShow(true)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch { /* network error — ignore */ }
    }

    // Check after 60s (give page time to fully load), then every 5 min
    const timeout = setTimeout(() => {
      check()
      intervalRef.current = setInterval(check, 5 * 60 * 1000)
    }, 60_000)

    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
      background: '#421869', color: 'white',
      padding: '12px 20px', borderRadius: 40,
      boxShadow: '0 8px 32px rgba(66,24,105,0.45)',
      fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      Nueva version disponible
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#ffa719', color: '#2d2926', border: 'none',
          borderRadius: 20, padding: '6px 16px', fontSize: 13,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif',
        }}
      >
        Actualizar
      </button>
      <button
        onClick={() => setShow(false)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}
        aria-label="Cerrar"
      >
        x
      </button>
    </div>
  )
}
