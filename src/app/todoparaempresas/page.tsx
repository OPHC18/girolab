'use client'
import { useState, useEffect } from 'react'


// ─── DATA ────────────────────────────────────────────────────────────────────

const PRENDAS = [
  'Polos', 'Camisas / Blusas', 'Pantalones', 'Shorts', 'Casacas',
  'Chalecos', 'Buzos', 'Gorros / Caps', 'Delantales', 'Overoles',
]

const COACHING_NECESIDADES = [
  'Liderazgo y habilidades directivas',
  'Comunicación y trabajo en equipo',
  'Teambuilding y cohesión',
  'Negociación y ventas',
  'Inteligencia emocional y gestión del estrés',
  'Danza Primal y expresión corporal',
  'Talleres Outdoor & Indoor',
  'Cultura y clima organizacional',
  'Otros / Programa a medida',
]

const STATS = [
  { valor: '9+', label: 'Años de experiencia' },
  { valor: '50+', label: 'Empresas atendidas' },
  { valor: '1,000+', label: 'Personas impactadas' },
  { valor: '95%', label: 'Satisfacción promedio' },
]

const METODOLOGIA = [
  { paso: '01', titulo: 'Diagnóstico', desc: 'Evaluamos tus necesidades con instrumentos validados y conversaciones estratégicas.' },
  { paso: '02', titulo: 'Diseño', desc: 'Programa a medida basado en los objetivos y cultura de tu organización.' },
  { paso: '03', titulo: 'Implementación', desc: 'Entregamos con metodología activa, alta calidad y experiencias memorables.' },
  { paso: '04', titulo: 'Seguimiento', desc: 'Medimos resultados y acompañamos la consolidación de los cambios.' },
]

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Servicio = 'coaching' | 'uniformes' | 'merchandising'

interface PrendaItem { nombre: string; cantidad: number }

interface FormData {
  nombre: string
  empresa: string
  email: string
  telefono: string
  servicios: Servicio[]
  coaching: string[]
  prendas: PrendaItem[]
  merchandising: string
}

// ─── LOGO ────────────────────────────────────────────────────────────────────

const LogoTPE = ({ dark = false }: { dark?: boolean }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 10,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: dark ? 'white' : 'linear-gradient(135deg,#0f4c35,#1D9E75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: dark ? 'none' : '0 4px 12px rgba(29,158,117,0.35)',
    }}>
      <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 13, color: dark ? '#0f4c35' : 'white', letterSpacing: -0.5 }}>TPE</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 15, color: dark ? 'white' : '#0f2318', letterSpacing: 0.5 }}>Todo Para</span>
      <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 15, color: dark ? '#6ee7b7' : '#1D9E75', letterSpacing: 0.5 }}>Empresas</span>
    </div>
  </div>
)

// ─── FORM SECTION ────────────────────────────────────────────────────────────

