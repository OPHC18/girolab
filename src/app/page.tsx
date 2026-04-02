'use client'

import { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { UserIcon, BuildingOffice2Icon, SparklesIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/app/lib/supabase'

type Role = 'persona' | 'empresa' | 'menter' | null
type Step = 'roles' | 'diagnostico' | 'cuenta' | 'login'

const preguntasPersona = [
  {
    id: 'motivo',
    pregunta: '¿Cuál es tu motivo principal hoy?',
    subtexto: 'Puedes elegir más de uno',
    multiple: true,
    opciones: [
      'Ansiedad y Estrés', 'Depresión', 'Estado de Ánimo', 'Relaciones de Pareja',
      'Familia', 'Duelo y Pérdida', 'Autoestima', 'Trauma', 'TCA', 'Apoyo LGBTIQ+', 'Burnout Laboral', 'Propósitos',
      'Bloqueo Emocional', 'Bloqueo Energético', 'Crecimiento Personal', 'Otros',
    ],
    campoExtra: true,
  },
 
  {
    id: 'preferencias',
    pregunta: '¿Qué tipo de sesión prefieres?',
    subtexto: 'Elige una opción',
    multiple: false,
    opciones: ['Individual', 'Pareja', 'Grupal'],
  },
  {
    id: 'genero',
    pregunta: '¿Prefieres trabajar con...?',
    subtexto: 'Elige una opción',
    multiple: false,
    opciones: ['Mujer', 'Hombre', 'Me es indiferente'],
  },
  {
    id: 'experiencia_previa',
    pregunta: '¿Has tenido sesiones o terapias antes?',
    subtexto: 'Elige una opción',
    multiple: false,
    opciones: ['Sí', 'No'],
  },
]

const preguntasEmpresa = [
  {
    id: 'areas',
    pregunta: '¿En qué áreas necesitan un giro?',
    subtexto: 'Puedes elegir más de uno',
    multiple: true,
    opciones: [
      'Cultura y Clima Organizacional', 'Salud Mental Laboral', 'Productividad y Rendimiento',
      'Trabajo en Equipo', 'Liderazgo Consciente', 'Gestión del Cambio', 'Innovación', 'Consultoría',
      'Diversidad e Inclusión', 'Ventas y Negociación', 'Comunicación Interna', 'Bienestar Integral',
    ],
  },
  {
    id: 'tamano',
    pregunta: '¿Cuál es el tamaño de tu empresa?',
    subtexto: 'Elige una opción',
    multiple: false,
    opciones: ['1–20 colaboradores', '21–100 colaboradores', '101–500 colaboradores', '+500 colaboradores'],
  },
  {
    id: 'modalidad',
    pregunta: '¿Qué modalidad prefieren?',
    subtexto: 'Elige una opción',
    multiple: false,
    opciones: ['Presencial', 'Virtual', 'Híbrida'],
  },
  {
    id: 'bienestar_previo',
    pregunta: '¿Han tenido programas de bienestar antes?',
    subtexto: 'Elige una opción',
    multiple: false,
    opciones: ['Sí', 'No', 'Estamos en proceso'],
  },
]

const preguntasMenter = [
  {
    id: 'especialidades',
    pregunta: '¿Cuáles son tus especialidades?',
    subtexto: 'Puedes elegir más de uno',
    multiple: true,
    opciones: [
      'Psicoterapia', 'Organizacional', 'Coaching', 'Mentoría de Negocios',
      'Terapia de Pareja', 'Terapia Familiar', 'Mindfulness', 'Desarrollo Personal',
      'Reiki', 'Diversidad e Inclusión', 'Nutrición y Hábitos', 'Neurociencia Aplicada',
      'Propósito de Vida', 'Cirugía Astral', 'Apometría', 'Barra de Access',
      'Masoterapia', 'Registros Akáshicos', 'Constelaciones', 'Regresiones',
      'Astrología', 'Numerología', 'Gestalt', 'Otros',
    ],
    campoExtra: true,
  },
  {
      id: 'experiencia_menter',
  pregunta: '¿Cuántos años de experiencia tienes?',
  subtexto: 'Elige una opción',
  multiple: false,
  opciones: ['1–3 años', '3–5 años', '5–10 años', 'Más de 10 años'],
  },
]

const paises = [
  "Afganistán","Albania","Alemania","Andorra","Angola","Antigua y Barbuda","Arabia Saudita","Argelia","Argentina","Armenia","Australia","Austria","Azerbaiyán","Bahamas","Bangladés","Barbados","Baréin","Bélgica","Belice","Benín","Bielorrusia","Birmania","Bolivia","Bosnia y Herzegovina","Botsuana","Brasil","Brunéi","Bulgaria","Burkina Faso","Burundi","Bután","Cabo Verde","Camboya","Camerún","Canadá","Catar","Chad","Chile","China","Chipre","Ciudad del Vaticano","Colombia","Comoras","Corea del Norte","Corea del Sur","Costa de Marfil","Costa Rica","Croacia","Cuba","Dinamarca","Dominica","Ecuador","Egipto","El Salvador","Emiratos Árabes Unidos","Eritrea","Eslovaquia","Eslovenia","España","Estados Unidos","Estonia","Etiopía","Filipinas","Finlandia","Fiyi","Francia","Gabón","Gambia","Georgia","Ghana","Granada","Grecia","Guatemala","Guyana","Guinea","Guinea ecuatorial","Guinea-Bisáu","Haití","Honduras","Hungría","India","Indonesia","Irak","Irán","Irlanda","Islandia","Islas Marshall","Islas Salomón","Israel","Italia","Jamaica","Japón","Jordania","Kazajistán","Kenia","Kirguistán","Kiribati","Kuwait","Laos","Lesoto","Letonia","Líbano","Liberia","Libia","Liechtenstein","Lituania","Luxemburgo","Macedonia del Norte","Madagascar","Malasia","Malaui","Maldivas","Malí","Malta","Marruecos","Mauricio","Mauritania","México","Micronesia","Moldavia","Mónaco","Mongolia","Montenegro","Mozambique","Namibia","Nauru","Nepal","Nicaragua","Níger","Nigeria","Noruega","Nueva Zelanda","Omán","Países Bajos","Pakistán","Palaos","Panamá","Papúa Nueva Guinea","Paraguay","Perú","Polonia","Portugal","Reino Unido","República Centroafricana","República Checa","República del Congo","República Democrática del Congo","República Dominicana","Ruanda","Rumania","Rusia","Samoa","San Cristóbal y Nieves","San Marino","San Vicente y las Granadinas","Santa Lucía","Santo Tomé y Príncipe","Senegal","Serbia","Seychelles","Sierra Leona","Singapur","Siria","Somalia","Sri Lanka","Suazilandia","Sudáfrica","Sudán","Sudán del Sur","Suecia","Suiza","Surinam","Tailandia","Tanzania","Tayikistán","Timor Oriental","Togo","Tonga","Trinidad y Tobago","Túnez","Turkmenistán","Turquía","Tuvalu","Ucrania","Uganda","Uruguay","Uzbekistán","Vanuatu","Venezuela","Vietnam","Yemen","Yibuti","Zambia","Zimbabue"
]

const rolesConfig = [
  { key: 'persona' as Role, label: 'Personas', desc: 'Quiero crecer y transformar mi vida', hoverBg: '#421869', iconColor: '#421869', Icon: UserIcon },
  { key: 'empresa' as Role, label: 'Empresas', desc: 'Quiero transformar mi organización', hoverBg: '#995bd5', iconColor: '#995bd5', Icon: BuildingOffice2Icon },
  { key: 'menter' as Role, label: 'Menters', desc: 'Quiero acompañar a otros en su giro', hoverBg: '#ffa719', iconColor: '#ffa719', Icon: SparklesIcon },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  backdropFilter: 'blur(8px)',
  fontFamily: 'DM Sans, sans-serif',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  color: 'white',
}

export default function Home() {
  // ── ESTADOS ──────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [visible, setVisible] = useState(true)
  const [step, setStep] = useState<Step>('roles')
  const [role, setRole] = useState<Role>(null)
  const [loginEmail, setLoginEmail] = useState('')
const [loginPassword, setLoginPassword] = useState('')
const [loginError, setLoginError] = useState('')
const [loginLoading, setLoginLoading] = useState(false)
  const [preguntaIndex, setPreguntaIndex] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string[]>>({})
  const [hovered, setHovered] = useState<string | null>(null)
  const [mostrarModalOtros, setMostrarModalOtros] = useState(false)
  const [especialidadesOtros, setEspecialidadesOtros] = useState('')
  const [experienciaTexto, setExperienciaTexto] = useState('')
  const [form, setForm] = useState({ nombre: '', apellidos: '', empresa: '', cargo: '', email: '', telefono: '', pais: '', password: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // ── EFECTOS ───────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2700)
    const t2 = setTimeout(() => setLoading(false), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // ── DERIVADOS ─────────────────────────────────────────
  const preguntas = role === 'persona' ? preguntasPersona : role === 'empresa' ? preguntasEmpresa : preguntasMenter
  const preguntaActual = preguntas[preguntaIndex]
  const esExperiencia = preguntaActual?.id === 'experiencia_previa' || preguntaActual?.id === 'bienestar_previo' || preguntaActual?.id === 'experiencia_menter'
  const totalPasos = preguntas.length + 2
  const pasoActual = step === 'roles' ? 1 : step === 'diagnostico' ? preguntaIndex + 2 : totalPasos
  const respuestaActual = preguntaActual ? (respuestas[preguntaActual.id] || []) : []
  const puedeAvanzar = respuestaActual.length > 0

  // ── FUNCIONES ─────────────────────────────────────────
  const cambiarStep = (fn: () => void) => {
    setVisible(false)
    setTimeout(() => {
      fn()
      setTimeout(() => setVisible(true), 50)
    }, 250)
  }

  const handleContinuar = () => {
    cambiarStep(() => {
      if (preguntaIndex < preguntas.length - 1) {
        setPreguntaIndex(prev => prev + 1)
      } else {
        setStep('cuenta')
      }
    })
  }

  const handleBack = () => {
    cambiarStep(() => {
      if (step === 'diagnostico' && preguntaIndex > 0) {
        setPreguntaIndex(prev => prev - 1)
      } else if (step === 'diagnostico') {
        setStep('roles')
        setRole(null)
      } else if (step === 'cuenta') {
        setStep('diagnostico')
        setPreguntaIndex(preguntas.length - 1)
      } else if (step === 'login') {
        setStep('roles')
      }
    })
  }

const toggleOpcion = (opcion: string) => {
  const id = preguntaActual.id
  const prev = respuestas[id] || []
  if (opcion === 'Otros' && (id === 'especialidades' || id === 'motivo')) {
    setMostrarModalOtros(true)
    return
  }
  if (preguntaActual.multiple) {
    setRespuestas({ ...respuestas, [id]: prev.includes(opcion) ? prev.filter(o => o !== opcion) : [...prev, opcion] })
  } else {
    setRespuestas({ ...respuestas, [id]: [opcion] })
    if (!esExperiencia) {
      if (preguntaIndex < preguntas.length - 1) {
        setTimeout(() => cambiarStep(() => setPreguntaIndex(prev => prev + 1)), 300)
      } else {
        setTimeout(() => cambiarStep(() => setStep('cuenta')), 300)
      }
    }
  }
}

  const handleCrearCuenta = async () => {
    const errors: Record<string, string> = {}
    if (!form.nombre.trim()) errors.nombre = 'Nombre es requerido'
    if (!form.apellidos.trim()) errors.apellidos = 'Apellidos son requeridos'
    if (role === 'empresa') {
      if (!form.empresa.trim()) errors.empresa = 'Nombre de la empresa es requerido'
      if (!form.cargo.trim()) errors.cargo = 'Cargo es requerido'
    }
    if (!form.email.trim()) errors.email = 'Correo electrónico es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.emailFormat = 'Correo electrónico no válido'
    if (!form.telefono.trim()) errors.telefono = 'Teléfono es requerido'
    if (!form.pais) errors.pais = 'País es requerido'
    if (!form.password.trim()) errors.password = 'Contraseña es requerida'
    else if (form.password.length < 8) errors.passwordLength = 'La contraseña debe tener al menos 8 caracteres'
    setFormErrors(errors)
    if (Object.keys(errors).length === 0) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        nombre: form.nombre,
        apellidos: form.apellidos,
        empresa: form.empresa || null,
        cargo: form.cargo || null,
        telefono: form.telefono,
        pais: form.pais,
        role: role,
        respuestas: respuestas,
        experiencia: experienciaTexto || null,
      }
    }
  })
  if (error) {
    setFormErrors({ general: error.message })
  } else {
const params = new URLSearchParams(window.location.search)
const returnUrl = params.get('returnUrl')
window.location.href = returnUrl || '/dashboard'
  }
}
    
  }

  const handleLogin = async () => {
  setLoginError('')
  if (!loginEmail.trim() || !loginPassword.trim()) {
    setLoginError('Por favor ingresa tu correo y contraseña')
    return
  }
  setLoginLoading(true)
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: loginPassword,
  })
  setLoginLoading(false)
  if (error) {
    setLoginError('Correo o contraseña incorrectos')
  } else {
    console.log('Login exitoso ✓')
    const params = new URLSearchParams(window.location.search)
const returnUrl = params.get('returnUrl')
window.location.href = returnUrl || '/dashboard'
  }
}

