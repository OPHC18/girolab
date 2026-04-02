'use client' // unirse
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function UnirseObjetivo() {
  const { token } = useParams()
  const router = useRouter()
  const [objetivo, setObjetivo] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: obj } = await supabase
        .from('empresa_objetivos')
        .select('id, titulo, area, descripcion, status')
        .eq('invite_token', token)
        .eq('status', 'activo')
        .single()

      if (!obj) { setMsg('Este link no es válido o el objetivo ya no está activo.'); setLoading(false); return }
      setObjetivo(obj)

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    init()
  }, [token])

  const handleUnirse = async () => {
    if (!user || !objetivo) return
    setJoining(true)

    const { data: yaEsta } = await supabase
      .from('empresa_objetivo_colaboradores')
      .select('id')
      .eq('objetivo_id', objetivo.id)
      .eq('user_id', user.id)
      .single()

    if (yaEsta) {
      setMsg('¡Ya eres parte de este objetivo!')
      setTimeout(() => router.push('/dashboard'), 2000)
      return
    }

    const { error } = await supabase
      .from('empresa_objetivo_colaboradores')
      .insert({ objetivo_id: objetivo.id, user_id: user.id })

    setJoining(false)
    if (error) { setMsg('Error al unirte. Intenta de nuevo.'); return }
    setMsg('🎉 ¡Te uniste exitosamente! Ve a tu Ruta de Bienestar para ver el objetivo.')
    setTimeout(() => router.push('/dashboard?tab=roadmap'), 2500)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#421869' }}>
      <DotLottieReact src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie" autoplay loop style={{ width: 120, height: 120 }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '32px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <h1 style={{ color: 'white', fontFamily: 'Raleway', fontSize: 20, margin: 0, fontWeight: 800 }}>
            Únete al equipo
          </h1>
        </div>

        <div style={{ padding: 32 }}>
          {msg ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 16, color: '#421869', fontWeight: 600 }}>{msg}</p>
            </div>
          ) : objetivo ? (
            <>
              <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 4px', textTransform: 'uppercase' as const, fontWeight: 700 }}>Objetivo</p>
                <h2 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 18, margin: '0 0 8px' }}>{objetivo.titulo}</h2>
                {objetivo.area && (
                  <span style={{ fontSize: 12, padding: '3px 12px', borderRadius: 20, background: '#f3e8ff', color: '#6a1b9a', fontWeight: 600 }}>
                    {objetivo.area}
                  </span>
                )}
                {objetivo.descripcion && (
                  <p style={{ fontSize: 14, color: '#666', margin: '12px 0 0', lineHeight: 1.6 }}>{objetivo.descripcion}</p>
                )}
              </div>

              {user ? (
                <>
                  <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#2e7d32' }}>
                    ✅ Conectado como <strong>{user.email}</strong>
                  </div>
                  <button
                    onClick={handleUnirse}
                    disabled={joining}
                    style={{ width: '100%', padding: 14, borderRadius: 20, border: 'none', background: joining ? '#ccc' : '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway' }}
                  >
                    {joining ? 'Uniéndome...' : '🤝 Unirme a este objetivo →'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' as const }}>
                    Debes registrarte como usuario <strong>Persona</strong> en Giro Lab para unirte a este objetivo.
                  </p>
                  <a
                    href={`/?returnUrl=/unirse/${token}`}
                   
                  >
                    Registrarme como Persona →
                  </a>
                </>
              )}
            </>
          ) : (
            <p style={{ textAlign: 'center' as const, color: '#666' }}>Link inválido o expirado.</p>
          )}
        </div>
      </div>
    </div>
  )
}