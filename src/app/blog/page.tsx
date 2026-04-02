'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function PostPage() {
  const { id } = useParams()
  const router = useRouter()
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

  const fetchPost = async () => {
    const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
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
    const { data: likesData, count } = await supabase
      .from('blog_likes').select('*', { count: 'exact' }).eq('post_id', id)
    setLikes(count || 0)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserLiked((likesData || []).some(l => l.user_id === user.id))
  }

  const handleLike = async () => {
    if (!user) return
    if (userLiked) {
      await supabase.from('blog_likes').delete().eq('post_id', id).eq('user_id', user.id)
      setLikes(prev => prev - 1)
      setUserLiked(false)
    } else {
      await supabase.from('blog_likes').insert({ post_id: id, user_id: user.id })
      setLikes(prev => prev + 1)
      setUserLiked(true)
    }
  }

  const handleComment = async () => {
    if (!comment.trim() || !user) return
    await supabase.from('blog_comments').insert({ post_id: id, user_id: user.id, content: comment })
    setComment('')
    fetchComments()
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Cargando...</div>
  if (!post) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Post no encontrado.</div>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => router.push('/blog')} style={{
        background: 'none', border: 'none', color: '#421869', cursor: 'pointer',
        fontWeight: 600, fontSize: 14, marginBottom: 24, padding: 0
      }}>← Volver al Blog</button>

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title}
          style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }} />
      )}

      <h1 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 28, marginBottom: 8 }}>{post.title}</h1>

      <p style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>
        {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {post.tags.map((tag: string) => (
            <span key={tag} style={{ background: '#f3e8ff', color: '#6d28d9', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Contenido */}
      <div dangerouslySetInnerHTML={{ __html: post.content }}
        style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 32 }} />

      {/* Like y compartir */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, padding: '16px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={handleLike} style={{
          padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: userLiked ? '#421869' : '#f3e8ff',
          color: userLiked ? 'white' : '#421869', fontWeight: 700, fontSize: 14
        }}>
          {userLiked ? '❤️' : '🤍'} {likes} Me gusta
        </button>
        <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{
          padding: '8px 20px', borderRadius: 20, border: '1px solid #ddd',
          background: 'white', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer'
        }}>
          🔗 Copiar link
        </button>
      </div>

      {/* Comentarios */}
      <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 16 }}>
        💬 Comentarios ({comments.length})
      </h3>

      {user && (
        <div style={{ marginBottom: 24 }}>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <button onClick={handleComment} style={{
            marginTop: 8, padding: '10px 24px', borderRadius: 20, border: 'none',
            background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer'
          }}>
            Publicar comentario
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map(c => (
          <div key={c.id} style={{ background: '#f8f9fa', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#421869', margin: '0 0 4px' }}>
              {c.user?.raw_user_meta_data?.nombre || 'Usuario'}
            </p>
            <p style={{ fontSize: 14, color: '#333', margin: '0 0 4px' }}>{c.content}</p>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
              {new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <p style={{ color: '#999', fontSize: 14 }}>Sé el primero en comentar.</p>
        )}
      </div>
    </div>
  )
}