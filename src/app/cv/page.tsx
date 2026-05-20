'use client'
import { useState, useEffect, useRef } from 'react'

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
  { icon: '◈', titulo: 'Talleres Vivenciales', desc: 'Liderazgo, comunicación, IE. Metodología activa, resultados medibles.', cat: 'org' },
  { icon: '◉', titulo: 'Teambuilding & Outdoor', desc: 'Cohesión real. Dinámicas que rompen estructuras rígidas.', cat: 'org' },
  { icon: '◎', titulo: 'Mentoría & Asesoría', desc: 'Acompañamiento estratégico con claridad y resultados concretos.', cat: 'org' },
  { icon: '◇', titulo: 'Coaching Ontológico', desc: 'Transformación desde el lenguaje, las emociones y el cuerpo.', cat: 'per' },
  { icon: '◆', titulo: 'Coaching Sistémico', desc: 'Trabajo con los sistemas relacionales que te limitan.', cat: 'per' },
  { icon: '◐', titulo: 'Coaching Organizacional', desc: 'Líderes y equipos: alineación, propósito y cultura.', cat: 'per' },
]

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

function Ring({ pct, label, size = 90, stroke = 7, color = 'rgba(255,255,255,0.8)', inView = false, delay = 0 }: { pct: number; label: string; size?: number; stroke?: number; color?: string; inView?: boolean; delay?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = inView ? circ - (pct / 100) * circ : circ
  const cx = size / 2
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) ${delay}s` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: size * 0.17, color: 'white', fontStyle: 'italic' }}>{pct}<span style={{ fontSize: size * 0.1 }}>%</span></span>
        </div>
      </div>
      <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.5, maxWidth: size }}>{label}</span>
    </div>
  )
}

function Radar({ data, inView }: { data: { label: string; value: number }[]; inView: boolean }) {
  const cx = 170, cy = 170, r = 120, n = data.length
  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2
  const pts = data.map((d, i) => { const rv = inView ? (d.value / 100) * r : 0; return { x: cx + rv * Math.cos(angle(i)), y: cy + rv * Math.sin(angle(i)) } })
  const lpts = data.map((_, i) => ({ x: cx + (r + 30) * Math.cos(angle(i)), y: cy + (r + 30) * Math.sin(angle(i)) }))
  const grids = [0.25, 0.5, 0.75, 1].map(f => data.map((_, i) => `${cx + f * r * Math.cos(angle(i))},${cy + f * r * Math.sin(angle(i))}`).join(' '))
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ')
  return (
    <svg viewBox="0 0 340 340" style={{ width: '100%', maxWidth: 320 }}>
      {grids.map((g, i) => <polygon key={i} points={g} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
      {data.map((_, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle(i))} y2={cy + r * Math.sin(angle(i))} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
      <polygon points={poly} fill="rgba(232,134,10,0.15)" stroke="#E8860A" strokeWidth="1.5" style={{ transition: 'all 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#E8860A" style={{ transition: `all 1.5s cubic-bezier(0.4,0,0.2,1) ${i * 0.06}s` }} />)}
      {lpts.map((p, i) => {
        const a = angle(i), anchor = Math.cos(a) < -0.1 ? 'end' : Math.cos(a) > 0.1 ? 'start' : 'middle'
        return <text key={i} x={p.x} y={p.y + 4} textAnchor={anchor} style={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'Instrument Sans, sans-serif' }}>{data[i].label}</text>
      })}
    </svg>
  )
}

function IABars({ data, inView }: { data: { nombre: string; pct: number; desc: string }[]; inView: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {data.map((d, i) => (
        <div key={d.nombre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: 'white', fontStyle: 'italic', marginRight: 10 }}>{d.nombre}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>{d.desc}</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: '#E8860A', fontStyle: 'italic' }}>{d.pct}%</span>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', borderRadius: 1, background: 'linear-gradient(90deg,#E8860A,rgba(232,134,10,0.35))', width: inView ? d.pct + '%' : '0%', transition: `width 1.3s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s` }} />
          </div>
          <div style={{ position: 'relative', height: 12 }}>
            <div style={{ position: 'absolute', top: -4, width: 9, height: 9, borderRadius: '50%', background: '#E8860A', border: '2px solid #00072C', left: inView ? `calc(${d.pct}% - 4px)` : '0%', transition: `left 1.3s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CVPage() {
  const [activeSection, setActiveSection] = useState('hero')
  const [menuOpen, setMenuOpen] = useState(false)
  const [printing, setPrinting] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const iaRef    = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef)
  const radarInView = useInView(radarRef)
  const toolsInView = useInView(toolsRef)
  const iaInView    = useInView(iaRef)
  const c1 = useCounter(9, statsInView), c2 = useCounter(50, statsInView)
  const c3 = useCounter(1000, statsInView), c4 = useCounter(9, statsInView)

  useEffect(() => {
    document.title = 'Omar Herrera — Coach & Facilitador'
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }), { threshold: 0.2 })
    document.querySelectorAll('[data-section]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  const handlePrint = () => { setPrinting(true); setTimeout(() => { window.print(); setPrinting(false) }, 300) }
  if (printing) return <PrintCV />

  const NAV = [['experiencia','Experiencia'],['servicios','Servicios'],['formacion','Formación'],['clientes','Clientes'],['contacto','Contacto']]
  const o = '#E8860A', navy = '#00072C'

  return (
    <div style={{ fontFamily:"'Instrument Sans',sans-serif", color:'white', background:navy }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:#E8860A;color:white}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#00072C}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(38px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeL{from{opacity:0;transform:translateX(-34px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeR{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes lineG{from{width:0}to{width:52px}}
        @keyframes dotIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
        .a1{animation:fadeUp .8s ease both}.a2{animation:fadeUp .8s .12s ease both}.a3{animation:fadeUp .8s .24s ease both}
        .a4{animation:fadeUp .8s .36s ease both}.a5{animation:fadeUp .8s .5s ease both}
        .al{animation:fadeL .8s ease both}.ar{animation:fadeR .8s ease both}.sc{animation:scIn .65s ease both}
        .nl{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);transition:color .2s;cursor:pointer;font-weight:600}
        .nl:hover,.nl.on{color:#E8860A}
        .bw{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid white;background:transparent;color:white;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bw:hover{background:white;color:#00072C}
        .bg{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid rgba(255,255,255,0.18);background:transparent;color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bg:hover{border-color:white;color:white}
        .bo{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border:1.5px solid #E8860A;background:#E8860A;color:white;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;text-decoration:none;transition:all .3s}
        .bo:hover{background:transparent;color:#E8860A}
        .cw{background:white;border:1px solid rgba(0,7,44,0.08);transition:all .3s;color:#00072C}
        .cw:hover{border-color:rgba(0,7,44,0.18);transform:translateY(-5px);box-shadow:0 18px 48px rgba(0,7,44,0.09)}
        .el{border-left:1px solid rgba(255,255,255,0.09);padding-left:28px;position:relative}
        .el::before{content:'';position:absolute;left:-4px;top:10px;width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.12)}
        .el.hot::before{background:#E8860A;box-shadow:0 0 0 4px rgba(232,134,10,0.1);width:9px;height:9px;left:-5px}
        .sl{font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:#E8860A;margin-bottom:12px}
        .dv{width:0;height:2px;background:#E8860A;margin:14px 0 36px;animation:lineG .8s ease both}
        @media(max-width:768px){
          .hg{grid-template-columns:1fr!important;gap:52px!important}
          .hh{font-size:clamp(44px,11vw,70px)!important}
          .sg{grid-template-columns:repeat(2,1fr)!important}
          .tw{grid-template-columns:1fr!important;gap:48px!important}
          .th{grid-template-columns:1fr!important}
          .nll{display:none!important}.mb{display:flex!important}
          .sp{padding:80px 20px!important}.hp{padding:120px 20px 72px!important}
          .ff{flex-direction:column!important;text-align:center!important;gap:8px!important}
          .rg{grid-template-columns:repeat(4,1fr)!important}
        }
        @media(min-width:769px){.mb{display:none!important}.mm{display:none!important}}
        @media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{margin:0;size:A4}body{background:white!important}.np{display:none!important}.pp{width:210mm;height:297mm;overflow:hidden;page-break-after:always;page-break-inside:avoid}.pp:last-child{page-break-after:avoid}}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(0,7,44,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'white' }}>O<em style={{ color:o }}>H</em></div>
        <div className="nll" style={{ display:'flex',gap:28 }}>
          {NAV.map(([id,label]) => <span key={id} className={`nl${activeSection===id?' on':''}`} onClick={() => scrollTo(id)}>{label}</span>)}
        </div>
        <button onClick={handlePrint} className="bw" style={{ padding:'9px 20px',fontSize:10 }}><span>↓ CV</span></button>
        <button className="mb" onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none',border:'none',color:'white',cursor:'pointer',fontSize:22,display:'none',alignItems:'center' }}>{menuOpen?'✕':'☰'}</button>
      </nav>
      {menuOpen && <div className="mm" style={{ position:'fixed',top:64,left:0,right:0,zIndex:99,background:'#060f3a',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'24px',display:'flex',flexDirection:'column',gap:20 }}>{NAV.map(([id,label]) => <span key={id} className="nl" style={{ fontSize:14 }} onClick={() => scrollTo(id)}>{label}</span>)}</div>}

      {/* ══ HERO — azul ══ */}
      <section id="hero" data-section className="hp" style={{ padding:'140px 40px 0',maxWidth:1200,margin:'0 auto' }}>
        <div className="hg" style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:80,alignItems:'center',paddingBottom:80 }}>
          <div>
            <div className="a1 sl">Coach · Facilitador · Mentor</div>
            <h1 className="a2 hh" style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(56px,6vw,92px)',fontWeight:400,lineHeight:1.0,color:'white',marginBottom:14 }}>
              Omar<br/><em style={{ color:o }}>Herrera</em>
            </h1>
            <div className="dv a3" />
            <blockquote className="a3" style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,fontStyle:'italic',color:'rgba(255,255,255,0.55)',borderLeft:`2px solid rgba(232,134,10,0.35)`,paddingLeft:20,lineHeight:1.5,marginBottom:28 }}>"Convicción y no Condición."</blockquote>
            <p className="a4" style={{ fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.85,maxWidth:480,marginBottom:44 }}>Acompaño a personas y organizaciones a descubrir lo que realmente son capaces de hacer — con metodología, presencia y resultados que perduran.</p>
            <div className="a5" style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
              <button onClick={handlePrint} className="bw"><span>↓ Descargar CV</span></button>
              <a href="https://wa.link/95x6de" target="_blank" rel="noopener noreferrer" className="bg">Conversemos</a>
            </div>
          </div>
          <div className="ar" style={{ position:'relative' }}>
            <div style={{ width:'100%',aspectRatio:'3/4',background:'rgba(255,255,255,0.04)',overflow:'hidden',position:'relative',border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:o,zIndex:2 }} />
              <img src="/omar-herrera.jpg" alt="Omar Herrera" style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',display:'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,7,44,0.55) 0%,transparent 50%)' }} />
            </div>
            <div style={{ position:'absolute',bottom:-16,right:-16,background:o,padding:'13px 17px',animation:'float 4s ease-in-out infinite',zIndex:3 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:'white',lineHeight:1,fontStyle:'italic' }}>50+</div>
              <div style={{ fontSize:9,letterSpacing:2,color:'rgba(255,255,255,0.85)',marginTop:2,textTransform:'uppercase' }}>empresas</div>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div ref={statsRef} className="sg" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          {[{v:c1,s:'+',l:'Años'},{v:c2,s:'+',l:'Empresas'},{v:c3,s:'+',l:'Personas'},{v:c4,s:'',l:'Certificaciones'}].map((s,i) => (
            <div key={s.l} style={{ padding:'28px 20px',textAlign:'center',borderRight:i<3?'1px solid rgba(255,255,255,0.07)':'none' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:40,color:'white',fontStyle:'italic',lineHeight:1 }}>{s.v}{s.s}</div>
              <div style={{ fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginTop:8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVICIOS — blanco con fundido ══ */}
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute',top:0,left:0,right:0,height:130,background:`linear-gradient(to bottom,${navy},transparent)`,zIndex:1,pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:130,background:`linear-gradient(to top,${navy},transparent)`,zIndex:1,pointerEvents:'none' }} />
        <section id="servicios" data-section style={{ padding:'140px 40px',background:'white',position:'relative' }}>
          <div style={{ maxWidth:1100,margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:14 }}>
              <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:12 }}>Qué hago</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(28px,3.5vw,48px)',fontWeight:400,color:navy }}>Mis <em style={{ color:o }}>servicios</em></h2>
            </div>
            <p style={{ textAlign:'center',fontSize:12,color:'#8899cc',letterSpacing:3,textTransform:'uppercase',marginBottom:48 }}>Para organizaciones</p>
            <div className="th" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,background:'rgba(0,7,44,0.06)',marginBottom:52 }}>
              {SERVICIOS.filter(s=>s.cat==='org').map((s,i) => (
                <div key={i} className="cw sc" style={{ padding:'40px 32px',animationDelay:i*0.1+'s' }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:'rgba(0,7,44,0.18)',marginBottom:14 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:navy,marginBottom:10 }}>{s.titulo}</div>
                  <p style={{ fontSize:13,color:'#8899cc',lineHeight:1.8 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <p style={{ textAlign:'center',fontSize:12,color:'#8899cc',letterSpacing:3,textTransform:'uppercase',marginBottom:48 }}>Para personas</p>
            <div className="th" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,background:'rgba(0,7,44,0.06)' }}>
              {SERVICIOS.filter(s=>s.cat==='per').map((s,i) => (
                <div key={i} className="cw sc" style={{ padding:'40px 32px',animationDelay:(i+3)*0.1+'s' }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:o,marginBottom:14,opacity:0.45 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:navy,marginBottom:10 }}>{s.titulo}</div>
                  <p style={{ fontSize:13,color:'#8899cc',lineHeight:1.8 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ EXPERIENCIA — azul ══ */}
      <section id="experiencia" data-section className="sp" style={{ padding:'100px 40px',background:navy }}>
        <div style={{ maxWidth:860,margin:'0 auto' }}>
          <div className="al sl">Trayectoria</div>
          <h2 className="al" style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(30px,4vw,50px)',fontWeight:400,color:'white',marginBottom:8 }}>Lo que he <em style={{ color:o }}>construido</em></h2>
          <div className="dv" />
          <div style={{ display:'flex',flexDirection:'column',gap:44 }}>
            {EXPERIENCIA.map((e,i) => (
              <div key={i} className={`el${e.hot?' hot':''}`}>
                <div style={{ fontSize:10,letterSpacing:3,textTransform:'uppercase',color:e.hot?o:'rgba(255,255,255,0.22)',marginBottom:4 }}>{e.periodo}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:'white',marginBottom:4,fontStyle:e.hot?'italic':'normal' }}>{e.rol}</div>
                <div style={{ fontSize:10,color:e.hot?o:'rgba(255,255,255,0.28)',fontWeight:600,letterSpacing:2,marginBottom:10,textTransform:'uppercase' }}>{e.empresa}</div>
                <p style={{ fontSize:14,color:'rgba(255,255,255,0.45)',lineHeight:1.8,maxWidth:600 }}>{e.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:60,padding:'32px 36px',background:'rgba(255,255,255,0.03)',borderLeft:`2px solid rgba(232,134,10,0.35)` }}>
            <div className="sl">Reconocimientos</div>
            {[{a:'2016→',t:'Mallas de talleres con resultados en +50 empresas'},{a:'2014',t:'Premio colaborador del año — Telvicom'},{a:'2012',t:'Premio colaborador del año — Telvicom'},{a:'2009',t:'1er puesto creatividad comercial — Interbank'},{a:'2009',t:'1er puesto fondos mutuos — Interbank'}].map((l,i) => (
              <div key={i} style={{ display:'flex',gap:20,borderBottom:'1px solid rgba(255,255,255,0.04)',paddingBottom:10,marginBottom:10 }}>
                <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,color:o,fontStyle:'italic',minWidth:44 }}>{l.a}</span>
                <span style={{ fontSize:13,color:'rgba(255,255,255,0.42)',lineHeight:1.5 }}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FORMACIÓN — blanco con fundido ══ */}
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute',top:0,left:0,right:0,height:130,background:`linear-gradient(to bottom,${navy},transparent)`,zIndex:1,pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:130,background:`linear-gradient(to top,${navy},transparent)`,zIndex:1,pointerEvents:'none' }} />
        <section id="formacion" data-section style={{ padding:'140px 40px',background:'white',position:'relative' }}>
          <div style={{ maxWidth:1060,margin:'0 auto' }}>
            {/* Radar + Formación */}
            <div className="tw" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,marginBottom:80 }}>
              <div ref={radarRef} className="al">
                <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:12 }}>Habilidades</div>
                <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>Lo que me <em style={{ color:o }}>define</em></h2>
                <div style={{ width:0,height:2,background:o,margin:'14px 0 28px',animation:'lineG .8s ease both' }} />
                <div style={{ background:navy,padding:'28px',display:'flex',justifyContent:'center' }}>
                  <Radar data={HABILIDADES_RADAR} inView={radarInView} />
                </div>
              </div>
              <div className="ar">
                <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:12 }}>Formación</div>
                <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>Raíces <em style={{ color:o }}>profundas</em></h2>
                <div style={{ width:0,height:2,background:o,margin:'14px 0 28px',animation:'lineG .8s ease both' }} />
                <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
                  {FORMACION.map((f,i) => (
                    <div key={i} style={{ display:'flex',gap:16,borderLeft:'1px solid rgba(0,7,44,0.1)',paddingLeft:18,position:'relative' }}>
                      <div style={{ position:'absolute',left:-4,top:5,width:7,height:7,borderRadius:'50%',background:o,animation:`dotIn .3s ${i*.07}s ease both` }} />
                      <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,color:o,fontStyle:'italic',minWidth:30,paddingTop:2 }}>{f.año}</span>
                      <div>
                        <div style={{ fontSize:13,color:navy,fontWeight:600,lineHeight:1.35 }}>{f.titulo}</div>
                        <div style={{ fontSize:11,color:'#8899cc',letterSpacing:.8,marginTop:2 }}>{f.inst}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:22 }}>
                  <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:10 }}>Idiomas</div>
                  <div style={{ display:'flex',gap:8 }}>
                    <span style={{ fontSize:11,padding:'5px 14px',border:'1px solid rgba(0,7,44,0.15)',color:navy }}>Inglés Reading B</span>
                    <span style={{ fontSize:11,padding:'5px 14px',border:'1px solid rgba(0,7,44,0.08)',color:'#8899cc' }}>Speaking A</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anillos + IA */}
            <div className="tw" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:80 }}>
              <div>
                <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:12 }}>Mi arsenal</div>
                <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>Herramientas <em style={{ color:o }}>digitales</em></h2>
                <div style={{ width:0,height:2,background:o,margin:'14px 0 24px',animation:'lineG .8s ease both' }} />
                <div ref={toolsRef} style={{ background:navy,padding:'28px 20px' }}>
                  <div className="rg" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,justifyItems:'center' }}>
                    {HERRAMIENTAS.map((h,i) => <Ring key={h.nombre} pct={h.pct} label={h.nombre} size={78} stroke={6} inView={toolsInView} delay={i*.08} />)}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:12 }}>Inteligencia Artificial</div>
                <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(24px,2.8vw,38px)',fontWeight:400,color:navy,marginBottom:8 }}>IA al <em style={{ color:o }}>servicio</em></h2>
                <div style={{ width:0,height:2,background:o,margin:'14px 0 24px',animation:'lineG .8s ease both' }} />
                <div ref={iaRef} style={{ background:navy,padding:'28px' }}>
                  <IABars data={IA_TOOLS} inView={iaInView} />
                  <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:22,lineHeight:1.7,borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:14 }}>
                    Claude · Gemini · ChatGPT · Artlist AI — integrados al diseño de talleres, producción de contenido y estrategia de aprendizaje.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ CLIENTES — azul ══ */}
      <section id="clientes" data-section className="sp" style={{ padding:'100px 40px',background:navy }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:52 }}>
            <div className="sl" style={{ textAlign:'center' }}>Clientes</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(26px,3vw,44px)',fontWeight:400,color:'white' }}>Confían <em style={{ color:o }}>en mí</em></h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(106px,1fr))',gap:1,background:'rgba(255,255,255,0.04)' }}>
            {Array.from({length:23},(_,i) => (
              <div key={i} style={{ background:navy,padding:'18px 10px',display:'flex',alignItems:'center',justifyContent:'center',minHeight:68,transition:'background .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background=navy}>
                <img src={`/clientes/logo-${i+1}.png`} alt={`Cliente ${i+1}`}
                  style={{ maxWidth:'100%',maxHeight:32,objectFit:'contain',filter:'brightness(0) invert(.5)',transition:'filter .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.filter='brightness(0) invert(.9)'}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.filter='brightness(0) invert(.5)'}
                  onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.background='rgba(255,255,255,0.03)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACTO — blanco con fundido ══ */}
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute',top:0,left:0,right:0,height:130,background:`linear-gradient(to bottom,${navy},transparent)`,zIndex:1,pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:80,background:`linear-gradient(to top,${navy},transparent)`,zIndex:1,pointerEvents:'none' }} />
        <section id="contacto" data-section style={{ padding:'140px 40px 120px',background:'white',position:'relative' }}>
          <div style={{ maxWidth:560,margin:'0 auto',textAlign:'center',position:'relative',zIndex:2 }}>
            <div style={{ fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:700,color:o,marginBottom:14 }} className="a1">Hablemos</div>
            <h2 className="a2" style={{ fontFamily:"'DM Serif Display',serif",fontSize:'clamp(34px,5vw,60px)',fontWeight:400,color:navy,lineHeight:1.05,marginBottom:14 }}>¿Listo para<br/><em style={{ color:o }}>transformar</em><br/>tu equipo?</h2>
            <div className="a3" style={{ width:0,height:2,background:o,margin:'14px auto 28px',animation:'lineG .8s .3s ease both' }} />
            <p className="a3" style={{ fontSize:15,color:'#8899cc',lineHeight:1.85,marginBottom:48 }}>Coaching individual, talleres corporativos, mentoría o simplemente una conversación.</p>
            <div className="a4" style={{ display:'flex',flexDirection:'column',gap:10,alignItems:'center',marginBottom:44 }}>
              <a href="mailto:omar@girolab.net" style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:navy,fontStyle:'italic',textDecoration:'none',transition:'color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=o}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color=navy}>
                omar@girolab.net
              </a>
              <a href="tel:+51922213800" style={{ fontSize:13,color:'rgba(0,7,44,0.3)',letterSpacing:3,textDecoration:'none',transition:'color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=navy}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='rgba(0,7,44,0.3)'}>
                +51 922 213 800
              </a>
            </div>
            <div className="a5" style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap' }}>
              <button onClick={handlePrint} className="bo"><span>↓ Descargar CV</span></button>
              <a href="https://wa.link/95x6de" target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 30px',border:'1.5px solid rgba(0,7,44,0.18)',background:'transparent',color:'rgba(0,7,44,0.5)',fontSize:11,letterSpacing:2,textTransform:'uppercase',fontWeight:700,textDecoration:'none',transition:'all .3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor=navy;(e.currentTarget as HTMLElement).style.color=navy }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(0,7,44,0.18)';(e.currentTarget as HTMLElement).style.color='rgba(0,7,44,0.5)' }}>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>

      <footer className="ff" style={{ padding:'22px 40px',borderTop:'1px solid rgba(255,255,255,0.05)',background:navy,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
        <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:'rgba(255,255,255,0.25)',fontStyle:'italic' }}>Omar Herrera · Coach & Facilitador</span>
        <a href="https://girolab.net" style={{ fontSize:10,color:'rgba(255,255,255,0.2)',letterSpacing:2,textTransform:'uppercase',textDecoration:'none',transition:'color .2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=o}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.2)'}>girolab.net</a>
      </footer>
    </div>
  )
}

function PrintCV() {
  useEffect(() => { setTimeout(() => window.print(), 400) }, [])
  const navy='#00072C', o='#E8860A', m='#445580'
  return (
    <div style={{ fontFamily:"'Instrument Sans',sans-serif",background:'#e5e5e5' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.pp{width:210mm;min-height:297mm;margin:0 auto 20px;background:white}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{margin:0;size:A4}body{background:white!important}.np{display:none!important}.pp{width:210mm;height:297mm;min-height:unset;margin:0;overflow:hidden;page-break-after:always;page-break-inside:avoid}.pp:last-child{page-break-after:avoid}}`}</style>
      <div className="np" style={{ position:'fixed',bottom:24,right:24,zIndex:100 }}>
        <button onClick={() => window.print()} style={{ padding:'12px 24px',background:o,color:'white',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',letterSpacing:1 }}>Guardar PDF</button>
      </div>
      {/* P1 */}
      <div className="pp" style={{ display:'flex',flexDirection:'column' }}>
        <div style={{ background:navy,padding:'30px 44px 22px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end' }}>
            <div>
              <div style={{ fontSize:9,letterSpacing:4,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:7 }}>Coach · Facilitador · Mentor</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:40,color:'white',lineHeight:1.0 }}>Omar <em style={{color:o}}>Herrera</em></div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,fontStyle:'italic',color:'rgba(255,255,255,0.4)',marginTop:5 }}>"Convicción y no Condición."</div>
            </div>
            <div style={{ textAlign:'right' }}>{['omar@girolab.net','+51 922 213 800','girolab.net'].map(t=><div key={t} style={{ fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:2 }}>{t}</div>)}</div>
          </div>
        </div>
        <div style={{ height:2,background:`linear-gradient(90deg,${o},${navy})` }} />
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',background:navy }}>
          {[{v:'9+',l:'Años'},{v:'50+',l:'Empresas'},{v:'1,000+',l:'Personas'},{v:'9',l:'Certificaciones'}].map((s,i)=>(
            <div key={s.l} style={{ padding:'10px 12px',textAlign:'center',borderRight:i<3?'1px solid rgba(255,255,255,0.05)':'none' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:o,fontStyle:'italic' }}>{s.v}</div>
              <div style={{ fontSize:8,letterSpacing:2,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ flex:1,padding:'20px 44px',display:'grid',gridTemplateColumns:'1fr 190px',gap:24 }}>
          <div>
            <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:12 }}>Experiencia</div>
            {EXPERIENCIA.map((e,i)=>(
              <div key={i} style={{ borderLeft:`2px solid ${i===0?o:'rgba(0,7,44,0.1)'}`,paddingLeft:12,marginBottom:11 }}>
                <div style={{ fontSize:8,letterSpacing:2,color:i===0?o:m,textTransform:'uppercase',marginBottom:1 }}>{e.periodo}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:13,color:navy,fontStyle:i===0?'italic':'normal',marginBottom:2 }}>{e.rol}</div>
                <div style={{ fontSize:9,color:o,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:3,opacity:i===0?1:.6 }}>{e.empresa}</div>
                <p style={{ fontSize:10,color:m,lineHeight:1.5 }}>{e.desc}</p>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:8 }}>Habilidades</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:3,marginBottom:14 }}>{HABILIDADES_RADAR.map(h=><span key={h.label} style={{ fontSize:8,padding:'2px 7px',border:'1px solid rgba(0,7,44,0.12)',color:m }}>{h.label}</span>)}</div>
            <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:8 }}>Herramientas</div>
            {HERRAMIENTAS.map(h=>(
              <div key={h.nombre} style={{ marginBottom:5 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:2 }}><span style={{ fontSize:9,color:m }}>{h.nombre}</span><span style={{ fontSize:9,color:o,fontWeight:700 }}>{h.pct}%</span></div>
                <div style={{ height:3,background:'rgba(0,7,44,0.08)',borderRadius:2 }}><div style={{ height:'100%',width:h.pct+'%',background:o,borderRadius:2 }} /></div>
              </div>
            ))}
            <div style={{ marginTop:12,fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:6 }}>IA</div>
            {IA_TOOLS.map(h=>(
              <div key={h.nombre} style={{ marginBottom:5 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:2 }}><span style={{ fontSize:9,color:m }}>{h.nombre}</span><span style={{ fontSize:9,color:o,fontWeight:700 }}>{h.pct}%</span></div>
                <div style={{ height:3,background:'rgba(0,7,44,0.08)',borderRadius:2 }}><div style={{ height:'100%',width:h.pct+'%',background:`linear-gradient(90deg,${navy},${o})`,borderRadius:2 }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:'8px 44px',borderTop:'1px solid rgba(0,7,44,0.08)',display:'flex',justifyContent:'space-between' }}>
          <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:10,color:navy,fontStyle:'italic' }}>Omar Herrera</span>
          <span style={{ fontSize:9,color:m }}>1 / 2</span>
        </div>
      </div>
      {/* P2 */}
      <div className="pp" style={{ display:'flex',flexDirection:'column' }}>
        <div style={{ height:2,background:`linear-gradient(90deg,${o},${navy})` }} />
        <div style={{ flex:1,padding:'26px 44px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:28 }}>
          <div>
            <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:12 }}>Servicios — Organizaciones</div>
            {SERVICIOS.filter(s=>s.cat==='org').map((s,i)=>(
              <div key={i} style={{ padding:'8px 12px',background:'rgba(0,7,44,0.03)',borderLeft:`2px solid ${navy}`,marginBottom:8 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,color:navy,marginBottom:2 }}>{s.titulo}</div>
                <p style={{ fontSize:10,color:m,lineHeight:1.5 }}>{s.desc}</p>
              </div>
            ))}
            <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:10,marginTop:16 }}>Servicios — Personas</div>
            {SERVICIOS.filter(s=>s.cat==='per').map((s,i)=>(
              <div key={i} style={{ padding:'8px 12px',background:'rgba(0,7,44,0.03)',borderLeft:`2px solid ${o}`,marginBottom:8 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:12,color:navy,marginBottom:2 }}>{s.titulo}</div>
                <p style={{ fontSize:10,color:m,lineHeight:1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:12 }}>Formación</div>
            {FORMACION.map((f,i)=>(
              <div key={i} style={{ display:'flex',gap:10,borderLeft:'1px solid rgba(0,7,44,0.1)',paddingLeft:10,marginBottom:9,position:'relative' }}>
                <div style={{ position:'absolute',left:-3,top:5,width:5,height:5,borderRadius:'50%',background:o }} />
                <span style={{ fontSize:9,color:o,fontStyle:'italic',minWidth:28 }}>{f.año}</span>
                <div><div style={{ fontSize:10,color:navy,fontWeight:600,lineHeight:1.3 }}>{f.titulo}</div><div style={{ fontSize:8,color:m }}>{f.inst}</div></div>
              </div>
            ))}
            <div style={{ marginTop:14,padding:'12px 14px',background:'rgba(232,134,10,0.05)',borderLeft:`2px solid ${o}` }}>
              <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:5 }}>Inteligencia Artificial</div>
              <p style={{ fontSize:10,color:m,lineHeight:1.6 }}>Claude · Gemini · ChatGPT · Artlist AI — diseño de talleres y producción de contenido.</p>
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:9,letterSpacing:3,color:o,fontWeight:700,textTransform:'uppercase',marginBottom:6 }}>Idiomas</div>
              <div style={{ display:'flex',gap:6 }}>
                <span style={{ fontSize:9,padding:'2px 10px',border:`1px solid ${o}`,color:o }}>Inglés Reading B</span>
                <span style={{ fontSize:9,padding:'2px 10px',border:'1px solid rgba(0,7,44,0.15)',color:m }}>Speaking A</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding:'8px 44px',borderTop:'1px solid rgba(0,7,44,0.08)',display:'flex',justifyContent:'space-between',background:'rgba(0,7,44,0.02)' }}>
          <span style={{ fontSize:9,color:m }}>omar@girolab.net · +51 922 213 800 · girolab.net</span>
          <span style={{ fontSize:9,color:m }}>2 / 2</span>
        </div>
      </div>
    </div>
  )
}