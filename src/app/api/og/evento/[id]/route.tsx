// src/app/api/og/evento/[id]/route.tsx
// Genera imagen 1080×1080 para compartir en Instagram.
// GET /api/og/evento/:id

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

  const { data: ev } = await supabase
    .from('events')
    .select('title, description, cover_image, date, location, menter:menter_public_profiles(nombre, avatar_url)')
    .eq('id', id)
    .single()

  const { data: ticket } = await supabase
    .from('event_tickets')
    .select('price')
    .eq('event_id', id)
    .order('price', { ascending: true })
    .limit(1)
    .single()

  const title     = ev?.title       || 'Evento Giro Lab'
  const coverImg  = ev?.cover_image || null
  const menterName = (ev?.menter as any)?.nombre || ''
  const menterAvatar = (ev?.menter as any)?.avatar_url || null
  const dateStr   = ev?.date
    ? new Date(ev.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''
  const location  = ev?.location || ''
  const price     = ticket?.price ? `Desde $${ticket.price} USD` : 'Gratuito'
  const desc      = ev?.description ? ev.description.slice(0, 120) : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          background: '#0f0720',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background image */}
        {coverImg && (
          <img
            src={coverImg}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 1080, height: 1080,
              objectFit: 'cover',
              opacity: 0.25,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(15,7,32,0.4) 0%, rgba(15,7,32,0.85) 60%, #0f0720 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '72px 80px',
            height: '100%',
          }}
        >
          {/* Logo */}
          <div
            style={{
              position: 'absolute',
              top: 56, left: 80,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #421869, #8B3FD9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex' }}>G</div>
            </div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, display: 'flex' }}>Giro Lab</div>
          </div>

          {/* Price badge */}
          <div
            style={{
              position: 'absolute',
              top: 56, right: 80,
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
            {price}
          </div>

          {/* Menter */}
          {menterName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              {menterAvatar && (
                <img
                  src={menterAvatar}
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
                />
              )}
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 26, display: 'flex' }}>
                Con {menterName}
              </div>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              color: '#fff',
              fontSize: title.length > 40 ? 52 : 64,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </div>

          {/* Description */}
          {desc && (
            <div
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 26,
                lineHeight: 1.5,
                marginBottom: 32,
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              {desc}
            </div>
          )}

          {/* Date & Location chips */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {dateStr && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 32,
                  padding: '10px 24px',
                  color: '#fff',
                  fontSize: 22,
                  display: 'flex',
                }}
              >
                📅 {dateStr}
              </div>
            )}
            {location && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 32,
                  padding: '10px 24px',
                  color: '#fff',
                  fontSize: 22,
                  display: 'flex',
                }}
              >
                📍 {location}
              </div>
            )}
          </div>

          {/* URL */}
          <div
            style={{
              marginTop: 48,
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              display: 'flex',
            }}
          >
            girolab.net/eventos/{id}
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  )
}
