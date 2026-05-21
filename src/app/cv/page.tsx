'use client'
import { useState, useEffect, useRef } from 'react'
import type { jsPDF as jsPDFType } from 'jspdf'

const HERRAMIENTAS = [
  { nombre: 'Office', pct: 98 }, { nombre: 'Prezi', pct: 99 },
  { nombre: 'Elementor', pct: 99 }, { nombre: 'Camtasia', pct: 99 },
  { nombre: 'Illustrator', pct: 80 }, { nombre: 'WordPress', pct: 90 },
  { nombre: 'Audition', pct: 70 }, { nombre: 'Photoshop', pct: 60 },
]
const IA_TOOLS = [
  { nombre: 'Claude', pct: 95, desc: 'Estrategia y diseño de contenido' },
  { nombre: 'ChatGPT', pct: 92, desc: 'Ideación y redacción' },
  { nombre: 'Gemini', pct: 88, desc: 'Investigación y análisis' },
  { nombre: 'Artlist AI', pct: 85, desc: 'Producción audiovisual' },
]
const HABILIDADES_RADAR = [
  { label: 'Comunicación', value: 98 }, { label: 'Liderazgo', value: 95 },
  { label: 'Empatía', value: 97 }, { label: 'Tenacidad', value: 98 },
  { label: 'Creatividad', value: 96 }, { label: 'Análisis', value: 88 },
  { label: 'Trabajo en equipo', value: 94 }, { label: 'Proactividad', value: 93 },
]
const EXPERIENCIA = [
  { periodo: '2014 — Presente', rol: 'Coach & Facilitador', empresa: 'Giro Lab / Independiente', desc: 'Diseño y facilitación de talleres de habilidades blandas. Outdoor con aprendizaje experiencial. Coaching individual y organizacional para +50 empresas.', hot: true },
  { periodo: '2018 — 2019', rol: 'Capacitador Corporativo', empresa: 'Farmacias Peruanas', desc: 'Malla de capacitación y talleres experienciales para activar habilidades blandas.', hot: false },
  { periodo: '2014', rol: 'Supervisor & Capacitador', empresa: 'Lima Celular SAC', desc: 'Técnicas de cierre, manejo de objeciones y fases de venta para equipos comerciales.', hot: false },
  { periodo: '2011 — 2013', rol: 'Supervisor de Ventas', empresa: 'Telvicom S.A.', desc: 'Gestión de equipo de ventas. Premio colaborador del año 2012 y 2014.', hot: false },
  { periodo: '2010 — 2011', rol: 'Asesor de Servicio', empresa: 'Nissan Maquinarias S.A.', desc: 'Atención al cliente y venta de productos del concesionario.', hot: false },
  { periodo: '2007 — 2010', rol: 'Representante Financiero', empresa: 'Interbank', desc: '1er puesto fondos mutuos (Oct–Dic 2009) y creatividad comercial 2009.', hot: false },
]
const FORMACION = [
  { año: '2021', titulo: 'Coaching Ontológico', inst: 'Axon Training' },
  { año: '2021', titulo: 'Coaching Sistémico', inst: 'Marcelo Brosky' },
  { año: '2019', titulo: 'Design Thinking + Storytelling', inst: 'Crehana' },
  { año: '2019', titulo: 'Diseño Web / Front End / WordPress', inst: 'Crehana' },
  { año: '2018', titulo: 'Marketing Digital', inst: 'Next U' },
  { año: '2017', titulo: 'Coaching Org. · Maestría Liderazgo · Outdoor Trainer', inst: 'Coaching Global' },
  { año: '2016', titulo: 'Diplomado Coaching — Equipos de Alto Rendimiento', inst: 'ISIL' },
  { año: '2013', titulo: 'Diplomado Dirección y Gestión Comercial', inst: 'ISIL' },
  { año: '2005', titulo: 'Ciencias de la Comunicación', inst: 'IST Cepea' },
]
const SERVICIOS = [
  { icon: '◈', titulo: 'Talleres Vivenciales', desc: 'Liderazgo, comunicación, inteligencia emocional. Metodología activa, resultados medibles.', cat: 'org' },
  { icon: '◉', titulo: 'Teambuilding & Outdoor', desc: 'Cohesión real. Dinámicas que rompen estructuras rígidas y construyen equipos.', cat: 'org' },
  { icon: '◎', titulo: 'Mentoría & Asesoría', desc: 'Acompañamiento estratégico con claridad, dirección y resultados concretos.', cat: 'org' },
  { icon: '◇', titulo: 'Coaching Ontológico', desc: 'Transformación desde el lenguaje, las emociones y el cuerpo.', cat: 'per' },
  { icon: '◆', titulo: 'Coaching Sistémico', desc: 'Trabajo con los sistemas relacionales que te limitan.', cat: 'per' },
  { icon: '◐', titulo: 'Coaching Organizacional', desc: 'Líderes y equipos: alineación, propósito y cultura que sostiene el crecimiento.', cat: 'per' },
]
const CLIENTES_LOGOS = Array.from({ length: 23 }, (_, i) => `/clientes/logo-${i + 1}.png`)

function useInView(ref: React.RefObject<Element | null>) {
  const [v, setV] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.12 })
    o.observe(ref.current); return () => o.disconnect()
  }, [])
  return v
}

function useCounter(target: number, inView: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / 1400, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick); else setVal(target)
    }
    requestAnimationFrame(tick)
  }, [inView, target])
  return val
}

