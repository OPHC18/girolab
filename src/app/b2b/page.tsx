'use client'
import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import dynamic from 'next/dynamic'

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then(m => m.DotLottieReact),
  { ssr: false }
)

// ── Tracking IDs (set in Vercel env vars) ──────────────────────────────────
const FB_PIXEL_ID  = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const GA4_ID       = process.env.NEXT_PUBLIC_GA4_ID
const OMAR_WA      = process.env.NEXT_PUBLIC_OMAR_WA

// ── Logos (public/clientes/logo-1.png … logo-30.png) ─────────────────────
const CLIENTE_LOGOS = Array.from({ length: 23 }, (_, i) => `/clientes/logo-${i + 1}.png`)

// ── Servicios ─────────────────────────────────────────────────────────────
const SERVICIOS = [
  {
    id: 'outdoor',
    nombre: 'Talleres Outdoor & Indoor',
    descripcion: 'Experiencias de aprendizaje diseñadas para transformar equipos, ya sea en espacios abiertos llenos de naturaleza o en ambientes controlados de alta concentración.',
    fotos: ['/servicios/Outdoor.webp', '/servicios/Outdoor-1.webp'],
    color: '#1D9E75',
  },
  {
    id: 'teambuilding',
    nombre: 'Teambuilding',
    descripcion: 'Actividades vivenciales que fortalecen la confianza, la comunicación y la cohesión entre los miembros del equipo de forma natural y duradera.',
    fotos: ['/servicios/Team-Building.webp'],
    color: '#421869',
  },
  {
    id: 'negociacion',
    nombre: 'Negociación y Ventas',
    descripcion: 'Programas prácticos que desarrollan habilidades de influencia, persuasión y cierre, combinando inteligencia conversacional con técnicas de alto rendimiento.',
    fotos: ['/servicios/negociacion.webp'],
    color: '#e65100',
  },
  {
    id: 'habilidades',
    nombre: 'Desarrollo de Habilidades Blandas',
    descripcion: 'Formación en liderazgo, comunicación asertiva, inteligencia emocional y gestión del estrés — las competencias que marcan la diferencia a largo plazo.',
    fotos: ['/servicios/habilidades.webp'],
    color: '#1565c0',
  },
  {
    id: 'danza-primal',
    nombre: 'Danza Primal',
    descripcion: 'Una metodología única que usa el movimiento y la expresión corporal para liberar tensiones, conectar con el cuerpo y potenciar la creatividad del equipo.',
    fotos: ['/servicios/danza.webp'],
    color: '#c62828',
  },
]

// ── Historia ───────────────────────────────────────────────────────────────
const HISTORIA = [
  { year: '2015', nombre: 'Need It', color: '#e53935', desc: 'Nuestro primer intento. Queríamos conectar a las personas con lo que necesitaban. Fue un error del que aprendimos mucho sobre el mercado y sobre nosotros mismos.' },
  { year: '2016', nombre: 'Giro', color: '#ffa719', desc: 'Una imagen fresca y lúdica que trajo buenos resultados. Pero el mercado pedía algo con más profundidad, más profesionalismo, más sustancia.' },
  { year: '2026', nombre: 'Giro Lab', color: '#421869', desc: 'La síntesis de nueve años de aprendizaje. Un laboratorio de bienestar donde la ciencia, la experiencia y el acompañamiento humano se encuentran para transformar organizaciones.' },
]

