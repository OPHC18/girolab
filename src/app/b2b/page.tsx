'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// ── Configuración ─────────────────────────────────────────────────────────────
const CLIENTE_LOGOS = Array.from({ length: 30 }, (_, i) => `/clientes/logo-${i + 1}.png`)

const HISTORIA = [
  { year: '2015', nombre: 'Need It', color: '#e53935', desc: 'Nuestro primer intento. Queríamos conectar a las personas con lo que necesitaban. Fue un error del que aprendimos mucho sobre el mercado y sobre nosotros mismos.' },
  { year: '2016', nombre: 'Giro', color: '#ffa719', desc: 'Una imagen fresca y lúdica que trajo buenos resultados. Pero el mercado pedía algo con más profundidad, más profesionalismo, más sustancia.' },
  { year: '2026', nombre: 'Giro Lab', color: '#421869', desc: 'La síntesis de nueve años de aprendizaje. Un laboratorio de bienestar donde la ciencia, la experiencia y el acompañamiento humano se encuentran para transformar organizaciones.' },
]

// ── Preguntas SPIN ─────────────────────────────────────────────────────────────
type SpinStep = {
  id: string
  pregunta: string
  tipo: 'options' | 'text' | 'textarea'
  opciones?: string[]
  placeholder?: string
  variable?: string
}

const SPIN_STEPS: SpinStep[] = [
  {
    id: 'servicio',
    pregunta: '¡Hola! Soy Omar, fundador de Giro Lab. Me alegra que estés aquí. ¿Cómo podemos ayudarte?',
    tipo: 'options',
    opciones: ['Taller de bienestar', 'Sesiones de coaching', 'Actividad outdoor', 'Programa integral', 'Otro'],
    variable: 'servicio',
  },
  {
    id: 'objetivo',
    pregunta: '¿Cuál es el objetivo principal de tu {servicio}?',
    tipo: 'options',
    opciones: ['Mejorar el clima laboral', 'Reducir el estrés y burnout', 'Fortalecer el liderazgo', 'Cohesión de equipo', 'Otro objetivo'],
    variable: 'objetivo',
  },
  {
    id: 'personas',
    pregunta: 'Cuenta con nosotros. ¿Cuántas personas recibirían el {servicio}?',
    tipo: 'options',
    opciones: ['Menos de 20', '20 a 50', '51 a 100', 'Más de 100'],
    variable: 'personas',
  },
  {
    id: 'cuando',
    pregunta: '¿Cuándo quieren comenzar?',
    tipo: 'options',
    opciones: ['Este mes', 'Próximo mes', 'En 2 a 3 meses', 'Aún no lo definimos'],
    variable: 'cuando',
  },
  {
    id: 'presupuesto',
    pregunta: '¿Tienen un presupuesto asignado para este programa?',
    tipo: 'options',
    opciones: ['Sí, tenemos presupuesto definido', 'Estamos en proceso de aprobación', 'No lo hemos definido aún'],
    variable: 'presupuesto',
  },
  {
    id: 'experiencia_previa',
    pregunta: '¿Han recibido antes talleres o programas de bienestar en su organización?',
    tipo: 'options',
    opciones: ['Sí', 'No'],
    variable: 'experiencia_previa',
  },
  {
    id: 'experiencia_detalle',
    pregunta: '¿Qué tal fue esa experiencia? Eso nos ayuda a entender cómo superarla.',
    tipo: 'options',
    opciones: ['Muy positiva', 'Regular, esperaba más', 'No tuvo el impacto esperado', 'No aplica'],
    variable: 'experiencia_detalle',
  },
]

const FORMULARIO_CAMPOS = [
  { key: 'nombres',   label: 'Nombres *',           type: 'text',  requerido: true },
  { key: 'apellidos', label: 'Apellidos *',          type: 'text',  requerido: true },
  { key: 'empresa',   label: 'Empresa *',            type: 'text',  requerido: true },
  { key: 'cargo',     label: 'Cargo *',              type: 'text',  requerido: true },
  { key: 'correo',    label: 'Correo electrónico *', type: 'email', requerido: true },
  { key: 'telefono',  label: 'Teléfono',             type: 'tel',   requerido: false },
]

