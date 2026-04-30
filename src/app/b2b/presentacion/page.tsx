'use client'
import { useEffect } from 'react'

const SERVICIOS = [
  { nombre: 'Talleres Outdoor & Indoor', descripcion: 'Experiencias de aprendizaje en espacios abiertos y ambientes controlados. Dinámicas vivenciales diseñadas para transformar equipos de manera profunda y sostenible.', color: '#1D9E75' },
  { nombre: 'Teambuilding', descripcion: 'Actividades vivenciales que fortalecen la confianza, la comunicación y la cohesión. Momentos que los equipos recuerdan y que generan cambios reales en la cultura.', color: '#421869' },
  { nombre: 'Negociación y Ventas', descripcion: 'Programas prácticos que desarrollan habilidades de influencia y cierre. Inteligencia conversacional y técnicas de alto rendimiento adaptadas a cada organización.', color: '#e65100' },
  { nombre: 'Desarrollo de Habilidades Blandas', descripcion: 'Formación en liderazgo, comunicación asertiva, inteligencia emocional y gestión del estrés — competencias que marcan la diferencia en el largo plazo.', color: '#1565c0' },
  { nombre: 'Danza Primal', descripcion: 'Metodología única que usa el movimiento y la expresión corporal para liberar tensiones, conectar con el cuerpo y potenciar la creatividad del equipo.', color: '#c62828' },
]

const METODOLOGIA = [
  { paso: '01', titulo: 'Diagnóstico', desc: 'Evaluamos el estado del equipo con instrumentos validados y conversaciones estratégicas.' },
  { paso: '02', titulo: 'Diseño', desc: 'Programa a medida basado en los objetivos y cultura de la organización.' },
  { paso: '03', titulo: 'Implementación', desc: 'Sesiones con metodología activa de alto impacto y experiencias memorables.' },
  { paso: '04', titulo: 'Seguimiento', desc: 'Medimos resultados y acompañamos la consolidación de los cambios.' },
]

const STATS = [
  { valor: '9+', label: 'Años de experiencia' },
  { valor: '30+', label: 'Empresas atendidas' },
  { valor: '500+', label: 'Personas impactadas' },
  { valor: '95%', label: 'Satisfacción promedio' },
]

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
    <div style={{
      background: 'white', borderRadius: '12px 12px 0 0',
      padding: '8px 20px 10px', display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
    }}>
      <img src="/favicon.svg" alt="Giro Lab" style={{ width: 32, height: 32 }} />
      <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 16, color: '#421869' }}>Giro Lab</span>
    </div>
  </div>
)

