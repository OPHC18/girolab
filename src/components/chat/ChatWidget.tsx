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
]

type Message = { sender: 'user' | 'bot' | 'admin'; content: string; created_at?: string }

const BOT_DELAY = 600

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

  // Realtime subscription
  useEffect(() => {
    if (!chatId) return
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${chatId}`,
      }, payload => {
        const msg = payload.new as Message
        if (msg.sender === 'admin') {
          setMessages(prev => [...prev, msg])
          if (!open) setUnread(u => u + 1)
        }
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [chatId, open])

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

  const startChat = async () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_chat', user_name: name.trim(), user_email: email.trim(), user_id: user?.id || null }),
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
      addBotMessage('Gracias por tu mensaje. Un asesor te responderá pronto. Si prefieres una respuesta inmediata, haz clic en "Hablar con asesor".')
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
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Respuesta en minutos</div>
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
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Tu correo electrónico"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validForm && startChat()}
                style={inputStyle}
              />
              <button onClick={startChat} disabled={!validForm} style={btnStyle(validForm ? '#421869' : '#ccc')}>
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
                      background: m.sender === 'user' ? '#421869' : m.sender === 'admin' ? '#1b5e20' : '#f3e8ff',
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

              {/* FAQs */}
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 11, color: '#999', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Preguntas frecuentes</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {FAQS.map(f => (
                    <button key={f.question} onClick={() => sendMessage(f.question, true)}
                      style={{ fontSize: 12, padding: '5px 10px', borderRadius: 20, border: '1px solid #e0d4f7', background: 'white', color: '#6a1b9a', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                      {f.question}
                    </button>
                  ))}
                </div>
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
}