// ── Componente principal ──────────────────────────────────────────────────────
export default function B2BPage() {
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  // SPIN state
  const [spinStep, setSpinStep] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [spinDone, setSpinDone] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [formSending, setFormSending] = useState(false)
  const [formDone, setFormDone] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Intersection observer for section animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisibleSections(prev => new Set([...prev, e.target.id]))
      }),
      { threshold: 0.15 }
    )
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const stepActual = SPIN_STEPS[spinStep]

  const getPregunta = (step: SpinStep) =>
    step.pregunta.replace('{servicio}', respuestas.servicio?.toLowerCase() || 'programa')

  const elegirOpcion = (opcion: string) => {
    const newResp = { ...respuestas, [stepActual.variable!]: opcion }
    setRespuestas(newResp)
    if (spinStep < SPIN_STEPS.length - 1) {
      setTimeout(() => setSpinStep(s => s + 1), 300)
    } else {
      setTimeout(() => setSpinDone(true), 400)
    }
  }

  const buildResumen = () => {
    const lines = [
      `Servicio solicitado: ${respuestas.servicio}`,
      `Objetivo: ${respuestas.objetivo}`,
      `Participantes: ${respuestas.personas}`,
      `Inicio previsto: ${respuestas.cuando}`,
      `Presupuesto: ${respuestas.presupuesto}`,
      `Experiencia previa: ${respuestas.experiencia_previa === 'Sí' ? `Sí — ${respuestas.experiencia_detalle}` : 'No'}`,
    ].join('\n')
    return lines
  }

  const enviarFormulario = async () => {
    const { nombres, apellidos, empresa, cargo, correo } = form
    if (!nombres || !apellidos || !empresa || !cargo || !correo || !/\S+@\S+\.\S+/.test(correo)) {
      setFormError('Por favor completa todos los campos obligatorios con un correo válido.')
      return
    }
    setFormSending(true)
    setFormError('')
    try {
      const res = await fetch('/api/b2b/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          conversacion: SPIN_STEPS.map(s => ({ pregunta: getPregunta(s), respuesta: respuestas[s.variable!] || '' })),
          resumen: buildResumen(),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setFormDone(true)
      } else {
        setFormError(data.error || 'Error al enviar. Intenta de nuevo.')
      }
    } catch {
      setFormError('Error de conexión. Intenta de nuevo.')
    } finally {
      setFormSending(false)
    }
  }

  const sectionVisible = (id: string) => visibleSections.has(id)

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#0d0d0d', minHeight: '100vh', color: 'white' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '80px 24px' }}>
        {/* Animated background */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{
            position: 'absolute', width: 600, height: 600,
            borderRadius: '50%', filter: 'blur(80px)', opacity: 0.35,
            background: 'radial-gradient(circle, #7b2fd4, transparent)',
            top: '-10%', left: '-10%',
            animation: 'pulse1 8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 500, height: 500,
            borderRadius: '50%', filter: 'blur(100px)', opacity: 0.25,
            background: 'radial-gradient(circle, #ffa719, transparent)',
            bottom: '0%', right: '-5%',
            animation: 'pulse2 10s ease-in-out infinite',
          }} />
          {/* Animated grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: `translateY(${scrollY * 0.1}px)`,
          }} />
        </div>
        <style>{`
          @keyframes pulse1 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.15) translate(30px,20px)} }
          @keyframes pulse2 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.2) translate(-20px,-30px)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
          .animate-fadein { animation: fadeUp 0.8s ease forwards }
          .section-animate { opacity:0; transform:translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease }
          .section-animate.visible { opacity:1; transform:translateY(0) }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
          <div style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#ffa719', marginBottom: 24, fontWeight: 700, animation: 'fadeUp 0.6s ease forwards' }}>
            Bienestar Organizacional
          </div>
          <h1 style={{
            fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 900,
            lineHeight: 1.1, margin: '0 0 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #b794f4 50%, #ffa719 100%)',
            backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'fadeUp 0.8s ease 0.2s forwards, shimmer 4s linear 1s infinite',
            opacity: 0,
          }}>
            Transformamos equipos.<br />Construimos bienestar real.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px', animation: 'fadeUp 0.8s ease 0.4s forwards', opacity: 0 }}>
            9 años acompañando a personas y organizaciones hacia su mejor versión. Con metodología, ciencia y un equipo que sabe lo que hace.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.8s ease 0.6s forwards', opacity: 0 }}>
            <a href="#conversemos" style={{ padding: '16px 36px', borderRadius: 50, background: 'linear-gradient(135deg, #7b2fd4, #421869)', color: 'white', fontWeight: 800, fontSize: 16, textDecoration: 'none', fontFamily: 'Raleway, sans-serif' }}>
              Hablemos de tu equipo
            </a>
            <a href="#nosotros" style={{ padding: '16px 36px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: 16, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              Conocer más
            </a>
          </div>
          {/* Scroll hint */}
          <div style={{ position: 'absolute', bottom: -100, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.5 }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, white, transparent)' }} />
          </div>
        </div>
      </section>

      {/* ── TRAYECTORIA TIMELINE ─────────────────────────────────────────── */}
      <section id="nosotros" data-animate style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}
        className={`section-animate${sectionVisible('nosotros') ? ' visible' : ''}`}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#ffa719', fontWeight: 700, marginBottom: 12 }}>Nuestra historia</div>
          <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: 0, color: 'white' }}>9 años de evolución</h2>
        </div>

        <div style={{ position: 'relative', paddingLeft: 48 }}>
          {/* Línea vertical */}
          <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #7b2fd4, #ffa719, #421869)' }} />

          {HISTORIA.map((h, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: i < HISTORIA.length - 1 ? 64 : 0, paddingLeft: 32 }}>
              {/* Dot */}
              <div style={{ position: 'absolute', left: -40, top: 6, width: 18, height: 18, borderRadius: '50%', background: h.color, boxShadow: `0 0 20px ${h.color}80`, border: '3px solid #0d0d0d' }} />
              <div style={{ fontSize: 13, color: h.color, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{h.year}</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 12px' }}>{h.nombre}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: 0 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OMAR ─────────────────────────────────────────────────────────── */}
      <section id="equipo" data-animate style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.03)' }}
        className={`section-animate${sectionVisible('equipo') ? ' visible' : ''}`}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 48, alignItems: 'center' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 220, height: 220, borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(123,47,212,0.4)', boxShadow: '0 0 40px rgba(123,47,212,0.3)', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/omar-herrera.jpg" alt="Omar Herrera" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ position: 'absolute', fontSize: 64, color: '#7b2fd4' }}>👤</div>
            </div>
            <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#ffa719', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
          </div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Fundador</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, margin: '0 0 8px', color: 'white' }}>Omar Herrera</h2>
            <p style={{ color: '#b794f4', fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>Psicólogo · Coach · CEO Giro Lab</p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 540 }}>
              9 años acompañando a personas y organizaciones en su camino al bienestar. He trabajado con equipos de distintos tamaños y sectores, combinando metodología psicológica con estrategias de desarrollo humano. Creo que el bienestar no es un beneficio extra — es la base de todo rendimiento sostenible.
            </p>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ─────────────────────────────────────────────────────── */}
      <section id="clientes" data-animate style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}
        className={`section-animate${sectionVisible('clientes') ? ' visible' : ''}`}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Confían en nosotros</div>
          <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, margin: 0, color: 'white' }}>Empresas que han transformado sus equipos</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 20 }}>
          {CLIENTE_LOGOS.map((src, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(4px)' }}>
              <img src={src} alt={`Cliente ${i + 1}`} style={{ maxWidth: '100%', maxHeight: 50, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.7 }}
                onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── SPIN CHAT ────────────────────────────────────────────────────── */}
      <section id="conversemos" data-animate style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}
        className={`section-animate${sectionVisible('conversemos') ? ' visible' : ''}`}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Cuéntanos</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: '0 0 16px', color: 'white' }}>Empecemos a conocer tu organización</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: 0 }}>Responde estas preguntas para que podamos preparar una propuesta personalizada.</p>
          </div>

          {!spinDone ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Progreso */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
                {SPIN_STEPS.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= spinStep ? '#7b2fd4' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
              </div>

              <div style={{ fontSize: 12, color: '#ffa719', fontWeight: 700, marginBottom: 12 }}>Pregunta {spinStep + 1} de {SPIN_STEPS.length}</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 28px', lineHeight: 1.4 }}>
                {getPregunta(stepActual)}
              </h3>

              {stepActual.tipo === 'options' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stepActual.opciones!.map(op => (
                    <button key={op} onClick={() => elegirOpcion(op)}
                      style={{
                        padding: '14px 20px', borderRadius: 12, border: '1.5px solid rgba(123,47,212,0.4)',
                        background: 'rgba(123,47,212,0.1)', color: 'white', fontSize: 15, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,47,212,0.3)'; e.currentTarget.style.borderColor = '#7b2fd4' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(123,47,212,0.1)'; e.currentTarget.style.borderColor = 'rgba(123,47,212,0.4)' }}>
                      {op}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : !formDone ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Resumen */}
              <div style={{ background: 'rgba(123,47,212,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 32, border: '1px solid rgba(123,47,212,0.3)' }}>
                <div style={{ fontSize: 13, color: '#b794f4', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Resumen de tu consulta</div>
                {SPIN_STEPS.map(s => (
                  <div key={s.id} style={{ marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{s.pregunta.split('?')[0].replace('{servicio}', respuestas.servicio?.toLowerCase() || 'programa')}:</span>
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 600, marginLeft: 8 }}>{respuestas[s.variable!]}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Perfecto. Déjanos tus datos</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px' }}>Te enviaremos nuestra presentación y en breve te contactaremos con una propuesta personalizada.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {FORMULARIO_CAMPOS.map(campo => (
                  <div key={campo.key} style={{ gridColumn: ['correo', 'empresa'].includes(campo.key) ? '1 / -1' : 'auto' }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{campo.label}</label>
                    <input
                      type={campo.type}
                      value={form[campo.key] || ''}
                      onChange={e => setForm(p => ({ ...p, [campo.key]: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 15, fontFamily: 'DM Sans', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>

              {formError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</p>}

              <button onClick={enviarFormulario} disabled={formSending}
                style={{ width: '100%', padding: '16px', borderRadius: 50, border: 'none', background: formSending ? '#555' : 'linear-gradient(135deg, #7b2fd4, #421869)', color: 'white', fontWeight: 800, fontSize: 16, cursor: formSending ? 'not-allowed' : 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                {formSending ? 'Enviando…' : 'Enviar y recibir presentación'}
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: '48px 32px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 16px' }}>¡Recibimos tu consulta!</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                Revisa tu correo — en breve te enviamos nuestra presentación y te contactamos con una propuesta personalizada para <strong style={{ color: 'white' }}>{form.empresa}</strong>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: '48px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 22, color: 'white', marginBottom: 8 }}>Giro Lab</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>Bienestar organizacional con propósito</p>
        <a href="mailto:omar@girolab.net" style={{ color: '#ffa719', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>omar@girolab.net</a>
        <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} Giro Lab. Todos los derechos reservados.</div>
      </footer>

    </div>
  )
}
