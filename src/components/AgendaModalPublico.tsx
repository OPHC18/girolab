'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Props {
  menter: any
  user: any
  onClose: () => void
  onBooked: () => void
}

export default function AgendaModalPublico({ menter, user, onClose, onBooked }: Props) {
  const [step, setStep] = useState<'fecha' | 'slot' | 'confirm'>('fecha')
  const [fecha, setFecha] = useState('')
  const [slots, setSlots] = useState<{ slot_start: string; slot_end: string }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ slot_start: string; slot_end: string } | null>(null)
  const [modalidad, setModalidad] = useState<'video' | 'presencial'>(menter.modalidad === 'presencial' ? 'presencial' : 'video')
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'directo'>('directo')
  const [notas, setNotas] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookingMsg, setBookingMsg] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const fetchSlots = async (f: string) => {
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    const { data, error } = await supabase.rpc('get_available_slots', {
      p_menter_id: menter.menter_id,
      p_fecha: f,
    })
    setSlotsLoading(false)
    if (!error && data) setSlots(data)
  }

  const handleFechaChange = async (f: string) => {
    setFecha(f)
    if (f) { await fetchSlots(f); setStep('slot') }
  }

  const handleConfirm = async () => {
    if (!selectedSlot || !fecha || !user?.id) return
    setBooking(true)
    const meta = user?.user_metadata
    const clientName = meta?.name || meta?.nombre || user?.email || ''
    const { error } = await supabase.from('appointments').insert({
      menter_id: menter.menter_id,
      client_id: user.id,
      menter_name: menter.nombre || '',
      client_name: clientName,
      date: fecha,
      start_time: selectedSlot.slot_start,
      end_time: selectedSlot.slot_end,
      modality: modalidad,
      payment_method: paymentMethod,
      payment_status: 'pendiente',
      price: menter.precio_sesion,
      status: 'pendiente',
      notes: notas || null,
    })
    setBooking(false)
    if (error) {
      setBookingMsg('❌ Error al agendar. Intenta nuevamente.')
    } else {
      setBookingMsg('🎉 ¡Solicitud enviada! El Menter confirmará tu cita pronto.')
      setTimeout(() => onBooked(), 2500)
    }
  }

  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const formatFecha = (f: string) => {
    if (!f) return ''
    const [y, mo, d] = f.split('-')
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
    const date = new Date(parseInt(y), parseInt(mo)-1, parseInt(d))
    return `${dias[date.getDay()]}, ${parseInt(d)} de ${meses[parseInt(mo)-1]} de ${y}`
  }

  if (bookingMsg) return (
    <div style={{ padding: '40px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{bookingMsg.startsWith('❌') ? '❌' : '🎉'}</div>
      <p style={{ fontSize: 16, color: bookingMsg.startsWith('❌') ? '#c62828' : '#2e7d32', fontWeight: 600, lineHeight: 1.6 }}>{bookingMsg}</p>
    </div>
  )

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {(['fecha','slot','confirm'] as const).map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
              background: step === s ? '#421869' : (['fecha','slot','confirm'].indexOf(step) > i ? '#ffa719' : '#e0e0e0'),
              color: (step === s || ['fecha','slot','confirm'].indexOf(step) > i) ? 'white' : '#999'
            }}>{i+1}</div>
            {i < 2 && <div style={{ width: 24, height: 2, background: ['fecha','slot','confirm'].indexOf(step) > i ? '#ffa719' : '#e0e0e0' }} />}
          </div>
        ))}
        <span style={{ fontSize: 13, color: '#666', marginLeft: 4 }}>
          {step === 'fecha' ? 'Elige una fecha' : step === 'slot' ? 'Elige un horario' : 'Confirma tu cita'}
        </span>
      </div>

      {/* Step 1: Fecha */}
      {step === 'fecha' && (
        <div>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
            Selecciona el día que quieres tu sesión con <strong>{menter.nombre}</strong>.
          </p>
          <input type="date" min={today} value={fecha}
            onChange={e => handleFechaChange(e.target.value)}
            style={{ width: '100%', padding: '14px', border: '2px solid #995bd5', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' as const, cursor: 'pointer' }} />
        </div>
      )}

      {/* Step 2: Slots */}
      {step === 'slot' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setStep('fecha'); setSlots([]) }}
              style={{ background: 'none', border: 'none', color: '#995bd5', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <p style={{ margin: 0, color: '#421869', fontWeight: 600, fontSize: 14 }}>📅 {formatFecha(fecha)}</p>
          </div>
          {slotsLoading && <div style={{ textAlign: 'center', padding: 30, color: '#666' }}>⏳ Buscando horarios...</div>}
          {!slotsLoading && slots.length === 0 && (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>😔</div>
              <p style={{ color: '#666', fontSize: 14 }}>No hay horarios disponibles para este día.<br/>Prueba con otra fecha.</p>
              <button onClick={() => setStep('fecha')}
                style={{ marginTop: 12, padding: '10px 24px', borderRadius: 30, border: 'none', background: '#421869', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Cambiar fecha
              </button>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
                {slots.length} horarios disponibles — sesión de {menter.duracion_sesion || 60} min
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 16 }}>
                {slots.map((s, i) => {
                  const sel = selectedSlot?.slot_start === s.slot_start
                  return (
                    <button key={i} onClick={() => setSelectedSlot(s)}
                      style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${sel ? '#421869' : '#e0e0e0'}`, background: sel ? '#421869' : 'white', color: sel ? 'white' : '#2d2926', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      {formatTime(s.slot_start)}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => selectedSlot && setStep('confirm')} disabled={!selectedSlot}
                style={{ width: '100%', padding: '12px', borderRadius: 30, border: 'none', background: selectedSlot ? '#ffa719' : '#e0e0e0', color: selectedSlot ? '#2d2926' : '#999', fontWeight: 700, fontSize: 14, cursor: selectedSlot ? 'pointer' : 'not-allowed' }}>
                Continuar →
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button onClick={() => setStep('slot')}
              style={{ background: 'none', border: 'none', color: '#995bd5', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <p style={{ margin: 0, color: '#421869', fontWeight: 600, fontSize: 14 }}>Confirma los detalles</p>
          </div>

          <div style={{ background: '#f3e8ff', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 3 }}>Menter</div>
                <div style={{ fontWeight: 700, color: '#421869', fontSize: 14 }}>{menter.nombre}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 3 }}>Fecha</div>
                <div style={{ fontWeight: 600, color: '#2d2926', fontSize: 13 }}>{formatFecha(fecha)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 3 }}>Horario</div>
                <div style={{ fontWeight: 600, color: '#2d2926', fontSize: 13 }}>{formatTime(selectedSlot!.slot_start)} — {formatTime(selectedSlot!.slot_end)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 3 }}>Precio</div>
                <div style={{ fontWeight: 700, color: '#421869', fontSize: 14 }}>{menter.precio_sesion ? `$${menter.precio_sesion} USD` : 'A acordar'}</div>
              </div>
            </div>
          </div>

          {menter.modalidad === 'ambas' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Modalidad</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['video','presencial'] as const).map(mo => (
                  <button key={mo} onClick={() => setModalidad(mo)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${modalidad === mo ? '#421869' : '#e0e0e0'}`, background: modalidad === mo ? '#421869' : 'white', color: modalidad === mo ? 'white' : '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {mo === 'video' ? '📹 Virtual' : '📍 Presencial'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Método de pago</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['directo','online'] as const).map(p => (
                <button key={p} onClick={() => setPaymentMethod(p)}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${paymentMethod === p ? '#ffa719' : '#e0e0e0'}`, background: paymentMethod === p ? '#fff8e1' : 'white', color: paymentMethod === p ? '#e65100' : '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {p === 'directo' ? '🤝 Acordar directo' : '💳 Pagar online'}
                </button>
              ))}
            </div>
            {paymentMethod === 'online' && <p style={{ fontSize: 12, color: '#666', margin: '8px 0 0' }}>💡 Próximamente via MercadoPago</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>
              Notas para el Menter <span style={{ fontWeight: 400, color: '#999' }}>(opcional)</span>
            </label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Cuéntale brevemente sobre lo que quieres trabajar..." rows={3}
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' as const, resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={handleConfirm} disabled={booking}
              style={{ flex: 2, padding: '12px', borderRadius: 30, border: 'none', background: booking ? 'rgba(255,167,25,0.5)' : '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: booking ? 'not-allowed' : 'pointer' }}>
              {booking ? 'Enviando...' : '✅ Confirmar cita'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}