function FormularioSection({ onSubmit, saving }: { onSubmit: (data: FormData) => void; saving?: boolean }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    nombre: '', empresa: '', email: '', telefono: '',
    servicios: [],
    coaching: [],
    prendas: PRENDAS.map(n => ({ nombre: n, cantidad: 0 })),
    merchandising: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleServicio = (s: Servicio) => {
    setForm(f => ({
      ...f,
      servicios: f.servicios.includes(s) ? f.servicios.filter(x => x !== s) : [...f.servicios, s],
    }))
  }

  const toggleCoaching = (n: string) => {
    setForm(f => ({
      ...f,
      coaching: f.coaching.includes(n) ? f.coaching.filter(x => x !== n) : [...f.coaching, n],
    }))
  }

  const setPrendaCantidad = (nombre: string, cantidad: number) => {
    setForm(f => ({
      ...f,
      prendas: f.prendas.map(p => p.nombre === nombre ? { ...p, cantidad: Math.max(0, cantidad) } : p),
    }))
  }

  const validateStep = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.nombre.trim()) e.nombre = 'Requerido'
      if (!form.empresa.trim()) e.empresa = 'Requerido'
      if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email válido requerido'
      if (!form.telefono.trim()) e.telefono = 'Requerido'
    }
    if (step === 1 && form.servicios.length === 0) e.servicios = 'Selecciona al menos un servicio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const totalSteps = form.servicios.length > 0 ? 2 + form.servicios.length : 3
  const serviceSteps = form.servicios

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: `1.5px solid ${err ? '#e53935' : '#d1fae5'}`,
    background: '#f0fdf4', fontSize: 14, color: '#0f2318',
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 0.2s',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: '#0f4c35',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {[0, 1, ...serviceSteps.map((_, i) => i + 2)].map((s, idx) => (
          <div key={idx} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: idx <= step ? '#1D9E75' : '#d1fae5',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Step 0 — Datos de contacto */}
      {step === 0 && (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 8 }}>Paso 1 de {2 + serviceSteps.length}</div>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#0f2318', marginBottom: 6 }}>Cuéntanos sobre ti</h3>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Te contactaremos para coordinar los detalles.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'nombre', label: 'Tu nombre completo', type: 'text', placeholder: 'Ana García' },
              { key: 'empresa', label: 'Empresa u organización', type: 'text', placeholder: 'Empresa SAC' },
              { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'ana@empresa.com' },
              { key: 'telefono', label: 'WhatsApp / Teléfono', type: 'tel', placeholder: '+51 999 000 000' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => { setForm(x => ({ ...x, [f.key]: e.target.value })); setErrors(x => ({ ...x, [f.key]: '' })) }}
                  style={inputStyle(errors[f.key])}
                />
                {errors[f.key] && <div style={{ fontSize: 11, color: '#e53935', marginTop: 4 }}>{errors[f.key]}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Selección de servicios */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 8 }}>Paso 2 de {2 + serviceSteps.length}</div>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#0f2318', marginBottom: 6 }}>¿Qué necesitas?</h3>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Puedes seleccionar uno o varios servicios.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {([
              { id: 'coaching' as Servicio, icon: '🎯', titulo: 'Coaching & Bienestar', sub: 'Talleres, teambuilding, habilidades blandas y más' },
              { id: 'uniformes' as Servicio, icon: '👔', titulo: 'Uniformes y Confección', sub: 'Prendas corporativas a medida para tu equipo' },
              { id: 'merchandising' as Servicio, icon: '🎁', titulo: 'Merchandising Corporativo', sub: 'Productos de marca para clientes y colaboradores' },
            ]).map(s => {
              const selected = form.servicios.includes(s.id)
              return (
                <div key={s.id} onClick={() => toggleServicio(s.id)} style={{
                  padding: '18px 20px', borderRadius: 14, cursor: 'pointer',
                  border: `2px solid ${selected ? '#1D9E75' : '#e5e7eb'}`,
                  background: selected ? '#f0fdf4' : 'white',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#0f2318', fontSize: 15, fontFamily: 'Raleway, sans-serif' }}>{s.titulo}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.sub}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${selected ? '#1D9E75' : '#d1d5db'}`,
                    background: selected ? '#1D9E75' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selected && <span style={{ color: 'white', fontSize: 13 }}>✓</span>}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.servicios && <div style={{ fontSize: 12, color: '#e53935', marginTop: 12 }}>{errors.servicios}</div>}
        </div>
      )}

      {/* Steps dinámicos por servicio */}
      {serviceSteps.map((servicio, idx) => {
        if (step !== idx + 2) return null
        const stepNum = idx + 3

        if (servicio === 'coaching') return (
          <div key="coaching">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 8 }}>Paso {stepNum} de {2 + serviceSteps.length}</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#0f2318', marginBottom: 6 }}>¿Qué áreas te interesan?</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Selecciona todas las que apliquen a tu organización.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {COACHING_NECESIDADES.map(n => {
                const sel = form.coaching.includes(n)
                return (
                  <div key={n} onClick={() => toggleCoaching(n)} style={{
                    padding: '9px 16px', borderRadius: 50, cursor: 'pointer', fontSize: 13,
                    border: `1.5px solid ${sel ? '#1D9E75' : '#d1d5db'}`,
                    background: sel ? '#1D9E75' : 'white',
                    color: sel ? 'white' : '#374151',
                    fontWeight: sel ? 700 : 400,
                    transition: 'all 0.15s',
                  }}>{n}</div>
                )
              })}
            </div>
          </div>
        )

        if (servicio === 'uniformes') return (
          <div key="uniformes">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 8 }}>Paso {stepNum} de {2 + serviceSteps.length}</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#0f2318', marginBottom: 6 }}>Selecciona las prendas</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Ingresa la cantidad aproximada que necesitas de cada prenda.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.prendas.map(p => (
                <div key={p.nombre} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10, background: p.cantidad > 0 ? '#f0fdf4' : '#f9fafb',
                  border: `1.5px solid ${p.cantidad > 0 ? '#1D9E75' : '#e5e7eb'}`,
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 14, color: '#0f2318', fontWeight: p.cantidad > 0 ? 700 : 400 }}>{p.nombre}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setPrendaCantidad(p.nombre, p.cantidad - 10)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>−</button>
                    <input type="number" value={p.cantidad === 0 ? '' : p.cantidad} min={0}
                      onChange={e => setPrendaCantidad(p.nombre, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      style={{ width: 64, textAlign: 'center', padding: '4px 8px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }} />
                    <button onClick={() => setPrendaCantidad(p.nombre, p.cantidad + 10)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #1D9E75', background: '#1D9E75', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

        if (servicio === 'merchandising') return (
          <div key="merchandising">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 8 }}>Paso {stepNum} de {2 + serviceSteps.length}</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#0f2318', marginBottom: 6 }}>Cuéntanos qué necesitas</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Libretas, tazas, bolsas, llaveros, agendas, tecnología... ¡lo que imagines!</p>
            </div>
            <textarea
              value={form.merchandising}
              onChange={e => setForm(f => ({ ...f, merchandising: e.target.value }))}
              placeholder="Ej: Necesitamos 200 libretas con nuestro logo para el evento de fin de año, además de 100 tazas personalizadas..."
              rows={6}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1.5px solid #d1fae5', background: '#f0fdf4',
                fontSize: 14, color: '#0f2318', resize: 'vertical',
                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, outline: 'none',
              }}
            />
          </div>
        )
        return null
      })}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        {step > 0 ? (
          <button onClick={back} style={{
            padding: '12px 24px', borderRadius: 50, border: '1.5px solid #d1d5db',
            background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151', fontWeight: 600,
          }}>← Atrás</button>
        ) : <div />}

        {step < 1 + serviceSteps.length ? (
          <button onClick={next} style={{
            padding: '14px 32px', borderRadius: 50,
            background: 'linear-gradient(135deg,#1D9E75,#0f4c35)',
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 800, fontFamily: 'Raleway, sans-serif',
            boxShadow: '0 6px 20px rgba(29,158,117,0.35)',
          }}>Continuar →</button>
        ) : (
          <button onClick={() => { if (validateStep()) onSubmit(form) }}
            disabled={saving}
            style={{
              padding: '14px 36px', borderRadius: 50,
              background: saving ? '#6b7280' : 'linear-gradient(135deg,#1D9E75,#0f4c35)',
              color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 800, fontFamily: 'Raleway, sans-serif',
              boxShadow: saving ? 'none' : '0 6px 20px rgba(29,158,117,0.35)',
              transition: 'all 0.2s',
            }}>
            {saving ? 'Guardando...' : 'Enviar y descargar presentación ↓'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── PRESENTACION PDF ────────────────────────────────────────────────────────

function PresentacionPDF({ data }: { data: FormData }) {
  const prendasSeleccionadas = data.prendas.filter(p => p.cantidad > 0)
  const totalPrendas = prendasSeleccionadas.reduce((a, b) => a + b.cantidad, 0)

  const SERVICIOS_RENDER = [
    data.servicios.includes('coaching') && {
      titulo: 'Coaching & Bienestar Organizacional',
      color: '#421869',
      items: [
        'Talleres Outdoor & Indoor vivenciales',
        'Teambuilding y dinámicas de cohesión',
        'Desarrollo de habilidades blandas y liderazgo',
        'Negociación, ventas e influencia',
        'Danza Primal — metodología única de expresión corporal',
        'Inteligencia emocional y gestión del estrés',
      ],
      detalle: data.coaching.length > 0 ? `Áreas de interés: ${data.coaching.join(', ')}` : null,
    },
    data.servicios.includes('uniformes') && {
      titulo: 'Uniformes y Confección Corporativa',
      color: '#1D9E75',
      items: [
        'Confección a medida con tejidos de calidad',
        'Bordados y serigrafía con identidad de marca',
        'Asesoría en color, corte y ergonomía',
        'Producción por lotes con control de tallas',
        'Tiempos de entrega garantizados',
        'Catálogo de materiales sostenibles disponible',
      ],
      detalle: prendasSeleccionadas.length > 0
        ? prendasSeleccionadas.map(p => `${p.nombre}: ${p.cantidad} unid.`).join('  ·  ') + `  (Total: ${totalPrendas} prendas)`
        : null,
    },
    data.servicios.includes('merchandising') && {
      titulo: 'Merchandising Corporativo',
      color: '#c97c00',
      items: [
        'Libretas, agendas y papelería corporativa',
        'Tazas, botellas y artículos de escritorio',
        'Bolsas ecológicas y empaques personalizados',
        'Tecnología con logo: USB, cargadores, audífonos',
        'Kits de bienvenida para colaboradores',
        'Artículos para eventos y lanzamientos',
      ],
      detalle: data.merchandising || null,
    },
  ].filter(Boolean) as { titulo: string; color: string; items: string[]; detalle: string | null }[]

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#e5e5e5', color: '#1a1a2e' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 24px;
          background: white;
          position: relative;
          overflow: hidden;
        }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0; size: A4 portrait; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .page {
            width: 210mm; height: 297mm; min-height: unset;
            margin: 0; overflow: hidden;
            page-break-after: always; page-break-inside: avoid;
          }
          .page:last-child { page-break-after: avoid; }
        }
      `}</style>

      {/* Botón descargar */}
      <div className="no-print" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}>
        <button onClick={() => window.print()} style={{
          padding: '14px 28px', borderRadius: 50,
          background: 'linear-gradient(135deg,#1D9E75,#0f4c35)',
          color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(29,158,117,0.45)',
          fontFamily: 'Raleway, sans-serif',
        }}>Descargar PDF</button>
      </div>

      {/* ═══ PÁGINA 1 — PORTADA ═══ */}
      <div className="page" style={{ background: 'linear-gradient(160deg,#071a10 0%,#0f2318 55%,#0a1a16 100%)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(29,158,117,0.22),transparent)', top: '-10%', right: '-10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(66,24,105,0.2),transparent)', bottom: '6%', left: '-6%', pointerEvents: 'none' }} />

        {/* Tope: logos TPE + Giro Lab */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* TPE logo badge */}
          <div style={{
            background: 'white', borderRadius: '0 0 16px 16px',
            padding: '10px 22px 14px', display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '4px 4px 16px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#0f4c35,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 11, color: 'white' }}>TPE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 15, color: '#0f2318' }}>Todo Para</span>
              <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 15, color: '#1D9E75' }}>Empresas</span>
            </div>
          </div>
          {/* Giro Lab badge */}
          <div style={{
            background: 'rgba(255,255,255,0.07)', borderRadius: '0 0 14px 14px',
            padding: '8px 18px 12px', display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <img src="/favicon.svg" alt="Giro Lab" style={{ width: 24, height: 24 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Giro</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 3, textTransform: 'uppercase' }}>Lab</span>
            </div>
          </div>
        </div>

        {/* Centro portada */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 700, marginBottom: 20 }}>Propuesta de Servicios · 2026</div>
          <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 48, fontWeight: 900, lineHeight: 1.1, color: 'white', marginBottom: 20, maxWidth: 580 }}>
            Todo lo que tu empresa<br />
            <span style={{ background: 'linear-gradient(135deg,#6ee7b7,#1D9E75)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              necesita, en un solo lugar.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 500, marginBottom: 40 }}>
            Coaching organizacional, uniformes corporativos y merchandising de marca — con la calidad y metodología que distinguen a las mejores organizaciones.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, maxWidth: 580 }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.valor}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie portada */}
        <div style={{ padding: '20px 72px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Propuesta preparada para</div>
            <div style={{ fontSize: 14, color: 'white', fontWeight: 700 }}>{data.empresa}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>contacto@girolab.net</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>girolab.net/todoparaempresas</div>
          </div>
        </div>
      </div>

      {/* ═══ PÁGINA 2 — QUIÉNES SOMOS ═══ */}
      <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 6, background: 'linear-gradient(90deg,#1D9E75,#421869,#c97c00)' }} />
        <div style={{ flex: 1, padding: '44px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 52, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 10 }}>Quiénes somos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 34, fontWeight: 900, color: '#0f2318', lineHeight: 1.1, marginBottom: 18 }}>Una empresa hecha para el crecimiento de las organizaciones</h2>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, marginBottom: 12 }}>
                <strong>Todo Para Empresas</strong> nació como una respuesta integral a las necesidades corporativas más frecuentes: equipos que se fortalecen desde adentro, imagen que representa a la organización hacia afuera, y productos que construyen identidad de marca.
              </p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, marginBottom: 28 }}>
                Somos empresa hermana de <strong>Giro Lab</strong> — plataforma de bienestar organizacional con 9 años de experiencia en Perú y Latinoamérica — lo que nos permite combinar metodología comprobada con ejecución de primer nivel.
              </p>

              {/* 3 pilares */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {[
                  { color: '#421869', titulo: 'Coaching', sub: 'Transformamos equipos desde adentro' },
                  { color: '#1D9E75', titulo: 'Uniformes', sub: 'Imagen corporativa con calidad' },
                  { color: '#c97c00', titulo: 'Merch', sub: 'Marca que permanece en la mente' },
                ].map(p => (
                  <div key={p.titulo} style={{ padding: '14px 16px', borderRadius: 12, borderLeft: `3px solid ${p.color}`, background: '#fafafa' }}>
                    <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, color: p.color, fontSize: 14, marginBottom: 4 }}>{p.titulo}</div>
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>{p.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha — fundador */}
            <div>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(135deg,#d1fae5,#e8f5e9)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/omar-herrera.jpg" alt="Omar Herrera" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#f6fffe)', borderRadius: 14, padding: '18px 16px' }}>
                <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 5 }}>Fundador</div>
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 16, fontWeight: 900, color: '#0f2318', marginBottom: 3 }}>Omar Herrera</div>
                <div style={{ fontSize: 11, color: '#1D9E75', fontWeight: 600, marginBottom: 10 }}>Coach Ontológico · CEO Giro Lab & TPE</div>
                <p style={{ fontSize: 11, color: '#555', lineHeight: 1.65 }}>9 años transformando equipos en Perú y Latinoamérica con metodologías de alto impacto.</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 60px', borderTop: '1px solid #e6f7f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoTPE />
          <span style={{ fontSize: 11, color: '#bbb' }}>Quiénes somos · 2 / 4</span>
        </div>
      </div>

      {/* ═══ PÁGINA 3 — SERVICIOS PARA ESTA EMPRESA ═══ */}
      <div className="page" style={{ background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 6, background: 'linear-gradient(90deg,#1D9E75,#421869,#c97c00)' }} />
        <div style={{ flex: 1, padding: '36px 52px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 6 }}>Propuesta personalizada para {data.empresa}</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 30, fontWeight: 900, color: '#0f2318' }}>Servicios seleccionados</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {SERVICIOS_RENDER.map(s => (
              <div key={s.titulo} style={{ background: 'white', borderRadius: 16, padding: '20px 22px', borderLeft: `4px solid ${s.color}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 15, fontWeight: 900, color: '#0f2318', marginBottom: 10 }}>{s.titulo}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.items.map(item => (
                      <span key={item} style={{ fontSize: 11, color: '#555', background: '#f3f4f6', padding: '4px 10px', borderRadius: 50 }}>{item}</span>
                    ))}
                  </div>
                  {s.detalle && (
                    <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: s.color, fontWeight: 700, marginBottom: 4 }}>Detalle solicitado</div>
                      <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6 }}>{s.detalle}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* CTA card */}
            <div style={{ background: 'linear-gradient(135deg,#0f2318,#1a3828)', borderRadius: 16, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>¿Preguntas o ajustes?</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Coordinamos los detalles directamente contigo, {data.nombre.split(' ')[0]}.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 800 }}>{data.telefono}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{data.email}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 52px', borderTop: '1px solid #e6f7f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <LogoTPE />
          <span style={{ fontSize: 11, color: '#bbb' }}>Servicios · 3 / 4</span>
        </div>
      </div>

      {/* ═══ PÁGINA 4 — METODOLOGÍA + CTA ═══ */}
      <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 6, background: 'linear-gradient(90deg,#1D9E75,#421869,#c97c00)' }} />
        <div style={{ flex: 1, padding: '36px 52px 0', display: 'flex', flexDirection: 'column' }}>

          {/* Metodología */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 6 }}>Cómo trabajamos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#0f2318' }}>Nuestra metodología</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {METODOLOGIA.map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#1D9E75,#0f4c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'white', fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 13 }}>{m.paso}</div>
                  <h4 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, color: '#0f2318', fontSize: 13, marginBottom: 5 }}>{m.titulo}</h4>
                  <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clientes */}
          <div style={{ background: '#f0fdf4', borderRadius: 18, padding: '22px 28px', marginBottom: 18 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 5 }}>Confían en nosotros</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 18, fontWeight: 900, color: '#0f2318' }}>Más de 50 organizaciones transformadas</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 8 }}>
              {Array.from({ length: 23 }, (_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 8, padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}>
                  <img src={`/clientes/logo-${i + 1}.png`} alt="" style={{ maxWidth: '100%', maxHeight: 22, objectFit: 'contain' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = '#d1fae5' }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <div style={{ background: 'linear-gradient(135deg,#071a10,#0f2318)', borderRadius: 18, padding: '26px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 5 }}>¿Listo, {data.nombre.split(' ')[0]}?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6 }}>Coordinemos los detalles para {data.empresa}. Te contactaremos en las próximas 24 horas.</p>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: '#6ee7b7', fontWeight: 800, marginBottom: 3 }}>contacto@girolab.net</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>girolab.net/todoparaempresas</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 52px', marginTop: 14, borderTop: '1px solid #e6f7f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoTPE />
          <span style={{ fontSize: 11, color: '#bbb' }}>Metodología y cierre · 4 / 4</span>
        </div>
      </div>
    </div>
  )
}

// ─── LANDING PÚBLICA ─────────────────────────────────────────────────────────

async function saveLead(data: FormData): Promise<{ error: string | null }> {
  const prendasConCantidad = data.prendas
    .filter(p => p.cantidad > 0)
    .map(p => ({ nombre: p.nombre, cantidad: p.cantidad }))

  try {
    const res = await fetch('/api/tpe/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre:         data.nombre,
        empresa:        data.empresa,
        email:          data.email,
        telefono:       data.telefono,
        servicios:      data.servicios,
        coaching_areas: data.coaching,
        uniformes:      prendasConCantidad,
        merchandising:  data.merchandising,
      }),
    })
    const json = await res.json()
    return { error: json.ok ? null : (json.error || 'Error al enviar') }
  } catch {
    return { error: 'Error de conexión. Intenta de nuevo.' }
  }
}

