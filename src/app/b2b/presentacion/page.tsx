'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then(m => m.DotLottieReact),
  { ssr: false }
)

const SERVICIOS = [
  {
    nombre: 'Talleres Outdoor & Indoor',
    descripcion: 'Diseñamos experiencias de aprendizaje en espacios abiertos y ambientes controlados. Cada taller combina dinámicas vivenciales con herramientas psicológicas para transformar equipos de manera profunda y sostenible.',
    icono: '🌿',
    color: '#1D9E75',
  },
  {
    nombre: 'Teambuilding',
    descripcion: 'Actividades vivenciales que fortalecen la confianza, la comunicación y la cohesión. Creamos momentos que los equipos recuerdan y que generan cambios reales en la cultura organizacional.',
    icono: '🤝',
    color: '#421869',
  },
  {
    nombre: 'Negociación y Ventas',
    descripcion: 'Programas prácticos que desarrollan habilidades de influencia, persuasión y cierre. Combinamos psicología del comportamiento con técnicas de alto rendimiento adaptadas al contexto de cada organización.',
    icono: '📈',
    color: '#e65100',
  },
  {
    nombre: 'Desarrollo de Habilidades Blandas',
    descripcion: 'Formación en liderazgo, comunicación asertiva, inteligencia emocional y gestión del estrés. Estas competencias marcan la diferencia en el rendimiento individual y colectivo.',
    icono: '🧠',
    color: '#1565c0',
  },
  {
    nombre: 'Danza Primal',
    descripcion: 'Metodología única que usa el movimiento y la expresión corporal para liberar tensiones, conectar con el cuerpo y potenciar la creatividad y el bienestar del equipo desde adentro hacia afuera.',
    icono: '💃',
    color: '#c62828',
  },
]

const METODOLOGIA = [
  { paso: '01', titulo: 'Diagnóstico', desc: 'Evaluamos el estado actual del equipo a través de instrumentos psicológicos validados y conversaciones estratégicas.' },
  { paso: '02', titulo: 'Diseño', desc: 'Creamos un programa a medida basado en los objetivos, la cultura y el contexto específico de la organización.' },
  { paso: '03', titulo: 'Implementación', desc: 'Ejecutamos las sesiones con metodología activa, asegurando experiencias memorables y de alto impacto.' },
  { paso: '04', titulo: 'Seguimiento', desc: 'Medimos resultados, ajustamos el proceso y acompañamos la consolidación de los cambios en el tiempo.' },
]

const STATS = [
  { valor: '9+', label: 'Años de experiencia' },
  { valor: '30+', label: 'Empresas atendidas' },
  { valor: '500+', label: 'Personas impactadas' },
  { valor: '95%', label: 'Satisfacción promedio' },
]

