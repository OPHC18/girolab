'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/app/lib/supabase'

const FAQS: { question: string; answer: string }[] = [
  {
    question: '¿Qué es Giro Lab?',
    answer: 'Giro Lab es una plataforma de bienestar emocional que conecta a personas con Menters (psicólogos y coaches certificados). Puedes tomar evaluaciones psicológicas, agendar sesiones, asistir a eventos y aprender en comunidad.',
  },
  {
    question: '¿Cómo me registro?',
    answer: 'Haz clic en "Comenzar" en la página principal. Puedes registrarte con tu correo o con Google. El proceso toma menos de 2 minutos.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer: 'Tenemos un plan gratuito con acceso básico. Los planes Starter y Premium desbloquean más herramientas desde $9.99/mes. Puedes ver todos los planes en la sección "Membresía" dentro de tu dashboard.',
  },
  {
    question: '¿Cómo funciona con los Menters?',
    answer: 'Los Menters son profesionales certificados en psicología y coaching. Puedes ver sus perfiles, especialidades y precios, y agendar una sesión directamente desde la plataforma.',
  },
  {
    question: '¿Qué beneficios tiene la membresía?',
    answer: 'Con Starter accedes a matching automático con Menters, idiomas y formación académica visible. Con Premium además puedes escribir en el blog, ver certificados y más. Ambos incluyen descuentos exclusivos para Menters.',
  },
  {
    question: '¿Cómo saco una cita?',
    answer: 'Entra a tu dashboard, ve a la sección "Menters", elige el profesional que prefieras y haz clic en "Agendar sesión". Selecciona fecha y hora disponible y confirma.',
  },
  {
    question: '¿Cómo pago mi entrada a un evento?',
    answer: 'En la sección "Eventos" del dashboard, abre el evento de tu interés y haz clic en "Inscribirme". Los eventos gratuitos se confirman de inmediato; los de pago te redirigen a la pasarela de pago.',
  },
  {
    question: '¿Cómo funciona el Blog?',
    answer: 'En la sección "Blog" puedes leer artículos escritos por nuestros Menters sobre salud mental, bienestar y desarrollo personal. Los Menters con plan Premium pueden publicar sus propios artículos.',
  },
  {
    question: '¿Cómo funciona la Comunidad?',
    answer: 'La "Comunidad" es tu feed de actividad: publicaciones de Menters, nuevos eventos y artículos. Puedes dar like y comentar para interactuar con la comunidad.',
  },
  {
    question: '¿Cómo funcionan los Tests?',
    answer: 'En la sección "Tests" puedes tomar evaluaciones psicológicas validadas científicamente (ansiedad, depresión, personalidad, etc.). Los resultados son confidenciales y puedes compartirlos con tu Menter.',
  },
  {
    question: '¿Necesito cuenta PayPal para pagar?',
    answer: 'No es necesario tener cuenta PayPal. Puedes pagar directamente con tu tarjeta de crédito o débito desde la ventana de pago. Si quieres, también puedes registrarte en PayPal de forma gratuita para mayor comodidad.',
  },
  {
    question: '¿El cobro de la suscripción es automático?',
    answer: 'Sí, las suscripciones (Starter y Premium) tienen cobro automático mensual o anual según el plan que elijas. Recibirás un correo de confirmación cada vez que se procese un pago. Puedes cancelar en cualquier momento desde tu panel.',
  },
  {
    question: '¿Cómo cancelo mi suscripción?',
    answer: 'Puedes cancelar tu suscripción en cualquier momento desde la sección "Membresía" en tu dashboard. Al cancelar, seguirás teniendo acceso hasta el final del período pagado y no se realizarán cobros adicionales.',
  },
  {
    question: '¿Qué hago si mi pago fue rechazado?',
    answer: 'Verifica que los datos de tu tarjeta sean correctos y que tenga fondos suficientes. También puedes intentar con otra tarjeta o usar PayPal. Si el problema persiste, escríbenos por este chat y te ayudamos.',
  },
]

type Message = { sender: 'user' | 'bot' | 'admin'; content: string; created_at?: string }

const BOT_DELAY = 600

const playNotifSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'welcome' | 'form' | 'chat'>('welcome')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [humanRequested, setHumanRequested] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showFaqs, setShowFaqs] = useState(false)
  const [emailConsent, setEmailConsent] = useState(false)

  const isBusinessHours = (() => {
    const now = new Date()
    const peruHour = (now.getUTCHours() - 5 + 24) % 24
    return peruHour >= 8 && peruHour < 22
  })()
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  // Restaurar sesión de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gl_chat')
    if (saved) {
      const { chatId: cid, name: n, email: e } = JSON.parse(saved)
      setChatId(cid); setName(n); setEmail(e); setPhase('chat')
    }
  }, [])

  // Cargar mensajes cuando hay chatId
  useEffect(() => {
    if (!chatId) return
    fetch(`/api/chat?chat_id=${chatId}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
  }, [chatId])

  // Polling cada 3s para recibir respuestas del admin en tiempo real
  useEffect(() => {
    if (!chatId || phase !== 'chat') return
    const poll = async () => {
      const res = await fetch(`/api/chat?chat_id=${chatId}`)
      const { messages: msgs } = await res.json()
      if (!msgs) return
      setMessages(prev => {
        // Solo actualizar si hay mensajes nuevos
        if (msgs.length === prev.length) return prev
        const newMsgs = msgs.slice(prev.length)
        newMsgs.forEach((m: Message) => {
          if (m.sender === 'admin') {
            if (!open) { setUnread(u => u + 1); playNotifSound() }
            else playNotifSound()
          }
        })
        return msgs
      })
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [chatId, phase, open])

  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addBotMessage = (content: string) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', content }])
    }, BOT_DELAY)
  }

  const getBotResponse = (content: string, userMsgCount: number): string => {
    const lower = content.toLowerCase()
    if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas') || lower.includes('buen día') || lower.includes('buen dia'))
      return `¡Hola ${name}! Qué bueno que nos escribes. Un asesor de Giro Lab te atenderá muy pronto. ¿En qué podemos ayudarte?`
    if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto') || lower.includes('cuanto') || lower.includes('plan'))
      return `Entiendo tu consulta sobre precios, ${name}. Tenemos opciones desde totalmente gratuitas. Un asesor te dará todos los detalles de forma personalizada en breve.`
    if (lower.includes('urgente') || lower.includes('emergencia'))
      return `Entendemos que es urgente, ${name}. Ya notificamos a nuestro equipo con prioridad. Alguien te atenderá enseguida. También puedes hacer clic en "Hablar con un asesor".`
    if (lower.includes('gracias'))
      return `¡Con mucho gusto, ${name}! Nuestro equipo estará contigo muy pronto.`
    if (lower.includes('cita') || lower.includes('sesión') || lower.includes('agendar') || lower.includes('agenda'))
      return `Perfecto, ${name}. Coordinar una sesión con nuestros Menters es muy sencillo. Un asesor te guiará paso a paso en breve.`
    const defaults = [
      `Gracias por escribirnos, ${name}. Tu consulta es importante para nosotros. Ya notificamos a nuestro equipo y te responderán muy pronto.`,
      `Entendido, ${name}. Estamos revisando tu mensaje. Un asesor te atenderá en breve. ¿Hay algo más que quieras agregar mientras tanto?`,
      `Gracias por la información adicional, ${name}. Nuestro equipo ya está al tanto y te contactará pronto.`,
    ]
    return defaults[Math.min(userMsgCount, defaults.length - 1)]
  }

  const startChat = async () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_chat', user_name: name.trim(), user_email: email.trim(), user_id: user?.id || null, email_consent: emailConsent }),
    })
    const { chat_id } = await res.json()
    setChatId(chat_id)
    localStorage.setItem('gl_chat', JSON.stringify({ chatId: chat_id, name: name.trim(), email: email.trim() }))
    setPhase('chat')
    addBotMessage(`Hola ${name.trim()}, soy el asistente de Giro Lab. ¿En qué puedo ayudarte hoy?`)
  }

  const sendMessage = async (content: string, fromFaq = false) => {
    if (!content.trim() || !chatId || sending) return
    setSending(true)
    const userMsg: Message = { sender: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', chat_id: chatId, sender: 'user', content }),
    })
    if (fromFaq) {
      const faq = FAQS.find(f => f.question === content)
      if (faq) {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_message', chat_id: chatId, sender: 'bot', content: faq.answer }),
        })
        addBotMessage(faq.answer)
      }
    } else {
      const userMsgCount = messages.filter(m => m.sender === 'user').length
      const botReply = getBotResponse(content, userMsgCount)
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_message', chat_id: chatId, sender: 'bot', content: botReply }),
      })
      addBotMessage(botReply)
    }
    setSending(false)
  }

  const requestHuman = async () => {
    if (!chatId) return
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_human', chat_id: chatId }),
    })
    setHumanRequested(true)
    addBotMessage('Hemos notificado a un asesor. Te responderemos en este mismo chat en breve.')
  }

  const validForm = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #421869, #7b2fd4)',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(66,24,105,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
        )}
        {unread > 0 && !open && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#e53935', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
        )}
      </button>

      {/* Ventana del chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
          width: 360, maxWidth: 'calc(100vw - 32px)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          background: 'white', fontFamily: "'DM Sans', system-ui",
          maxHeight: '80vh',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #421869, #7b2fd4)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'Raleway, sans-serif' }}>Soporte Giro Lab</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isBusinessHours ? '#69f0ae' : '#ff7043', display: 'inline-block' }} />
                {isBusinessHours ? 'En línea · Respuesta en minutos' : 'Fuera de horario · Respondemos mañana'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>Lun–Dom 8:00am–10:00pm (Perú)</div>
            </div>
          </div>

          {/* Phase: welcome */}
          {phase === 'welcome' && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, fontSize: 15, color: '#333', lineHeight: 1.6 }}>
                Hola, estamos aquí para ayudarte. ¿Cómo quieres continuar?
              </p>
              <button onClick={() => setPhase('form')} style={btnStyle('#421869')}>Iniciar chat</button>
            </div>
          )}

          {/* Phase: form */}
          {phase === 'form' && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#555' }}>Antes de comenzar, dinos quién eres:</p>
              <input
                placeholder="Nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validForm && emailConsent && startChat()}
                style={inputStyle}
              />
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={emailConsent}
                  onChange={e => setEmailConsent(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#421869', flexShrink: 0 }}
                />
                Si no hay respuesta inmediata, nos permites escribirte a tu correo para darte seguimiento.
              </label>
              <button onClick={startChat} disabled={!validForm || !emailConsent} style={btnStyle(validForm && emailConsent ? '#421869' : '#ccc')}>
                Comenzar
              </button>
            </div>
          )}

          {/* Phase: chat */}
          {phase === 'chat' && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200, maxHeight: 380 }}>
                {messages.length === 0 && (
                  <p style={{ color: '#bbb', fontSize: 13, textAlign: 'center', margin: 'auto' }}>Iniciando conversación...</p>
                )}
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '10px 14px', borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: m.sender === 'user' ? '#421869' : m.sender === 'admin' ? '#7b2fd4' : '#f3e8ff',
                      color: m.sender === 'user' ? 'white' : m.sender === 'admin' ? 'white' : '#2d1b4e',
                      fontSize: 14, lineHeight: 1.5,
                    }}>
                      {m.sender === 'admin' && <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, opacity: 0.8 }}>ASESOR</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* FAQs toggle */}
              <div style={{ padding: '6px 12px', borderTop: '1px solid #f0f0f0' }}>
                <button onClick={() => setShowFaqs(v => !v)}
                  style={{ fontSize: 12, color: '#6a1b9a', background: 'none', border: '1px solid #e0d4f7', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6a1b9a" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
                  Preguntas frecuentes
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6a1b9a" strokeWidth="2.5" strokeLinecap="round" style={{ transform: showFaqs ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {showFaqs && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {FAQS.map(f => (
                      <button key={f.question} onClick={() => { sendMessage(f.question, true); setShowFaqs(false) }}
                        style={{ fontSize: 12, padding: '5px 10px', borderRadius: 20, border: '1px solid #e0d4f7', background: 'white', color: '#6a1b9a', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                        {f.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  style={{ ...inputStyle, margin: 0, flex: 1, padding: '9px 12px', fontSize: 13 }}
                />
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || sending}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: input.trim() ? '#421869' : '#e0e0e0', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                </button>
              </div>

              {/* Hablar con asesor */}
              {!humanRequested && (
                <div style={{ padding: '8px 12px 14px', textAlign: 'center' }}>
                  <button onClick={requestHuman} style={{ fontSize: 12, color: '#421869', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans' }}>
                    Hablar con un asesor
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '12px', borderRadius: 30, border: 'none',
  background: bg, color: 'white', fontWeight: 700,
  fontSize: 14, cursor: bg === '#ccc' ? 'not-allowed' : 'pointer',
  fontFamily: 'Raleway, sans-serif',
})

const inputStyle: React.CSSProperties = {
  padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #e0e0e0', fontSize: 14,
  fontFamily: 'DM Sans, system-ui', outline: 'none',
  width: '100%', boxSizing: 'border-box',
  color: '#1a1a1a', background: 'white',
}
