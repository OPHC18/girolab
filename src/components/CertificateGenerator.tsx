'use client'
import { useState, useEffect } from 'react'

const W = 841.89
const H = 595.28
const CX = W / 2

interface Props {
  participantName: string
  eventTitle: string
  eventDate: string
  certificateText?: string | null
  presenterName?: string | null
  firmaUrl?: string | null
  onClose: () => void
}

function wrapLines(text: string, maxChars = 68): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (test.length > maxChars && line) { lines.push(line); line = word }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

export default function CertificateGenerator({
  participantName: initialName,
  eventTitle,
  eventDate,
  certificateText,
  presenterName,
  firmaUrl,
  onClose,
}: Props) {
  const [nombre, setNombre] = useState(initialName)
  const [downloading, setDownloading] = useState(false)

  // Load Dancing Script as fallback for participant name
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'
    document.head.appendChild(link)
    return () => { try { document.head.removeChild(link) } catch {} }
  }, [])

  const certText = certificateText?.trim() || `Por haber participado en "${eventTitle}"`
  const fechaDisplay = eventDate
    ? new Date(eventDate + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const bodyLines = wrapLines(certText)

  const PREVIEW_W = Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 80 : 720)
  const scale = PREVIEW_W / W

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await document.fonts.ready
      const px = 2
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(W * px)
      canvas.height = Math.round(H * px)
      const ctx = canvas.getContext('2d')!
      ctx.scale(px, px)

      await new Promise<void>(resolve => {
        const img = new Image()
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); resolve() }
        img.onerror = () => resolve()
        img.src = '/certificate-template.svg'
      })

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'

      // CERTIFICADO
      ctx.font = 'bold 30px Raleway, sans-serif'
      ctx.fillStyle = '#421869'
      ctx.letterSpacing = '3px'
      ctx.fillText('CERTIFICADO', CX, 156)

      // DE PARTICIPACIÓN
      ctx.font = '500 11px Raleway, sans-serif'
      ctx.fillStyle = '#995bd5'
      ctx.letterSpacing = '4px'
      ctx.fillText('DE PARTICIPACIÓN', CX, 178)
      ctx.letterSpacing = '0px'

      // Cuerpo
      ctx.font = '400 11px "DM Sans", sans-serif'
      ctx.fillStyle = '#2d2926'
      bodyLines.forEach((line, i) => ctx.fillText(line, CX, 248 + i * 17))

      // Nombre participante
      ctx.font = 'bold italic 50px "Dancing Script", "Albondigas", cursive'
      ctx.fillStyle = '#995bd5'
      ctx.fillText(nombre, CX, 347)

      // Firma
      if (firmaUrl) {
        await new Promise<void>(resolve => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => { ctx.drawImage(img, CX - 65, 393, 130, 55); resolve() }
          img.onerror = () => resolve()
          img.src = firmaUrl
        })
      }

      // Expositor
      if (presenterName) {
        ctx.font = '600 11px "DM Sans", sans-serif'
        ctx.fillStyle = '#2d2926'
        ctx.fillText(presenterName, CX, 452)
        ctx.font = '400 9px "DM Sans", sans-serif'
        ctx.fillStyle = '#999'
        ctx.fillText('Expositor / Organizador', CX, 476)
      }

      // Fecha
      ctx.font = '400 10px "DM Sans", sans-serif'
      ctx.fillStyle = '#888'
      ctx.fillText(fechaDisplay, CX, 530)

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob!)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificado_${nombre.replace(/\s+/g, '_')}.png`
        a.click()
        URL.revokeObjectURL(url)
        setDownloading(false)
      }, 'image/png')
    } catch (e) {
      console.error('Certificate download error:', e)
      setDownloading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 20, padding: 24, maxWidth: PREVIEW_W + 48, width: '100%' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', margin: 0, fontSize: 18, fontWeight: 800 }}>Tu Certificado</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
        </div>

        {/* Editar nombre */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#666', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Nombre en el certificado (edita si hay algún error)
          </label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #c4b5fd', fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* Preview */}
        <div style={{ position: 'relative', width: PREVIEW_W, height: Math.round(H * scale), marginBottom: 20, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(66,24,105,0.15)' }}>
          {/* SVG background */}
          <img src="/certificate-template.svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} alt="" />

          {/* CERTIFICADO */}
          <div style={{ position: 'absolute', top: (156 - 30) * scale, left: 0, right: 0, textAlign: 'center', fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 30 * scale, color: '#421869', letterSpacing: '0.08em', lineHeight: 1 }}>
            CERTIFICADO
          </div>

          {/* DE PARTICIPACIÓN */}
          <div style={{ position: 'absolute', top: (178 - 11) * scale, left: 0, right: 0, textAlign: 'center', fontFamily: 'Raleway, sans-serif', fontWeight: 500, fontSize: 11 * scale, color: '#995bd5', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            DE PARTICIPACIÓN
          </div>

          {/* Cuerpo */}
          <div style={{ position: 'absolute', top: (248 - 11) * scale, left: '14%', right: '14%', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: 11 * scale, color: '#2d2926', lineHeight: 1.6 }}>
            {certText}
          </div>

          {/* Nombre participante */}
          <div style={{ position: 'absolute', top: (347 - 50) * scale, left: 0, right: 0, textAlign: 'center', fontFamily: '"Dancing Script", "Albondigas", cursive', fontWeight: 700, fontStyle: 'italic', fontSize: 50 * scale, color: '#995bd5', lineHeight: 1 }}>
            {nombre}
          </div>

          {/* Firma */}
          {firmaUrl && (
            <img src={firmaUrl} style={{ position: 'absolute', left: (CX - 65) * scale, top: 393 * scale, width: 130 * scale, height: 55 * scale, objectFit: 'contain' }} alt="Firma" />
          )}

          {/* Expositor */}
          {presenterName && (
            <>
              <div style={{ position: 'absolute', top: (452 - 11) * scale, left: 0, right: 0, textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: 11 * scale, color: '#2d2926' }}>
                {presenterName}
              </div>
              <div style={{ position: 'absolute', top: (476 - 9) * scale, left: 0, right: 0, textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: 9 * scale, color: '#999' }}>
                Expositor / Organizador
              </div>
            </>
          )}

          {/* Fecha */}
          <div style={{ position: 'absolute', top: (530 - 10) * scale, left: 0, right: 0, textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: 10 * scale, color: '#888' }}>
            {fechaDisplay}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', background: downloading ? '#ccc' : '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Raleway, sans-serif' }}>
            {downloading ? 'Generando...' : 'Descargar PNG'}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 20, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', margin: '12px 0 0' }}>
          La fuente del nombre se ajustará con la tipografía Albóndigas una vez instalada.
        </p>
      </div>
    </div>
  )
}
