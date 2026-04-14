'use client'

import { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { UserIcon, BuildingOffice2Icon, SparklesIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/app/lib/supabase'
import { dispararEmail } from '@/lib/email/send'
import { getRecaptchaToken, verifyRecaptcha } from '@/lib/recaptcha'

type Role = 'persona' | 'empresa' | 'menter' | null
type Step = 'landing' | 'roles' | 'diagnostico' | 'cuenta' | 'login' | 'confirmar_email'

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
  padding: '10px 14px',
  borderRadius: 10,
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
  // Si viene con ?registro=1, saltar preloader y landing directamente al onboarding
  const isRegistroDirecto = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registro') === '1'
  const [loading, setLoading] = useState(!isRegistroDirecto)
  const [fadeOut, setFadeOut] = useState(false)
  const [visible, setVisible] = useState(true)
  const [navScrolled, setNavScrolled] = useState(false)
  const [activeProfile, setActiveProfile] = useState<'persona' | 'empresa'>('persona')
  const [menterModal, setMenterModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const start = window.scrollY
    const end = el.getBoundingClientRect().top + window.scrollY - 80
    const duration = 1400
    const t0 = performance.now()
    const ease = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, start + (end - start) * ease(p))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  const [step, setStep] = useState<Step>(isRegistroDirecto ? 'roles' : 'landing')
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
  const [form, setForm] = useState({ nombre: '', apellidos: '', empresa: '', cargo: '', email: '', telefono: '', pais: '', password: '', cumpleanos: '' })
  const [focusCumpleanos, setFocusCumpleanos] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // ── EFECTOS ───────────────────────────────────────────
  useEffect(() => {
    // Guardar returnUrl al llegar desde un perfil de Menter con ?registro=1
    if (isRegistroDirecto) {
      const params = new URLSearchParams(window.location.search)
      const returnUrl = params.get('returnUrl')
      if (returnUrl) localStorage.setItem('returnUrl', returnUrl)
    }
  }, [])

  useEffect(() => {
    if (isRegistroDirecto) return  // no preloader para flujo directo
    const t1 = setTimeout(() => setFadeOut(true), 2700)
    const t2 = setTimeout(() => setLoading(false), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
    if (!form.cumpleanos) errors.cumpleanos = 'Fecha de nacimiento es requerida'
    if (!form.password.trim()) errors.password = 'Contraseña es requerida'
    else if (form.password.length < 8) errors.passwordLength = 'La contraseña debe tener al menos 8 caracteres'
    setFormErrors(errors)
    if (Object.keys(errors).length === 0) {
  // Verificar reCAPTCHA v3 (solo bloquea si el token existe y el score es bajo)
  // reCAPTCHA v3 — no bloqueante mientras el dominio no esté registrado en Google Console
  const token = await getRecaptchaToken('registro')
  if (token) {
    const ok = await verifyRecaptcha(token, 'registro')
    if (!ok) console.warn('[recaptcha] verificación fallida en registro — se continúa igual')
  }
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'}/dashboard`,
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
    // Crear fila en user_profiles con todos los datos del registro
    if (data.user) {
      await supabase.from('user_profiles').insert({
        user_id:    data.user.id,
        telefono:   form.telefono,
        pais:       form.pais,
        cumpleanos: form.cumpleanos,
        empresa:    form.empresa || null,
        cargo:      form.cargo   || null,
      })
    }
    // Email de bienvenida Día 1 — diferido hasta después de confirmar email
    // (no hay sesión autenticada hasta que el usuario confirme el link)
    localStorage.setItem('pendingWelcomeEmail', JSON.stringify({
      userName:  `${form.nombre} ${form.apellidos}`,
      userEmail: form.email,
    }))
    cambiarStep(() => setStep('confirmar_email'))
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
  // reCAPTCHA v3: solo logging, no bloquea login.
  // Supabase ya maneja rate-limiting y seguridad de auth.
  getRecaptchaToken('login').then(token => {
    if (token) verifyRecaptcha(token, 'login').catch(() => {})
  })
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
  // Marcar que hay un welcome email pendiente (se enviará después del modal, cuando tengamos el nombre)
  localStorage.setItem('pendingWelcomeEmail', '1')
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
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'white', transition: 'opacity 0.5s ease', opacity: fadeOut ? 0 : 1 }}
      >
        <DotLottieReact
          src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie"
          loop
          autoplay
          style={{ width: 120, height: 120 }}
        />
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}.blink{animation:blink 1.5s ease-in-out infinite}`}</style>
        <p className="blink" style={{ color: '#421869', fontWeight: 600, letterSpacing: '0.15em', fontSize: 12, textTransform: 'uppercase' }}>
          Cargando tu Giro...
        </p>
      </div>
    )
  }

  // ── LANDING PAGE ──────────────────────────────────────
  if (step === 'landing') {
    const irARegistro = () => cambiarStep(() => setStep('roles'))
    const irALogin    = () => cambiarStep(() => setStep('login'))

    return (
      <main style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: '#0d0618', color: 'white', overflowX: 'hidden' }}>
        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          .land-fade { animation: fadeUp 0.7s ease forwards; }
          .land-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(66,24,105,0.5) !important; }
          .land-card { transition: transform 0.3s, box-shadow 0.3s; }
          .land-btn-primary:hover { background: #e5951a !important; }
          .land-btn-ghost:hover { background: rgba(255,255,255,0.1) !important; }
          .grecaptcha-badge { visibility: hidden !important; }
          .wa-btn:hover { transform: scale(1.08); box-shadow: 0 8px 24px rgba(37,211,102,0.45) !important; }
          .nav-desktop-btns { display: flex; gap: 12px; }
          .nav-hamburger { display: none; }
          @media (max-width: 600px) {
            .nav-desktop-btns { display: none; }
            .nav-hamburger { display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; width: 42px; height: 42px; cursor: pointer; flex-direction: column; gap: 5px; padding: 8px; }
            .nav-hamburger span { display: block; width: 22px; height: 2px; background: white; border-radius: 2px; transition: all 0.2s; }
            .nav-mobile-menu { position: fixed; top: 64px; left: 0; right: 0; background: rgba(13,6,24,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; z-index: 99; }
          }
        `}</style>

        {/* BOTÓN WHATSAPP FIJO */}
        <a href="https://wa.me/51999999999?text=Hola%2C%20necesito%20ayuda%20con%20Giro%20Lab" target="_blank" rel="noopener noreferrer" className="wa-btn"
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, width: 56, height: 56, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,211,102,0.4)', transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: navScrolled ? 'blur(16px)' : 'none', background: navScrolled ? 'rgba(13,6,24,0.88)' : 'transparent', borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.08)' : 'none', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.35s ease, backdrop-filter 0.35s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo: solo lottie centrado */}
            <div style={{ background: 'white', borderRadius: 14, width: 130, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <DotLottieReact src="https://lottie.host/321372e0-85e2-4f73-b0f6-8d625c53da52/iW77hiuv8h.lottie" loop autoplay style={{ width: 100, height: 100, marginTop: 15, }} />
            </div>
          </div>
          {/* Desktop buttons */}
          <div className="nav-desktop-btns">
            <button onClick={irALogin} className="land-btn-ghost" style={{ padding: '9px 20px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Iniciar sesión
            </button>
            <button onClick={irARegistro} className="land-btn-primary" style={{ padding: '9px 22px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
              Crear cuenta
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="nav-hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menú">
            <span />
            <span />
            <span />
          </button>
        </nav>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <button onClick={() => { setMobileMenuOpen(false); irALogin() }} className="land-btn-ghost" style={{ padding: '12px 20px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', textAlign: 'center' }}>
              Iniciar sesión
            </button>
            <button onClick={() => { setMobileMenuOpen(false); irARegistro() }} className="land-btn-primary" style={{ padding: '12px 22px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', textAlign: 'center' }}>
              Crear cuenta
            </button>
          </div>
        )}

        {/* HERO */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px', backgroundImage: "url('/Pantallas.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,6,24,0.75) 0%, rgba(66,24,105,0.85) 60%, #0d0618 100%)' }} />
          <div className="land-fade" style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,167,25,0.15)', border: '1px solid rgba(255,167,25,0.4)', borderRadius: 30, padding: '6px 18px', fontSize: 13, fontWeight: 600, color: '#ffa719', marginBottom: 24, letterSpacing: '0.05em' }}>
              Bienestar con propósito
            </div>
            <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-1px' }}>
              Donde el caos<br />se vuelve <span style={{ color: '#ffa719' }}>evolución.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
              Agenda sesiones con Menters especializados, accede a herramientas de diagnóstico y mide tu progreso en bienestar emocional, liderazgo y desarrollo personal.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={irARegistro} className="land-btn-primary" style={{ padding: '15px 36px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                Empieza tu Giro →
              </button>
              <button onClick={() => scrollTo('para-profesionales')} className="land-btn-ghost" style={{ padding: '15px 30px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                ¿Eres terapeuta?
              </button>
            </div>
          </div>
        </section>

        {/* QUÉ ES GIRO LAB */}
        <section style={{ padding: '100px 24px', background: '#0d0618', textAlign: 'center' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <p style={{ color: '#ffa719', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>¿Qué es Giro Lab?</p>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 24px' }}>
              No somos una app de meditación.<br />Somos tu <span style={{ color: '#ffa719' }}>equipo de bienestar.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 60px' }}>
              Conectamos personas, empresas y profesionales del bienestar en un espacio donde el acompañamiento humano se combina con herramientas reales de diagnóstico y seguimiento.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              {[
                { icon: '🎯', title: 'Diagnóstico profundo', desc: 'Evaluaciones que identifican tus bloqueos reales antes de cualquier intervención.' },
                { icon: '🤝', title: 'Menters especializados', desc: 'Profesionales verificados con metodología, experiencia y presencia humana.' },
                { icon: '📈', title: 'Progreso medible', desc: 'Roadmaps personalizados para que puedas ver tu avance con claridad.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="land-card" style={{ background: 'rgba(66,24,105,0.2)', border: '1px solid rgba(66,24,105,0.5)', borderRadius: 20, padding: '32px 24px', textAlign: 'left' }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
                  <h3 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 10px', color: 'white' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section style={{ padding: '100px 24px', background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1050 100%)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#ffa719', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>El proceso</p>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, margin: '0 0 60px' }}>
              Tres pasos hacia tu <span style={{ color: '#ffa719' }}>mejor versión</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
              {[
                { num: '01', title: 'Encuentra tu Menter', desc: 'Responde un diagnóstico breve. Te mostramos los Menters más afines a tu perfil y objetivos.' },
                { num: '02', title: 'Agenda tu sesión', desc: 'Elige horario, modalidad y forma de pago. Todo en minutos, sin fricciones.' },
                { num: '03', title: 'Transforma tu realidad', desc: 'Trabaja con tu Menter, mide tu avance y alcanza los resultados que buscas.' },
              ].map(({ num, title, desc }) => (
                <div key={num} style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 52, color: 'rgba(255,167,25,0.2)', lineHeight: 1, marginBottom: 16 }}>{num}</div>
                  <h3 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 10px' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARA PROFESIONALES DEL BIENESTAR */}
        <section id="para-profesionales" style={{ padding: '100px 24px', background: 'linear-gradient(160deg, #0d0618 0%, #1a0830 50%, #0d0618 100%)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center', justifyContent: 'center' }}>
              {/* Texto izquierda */}
              <div style={{ flex: '1 1 380px', maxWidth: 460 }}>
                <p style={{ color: '#ffa719', fontWeight: 700, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>Para profesionales del bienestar</p>
                <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 18px', lineHeight: 1.15 }}>
                  Tu práctica,<br/><span style={{ color: '#ffa719' }}>amplificada.</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px' }}>
                  Si eres psicólogo, coach, terapeuta o guía holístico, Giro Lab te da la infraestructura que tomaría años y miles de dólares construir sola: perfil profesional, agenda inteligente, pasarela de pagos, tests diagnósticos y una comunidad que ya está buscando lo que tú ofreces.
                </p>
                {/* Especialidades */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                  {['Psicología Clínica','Coaching','Terapia de Pareja','Mindfulness','Neurociencia','Gestalt','Terapia Familiar','Reiki','Constelaciones','Registros Akáshicos','Nutrición','Desarrollo Personal','Astrología','Holístico','y más...'].map(tag => (
                    <span key={tag} style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(255,167,25,0.1)', border: '1px solid rgba(255,167,25,0.22)', fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
                <button onClick={() => setMenterModal(true)} style={{ padding: '14px 34px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                  Quiero ser Menter →
                </button>
              </div>
              {/* Cards derecha */}
              <div style={{ flex: '1 1 320px', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '🌐', title: 'Perfil profesional propio', desc: 'Tu espacio en Giro Lab con bio, especialidades, precios y disponibilidad.' },
                  { icon: '📅', title: 'Agenda y pagos integrados', desc: 'Tus clientes reservan y pagan directamente desde tu perfil.' },
                  { icon: '🧪', title: 'Tests psicométricos', desc: 'Evalúa a tus clientes con instrumentos validados antes y durante el proceso.' },
                  { icon: '📣', title: 'Visibilidad en comunidad', desc: 'Publica eventos, talleres y artículos para que te encuentren antes de buscarte.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,167,25,0.14)', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                    <div>
                      <p style={{ margin: '0 0 4px', fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: 14, color: 'white' }}>{title}</p>
                      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PARA QUIÉN — TABS POR PERFIL */}
        <section style={{ padding: '100px 24px', background: '#0d0618' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#ffa719', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Para quién es</p>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, margin: '0 0 40px' }}>
              Diseñado para cada perfil
            </h2>

            {/* Tab selector — solo Personas y Empresas */}
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: 50, padding: 4, gap: 4, marginBottom: 48 }}>
              {([
                { key: 'persona', label: '🧠 Personas', color: '#7c3aed' },
                { key: 'empresa', label: '🏢 Empresas', color: '#0891b2' },
              ] as { key: 'persona' | 'empresa', label: string, color: string }[]).map(({ key, label, color }) => (
                <button key={key} onClick={() => setActiveProfile(key)}
                  style={{ padding: '10px 22px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'Raleway, sans-serif', transition: 'all 0.25s',
                    background: activeProfile === key ? color : 'transparent',
                    color: activeProfile === key ? 'white' : 'rgba(255,255,255,0.55)',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Contenido del tab activo */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px 40px', textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
              {activeProfile === 'persona' && (
                <div>
                  <h3 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 800, fontSize: 22, color: 'white', margin: '0 0 24px' }}>Para Personas</h3>
                  {[
                    { icon: '🌐', text: 'Acceso gratuito al directorio de Menters especializados en salud mental.' },
                    { icon: '🧪', text: 'Tests psicométricos validados para descubrir rasgos de personalidad y bienestar.' },
                    { icon: '🗺️', text: 'Roadmap personal para el seguimiento de tus objetivos con tu Menter.' },
                    { icon: '🤝', text: 'Comunidad gratuita de soporte emocional.' },
                    { icon: '🎟️', text: 'Accede a eventos, talleres y webinars de bienestar.' },
                  ].map(({ icon, text }, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                      <span style={{ fontSize: 20, marginTop: 1 }}>{icon}</span>
                      <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{text}</p>
                    </div>
                  ))}
                  <button onClick={irARegistro} style={{ marginTop: 16, padding: '12px 28px', borderRadius: 30, border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                    Quiero un Menter →
                  </button>
                </div>
              )}

              {activeProfile === 'empresa' && (
                <div>
                  <h3 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 800, fontSize: 22, color: 'white', margin: '0 0 24px' }}>Para Empresas</h3>
                  {[
                    { icon: '🌐', text: 'Acceso gratuito al directorio de Menters especializados en salud mental organizacional.' },
                    { icon: '🧪', text: 'Tests psicométricos para descubrir rasgos de personalidad de tus colaboradores.' },
                    { icon: '🗺️', text: 'Roadmap de objetivos de equipo e individuales con seguimiento en tiempo real.' },
                    { icon: '🎟️', text: 'Eventos, blogs y recursos de bienestar corporativo.' },
                  ].map(({ icon, text }, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                      <span style={{ fontSize: 20, marginTop: 1 }}>{icon}</span>
                      <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{text}</p>
                    </div>
                  ))}
                  <button onClick={irARegistro} style={{ marginTop: 16, padding: '12px 28px', borderRadius: 30, border: 'none', background: '#0891b2', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                    Para mi empresa →
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* MODAL MENTERS */}
        {menterModal && (
          <div onClick={() => setMenterModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#130a24', border: '1px solid rgba(255,167,25,0.25)', borderRadius: 28, padding: '44px 44px', maxWidth: 640, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setMenterModal(false)} style={{ position: 'absolute', top: 18, right: 22, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>✕</button>

              <p style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,167,25,0.7)', fontWeight: 700 }}>Para Menters</p>
              <h3 style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: 26, color: 'white', margin: '0 0 8px', lineHeight: 1.2 }}>Giro Lab hace por ti<br/>lo que tomaría años construir.</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px' }}>¿Cuánto te cuesta hacer solo lo que nosotros incluimos en tu plan?</p>

              {[
                { label: 'Página web profesional propia',         price: '$600/año',  monthly: 50  },
                { label: 'Posicionamiento en internet (SEO/Ads)', price: '$300/mes',  monthly: 300 },
                { label: 'Asistente para gestionar tu agenda',    price: '$800/mes',  monthly: 800 },
                { label: 'Pasarela de pagos integrada',           price: '$50/mes',   monthly: 50  },
                { label: 'Plataforma de tests psicométricos',     price: '$200/mes',  monthly: 200 },
              ].map(({ label, price }, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.72)', flex: 1, paddingRight: 16 }}>{label}</p>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'block', fontSize: 12, color: '#ff8a80', textDecoration: 'line-through', marginBottom: 2 }}>{price}</span>
                    <span style={{ fontSize: 11, color: '#69f0ae', fontWeight: 700 }}>Incluido en tu plan</span>
                  </div>
                </div>
              ))}

              {/* Sumatoria */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 4px', marginTop: 4 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Total estimado mensual</p>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: '#ff8a80', textDecoration: 'line-through', fontFamily: 'Raleway, sans-serif' }}>$1,400/mes</span>
                  <span style={{ fontSize: 12, color: '#69f0ae', fontWeight: 700 }}>$0 con Giro Lab</span>
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Comunidad activa que busca exactamente lo que tú ofreces.',
                  'Publica eventos, talleres y blogs para que te vean.',
                  'Roadmap de tus clientes para que veas su evolución.',
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#ffa719', flexShrink: 0, marginTop: 3 }}>→</span>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65 }}>{text}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 36, padding: '20px 24px', background: 'rgba(255,167,25,0.08)', border: '1px solid rgba(255,167,25,0.25)', borderRadius: 16, textAlign: 'center' }}>
                <p style={{ margin: '0 0 16px', fontFamily: 'Raleway, sans-serif', fontWeight: 800, fontSize: 16, color: 'white' }}>Empieza gratis. Sin tarjeta.</p>
                <button onClick={() => { setMenterModal(false); irARegistro() }} style={{ padding: '14px 40px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                  Unirme como Menter →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CTA FINAL */}
        <section style={{ padding: '100px 24px', background: 'linear-gradient(135deg, #421869 0%, #6b21a8 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, margin: '0 0 20px', lineHeight: 1.2 }}>
              Tu Giro empieza <span style={{ color: '#ffa719' }}>hoy.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 480 }}>
              Únete a la comunidad que está transformando su bienestar con acompañamiento real.
            </p>
            <button onClick={irARegistro} className="land-btn-primary" style={{ padding: '16px 44px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 17, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
              Crear mi cuenta gratis →
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#080410', padding: '40px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" loop autoplay style={{ width: 52, height: 52 }} />
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[['Términos', '/terminos'], ['Privacidad', '/privacidad'], ['Devoluciones', '/devoluciones']].map(([label, href]) => (
              <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© 2025 Giro Lab</span>
        </footer>
      </main>
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
        @media (max-width: 600px) {
          .grid-opciones { grid-template-columns: repeat(2,1fr) !important; }
          .form-inner { padding-left: 4px !important; padding-right: 4px !important; font-size: 14px !important; }
          .opcion-btn { font-size: 12px !important; padding: 10px 8px !important; }
          .step-heading { font-size: 20px !important; }
        }
        select option { background-color: #2d1a4a; color: white; }
        select { color: white !important; }
        input::placeholder { color: rgba(255,255,255,0.5); }
        textarea::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>

      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{ maxWidth: 780, transition: 'opacity 0.25s ease', opacity: visible ? 1 : 0, padding: '0 8px' }}
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
            <div className="text-center w-full" style={{ marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 700, color: 'white', marginBottom: 4 }}>
                Casi listos
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                Déjanos tus datos para encontrar tu match perfecto
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginBottom: 12 }}>

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

              {/* Fila: País + Fecha de nacimiento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <select
                    value={form.pais}
                    onChange={e => { setForm({ ...form, pais: e.target.value }); setFormErrors({ ...formErrors, pais: '' }) }}
                    style={{ ...selectStyle, border: formErrors.pais ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="">País *</option>
                    {paises.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {formErrors.pais && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.pais}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    type={form.cumpleanos || focusCumpleanos ? 'date' : 'text'}
                    placeholder="Nacimiento (dd/mm/aaaa) *"
                    value={form.cumpleanos}
                    onFocus={() => setFocusCumpleanos(true)}
                    onBlur={() => setFocusCumpleanos(false)}
                    onChange={e => { setForm({ ...form, cumpleanos: e.target.value }); setFormErrors({ ...formErrors, cumpleanos: '' }) }}
                    style={{ ...inputStyle, border: formErrors.cumpleanos ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                  />
                  {formErrors.cumpleanos && <p style={{ color: '#ff9999', fontSize: 12, paddingLeft: 4 }}>{formErrors.cumpleanos}</p>}
                </div>
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
<div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginBottom: 8 }}>
  <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>o continúa con</span>
  <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
</div>

{/* Botón Google */}
<button
  onClick={handleGoogleAuth}
  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}
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
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                ← Atrás
              </button>
              <button onClick={handleCrearCuenta}
                style={{ flex: 3, padding: '11px', borderRadius: 10, border: 'none', backgroundColor: '#ffa719', color: '#2d2926', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Raleway,sans-serif' }}>
                Crear mi cuenta →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: CONFIRMAR EMAIL ── */}
        {step === 'confirmar_email' && (
          <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            {/* Mentis — personaje de Giro Lab */}
            <div style={{ marginBottom: 24 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 640" style={{ width: 160, height: 'auto' }}>
                <defs><style>{`.mc1{fill:#fff}.mc2{fill:#60509c}.mc3{fill:#8fc0e8}.mc4{fill:none;stroke:#60509c;stroke-linecap:round;stroke-linejoin:round}`}</style></defs>
                <path className="mc3" d="M692.33,320c-7.07,414.04-622.95,413.97-629.96-.01,7.07-414.03,622.94-413.96,629.96.01Z"/>
                <path className="mc1" d="M110.23,337.26c-30.9-6.39-155.29-185.98-68.86-156.48,9.08,9.51,16.41-16.58,34.72,6.34,11.09,5.05,14.61,16.8,7.64,27.37-.41,22.73,26.71,52.55,44.62,65.42l-18.11,57.35Z"/>
                <path className="mc2" d="M137.39,295.01c-18.05,17.56-16.97,32.85-35.68,29.59-28.04-14.93-149.41-179.02-63.37-154.47,6.84,9.16,19.33-14.67,31.61,3.77,24.87,13.45,7.96,22.19,10.56,40.02,17.09,31.18,34.9,46.77,59.9,75.05.93,1.41-1.92,4.76-3.02,6.04Z"/>
                <path className="mc1" d="M630.81,321.14c31.48,2.2,199.77-137.1,108.58-132.06-11.31,6.7-11.32-20.4-35.14-3.28-12.04,1.86-18.6,12.22-14.75,24.29-5.75,22-39.92,43.37-60.63,50.93l1.94,60.11Z"/>
                <path className="mc2" d="M614.8,266.49c31.67-20.45,53.09-30.69,77.94-56.08,6.91-11.79-5.04-31.45,17.3-34.05,9.57-5.68,20.47-9.18,27.47,2.29,104.63-5.45-58.77,122.14-95.08,132.59-12.97,4.03-22.68-27.97-27.64-44.75Z"/>
                <path className="mc1" d="M622.43,259.32c-4.98-5.47-16.66-2.6-16.36-12.37-1.98-44.26-47.32-75.47-89.52-61.97-38.78-32.38-113.35-45.62-142.21,10.65-2.09,4.16-3.42,1.5-4.62-.69-20.88-36.59-65-48.6-103.54-38.18-28.63-13.29-65.57,3.45-77.99,32.35-3.04,7.08-6.33,10.16-14.23,11.56-29.55,4.5-54.42,37.36-51.66,67.18,21.48,16.52-18.29,54.1-21.78,71.7-9.03,39.3,4.35,86.74,45.2,101.98,7.02,9.71-2.83,27.44,9.4,38.27,13.75,18.62,39.01,25.44,62.13,16.71,3.07-1.16,5.5-2.37,8.05,1.35,41.25,55.02,114.88,14.63,152.35-11.5,37.62,54.98,155.33,56,175.12-15.57,3.01-6.49,12.06,2.61,18.09-.08,57.56-7.15,66.83-58.86,57.97-103.51,39.97-23.9,14.02-78.49-6.4-107.86Z"/>
                <path className="mc2" d="M364.39,204.06c-12.02-31.64-50.93-56.87-83.86-47.42-2.32,4.69,9.62,9.05,4.48,14-68.08-56.35-135.81,57.05-48.13,86.3,11.59-.67,10.04,10.75-.78,7.76-9.57-.32-6.97,15.32-17.72,16.77-3.12,1.32-6.98,2.71-9.08-.82-2.47-4.25,2.95-5.5,5.2-7.75,17.91-15.46-38.23-32.94-31.29-66.09-.17-4.93-1.78-6.18-6.5-4.89-32.32,5.52-63.23,65.54-31.95,84.65,11.24-2.27,17.13,8.8,26.71,9.92,7.75-3.76,25.73,10.9,10.61,10.83-18.24-5.37-12.65,8.44-22.03,16.29-13.57-4.19,4.6-20.72-4.18-25.38-42.5-13.2-53.72,54.2-42.36,83.54,13.4,53.45,103.1,68.81,121.83,12.17,5.6-13.47,10.73,4.64,5.89,10.82-16.54,49.63-87.12,22.72-83.57,42.82-.99,40.65,75.28,43.96,81.38,9.5-2.53-3.44,2.19-9.21,5.89-5.87,4.35,5.87,12.85,2.15,16.73,6.96,1.39,4.72-4.8,7.29-8.57,7.46-7.84,1.21-10.2,11.61-17.85,14.46,9.06,41.25,87.1,26.48,114.75,3.3,22.61-11.29,22.18-38.4,32.55-55.13,12.62,9.19-6.43,30.39,1.18,42.4,40.86,72.96,220.31,22.91,141.5-56.98-8.92-12.26,16.25-3.36,20.95-11.07,4.23-3.93,10.04,1.9,5.99,6.11-2.73,4.33-8.52,6.27-4.94,12.11,6.72,13.12,2.33,37.58,24.49,31.95,42.14-3.06,74.56-79.49,27.93-95.98-4-.33-3.26-6.03.18-6.66,58.91,17.12,50.51-95.67-5.04-97.33-4.53.65-8.09-5.51-3.06-7.09,10.21-1.33,2.81-11.12,1.94-16.81-5.29-28.78-59.6-61.87-75.71-36.67,1.33,5.98,5.5,18.55-1.4,21.68-12.62-58.3-100.55-76.64-133.24-20.59-2.91,5.8-12.84,26.28-18.91,10.73Z"/>
                <path className="mc2" d="M333.5,320.95c.73,51.97-34.16,51.97-33.43,0-.83-49.81,34.26-49.81,33.43,0Z"/>
                <path className="mc1" d="M325.14,331.75c.48,23.49-17.2,23.49-16.72,0-.45-24.25,17.16-24.25,16.72,0Z"/>
                <path className="mc2" d="M457.5,320.95c.73,51.97-34.16,51.97-33.43,0-.83-49.81,34.26-49.81,33.43,0Z"/>
                <path className="mc1" d="M449.14,331.75c.48,23.49-17.2,23.49-16.72,0-.45-24.25,17.16-24.25,16.72,0Z"/>
                <path className="mc4" d="M365.83,382.17s10.22,15.92,30.87,2.26"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              ¡Ya casi estás!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.6, marginBottom: 8 }}>
              Te enviamos un correo a <strong style={{ color: '#ffa719' }}>{form.email}</strong>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              Haz click en el enlace de confirmación para activar tu cuenta y empezar tu transformación.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, border: '1px solid rgba(255,255,255,0.12)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
                ¿No ves el correo? Revisa tu carpeta de <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Spam</strong> o Promociones.
              </p>
            </div>
            <button onClick={() => cambiarStep(() => setStep('login'))}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 30, padding: '12px 28px', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
              Ya confirmé → Iniciar sesión
            </button>
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