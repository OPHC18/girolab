'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const PLANES: Record<string, { color: string; bg: string; emoji: string }> = {
  free:    { color: '#666',    bg: '#f0f0f0', emoji: '🌱' },
  starter: { color: '#1565c0', bg: '#e3f2fd', emoji: '⚡' },
  premium: { color: '#6a1b9a', bg: '#f3e5f5', emoji: '💎' },
  master:  { color: '#e65100', bg: '#fff3e0', emoji: '👑' },
}

export default function ComunidadPage() {
  const router = useRouter()
  const composerRef = useRef<HTMLDivElement>(null)
  const [resenaDraft, setResenaDraft] = useState<{
    menter_name: string; menter_avatar: string; estrellas: number; comentario: string
  } | null>(null)
  const [user, setUser]       = useState<{ id: string; email: string } | null>(null)
  const [meta, setMeta]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feed, setFeed]       = useState<any[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [featuredMenters, setFeaturedMenters] = useState<any[]>([])
const [blogRecientes, setBlogRecientes]     = useState<any[]>([])
const [eventosProximos, setEventosProximos] = useState<any[]>([])
  const [offset, setOffset]   = useState(0)
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [postForm, setPostForm] = useState({ contenido: '', media_url: '', tipo: 'texto' })
  const [posting, setPosting] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [comentarios, setComentarios] = useState<Record<string, any[]>>({})
  const [comentarioInput, setComentarioInput] = useState<Record<string, string>>({})
  const [postExpandido, setPostExpandido] = useState<string | null>(null)
  const [misPostsMode, setMisPostsMode] = useState(false)
  const [misPosts, setMisPosts] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']

  useEffect(() => {
    const raw = sessionStorage.getItem('comunidad_draft_resena')
    if (raw) {
      try {
        const draft = JSON.parse(raw)
        setResenaDraft(draft)
        sessionStorage.removeItem('comunidad_draft_resena')
        setTimeout(() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
      } catch {}
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser({ id: session.user.id, email: session.user.email! })
      setMeta(session.user.user_metadata)
      setLoading(false)
      cargarFeed(0)
      // Cargar mis posts al inicio para que siempre estén disponibles
      const userMeta = session.user.user_metadata
      fetch('/api/community/my-posts', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }).then(r => r.ok ? r.json() : { posts: [] })
        .then(({ posts }) => setMisPosts((posts || []).map((p: any) => ({
          ...p,
          nombre: userMeta?.nombre, apellidos: userMeta?.apellidos,
          avatar_url: userMeta?.avatar_url || null, role: userMeta?.role,
          likes_count: p.likes_count || 0, comments_count: p.comments_count || 0, user_liked: false,
        }))))
        .catch(() => {})
      // Cargar sidebar data
supabase.rpc('get_featured_menters').then(({ data }) => setFeaturedMenters(data || []))

supabase.from('blog_posts')
  .select('id, title, cover_image, menter:menter_public_profiles(nombre)')
  .eq('status', 'publicado')
  .order('created_at', { ascending: false })
  .limit(4)
  .then(({ data }) => setBlogRecientes(data || []))

supabase.from('events')
  .select('id, title, date, start_time, modality, cover_image, price')
  .eq('status', 'publicado')
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true })
  .limit(5)
  .then(({ data, error }) => { if (!error) setEventosProximos(data || []) })
    }
    init()
  }, [])

  const cargarFeed = async (offsetVal: number) => {
    setFeedLoading(true)
    const { data } = await supabase.rpc('get_community_feed', {
      p_limit: 20, p_offset: offsetVal
    })
    if (data && data.length > 0) {
      // Fusionar campos de reseña que el RPC no retorna
      const ids = data.map((p: any) => p.id)
      const { data: extra } = await supabase
        .from('community_posts')
        .select('id, menter_name, menter_avatar, estrellas, resena_comentario')
        .in('id', ids)
      const extraMap: Record<string, any> = {}
      extra?.forEach((p: any) => { extraMap[p.id] = p })
      const merged = data.map((p: any) => ({ ...p, ...(extraMap[p.id] || {}) }))
      if (offsetVal === 0) setFeed(merged)
      else setFeed(prev => [...prev, ...merged])
      setHasMore(data.length === 20)
    } else if (data) {
      if (offsetVal === 0) setFeed([])
    }
    setOffset(offsetVal + 20)
    setFeedLoading(false)
  }

  const publicar = async () => {
    const esResena = !!resenaDraft
    if (!esResena && !postForm.contenido.trim() && !postForm.media_url) return
    setPosting(true)
    const payload: any = {
      user_id:   user!.id,
      tipo:      postForm.tipo,   // siempre 'texto'/'foto'/'video' — el campo menter_name indica reseña
      contenido: postForm.contenido || null,
      media_url: postForm.media_url || null,
    }
    if (esResena) {
      payload.menter_name        = resenaDraft!.menter_name
      payload.menter_avatar      = resenaDraft!.menter_avatar || null
      payload.estrellas          = resenaDraft!.estrellas
      payload.resena_comentario  = resenaDraft!.comentario || null
    }
    const { data: insertedRows, error } = await supabase.from('community_posts').insert(payload).select()
    if (!error) {
      const realId = insertedRows?.[0]?.id || crypto.randomUUID()
      const newPost = {
        id: realId,
        ...payload,
        nombre:         meta?.nombre,
        apellidos:      meta?.apellidos,
        avatar_url:     meta?.avatar_url || null,
        role:           meta?.role,
        likes_count:    0,
        comments_count: 0,
        user_liked:     false,
        created_at:     new Date().toISOString(),
      }
      setFeed(prev => [newPost, ...prev])
      setMisPosts(prev => [newPost, ...prev])
      setPostForm({ contenido: '', media_url: '', tipo: 'texto' })
      if (esResena) setResenaDraft(null)
      setToastMsg('Publicado en la comunidad')
      setTimeout(() => setToastMsg(null), 3000)
    } else {
      setAlertMsg(`Error al publicar: ${error.message}`)
    }
    setPosting(false)
  }

  const toggleLike = async (postId: string, userLiked: boolean) => {
    if (userLiked) {
      await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', user!.id)
    } else {
      await supabase.from('community_likes').insert({ post_id: postId, user_id: user!.id })
    }
    setFeed(prev => prev.map(p => p.id === postId
      ? { ...p, likes_count: userLiked ? p.likes_count - 1 : p.likes_count + 1, user_liked: !userLiked }
      : p
    ))
  }

  const cargarComentarios = async (postId: string) => {
    if (postExpandido === postId) { setPostExpandido(null); return }
    setPostExpandido(postId)
    if (comentarios[postId]) return
    const { data } = await supabase.from('community_comments')
      .select('*, user:user_id(raw_user_meta_data)')
      .eq('post_id', postId).order('created_at', { ascending: true })
    setComentarios(prev => ({ ...prev, [postId]: data || [] }))
  }

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const comentar = async (postId: string) => {
    const texto = comentarioInput[postId]?.trim()
    if (!texto) return
    const token = await getToken()
    const res = await fetch('/api/community/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ post_id: postId, contenido: texto }),
    })
    if (!res.ok) { setToastMsg('Error al enviar comentario'); setTimeout(() => setToastMsg(null), 3000); return }
    const nuevoComentario = {
      id: crypto.randomUUID(),
      post_id: postId,
      user_id: user!.id,
      contenido: texto,
      created_at: new Date().toISOString(),
      user: { raw_user_meta_data: meta },
    }
    setComentarios(prev => ({ ...prev, [postId]: [...(prev[postId] || []), nuevoComentario] }))
    setComentarioInput(prev => ({ ...prev, [postId]: '' }))
    setFeed(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
  }

  const eliminarComentario = async (postId: string, comentarioId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return
    const token = await getToken()
    await fetch('/api/community/comment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ comment_id: comentarioId }),
    })
    setComentarios(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== comentarioId) }))
    setFeed(prev => prev.map(p => p.id === postId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p))
  }

  const cargarMisPosts = async () => {
    if (!user) return
    const token = await getToken()
    const res = await fetch('/api/community/my-posts', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) return
    const { posts } = await res.json()
    setMisPosts((posts || []).map((p: any) => ({
      ...p,
      nombre: meta?.nombre,
      apellidos: meta?.apellidos,
      avatar_url: meta?.avatar_url || null,
      role: meta?.role,
      likes_count: p.likes_count || 0,
      comments_count: p.comments_count || 0,
      user_liked: false,
    })))
  }

  const eliminarPost = async (postId: string) => {
    if (!confirm('¿Eliminar esta publicación?')) return
    const token = await getToken()
    await fetch('/api/community/comment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ post_id: postId }),
    })
    setFeed(prev => prev.filter(p => p.id !== postId))
    setMisPosts(prev => prev.filter(p => p.id !== postId))
  }

  const fmtFecha = (f: string) => {
    const d = new Date(f)
    const ahora = new Date()
    const diff = Math.floor((ahora.getTime() - d.getTime()) / 1000)
    if (diff < 60)   return 'Ahora mismo'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#421869' }}>
      <div style={{ color: 'white', fontSize: 18 }}>Cargando comunidad...</div>
    </div>
  )

  const isMenter = meta?.role === 'menter'
  const planInfo = PLANES[meta?.plan || 'free']

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#421869', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Izquierda: isotipo + título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'white', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <DotLottieReact src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie" loop autoplay style={{ width: 36, height: 36 }} />
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>Giro Lab</div>
              <div style={{ color: 'white', fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>Comunidad</div>
            </div>
          </div>

          {/* Derecha: nombre + rol + hamburguesa + dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{meta?.nombre}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ffa719', textTransform: 'capitalize', lineHeight: 1.2 }}>{meta?.role || 'Persona'}</div>
            </div>

            {/* Hamburguesa */}
            <button
              onClick={() => setHeaderMenuOpen(o => !o)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 40, height: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', flexShrink: 0, padding: 8 }}
              aria-label="Menú"
            >
              <span style={{ display: 'block', width: 20, height: 2, background: 'white', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'white', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'white', borderRadius: 2 }} />
            </button>

            {/* Dropdown — posición absoluta alineado a la derecha */}
            {headerMenuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#421869', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', minWidth: 230, zIndex: 200, boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}>
                {[
                  { label: '← Volver al Dashboard', action: () => { setHeaderMenuOpen(false); router.push('/dashboard') } },
                  { label: misPostsMode ? 'Ver todo el feed' : 'Mis Posts', action: () => { setHeaderMenuOpen(false); setMisPostsMode(m => !m) } },
                  { label: 'Editar perfil',       action: () => { setHeaderMenuOpen(false); router.push('/dashboard?tab=perfil') } },
                  { label: 'Resultados de Tests', action: () => { setHeaderMenuOpen(false); router.push('/dashboard?tab=instrumentos') } },
                  { label: 'Cerrar sesión',       action: async () => { await supabase.auth.signOut(); router.push('/') } },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '13px 18px', fontSize: 14, fontWeight: 600, textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .comunidad-grid { grid-template-columns: 1fr !important; }
          .comunidad-sidebar { display: none !important; }
        }
      `}</style>

      <div className="comunidad-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: 24, alignItems: 'start' }}>

        {/* ── COLUMNA IZQUIERDA ── */}
        <div className="comunidad-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>

          {/* Menters Destacados */}
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 14, fontWeight: 800, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⭐ Menters Destacados
            </h3>
            {featuredMenters.length === 0 ? (
              <p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {featuredMenters.slice(0, 5).map((m: any) => (
                  <a key={m.menter_id} href={`/menter/${m.menter_id}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '8px', borderRadius: 12 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: m.avatar_url ? 'white' : 'linear-gradient(135deg,#421869,#995bd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                      {m.avatar_url
                        ? <img src={m.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : `${m.nombre?.[0] || ''}${m.apellidos?.[0] || ''}`
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#421869', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.nombre} {m.apellidos}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 20,
                          background: m.plan === 'master' ? '#fff3e0' : '#f3e5f5',
                          color: m.plan === 'master' ? '#e65100' : '#6a1b9a' }}>
                          {m.plan === 'master' ? '👑' : '💎'} {m.plan.toUpperCase()}
                        </span>
                        {m.especialidad && (
                          <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.especialidad}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
                <a href="/dashboard" style={{ fontSize: 12, color: '#421869', fontWeight: 600, textAlign: 'center', marginTop: 4, textDecoration: 'none' }}>
                  Ver todos los Menters →
                </a>
              </div>
            )}
          </div>

          {/* Blogs Recientes */}
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 14, fontWeight: 800, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📝 Blogs Recientes
            </h3>
            {blogRecientes.length === 0 ? (
              <p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '20px 0' }}>Sin blogs aún</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {blogRecientes.slice(0, 4).map((b: any) => (
                  <a key={b.id} href={`/blog/${b.id}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', gap: 10, textDecoration: 'none', padding: '8px', borderRadius: 12 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {b.cover_image && (
                      <img src={b.cover_image} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>
                        {b.menter?.nombre || 'Menter'}
                      </div>
                    </div>
                  </a>
                ))}
                <a href="/dashboard" style={{ fontSize: 12, color: '#421869', fontWeight: 600, textAlign: 'center', marginTop: 4, textDecoration: 'none' }}>
                  Ver todos los blogs →
                </a>
              </div>
            )}
          </div>

        </div>

        {/* ── COLUMNA CENTRAL — Feed ── */}
        <div>

          {/* Composer */}
          <div ref={composerRef} style={{ background: 'white', borderRadius: 16, padding: '20px', marginBottom: 20, boxShadow: resenaDraft ? '0 0 0 2px #421869' : '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.3s' }}>

            {/* Preview reseña */}
            {resenaDraft && (
              <div style={{ marginBottom: 16, padding: '14px 16px', background: '#fdf8ff', border: '1px solid #e9d5ff', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#421869', fontFamily: 'Raleway, sans-serif' }}>Quiero compartir mi experiencia con el Menter:</span>
                  <button onClick={() => setResenaDraft(null)} style={{ background: 'none', border: 'none', color: '#bbb', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {resenaDraft.menter_avatar
                    ? <img src={resenaDraft.menter_avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e9d5ff' }} />
                    : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#421869,#995bd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>{resenaDraft.menter_name?.[0] || 'M'}</div>
                  }
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#421869', fontFamily: 'Raleway, sans-serif', marginBottom: 4 }}>{resenaDraft.menter_name}</div>
                    <div style={{ color: '#ffa719', fontSize: 20, letterSpacing: 3, lineHeight: 1 }}>
                      {'★'.repeat(resenaDraft.estrellas)}{'☆'.repeat(5 - resenaDraft.estrellas)}
                    </div>
                    {resenaDraft.comentario && (
                      <p style={{ margin: '6px 0 0', fontSize: 14, color: '#555', fontStyle: 'italic' }}>"{resenaDraft.comentario}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {!resenaDraft && (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#421869,#995bd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {meta?.nombre?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                {!resenaDraft && (
                <textarea
                  placeholder="¿Qué quieres compartir con la comunidad?"
                  value={postForm.contenido}
                  onChange={e => setPostForm(p => ({ ...p, contenido: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #e0e0e0', borderRadius: 12, fontSize: 14, fontFamily: 'DM Sans', resize: 'none', boxSizing: 'border-box' as const, outline: 'none' }}
                />
                )}

                {/* Preview imagen */}
                {postForm.media_url && postForm.tipo === 'foto' && (
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <img src={postForm.media_url} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
                    <button onClick={() => setPostForm(p => ({ ...p, media_url: '', tipo: 'texto' }))}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 700 }}>✕</button>
                  </div>
                )}

                {/* Input URL de video */}
                {postForm.tipo === 'video' && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        placeholder="Pega un link de YouTube o Vimeo..."
                        value={postForm.media_url.startsWith('data:') ? '' : postForm.media_url}
                        onChange={e => setPostForm(p => ({ ...p, media_url: e.target.value }))}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', outline: 'none' }}
                      />
                      {postForm.media_url && !postForm.media_url.startsWith('data:') && (
                        <button onClick={() => setPostForm(p => ({ ...p, media_url: '' }))}
                          style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 18 }}>✕</button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: '0.5px', background: '#e0e0e0' }} />
                      <span style={{ fontSize: 11, color: '#999' }}>o sube un archivo</span>
                      <div style={{ flex: 1, height: '0.5px', background: '#e0e0e0' }} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: '0.5px dashed #ddd', cursor: 'pointer', fontSize: 13, color: '#666', background: '#fafafa' }}>
                      🎥 Seleccionar archivo de video (máx. 50MB)
                      <input type="file" accept="video/*" style={{ display: 'none' }} onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 50 * 1024 * 1024) { setAlertMsg('El video no puede superar 50MB'); return }
                        const ext = file.name.split('.').pop()
                        const path = `videos/${user!.id}/${Date.now()}.${ext}`
                        const { error } = await supabase.storage.from('community').upload(path, file)
                        if (!error) {
                          const { data } = supabase.storage.from('community').getPublicUrl(path)
                          setPostForm(p => ({ ...p, media_url: data.publicUrl }))
                          setToastMsg('✅ Video subido')
                          setTimeout(() => setToastMsg(null), 3000)
                        } else {
                          setAlertMsg('Error al subir el video. Intenta con un link de YouTube.')
                        }
                      }} />
                    </label>
                    {postForm.media_url && (
                      <div style={{ position: 'relative' }}>
                        {postForm.media_url.includes('youtube.com') || postForm.media_url.includes('youtu.be') || postForm.media_url.includes('vimeo.com')
                          ? <div style={{ background: '#f0f0f0', borderRadius: 10, padding: '12px', fontSize: 13, color: '#421869', fontWeight: 600 }}>🎥 {postForm.media_url}</div>
                          : <video src={postForm.media_url} controls style={{ width: '100%', borderRadius: 10, maxHeight: 200 }} />
                        }
                        <button onClick={() => setPostForm(p => ({ ...p, media_url: '' }))}
                          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!resenaDraft && (<>
                      <label style={{ padding: '6px 12px', borderRadius: 20, border: `0.5px solid ${postForm.tipo === 'foto' ? '#421869' : '#e0e0e0'}`, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: postForm.tipo === 'foto' ? '#f3e8ff' : 'white', color: postForm.tipo === 'foto' ? '#421869' : '#666' }}>
                        📷 Foto
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 5 * 1024 * 1024) { setAlertMsg('La imagen no puede superar 5MB'); return }
                          const ext = file.name.split('.').pop()
                          const path = `imagenes/${user!.id}/${Date.now()}.${ext}`
                          setPosting(true)
                          const { error } = await supabase.storage.from('community').upload(path, file)
                          setPosting(false)
                          if (!error) {
                            const { data } = supabase.storage.from('community').getPublicUrl(path)
                            setPostForm(p => ({ ...p, media_url: data.publicUrl, tipo: 'foto' }))
                          } else { setAlertMsg('Error al subir la imagen. Intenta de nuevo.') }
                        }} />
                      </label>
                      <button
                        onClick={() => setPostForm(p => ({ ...p, tipo: p.tipo === 'video' ? 'texto' : 'video', media_url: p.tipo === 'video' ? '' : p.media_url }))}
                        style={{ padding: '6px 12px', borderRadius: 20, border: `0.5px solid ${postForm.tipo === 'video' ? '#421869' : '#e0e0e0'}`, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: postForm.tipo === 'video' ? '#f3e8ff' : 'white', color: postForm.tipo === 'video' ? '#421869' : '#666' }}>
                        🎥 Video
                      </button>
                    </>)}
                  </div>
                  <button
                    onClick={publicar}
                    disabled={posting || (!resenaDraft && !postForm.contenido.trim() && !postForm.media_url)}
                    style={{ padding: '8px 24px', borderRadius: 20, border: 'none', background: (posting || (!resenaDraft && !postForm.contenido.trim() && !postForm.media_url)) ? '#e0e0e0' : '#421869', color: (posting || (!resenaDraft && !postForm.contenido.trim() && !postForm.media_url)) ? '#999' : 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>
                    {posting ? 'Publicando...' : resenaDraft ? 'Publicar reseña' : 'Publicar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Mis Posts */}
          {misPostsMode && (
            <div style={{ background: '#421869', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'Raleway, sans-serif' }}>Mis publicaciones ({misPosts.length})</span>
              <button onClick={() => setMisPostsMode(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Ver todo el feed</button>
            </div>
          )}

          {/* Feed */}
          {feedLoading && feed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>Cargando feed...</div>
          ) : (!misPostsMode && feed.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🌱</div>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869' }}>¡Sé el primero en publicar!</h3>
              <p style={{ color: '#666' }}>La comunidad Giro Lab está comenzando. Comparte algo que inspire.</p>
            </div>
          ) : (misPostsMode && misPosts.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <p>Aún no tienes publicaciones.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(misPostsMode ? misPosts : feed).map(post => (
                <div key={post.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

                  {/* Header del post */}
                  <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: post.avatar_url ? 'white' : 'linear-gradient(135deg,#421869,#995bd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0, overflow: 'hidden' }}>
                        {post.avatar_url
                          ? <img src={post.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : post.nombre?.[0]?.toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#421869' }}>{post.nombre} {post.apellidos}</span>
                          {post.role === 'menter' && (
                            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: '#ffa719', color: '#2d2926', letterSpacing: '0.03em' }}>MENTER</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#999' }}>{fmtFecha(post.created_at)}</span>
                      </div>
                    </div>
                    {(post.user_id === user?.id || ADMIN_EMAILS.includes(user?.email || '')) && (
                      <button onClick={() => eliminarPost(post.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, padding: '4px 8px' }}>🗑️</button>
                    )}
                  </div>

                  {/* Card de reseña */}
                  {post.menter_name && (
                    <div style={{ margin: '0 20px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#421869', fontFamily: 'Raleway, sans-serif', marginBottom: 8 }}>Quiero compartir mi experiencia con el Menter:</div>
                    <div style={{ padding: '14px 16px', background: '#fdf8ff', border: '1px solid #e9d5ff', borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {post.menter_avatar
                        ? <img src={post.menter_avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e9d5ff' }} />
                        : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#421869,#995bd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>{post.menter_name?.[0] || 'M'}</div>
                      }
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#421869', fontFamily: 'Raleway, sans-serif', marginBottom: 4 }}>{post.menter_name}</div>
                        <div style={{ color: '#ffa719', fontSize: 20, letterSpacing: 3, lineHeight: 1 }}>
                          {'★'.repeat(post.estrellas || 0)}{'☆'.repeat(5 - (post.estrellas || 0))}
                        </div>
                        {post.resena_comentario && (
                          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#555', fontStyle: 'italic' }}>"{post.resena_comentario}"</p>
                        )}
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Contenido */}
                  {post.contenido && (
                    <div style={{ padding: '0 20px 12px', fontSize: 15, color: '#333', lineHeight: 1.6 }}>{post.contenido}</div>
                  )}

                  {/* Media */}
                  {post.media_url && (
                    post.tipo === 'foto'
                      ? <img src={post.media_url} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
                      : post.tipo === 'video'
                        ? (post.media_url.includes('youtube.com') || post.media_url.includes('youtu.be')
                            ? <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                <iframe
                                  src={`https://www.youtube.com/embed/${post.media_url.includes('youtu.be') ? post.media_url.split('youtu.be/')[1]?.split('?')[0] : new URLSearchParams(post.media_url.split('?')[1]).get('v')}`}
                                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                  allowFullScreen
                                />
                              </div>
                            : post.media_url.includes('vimeo.com')
                              ? <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                  <iframe
                                    src={`https://player.vimeo.com/video/${post.media_url.split('vimeo.com/')[1]?.split('?')[0]}`}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    allowFullScreen
                                  />
                                </div>
                              : <video src={post.media_url} controls style={{ width: '100%', maxHeight: 400 }} />
                          )
                        : null
                  )}

                  {/* Ref data */}
                  {post.ref_data && (
                    <div style={{ margin: '0 20px 12px', padding: '12px 16px', background: '#f8f9fa', borderRadius: 12, border: '0.5px solid #e0e0e0' }}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                        {post.tipo === 'blog' ? '📝 Blog compartido' : post.tipo === 'menter_card' ? '👤 Menter compartido' : '🏅 Insignia compartida'}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#421869' }}>{post.ref_data?.titulo || post.ref_data?.nombre || ''}</div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ padding: '10px 20px', borderTop: '0.5px solid #f0f0f0', display: 'flex', gap: 16 }}>
                    <button onClick={() => toggleLike(post.id, post.user_liked)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: post.user_liked ? '#e53935' : '#666', fontWeight: post.user_liked ? 700 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {post.user_liked ? '❤️' : '🤍'} {post.likes_count}
                    </button>
                    <button onClick={() => cargarComentarios(post.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                      💬 {post.comments_count}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/comunidad#${post.id}`); setToastMsg('🔗 Link copiado'); setTimeout(() => setToastMsg(null), 3000) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666' }}>
                      🔗 Compartir
                    </button>
                  </div>

                  {/* Comentarios */}
                  {postExpandido === post.id && (
                    <div style={{ padding: '12px 20px', borderTop: '0.5px solid #f0f0f0', background: '#fafafa' }}>
                      {(comentarios[post.id] || []).map((c: any) => (
                        <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {c.user?.raw_user_meta_data?.nombre?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div style={{ background: 'white', borderRadius: '0 12px 12px 12px', padding: '8px 12px', flex: 1, border: '0.5px solid #f0f0f0' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 2 }}>{c.user?.raw_user_meta_data?.nombre} {c.user?.raw_user_meta_data?.apellidos}</div>
                            <div style={{ fontSize: 13, color: '#333' }}>{c.contenido}</div>
                          </div>
                          {(c.user_id === user?.id || ADMIN_EMAILS.includes(user?.email || '')) && (
                            <button onClick={() => eliminarComentario(post.id, c.id)}
                              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 13, padding: '4px', flexShrink: 0 }}
                              title="Eliminar comentario">🗑️</button>
                          )}
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input
                          placeholder="Escribe un comentario..."
                          value={comentarioInput[post.id] || ''}
                          onChange={e => setComentarioInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && comentar(post.id)}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', outline: 'none' }}
                        />
                        <button onClick={() => comentar(post.id)} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Enviar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Cargar más */}
              {hasMore && (
                <button onClick={() => cargarFeed(offset)} disabled={feedLoading}
                  style={{ width: '100%', padding: '12px', borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
                  {feedLoading ? 'Cargando...' : 'Ver más publicaciones'}
                </button>
              )}
            </div>
          )}

        </div>

        {/* ── COLUMNA DERECHA — Eventos ── */}
        <div className="comunidad-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 14, fontWeight: 800, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎪 Próximos Eventos
            </h3>
            {eventosProximos.length === 0 ? (
              <p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '20px 0' }}>Sin eventos próximos</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {eventosProximos.slice(0, 5).map((e: any) => (
                  <div key={e.id} style={{ padding: '10px 12px', borderRadius: 12, border: '0.5px solid #f0f0f0', cursor: 'pointer' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'white')}
                  >
                    {e.cover_image && (
                      <img src={e.cover_image} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#421869', lineHeight: 1.3, marginBottom: 4 }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                      📅 {new Date(e.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {e.start_time && ` · ${e.start_time.slice(0, 5)}`}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: e.modality === 'virtual' ? '#1565c0' : '#2e7d32', fontWeight: 600 }}>
                        {e.modality === 'virtual' ? '💻 Virtual' : '📍 Presencial'}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#421869' }}>
                        {(e.event_tickets || []).length === 0 || Math.min(...(e.event_tickets || [{ price: 0 }]).map((t: any) => t.price)) === 0
                          ? '🆓 Gratis'
                          : `$${Math.min(...(e.event_tickets || []).map((t: any) => t.price))} USD`}
                      </span>
                    </div>
                  </div>
                ))}
                <a href="/dashboard" style={{ fontSize: 12, color: '#421869', fontWeight: 600, textAlign: 'center', marginTop: 4, textDecoration: 'none' }}>
                  Ver todos los eventos →
                </a>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Alert */}
      {alertMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setAlertMsg(null)}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontSize: 16, color: '#421869', fontWeight: 600, fontFamily: 'Raleway, sans-serif', marginBottom: 24, lineHeight: 1.5 }}>{alertMsg}</p>
            <button onClick={() => setAlertMsg(null)} style={{ padding: '12px 32px', borderRadius: 30, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#421869', color: 'white', padding: '14px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toastMsg}
        </div>
      )}

    </div>
  )
}