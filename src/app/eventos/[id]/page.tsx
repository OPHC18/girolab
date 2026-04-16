'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import AgendaModalPublico from '@/components/AgendaModalPublico'
import { dispararEmail } from '@/lib/email/send'

export default function EventoPage() {
  const { id } = useParams()
  const [evento, setEvento] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [ticketSeleccionado, setTicketSeleccionado] = useState<any>(null)
  const [cantidadTickets, setCantidadTickets] = useState(1)
  const [codigoDescuento, setCodigoDescuento] = useState('')
  const [inscrito, setInscrito] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [showAgenda, setShowAgenda] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchEvento()
  }, [id])

  const fetchEvento = async () => {
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        event_tickets(*),
        event_registrations(count),
        menter:menter_public_profiles(nombre, avatar_url, plan)
      `)
      .eq('id', id)
      .single()
    setEvento(data)
    setLoading(false)
  }

  const handleInscribirse = async () => {
    if (!user?.id || !ticketSeleccionado) return
    const precioFinal = ticketSeleccionado.price * cantidadTickets * (1 - (ticketSeleccionado.discount_pct || 0) / 100)

    const { data: reg, error } = await supabase.from('event_registrations').insert({
      event_id:       evento.id,
      ticket_id:      ticketSeleccionado.id,
      user_id:        user.id,
      quantity:       cantidadTickets,
      total_price:    precioFinal,
      discount_code:  codigoDescuento || null,
      payment_status: precioFinal === 0 ? 'gratis' : 'pendiente',
    }).select().single()

    if (error || !reg) return

    const clientName = user.user_metadata?.nombre
      ? `${user.user_metadata.nombre} ${user.user_metadata.apellidos || ''}`.trim()
      : user.email?.split('@')[0] || 'Usuario'
    const eventoFecha = new Date(evento.date + 'T00:00:00').toLocaleDateString('es-PE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    await dispararEmail('confirmacion_evento', {
      clientName, clientEmail: user.email,
      eventoTitulo: evento.title, eventoFecha,
      eventoHora: evento.start_time?.slice(0, 5) || '',
      eventoLugar: evento.location_address || evento.meeting_link || '',
      modalidad: evento.modality, tipoEntrada: ticketSeleccionado.name,
      cantidad: cantidadTickets, precioTotal: precioFinal,
      registrationId: reg.id, eventoId: evento.id,
    })

    setInscrito(true)
    setShowConfirmModal(true)
    setMensaje(precioFinal === 0 ? '¡Inscripción confirmada!' : '¡Registro confirmado!')
  }

  const addToGoogleCalendar = () => {
    if (!evento) return
    const start = `${evento.date.replace(/-/g,'')}T${(evento.start_time || '0000').replace(':','')}00`
    const end = evento.end_time ? `${evento.date.replace(/-/g,'')}T${evento.end_time.replace(':','')}00` : start
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.title)}&dates=${start}/${end}&details=${encodeURIComponent(evento.description || '')}&location=${encodeURIComponent(evento.location_address || evento.meeting_link || '')}`
    window.open(url, '_blank')
  }

  const precioFinal = ticketSeleccionado
    ? ticketSeleccionado.price * cantidadTickets * (1 - (ticketSeleccionado.discount_pct || 0) / 100)
    : 0

  return (
    <div style={{ backgroundColor: '#421869', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      <style>{`
        @keyframes animateUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @media (max-width: 768px) {
          .evento-layout { flex-direction: column !important; }
          .evento-cta { width: 100% !important; position: static !important; order: 2; }
          .evento-content { width: 100% !important; order: 1; }
        }
      `}</style>

      {/* Círculos animados */}
      <ul style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', margin: 0, padding: 0, zIndex: 0, pointerEvents: 'none', listStyle: 'none' }}>
        {[{left:'25%',size:80,delay:0,dur:25},{left:'10%',size:20,delay:2,dur:12},{left:'70%',size:20,delay:4,dur:25},{left:'40%',size:60,delay:8,dur:20},{left:'85%',size:30,delay:1,dur:18}].map((c,i) => (
          <li key={i} style={{ position:'absolute', display:'block', width:c.size, height:c.size, background:'rgba(255,255,255,0.05)', bottom:-150, left:c.left, borderRadius:'50%', animation:`animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </ul>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          ← Dashboard
        </a>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ color: 'white', fontSize: 16, fontFamily: 'Raleway', fontWeight: 800, letterSpacing: 1 }}>GIRO LAB</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
          Cargando...
        </div>
      ) : !evento ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
          Evento no encontrado.
        </div>
      ) : (
        <div className="evento-layout" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 24, padding: '0 32px 60px', maxWidth: 1100, margin: '0 auto' }}>

{/* Columna izquierda — CTAs o inscripción */}
<div className="evento-cta" style={{ width: '30%', flexShrink: 0, position: 'sticky', top: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>

  {user ? (
    <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
      {evento.menter?.avatar_url ? (
        <img src={evento.menter.avatar_url} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' as const, marginBottom: 12, margin: '20px auto', border: '3px solid rgba(255,255,255,0.3)' }} />
      ) : (
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ffa719', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d2926', fontWeight: 800, fontSize: 28, margin: '0 auto 12px' }}>
          {evento.menter?.nombre?.[0] || 'M'}
        </div>
      )}
      <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 16, color: 'white', fontFamily: 'Raleway' }}>
        {evento.menter?.nombre || 'Menter'}
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Organizador del evento</p>
      <button onClick={() => setShowAgenda(true)}
  style={{ display: 'block', width: '100%', padding: '12px 16px', borderRadius: 20, background: '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: 'Raleway' }}>
  📅 Agendar sesión
</button>
      <a href={`/menter/${evento.menter_id}`} style={{ display: 'block', padding: '11px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
        Ver perfil completo
      </a>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}>
        <h4 style={{ fontFamily: 'Raleway', color: 'white', fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>🎫 Inscríbete</h4>
        {inscrito ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{mensaje}</p>
            <button onClick={addToGoogleCalendar}
              style={{ marginTop: 10, padding: '9px 14px', borderRadius: 20, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 12, cursor: 'pointer', width: '100%' }}>
              📅 Agregar al calendario
            </button>
          </div>
        ) : (
          <>
            {(evento.event_tickets || []).map((ticket: any) => {
              const agotado = ticket.quantity && ticket.sold >= ticket.quantity
              return (
                <div key={ticket.id} onClick={() => !agotado && setTicketSeleccionado(ticket)}
                  style={{ padding: '10px 12px', borderRadius: 10, border: `2px solid ${ticketSeleccionado?.id === ticket.id ? '#ffa719' : 'rgba(255,255,255,0.2)'}`, background: ticketSeleccionado?.id === ticket.id ? 'rgba(255,167,25,0.15)' : 'rgba(255,255,255,0.05)', cursor: agotado ? 'not-allowed' : 'pointer', marginBottom: 8, opacity: agotado ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: 'white' }}>{ticket.name}</p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: ticket.price === 0 ? '#4ade80' : '#ffa719' }}>
                      {ticket.price === 0 ? 'Gratis' : `$${ticket.price}`}
                    </p>
                  </div>
                  {agotado && <p style={{ margin: '3px 0 0', fontSize: 10, color: '#f87171', fontWeight: 700 }}>AGOTADO</p>}
                  </div>
              )
            } )
            }

            {ticketSeleccionado && (
              <>
                {/* +/- stepper — mejor experiencia móvil */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, overflow: 'hidden' }}>
                    <button onClick={() => setCantidadTickets(q => Math.max(1, q - 1))}
                      style={{ width: 36, height: 36, border: 'none', background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                    <span style={{ minWidth: 32, textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>{cantidadTickets}</span>
                    <button onClick={() => setCantidadTickets(q => q + 1)}
                      style={{ width: 36, height: 36, border: 'none', background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                  </div>
                  <input value={codigoDescuento} onChange={e => setCodigoDescuento(e.target.value)}
                    placeholder="Código descuento"
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 12 }} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 10px', marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'white' }}>
                    <span>Total</span>
                    <span>{precioFinal === 0 ? 'Gratis' : `$${precioFinal.toFixed(2)} USD`}</span>
                  </div>
                </div>
                <button onClick={handleInscribirse}
                  style={{ width: '100%', padding: '11px', borderRadius: 20, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>
                  {precioFinal === 0 ? '✅ Confirmar registro gratis' : `✅ Registrarme · $${precioFinal.toFixed(2)} USD`}
                </button>
                {precioFinal > 0 && (
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', textAlign: 'center', margin: '6px 0 0' }}>
                    Coordinarás el pago directamente con el organizador.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  ) : (
    <>
      <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '28px 20px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
        <h3 style={{ fontFamily: 'Raleway', color: 'white', fontSize: 15, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
          ¿Buscas bienestar?
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
          Regístrate para inscribirte a este evento y conectar con Menters.
        </p>
        <a href={`/?returnUrl=${typeof window !== 'undefined' ? window.location.pathname : ''}`} style={{ display: 'block', padding: '11px 16px', borderRadius: 20, background: '#ffa719', color: '#2d2926', fontWeight: 800, fontSize: 13, textDecoration: 'none', fontFamily: 'Raleway' }}>
          Empezar ahora →
        </a>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '28px 20px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
        <h3 style={{ fontFamily: 'Raleway', color: 'white', fontSize: 15, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
          ¿Eres profesional del bienestar?
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
          Crea y publica tus propios eventos en Giro Lab.
        </p>
        <a href={`/?returnUrl=${typeof window !== 'undefined' ? window.location.pathname : ''}`} style={{ display: 'block', padding: '11px 16px', borderRadius: 20, background: 'white', color: '#421869', fontWeight: 800, fontSize: 13, textDecoration: 'none', fontFamily: 'Raleway' }}>
          Ser Menter →
        </a>
      </div>
    </>
  )}

</div>

          {/* Columna derecha — contenido del evento */}
          <div className="evento-content" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

              {evento.cover_image && (
                <img src={evento.cover_image} alt={evento.title}
                  style={{ width: '100%', height: 300, objectFit: 'cover' as const }} />
              )}

              <div style={{ padding: '32px' }}>
                {/* Autor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  {evento.menter?.avatar_url ? (
                    <img src={evento.menter.avatar_url} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' as const }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                      {evento.menter?.nombre?.[0] || 'M'}
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#421869' }}>
                      {evento.menter?.nombre || 'Menter'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Organizador</p>
                  </div>
                </div>

                <h1 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 26, margin: '0 0 16px', lineHeight: 1.3 }}>
                  {evento.title}
                </h1>

                {/* Info del evento */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, background: '#f8f9fa', borderRadius: 16, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
                    <span>📅</span>
                    <span>
                      {new Date(evento.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {evento.start_time && ` · ${evento.start_time.slice(0,5)}`}
                      {evento.end_time && ` — ${evento.end_time.slice(0,5)}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
                    <span>{evento.modality === 'virtual' ? '💻' : '📍'}</span>
                    <span>
                      {evento.modality === 'virtual' ? 'Virtual' : evento.modality === 'presencial' ? `Presencial${evento.location_address ? ` · ${evento.location_address}` : ''}` : 'Híbrido'}
                    </span>
                  </div>
                  {evento.presenter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
                      <span>🎤</span><span>{evento.presenter}</span>
                    </div>
                  )}
                  {evento.max_participants && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
                      <span>👥</span>
                      <span>{evento.event_registrations?.[0]?.count || 0} inscritos / {evento.max_participants} cupos</span>
                    </div>
                  )}
                </div>

                {evento.description && (
                  <p style={{ fontSize: 16, color: '#444', lineHeight: 1.8, marginBottom: 24 }}>{evento.description}</p>
                )}

                {evento.organizers?.length > 0 && (
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>🏢 Organiza: {evento.organizers.join(', ')}</p>
                )}
                {evento.sponsors?.length > 0 && (
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>🤝 Auspicia: {evento.sponsors.join(', ')}</p>
                )}

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={addToGoogleCalendar}
                    style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    📅 Google Calendar
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('🔗 Link copiado'))}
                    style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    🔗 Compartir
                  </button>
                </div>
{/* Modal de confirmación de registro */}
{showConfirmModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    onClick={() => setShowConfirmModal(false)}>
    <div style={{ background: 'white', borderRadius: 20, maxWidth: 420, width: '100%', padding: '32px 28px', textAlign: 'center' }}
      onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
      <h3 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
        ¡Registro confirmado!
      </h3>
      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: '0 0 16px' }}>
        Tu lugar en <strong>{evento?.title}</strong> está reservado.
        {precioFinal > 0 && ' Contáctate con el organizador para coordinar el medio de pago.'}
      </p>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>
        Te enviamos un correo de confirmación.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={addToGoogleCalendar}
          style={{ flex: 1, padding: '10px', borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>
          📅 Agregar al calendario
        </button>
        <button onClick={() => setShowConfirmModal(false)}
          style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

{showAgenda && user && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    onClick={() => setShowAgenda(false)}>
    <div style={{ background: 'white', borderRadius: 20, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
      onClick={e => e.stopPropagation()}>
      <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 28px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, color: 'white', fontFamily: 'Raleway' }}>📅 Agendar sesión</h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>con {evento?.menter?.nombre}</p>
        </div>
        <button onClick={() => setShowAgenda(false)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <AgendaModalPublico
        menter={{ 
  menter_id: evento?.menter_id,
  nombre: evento?.menter?.nombre,
  avatar_url: evento?.menter?.avatar_url,
  precio_sesion: null,
  duracion_sesion: 60,
  modalidad: evento?.modality || 'video'
}}
        user={user}
        onClose={() => setShowAgenda(false)}
        onBooked={() => setShowAgenda(false)}
      />
    </div>
  </div>
)}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}