const handleGoogleAuth = async () => {
  if (role) {
    localStorage.setItem('pendingRole', role)
  }
  // Guarda el returnUrl para después del OAuth
  const params = new URLSearchParams(window.location.search)
  const returnUrl = params.get('returnUrl')
  if (returnUrl) {
    localStorage.setItem('returnUrl', returnUrl)
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    }
  })
  if (error) console.error('Google auth error:', error)
}
  // ── PRELOADER ─────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] gap-4"
        style={{ transition: 'opacity 0.5s ease', opacity: fadeOut ? 0 : 1 }}
      >
        <DotLottieReact
          src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie"
          autoplay loop
          style={{ width: 100, height: 100 }}
        />
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}.blink{animation:blink 1.5s ease-in-out infinite}`}</style>
        <p className="blink" style={{ color: '#421869', fontWeight: 600, letterSpacing: '0.15em', fontSize: 12, textTransform: 'uppercase' }}>
          Cargando tu Giro...
        </p>
      </div>
    )
  }

  // ── RENDER ────────────────────────────────────────────
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ backgroundImage: "url('/Pantallas.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: '#421869', mixBlendMode: 'multiply', opacity: 0.9 }} />

      <style>{`
        @media (max-width: 600px) { .grid-opciones { grid-template-columns: repeat(2,1fr) !important; } }
        select option { background-color: #2d1a4a; color: white; }
        select { color: white !important; }
        input::placeholder { color: rgba(255,255,255,0.5); }
        textarea::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>

      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{ maxWidth: 780, transition: 'opacity 0.25s ease', opacity: visible ? 1 : 0 }}
      >
        {/* Lottie logo */}
        <div style={{ marginBottom: 12 }}>
          <DotLottieReact
            src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie"
            autoplay loop
            style={{ width: 70, height: 70 }}
          />
        </div>

        {/* Barra de progreso */}
        {step !== 'roles' && step !== 'login' && (
          <div className="w-full" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
                Paso {pasoActual - 1} de {totalPasos - 1}
              </span>
              <span style={{ color: '#ffa719', fontSize: 11, fontWeight: 700 }}>
                {Math.round(((pasoActual - 1) / (totalPasos - 1)) * 100)}%
              </span>
            </div>
            <div style={{ width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
              <div style={{ height: 3, borderRadius: 99, backgroundColor: '#ffa719', width: `${((pasoActual - 1) / (totalPasos - 1)) * 100}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* ── STEP: ROLES ── */}
        {step === 'roles' && (
          <>
            <div className="text-center w-full" style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 'clamp(24px,5vw,40px)', fontWeight: 700, color: 'white', marginBottom: 12 }}>
                Dale un <span style={{ color: '#ffa719' }}>Giro</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                Dínos quién eres y cómo podemos ayudarte
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, width: '100%', marginBottom: 20 }}>
              {rolesConfig.map(({ key, label, desc, hoverBg, iconColor, Icon }) => {
                const isH = hovered === key
                return (
                  <button key={key!}
                    onMouseEnter={() => setHovered(key!)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => cambiarStep(() => { setRole(key); setStep('diagnostico') })}
                    style={{ backgroundColor: isH ? hoverBg : 'white', border: `2px solid ${isH ? hoverBg : 'transparent'}`, borderRadius: 16, padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.3s', boxShadow: isH ? '0 12px 32px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Icon style={{ width: 44, height: 44, color: isH ? 'white' : iconColor, transition: 'color 0.3s' }} strokeWidth={1.5} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: 16, color: isH ? 'white' : '#421869', transition: 'color 0.3s' }}>{label}</div>
                      <div style={{ fontSize: 12, color: isH ? 'rgba(255,255,255,0.8)' : '#4d4d4d', marginTop: 4, lineHeight: 1.5, transition: 'color 0.3s' }}>{desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => cambiarStep(() => setStep('login'))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffa719', fontWeight: 700, fontSize: 15, padding: 0 }}>
                Inicia sesión
              </button>
            </p>
          </>
        )}

        {/* ── STEP: DIAGNÓSTICO ── */}
        {step === 'diagnostico' && preguntaActual && (
          <>
            <div className="text-center w-full" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {preguntaActual.pregunta}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>{preguntaActual.subtexto}</p>
            </div>

            <div
              className="grid-opciones"
              style={{
                display: 'grid',
                gridTemplateColumns: preguntaActual.opciones.length <= 4
                  ? `repeat(${preguntaActual.opciones.length}, 1fr)`
                  : 'repeat(4, 1fr)',
                gap: 10,
                width: '100%',
                marginBottom: esExperiencia ? 12 : 20,
              }}
            >
              {preguntaActual.opciones.map(opcion => {
                const sel = respuestaActual.includes(opcion)
                return (
                  <button key={opcion} onClick={() => toggleOpcion(opcion)}
                    style={{ backgroundColor: sel ? '#ffa719' : 'rgba(255,255,255,0.1)', color: sel ? '#2d2926' : 'white', border: `1px solid ${sel ? '#ffa719' : 'rgba(255,255,255,0.2)'}`, borderRadius: 12, padding: '12px 10px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
                    {opcion}
                  </button>
                )
              })}
            </div>

            {esExperiencia && (
              <textarea
                value={experienciaTexto}
                onChange={e => setExperienciaTexto(e.target.value)}
                placeholder="¿Quieres contarnos tu experiencia? (Opcional)"
                rows={3}
                style={{ ...inputStyle, marginBottom: 20, resize: 'none' }}
              />
            )}

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button onClick={handleBack}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                ← Atrás
              </button>
              {(preguntaActual.multiple || esExperiencia || respuestaActual.length > 0) && (
                <button onClick={handleContinuar} disabled={!puedeAvanzar}
                  style={{ flex: 3, padding: '14px', borderRadius: 12, border: 'none', backgroundColor: puedeAvanzar ? '#995bd5' : 'rgba(255,255,255,0.2)', color: puedeAvanzar ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 700, cursor: puedeAvanzar ? 'pointer' : 'not-allowed', fontSize: 14, fontFamily: 'Raleway,sans-serif', transition: 'all 0.2s' }}>
                  Continuar →
                </button>
              )}
            </div>

            {/* Modal Otros */}
            {mostrarModalOtros && (
              <div
                className="absolute inset-0 flex items-center justify-center z-50"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={() => setMostrarModalOtros(false)}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ backgroundColor: '#2d1a4a', borderRadius: 20, padding: 32, width: '90%', maxWidth: 460, border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <h3 style={{ fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 8 }}>
                    Agrega tus especialidades
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>
                    Escribe una o varias separadas por coma
                  </p>
                  <textarea
                    value={especialidadesOtros}
                    onChange={e => setEspecialidadesOtros(e.target.value)}
                    placeholder="Ej: Terapia Transpersonal, Constelaciones Familiares..."
                    rows={4}
                    style={{ ...inputStyle, resize: 'none', marginBottom: 16 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setMostrarModalOtros(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
  if (especialidadesOtros.trim()) {
    const key = preguntaActual?.id === 'motivo' ? 'motivo_otros' : 'especialidades_otros'
    setRespuestas({ ...respuestas, [key]: [especialidadesOtros.trim()] })
  }
  setMostrarModalOtros(false)
}}
                      style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#ffa719', color: '#2d2926', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Raleway,sans-serif' }}
                    >
                      Guardar →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── STEP: CUENTA ── */}
        {step === 'cuenta' && (
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
            <div className="text-center w-full" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color: 'white', marginBottom: 8 }}>
                Casi listos 🎉
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
                Déjanos tus datos para encontrar tu match perfecto
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginBottom: 20 }}>

              {/* Fila 1: Nombre y Apellidos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    placeholder="Nombre *"
                    value={form.nombre}
                    onChange={e => { setForm({ ...form, nombre: e.target.value }); setFormErrors({ ...formErrors, nombre: '' }) }}
                    style={{ ...inputStyle, border: formErrors.nombre ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                  />
                  {formErrors.nombre && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.nombre}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    placeholder="Apellidos *"
                    value={form.apellidos}
                    onChange={e => { setForm({ ...form, apellidos: e.target.value }); setFormErrors({ ...formErrors, apellidos: '' }) }}
                    style={{ ...inputStyle, border: formErrors.apellidos ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                  />
                  {formErrors.apellidos && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.apellidos}</p>}
                </div>
              </div>

              {/* Fila 2: Empresa y Cargo — solo Empresas */}
              {role === 'empresa' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input
                      placeholder="Nombre de la empresa *"
                      value={form.empresa}
                      onChange={e => { setForm({ ...form, empresa: e.target.value }); setFormErrors({ ...formErrors, empresa: '' }) }}
                      style={{ ...inputStyle, border: formErrors.empresa ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                    />
                    {formErrors.empresa && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.empresa}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input
                      placeholder="Cargo *"
                      value={form.cargo}
                      onChange={e => { setForm({ ...form, cargo: e.target.value }); setFormErrors({ ...formErrors, cargo: '' }) }}
                      style={{ ...inputStyle, border: formErrors.cargo ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                    />
                    {formErrors.cargo && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.cargo}</p>}
                  </div>
                </div>
              )}

              {/* Fila 3: Correo y Teléfono */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    placeholder="Correo electrónico *"
                    type="email"
                    value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); setFormErrors({ ...formErrors, email: '', emailFormat: '' }) }}
                    style={{ ...inputStyle, border: (formErrors.email || formErrors.emailFormat) ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                  />
                  {(formErrors.email || formErrors.emailFormat) && (
                    <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.email || formErrors.emailFormat}</p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    placeholder="Teléfono (ej: +51 987 654 321) *"
                    type="tel"
                    value={form.telefono}
                    onChange={e => { setForm({ ...form, telefono: e.target.value }); setFormErrors({ ...formErrors, telefono: '' }) }}
                    style={{ ...inputStyle, border: formErrors.telefono ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                  />
                  {formErrors.telefono && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.telefono}</p>}
                </div>
              </div>

              {/* País */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <select
                  value={form.pais}
                  onChange={e => { setForm({ ...form, pais: e.target.value }); setFormErrors({ ...formErrors, pais: '' }) }}
                  style={{ ...selectStyle, border: formErrors.pais ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                >
                  <option value="">Selecciona tu país *</option>
                  {paises.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {formErrors.pais && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.pais}</p>}
              </div>

              {/* Contraseña */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    placeholder="Contraseña * (mínimo 8 caracteres)"
                    type={mostrarPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => { setForm({ ...form, password: e.target.value }); setFormErrors({ ...formErrors, password: '', passwordLength: '' }) }}
                    style={{ ...inputStyle, border: (formErrors.password || formErrors.passwordLength) ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)', paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 0, display: 'flex', alignItems: 'center' }}>
                    {mostrarPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {(formErrors.password || formErrors.passwordLength) && (
                  <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.password || formErrors.passwordLength}</p>
                )}
              </div>


            </div>

                          {/* Divisor */}
<div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginBottom: 12 }}>
  <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>o continúa con</span>
  <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
</div>

{/* Botón Google */}
<button
  onClick={handleGoogleAuth}
  style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}
>
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
  Continuar con Google
</button>

            {Object.values(formErrors).some(e => e !== '') && (
              <div style={{ width: '100%', backgroundColor: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 600 }}>
  {formErrors.general || 'Por favor completa todos los campos requeridos.'}
</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button onClick={handleBack}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                ← Atrás
              </button>

              <button onClick={handleCrearCuenta}
                style={{ flex: 3, padding: '14px', borderRadius: 12, border: 'none', backgroundColor: '#ffa719', color: '#2d2926', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Raleway,sans-serif' }}>
                Crear mi cuenta →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: LOGIN ── */}
        {step === 'login' && (
          <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
            <div className="text-center w-full" style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color: 'white', marginBottom: 8 }}>
                ¡Bienvenido!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
                Inicia sesión para continuar tu Giro
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginBottom: 20 }}>
<input
  placeholder="Correo electrónico *"
  type="email"
  value={loginEmail}
  onChange={e => setLoginEmail(e.target.value)}
  style={{ ...inputStyle }}
/>
<div style={{ position: 'relative' }}>
  <input
    placeholder="Contraseña *"
    type={mostrarPassword ? 'text' : 'password'}
    value={loginPassword}
    onChange={e => setLoginPassword(e.target.value)}
    style={{ ...inputStyle, paddingRight: 44 }}
  />
                <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: -4 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 15 }}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

{loginError && (
  <div style={{ width: '100%', backgroundColor: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
    <p style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 600 }}>{loginError}</p>
  </div>
)}

            <button
  onClick={handleLogin}
  disabled={loginLoading}
  style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', backgroundColor: loginLoading ? 'rgba(255,167,25,0.5)' : '#ffa719', color: '#2d2926', fontWeight: 700, cursor: loginLoading ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: 'Raleway,sans-serif', marginBottom: 12 }}
>
  {loginLoading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>o continúa con</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </div>

            <button onClick={handleGoogleAuth} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, backdropFilter: 'blur(8px)' }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              
              Continuar con Google
            </button>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' }}>
              ¿No tienes cuenta?{' '}
              <button onClick={() => cambiarStep(() => setStep('roles'))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffa719', fontWeight: 700, fontSize: 15, padding: 0 }}>
                Regístrate
              </button>
            </p>
          </div>
        )}

      </div>
    </main>
  )
}