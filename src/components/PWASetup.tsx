'use client'

import { useEffect } from 'react'

export default function PWASetup() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Capture the install prompt so it can be triggered manually
    const handler = (e: Event) => {
      e.preventDefault()
      ;(window as any)._deferredInstallPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return null
}
