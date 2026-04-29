'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState('')
  const [ready, setReady]             = useState(false)

  useEffect(() => {
    // Supabase procesa el hash automáticamente; esperamos sesión de tipo recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Si ya hay sesión activa (usuario viene del link), marcar listo
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 2500)
  }

  const s = {
    wrap:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0618', padding: 24 } as const,
    card:  { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420 } as const,
    title: { fontFamily: 'Raleway, sans-serif', color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 8 } as const,
    sub:   { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 28 } as const,
    label: { display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 6 } as const,
    input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const },
    btn:   { width: '100%', padding: '14px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', marginTop: 8 } as const,
    err:   { color: '#ff6b6b', fontSize: 13, marginTop: 8 } as const,
  }

  if (!ready) return (
    <div style={s.wrap}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Verificando enlace...</div>
    </div>
  )

  if (done) return (
    <div style={s.wrap}>
      <div style={{ ...s.card, textAlign: 'center' as const }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ ...s.title, textAlign: 'center' as const }}>¡Contraseña actualizada!</h2>
        <p style={s.sub}>Te estamos redirigiendo a tu dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h2 style={s.title}>Nueva contraseña</h2>
        <p style={s.sub}>Ingresa tu nueva contraseña para continuar.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Nueva contraseña</label>
            <input
              type="password"
              style={s.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Confirmar contraseña</label>
            <input
              type="password"
              style={s.input}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          {error && <p style={s.err}>{error}</p>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