// ─── RING (sin contenedor azul) ─────────────────────────────────────────────
function Ring({ pct, label, size = 90, stroke = 7, inView = false, delay = 0 }: {
  pct: number; label: string; size?: number; stroke?: number; inView?: boolean; delay?: number
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = inView ? circ - (pct / 100) * circ : circ
  const cx = size / 2
  // Color del arco según porcentaje: naranja alto, azul medio, mezcla
  const arcColor = pct >= 90 ? '#E8860A' : pct >= 75 ? '#c97020' : '#00072C'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track gris muy claro */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(0,7,44,0.07)" strokeWidth={stroke} />
          {/* Arco de fondo (100%) levemente visible */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(0,7,44,0.12)" strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={0} />
          {/* Arco del valor real */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={arcColor} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) ${delay}s` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: size * 0.17, color: arcColor, fontStyle: 'italic' }}>
            {pct}<span style={{ fontSize: size * 0.1 }}>%</span>
          </span>
        </div>
      </div>
      <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 10, color: '#1a2a4a', textAlign: 'center', letterSpacing: 0.5, maxWidth: size, fontWeight: 600 }}>{label}</span>
    </div>
  )
}

// ─── RADAR (sin contenedor, con animación de respiración) ──────────────────
function Radar({ data, inView }: { data: { label: string; value: number }[]; inView: boolean }) {
  const [breathe, setBreathe] = useState(false)
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => {
      setBreathe(true)
      const interval = setInterval(() => setBreathe(b => !b), 2800)
      return () => clearInterval(interval)
    }, 1600)
    return () => clearTimeout(t)
  }, [inView])

  const cx = 170, cy = 170, r = 120, n = data.length
  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2
  const scale = breathe ? 1.03 : 1.0
  const pts = data.map((d, i) => {
    const rv = inView ? (d.value / 100) * r * scale : 0
    return { x: cx + rv * Math.cos(angle(i)), y: cy + rv * Math.sin(angle(i)) }
  })
  const lpts = data.map((_, i) => ({ x: cx + (r + 30) * Math.cos(angle(i)), y: cy + (r + 30) * Math.sin(angle(i)) }))
  const grids = [0.25, 0.5, 0.75, 1].map(f =>
    data.map((_, i) => `${cx + f * r * Math.cos(angle(i))},${cy + f * r * Math.sin(angle(i))}`).join(' ')
  )
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 340 340" style={{ width: '100%', maxWidth: 340 }}>
      {grids.map((g, i) => <polygon key={i} points={g} fill="none" stroke="rgba(0,7,44,0.08)" strokeWidth="1" />)}
      {data.map((_, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle(i))} y2={cy + r * Math.sin(angle(i))} stroke="rgba(0,7,44,0.08)" strokeWidth="1" />)}
      {/* Capa azul — relleno base */}
      <polygon points={poly} fill="rgba(0,7,44,0.06)" stroke="#00072C" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
        style={{ transition: 'all 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      {/* Capa naranja — contorno principal */}
      <polygon points={poly} fill="rgba(232,134,10,0.1)" stroke="#E8860A" strokeWidth="2"
        style={{ transition: 'all 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5"
          fill={i % 2 === 0 ? "#E8860A" : "#00072C"}
          stroke="white" strokeWidth="1.5"
          style={{ transition: `all 1.5s cubic-bezier(0.4,0,0.2,1) ${i * 0.06}s` }} />
      ))}
      {lpts.map((p, i) => {
        const a = angle(i)
        const anchor = Math.cos(a) < -0.1 ? 'end' : Math.cos(a) > 0.1 ? 'start' : 'middle'
        return <text key={i} x={p.x} y={p.y + 4} textAnchor={anchor}
          style={{ fontSize: 10, fill: '#334466', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 600 }}>{data[i].label}</text>
      })}
    </svg>
  )
}

// ─── IA BARS ────────────────────────────────────────────────────────────────
function IABars({ data, inView }: { data: { nombre: string; pct: number; desc: string }[]; inView: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {data.map((d, i) => (
        <div key={d.nombre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div>
              <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 17, color: '#00072C', fontStyle: 'italic', marginRight: 8 }}>{d.nombre}</span>
              <span style={{ fontSize: 11, color: '#334466', letterSpacing: 0.5 }}>{d.desc}</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, color: '#E8860A', fontStyle: 'italic', marginLeft: 12 }}>{d.pct}%</span>
          </div>
          <div style={{ height: 2, background: 'rgba(0,7,44,0.1)', borderRadius: 1, overflow: 'visible', position: 'relative' }}>
            <div style={{ height: '100%', borderRadius: 1, background: '#00072C', width: inView ? d.pct + '%' : '0%', transition: `width 1.3s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s` }} />
          </div>
          <div style={{ position: 'relative', height: 12 }}>
            <div style={{ position: 'absolute', top: -4, width: 9, height: 9, borderRadius: '50%', background: '#E8860A', border: '2px solid white', left: inView ? `calc(${d.pct}% - 4px)` : '0%', transition: `left 1.3s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s`, boxShadow: '0 0 0 3px rgba(232,134,10,0.2)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── CARRUSEL CLIENTES ──────────────────────────────────────────────────────
function ClientesCarrusel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const logos = [...CLIENTES_LOGOS, ...CLIENTES_LOGOS] // duplicar para loop infinito

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let pos = 0
    let raf: number
    const speed = 0.5 // px por frame
    const step = () => {
      pos += speed
      const half = track.scrollWidth / 2
      if (pos >= half) pos = 0
      track.style.transform = `translateX(-${pos}px)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right,#00072C,transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left,#00072C,transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div ref={trackRef} style={{ display: 'flex', gap: 0, willChange: 'transform' }}>
          {logos.map((src, i) => (
            <div key={i} style={{ flexShrink: 0, width: 200, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={src} alt={`Cliente ${i + 1}`}
                style={{ maxWidth: 145, maxHeight: 65, objectFit: 'contain', filter: 'brightness(0) invert(0.5)', transition: 'filter 0.3s' }}
                onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0) invert(0.9)'}
                onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0) invert(0.5)'}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function CVPage() {
  const [activeSection, setActiveSection] = useState('hero')
  const [menuOpen, setMenuOpen] = useState(false)
  const [printing, setPrinting] = useState(false)

  const statsRef  = useRef<HTMLDivElement>(null)
  const radarRef  = useRef<HTMLDivElement>(null)
  const toolsRef  = useRef<HTMLDivElement>(null)
  const iaRef     = useRef<HTMLDivElement>(null)

  const statsInView = useInView(statsRef)
  const radarInView = useInView(radarRef)
  const toolsInView = useInView(toolsRef)
  const iaInView    = useInView(iaRef)

  const c1 = useCounter(9, statsInView)
  const c2 = useCounter(50, statsInView)
  const c3 = useCounter(1000, statsInView)
  const c4 = useCounter(9, statsInView)

  useEffect(() => {
    document.title = 'Omar Herrera — Coach & Facilitador'
    if (typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'page_view', { page_title: 'CV Omar Herrera', page_location: window.location.href })
    }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { threshold: 0.2 }
    )
    document.querySelectorAll('[data-section]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  const handlePrint = async () => {
    setPrinting(true)
    if (typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'download_cv', { event_category: 'CV', page_title: 'CV Omar Herrera' })
    }
    try {
      const { jsPDF } = await import('jspdf')
      await generarPDF(jsPDF)
    } catch (e) {
      console.error('jsPDF error:', e)
      window.print()
    }
    setPrinting(false)
  }

  const NAV = [['experiencia','Experiencia'],['servicios','Servicios'],['formacion','Formación'],['clientes','Clientes'],['contacto','Contacto']]
  const navy = '#00072C', orange = '#E8860A'

  return (
    <div style={{ fontFamily:"'Instrument Sans',sans-serif", color:'white', background:navy }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: #E8860A; color: white; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #00072C; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeL   { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeR   { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scIn    { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes lineG   { from{width:0} to{width:52px} }
        @keyframes dotIn   { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }

        .a1{animation:fadeUp .8s ease both} .a2{animation:fadeUp .8s .12s ease both}
        .a3{animation:fadeUp .8s .24s ease both} .a4{animation:fadeUp .8s .36s ease both}
        .a5{animation:fadeUp .8s .5s ease both}
        .al{animation:fadeL .8s ease both} .ar{animation:fadeR .8s ease both}
        .sc{animation:scIn .65s ease both}

        .nl{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);transition:color .2s;cursor:pointer;font-weight:600}
        .nl:hover,.nl.on{color:#E8860A}

        .bw{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid white;background:transparent;color:white;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bw:hover{background:white;color:#00072C}
        .bg2{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid rgba(255,255,255,0.18);background:transparent;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bg2:hover{border-color:white;color:white}
        .bo{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid #E8860A;background:#E8860A;color:white;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bo:hover{background:transparent;color:#E8860A}
        .bn{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid rgba(0,7,44,0.2);background:transparent;color:rgba(0,7,44,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bn:hover{border-color:#00072C;color:#00072C}

        /* card blanca - texto nunca gris */
        .cw{background:white;border:1px solid rgba(0,7,44,0.1);transition:all .3s}
        .cw:hover{border-color:rgba(0,7,44,0.22);transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,7,44,0.1)}
        .cw .ctxt{color:#334466 !important}
        .cw .ctit{color:#00072C !important}

        .el{border-left:1px solid rgba(255,255,255,0.09);padding-left:28px;position:relative}
        .el::before{content:'';position:absolute;left:-4px;top:10px;width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.12)}
        .el.hot::before{background:#E8860A;box-shadow:0 0 0 4px rgba(232,134,10,0.1);width:9px;height:9px;left:-5px}

        .sl{font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:#E8860A;margin-bottom:12px}
        .dv{width:0;height:2px;background:#E8860A;margin:14px 0 36px;animation:lineG .8s ease both}

        /* Sección blanca — separador limpio, sin degradados */
        .white-sec{background:white;border-top:1px solid rgba(0,7,44,0.08);border-bottom:1px solid rgba(0,7,44,0.08)}

        @media(max-width:768px){
          .hg{grid-template-columns:1fr!important;gap:48px!important}
          .hh{font-size:clamp(44px,11vw,70px)!important}
          .sg{grid-template-columns:repeat(2,1fr)!important}
          .tw{grid-template-columns:1fr!important;gap:48px!important}
          .th{grid-template-columns:1fr!important}
          .nl-d{display:none!important} .mb{display:flex!important}
          .sp{padding:80px 20px!important} .hp{padding:120px 20px 72px!important}
          .ff{flex-direction:column!important;text-align:center!important;gap:8px!important}
          .rg{grid-template-columns:repeat(4,1fr)!important}
        }
        @media(min-width:769px){.mb{display:none!important}.mm{display:none!important}}
        @media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{margin:0;size:A4}body{background:white!important}.np{display:none!important}.pp{width:210mm;height:297mm;overflow:hidden;page-break-after:always;page-break-inside:avoid}.pp:last-child{page-break-after:avoid}}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(0,7,44,0.94)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'white' }}>O<em style={{ color:orange }}>H</em></div>
        <div className="nl-d" style={{ display:'flex',gap:28 }}>
          {NAV.map(([id,label]) => <span key={id} className={`nl${activeSection===id?' on':''}`} onClick={() => scrollTo(id)}>{label}</span>)}
        </div>
        <button onClick={handlePrint} className="bw" style={{ padding:'9px 20px',fontSize:10 }}><span>↓ CV</span></button>
        <button className="mb" onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none',border:'none',color:'white',cursor:'pointer',fontSize:22,display:'none',alignItems:'center' }}>{menuOpen?'✕':'☰'}</button>
      </nav>
      {menuOpen && <div className="mm" style={{ position:'fixed',top:64,left:0,right:0,zIndex:99,background:'#060f3a',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'24px',display:'flex',flexDirection:'column',gap:20 }}>{NAV.map(([id,label]) => <span key={id} className="nl" style={{ fontSize:14 }} onClick={() => scrollTo(id)}>{label}</span>)}</div>}

      {/* ══ HERO ══ */}
      <section id="hero" data-section className="hp" style={{ padding:'140px 40px 0',maxWidth:1200,margin:'0 auto' }}>
        <div className="hg" style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:80,alignItems:'center',paddingBottom:80 }}>
          <div>
            <div className="a1 sl">Coach · Facilitador · Mentor</div>
            <h1 className="a2 hh" style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(54px,6vw,92px)',fontWeight:400,lineHeight:1.0,color:'white',marginBottom:14 }}>
              Omar<br/><em style={{ color:orange }}>Herrera</em>
            </h1>
            <div className="dv a3" />
            <blockquote className="a3" style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,fontStyle:'italic',color:'rgba(255,255,255,0.55)',borderLeft:`2px solid rgba(232,134,10,0.35)`,paddingLeft:20,lineHeight:1.5,marginBottom:28 }}>
              "Convicción y no Condición."
            </blockquote>
            <p className="a4" style={{ fontSize:15,color:'rgba(255,255,255,0.6)',lineHeight:1.85,maxWidth:480,marginBottom:44 }}>
              Acompaño a personas y organizaciones a descubrir lo que realmente son capaces de hacer — con metodología, presencia y resultados que perduran.
            </p>
            <div className="a5" style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
              <button onClick={handlePrint} className="bw"><span>↓ Descargar CV</span></button>
              <a href="https://wa.link/95x6de" target="_blank" rel="noopener noreferrer" className="bg2">Conversemos</a>
            </div>
          </div>

          {/* Foto — sin badge 50+ empresas, en su lugar: edad y fecha */}
          <div className="ar" style={{ position:'relative' }}>
            <div style={{ width:'100%',aspectRatio:'3/4',background:'rgba(255,255,255,0.04)',overflow:'hidden',position:'relative',border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:orange,zIndex:2 }} />
              <img src="/omar-herrera.jpg" alt="Omar Herrera"
                style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',display:'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,7,44,0.55) 0%,transparent 50%)' }} />
            </div>
            {/* Badge: edad y fecha de nacimiento */}
            <div style={{ position:'absolute',bottom:-18,right:-18,background:orange,padding:'14px 18px',animation:'float 4s ease-in-out infinite',zIndex:3,minWidth:110 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:'white',lineHeight:1,fontStyle:'italic' }}>42</div>
              <div style={{ fontSize:9,letterSpacing:1.5,color:'rgba(255,255,255,0.9)',marginTop:2,textTransform:'uppercase',fontWeight:600 }}>años</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.75)',marginTop:3,fontWeight:500 }}>18 · 09 · 1983</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="sg" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          {[{v:c1,s:'+',l:'Años de experiencia'},{v:c2,s:'+',l:'Empresas acompañadas'},{v:c3,s:'+',l:'Personas impactadas'},{v:c4,s:'',l:'Certificaciones'}].map((s,i) => (
            <div key={s.l} style={{ padding:'28px 20px',textAlign:'center',borderRight:i<3?'1px solid rgba(255,255,255,0.07)':'none' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:40,color:'white',fontStyle:'italic',lineHeight:1 }}>{s.v}{s.s}</div>
              <div style={{ fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.35)',marginTop:8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVICIOS — BLANCO (corte limpio) ══ */}
      <section id="servicios" data-section className="white-sec" style={{ padding:'100px 40px' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:14 }}>
            <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:12 }}>Qué hago</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(28px,3.5vw,48px)',fontWeight:400,color:navy }}>
              Mis <em style={{ color:orange }}>servicios</em>
            </h2>
          </div>
          <p style={{ textAlign:'center',fontSize:12,color:'#334466',letterSpacing:3,textTransform:'uppercase',marginBottom:48,fontWeight:600 }}>Para organizaciones</p>
          <div className="th" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,background:'rgba(0,7,44,0.07)',marginBottom:52 }}>
            {SERVICIOS.filter(s=>s.cat==='org').map((s,i) => (
              <div key={i} className="cw sc" style={{ padding:'40px 32px',animationDelay:i*0.1+'s' }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:'rgba(0,7,44,0.18)',marginBottom:14 }}>{s.icon}</div>
                <div className="ctit" style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,marginBottom:10,color:navy }}>{s.titulo}</div>
                <p className="ctxt" style={{ fontSize:13,lineHeight:1.8,color:'#334466' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign:'center',fontSize:12,color:'#334466',letterSpacing:3,textTransform:'uppercase',marginBottom:48,fontWeight:600 }}>Para personas</p>
          <div className="th" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,background:'rgba(0,7,44,0.07)' }}>
            {SERVICIOS.filter(s=>s.cat==='per').map((s,i) => (
              <div key={i} className="cw sc" style={{ padding:'40px 32px',animationDelay:(i+3)*0.1+'s' }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:orange,marginBottom:14,opacity:0.5 }}>{s.icon}</div>
                <div className="ctit" style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,marginBottom:10,color:navy }}>{s.titulo}</div>
                <p className="ctxt" style={{ fontSize:13,lineHeight:1.8,color:'#334466' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EXPERIENCIA — AZUL ══ */}
      <section id="experiencia" data-section className="sp" style={{ padding:'100px 40px',background:navy }}>
        <div style={{ maxWidth:860,margin:'0 auto' }}>
          <div className="al sl">Trayectoria</div>
          <h2 className="al" style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(30px,4vw,50px)',fontWeight:400,color:'white',marginBottom:8 }}>
            Lo que he <em style={{ color:orange }}>construido</em>
          </h2>
          <div className="dv" />
          <div style={{ display:'flex',flexDirection:'column',gap:44 }}>
            {EXPERIENCIA.map((e,i) => (
              <div key={i} className={`el${e.hot?' hot':''}`}>
                <div style={{ fontSize:10,letterSpacing:3,textTransform:'uppercase',color:e.hot?orange:'rgba(255,255,255,0.3)',marginBottom:4 }}>{e.periodo}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'white',marginBottom:4,fontStyle:e.hot?'italic':'normal' }}>{e.rol}</div>
                <div style={{ fontSize:10,color:e.hot?orange:'rgba(255,255,255,0.35)',fontWeight:600,letterSpacing:2,marginBottom:10,textTransform:'uppercase' }}>{e.empresa}</div>
                <p style={{ fontSize:14,color:'rgba(255,255,255,0.6)',lineHeight:1.8,maxWidth:600 }}>{e.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:60,padding:'32px 36px',background:'rgba(255,255,255,0.03)',borderLeft:`2px solid rgba(232,134,10,0.35)` }}>
            <div className="sl">Reconocimientos</div>
            {[{a:'2016→',t:'Mallas de talleres con resultados en +50 empresas'},{a:'2014',t:'Premio colaborador del año — Telvicom'},{a:'2012',t:'Premio colaborador del año — Telvicom'},{a:'2009',t:'1er puesto creatividad comercial — Interbank'},{a:'2009',t:'1er puesto fondos mutuos — Interbank'}].map((l,i) => (
              <div key={i} style={{ display:'flex',gap:20,borderBottom:'1px solid rgba(255,255,255,0.04)',paddingBottom:10,marginBottom:10 }}>
                <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,color:orange,fontStyle:'italic',minWidth:44 }}>{l.a}</span>
                <span style={{ fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.5 }}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FORMACIÓN — BLANCO ══ */}
      <section id="formacion" data-section className="white-sec" style={{ padding:'100px 40px' }}>
        <div style={{ maxWidth:1060,margin:'0 auto' }}>

          {/* Radar + Formación */}
          <div className="tw" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,marginBottom:80 }}>
            {/* Radar — sobre fondo blanco, con respiración */}
            <div ref={radarRef} className="al">
              <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:12 }}>Habilidades</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>
                Lo que me <em style={{ color:orange }}>define</em>
              </h2>
              <div style={{ width:0,height:2,background:orange,margin:'14px 0 28px',animation:'lineG .8s ease both' }} />
              {/* Radar directamente sobre blanco */}
              <div style={{ display:'flex',justifyContent:'center',padding:'8px 0' }}>
                <Radar data={HABILIDADES_RADAR} inView={radarInView} />
              </div>
            </div>

            {/* Formación */}
            <div className="ar">
              <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:12 }}>Formación</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>
                Raíces <em style={{ color:orange }}>profundas</em>
              </h2>
              <div style={{ width:0,height:2,background:orange,margin:'14px 0 28px',animation:'lineG .8s ease both' }} />
              <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
                {FORMACION.map((f,i) => (
                  <div key={i} style={{ display:'flex',gap:16,borderLeft:'1px solid rgba(0,7,44,0.1)',paddingLeft:18,position:'relative' }}>
                    <div style={{ position:'absolute',left:-4,top:5,width:7,height:7,borderRadius:'50%',background:orange,animation:`dotIn .3s ${i*.07}s ease both` }} />
                    <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,color:orange,fontStyle:'italic',minWidth:30,paddingTop:2 }}>{f.año}</span>
                    <div>
                      <div style={{ fontSize:13,color:navy,fontWeight:600,lineHeight:1.35 }}>{f.titulo}</div>
                      <div style={{ fontSize:11,color:'#334466',letterSpacing:.8,marginTop:2,fontWeight:500 }}>{f.inst}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:24 }}>
                <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:10 }}>Idiomas</div>
                <div style={{ display:'flex',gap:8 }}>
                  <span style={{ fontSize:11,padding:'5px 14px',border:`1px solid ${navy}`,color:navy,fontWeight:600 }}>Inglés Reading B</span>
                  <span style={{ fontSize:11,padding:'5px 14px',border:'1px solid rgba(0,7,44,0.2)',color:'#334466',fontWeight:500 }}>Speaking A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Herramientas (anillos sobre blanco) + IA */}
          <div className="tw" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:80 }}>
            <div>
              <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:12 }}>Mi arsenal</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>
                Herramientas <em style={{ color:orange }}>digitales</em>
              </h2>
              <div style={{ width:0,height:2,background:orange,margin:'14px 0 28px',animation:'lineG .8s ease both' }} />
              {/* Anillos directamente sobre blanco */}
              <div ref={toolsRef} className="rg" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,justifyItems:'center' }}>
                {HERRAMIENTAS.map((h,i) => <Ring key={h.nombre} pct={h.pct} label={h.nombre} size={78} stroke={6} dark={false} inView={toolsInView} delay={i*.08} />)}
              </div>
            </div>

            <div>
              <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:12 }}>Inteligencia Artificial</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>
                IA al <em style={{ color:orange }}>servicio</em>
              </h2>
              <div style={{ width:0,height:2,background:orange,margin:'14px 0 28px',animation:'lineG .8s ease both' }} />
              {/* Barras sobre blanco */}
              <div ref={iaRef}>
                <IABars data={IA_TOOLS} inView={iaInView} />
              </div>
              <p style={{ fontSize:11,color:'#334466',marginTop:22,lineHeight:1.7,borderTop:'1px solid rgba(0,7,44,0.08)',paddingTop:14,fontWeight:500 }}>
                Claude · Gemini · ChatGPT · Artlist AI — integrados al diseño de talleres, producción de contenido y estrategia de aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CLIENTES — AZUL con carrusel ══ */}
      <section id="clientes" data-section style={{ padding:'80px 0',background:navy,borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 40px',textAlign:'center',marginBottom:52 }}>
          <div className="sl" style={{ textAlign:'center' }}>Clientes</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(26px,3vw,44px)',fontWeight:400,color:'white' }}>
            Confían <em style={{ color:orange }}>en mí</em>
          </h2>
        </div>
        <ClientesCarrusel />
      </section>

      {/* ══ CONTACTO — BLANCO ══ */}
      <section id="contacto" data-section className="white-sec" style={{ padding:'100px 40px' }}>
        <div style={{ maxWidth:560,margin:'0 auto',textAlign:'center' }}>
          <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:orange,marginBottom:14 }} className="a1">Hablemos</div>
          <h2 className="a2" style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(34px,5vw,60px)',fontWeight:400,color:navy,lineHeight:1.05,marginBottom:14 }}>
            ¿Listo para<br/><em style={{ color:orange }}>transformar</em><br/>tu equipo?
          </h2>
          <div className="a3" style={{ width:0,height:2,background:orange,margin:'14px auto 28px',animation:'lineG .8s .3s ease both' }} />
          <p className="a3" style={{ fontSize:15,color:'#334466',lineHeight:1.85,marginBottom:48,fontWeight:500 }}>
            Coaching individual, talleres corporativos, mentoría o simplemente una conversación.
          </p>
          <div className="a4" style={{ display:'flex',flexDirection:'column',gap:10,alignItems:'center',marginBottom:44 }}>
            <a href="mailto:omar@girolab.net"
              style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:navy,fontStyle:'italic',textDecoration:'none',transition:'color .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=orange}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color=navy}>
              omar@girolab.net
            </a>
            <a href="tel:+51922213800"
              style={{ fontSize:13,color:'#334466',letterSpacing:3,textDecoration:'none',transition:'color .2s',fontWeight:600 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=navy}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#334466'}>
              +51 922 213 800
            </a>
          </div>
          <div className="a5" style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap' }}>
            <button onClick={handlePrint} className="bo"><span>↓ Descargar CV</span></button>
            <a href="https://wa.link/95x6de" target="_blank" rel="noopener noreferrer" className="bn">WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className="ff" style={{ padding:'22px 40px',borderTop:`1px solid rgba(0,7,44,0.1)`,background:'white',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
        <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#334466',fontStyle:'italic' }}>Omar Herrera · Coach & Facilitador</span>
        <a href="https://girolab.net" style={{ fontSize:10,color:'#334466',letterSpacing:2,textTransform:'uppercase',textDecoration:'none',transition:'color .2s',fontWeight:600 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=orange}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#334466'}>girolab.net</a>
      </footer>
    </div>
  )
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
// ─── jsPDF GENERATOR ─────────────────────────────────────────────────────────

async function generarPDF(jsPDF: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210, H = 297
  const navy = [0, 7, 44] as [number,number,number]
  const orange = [232, 134, 10] as [number,number,number]
  const white = [255, 255, 255] as [number,number,number]
  const dark = [26, 42, 74] as [number,number,number]
  const light = [240, 244, 252] as [number,number,number]

  const setColor = (rgb: [number,number,number]) => doc.setTextColor(rgb[0], rgb[1], rgb[2])
  const setFill  = (rgb: [number,number,number]) => doc.setFillColor(rgb[0], rgb[1], rgb[2])
  const setDraw  = (rgb: [number,number,number]) => doc.setDrawColor(rgb[0], rgb[1], rgb[2])

  // ── Cargar foto ──────────────────────────────────────────────────────────
  let fotoData: string | null = null
  try {
    const res = await fetch('/omar-herrera.jpg')
    const blob = await res.blob()
    fotoData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch { /* foto opcional */ }

  // ─────────────────────────────────────────────────────────────────────────
  // PÁGINA 1
  // ─────────────────────────────────────────────────────────────────────────

  // Header azul
  setFill(navy); doc.rect(0, 0, W, 58, 'F')

  // Foto lado derecho
  if (fotoData) {
    doc.addImage(fotoData, 'JPEG', W - 48, 0, 48, 58)
    // overlay sutil
    setFill([0,7,44]); doc.setGState(new (doc as any).GState({ opacity: 0.35 }))
    doc.rect(W - 48, 0, 48, 58, 'F')
    doc.setGState(new (doc as any).GState({ opacity: 1 }))
  }

  // Nombre
  doc.setFont('helvetica', 'bold')
  setColor(white); doc.setFontSize(28); doc.text('Omar', 14, 18)
  setColor(orange); doc.setFontSize(28); doc.text('Herrera', 14, 28)

  // Tagline
  doc.setFont('helvetica', 'italic')
  setColor([232, 134, 10]); doc.setFontSize(8)
  doc.text('"Convicción y no Condición."', 14, 36)

  // Info personal
  doc.setFont('helvetica', 'normal')
  setColor([180, 180, 200]); doc.setFontSize(7.5)
  doc.text('Coach · Facilitador · Mentor  ·  42 años  ·  18/09/1983', 14, 42)
  doc.text('omar@girolab.net  ·  +51 922 213 800  ·  girolab.net', 14, 48)

  // Línea naranja
  setFill(orange); doc.rect(0, 58, W, 1.5, 'F')

  // Stats
  setFill(navy); doc.rect(0, 59.5, W, 16, 'F')
  const stats = [['9+','Años exp.'],['50+','Empresas'],['1,000+','Personas'],['9','Certific.']]
  stats.forEach(([v, l], i) => {
    const x = 14 + i * 46
    doc.setFont('helvetica', 'bold')
    setColor(orange); doc.setFontSize(12); doc.text(v, x, 68)
    doc.setFont('helvetica', 'normal')
    setColor([140,150,180]); doc.setFontSize(6); doc.text(l.toUpperCase(), x, 72.5)
  })

  // Línea divisora gris muy claro
  setFill([220,224,236]); doc.rect(0, 75.5, W, 0.3, 'F')

  // ── Cuerpo p1: 2 columnas ────────────────────────────────────────────────
  const colL = 14, colR = 148, colW1 = 128, colW2 = 50
  let yL = 82, yR = 82

  // === COLUMNA IZQUIERDA: Experiencia ===
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('EXPERIENCIA', colL, yL)
  yL += 5

  const experiencia = [
    { periodo: '2014 — Presente', rol: 'Coach & Facilitador', empresa: 'Giro Lab / Independiente', desc: 'Talleres de habilidades blandas. Outdoor experiencial. Coaching individual y organizacional para +50 empresas.', hot: true },
    { periodo: '2018 — 2019', rol: 'Capacitador Corporativo', empresa: 'Farmacias Peruanas', desc: 'Malla de capacitación y talleres experienciales para activar habilidades blandas.', hot: false },
    { periodo: '2014', rol: 'Supervisor & Capacitador', empresa: 'Lima Celular SAC', desc: 'Técnicas de cierre, manejo de objeciones y fases de venta para equipos comerciales.', hot: false },
    { periodo: '2011 — 2013', rol: 'Supervisor de Ventas', empresa: 'Telvicom S.A.', desc: 'Gestión de equipo de ventas. Premio colaborador del año 2012 y 2014.', hot: false },
    { periodo: '2010 — 2011', rol: 'Asesor de Servicio', empresa: 'Nissan Maquinarias S.A.', desc: 'Atención al cliente y venta de productos del concesionario.', hot: false },
    { periodo: '2007 — 2010', rol: 'Representante Financiero', empresa: 'Interbank', desc: '1er puesto fondos mutuos (Oct–Dic 2009) y creatividad comercial 2009.', hot: false },
  ]

  experiencia.forEach(e => {
    // Barra izquierda
    setFill(e.hot ? orange : [200, 205, 220])
    doc.rect(colL, yL, 1.5, 16, 'F')

    doc.setFont('helvetica', 'bold')
    setColor(e.hot ? orange : dark); doc.setFontSize(6.5)
    doc.text(e.periodo.toUpperCase(), colL + 4, yL + 3.5)

    doc.setFont('helvetica', 'bold')
    setColor(navy); doc.setFontSize(9)
    doc.text(e.rol, colL + 4, yL + 7.5)

    doc.setFont('helvetica', 'bold')
    setColor(e.hot ? orange : [100,110,140]); doc.setFontSize(6.5)
    doc.text(e.empresa.toUpperCase(), colL + 4, yL + 11)

    doc.setFont('helvetica', 'normal')
    setColor(dark); doc.setFontSize(7)
    const lines = doc.splitTextToSize(e.desc, colW1 - 6)
    doc.text(lines[0], colL + 4, yL + 14.5)

    yL += 19
  })

  // Reconocimientos
  setFill(light); doc.rect(colL, yL, colW1, 28, 'F')
  setFill(orange); doc.rect(colL, yL, 1.5, 28, 'F')
  yL += 4

  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(6.5); doc.text('RECONOCIMIENTOS', colL + 4, yL)
  yL += 4

  const recs = [
    ['2016→','Mallas de talleres con resultados en +50 empresas'],
    ['2014','Premio colaborador del año — Telvicom'],
    ['2012','Premio colaborador del año — Telvicom'],
    ['2009','1er puesto creatividad comercial — Interbank'],
    ['2009','1er puesto fondos mutuos — Interbank'],
  ]
  recs.forEach(([a, t]) => {
    doc.setFont('helvetica', 'bold')
    setColor(orange); doc.setFontSize(7); doc.text(a, colL + 4, yL)
    doc.setFont('helvetica', 'normal')
    setColor(dark); doc.setFontSize(7); doc.text(t, colL + 22, yL)
    yL += 4.2
  })

  // === COLUMNA DERECHA ===
  // Habilidades
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('HABILIDADES', colR, yR)
  yR += 5

  const habs = ['Comunicación','Liderazgo','Empatía','Tenacidad','Creatividad','Análisis','Trabajo en equipo','Proactividad']
  habs.forEach((h, i) => {
    const xh = colR + (i % 2) * 26
    const yh = yR + Math.floor(i / 2) * 5
    setFill([230, 234, 245]); doc.rect(xh, yh - 3, 24, 4, 'F')
    setColor(dark); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal')
    doc.text(h, xh + 1.5, yh)
  })
  yR += 24

  // Herramientas
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('HERRAMIENTAS', colR, yR)
  yR += 5

  const herr = [
    { nombre: 'Office', pct: 98 },{ nombre: 'Prezi', pct: 99 },
    { nombre: 'Elementor', pct: 99 },{ nombre: 'Camtasia', pct: 99 },
    { nombre: 'Illustrator', pct: 80 },{ nombre: 'WordPress', pct: 90 },
    { nombre: 'Audition', pct: 70 },{ nombre: 'Photoshop', pct: 60 },
  ]
  herr.forEach(h => {
    doc.setFont('helvetica', 'normal')
    setColor(dark); doc.setFontSize(7); doc.text(h.nombre, colR, yR)
    setColor(orange); doc.text(h.pct + '%', colR + 44, yR, { align: 'right' })
    // barra track
    setFill([220, 224, 236]); doc.rect(colR, yR + 0.8, 44, 1.5, 'F')
    // barra fill — naranja si >= 90, azul si < 90
    const barColor: [number,number,number] = h.pct >= 90 ? orange : navy
    setFill(barColor); doc.rect(colR, yR + 0.8, 44 * h.pct / 100, 1.5, 'F')
    yR += 5
  })

  // IA
  yR += 2
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('INTELIGENCIA ARTIFICIAL', colR, yR)
  yR += 5

  const ia = [
    { nombre: 'Claude', pct: 95 },{ nombre: 'ChatGPT', pct: 92 },
    { nombre: 'Gemini', pct: 88 },{ nombre: 'Artlist AI', pct: 85 },
  ]
  ia.forEach(h => {
    doc.setFont('helvetica', 'italic')
    setColor(navy); doc.setFontSize(7); doc.text(h.nombre, colR, yR)
    setColor(orange); doc.text(h.pct + '%', colR + 44, yR, { align: 'right' })
    setFill([220, 224, 236]); doc.rect(colR, yR + 0.8, 44, 1.5, 'F')
    // degradado manual: azul a naranja proporcional
    const splitX = 44 * h.pct / 100
    setFill(navy); doc.rect(colR, yR + 0.8, splitX * 0.5, 1.5, 'F')
    setFill(orange); doc.rect(colR + splitX * 0.5, yR + 0.8, splitX * 0.5, 1.5, 'F')
    yR += 5
  })

  // Idiomas
  yR += 2
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('IDIOMAS', colR, yR)
  yR += 4
  setFill(light); doc.rect(colR, yR - 3, 22, 5, 'F')
  setDraw(navy); doc.setLineWidth(0.3); doc.rect(colR, yR - 3, 22, 5)
  setColor(navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.text('Inglés Reading B', colR + 1.5, yR)
  yR += 5
  setFill(light); doc.rect(colR, yR - 3, 20, 5, 'F')
  setDraw([180,185,200]); doc.rect(colR, yR - 3, 20, 5)
  setColor(dark); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.text('Speaking A', colR + 1.5, yR)

  // Footer p1
  setFill([245, 246, 250]); doc.rect(0, H - 8, W, 8, 'F')
  setFill([220, 224, 236]); doc.rect(0, H - 8, W, 0.3, 'F')
  setColor(dark); doc.setFont('helvetica', 'italic'); doc.setFontSize(7)
  doc.text('Omar Herrera  ·  Coach & Facilitador', 14, H - 3.5)
  doc.text('1 / 2', W - 14, H - 3.5, { align: 'right' })

  // ─────────────────────────────────────────────────────────────────────────
  // PÁGINA 2
  // ─────────────────────────────────────────────────────────────────────────
  doc.addPage()

  // Acento top
  setFill(orange); doc.rect(0, 0, W, 2, 'F')
  setFill(navy); doc.rect(0, 2, W, 12, 'F')

  doc.setFont('helvetica', 'bold')
  setColor(white); doc.setFontSize(10); doc.text('Omar ', 14, 10)
  setColor(orange); doc.text('Herrera', 14 + doc.getTextWidth('Omar '), 10)
  setColor([160,165,190]); doc.setFontSize(7)
  doc.text('omar@girolab.net  ·  +51 922 213 800  ·  girolab.net', W - 14, 10, { align: 'right' })

  setFill([220, 224, 236]); doc.rect(0, 14, W, 0.3, 'F')

  const p2L = 14, p2R = 112, p2W = 90
  let y2L = 22, y2R = 22

  // === COL IZQ P2: Servicios ===
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('SERVICIOS PARA ORGANIZACIONES', p2L, y2L)
  y2L += 5

  const serviciosOrg = [
    { titulo: 'Talleres Vivenciales', desc: 'Liderazgo, comunicación, IE. Metodología activa, resultados medibles.' },
    { titulo: 'Teambuilding & Outdoor', desc: 'Cohesión real. Dinámicas que rompen estructuras rígidas y construyen equipos.' },
    { titulo: 'Mentoría & Asesoría', desc: 'Acompañamiento estratégico con claridad, dirección y resultados.' },
  ]
  serviciosOrg.forEach(s => {
    setFill([240, 244, 252]); doc.rect(p2L, y2L - 2, p2W, 12, 'F')
    setFill(navy); doc.rect(p2L, y2L - 2, 1.5, 12, 'F')
    doc.setFont('helvetica', 'bold')
    setColor(navy); doc.setFontSize(8.5); doc.text(s.titulo, p2L + 4, y2L + 2)
    doc.setFont('helvetica', 'normal')
    setColor(dark); doc.setFontSize(7)
    const lines = doc.splitTextToSize(s.desc, p2W - 6)
    doc.text(lines, p2L + 4, y2L + 6.5)
    y2L += 14
  })

  y2L += 4
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('SERVICIOS PARA PERSONAS', p2L, y2L)
  y2L += 5

  const serviciosPer = [
    { titulo: 'Coaching Ontológico', desc: 'Transformación desde el lenguaje, las emociones y el cuerpo.' },
    { titulo: 'Coaching Sistémico', desc: 'Trabajo con los sistemas relacionales que te limitan.' },
    { titulo: 'Coaching Organizacional', desc: 'Líderes y equipos: alineación, propósito y cultura.' },
  ]
  serviciosPer.forEach(s => {
    setFill([255, 248, 240]); doc.rect(p2L, y2L - 2, p2W, 12, 'F')
    setFill(orange); doc.rect(p2L, y2L - 2, 1.5, 12, 'F')
    doc.setFont('helvetica', 'bold')
    setColor(navy); doc.setFontSize(8.5); doc.text(s.titulo, p2L + 4, y2L + 2)
    doc.setFont('helvetica', 'normal')
    setColor(dark); doc.setFontSize(7)
    const lines = doc.splitTextToSize(s.desc, p2W - 6)
    doc.text(lines, p2L + 4, y2L + 6.5)
    y2L += 14
  })

  // Contacto al final col izq
  y2L = Math.max(y2L, 210)
  setFill(navy); doc.rect(p2L, y2L, p2W, 28, 'F')
  setFill(orange); doc.rect(p2L, y2L, p2W, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(8); doc.text('HABLEMOS', p2L + 4, y2L + 8)
  doc.setFont('helvetica', 'italic')
  setColor(white); doc.setFontSize(9); doc.text('omar@girolab.net', p2L + 4, y2L + 15)
  doc.setFont('helvetica', 'normal')
  setColor([160,170,200]); doc.setFontSize(7.5)
  doc.text('+51 922 213 800  ·  girolab.net', p2L + 4, y2L + 21)

  // === COL DER P2: Formación ===
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('FORMACIÓN', p2R, y2R)
  y2R += 5

  const formacion = [
    { año: '2021', titulo: 'Coaching Ontológico', inst: 'Axon Training' },
    { año: '2021', titulo: 'Coaching Sistémico', inst: 'Marcelo Brosky' },
    { año: '2019', titulo: 'Design Thinking + Storytelling', inst: 'Crehana' },
    { año: '2019', titulo: 'Diseño Web / Front End / WordPress', inst: 'Crehana' },
    { año: '2018', titulo: 'Marketing Digital', inst: 'Next U' },
    { año: '2017', titulo: 'Coaching Org. · Maestría Liderazgo · Outdoor Trainer', inst: 'Coaching Global' },
    { año: '2016', titulo: 'Diplomado Coaching — Equipos Alto Rendimiento', inst: 'ISIL' },
    { año: '2013', titulo: 'Diplomado Dirección y Gestión Comercial', inst: 'ISIL' },
    { año: '2005', titulo: 'Ciencias de la Comunicación', inst: 'IST Cepea' },
  ]
  formacion.forEach((f, i) => {
    // dot
    setFill(i % 2 === 0 ? orange : navy)
    doc.circle(p2R + 1.5, y2R - 1, 1.2, 'F')
    setFill([220, 224, 236]); doc.rect(p2R + 1.2, y2R, 0.6, 6, 'F') // línea

    doc.setFont('helvetica', 'bold')
    setColor(i % 2 === 0 ? orange : navy); doc.setFontSize(7); doc.text(f.año, p2R + 5, y2R)
    doc.setFont('helvetica', 'bold')
    setColor(navy); doc.setFontSize(8)
    const tlines = doc.splitTextToSize(f.titulo, p2W - 18)
    doc.text(tlines[0], p2R + 18, y2R)
    doc.setFont('helvetica', 'normal')
    setColor(dark); doc.setFontSize(6.5); doc.text(f.inst, p2R + 18, y2R + 4)
    y2R += 9
  })

  // Clientes — grid de logos
  y2R += 6
  doc.setFont('helvetica', 'bold')
  setColor(orange); doc.setFontSize(7); doc.text('CONFÍAN EN MÍ', p2R, y2R)
  y2R += 5

  // Intentar cargar logos — si falla, solo poner celdas grises
  const logoW = 18, logoH = 10, logoGap = 2
  const logosPerRow = 5
  for (let i = 0; i < 15; i++) {
    const col = i % logosPerRow
    const row = Math.floor(i / logosPerRow)
    const lx = p2R + col * (logoW + logoGap)
    const ly = y2R + row * (logoH + logoGap)
    setFill([240, 244, 252]); doc.rect(lx, ly, logoW, logoH, 'F')
    setDraw([210, 215, 230]); doc.setLineWidth(0.2); doc.rect(lx, ly, logoW, logoH)
    try {
      const res = await fetch(`/clientes/logo-${i + 1}.png`)
      const blob = await res.blob()
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      doc.addImage(b64, lx + 1, ly + 1, logoW - 2, logoH - 2, undefined, 'NONE')
    } catch { /* celda vacía */ }
  }

  // Footer p2
  setFill([245, 246, 250]); doc.rect(0, H - 8, W, 8, 'F')
  setFill([220, 224, 236]); doc.rect(0, H - 8, W, 0.3, 'F')
  setColor(dark); doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
  doc.text('omar@girolab.net  ·  +51 922 213 800  ·  girolab.net', 14, H - 3.5)
  doc.text('2 / 2', W - 14, H - 3.5, { align: 'right' })

  doc.save('CV-Omar-Herrera.pdf')
}