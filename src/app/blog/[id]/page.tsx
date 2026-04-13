'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import { getRecaptchaToken, verifyRecaptcha } from '@/lib/recaptcha'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [likes, setLikes] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [comment, setComment] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchPost()
    fetchComments()
    fetchLikes()
  }, [id])

  const [eventosProximos, setEventosProximos] = useState<any[]>([])

useEffect(() => {
  if (!post?.menter_id) return
  // Primero eventos del Menter autor
  supabase
    .from('events')
    .select('*, event_tickets(*)')
    .eq('menter_id', post.menter_id)
    .eq('status', 'publicado')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(3)
    .then(({ data: eventosMenter }) => {
      if ((eventosMenter || []).length < 3) {
        // Completa con eventos destacados de otros Menters
        supabase
          .from('events')
          .select('*, event_tickets(*), menter:menter_public_profiles(nombre, avatar_url)')
          .eq('status', 'publicado')
          .neq('menter_id', post.menter_id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(3 - (eventosMenter || []).length)
          .then(({ data: otrosEventos }) => {
            setEventosProximos([...(eventosMenter || []), ...(otrosEventos || [])])
          })
      } else {
        setEventosProximos(eventosMenter || [])
      }
    })
}, [post?.menter_id])

  const fetchPost = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*, menter:menter_public_profiles(nombre, avatar_url, plan)')
      .eq('id', id)
      .single()
    if (data) {
      const { sanitizeHtml } = await import('@/lib/sanitize')
      data.content = await sanitizeHtml(data.content || '')
    }
    setPost(data)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('blog_comments')
      .select('*, user:user_id(raw_user_meta_data)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const fetchLikes = async () => {
    const { count } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', id)
    setLikes(count || 0)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('blog_likes').select('*').eq('post_id', id).eq('user_id', user.id)
      setUserLiked((data || []).length > 0)
    }
  }

  const handleComment = async () => {
    if (!comment.trim() || !user) return
    const token = await getRecaptchaToken('comentario')
    if (token) {
      const ok = await verifyRecaptcha(token, 'comentario')
      if (!ok) return // silencioso — bot rechazado sin alertar
    }
    await supabase.from('blog_comments').insert({ post_id: id, user_id: user.id, content: comment })
    setComment('')
    fetchComments()
  }

  return (
    <div style={{ backgroundColor: '#421869', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      <style>{`
        @keyframes animateUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @media (max-width: 768px) {
          .blog-post-layout { flex-direction: column !important; }
          .blog-post-cta { width: 100% !important; position: static !important; }
          .blog-post-content { width: 100% !important; }
        }
      `}</style>

      {/* Círculos animados */}
      <ul style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', margin: 0, padding: 0, zIndex: 0, pointerEvents: 'none', listStyle: 'none' }}>
        {[{left:'25%',size:80,delay:0,dur:25},{left:'10%',size:20,delay:2,dur:12},{left:'70%',size:20,delay:4,dur:25},{left:'40%',size:60,delay:8,dur:20},{left:'85%',size:30,delay:1,dur:18}].map((c,i) => (
          <li key={i} style={{ position:'absolute', display:'block', width:c.size, height:c.size, background:'rgba(255,255,255,0.05)', bottom:-150, left:c.left, borderRadius:'50%', animation:`animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </ul>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          ← Dashboard
        </a>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ color: 'white', fontSize: 16, fontFamily: 'Raleway', fontWeight: 800, letterSpacing: 1 }}>GIRO LAB</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
          Cargando...
        </div>
      ) : !post ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
          Post no encontrado.
        </div>
      ) : (
        <div className="blog-post-layout" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 24, padding: '0 32px 60px', maxWidth: 1100, margin: '0 auto' }}>

<div className="blog-post-cta" style={{ width: '30%', flexShrink: 0, position: 'sticky', top: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
  {user ? (
    /* Usuario logueado — eventos próximos */
    <>
      {eventosProximos.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h3 style={{ fontFamily: 'Raleway', color: 'white', fontSize: 14, fontWeight: 800, margin: '0 0 14px' }}>
            🎪 Eventos próximos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {eventosProximos.map((evento: any) => (
              <a key={evento.id} href={`/eventos/${evento.id}`}
                style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', display: 'block' }}>
                {evento.cover_image && (
                  <img src={evento.cover_image} style={{ width: '100%', height: 80, objectFit: 'cover' as const, borderRadius: 8, marginBottom: 8 }} />
                )}
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: 'white', lineHeight: 1.3 }}>
                  {evento.title}
                </p>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  📅 {new Date(evento.date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  {evento.start_time && ` · ${evento.start_time.slice(0,5)}`}
                </p>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ffa719' }}>
                  {(evento.event_tickets || []).length === 0 ? '🆓 Gratis'
                    : Math.min(...(evento.event_tickets || []).map((t: any) => t.price)) === 0 ? '🆓 Gratis'
                    : `💰 Desde $${Math.min(...(evento.event_tickets || []).map((t: any) => t.price))} USD`}
                </span>
              </a>
            ))}
          </div>
          <a href="/dashboard?tab=eventos" style={{ display: 'block', marginTop: 12, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>
            Ver todos los eventos →
          </a>
        </div>
      )}
    </>
  ) : (
    /* No logueado — CTAs */
    <>
      <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '28px 20px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
        <h3 style={{ fontFamily: 'Raleway', color: 'white', fontSize: 15, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
          ¿Buscas bienestar?
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
          Conecta con un Menter especializado. Para ti o para tu empresa.
        </p>
        <a href={`/?returnUrl=${typeof window !== 'undefined' ? window.location.pathname : ''}`} style={{ display: 'block', padding: '11px 16px', borderRadius: 20, background: '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 13, textDecoration: 'none', fontFamily: 'Raleway' }}>
          Empezar ahora →
        </a>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '28px 20px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
        <h3 style={{ fontFamily: 'Raleway', color: 'white', fontSize: 15, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
          ¿Eres profesional del bienestar?
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
          Comparte tu conocimiento y haz crecer tu práctica en Giro Lab.
        </p>
        <a href={`/?returnUrl=${typeof window !== 'undefined' ? window.location.pathname : ''}`} style={{ display: 'block', padding: '11px 16px', borderRadius: 20, background: 'white', color: '#421869', fontWeight: 800, fontSize: 13, textDecoration: 'none', fontFamily: 'Raleway' }}>
          Ser Menter →
        </a>
      </div>
    </>
  )}
</div>

          {/* Columna derecha — 70% — contenido */}
          <div className="blog-post-content" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

              {post.cover_image && (
                <img src={post.cover_image} alt={post.title}
                  style={{ width: '100%', height: 300, objectFit: 'cover' }} />
              )}

              <div style={{ padding: '32px' }}>

                {/* Autor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  {post.menter?.avatar_url ? (
                    <img src={post.menter.avatar_url} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' as const }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                      {post.menter?.nombre?.[0] || 'M'}
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#421869' }}>
                      {post.menter?.nombre || 'Menter'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                      {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <h1 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 26, margin: '0 0 12px', lineHeight: 1.3 }}>
                  {post.title}
                </h1>

                {post.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                    {post.tags.map((tag: string) => (
                      <span key={tag} style={{ background: '#f3e8ff', color: '#6d28d9', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{ fontSize: 16, lineHeight: 1.9, color: '#333', marginBottom: 32 }} />

                {/* Like y compartir */}
                <div style={{ display: 'flex', gap: 12, padding: '16px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', marginBottom: 28 }}>
                  <span style={{ color: '#666', fontSize: 14 }}>❤️ {likes}</span>
                  <span style={{ color: '#666', fontSize: 14 }}>💬 {comments.length}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('🔗 Link copiado'))}
                    style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    🔗 Compartir
                  </button>
                </div>

                {/* Comentarios */}
                <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 16 }}>
                  💬 Comentarios ({comments.length})
                </h3>

                {!user ? (
                  <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: 20 }}>
                    <p style={{ color: '#666', fontSize: 14, margin: '0 0 12px' }}>
                      Únete a Giro Lab para comentar
                    </p>
                    <a href="/" style={{ padding: '8px 20px', borderRadius: 20, background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                      Registrarme gratis
                    </a>
                  </div>
                ) : (
                  <div style={{ marginBottom: 20 }}>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      rows={3}
                      style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                    />
                    <button onClick={handleComment}
                      style={{ marginTop: 8, padding: '10px 24px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Publicar
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {comments.map((c: any) => (
                    <div key={c.id} style={{ background: '#f8f9fa', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#421869', margin: '0 0 4px' }}>
                        {c.user?.raw_user_meta_data?.nombre || 'Usuario'}
                      </p>
                      <p style={{ fontSize: 14, color: '#333', margin: 0 }}>{c.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p style={{ color: '#999', fontSize: 14 }}>Sé el primero en comentar.</p>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}