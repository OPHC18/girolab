'use client'
import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushNotificationSetup({ userId: _userId }: { userId: string }) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    setPermission(Notification.permission)
    if (Notification.permission === 'granted') checkSubscription()
  }, [])

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') return

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    })

    const { data: { session } } = await (await import('@/app/lib/supabase')).supabase.auth.getSession()
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    })
    if (res.ok) setSubscribed(true)
  }

  // Registrar SW silenciosamente si ya tiene permiso
  useEffect(() => {
    if (permission === 'granted' && !subscribed && 'serviceWorker' in navigator) {
      subscribe()
    }
  }, [permission])

  if (dismissed || subscribed || permission === 'denied') return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#421869', color: 'white', borderRadius: 16, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: 340, width: 'calc(100% - 40px)'
    }}>
      <span style={{ fontSize: 22 }}>🔔</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, fontFamily: 'Raleway' }}>Activa las notificaciones</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.8 }}>Recibe recordatorios de tus citas</p>
      </div>
      <button
        onClick={subscribe}
        style={{
          background: '#ffa719', color: '#2d2926', border: 'none',
          borderRadius: 20, padding: '7px 14px', fontWeight: 800,
          fontSize: 12, cursor: 'pointer', fontFamily: 'Raleway', whiteSpace: 'nowrap'
        }}
      >
        Activar
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        aria-label="Cerrar"
      >✕</button>
    </div>
  )
}