export default function TodoParaEmpresasPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Todo Para Empresas — TPE · Giro Lab'
    if (submitted) setTimeout(() => window.print(), 800)
  }, [submitted])

  const handleSubmit = async (data: FormData) => {
    setSaving(true)
    setSaveError(null)
    const { error } = await saveLead(data)
    setSaving(false)
    if (error) {
      setSaveError('Hubo un problema al guardar tu solicitud. Por favor intenta de nuevo.')
      return
    }
    setFormData(data)
    setSubmitted(true)
  }

  if (submitted && formData) return <PresentacionPDF data={formData} />

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus { border-color: #1D9E75 !important; }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: 'white', borderBottom: '1px solid #d1fae5', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <LogoTPE />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Una empresa de</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/favicon.svg" alt="Giro Lab" style={{ width: 20, height: 20 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 13, color: '#421869' }}>Giro Lab</span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(160deg,#071a10,#0f2318,#071a10)', padding: '80px 40px 90px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(29,158,117,0.18),transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 50, background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', fontSize: 12, color: '#6ee7b7', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
            Coaching · Uniformes · Merchandising
          </div>
          <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: 'white', marginBottom: 20 }}>
            Todo lo que tu empresa<br />
            <span style={{ background: 'linear-gradient(135deg,#6ee7b7,#1D9E75)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>necesita en un solo lugar.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Fortalecemos equipos, vestimos organizaciones y construimos identidad de marca — con metodología comprobada y calidad que se nota.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 28, fontWeight: 900, color: 'white' }}>{s.valor}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICIOS CARDS */}
      <div style={{ padding: '72px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 10 }}>Nuestros servicios</div>
          <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, color: '#0f2318' }}>Tres verticales, un solo aliado</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {[
            {
              color: '#421869', icon: '🎯', titulo: 'Coaching & Bienestar',
              desc: 'Talleres vivenciales, teambuilding, habilidades blandas, liderazgo, Danza Primal y programas a medida para tu equipo.',
              items: ['Talleres Outdoor & Indoor', 'Teambuilding', 'Habilidades Blandas', 'Negociación y Ventas', 'Danza Primal'],
            },
            {
              color: '#1D9E75', icon: '👔', titulo: 'Uniformes y Confección',
              desc: 'Prendas corporativas de calidad con tu identidad de marca: desde polos hasta overoles, con bordados y serigrafía.',
              items: ['Polos y Camisas', 'Pantalones y Casacas', 'Gorros y Accesorios', 'Bordados y Serigrafía', 'Entregas garantizadas'],
            },
            {
              color: '#c97c00', icon: '🎁', titulo: 'Merchandising Corporativo',
              desc: 'Productos de marca para eventos, clientes y colaboradores: desde libretas hasta tecnología personalizada con tu logo.',
              items: ['Papelería corporativa', 'Artículos de escritorio', 'Bolsas y empaques eco', 'Tecnología con logo', 'Kits de bienvenida'],
            },
          ].map(s => (
            <div key={s.titulo} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ height: 6, background: s.color }} />
              <div style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 19, fontWeight: 900, color: '#0f2318', marginBottom: 10 }}>{s.titulo}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 18 }}>{s.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULARIO */}
      <div style={{ background: 'white', borderTop: '1px solid #d1fae5', padding: '72px 40px' }} id="cotizar">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: 10 }}>Cotiza ahora</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 34, fontWeight: 900, color: '#0f2318', marginBottom: 12 }}>Recibe tu propuesta personalizada</h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7 }}>Completa el formulario y al terminar descargas tu presentación corporativa en PDF.</p>
          </div>
          {saveError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#b91c1c', fontSize: 14 }}>
              {saveError}
            </div>
          )}
          <FormularioSection
            onSubmit={handleSubmit}
            saving={saving}
          />
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#071a10', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoTPE dark />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Una empresa de Giro Lab · girolab.net</div>
      </footer>
    </div>
  )
}