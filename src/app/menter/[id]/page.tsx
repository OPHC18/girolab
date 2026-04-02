'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import AgendaModalPublico from '@/components/AgendaModalPublico'

export default function MenterPage() {
  const { id } = useParams()
  const [perfil, setPerfil] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiadoMsg, setCopiadoMsg] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchPerfil()
  }, [id])

  const fetchPerfil = async () => {
    const { data: profileData } = await supabase
      .from('menter_profile')
      .select('*')
      .eq('menter_id', id)
      .single()

    const { data: userData } = await supabase
      .from('menter_public_profiles')
      .select('nombre, avatar_url, plan')
      .eq('id', id)
      .single()

    if (profileData || userData) {
      setPerfil({ ...profileData, nombre: userData?.nombre, avatar_url: userData?.avatar_url, plan: userData?.plan })
    }

    const { data: postsData } = await supabase
      .from('blog_posts').select('*').eq('menter_id', id).eq('status', 'publicado')
      .order('created_at', { ascending: false }).limit(3)
    setPosts(postsData || [])

    const { data: eventosData } = await supabase
      .from('events').select('*, event_tickets(*)').eq('menter_id', id).eq('status', 'publicado')
      .gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).limit(3)
    setEventos(eventosData || [])

    setLoading(false)
  }

  const modalidadLabel: Record<string, string> = {
    video: '💻 Virtual',
    presencial: '📍 Presencial',
    ambas: '💻📍 Virtual y Presencial'
  }

  return (
    <div style={{ backgroundColor: '#421869', minHeight: '100vh', position: 'relative' }}>
      <style>{`
        @keyframes animateUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @media (max-width: 768px) {
          .menter-layout { flex-direction: column !important; }
          .menter-sidebar-wrapper { width: 100% !important; }
        }
      `}</style>

      <ul style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', margin: 0, padding: 0, zIndex: 0, pointerEvents: 'none', listStyle: 'none' }}>
        {[{left:'25%',size:80,delay:0,dur:25},{left:'10%',size:20,delay:2,dur:12},{left:'70%',size:20,delay:4,dur:25},{left:'40%',size:60,delay:8,dur:20},{left:'85%',size:30,delay:1,dur:18}].map((c,i) => (
          <li key={i} style={{ position:'absolute', display:'block', width:c.size, height:c.size, background:'rgba(255,255,255,0.05)', bottom:-150, left:c.left, borderRadius:'50%', animation:`animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </ul>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>← Dashboard</a>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ color: 'white', fontSize: 16, fontFamily: 'Raleway', fontWeight: 800, letterSpacing: 1 }}>GIRO LAB</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>Cargando...</div>
      ) : !perfil ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>Perfil no encontrado.</div>
      ) : (
        <div className="menter-layout" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'stretch', gap: 24, padding: '0 32px 60px', maxWidth: 1100, margin: '0 auto' }}>

          {/* Sidebar */}
          <div className="menter-sidebar-wrapper" style={{ width: '30%', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Card glassmorphism */}
              <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>

                {/* Header morado */}
                <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '24px 20px 20px', textAlign: 'center' }}>
                  {perfil.avatar_url ? (
                    <img src={perfil.avatar_url} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' as const, border: '3px solid rgba(255,255,255,0.5)', display: 'block', margin: '0 auto 12px' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white', margin: '0 auto 12px' }}>
                      {perfil.nombre?.[0] || 'M'}
                    </div>
                  )}
                  <h2 style={{ margin: '0 0 8px', color: 'white', fontFamily: 'Raleway', fontSize: 18, fontWeight: 800 }}>{perfil.nombre || 'Menter'}</h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {perfil.pais && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>📍 {perfil.pais}</span>}
                    {perfil.plan && (
                      <span style={{ fontSize: 11, background: perfil.plan === 'master' ? '#ffa719' : 'rgba(255,255,255,0.2)', color: perfil.plan === 'master' ? '#2d2926' : 'white', padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' as const }}>
                        {perfil.plan}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Precio y modalidad */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 3 }}>Precio</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{perfil.precio_sesion ? `$${perfil.precio_sesion} USD` : 'A acordar'}</div>
                      {perfil.duracion_sesion && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{perfil.duracion_sesion} min</div>}
                    </div>
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 3 }}>Modalidad</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{modalidadLabel[perfil.modalidad || ''] || perfil.modalidad || '—'}</div>
                    </div>
                  </div>

                  {/* Idiomas */}
                  {perfil.idiomas?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 6 }}>🌍 Idiomas</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(Array.isArray(perfil.idiomas) ? perfil.idiomas : [perfil.idiomas]).map((idioma: string) => (
                          <span key={idioma} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }}>{idioma}</span>
                        ))}
                      </div>
                    </div>
                  )}

                 {user ? (
  <button onClick={() => setShowAgenda(true)} style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 20, background: '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'Raleway', textAlign: 'center', marginTop: 4 }}>
    📅 Agendar sesión
  </button>
) : (
  <a href={`/?returnUrl=${typeof window !== 'undefined' ? window.location.pathname : ''}`} style={{ display: 'block', padding: '12px', borderRadius: 20, background: '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 14, textDecoration: 'none', fontFamily: 'Raleway', textAlign: 'center', marginTop: 4 }}>
    Regístrate para agendar →
  </a>
)}
                </div>
              </div>

              {/* Botón compartir */}
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href).then(() => { setCopiadoMsg(true); setTimeout(() => setCopiadoMsg(false), 3000) })}
                style={{ padding: '10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)', background: copiadoMsg ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                {copiadoMsg ? '✅ Link copiado' : '🔗 Compartir perfil'}
              </button>

            </div>
          </div>

          {/* Contenido principal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

              {perfil.bio && (
                <div style={{ padding: '24px 28px' }}>
                  <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 8px' }}>Sobre mí</h4>
                  <p style={{ color: '#4d4d4d', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{perfil.bio}</p>
                </div>
              )}

              {perfil.bio && perfil.casos_que_atiende?.length > 0 && <div style={{ height: 1, background: '#f0f0f0'}} />}

              {perfil.casos_que_atiende?.length > 0 && (
                <div style={{ padding: '24px 28px' }}>
                  <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 10px' }}>Especialidades</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {perfil.casos_que_atiende.map((c: string) => (
                      <span key={c} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f3e8ff', color: '#6a1b9a', fontWeight: 600 }}>{c}</span>
                    ))}
                  </div>
                  {perfil.casos_otros && <p style={{ fontSize: 13, color: '#666', marginTop: 10, marginBottom: 0 }}>{perfil.casos_otros}</p>}
                </div>
              )}

              {perfil.casos_que_atiende?.length > 0 && perfil.formacion?.length > 0 && <div style={{ height: 1, background: '#f0f0f0' }} />}

              {perfil.formacion?.length > 0 && (
                <div style={{ padding: '24px 28px' }}>
                  <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 10px' }}>🎓 Formación académica</h4>
                  {perfil.formacion.map((f: any, i: number) => (
                    <div key={i} style={{ padding: '10px 14px', background: '#f8f9fa', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#421869' }}>{typeof f === 'string' ? f : f.titulo || f.grado}</div>
                      {f.institucion && <div style={{ fontSize: 13, color: '#666' }}>{f.institucion}</div>}
                      {(f.anio_inicio || f.anio_fin) && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{f.anio_inicio}{f.anio_fin ? ` — ${f.anio_fin}` : ''}</div>}
                    </div>
                  ))}
                </div>
              )}

              {perfil.formacion?.length > 0 && perfil.experiencia_laboral?.length > 0 && <div style={{ height: 1, background: '#f0f0f0' }} />}

              {perfil.experiencia_laboral?.length > 0 && (
                <div style={{ padding: '24px 28px' }}>
                  <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 10px' }}>💼 Experiencia laboral</h4>
                  {perfil.experiencia_laboral.map((e: any, i: number) => (
                    <div key={i} style={{ padding: '10px 14px', background: '#f8f9fa', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#421869' }}>{typeof e === 'string' ? e : e.cargo || e.puesto}</div>
                      {e.empresa && <div style={{ fontSize: 13, color: '#666' }}>{e.empresa}</div>}
                      {(e.anio_inicio || e.anio_fin) && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{e.anio_inicio}{e.anio_fin ? ` — ${e.anio_fin}` : ''}</div>}
                    </div>
                  ))}
                </div>
              )}

              {perfil.numero_colegiatura && (
                <>
                  <div style={{ height: 1, background: '#f0f0f0' }} />
                  <div style={{ padding: '16px 28px' }}>
                    <div style={{ padding: '10px 14px', background: '#f3e8ff', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🏅</span>
                      <div>
                        <div style={{ fontSize: 11, color: '#6a1b9a', fontWeight: 700, textTransform: 'uppercase' as const }}>Colegiatura</div>
                        <div style={{ fontSize: 14, color: '#421869', fontWeight: 600 }}>{perfil.numero_colegiatura}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {perfil.enlaces && Object.values(perfil.enlaces).some((v: any) => v) && (
                <>
                  <div style={{ height: 1, background: '#f0f0f0' }} />
                  <div style={{ padding: '24px 28px' }}>
                    <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 10px' }}>🔗 Redes y contacto</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {perfil.enlaces.linkedin && <a href={perfil.enlaces.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#0077b5', color: 'white', fontWeight: 600, textDecoration: 'none' }}>LinkedIn</a>}
                      {perfil.enlaces.instagram && <a href={perfil.enlaces.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#e1306c', color: 'white', fontWeight: 600, textDecoration: 'none' }}>Instagram</a>}
                      {perfil.enlaces.facebook && <a href={perfil.enlaces.facebook} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#1877f2', color: 'white', fontWeight: 600, textDecoration: 'none' }}>Facebook</a>}
                      {perfil.enlaces.tiktok && <a href={perfil.enlaces.tiktok} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#010101', color: 'white', fontWeight: 600, textDecoration: 'none' }}>TikTok</a>}
                      {perfil.enlaces.x && <a href={perfil.enlaces.x} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#000', color: 'white', fontWeight: 600, textDecoration: 'none' }}>X</a>}
                      {perfil.enlaces.youtube && <a href={perfil.enlaces.youtube} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#ff0000', color: 'white', fontWeight: 600, textDecoration: 'none' }}>YouTube</a>}
                      {perfil.enlaces.whatsapp && <a href={`https://wa.me/${perfil.enlaces.whatsapp}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#25d366', color: 'white', fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>}
                    </div>
                  </div>
                </>
              )}

              {posts.length > 0 && (
                <>
                  <div style={{ height: 1, background: '#f0f0f0' }} />
                  <div style={{ padding: '24px 28px' }}>
                    <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 12px' }}>📝 Últimos artículos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {posts.map(post => (
                        <a key={post.id} href={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, padding: '12px', background: '#f8f9fa', borderRadius: 12, alignItems: 'center' }}>
                          {post.cover_image && <img src={post.cover_image} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' as const, flexShrink: 0 }} />}
                          <div>
                            <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 13, color: '#421869', lineHeight: 1.3 }}>{post.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {eventos.length > 0 && (
                <>
                  <div style={{ height: 1, background: '#f0f0f0' }} />
                  <div style={{ padding: '24px 28px' }}>
                    <h4 style={{ color: '#421869', fontFamily: 'Raleway', margin: '0 0 12px' }}>🎪 Próximos eventos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {eventos.map(evento => (
                        <a key={evento.id} href={`/eventos/${evento.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, padding: '12px', background: '#f8f9fa', borderRadius: 12, alignItems: 'center' }}>
                          {evento.cover_image && <img src={evento.cover_image} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' as const, flexShrink: 0 }} />}
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 13, color: '#421869', lineHeight: 1.3 }}>{evento.title}</p>
                            <p style={{ margin: '0 0 3px', fontSize: 11, color: '#666' }}>📅 {new Date(evento.date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} · {evento.start_time?.slice(0,5)}</p>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#421869' }}>
                              {(evento.event_tickets || []).length === 0 ? '🆓 Gratis'
                                : Math.min(...(evento.event_tickets || []).map((t: any) => t.price)) === 0 ? '🆓 Gratis'
                                : `💰 Desde $${Math.min(...(evento.event_tickets || []).map((t: any) => t.price))} USD`}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!user && (
                <>
                  <div style={{ height: 1, background: '#f0f0f0' }} />
                  <div style={{ padding: '28px', textAlign: 'center', background: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)' }}>
                    <h3 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 18, margin: '0 0 10px' }}>
                      ¿Listo para conectar con {perfil.nombre?.split(' ')[0] || 'este Menter'}?
                    </h3>
                    <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px' }}>Regístrate en Giro Lab y agenda tu primera sesión.</p>
                    <a href={`/?returnUrl=${typeof window !== 'undefined' ? window.location.pathname : ''}`} style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 20, background: '#421869', color: 'white', fontWeight: 800, fontSize: 14, textDecoration: 'none', fontFamily: 'Raleway' }}>
                      Empezar ahora →
                    </a>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ✅ Modal agenda — fuera de todo, al nivel del div raíz */}
      {showAgenda && user && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAgenda(false)}>
          <div style={{ background: 'white', borderRadius: 20, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 28px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontFamily: 'Raleway' }}>📅 Agendar sesión</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>con {perfil.nombre}</p>
              </div>
              <button onClick={() => setShowAgenda(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <AgendaModalPublico
              menter={{ ...perfil, menter_id: id }}
              user={user}
              onClose={() => setShowAgenda(false)}
              onBooked={() => setShowAgenda(false)}
            />
          </div>
        </div>
      )}

    </div>
  )
}