// src/app/api/og/menter/[id]/route.tsx
// Genera imagen 1080×1080 para compartir en Instagram.
// GET /api/og/menter/:id

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: pub } = await supabase
    .from('menter_public_profiles')
    .select('nombre, avatar_url, plan')
    .eq('id', id)
    .single()

  const { data: prof } = await supabase
    .from('menter_profile')
    .select('bio, especialidades, modalidad, precio_sesion')
    .eq('menter_id', id)
    .single()

  const nombre     = pub?.nombre || 'Menter Giro Lab'
  const avatar     = pub?.avatar_url || null
  const bio        = prof?.bio ? (prof.bio as string).slice(0, 130) : ''
  const precio     = prof?.precio_sesion ? `Desde S/ ${prof.precio_sesion}` : ''
  const modalidad  = prof?.modalidad === 'online'
    ? 'Online' : prof?.modalidad === 'presencial'
    ? 'Presencial' : prof?.modalidad === 'ambos'
    ? 'Online y Presencial' : ''
  const tags: string[] = Array.isArray(prof?.especialidades)
    ? (prof.especialidades as string[]).slice(0, 4)
    : []

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #0f0720 0%, #1a0b35 50%, #0f0720 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -200, right: -200,
            width: 700, height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66,24,105,0.5) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150, left: -150,
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,63,217,0.3) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            height: '100%',
            textAlign: 'center',
          }}
        >
          {/* Logo top */}
          <div
            style={{
              position: 'absolute',
              top: 56,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40, height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #421869, #8B3FD9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex' }}>G</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22, fontWeight: 600, display: 'flex' }}>Giro Lab</div>
          </div>

          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              style={{
                width: 200, height: 200,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(139,63,217,0.8)',
                marginBottom: 32,
              }}
            />
          ) : (
            <div
              style={{
                width: 200, height: 200,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #421869, #8B3FD9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
                color: '#fff',
                fontSize: 80,
                fontWeight: 700,
              }}
            >
              {nombre.charAt(0)}
            </div>
          )}

          {/* Name */}
          <div
            style={{
              color: '#fff',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
              display: 'flex',
            }}
          >
            {nombre}
          </div>

          {/* Bio */}
          {bio && (
            <div
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 28,
                lineHeight: 1.5,
                marginBottom: 40,
                maxWidth: 800,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {bio}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
              {tags.map((tag, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(139,63,217,0.25)',
                    border: '1px solid rgba(139,63,217,0.5)',
                    borderRadius: 32,
                    padding: '10px 24px',
                    color: '#E8C5FF',
                    fontSize: 22,
                    display: 'flex',
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}

          {/* Chips row */}
          <div style={{ display: 'flex', gap: 16 }}>
            {modalidad && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 32,
                  padding: '10px 24px',
                  color: '#fff',
                  fontSize: 22,
                  display: 'flex',
                }}
              >
                {modalidad}
              </div>
            )}
            {precio && (
              <div
                style={{
                  background: 'rgba(66,24,105,0.9)',
                  border: '1px solid rgba(139,63,217,0.6)',
                  borderRadius: 32,
                  padding: '10px 24px',
                  color: '#E8C5FF',
                  fontSize: 22,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {precio}
              </div>
            )}
          </div>

          {/* URL */}
          <div
            style={{
              position: 'absolute',
              bottom: 56,
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              display: 'flex',
            }}
          >
            girolab.net/menter/{id}
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  )
}