export default function PresentacionPage() {
  useEffect(() => { document.title = 'Giro Lab — Presentación Corporativa' }, [])

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
            width: 210mm;
            height: 297mm;
            min-height: unset;
            margin: 0;
            overflow: hidden;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .page:last-child { page-break-after: avoid; }
        }
      `}</style>

      {/* Botón imprimir */}
      <div className="no-print" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}>
        <button onClick={() => window.print()}
          style={{ padding: '14px 28px', borderRadius: 50, background: 'linear-gradient(135deg,#7b2fd4,#421869)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(123,47,212,0.4)', fontFamily: 'Raleway, sans-serif' }}>
          Descargar PDF
        </button>
      </div>

      {/* ════ PÁGINA 1 — PORTADA ════ */}
      <div className="page" style={{ background: 'linear-gradient(160deg,#0d0d1a 0%,#1a0a2e 55%,#0a1a10 100%)', display: 'flex', flexDirection: 'column' }}>
        {/* Blobs decorativos */}
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,47,212,0.28),transparent)', top: '-8%', right: '-8%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,167,25,0.15),transparent)', bottom: '8%', left: '-5%', pointerEvents: 'none' }} />

        {/* Logo pestaña */}
        <div style={{ padding: '0 60px', paddingTop: 0, position: 'relative', zIndex: 1 }}>
          <Logo />
        </div>

        {/* Contenido central */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#ffa719', fontWeight: 700, marginBottom: 20 }}>Bienestar Organizacional · 2026</div>
          <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: 'white', marginBottom: 20, maxWidth: 620 }}>
            Transformamos equipos.<br />
            <span style={{ background: 'linear-gradient(135deg,#b794f4,#ffa719)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Construimos bienestar real.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 520, marginBottom: 44 }}>
            9 años acompañando a personas y organizaciones hacia su mejor versión, con coaching ontológico, ciencia del comportamiento y metodologías activas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, maxWidth: 600 }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 34, fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.valor}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie portada */}
        <div style={{ padding: '20px 72px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Presentación preparada para</div>
            <div style={{ fontSize: 14, color: 'white', fontWeight: 700 }}>Tu organización</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>omar@girolab.net</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>www.girolab.net/b2b</div>
          </div>
        </div>
      </div>

      {/* ════ PÁGINA 2 — QUIÉNES SOMOS ════ */}
      <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg,#7b2fd4,#ffa719)' }} />
        <div style={{ flex: 1, padding: '48px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 56, alignItems: 'start' }}>
            {/* Columna izq */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 12 }}>Quiénes somos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 36, fontWeight: 900, color: '#1a1a2e', lineHeight: 1.1, marginBottom: 20 }}>9 años de evolución constante</h2>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 14 }}>
                Giro Lab nació de la convicción de que el bienestar no es un beneficio extra — es la base de todo rendimiento sostenible. Desde el coaching ontológico, organizacional y sistémico, creamos programas que realmente transforman equipos.
              </p>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 32 }}>
                Trabajamos con organizaciones de distintos sectores y tamaños, desde startups hasta corporaciones, siempre con el mismo compromiso: resultados medibles, experiencias memorables y acompañamiento genuino.
              </p>

              {/* Timeline */}
              <div style={{ borderLeft: '2px solid #e8e0f5', paddingLeft: 24 }}>
                {[
                  { year: '2015', titulo: 'Need It', color: '#e53935', desc: 'Los primeros pasos y aprendizajes fundacionales.' },
                  { year: '2016', titulo: 'Giro', color: '#ffa719', desc: 'Expansión y consolidación de metodología propia.' },
                  { year: '2026', titulo: 'Giro Lab', color: '#421869', desc: 'Plataforma integral de bienestar organizacional.' },
                ].map((h, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 20 : 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -31, top: 4, width: 14, height: 14, borderRadius: '50%', background: h.color, border: '2px solid white', boxShadow: `0 0 0 2px ${h.color}` }} />
                    <div style={{ fontSize: 11, color: h.color, fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>{h.year}</div>
                    <div style={{ fontWeight: 800, color: '#1a1a2e', fontSize: 14 }}>{h.titulo}</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 1 }}>{h.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna der — Omar */}
            <div>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,#f3e8ff,#e8f5e9)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/omar-herrera.jpg" alt="Omar Herrera"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div style={{ background: 'linear-gradient(135deg,#f3e8ff,#faf5ff)', borderRadius: 16, padding: '20px 18px' }}>
                <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 6 }}>Fundador</div>
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 18, fontWeight: 900, color: '#1a1a2e', marginBottom: 3 }}>Omar Herrera</div>
                <div style={{ fontSize: 11, color: '#7b2fd4', fontWeight: 600, marginBottom: 12 }}>Coach Ontológico, Organizacional y Sistémico · CEO</div>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                  9 años transformando equipos en Perú y Latinoamérica. Facilita procesos de cambio genuino donde las personas recuperan propósito y los equipos construyen coherencia y resultados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie pág 2 */}
        <div style={{ padding: '12px 64px', borderTop: '1px solid #f0e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 13, color: '#421869' }}>Giro Lab</span>
          <span style={{ fontSize: 11, color: '#bbb' }}>Quiénes somos · 2 / 4</span>
        </div>
      </div>

      {/* ════ PÁGINA 3 — SERVICIOS ════ */}
      <div className="page" style={{ background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg,#7b2fd4,#ffa719)' }} />
        <div style={{ flex: 1, padding: '40px 56px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 8 }}>Lo que hacemos</div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 34, fontWeight: 900, color: '#1a1a2e' }}>Nuestros servicios</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
            {SERVICIOS.map(s => (
              <div key={s.nombre} style={{ background: 'white', borderRadius: 16, padding: '22px 20px', borderLeft: `4px solid ${s.color}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, marginBottom: 10 }} />
                <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 15, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>{s.nombre}</h3>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.65 }}>{s.descripcion}</p>
              </div>
            ))}
            {/* Card "a medida" */}
            <div style={{ background: 'linear-gradient(135deg,#421869,#7b2fd4)', borderRadius: 16, padding: '22px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10 }}>¿Algo distinto?</div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 8 }}>Diseñamos programas a medida</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 14 }}>Cada organización es única. Cuéntanos tu desafío y construimos la solución juntos.</p>
              <div style={{ fontSize: 13, color: '#ffa719', fontWeight: 700 }}>omar@girolab.net</div>
            </div>
          </div>
        </div>

        {/* Pie pág 3 */}
        <div style={{ padding: '12px 56px', borderTop: '1px solid #ece6f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 13, color: '#421869' }}>Giro Lab</span>
          <span style={{ fontSize: 11, color: '#bbb' }}>Servicios · 3 / 4</span>
        </div>
      </div>

      {/* ════ PÁGINA 4 — METODOLOGÍA + CLIENTES + CTA ════ */}
      <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg,#7b2fd4,#ffa719)' }} />
        <div style={{ flex: 1, padding: '36px 56px 0', display: 'flex', flexDirection: 'column' }}>

          {/* Metodología */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 8 }}>Cómo trabajamos</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 26, fontWeight: 900, color: '#1a1a2e' }}>Nuestra metodología</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {METODOLOGIA.map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7b2fd4,#421869)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'white', fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 14 }}>{m.paso}</div>
                  <h4 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 800, color: '#1a1a2e', fontSize: 13, marginBottom: 5 }}>{m.titulo}</h4>
                  <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clientes */}
          <div style={{ background: '#f5f3ff', borderRadius: 20, padding: '24px 32px', marginBottom: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#7b2fd4', fontWeight: 700, marginBottom: 6 }}>Confían en nosotros</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 900, color: '#1a1a2e' }}>Más de 30 organizaciones transformadas</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10 }}>
              {Array.from({ length: 23 }, (_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 8, padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
                  <img src={`/clientes/logo-${i + 1}.png`} alt="" style={{ maxWidth: '100%', maxHeight: 26, objectFit: 'contain' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = '#ede8f5' }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <div style={{ background: 'linear-gradient(135deg,#0d0d1a,#1a0a2e)', borderRadius: 20, padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 6 }}>¿Listo para transformar tu equipo?</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>Conversemos sobre cómo podemos acompañar a tu organización.</p>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 15, color: '#ffa719', fontWeight: 800, marginBottom: 4 }}>omar@girolab.net</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>www.girolab.net/b2b</div>
            </div>
          </div>
        </div>

        {/* Pie pág 4 */}
        <div style={{ padding: '12px 56px', marginTop: 16, borderTop: '1px solid #f0e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 13, color: '#421869' }}>Giro Lab</span>
          <span style={{ fontSize: 11, color: '#bbb' }}>Metodología y clientes · 4 / 4</span>
        </div>
      </div>

    </div>
  )
}