export default function PresentacionPage() {
  useEffect(() => {
    document.title = 'Giro Lab — Presentación Corporativa'
  }, [])

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: 'white', color: '#1a1a2e', margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; }
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          .avoid-break { page-break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      {/* ── Botón imprimir ── */}
      <div className="no-print" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}>
        <button onClick={() => window.print()}
          style={{ padding: '14px 28px', borderRadius: 50, background: 'linear-gradient(135deg, #7b2fd4, #421869)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(123,47,212,0.4)', fontFamily: 'Raleway, sans-serif' }}>
          Descargar PDF
        </button>
      </div>

      {/* ════════ PORTADA ════════ */}
      <div className="page-break" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a0d 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 72px', position: 'relative', overflow: 'hidden' }}>
        {/* Fondo decorativo */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,212,0.25), transparent)', top: '-10%', right: '-10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,167,25,0.15), transparent)', bottom: '5%', left: '-5%', pointerEvents: 'none' }} />

        {/* Header portada */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56 }}>
            <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" loop autoplay style={{ width: 56, height: 56 }} />
          </div>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 22, color: 'white', letterSpacing: 1 }}>Giro Lab</span>
        </div>

        {/* Contenido central portada */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 60, paddingBottom: 40 }}>
          <div style={{ fontSize: 12, letterSpacing: 5, textTransform: 'uppercase', color: '#ffa719', fontWeight: 700, marginBottom: 24 }}>Bienestar Organizacional</div>
          <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 56, fontWeight: 900, lineHeight: 1.1, color: 'white', marginBottom: 24, maxWidth: 700 }}>
            Transformamos equipos.<br />
            <span style={{ background: 'linear-gradient(135deg, #b794f4, #ffa719)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Construimos bienestar real.
            </span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 560, marginBottom: 48 }}>
            9 años acompañando a personas y organizaciones hacia su mejor versión, con metodología psicológica, ciencia del comportamiento y un equipo que sabe lo que hace.
          </p>

          {/* Stats portada */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 680 }}>
            {STATS.map(s => (
              <div key={s.label} className="avoid-break">
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.valor}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer portada */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Preparado para</div>
            <div style={{ fontSize: 16, color: 'white', fontWeight: 700 }}>Tu organización</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>omar@girolab.net</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>www.girolab.net</div>
          </div>
        </div>
      </div>

      {/* ════════ PÁGINA 2 — QUIÉNES SOMOS ════════ */}
      <div className="page-break" style={{ minHeight: '100vh', padding: '72px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 72, alignItems: 'flex-start' }}>
          {/* Columna izq */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 16 }}>Quiénes somos</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 40, fontWeight: 900, color: '#1a1a2e', lineHeight: 1.1, marginBottom: 24 }}>9 años de evolución constante</h2>
            <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>
              Giro Lab nació de la convicción de que el bienestar no es un beneficio extra — es la base de todo rendimiento sostenible. Combinamos psicología, neurociencia y metodologías activas para crear programas que realmente transforman equipos.
            </p>
            <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8 }}>
              Trabajamos con organizaciones de distintos sectores y tamaños, desde startups hasta corporaciones, siempre con el mismo compromiso: resultados medibles, experiencias memorables y acompañamiento genuino.
            </p>

            {/* Timeline compacto */}
            <div style={{ marginTop: 40 }}>
              {[
                { year: '2015', titulo: 'Need It', desc: 'Los primeros pasos y aprendizajes fundacionales.' },
                { year: '2016', titulo: 'Giro', desc: 'Expansión y consolidación de metodología propia.' },
                { year: '2026', titulo: 'Giro Lab', desc: 'Plataforma integral de bienestar organizacional.' },
              ].map((h, i) => (
                <div key={i} className="avoid-break" style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 44, height: 44, borderRadius: '50%', background: i === 0 ? '#e5393580' : i === 1 ? '#ffa71980' : '#42186980', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i === 0 ? '#e53935' : i === 1 ? '#e65100' : '#421869' }}>{h.year}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1a1a2e', fontSize: 15 }}>{h.titulo}</div>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna der — Omar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg, #f3e8ff, #e8f5e9)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img src="/omar-herrera.jpg" alt="Omar Herrera"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #faf5ff)', borderRadius: 20, padding: '24px 20px' }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 8 }}>Fundador</div>
              <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 900, color: '#1a1a2e', marginBottom: 4 }}>Omar Herrera</div>
              <div style={{ fontSize: 13, color: '#7b2fd4', fontWeight: 600, marginBottom: 16 }}>Psicólogo · Coach · CEO</div>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                Psicólogo con maestría en Desarrollo Organizacional. 9 años transformando equipos en Perú y Latinoamérica con metodologías que integran ciencia y experiencia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ PÁGINA 3 — SERVICIOS ════════ */}
      <div className="page-break" style={{ minHeight: '100vh', padding: '72px', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 12 }}>Lo que hacemos</div>
          <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 40, fontWeight: 900, color: '#1a1a2e' }}>Nuestros servicios</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {SERVICIOS.map(s => (
            <div key={s.nombre} className="avoid-break" style={{ background: 'white', borderRadius: 20, padding: '28px 24px', borderLeft: `4px solid ${s.color}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icono}</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 10 }}>{s.nombre}</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{s.descripcion}</p>
            </div>
          ))}
          {/* Card contacto (5ta posición) */}
          <div className="avoid-break" style={{ background: 'linear-gradient(135deg, #421869, #7b2fd4)', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 16 }}>¿Tienes algo distinto en mente?</div>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 12 }}>Diseñamos programas a medida</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 20 }}>Cada organización es única. Cuéntanos tu desafío y construimos la solución juntos.</p>
            <div style={{ fontSize: 14, color: '#ffa719', fontWeight: 700 }}>omar@girolab.net</div>
          </div>
        </div>
      </div>

      {/* ════════ PÁGINA 4 — METODOLOGÍA + CLIENTES ════════ */}
      <div style={{ minHeight: '100vh', padding: '72px' }}>
        {/* Metodología */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 12 }}>Cómo trabajamos</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, color: '#1a1a2e' }}>Nuestra metodología</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {METODOLOGIA.map((m, i) => (
              <div key={i} className="avoid-break" style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #7b2fd4, #421869)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 18 }}>{m.paso}</div>
                <h4 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 800, color: '#1a1a2e', fontSize: 15, marginBottom: 8 }}>{m.titulo}</h4>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes */}
        <div style={{ background: '#f5f3ff', borderRadius: 24, padding: '40px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 10 }}>Confían en nosotros</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 28, fontWeight: 900, color: '#1a1a2e' }}>Más de 30 organizaciones transformadas</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 10, padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <img src={`/clientes/logo-${i + 1}.png`} alt="" style={{ maxWidth: '100%', maxHeight: 32, objectFit: 'contain' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = '#f0eaff' }} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div style={{ marginTop: 48, background: 'linear-gradient(135deg, #0d0d1a, #1a0a2e)', borderRadius: 24, padding: '48px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 10 }}>¿Listo para transformar tu equipo?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6 }}>Conversemos sobre cómo podemos acompañar a tu organización.</p>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 16, color: '#ffa719', fontWeight: 800, marginBottom: 6 }}>omar@girolab.net</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>www.girolab.net/b2b</div>
          </div>
        </div>
      </div>

    </div>
  )
}
