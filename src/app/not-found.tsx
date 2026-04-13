import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada — Giro Lab',
  description: 'La página que buscas no existe o ha cambiado. Explora Giro Lab.',
}

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      background: 'linear-gradient(135deg, #0d0618 0%, #1a0a2e 60%, #2d1050 100%)',
      fontFamily: "'DM Sans', Arial, sans-serif", padding: '24px', color: 'white',
      position: 'relative',
    }}>
      <div style={{
        fontSize: 'clamp(80px, 20vw, 160px)', fontFamily: 'Raleway, sans-serif',
        fontWeight: 900, lineHeight: 1, color: 'transparent',
        backgroundImage: 'linear-gradient(135deg, #421869, #ffa719)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        marginBottom: 8,
      }}>
        404
      </div>

      <h1 style={{
        fontFamily: 'Raleway, sans-serif', fontWeight: 900,
        fontSize: 'clamp(22px, 4vw, 36px)', margin: '0 0 16px',
      }}>
        Esta página no existe
      </h1>

      <p style={{
        fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
        maxWidth: 400, margin: '0 auto 40px',
      }}>
        Puede que el link esté roto, haya expirado o simplemente nunca existió.
        No te preocupes, tu Giro sigue en pie.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '12px 28px', borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'transparent', color: 'white',
          fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-block',
        }}>
          ← Ir al inicio
        </Link>
        <Link href="/dashboard" style={{
          padding: '12px 28px', borderRadius: 30, border: 'none',
          background: '#ffa719', color: '#2d2926',
          fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block',
          fontFamily: 'Raleway, sans-serif',
        }}>
          Mi Dashboard
        </Link>
      </div>

      <div style={{ position: 'absolute', bottom: 32, fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
        Giro <span style={{ color: '#ffa719' }}>Lab</span>
      </div>
    </main>
  )
}