// ── SPIN ───────────────────────────────────────────────────────────────────
type SpinStep = {
  id: string
  pregunta: string
  tipo: 'options'
  opciones: string[]
  variable: string
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
    id: 'estilo',
    pregunta: '¿Qué estilo de taller o sesiones te gusta más?',
    tipo: 'options',
    opciones: ['80% Práctico / Experiencial', 'Outdoor', 'Indoor', 'Exposición Teórica', 'Otros'],
    variable: 'estilo',
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

const YOUTUBE_VIDEO_ID: string = 'VReE3ujRKLM'

export default function B2BPage() {
  const [scrollY, setScrollY]             = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [spinStep, setSpinStep]           = useState(0)
  const [respuestas, setRespuestas]       = useState<Record<string, string>>({})
  const [spinDone, setSpinDone]           = useState(false)
  const [form, setForm]                   = useState<Record<string, string>>({})
  const [formSending, setFormSending]     = useState(false)
  const [formDone, setFormDone]           = useState(false)
  const [formError, setFormError]         = useState('')
  const [otroModal, setOtroModal]         = useState(false)
  const [otroTexto, setOtroTexto]         = useState('')
  const otroRef        = useRef<HTMLTextAreaElement>(null)
  const formStartedRef = useRef(false)
  const formDoneRef    = useRef(false)

  useEffect(() => {
    if (typeof (window as any).fbq === 'function') (window as any).fbq('track', 'ViewContent', { content_name: 'B2B Landing' })
    if (typeof (window as any).ttq !== 'undefined') (window as any).ttq.track('ViewContent', { content_name: 'B2B Landing' })
    const onBeforeUnload = () => {
      if (formStartedRef.current && !formDoneRef.current) {
        if (typeof (window as any).fbq === 'function') (window as any).fbq('trackCustom', 'B2BFormAbandonment')
        if (typeof (window as any).gtag === 'function') (window as any).gtag('event', 'form_abandon', { event_category: 'B2B' })
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisibleSections(prev => new Set([...prev, e.target.id]))
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => { if (otroModal && otroRef.current) otroRef.current.focus() }, [otroModal])

  const stepActual = SPIN_STEPS[spinStep]
  const getPregunta = (step: SpinStep) =>
    step.pregunta.replace('{servicio}', respuestas.servicio?.toLowerCase() || 'programa')

  const esOtro = (op: string) => op.toLowerCase().startsWith('otro')

  const elegirOpcion = (opcion: string) => {
    if (esOtro(opcion)) { setOtroTexto(''); setOtroModal(true); return }
    confirmarOpcion(opcion)
  }

  const confirmarOpcion = (opcion: string) => {
    const newResp = { ...respuestas, [stepActual.variable]: opcion }
    setRespuestas(newResp)
    setOtroModal(false); setOtroTexto('')
    if (spinStep < SPIN_STEPS.length - 1) setTimeout(() => setSpinStep(s => s + 1), 300)
    else setTimeout(() => setSpinDone(true), 400)
  }

  const retroceder = () => { if (spinStep > 0) setSpinStep(s => s - 1) }

  const buildResumen = () => [
    `Servicio solicitado: ${respuestas.servicio}`,
    `Objetivo: ${respuestas.objetivo}`,
    `Estilo preferido: ${respuestas.estilo}`,
    `Participantes: ${respuestas.personas}`,
    `Inicio previsto: ${respuestas.cuando}`,
    `Presupuesto: ${respuestas.presupuesto}`,
    `Experiencia previa: ${respuestas.experiencia_previa === 'Sí' ? `Sí — ${respuestas.experiencia_detalle}` : 'No'}`,
  ].join('\n')

  const enviarFormulario = async () => {
    const { nombres, apellidos, empresa, cargo, correo } = form
    if (!nombres || !apellidos || !empresa || !cargo || !correo || !/\S+@\S+\.\S+/.test(correo)) {
      setFormError('Por favor completa todos los campos obligatorios con un correo válido.')
      return
    }
    setFormSending(true); setFormError('')
    try {
      const res = await fetch('/api/b2b/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          conversacion: SPIN_STEPS.map(s => ({ pregunta: getPregunta(s), respuesta: respuestas[s.variable] || '' })),
          resumen: buildResumen(),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setFormDone(true)
        formDoneRef.current = true
        if (typeof (window as any).fbq === 'function') (window as any).fbq('track', 'Lead')
        if (typeof (window as any).gtag === 'function') (window as any).gtag('event', 'generate_lead', { event_category: 'B2B' })
      } else {
        setFormError(data.error || 'Error al enviar. Intenta de nuevo.')
      }
    } catch { setFormError('Error de conexión. Intenta de nuevo.') }
    finally { setFormSending(false) }
  }

  const vis = (id: string) => visibleSections.has(id)

  return (
    <>
      {/* ── Analytics ── */}
      {GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());gtag('config','${GA4_ID}');
          `}</Script>
        </>
      )}
      {FB_PIXEL_ID && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
          s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');
        `}</Script>
      )}

      <style>{`
        @keyframes pulse1{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.15) translate(30px,20px)}}
        @keyframes pulse2{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.2) translate(-20px,-30px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes waPulse{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.4)}50%{box-shadow:0 4px 32px rgba(37,211,102,0.7)}}
        .sec{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease}
        .sec.vis{opacity:1;transform:none}
        .spin-btn{transition:all 0.2s}
        .spin-btn:hover{background:rgba(123,47,212,0.3)!important;border-color:#7b2fd4!important}
        .svc-card:hover .svc-img{transform:scale(1.05)}
        .wa-btn{animation:waPulse 2.5s ease-in-out infinite}
      `}</style>

      <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#0d0d0d', minHeight: '100vh', color: 'white' }}>

        {/* ── HEADER — totalmente transparente ──────────────────────────── */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, padding: '0 24px' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <DotLottieReact
                src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie"
                loop autoplay style={{ width: 44, height: 44 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
                <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 18, color: 'white', letterSpacing: 1, textTransform: 'uppercase' }}>Giro</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 10, color: 'white', letterSpacing: 4, textTransform: 'uppercase', textAlign: 'left', marginTop: 1 }}>Lab</span>
              </div>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <a href="#servicios" style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Servicios</a>
              <a href="#conversemos" style={{ padding: '10px 22px', borderRadius: 50, background: 'linear-gradient(135deg, #7b2fd4, #421869)', color: 'white', fontWeight: 800, fontSize: 14, textDecoration: 'none', fontFamily: 'Raleway, sans-serif' }}>
                Hablemos
              </a>
            </div>
          </div>
        </header>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '120px 24px 80px' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.35, background: 'radial-gradient(circle,#7b2fd4,transparent)', top: '-10%', left: '-10%', animation: 'pulse1 8s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.25, background: 'radial-gradient(circle,#ffa719,transparent)', bottom: '0%', right: '-5%', animation: 'pulse2 10s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', transform: `translateY(${scrollY * 0.1}px)` }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 1100 }}>
            <div style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#ffa719', marginBottom: 24, fontWeight: 700, animation: 'fadeUp 0.6s ease forwards' }}>
              Bienestar Organizacional
            </div>
            <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px, 4.5vw, 58px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 24px', background: 'linear-gradient(135deg,#ffffff 0%,#b794f4 50%,#ffa719 100%)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'fadeUp 0.8s ease 0.2s forwards, shimmer 4s linear 1s infinite', opacity: 0, whiteSpace: 'pre-line' }}>
              {'Transformamos equipos.\nConstruimos bienestar real.'}
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px', animation: 'fadeUp 0.8s ease 0.4s forwards', opacity: 0 }}>
              9 años acompañando a personas y organizaciones hacia su mejor versión. Con metodología, ciencia y un equipo que sabe lo que hace.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.8s ease 0.6s forwards', opacity: 0 }}>
              <a href="#conversemos" style={{ padding: '16px 36px', borderRadius: 50, background: 'linear-gradient(135deg,#7b2fd4,#421869)', color: 'white', fontWeight: 800, fontSize: 16, textDecoration: 'none', fontFamily: 'Raleway, sans-serif' }}>Hablemos de tu equipo</a>
              <a href="#servicios"   style={{ padding: '16px 36px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: 16, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>Ver servicios</a>
            </div>
          </div>
        </section>

        {/* ── OMAR ──────────────────────────────────────────────────────── */}
        <section id="equipo" data-animate style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.03)' }}
          className={`sec${vis('equipo') ? ' vis' : ''}`}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 48, alignItems: 'center' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 220, height: 220, borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(123,47,212,0.4)', boxShadow: '0 0 40px rgba(123,47,212,0.3)', background: '#1a1a2e', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/omar-herrera.jpg" alt="Omar Herrera" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', position: 'absolute', inset: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                <div style={{ fontSize: 80, color: '#444', userSelect: 'none' }}>👤</div>
              </div>
              <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#ffa719', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
            </div>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Fundador</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, margin: '0 0 8px', color: 'white' }}>Omar Herrera</h2>
              <p style={{ color: '#b794f4', fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>Coach Ontológico, Organizacional y Sistémico · CEO Giro Lab</p>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 540 }}>
                9 años acompañando a organizaciones desde el coaching ontológico, organizacional y sistémico. He trabajado con equipos de distintos tamaños y sectores, facilitando procesos de transformación genuina: donde las personas se reconectan con su propósito y los equipos recuperan coherencia, energía y resultados. Creo que el bienestar no es un beneficio extra — es la base de todo rendimiento sostenible.
              </p>
            </div>
          </div>
        </section>

        {/* ── HISTORIA (timeline) ───────────────────────────────────────── */}
        <section id="nosotros" data-animate style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}
          className={`sec${vis('nosotros') ? ' vis' : ''}`}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#ffa719', fontWeight: 700, marginBottom: 12 }}>Nuestra historia</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: 0, color: 'white' }}>9 años de evolución</h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: 48 }}>
            <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,#7b2fd4,#ffa719,#421869)' }} />
            {HISTORIA.map((h, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i < HISTORIA.length - 1 ? 64 : 0, paddingLeft: 32 }}>
                <div style={{ position: 'absolute', left: -40, top: 6, width: 18, height: 18, borderRadius: '50%', background: h.color, boxShadow: `0 0 20px ${h.color}80`, border: '3px solid #0d0d0d' }} />
                <div style={{ fontSize: 13, color: h.color, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{h.year}</div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 12px' }}>{h.nombre}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: 0 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVICIOS ─────────────────────────────────────────────────── */}
        <section id="servicios" data-animate style={{ padding: '100px 24px', background: '#111' }}
          className={`sec${vis('servicios') ? ' vis' : ''}`}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Lo que hacemos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: 0, color: 'white' }}>Nuestros servicios</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {/* Card "a medida" al inicio */}
              <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,#421869,#7b2fd4)', border: '1px solid rgba(123,47,212,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 28px', minHeight: 280 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 14 }}>¿Algo distinto en mente?</div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 14px', lineHeight: 1.2 }}>Diseñamos talleres y sesiones a tu medida</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>Cada organización es única. Cuéntanos tu desafío y construimos la solución juntos — sin moldes, sin formatos genéricos.</p>
                <a href="#conversemos" style={{ display: 'inline-block', padding: '11px 22px', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: 'Raleway, sans-serif', border: '1px solid rgba(255,255,255,0.25)', width: 'fit-content' }}>
                  Cuéntanos →
                </a>
              </div>
              {SERVICIOS.map(s => (
                <div key={s.id} className="svc-card" style={{ borderRadius: 20, overflow: 'hidden', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' }}>
                  <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: `linear-gradient(135deg, ${s.color}33, ${s.color}11)`, display: 'grid', gridTemplateColumns: s.fotos.length > 1 ? '1fr 1fr' : '1fr', gap: 2 }}>
                    {s.fotos.map((foto, fi) => (
                      <div key={fi} style={{ overflow: 'hidden', height: 200 }}>
                        <img src={foto} alt={`${s.nombre} ${fi + 1}`} className="svc-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    ))}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, #1a1a1a, transparent)' }} />
                  </div>
                  <div style={{ padding: '24px 24px 28px' }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: s.color, marginBottom: 14 }} />
                    <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>{s.nombre}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VIDEO ─────────────────────────────────────────────────────── */}
        <section id="video" data-animate style={{ padding: '80px 24px', background: '#0d0d0d' }}
          className={`sec${vis('video') ? ' vis' : ''}`}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Conócenos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, margin: 0, color: 'white' }}>Mira cómo trabajamos</h2>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                title="Giro Lab — Bienestar organizacional"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </section>

        {/* ── CLIENTES — fondo claro ─────────────────────────────────────── */}
        <div style={{ background: '#f5f3ff', padding: '80px 0' }}>
          <section id="clientes" data-animate style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}
            className={`sec${vis('clientes') ? ' vis' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#7b2fd4', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Confían en nosotros</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, margin: 0, color: '#1a1a2e' }}>Empresas que han transformado sus equipos</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 20 }}>
              {CLIENTE_LOGOS.map((src, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <img src={src} alt={`Cliente ${i + 1}`} style={{ maxWidth: '100%', maxHeight: 50, objectFit: 'contain' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── SPIN ──────────────────────────────────────────────────────── */}
        <section id="conversemos" data-animate style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}
          className={`sec${vis('conversemos') ? ' vis' : ''}`}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#ffa719', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Cuéntanos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, margin: '0 0 16px', color: 'white' }}>Empecemos a conocer tu organización</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: 0 }}>Responde estas preguntas para que podamos preparar una propuesta personalizada.</p>
            </div>

            {!spinDone ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
                  {SPIN_STEPS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= spinStep ? '#7b2fd4' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#ffa719', fontWeight: 700 }}>Pregunta {spinStep + 1} de {SPIN_STEPS.length}</div>
                  {spinStep > 0 && (
                    <button onClick={retroceder} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', padding: '4px 10px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                      ← Anterior
                    </button>
                  )}
                </div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 28px', lineHeight: 1.4 }}>{getPregunta(stepActual)}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stepActual.opciones.map(op => (
                    <button key={op} onClick={() => elegirOpcion(op)} className="spin-btn"
                      style={{ padding: '14px 20px', borderRadius: 12, border: '1.5px solid rgba(123,47,212,0.4)', background: 'rgba(123,47,212,0.1)', color: 'white', fontSize: 15, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif' }}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            ) : !formDone ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ background: 'rgba(123,47,212,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 32, border: '1px solid rgba(123,47,212,0.3)' }}>
                  <div style={{ fontSize: 13, color: '#b794f4', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Resumen de tu consulta</div>
                  {SPIN_STEPS.map(s => (
                    <div key={s.id} style={{ marginBottom: 6 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{s.pregunta.split('?')[0].replace('{servicio}', respuestas.servicio?.toLowerCase() || 'programa')}:</span>
                      <span style={{ color: 'white', fontSize: 14, fontWeight: 600, marginLeft: 8 }}>{respuestas[s.variable]}</span>
                    </div>
                  ))}
                </div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Perfecto. Déjanos tus datos</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px' }}>Te enviaremos nuestra presentación y en breve te contactaremos con una propuesta personalizada.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
                  onFocus={() => {
                    if (!formStartedRef.current) {
                      formStartedRef.current = true
                      if (typeof (window as any).fbq === 'function') (window as any).fbq('track', 'Contact')
                      if (typeof (window as any).ttq !== 'undefined') (window as any).ttq.track('Contact')
                      if (typeof (window as any).gtag === 'function') (window as any).gtag('event', 'form_start', { event_category: 'B2B' })
                    }
                  }}>
                  {FORMULARIO_CAMPOS.map(campo => (
                    <div key={campo.key} style={{ gridColumn: ['correo', 'empresa'].includes(campo.key) ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{campo.label}</label>
                      <input type={campo.type} value={form[campo.key] || ''} onChange={e => setForm(p => ({ ...p, [campo.key]: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 15, fontFamily: 'DM Sans', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                {formError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{formError}</p>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setSpinDone(false)} style={{ padding: '16px 24px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.2)', background: 'none', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>← Volver</button>
                  <button onClick={enviarFormulario} disabled={formSending} style={{ flex: 1, padding: '16px', borderRadius: 50, border: 'none', background: formSending ? '#555' : 'linear-gradient(135deg,#7b2fd4,#421869)', color: 'white', fontWeight: 800, fontSize: 16, cursor: formSending ? 'not-allowed' : 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                    {formSending ? 'Enviando…' : 'Enviar y recibir presentación'}
                  </button>
                </div>
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

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer style={{ padding: '48px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 22, color: 'white', marginBottom: 8 }}>Giro Lab</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>Bienestar organizacional con propósito</p>
          <a href="mailto:omar@girolab.net" style={{ color: '#ffa719', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>omar@girolab.net</a>
          <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} Giro Lab. Todos los derechos reservados.</div>
        </footer>
      </div>

      {/* ── WHATSAPP FLOAT ────────────────────────────────────────────────── */}
      {OMAR_WA && (
        <a
          href={`https://wa.me/${OMAR_WA}?text=Hola%20Omar%2C%20vi%20tu%20p%C3%A1gina%20de%20Giro%20Lab%20y%20me%20interesa%20saber%20m%C3%A1s.`}
          target="_blank" rel="noopener noreferrer" className="wa-btn"
          style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, width: 60, height: 60, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          aria-label="Chat por WhatsApp">
          <svg viewBox="0 0 24 24" fill="white" width={30} height={30}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      )}

      {/* ── MODAL OTRO ────────────────────────────────────────────────────── */}
      {otroModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setOtroModal(false) }}>
          <div style={{ background: '#1a1a2e', borderRadius: 24, padding: '36px 32px', maxWidth: 480, width: '100%', border: '1px solid rgba(123,47,212,0.4)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Cuéntanos con tus palabras</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 20px' }}>¿Qué tienes en mente? Escríbelo aquí y lo incluiremos en tu consulta.</p>
            <textarea ref={otroRef} value={otroTexto} onChange={e => setOtroTexto(e.target.value)}
              placeholder="Ej: Necesitamos un programa combinado de bienestar y liderazgo..."
              rows={4}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(123,47,212,0.4)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 15, fontFamily: 'DM Sans', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setOtroModal(false)} style={{ flex: 1, padding: '13px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans' }}>Cancelar</button>
              <button disabled={!otroTexto.trim()} onClick={() => confirmarOpcion(otroTexto.trim())}
                style={{ flex: 2, padding: '13px', borderRadius: 50, border: 'none', background: otroTexto.trim() ? 'linear-gradient(135deg,#7b2fd4,#421869)' : '#333', color: 'white', fontWeight: 800, fontSize: 15, cursor: otroTexto.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Raleway, sans-serif' }}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
