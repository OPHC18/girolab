'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/app/lib/supabase'
import { getRecaptchaToken, verifyRecaptcha } from '@/lib/recaptcha'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import RichTextEditor from '@/components/RichTextEditor'
import Chart from 'chart.js/auto'
import RenderInstrumentosMenter from '@/app/dashboard/components/renderInstrumentosMenter'
import RenderResultadosTests from '@/app/dashboard/components/renderResultadosTests'
import RenderInstrumentosEmpresa from '@/app/dashboard/components/renderInstrumentosEmpresa'
import RenderCompras from '@/app/dashboard/components/renderCompras'
import { INSTRUMENTS } from '@/lib/assessments/instruments'
import { dispararEmail } from '@/lib/email/send'
import PushNotificationSetup from '@/components/PushNotificationSetup'
import CertificateGenerator from '@/components/CertificateGenerator'
import ChatWidget from '@/components/chat/ChatWidget'


// ─── SVG Icons ───────────────────────────────────────────────────────────────
const icons = {
  perfil:     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>,
  editar:     <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>,
  citas:      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>,
  destacados: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>,
  compras:    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>,
  roadmap:    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>,
  escribir:   <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>,
  eventos:    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>,
  soporte:    <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>,
  ingresos: <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>,
  membresia:  <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>,
  comunidad: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>,
  directorio:     <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>,
  instrumentos:   <path d="M19.8 18.4L14 10.67V6h1c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1h1v4.67L4.2 18.4C3.71 19.06 4.18 20 5 20h14c.82 0 1.29-.94.8-1.6z"/>,
  resultados:     <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>,
  certificados:   <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>,
} as const

// ─── Constantes ──────────────────────────────────────────────────────────────
const CASOS_DISPONIBLES = [
  'Ansiedad y Estrés','Depresión','Estado de Ánimo','Relaciones de Pareja',
  'Familia','Duelo y Pérdida','Autoestima','Trauma','Post-trauma',
  'TCA','Apoyo LGBTIQ+','Burnout Laboral','Propósitos',
  'Bloqueo Emocional','Bloqueo Energético','Crecimiento Personal',
]
const DIAS_SEMANA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const IDIOMAS_DISPONIBLES = ['Español','Inglés','Portugués','Francés','Italiano','Alemán','Chino','Japonés','Árabe']
const PAISES = [
  'Argentina','Bolivia','Brasil','Chile','Colombia','Costa Rica','Cuba',
  'Ecuador','El Salvador','Guatemala','Honduras','México','Nicaragua',
  'Panamá','Paraguay','Perú','Puerto Rico','República Dominicana',
  'Uruguay','Venezuela','España',
  '─────────────',
  'Alemania','Australia','Bélgica','Canadá','China','Corea del Sur',
  'Estados Unidos','Francia','India','Italia','Japón','Países Bajos',
  'Portugal','Reino Unido','Suecia','Suiza','Otros',
]
const PLANES: Record<string, { label: string; color: string; bg: string; emoji: string; precio_mensual: number | null; precio_anual: number | null }> = {
  free:    { label: 'Free',    color: '#666',    bg: '#f0f0f0', emoji: '', precio_mensual: null, precio_anual: null },
  starter: { label: 'Starter', color: '#1565c0', bg: '#e3f2fd', emoji: '', precio_mensual: 20,   precio_anual: 216  },
  premium: { label: 'Premium', color: '#6a1b9a', bg: '#f3e5f5', emoji: '', precio_mensual: 28,   precio_anual: 303  },
  master:  { label: 'Master',  color: '#e65100', bg: '#fff3e0', emoji: '', precio_mensual: null, precio_anual: null },
}

// ─── Admin emails ─────────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'omar@girolab.net',   
  'admin@girolab.net',
  'luana@girolab.net',
  'daniela@girolab.net',
  'omarphc@hotmail.com',
]

// ─── Types ───────────────────────────────────────────────────────────────────
type IconKey = keyof typeof icons

type UserMeta = {
  nombre: string; apellidos: string
  role: 'persona' | 'empresa' | 'menter'
  telefono?: string; pais?: string; empresa?: string; cargo?: string
  respuestas?: Record<string, unknown>; avatar_url?: string; cumpleanos?: string
}
type Membership = {
  plan: 'free' | 'starter' | 'premium' | 'master'
  billing_cycle: string; starts_at: string; expires_at: string | null; is_active: boolean
}
type MenterResult = {
  menter_id: string; nombre: string; apellidos: string
  avatar_url: string | null; bio: string | null
  especialidad: string | null
  insignias_ganadas?: string[]
  casos_que_atiende: string[]; precio_sesion: number | null
  duracion_sesion: number | null; modalidad: string | null
  pais: string | null; plan: string; match_score: number
  formacion?: { titulo: string; institucion: string; anio_inicio: string; anio_fin: string }[]
  experiencia_laboral?: { empresa: string; cargo: string; anio_inicio: string; anio_fin: string }[]
  numero_colegiatura?: string
  idiomas?: string[]
  enlaces?: {
  linkedin?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  x?: string
  youtube?: string
  whatsapp?: string

}
}
type MenterProfile = {
  casos_que_atiende: string[]
  casos_otros: string
  bio: string
  precio_sesion: string
  duracion_sesion: string
  anticipacion_minima: string
  modalidad: 'video' | 'presencial' | 'ambas'
  direccion: string
  meet_link: string
  descuento_menters: boolean
  declaracion_jurada: boolean
  idiomas: string[]
  formacion: { titulo: string; institucion: string; anio_inicio: string; anio_fin: string }[]
  experiencia_laboral: { empresa: string; cargo: string; anio_inicio: string; anio_fin: string }[]
  numero_colegiatura: string
  enlaces: { youtube: string; linkedin: string; whatsapp: string; instagram: string; facebook: string; tiktok: string; x: string }
  descuento_porcentaje?: number
  descuento_codigo?: string
}
type Availability = { id?: string; day_of_week: number; start_time: string; end_time: string; is_active: boolean }
type TabId = 'perfil' | 'editar' | 'perfil-pro' | 'membresia' | 'citas' | 'mis-citas' | 'ingresos' | 'destacados' | 'compras' | 'escribir' | 'eventos' | 'comunidad' | 'soporte' | 'roadmap' | 'objetivos' | 'instrumentos' | 'resultados_tests' | 'instrumentos_empresa' | 'certificados'

// ─── Selector de cliente para Roadmap ────────────────────────────────────────
function ClienteSelectorRoadmap({ clientes, loading, clienteActivo, onSelect }: {
  clientes: any[]
  loading: boolean
  clienteActivo: string | null
  onSelect: (id: string) => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)

  const filtrados = busqueda.trim()
    ? clientes.filter(c => c.client_name?.toLowerCase().includes(busqueda.toLowerCase()))
    : clientes

  const seleccionado = clientes.find(c => c.client_id === clienteActivo)

  if (loading && clientes.length === 0) {
    return <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>Cargando clientes...</p>
  }
  if (clientes.length === 0) {
    return (
      <div style={{ padding: '16px 20px', background: '#fff8e1', borderRadius: 12, border: '2px solid #ffa719', fontSize: 14, color: '#e65100', marginBottom: 20 }}>
        Aún no tienes clientes con citas confirmadas. Cuando confirmes una cita, podrás crear el roadmap de ese cliente aquí.
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 20, position: 'relative' as const }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>Cliente</div>
      <div
        onClick={() => { setAbierto(a => !a); setBusqueda('') }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 14px', borderRadius: 10, border: '1.5px solid #ddd',
          background: 'white', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans',
          color: seleccionado ? '#421869' : '#999', fontWeight: seleccionado ? 600 : 400,
          maxWidth: 320,
        }}
      >
        <span>{seleccionado?.client_name || 'Seleccionar cliente...'}</span>
        <span style={{ fontSize: 10, color: '#999', marginLeft: 8 }}>{abierto ? '▲' : '▼'}</span>
      </div>
      {abierto && (
        <div style={{
          position: 'absolute' as const, top: '100%', left: 0, zIndex: 50,
          background: 'white', border: '1.5px solid #ddd', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 320, maxHeight: 280, overflow: 'hidden',
          display: 'flex', flexDirection: 'column' as const,
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>
            <input
              autoFocus
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13, fontFamily: 'DM Sans', boxSizing: 'border-box' as const, outline: 'none' }}
            />
          </div>
          <div style={{ overflowY: 'auto' as const, maxHeight: 220 }}>
            {filtrados.length === 0 ? (
              <p style={{ fontSize: 13, color: '#999', padding: '12px 14px', margin: 0 }}>Sin resultados</p>
            ) : filtrados.map((c: any) => (
              <div
                key={c.client_id}
                onClick={() => { onSelect(c.client_id); setAbierto(false); setBusqueda('') }}
                style={{
                  padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans',
                  background: clienteActivo === c.client_id ? '#EEEDFE' : 'white',
                  color: clienteActivo === c.client_id ? '#3C3489' : '#333',
                  fontWeight: clienteActivo === c.client_id ? 700 : 400,
                  borderBottom: '0.5px solid #f5f5f5',
                }}
                onMouseEnter={e => { if (clienteActivo !== c.client_id) (e.currentTarget as HTMLDivElement).style.background = '#fafafa' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = clienteActivo === c.client_id ? '#EEEDFE' : 'white' }}
              >
                {c.client_name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser]         = useState<{ email: string; id: string } | null>(null)
  const [meta, setMeta]         = useState<UserMeta | null>(null)
  const [isStaff, setIsStaff]   = useState(false)
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('perfil')
  const [modalCancelar, setModalCancelar] = useState<any | null>(null)
  const [cancelarLoading, setCancelarLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // El menú lateral scrollea pero oculta su barra (scrollbarWidth:'none'). En
  // móvil no caben los 15 ítems de un Menter, así que sin una señal visual la
  // gente cree que las opciones de abajo no existen.
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const [hayMasMenu, setHayMasMenu] = useState(false)

  const revisarScrollMenu = useCallback(() => {
    const el = sidebarRef.current
    if (!el) return
    setHayMasMenu(el.scrollHeight - el.clientHeight - el.scrollTop > 12)
  }, [])

  useEffect(() => {
    revisarScrollMenu()
    window.addEventListener('resize', revisarScrollMenu)
    return () => window.removeEventListener('resize', revisarScrollMenu)
  }, [revisarScrollMenu, sidebarOpen])
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [modalReprogramar, setModalReprogramar] = useState<any | null>(null)
  const [reprogramarFecha, setReprogramarFecha] = useState('')
  const [reprogramarHoraInicio, setReprogramarHoraInicio] = useState('')
  const [reprogramarHoraFin, setReprogramarHoraFin] = useState('')
  const [reprogramarNotas, setReprogramarNotas] = useState('')
  const [reprogramarLoading, setReprogramarLoading] = useState(false)
  const [missingProfileFields, setMissingProfileFields] = useState({ nombre: false, apellidos: false, telefono: false, pais: false, cumpleanos: false })
  const [scrolled, setScrolled] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const [showVerification, setShowVerification]       = useState(false)
  const [verifyCode, setVerifyCode]                   = useState('')
  const [verifySending, setVerifySending]             = useState(false)
  const [verifyError, setVerifyError]                 = useState('')
  const [verifyResent, setVerifyResent]               = useState(false)
  const [completeForm, setCompleteForm] = useState({ nombre: '', apellidos: '', telefono: '', pais: '', cumpleanos: '' })
  const [completeSaving, setCompleteSaving] = useState(false)
  const [editForm, setEditForm] = useState({ nombre: '', apellidos: '', telefono: '', pais: '', empresa: '', cargo: '', cumpleanos: '' })
  const [editSaving, setEditSaving]   = useState(false)
  const [citasMenter, setCitasMenter] = useState<any[]>([])
  const [citasMenterLoading, setCitasMenterLoading] = useState(false)
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [blogModalPost, setBlogModalPost] = useState<any>(null)
  const [blogFiltroOrden, setBlogFiltroOrden] = useState<'reciente' | 'popular' | 'destacado'>('reciente')
  const [blogFiltroTag, setBlogFiltroTag] = useState<string | null>(null)
  const [blogPostsPublicos, setBlogPostsPublicos] = useState<any[]>([])
  const [blogPostsPublicosLoading, setBlogPostsPublicosLoading] = useState(true)
  const [blogComments, setBlogComments] = useState<any[]>([])
  const [blogLikes, setBlogLikes] = useState<number>(0)
  const [blogUserLiked, setBlogUserLiked] = useState(false)
  const [blogComment, setBlogComment] = useState('')
  const [blogLoading, setBlogLoading] = useState(false)
  const [blogForm, setBlogForm] = useState({ title: '', content: '', tags: '', cover_image: '', status: 'borrador' })
  const [blogEditId, setBlogEditId] = useState<string | null>(null)
  const [blogView, setBlogView] = useState<'lista' | 'editor'>('lista')
  const [roadmapClientes, setRoadmapClientes] = useState<any[]>([])
  const carruselRef = useRef<HTMLDivElement>(null)
const [roadmapClienteActivo, setRoadmapClienteActivo] = useState<string | null>(null)
const [roadmapData, setRoadmapData] = useState<any | null>(null)
const [roadmapLoading, setRoadmapLoading] = useState(false)
const ingresosChartRef      = useRef<HTMLCanvasElement>(null)
const ingresosChartInstance = useRef<any>(null)
const [roadmapObjetivoForm, setRoadmapObjetivoForm] = useState({ titulo: '', descripcion: '' })
const [roadmapHitoForm, setRoadmapHitoForm] = useState({ nombre: '', fecha: '', notas: '' })
const [roadmapObjetivoActivo, setRoadmapObjetivoActivo] = useState<string | null>(null)
const [roadmapShowObjetivoForm, setRoadmapShowObjetivoForm] = useState(false)
const [roadmapShowHitoForm, setRoadmapShowHitoForm] = useState<string | null>(null)
const [roadmapMentersPropios, setRoadmapMentersPropios] = useState<any[]>([])
const [roadmapVistaActiva, setRoadmapVistaActiva] = useState<'como_menter' | 'como_cliente' | 'ruta_empresas'>('como_menter')
const [roadmapDataPropio, setRoadmapDataPropio] = useState<any | null>(null)
const [roadmapMenterPropioActivo, setRoadmapMenterPropioActivo] = useState<string | null>(null)
const [roadmapSaving, setRoadmapSaving] = useState(false)
const [ingresosSesiones, setIngresosSesiones]     = useState<any[]>([])
const [ingresosEventos, setIngresosEventos]         = useState<any[]>([])
const [ingresosLoading, setIngresosLoading]         = useState(false)
const [ingresosDesde, setIngresosDesde]             = useState<string>(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})
const [ingresosHasta, setIngresosHasta]             = useState<string>(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})
const [ingresosEstado, setIngresosEstado]           = useState<string>('todos')
const [ingresosFuente, setIngresosFuente]           = useState<string>('todas')
const [ingresosTab, setIngresosTab]                 = useState<'sesiones' | 'eventos'>('sesiones')

  const [citasLoading, setCitasLoading] = useState(false)
  const [citasPendientesCount, setCitasPendientesCount] = useState(0)
  const [inscritosModal, setInscritosModal] = useState<any>(null)
const [inscritosList, setInscritosList] = useState<any[]>([])
const [inscritosLoading, setInscritosLoading] = useState(false)
const [certifiedMap, setCertifiedMap] = useState<Record<string, boolean>>({})
const [certIssuing, setCertIssuing] = useState<string | 'all' | null>(null)
const [misCertificados, setMisCertificados] = useState<any[]>([])
const [misCertificadosLoading, setMisCertificadosLoading] = useState(false)
  const [eventos, setEventos] = useState<any[]>([])
const [eventosPublicos, setEventosPublicos] = useState<any[]>([])
const [eventosPublicosLoaded, setEventosPublicosLoaded] = useState(false)
const [eventosLoading, setEventosLoading] = useState(false)
const [eventoModal, setEventoModal] = useState<any>(null)
const [eventoInscritoConfirmado, setEventoInscritoConfirmado] = useState(false)
const [inscribiendose, setInscribiendose] = useState(false)
const [certModal, setCertModal] = useState<{ cert: any; evento: any } | null>(null)
const [eventoView, setEventoView] = useState<'lista' | 'editor'>('lista')
const [eventoForm, setEventoForm] = useState({
  title: '', description: '', cover_image: '', date: '', start_time: '',
  end_time: '', modality: 'virtual', location_address: '', meeting_link: '',
  max_participants: '', presenter: '', organizers: '', sponsors: '', status: 'borrador',
  certificate_text: '', certificate_firma: ''
})
const [eventoEditId, setEventoEditId] = useState<string | null>(null)
const [eventoTickets, setEventoTickets] = useState<any[]>([])
const [eventoTicketForm, setEventoTicketForm] = useState({
  name: '', type: 'general', price: '', quantity: '', preventa_ends_at: '',
  combo_min_people: '', discount_pct: '', discount_codes: ''
})
const [ticketSeleccionado, setTicketSeleccionado] = useState<any>(null)
const [cantidadTickets, setCantidadTickets] = useState(1)
const [codigoDescuento, setCodigoDescuento] = useState('')
const [eventosLimit, setEventosLimit] = useState(6)
const [eventosComunidadLimit, setEventosComunidadLimit] = useState(6)
const [eventoFiltroOrden, setEventoFiltroOrden] = useState<'proximo' | 'popular' | 'destacado'>('proximo')
  const [editMsg, setEditMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [membership, setMembership]   = useState<Membership | null>(null)
  const [subLoading, setSubLoading]   = useState<string | null>(null)
  const [activePromo, setActivePromo] = useState<{ trial_dias: number; nombre: string; expires_at: string | null } | null>(null)
  const [ppModal, setPpModal] = useState<{ type: 'success' | 'confirm' | 'error'; msg: string; onConfirm?: () => void } | null>(null)
  const [showAgenda, setShowAgenda] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [menterProfile, setMenterProfile] = useState<MenterProfile>({
  casos_que_atiende: [], casos_otros: '', bio: '',
  precio_sesion: '', duracion_sesion: '60', anticipacion_minima: '24',
  modalidad: 'ambas', direccion: '', meet_link: '',
  descuento_menters: false, declaracion_jurada: false,
  idiomas: [], formacion: [], experiencia_laboral: [],
  numero_colegiatura: '',
  enlaces: { youtube: '', linkedin: '', whatsapp: '', instagram: '', facebook: '', tiktok: '', x: '' },
  descuento_porcentaje: undefined, 
  descuento_codigo: '',              
})
  const [menterProfileSaving, setMenterProfileSaving] = useState(false)
  const [menterProfileMsg, setMenterProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showOtrosCasos, setShowOtrosCasos] = useState(false)
  const [historialMenterLimit, setHistorialMenterLimit] = useState(3)
const [historialClienteLimit, setHistorialClienteLimit] = useState(3)
  const [availability, setAvailability] = useState<Availability[]>(
    DIAS_SEMANA.map((_, i) => ({ day_of_week: i, start_time: '09:00', end_time: '18:00', is_active: false }))
  )
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [menters, setMenters]           = useState<MenterResult[]>([])
  const [mentersLoading, setMentersLoading] = useState(false)
  const [fraseDelDia, setFraseDelDia] = useState<{ frase: string; autor: string | null } | null>(null)
  // ── Objetivos Empresariales ──
const [objEmpresa, setObjEmpresa] = useState<any[]>([])
const [objEmpresaLoading, setObjEmpresaLoading] = useState(false)
const [objForm, setObjForm] = useState({
  titulo: '', descripcion: '', area: '', periodo_inicio: '', periodo_fin: ''
})
const [objShowForm, setObjShowForm] = useState(false)
const [objEditId, setObjEditId] = useState<string | null>(null)
const [objMenterSearch, setObjMenterSearch] = useState('')
const [objMenterResults, setObjMenterResults] = useState<any[]>([])
const [objMenterSearching, setObjMenterSearching] = useState(false)
const [objColaboradores, setObjColaboradores] = useState<Record<string, any[]>>({})
const [objMenters, setObjMenters] = useState<Record<string, any>>({})
const [objColabHitos, setObjColabHitos] = useState<Record<string, any[]>>({})
const [objColabHitoForm, setObjColabHitoForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' })
const [objColabHitoShow, setObjColabHitoShow] = useState<string | null>(null) // colaborador_id activo
const [editandoHitoColab, setEditandoHitoColab] = useState<string | null>(null) // hito_id en edición (empresa)
const [editHitoColabForm, setEditHitoColabForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' })
const [miHitoColabShow, setMiHitoColabShow] = useState<string | null>(null) // colab.id con form activo (persona)
const [miHitoColabForm, setMiHitoColabForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' })
const [objMenterForm, setObjMenterForm] = useState({ menter_id: '', menter_nombre: '', menter_externo: false })
const [objMenterShow, setObjMenterShow] = useState<string | null>(null) // objetivo_id
const [hitoForm, setHitoForm] = useState({ nombre: '', fecha: '', notas: '' })
const [hitoShowForm, setHitoShowForm] = useState<string | null>(null)
const [objSaving, setObjSaving] = useState(false)
const [roadmapEmpresaColabs, setRoadmapEmpresaColabs] = useState<any[]>([])
const [roadmapVistaPersona, setRoadmapVistaPersona] = useState<'personal' | 'empresa'>('personal')
const [rutaEmpresasData, setRutaEmpresasData] = useState<any[]>([])
const [rutaEmpresasLoading, setRutaEmpresasLoading] = useState(false)
const [rutaEmpresasColabHitos, setRutaEmpresasColabHitos] = useState<Record<string, any[]>>({})
const [mentersVinculados, setMentresVinculados] = useState<Record<string, any[]>>({})
// Test linking (objetivos ↔ assessment_results)
const [objTestsVinculados, setObjTestsVinculados] = useState<Record<string, any[]>>({}) // objetivo_id → results
const [objTestsDisponibles, setObjTestsDisponibles] = useState<Record<string, any[]>>({}) // objetivo_id → results
const [objTestsShowPanel, setObjTestsShowPanel] = useState<string | null>(null) // objetivo_id with panel open
const [objTestsLoading, setObjTestsLoading] = useState<Record<string, boolean>>({})
  const [blogPersonaLimit, setBlogPersonaLimit] = useState(6)
  const [selectedMenter, setSelectedMenter] = useState<MenterResult | null>(null)
  const [youtubePlayerOpen, setYoutubePlayerOpen] = useState(false)
  const [filtros, setFiltros]           = useState({ especialidad: '', precio_max: '', pais: '', soloDescuento: false })
  const [featuredMenters, setFeaturedMenters] = useState<MenterResult[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)


   const [citas, setCitas] = useState<any[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [reviewModal, setReviewModal] = useState<{appointmentId: string, reviewedId: string, reviewedName: string} | null>(null)
  const [reviewForm, setReviewForm] = useState({ estrellas: 0, comentario: '', puntualidad: 0, comunicacion: 0, efectividad: 0 })
  const [reviewSaving, setReviewSaving] = useState(false)
  const [misResenas, setMisResenas] = useState<Record<string, any>>({})
  const [resenasMenter, setResenasMenter] = useState<Record<string, any>>({})
  const [menterRatings, setMenterRatings] = useState<Record<string, {avg: number, count: number}>>({})
  const [comunidadDraft, setComunidadDraft] = useState<{
    menterId: string; menterName: string; menterAvatarUrl: string | null; estrellas: number; comentario: string
  } | null>(null)
  const [comunidadPosts, setComunidadPosts] = useState<any[]>([])
  const [comunidadPostTexto, setComunidadPostTexto] = useState('')
  const [comunidadPosting, setComunidadPosting] = useState(false)

  useEffect(() => {
  if (!user?.id) return
  const channel = supabase
    .channel('appointments-realtime')

    // ── Canal cliente (persona recibe cambios) ──
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'appointments',
      filter: `client_id=eq.${user.id}`
    }, (payload) => {
      const nuevo = payload.new as any
      setCitas(prev => prev.map(c => c.id === nuevo.id ? { ...c, ...nuevo } : c))
      if (nuevo.status === 'confirmada')
        setToastMsg('¡Tu cita fue confirmada!')
      else if (nuevo.status === 'rechazada')
        setToastMsg('Tu cita fue rechazada')
      else if (nuevo.status === 'reprogramacion_pendiente')
        setToastMsg('El Menter propone una nueva fecha')
      else if (nuevo.status === 'cancelada')
        setToastMsg('Tu cita fue cancelada')
      setTimeout(() => setToastMsg(null), 8000)
    })

    // ── Canal Menter (recibe cambios de sus citas) ──
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'appointments',
      filter: `menter_id=eq.${user.id}`
    }, (payload) => {
      setCitasMenter(prev => [...prev, payload.new])
      setToastMsg('Nueva cita agendada')
      setTimeout(() => setToastMsg(null), 8000)
    })

    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'appointments',
      filter: `menter_id=eq.${user.id}`
    }, (payload) => {
      const nuevo = payload.new as any
      setCitasMenter(prev => prev.map(c => c.id === nuevo.id ? { ...c, ...nuevo } : c))
      setCitas(prev => prev.map(c => c.id === nuevo.id ? { ...c, ...nuevo } : c))
      if (nuevo.status === 'reprogramacion_pendiente')
        setToastMsg('La persona propone una nueva fecha')
      else if (nuevo.status === 'cancelada')
        setToastMsg('Una cita fue cancelada')
      setTimeout(() => setToastMsg(null), 8000)
    })

    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [user?.id]) 

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'escribir') return
  

  supabase
    .from('blog_posts')
    .select('*')
    .eq('menter_id', user.id)
    .order('created_at', { ascending: false })
    .then(({ data }) => { setBlogPosts(data || []) })

  setBlogPostsPublicosLoading(true)
  supabase
    .from('blog_posts')
    .select('*, menter:menter_public_profiles(nombre, avatar_url, plan)')
    .eq('status', 'publicado')
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      setBlogPostsPublicos(data || [])
      setBlogPostsPublicosLoading(false)
    })
}, [activeTab, user?.id])

useEffect(() => {
  if (activeTab !== 'ingresos') return
  if (!ingresosChartRef.current) return
  if (ingresosSesiones.length === 0 && ingresosEventos.length === 0) return

  const generarMeses = (desde: string, hasta: string) => {
    const meses: string[] = []
    let cur = desde
    while (cur <= hasta) {
      meses.push(cur)
      const [y, m] = cur.split('-').map(Number)
      cur = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
    }
    return meses
  }
  const mesDeStr = (f: string) => f.slice(0, 7)
  const meses = generarMeses(ingresosDesde, ingresosHasta)

  const dataSesiones = meses.map(m =>
    ingresosSesiones
      .filter((s: any) => mesDeStr(s.date) === m && s.payment_status === 'pagado')
      .reduce((a: number, s: any) => a + (s.price || 0), 0)
  )
  const dataEventos = meses.map(m =>
    ingresosEventos
      .filter((e: any) => mesDeStr(e.fecha) === m)
      .reduce((a: number, e: any) => a + e.recaudado, 0)
  )
  const labels = meses.map(m => {
    const [y, mo] = m.split('-')
    return ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(mo) - 1] + ' ' + y.slice(2)
  })

  if (ingresosChartInstance.current) ingresosChartInstance.current.destroy()

  ingresosChartInstance.current = new Chart(ingresosChartRef.current!, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Sesiones', data: dataSesiones, backgroundColor: '#7F77DD', borderRadius: 4, barPercentage: 0.5 },
        { label: 'Eventos',  data: dataEventos,  backgroundColor: '#1D9E75', borderRadius: 4, barPercentage: 0.5 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, callback: (v: any) => '$' + v } },
      },
    },
  })

  return () => { ingresosChartInstance.current?.destroy() }
}, [ingresosSesiones, ingresosEventos, activeTab])

useEffect(() => {
  const el = carruselRef.current
  if (!el || featuredMenters.length === 0) return
  const interval = setInterval(() => {
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: 180 + 16, behavior: 'smooth' })
    }
  }, 3000)
  return () => clearInterval(interval)
}, [featuredMenters])

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'roadmap') return

  setRoadmapLoading(true)

  if (isMenter) {
    // ── Rama 1: clientes que el Menter atiende ──
    supabase
      .from('appointments')
      .select('client_id, client_name')
      .eq('menter_id', user.id)
      .in('status', ['confirmada', 'completada'])
      .then(({ data }) => {
        const unicos = data ? Array.from(
          new Map(data.map((c: any) => [c.client_id, c])).values()
        ) as any[] : []
        setRoadmapClientes(unicos)
        if (unicos.length > 0) {
          const primero = unicos[0]
          setRoadmapClienteActivo(primero.client_id)
          supabase
            .from('roadmaps')
            .select('*')
            .eq('menter_id', user.id)
            .eq('client_id', primero.client_id)
            .single()
            .then(async ({ data: rm }) => {
              let roadmapId = rm?.id
              if (!rm) {
                const { data: nuevo } = await supabase
                  .from('roadmaps')
                  .insert({ menter_id: user.id, client_id: primero.client_id })
                  .select()
                  .single()
                roadmapId = nuevo?.id
              }
              if (roadmapId) {
                const { data: objetivos } = await supabase
                  .from('roadmap_objectives')
                  .select('*, roadmap_milestones(*)')
                  .eq('roadmap_id', roadmapId)
                  .order('created_at', { ascending: true })
                setRoadmapData({ id: roadmapId, client_id: primero.client_id, objetivos: objetivos || [] })
              }
              setRoadmapLoading(false)
            })
        } else {
          setRoadmapLoading(false)
        }
      })

    // ── Rama 2: el Menter como cliente de otro Menter ──
    supabase
      .from('appointments')
      .select('menter_id, menter_name')
      .eq('client_id', user.id)
      .in('status', ['confirmada', 'completada'])
      .then(({ data }) => {
        const unicos = data ? Array.from(
          new Map(data.map((c: any) => [c.menter_id, c])).values()
        ) as any[] : []
        setRoadmapMentersPropios(unicos)
        if (unicos.length > 0) {
          const primero = unicos[0]
          setRoadmapMenterPropioActivo(primero.menter_id)
          supabase
            .from('roadmaps')
            .select('*')
            .eq('menter_id', primero.menter_id)
            .eq('client_id', user.id)
            .single()
            .then(async ({ data: rm }) => {
              if (rm) {
                const { data: objetivos } = await supabase
                  .from('roadmap_objectives')
                  .select('*, roadmap_milestones(*)')
                  .eq('roadmap_id', rm.id)
                  .order('created_at', { ascending: true })
                setRoadmapDataPropio({ ...rm, objetivos: objetivos || [] })
              }
            })
        }
      })

  } else {
    // ── Rama 3: Persona — solo ve sus roadmaps como cliente ──
    supabase
      .from('appointments')
      .select('menter_id, menter_name')
      .eq('client_id', user.id)
      .in('status', ['confirmada', 'completada'])
      .then(({ data }) => {
        const unicos = data ? Array.from(
          new Map(data.map((c: any) => [c.menter_id, c])).values()
        ) as any[] : []
        setRoadmapClientes(unicos)
        if (unicos.length > 0) {
          const primero = unicos[0]
          setRoadmapClienteActivo(primero.menter_id)
          supabase
            .from('roadmaps')
            .select('*')
            .eq('menter_id', primero.menter_id)
            .eq('client_id', user.id)
            .single()
            .then(async ({ data: rm }) => {
              if (rm) {
                const { data: objetivos } = await supabase
                  .from('roadmap_objectives')
                  .select('*, roadmap_milestones(*)')
                  .eq('roadmap_id', rm.id)
                  .order('created_at', { ascending: true })
                setRoadmapData({ ...rm, objetivos: objetivos || [] })
              }
              setRoadmapLoading(false) 
            })
        } else {
          setRoadmapLoading(false) 
        }
        // ── Rama 4: Persona — objetivos de empresa donde es colaborador ──
    supabase
      .from('empresa_objetivo_colaboradores')
      .select('*, objetivo:objetivo_id(*, empresa_hitos(*))')
      .eq('user_id', user.id)
      .then(({ data: colabData }) => {
        if (colabData && colabData.length > 0) {
          setRoadmapEmpresaColabs(colabData)
          const colabIds = colabData.map((c: any) => c.id)
          supabase.from('empresa_colaborador_hitos')
            .select('*')
            .in('colaborador_id', colabIds)
            .then(({ data: hitos }) => {
              const hitoMap: Record<string, any[]> = {}
              ;(hitos || []).forEach((h: any) => {
                if (!hitoMap[h.colaborador_id]) hitoMap[h.colaborador_id] = []
                hitoMap[h.colaborador_id].push(h)
              })
              setObjColabHitos(hitoMap)
            })
        }
      })
      })
  }
}, [activeTab, user?.id])


useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'mis-citas') return
  console.log('Fetching citas for:', user.id)  // ← agrega esto
  setCitasLoading(true)
  supabase
    .from('appointments')
    .select('*')
    .eq('client_id', user.id)
    .order('date', { ascending: true })
    .then(({ data, error }) => {
      console.log('Citas data:', data, 'error:', error)  // ← y esto
      if (!error && data) setCitas(data)
      setCitasLoading(false)
    })
}, [activeTab, user?.id])

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'citas') return
  setCitasMenterLoading(true)
  supabase
    .from('appointments')
    .select('*')
    .eq('menter_id', user.id)
    .order('date', { ascending: true })
    .then(({ data, error }) => {
      if (!error && data) setCitasMenter(data)
      setCitasMenterLoading(false)
    })
  supabase.from('reviews').select('*').eq('reviewed_id', user.id)
    .then(({ data }) => {
      if (data) {
        const map: Record<string, any> = {}
        data.forEach((r: any) => { map[r.appointment_id] = r })
        setResenasMenter(map)
      }
    })
}, [activeTab, user?.id])

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'comunidad') return
  supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(30)
    .then(({ data }) => { if (data) setComunidadPosts(data) })
}, [activeTab, user?.id])

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'ingresos') return
  if (!isMenter) return
  cargarIngresos()
}, [activeTab, user?.id])

useEffect(() => {
  if (activeTab === 'destacados' && user?.id) {
    fetchMenters()
    fetchFeaturedMenters()
  }
}, [activeTab, user?.id])

  useEffect(() => {
    if (activeTab === 'destacados' && user) {
      fetchMenters()
    }
  }, [filtros])

  useEffect(() => {
  if (!user?.id) return
  if (meta?.role === 'menter') {
    
setCitasPendientesCount(citasMenter.filter(c => 
  c.status === 'pendiente' || 
  (c.status === 'reprogramacion_pendiente' && c.reprogramacion_propuesta_por !== user?.id)
).length)
  } else {
    setCitasPendientesCount(citas.filter(c => c.status === 'reprogramacion_pendiente' && c.reprogramacion_propuesta_por === 'menter').length)
  }
}, [citas, citasMenter, meta?.role])

// ── Realtime: sincronizar appointments en tiempo real ─────────────────────
useEffect(() => {
  if (!user?.id) return
  const channel = supabase
    .channel(`appointments-${user.id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'appointments' },
      (payload: any) => {
        const updated = payload.new
        setCitas(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
        setCitasMenter(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [user?.id])

const handleCancelar = async () => {
  if (!modalCancelar) return
  setCancelarLoading(true)
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelada', updated_at: new Date().toISOString() })
    .eq('id', modalCancelar.id)
  if (!error) {
    setCitas(prev => prev.map(x => x.id === modalCancelar.id ? { ...x, status: 'cancelada' } : x))
    setCitasMenter(prev => prev.map(x => x.id === modalCancelar.id ? { ...x, status: 'cancelada' } : x))
    const c = modalCancelar
    const otroUserId = isMenter ? c.client_id : c.menter_id
    const quienCancela = isMenter ? c.menter_name : (meta?.nombre || 'La persona')
    const fechaStr = c.date ? new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
    if (otroUserId) {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s) {
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.access_token}` },
          body: JSON.stringify({
            user_id: otroUserId,
            title: 'Cita cancelada',
            body: `${quienCancela} canceló la sesión del ${fechaStr}.`,
            url: isMenter ? '/dashboard?tab=mis-citas' : '/dashboard?tab=citas',
          }),
        }).catch(() => {})
      }
    }
    setModalCancelar(null)
  }
  setCancelarLoading(false)
}

  const handleReprogramar = async () => {
  if (!modalReprogramar || !reprogramarFecha || !reprogramarHoraInicio || !reprogramarHoraFin) return
  setReprogramarLoading(true)
  const { error } = await supabase
    .from('appointments')
    .update({
      reprogramacion_fecha: reprogramarFecha,
      reprogramacion_hora_inicio: reprogramarHoraInicio,
      reprogramacion_hora_fin: reprogramarHoraFin,
      reprogramacion_propuesta_por: isMenter ? 'menter' : 'persona',
      reprogramacion_notas: reprogramarNotas,
      status: 'reprogramacion_pendiente',
      updated_at: new Date().toISOString()
    })
    .eq('id', modalReprogramar.id)
  if (!error) {
    setCitas(prev => prev.map(c => c.id === modalReprogramar.id ? { ...c, status: 'reprogramacion_pendiente', reprogramacion_fecha: reprogramarFecha, reprogramacion_hora_inicio: reprogramarHoraInicio, reprogramacion_hora_fin: reprogramarHoraFin } : c))
    setCitasMenter(prev => prev.map(c => c.id === modalReprogramar.id ? { ...c, status: 'reprogramacion_pendiente' } : c))

    // Email al otro participante notificando la solicitud
    const esMenter = isMenter
    const solicitante = esMenter ? modalReprogramar.menter_name : modalReprogramar.client_name
    const destinatarioEmail = esMenter ? (modalReprogramar.client_email || '') : (user?.email || '')
    const destinatarioName  = esMenter ? modalReprogramar.client_name : modalReprogramar.menter_name
    if (destinatarioEmail) {
      dispararEmail('solicitud_reprogramacion', {
        destinatarioEmail,
        destinatarioName,
        solicitanteNombre: solicitante,
        citaOriginal: {
          date:      new Date(modalReprogramar.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }),
          startTime: modalReprogramar.start_time?.slice(0, 5) || '',
        },
        nuevaFecha:      new Date(reprogramarFecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        nuevaHoraInicio: reprogramarHoraInicio,
        nuevaHoraFin:    reprogramarHoraFin,
        appointmentId:   modalReprogramar.id,
      })
    }

    const otroUserIdRepro = esMenter ? modalReprogramar.client_id : modalReprogramar.menter_id
    if (otroUserIdRepro) {
      const { data: { session: sRepro } } = await supabase.auth.getSession()
      if (sRepro) {
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sRepro.access_token}` },
          body: JSON.stringify({
            user_id: otroUserIdRepro,
            title: 'Solicitud de cambio de horario',
            body: `${solicitante} propone mover tu cita al ${new Date(reprogramarFecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${reprogramarHoraInicio}.`,
            url: esMenter ? '/dashboard?tab=mis-citas' : '/dashboard?tab=citas',
          }),
        }).catch(() => {})
      }
    }

    setModalReprogramar(null)
    setReprogramarFecha('')
    setReprogramarHoraInicio('')
    setReprogramarHoraFin('')
    setReprogramarNotas('')
  }
  setReprogramarLoading(false)
}

const handleAceptarReprogramacion = async (c: any) => {
  const { error } = await supabase
    .from('appointments')
    .update({
      date: c.reprogramacion_fecha,
      start_time: c.reprogramacion_hora_inicio,
      end_time: c.reprogramacion_hora_fin,
      reprogramacion_fecha: null,
      reprogramacion_hora_inicio: null,
      reprogramacion_hora_fin: null,
      reprogramacion_propuesta_por: null,
      reprogramacion_notas: null,
      status: 'confirmada',
      updated_at: new Date().toISOString()
    })
    .eq('id', c.id)
  if (!error) {
    const updated = {
      ...c,
      status: 'confirmada',
      date: c.reprogramacion_fecha,
      start_time: c.reprogramacion_hora_inicio,
      end_time: c.reprogramacion_hora_fin,
      reprogramacion_fecha: null,
      reprogramacion_hora_inicio: null,
      reprogramacion_hora_fin: null,
      reprogramacion_propuesta_por: null,
      reprogramacion_notas: null,
    }
    setCitas(prev => prev.map(x => x.id === c.id ? updated : x))
    setCitasMenter(prev => prev.map(x => x.id === c.id ? updated : x))

    // Email al que propuso la reprogramación indicando que fue aceptada
    const propuestoPor = c.reprogramacion_propuesta_por  // 'menter' | 'persona'
    const destinatarioEmail = propuestoPor === 'menter' ? (user?.email || '') : (c.client_email || '')
    const destinatarioName  = propuestoPor === 'menter' ? c.menter_name : c.client_name
    const contraparte       = propuestoPor === 'menter' ? c.client_name : c.menter_name
    if (destinatarioEmail) {
      dispararEmail('reprogramacion_aceptada', {
        destinatarioEmail,
        destinatarioName,
        contraparte,
        nuevaFecha:      new Date(c.reprogramacion_fecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        nuevaHoraInicio: c.reprogramacion_hora_inicio?.slice(0, 5) || '',
        nuevaHoraFin:    c.reprogramacion_hora_fin?.slice(0, 5) || '',
      })
    }

    const propuestoPorId = propuestoPor === 'menter' ? c.menter_id : c.client_id
    if (propuestoPorId) {
      const { data: { session: sAcept } } = await supabase.auth.getSession()
      if (sAcept) {
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sAcept.access_token}` },
          body: JSON.stringify({
            user_id: propuestoPorId,
            title: 'Cambio de horario aceptado',
            body: `${contraparte} aceptó tu solicitud de cambio al ${new Date(c.reprogramacion_fecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}.`,
            url: propuestoPor === 'menter' ? '/dashboard?tab=citas' : '/dashboard?tab=mis-citas',
          }),
        }).catch(() => {})
      }
    }
  }
}

const handleRechazarReprogramacion = async (c: any) => {
  const { error } = await supabase
    .from('appointments')
    .update({
      reprogramacion_fecha: null,
      reprogramacion_hora_inicio: null,
      reprogramacion_hora_fin: null,
      reprogramacion_propuesta_por: null,
      reprogramacion_notas: null,
      status: 'cancelada',
      updated_at: new Date().toISOString()
    })
    .eq('id', c.id)
  if (!error) {
    const updated = {
      ...c,
      status: 'cancelada',
      reprogramacion_fecha: null,
      reprogramacion_hora_inicio: null,
      reprogramacion_hora_fin: null,
      reprogramacion_propuesta_por: null,
      reprogramacion_notas: null,
    }
    setCitas(prev => prev.map(x => x.id === c.id ? updated : x))
    setCitasMenter(prev => prev.map(x => x.id === c.id ? updated : x))

    // Email al que propuso indicando que fue rechazada
    const propuestoPor = c.reprogramacion_propuesta_por
    const destinatarioEmail = propuestoPor === 'menter' ? (user?.email || '') : (c.client_email || '')
    const destinatarioName  = propuestoPor === 'menter' ? c.menter_name : c.client_name
    const contraparte       = propuestoPor === 'menter' ? c.client_name : c.menter_name
    if (destinatarioEmail) {
      dispararEmail('reprogramacion_rechazada', {
        destinatarioEmail,
        destinatarioName,
        contraparte,
        fechaOriginal: new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        horaOriginal:  c.start_time?.slice(0, 5) || '',
      })
    }

    const propuestoPorId = propuestoPor === 'menter' ? c.menter_id : c.client_id
    if (propuestoPorId) {
      const { data: { session: sRech } } = await supabase.auth.getSession()
      if (sRech) {
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sRech.access_token}` },
          body: JSON.stringify({
            user_id: propuestoPorId,
            title: 'Cambio de horario rechazado',
            body: `${contraparte} no aceptó el cambio. La cita fue cancelada.`,
            url: propuestoPor === 'menter' ? '/dashboard?tab=citas' : '/dashboard?tab=mis-citas',
          }),
        }).catch(() => {})
      }
    }
  }
}

// Fetch mis certificados
useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'certificados') return
  setMisCertificadosLoading(true)
  supabase
    .from('event_certificates')
    .select('*, event:events(title, date, cover_image, certificate_text, certificate_firma, presenter)')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })
    .then(({ data }) => {
      setMisCertificados(data || [])
      setMisCertificadosLoading(false)
    })
}, [activeTab, user?.id])

// Fetch eventos del Menter
useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'eventos') return
  if (meta?.role !== 'menter') return

  setEventosLoading(true)
  supabase
    .from('events')
    .select('*, event_tickets(*), event_registrations(count)')
    .eq('menter_id', user.id)
    .order('date', { ascending: true })
    .then(({ data }) => {
      setEventos(data || [])
      setEventosLoading(false)
    })
}, [activeTab, user?.id])

// Fetch eventos públicos
useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'eventos') return

  supabase
    .from('events')
    .select('id, title, description, cover_image, date, start_time, end_time, modality, location_address, meeting_link, max_participants, presenter, status, menter_id, menter:menter_public_profiles(nombre, avatar_url, enlaces)')
    .eq('status', 'publicado')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .then(({ data, error }) => {
      if (!error) setEventosPublicos(data || [])
      setEventosPublicosLoaded(true)
    })
}, [activeTab, user?.id])

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'objetivos') return
  if (meta?.role !== 'empresa') return
  cargarObjetivosEmpresa()
}, [activeTab, user?.id])

useEffect(() => {
  if (!user?.id) return
  if (activeTab !== 'roadmap') return
  if (roadmapVistaActiva !== 'ruta_empresas') return
  if (!meta) return
  if (meta.role !== 'menter') return
  cargarRutaEmpresas()
}, [activeTab, roadmapVistaActiva, user?.id, meta?.role])

const cargarObjetivosEmpresa = async () => {
  if (!user?.id) return
  setObjEmpresaLoading(true)

  const { data: existentes } = await supabase
    .from('empresa_objetivos')
    .select('*')
    .eq('empresa_id', user.id)
    .order('created_at', { ascending: true })

  if (existentes && existentes.length > 0) {
    const ids = existentes.map((o: any) => o.id)

    // Cargar hitos del objetivo
    const { data: hitos } = await supabase
      .from('empresa_hitos')
      .select('*')
      .in('objetivo_id', ids)

    // Cargar colaboradores de los objetivos de esta empresa
    const { data: teamColabs } = await supabase
      .from('empresa_objetivo_colaboradores')
      .select('*')
      .in('objetivo_id', ids)

    // Cargar datos de usuarios de colaboradores
    const colabUserIds = (teamColabs || []).map((c: any) => c.user_id)
    const { data: colabUsers } = colabUserIds.length > 0
      ? await supabase
          .from('user_public_data')
          .select('id, nombre, apellidos')
          .in('id', colabUserIds)
      : { data: [] }

    // Combinar teamColabs con datos de usuario
    const colabsConUser = (teamColabs || []).map((c: any) => {
      const u = (colabUsers || []).find((u: any) => u.id === c.user_id)
      return { ...c, user: { raw_user_meta_data: u || {} } }
    })

    // Cargar menters asignados
    const { data: mentersAsignados } = await supabase
      .from('empresa_objetivo_menter')
      .select('*')
      .in('objetivo_id', ids)

    // Cargar hitos de colaboradores
    const colabIds = (colabsConUser || []).map((c: any) => c.id)
    const { data: colabHitos } = colabIds.length > 0
      ? await supabase.from('empresa_colaborador_hitos').select('*').in('colaborador_id', colabIds)
      : { data: [] }

    // Combinar
    const combined = existentes.map((obj: any) => ({
      ...obj,
      empresa_hitos: (hitos || []).filter((h: any) => h.objetivo_id === obj.id),
    }))
    setObjEmpresa(combined)

    // Mapas por objetivo_id
    const colabMap: Record<string, any[]> = {}
    const menterMap: Record<string, any> = {}
    ;(mentersAsignados || []).forEach((m: any) => {
      menterMap[m.objetivo_id] = m
    })
    setObjMenters(menterMap)
    const colabHitoMap: Record<string, any[]> = {}

    ;(colabsConUser || []).forEach((c: any) => {
      if (!colabMap[c.objetivo_id]) colabMap[c.objetivo_id] = []
      colabMap[c.objetivo_id].push(c)
    })
    ;(colabHitos || []).forEach((h: any) => {
      if (!colabHitoMap[h.colaborador_id]) colabHitoMap[h.colaborador_id] = []
      colabHitoMap[h.colaborador_id].push(h)
    })

    setObjColaboradores(colabMap)
    setObjMenters(menterMap)
    setObjColabHitos(colabHitoMap)

  } else {
    const metaRespuestas = meta?.respuestas as Record<string, unknown> | undefined
    const areas = metaRespuestas?.areas as string[] | undefined
    if (areas && areas.length > 0) {
      const nuevos = await Promise.all(
        areas.map(async (area: string) => {
          const { data } = await supabase
            .from('empresa_objetivos')
            .insert({ empresa_id: user.id, titulo: area, area: area, status: 'activo' })
            .select('*')
            .single()
          return data ? { ...data, empresa_hitos: [] } : null
        })
      )
      setObjEmpresa(nuevos.filter(Boolean))
    }
  }
  setObjEmpresaLoading(false)
}

const cargarRutaEmpresas = async () => {
  if (!user?.id) return
  setRutaEmpresasLoading(true)

  // 1. Asignaciones de este Menter a objetivos de empresa
  const { data: asignaciones } = await supabase
    .from('empresa_objetivo_menter')
    .select('*, objetivo:objetivo_id(*)')
    .eq('menter_id', user.id)

  if (!asignaciones || asignaciones.length === 0) {
    setRutaEmpresasData([])
    setRutaEmpresasLoading(false)
    return
  }

  const objIds = asignaciones.map((a: any) => a.objetivo_id)

  // 2. Hitos del equipo (empresa_hitos)
  const { data: hitos } = await supabase
    .from('empresa_hitos')
    .select('*')
    .in('objetivo_id', objIds)

  // 3. Colaboradores de cada objetivo
  const { data: colabs } = await supabase
    .from('empresa_objetivo_colaboradores')
    .select('*')
    .in('objetivo_id', objIds)

  // 4. Hitos propios de cada colaborador
  const colabIds = (colabs || []).map((c: any) => c.id)
  const { data: colabHitosRaw } = colabIds.length > 0
    ? await supabase.from('empresa_colaborador_hitos').select('*').in('colaborador_id', colabIds)
    : { data: [] }

  // 5. Nombres de colaboradores
  const colabUserIds = (colabs || []).map((c: any) => c.user_id)
  const { data: colabUsers } = colabUserIds.length > 0
    ? await supabase.from('user_public_data').select('id, nombre, apellidos').in('id', colabUserIds)
    : { data: [] }

  // 6. Combinar
  const colabHitoMap: Record<string, any[]> = {}
  ;(colabHitosRaw || []).forEach((h: any) => {
    if (!colabHitoMap[h.colaborador_id]) colabHitoMap[h.colaborador_id] = []
    colabHitoMap[h.colaborador_id].push(h)
  })
  setRutaEmpresasColabHitos(colabHitoMap)

  const combined = asignaciones.map((a: any) => ({
    ...a,
    objetivo: {
      ...a.objetivo,
      empresa_hitos: (hitos || []).filter((h: any) => h.objetivo_id === a.objetivo_id),
      colaboradores: (colabs || [])
        .filter((c: any) => c.objetivo_id === a.objetivo_id)
        .map((c: any) => ({
          ...c,
          user: (colabUsers || []).find((u: any) => u.id === c.user_id) || {},
        })),
    },
  }))

  setRutaEmpresasData(combined)
  setRutaEmpresasLoading(false)
}

  useEffect(() => {
    const init = async () => {
  // Esperar hasta 3s para que el cliente de Supabase procese el hash OAuth
  let { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    session = await new Promise(resolve => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        subscription.unsubscribe()
        resolve(s)
      })
      setTimeout(() => resolve(null as any), 3000)
    })
  }
  if (!session) { window.location.href = '/'; return }

  // Cerrar sesión si el usuario eligió "no recordar" y ya no hay sessionStorage activo
  const noRemember = localStorage.getItem('giro_no_remember')
  const activeSession = sessionStorage.getItem('giro_session_active')
  if (noRemember && !activeSession) {
    await supabase.auth.signOut()
    localStorage.removeItem('giro_no_remember')
    window.location.href = '/'
    return
  }

  // Validar que el usuario sigue activo en el servidor (detecta cuentas eliminadas/baneadas)
  const { data: { user: freshUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !freshUser || freshUser.app_metadata?.deleted) {
    await supabase.auth.signOut()
    window.location.href = '/'
    return
  }

  const u = session.user
  let m = u.user_metadata as UserMeta & { full_name?: string; name?: string; picture?: string }

  const nombre    = m.nombre    || m.full_name?.split(' ')[0]                || m.name?.split(' ')[0]                || ''
  const apellidos = m.apellidos || m.full_name?.split(' ').slice(1).join(' ') || m.name?.split(' ').slice(1).join(' ') || ''
  const googleAvatar = m.avatar_url || m.picture || null

  setUser({ email: u.email!, id: u.id })

  // Verificar si es colaborador (asesor de soporte)
  fetch('/api/admin/staff').then(r => r.ok ? r.json() : null).then(d => {
    if (d?.role === 'asesor') setIsStaff(true)
  }).catch(() => {})

  // Detectar si es usuario de Google OAuth
  const isGoogleUser = u.app_metadata?.provider === 'google' ||
    (u.app_metadata?.providers as string[] | undefined)?.includes('google') || false

  // Verificación de email por código (solo usuarios email/password, no Google)
  if (!isGoogleUser) {
    const { data: { session: verSession } } = await supabase.auth.getSession()
const verRes = await fetch('/api/auth/send-verification', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${verSession?.access_token}` },
})
    const verData = await verRes.json()
    if (!verData.already_verified && verData.ok) {
      setShowVerification(true)
    }
  }

  // Consumir pendingRole para usuarios Google que aún no tienen role asignado
  if (!m.role && isGoogleUser && typeof window !== 'undefined') {
    const pending = localStorage.getItem('pendingRole')
    if (pending) {
      await supabase.auth.updateUser({ data: { ...m, role: pending } })
      m = { ...m, role: pending as any }
      localStorage.removeItem('pendingRole')
    }
  }

  // Leer todos los campos de perfil desde la tabla (fuente única de verdad)
  const { data: perfil, error: perfilError } = await supabase
    .from('user_profiles')
    .select('telefono, pais, cumpleanos, empresa, cargo')
    .eq('user_id', u.id)
    .single()

  // Si no existe la fila (registro con email-confirmation sin sesión activa en signUp),
  // la creamos ahora que sí tenemos sesión válida.
  if (perfilError?.code === 'PGRST116' || !perfil) {
    const { data: { session: authSession } } = await supabase.auth.getSession()
    if (authSession?.access_token) {
      fetch('/api/auth/register-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          userId:     u.id,
          empresa:    m.empresa  || null,
          cargo:      m.cargo    || null,
          respuestas: m.respuestas || null,
        }),
      }).catch(() => {})
    }
  }

  const telefono   = perfil?.telefono   || ''
  const pais       = perfil?.pais       || ''
  const cumpleanos = perfil?.cumpleanos || ''
  const empresa    = perfil?.empresa    || m.empresa || ''
  const cargo      = perfil?.cargo      || m.cargo   || ''

  setMeta({ ...m, nombre, apellidos, telefono, pais, cumpleanos, empresa, cargo })
  if (googleAvatar) setAvatarUrl(googleAvatar)
  setEditForm({ nombre, apellidos, telefono, pais, empresa, cargo, cumpleanos })

  // Modal de completar perfil: para cualquier usuario con datos faltantes
  const missingFields = {
  nombre:     !m.nombre,
  apellidos:  !m.apellidos,
  telefono:   false,  // opcional, no forzar
  pais:       false,  // opcional, no forzar
  cumpleanos: false,  // opcional, no forzar
}

if (missingFields.nombre || missingFields.apellidos) {
  setMissingProfileFields(missingFields)
  setCompleteForm({
    nombre:     nombre,
    apellidos:  apellidos,
    telefono:   perfil?.telefono  || '',
    pais:       perfil?.pais      || '',
    cumpleanos: perfil?.cumpleanos || '',
  })
  setShowCompleteProfile(true)
}

  await supabase.rpc('sincronizar_insignias_menter', { p_menter_id: u.id })
  supabase.from('frases_del_dia')
  .select('frase, autor')
  .eq('fecha', new Date().toISOString().split('T')[0])
  .single()
  .then(({ data }) => { if (data) setFraseDelDia(data) })

      if (m.role === 'menter') {
        fetch('/api/promos/active').then(r => r.json()).then(({ promo }) => { if (promo) setActivePromo(promo) }).catch(() => {})
        const { data: mb } = await supabase.from('menter_memberships').select('*').eq('menter_id', u.id).single()
        if (mb) setMembership(mb)
        else {
          await supabase.from('menter_memberships').upsert({ menter_id: u.id, plan: 'free', billing_cycle: 'manual' }, { onConflict: 'menter_id' })
          setMembership({ plan: 'free', billing_cycle: 'manual', starts_at: new Date().toISOString(), expires_at: null, is_active: true })
        }
        const { data: mp } = await supabase.from('menter_profile').select('*').eq('menter_id', u.id).single()
        if (mp) setMenterProfile({
          casos_que_atiende: mp.casos_que_atiende || [], casos_otros: mp.casos_otros || '', bio: mp.bio || '',
          precio_sesion: mp.precio_sesion?.toString() || '', duracion_sesion: mp.duracion_sesion?.toString() || '60',
          anticipacion_minima: mp.anticipacion_minima?.toString() || '24', modalidad: mp.modalidad || 'ambas',
          direccion: mp.direccion || '', meet_link: mp.meet_link || '',
          descuento_menters: mp.descuento_menters || false, declaracion_jurada: mp.declaracion_jurada || false,
          idiomas: mp.idiomas || [], formacion: mp.formacion || [], experiencia_laboral: mp.experiencia_laboral || [],
          numero_colegiatura: mp.numero_colegiatura || '',
          enlaces: mp.enlaces || { youtube:'',linkedin:'',whatsapp:'',instagram:'',facebook:'',tiktok:'',x:'' },
          descuento_porcentaje: mp.descuento_porcentaje || undefined, 
          descuento_codigo: mp.descuento_codigo || '',                 
        })
        const { data: av } = await supabase.from('menter_availability').select('*').eq('menter_id', u.id)
        if (av && av.length > 0) setAvailability(DIAS_SEMANA.map((_, i) => {
          const ex = av.find((a: Availability & { menter_id: string }) => a.day_of_week === i)
          return ex ? { id: ex.id, day_of_week: i, start_time: ex.start_time, end_time: ex.end_time, is_active: ex.is_active }
                    : { day_of_week: i, start_time: '09:00', end_time: '18:00', is_active: false }
        }))
     }

      // Redirecciones antes de mostrar el dashboard
      if (typeof window !== 'undefined' && sessionStorage.getItem('giro_redirect_comunidad')) {
        sessionStorage.removeItem('giro_redirect_comunidad')
        const returnUrl = localStorage.getItem('returnUrl')
        if (returnUrl) { localStorage.removeItem('returnUrl'); window.location.href = returnUrl; return }
        window.location.href = '/comunidad'
        return
      }

      setLoading(false)

      // Vincular resultados de tests anónimos al usuario (por token o por email)
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        const pendingTestToken = typeof window !== 'undefined' && localStorage.getItem('pendingTestToken')
        const res = await fetch('/api/assessment/link-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSession?.access_token}`,
          },
          body: JSON.stringify({ session_token: pendingTestToken || null }),
        })
        if (res.ok && pendingTestToken) localStorage.removeItem('pendingTestToken')
      } catch { /* non-critical */ }

      // Welcome email pendiente (registro con email — diferido hasta tener sesión activa)
      const pendingRaw = typeof window !== 'undefined' && localStorage.getItem('pendingWelcomeEmail')
      if (pendingRaw) {
        localStorage.removeItem('pendingWelcomeEmail')
        try {
          const pending = JSON.parse(pendingRaw)
          const wName  = pending.userName  || `${nombre} ${apellidos}`.trim() || u.email
          const wEmail = pending.userEmail || u.email
          dispararEmail('bienvenida_dia1', { userName: wName, userEmail: wEmail })
        } catch {
          // si es string simple (usuarios Google pre-migración)
          const wName = `${nombre} ${apellidos}`.trim() || u.email
          dispararEmail('bienvenida_dia1', { userName: wName, userEmail: u.email })
        }
      }

      // Cargar reseñas del usuario
      const { data: resenas } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', u.id)
      if (resenas) {
        const map: Record<string, any> = {}
        resenas.forEach((r: any) => { map[r.appointment_id] = r })
        setMisResenas(map)
      }

    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    // Las de instrumentos son destino de los correos de evaluación (resumen de
    // resultados y aviso de créditos): sin ellas el enlace caía en otra pestaña.
    if (tabParam && ['perfil','editar','mis-citas','roadmap','destacados','escribir','eventos','comunidad','compras','objetivos','membresia','instrumentos','instrumentos_empresa','resultados_tests'].includes(tabParam)) {
      setActiveTab(tabParam as TabId)
    }
    // PayPal redirect de vuelta tras aprobar suscripción
    if (params.get('pp') === 'ok') {
      setActiveTab('membresia')
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'suscripcion_completada')
      }
      if (typeof window !== 'undefined' && (window as any).ttq) {
        (window as any).ttq.track('Subscribe')
      }
      fetch('/api/checkout/attempt', { method: 'PUT' }).catch(() => {})
      setTimeout(() => setPpModal({ type: 'success', msg: '¡Suscripción iniciada! PayPal activará tu plan en los próximos minutos. Recarga la página para ver tu nuevo plan.' }), 400)
      window.history.replaceState({}, '', window.location.pathname + (tabParam ? `?tab=${tabParam}` : ''))
    }

    // Tour para usuarios con perfil ya completo (no Google con datos faltantes)
    if (typeof window !== 'undefined' && !localStorage.getItem('giro_tour_done')) {
      const hasIncomplete = Object.values({
        nombre:     !m.nombre,
        apellidos:  !m.apellidos,
        telefono:   !perfil?.telefono,
        pais:       !perfil?.pais,
        cumpleanos: !perfil?.cumpleanos,
      }).some(Boolean) && isGoogleUser
      if (!hasIncomplete) {
        setTimeout(() => { setTourStep(0); setTourActive(true) }, 800)
      }
    }
    }
    init()
  }, [])

  useEffect(() => {
    if (!headerMenuOpen) return
    const close = () => setHeaderMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [headerMenuOpen])

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const guardarResena = async () => {
    if (!reviewModal || !user?.id) return
    setReviewSaving(true)
    const { error } = await supabase
      .from('reviews')
      .upsert({
        appointment_id: reviewModal.appointmentId,
        reviewer_id: user.id,
        reviewed_id: reviewModal.reviewedId,
        reviewer_role: meta?.role || 'persona',
        estrellas: reviewForm.estrellas,
        comentario: reviewForm.comentario || null,
        puntualidad: reviewForm.puntualidad,
        comunicacion: reviewForm.comunicacion,
        efectividad: reviewForm.efectividad,
      }, { onConflict: 'appointment_id,reviewer_id' })
    if (!error) {
      setMisResenas(prev => ({ ...prev, [reviewModal.appointmentId]: { ...reviewForm, reviewer_id: user.id } }))
      setReviewModal(null)
      setToastMsg('Resena guardada')
      setTimeout(() => setToastMsg(null), 3000)
    }
    setReviewSaving(false)
  }

  const compartirResena = (cita: any, resena: any) => {
    const menterData = menters.find(m => m.menter_id === cita.menter_id)
    sessionStorage.setItem('comunidad_draft_resena', JSON.stringify({
      menter_name:   cita.menter_name   || '',
      menter_avatar: menterData?.avatar_url || '',
      estrellas:     resena.estrellas,
      comentario:    resena.comentario  || '',
    }))
    router.push('/comunidad')
  }

 const handleSaveEdit = async () => {
  setEditSaving(true); setEditMsg(null)

  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/account/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({
      nombre:    editForm.nombre,
      apellidos: editForm.apellidos,
      telefono:  editForm.telefono,
      pais:      editForm.pais,
      cumpleanos: editForm.cumpleanos,
      empresa:   editForm.empresa || null,
      cargo:     editForm.cargo   || null,
    }),
  })

  setEditSaving(false)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    setEditMsg({ type: 'error', text: body.error || 'Error al guardar.' })
  } else {
    setMeta(prev => prev ? { ...prev, ...editForm } : prev)
    setEditMsg({ type: 'success', text: 'Datos actualizados' })
    setTimeout(() => setEditMsg(null), 4000)
    fetch('/api/account/sync-contact', { method: 'POST' }).catch(() => {})
  }
}

const handleCompleteProfile = async () => {
  if (missingProfileFields.nombre    && !completeForm.nombre.trim())    { alert('Por favor ingresa tu nombre'); return }
  if (missingProfileFields.apellidos && !completeForm.apellidos.trim()) { alert('Por favor ingresa tus apellidos'); return }
  if (missingProfileFields.telefono  && !completeForm.telefono.trim())  { alert('Por favor ingresa tu teléfono'); return }
  if (missingProfileFields.pais      && !completeForm.pais)             { alert('Por favor selecciona tu país'); return }
  if (missingProfileFields.cumpleanos && !completeForm.cumpleanos)      { alert('Por favor ingresa tu fecha de nacimiento'); return }

  setCompleteSaving(true)

  const { data: { session } } = await supabase.auth.getSession()
  const payload: Record<string, string | null> = {}
  if (missingProfileFields.nombre    || completeForm.nombre)    payload.nombre    = completeForm.nombre.trim()
  if (missingProfileFields.apellidos || completeForm.apellidos) payload.apellidos = completeForm.apellidos.trim()
  if (completeForm.telefono)   payload.telefono   = completeForm.telefono
  if (completeForm.pais)       payload.pais       = completeForm.pais
  if (completeForm.cumpleanos) payload.cumpleanos = completeForm.cumpleanos

  const res = await fetch('/api/account/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify(payload),
  })

  setCompleteSaving(false)
  if (res.ok) {
    setMeta(prev => prev ? { ...prev, ...completeForm } : prev)
    setMissingProfileFields({ nombre: false, apellidos: false, telefono: false, pais: false, cumpleanos: false })
    setShowCompleteProfile(false)
    fetch('/api/account/sync-contact', { method: 'POST' }).catch(() => {})

    if (typeof window !== 'undefined' && !localStorage.getItem('giro_tour_done')) {
      setTimeout(() => { setTourStep(0); setTourActive(true) }, 400)
    }

    const returnUrl = localStorage.getItem('returnUrl')
    if (returnUrl) { localStorage.removeItem('returnUrl'); window.location.href = returnUrl }
  }
}


  const handleVerifyCode = async () => {
    if (!verifyCode.trim() || verifyCode.trim().length !== 6) {
      setVerifyError('Ingresa el código de 6 dígitos'); return
    }
    setVerifySending(true); setVerifyError('')
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verifyCode.trim() }),
    })
    const data = await res.json()
    setVerifySending(false)
    if (data.ok) {
      setShowVerification(false)
    } else {
      setVerifyError(data.error || 'Código incorrecto')
    }
  }

  const handleResendCode = async () => {
    setVerifyResent(false); setVerifyError('')
    const { data: { session: resendSession } } = await supabase.auth.getSession()
await fetch('/api/auth/send-verification', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${resendSession?.access_token}` },
})
    setVerifyResent(true)
    setTimeout(() => setVerifyResent(false), 5000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar 5 MB'); return }
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl + '?t=' + Date.now())
      await supabase.auth.updateUser({ data: { ...meta, avatar_url: data.publicUrl } })
    } else {
      alert('Error al subir la imagen: ' + (error.message || 'intenta de nuevo'))
    }
    setAvatarUploading(false)
  }

  const handleSaveMenterProfile = async () => {
    if (!user) return
    if (!menterProfile.declaracion_jurada) { setMenterProfileMsg({ type: 'error', text: 'Debes aceptar la declaración jurada para guardar.' }); return }
    setMenterProfileSaving(true); setMenterProfileMsg(null)

    // Guardar disponibilidad junto con el perfil
    await supabase.from('menter_availability').delete().eq('menter_id', user.id)
    const activeDays = availability.filter(a => a.is_active)
    if (activeDays.length > 0) await supabase.from('menter_availability').insert(
      activeDays.map(a => ({
        menter_id: user.id, day_of_week: a.day_of_week, start_time: a.start_time, end_time: a.end_time,
        session_duration: parseInt(menterProfile.duracion_sesion) || 60,
        min_advance_hours: parseInt(menterProfile.anticipacion_minima) || 24,
        price: menterProfile.precio_sesion ? parseFloat(menterProfile.precio_sesion) : null,
        modality: menterProfile.modalidad, is_active: true,
      }))
    )

    const { error } = await supabase.from('menter_profile').upsert({
      descuento_porcentaje: menterProfile.descuento_porcentaje || null,
      descuento_codigo: menterProfile.descuento_codigo || null,
      menter_id: user.id,
      casos_que_atiende: menterProfile.casos_que_atiende, casos_otros: menterProfile.casos_otros || null,
      bio: menterProfile.bio || null,
      precio_sesion: menterProfile.precio_sesion ? parseFloat(menterProfile.precio_sesion) : null,
      duracion_sesion: parseInt(menterProfile.duracion_sesion) || 60,
      anticipacion_minima: parseInt(menterProfile.anticipacion_minima) || 24,
      modalidad: menterProfile.modalidad, direccion: menterProfile.direccion || null,
      meet_link: menterProfile.meet_link || null, descuento_menters: menterProfile.descuento_menters,
      declaracion_jurada: menterProfile.declaracion_jurada, idiomas: menterProfile.idiomas,
      formacion: menterProfile.formacion, experiencia_laboral: menterProfile.experiencia_laboral,
      numero_colegiatura: menterProfile.numero_colegiatura || null, enlaces: menterProfile.enlaces,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'menter_id' })
    setMenterProfileSaving(false)
    if (error) {
      console.error('Supabase error:', JSON.stringify(error))
      setMenterProfileMsg({ type: 'error', text: `Error: ${error.message}` })
    } else {
      setMenterProfileMsg({ type: 'success', text: '¡Perfil guardado!' })
      // Sync contacto Brevo con especialidades actualizadas
      fetch('/api/account/sync-contact', { method: 'POST' }).catch(() => {})
    }
  }

  const handleSaveAvailability = async () => {
    if (!user) return
    setAvailabilitySaving(true)
    await supabase.from('menter_availability').delete().eq('menter_id', user.id)
    const activeDays = availability.filter(a => a.is_active)
    if (activeDays.length > 0) await supabase.from('menter_availability').insert(
      activeDays.map(a => ({
        menter_id: user.id, day_of_week: a.day_of_week, start_time: a.start_time, end_time: a.end_time,
        session_duration: parseInt(menterProfile.duracion_sesion) || 60,
        min_advance_hours: parseInt(menterProfile.anticipacion_minima) || 24,
        price: menterProfile.precio_sesion ? parseFloat(menterProfile.precio_sesion) : null,
        modality: menterProfile.modalidad, is_active: true,
      }))
    )
    setAvailabilitySaving(false)
    setMenterProfileMsg({ type: 'success', text: '¡Disponibilidad guardada!' })
    setTimeout(() => setMenterProfileMsg(null), 4000)
  }

  const fetchMenters = async (overrideFiltros?: typeof filtros) => {
  setMentersLoading(true)
  const f = overrideFiltros || filtros
  const respuestasObj = meta?.respuestas as Record<string,unknown> | undefined
  const casosArray = respuestasObj
    ? Object.values(respuestasObj).flatMap(v => Array.isArray(v) ? v : [String(v)]).filter(v => CASOS_DISPONIBLES.includes(v as string)) as string[]
    : []
  const { data, error } = await supabase.rpc('get_matching_menters', {
    p_casos: casosArray.length > 0 ? casosArray : null,
  p_pais: f.pais || null,
  p_precio_max: f.precio_max ? parseFloat(f.precio_max) : null,
  p_especialidad: f.especialidad || null,
  p_solo_descuento: f.soloDescuento || false,    
  })
  if (!error && data) {
    setMenters(data as MenterResult[])
    const ids = (data as any[]).map(m => m.menter_id)
    if (ids.length > 0) {
      supabase.from('reviews').select('reviewed_id, estrellas').in('reviewed_id', ids)
        .then(({ data: rv }) => {
          if (rv) {
            const raw: Record<string, {sum: number, count: number}> = {}
            rv.forEach((r: any) => {
              if (!raw[r.reviewed_id]) raw[r.reviewed_id] = { sum: 0, count: 0 }
              raw[r.reviewed_id].sum += r.estrellas
              raw[r.reviewed_id].count += 1
            })
            const ratings: Record<string, {avg: number, count: number}> = {}
            Object.entries(raw).forEach(([k, v]) => {
              ratings[k] = { avg: Math.round(v.sum / v.count * 10) / 10, count: v.count }
            })
            setMenterRatings(ratings)
          }
        })
    }
  }
  setMentersLoading(false)
}

const cargarIngresos = async () => {
  if (!user?.id || !isMenter) return
  setIngresosLoading(true)

  const fechaDesde = `${ingresosDesde}-01`
  const [hY, hM] = ingresosHasta.split('-').map(Number)
  const ultimoDia = new Date(hY, hM, 0).getDate()
  const fechaHasta = `${ingresosHasta}-${ultimoDia}`

  // Sesiones completadas del Menter en el período
  let querySesiones = supabase
    .from('appointments')
    .select('id, client_name, date, price, payment_status, status, modality')
    .eq('menter_id', user.id)
    .eq('status', 'completada')
    .gte('date', fechaDesde)
    .lte('date', fechaHasta)
    .order('date', { ascending: false })

  if (ingresosEstado !== 'todos') {
    querySesiones = querySesiones.eq('payment_status', ingresosEstado)
  }

  if (ingresosFuente === 'todas' || ingresosFuente === 'sesion') {
    const { data: sesiones } = await querySesiones
    setIngresosSesiones(sesiones || [])
  } else {
    setIngresosSesiones([])
  }

  // Eventos del Menter en el período — query en dos pasos
  if (ingresosFuente === 'todas' || ingresosFuente === 'evento') {
    const { data: misEventos } = await supabase
      .from('events')
      .select('id, title, date')
      .eq('menter_id', user.id)
      .gte('date', fechaDesde)
      .lte('date', fechaHasta)

    if (misEventos && misEventos.length > 0) {
      const eventIds = misEventos.map((e: any) => e.id)

      const { data: registraciones } = await supabase
        .from('event_registrations')
        .select('id, quantity, total_price, payment_status, event_id, ticket:ticket_id(name, price)')
        .in('event_id', eventIds)

      // Agrupar por evento
      const eventoMap: Record<string, any> = {}
      misEventos.forEach((e: any) => {
        eventoMap[e.id] = { id: e.id, titulo: e.title, fecha: e.date, recaudado: 0, tickets: 0 }
      })
      ;(registraciones || []).forEach((r: any) => {
        if (eventoMap[r.event_id]) {
          eventoMap[r.event_id].recaudado += r.total_price || 0
          eventoMap[r.event_id].tickets   += r.quantity || 1
        }
      })

      setIngresosEventos(Object.values(eventoMap))
    } else {
      setIngresosEventos([])
    }
  } else {
    setIngresosEventos([])
  }

  setIngresosLoading(false)
}

const fetchFeaturedMenters = async () => {
  setFeaturedLoading(true)
  console.log('fetchFeaturedMenters llamado')
  const { data, error } = await supabase.rpc('get_featured_menters')
  console.log('featured data:', data, 'error:', error)
  if (!error && data) setFeaturedMenters(data as MenterResult[])
  setFeaturedLoading(false)
}

  const toggleCaso   = (caso: string)   => setMenterProfile(prev => ({ ...prev, casos_que_atiende: prev.casos_que_atiende.includes(caso) ? prev.casos_que_atiende.filter(c => c !== caso) : [...prev.casos_que_atiende, caso] }))
  const toggleIdioma = (idioma: string) => setMenterProfile(prev => ({ ...prev, idiomas: prev.idiomas.includes(idioma) ? prev.idiomas.filter(i => i !== idioma) : [...prev.idiomas, idioma] }))
  const switchTab    = (tab: TabId)     => { setActiveTab(tab); setSidebarOpen(false) }

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#421869' }}>
      <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" autoplay loop style={{ width: 200, height: 200 }} />
    </div>
  )

  const isMenter   = meta?.role === 'menter'
  const firstName  = meta?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const plan       = membership?.plan || 'free'
  const planInfo   = PLANES[plan]
  const canPremium = ['premium','master'].includes(plan)
  const initials   = `${meta?.nombre?.[0]||''}${meta?.apellidos?.[0]||''}`.toUpperCase() || '?'
  const respuestas = meta?.respuestas as Record<string, unknown> | undefined

  const menuItems: { id: TabId; icon: IconKey; label: string }[] = isMenter ? [
    { id: 'perfil',     icon: 'perfil',     label: 'Mi Perfil'   },
    { id: 'perfil-pro', icon: 'destacados', label: 'Perfil Pro'  },
    { id: 'membresia',  icon: 'membresia',  label: 'Membresía'   },
    { id: 'citas',      icon: 'citas',      label: 'Agenda'       },
    { id: 'destacados', icon: 'directorio', label: 'Directorio'  },
    { id: 'mis-citas', icon: 'citas',       label: 'Mis Citas' },
    { id: 'roadmap',        icon: 'roadmap',  label: 'Roadmap'        },
    { id: 'instrumentos' as TabId, icon: 'instrumentos' as IconKey, label: 'Instrumentos' },
    { id: 'ingresos',       icon: 'ingresos', label: 'Ingresos'       },
    { id: 'escribir',   icon: 'escribir',   label: 'Blog'        },
    { id: 'eventos',    icon: 'eventos',    label: 'Eventos'     },
    { id: 'comunidad', icon: 'directorio', label: 'Comunidad' },
    { id: 'compras',    icon: 'compras',    label: 'Compras'     },
    { id: 'certificados', icon: 'certificados', label: 'Certificados' },
    { id: 'editar',     icon: 'editar',     label: 'Editar'      },
  ] : [
    
    { id: 'perfil',     icon: 'perfil',     label: 'Mi Perfil'   },
    { id: 'editar',     icon: 'editar',     label: 'Editar'      },
    { id: 'mis-citas',  icon: 'citas',      label: 'Mis Citas'   },
    { id: 'roadmap',    icon: 'roadmap',    label: 'Mi Ruta'     },
    ...(meta?.role === 'empresa'
      ? [
          { id: 'objetivos' as TabId,            icon: 'roadmap'        as IconKey, label: 'Objetivos'      },
          { id: 'instrumentos_empresa' as TabId, icon: 'instrumentos'   as IconKey, label: 'Instrumentos'   },
          { id: 'resultados_tests' as TabId,     icon: 'resultados'     as IconKey, label: 'Mis Resultados' },
        ]
      : [{ id: 'resultados_tests' as TabId,      icon: 'resultados'     as IconKey, label: 'Mis Resultados' }]),
    { id: 'destacados', icon: 'directorio', label: 'Menters'     },
    { id: 'escribir',    icon: 'escribir',    label: 'Blog'      }, 
    { id: 'eventos',     icon: 'eventos',     label: 'Eventos'   },
    { id: 'comunidad', icon: 'directorio', label: 'Comunidad' },  
    { id: 'compras',       icon: 'compras',       label: 'Compras'      },
    { id: 'certificados',  icon: 'certificados',  label: 'Certificados' },
  ]

  // ─── Tour ────────────────────────────────────────────────────────────────────
  type TourStep = { icon: IconKey; tab?: TabId; title: string; desc: string }
  const tourSteps: TourStep[] = isMenter ? [
    { icon: 'perfil',      title: '¡Bienvenido a Giro Lab!', desc: 'Esta es tu plataforma de bienestar. Te mostramos las secciones clave para que puedas sacarle el máximo provecho desde el primer día.' },
    { icon: 'comunidad',   title: 'Menú de navegación (☰)', desc: 'El ícono ☰ en la esquina superior derecha abre el menú rápido: volver a Comunidad, crear acceso directo (instalar la app), atención al cliente y cerrar sesión.' },
    { icon: 'destacados',  tab: 'perfil-pro',   title: 'Perfil Pro', desc: 'Configura tu perfil profesional: especialidades, precios, disponibilidad y enlaces. Este es el perfil que verán tus futuros clientes.' },
    { icon: 'citas',       tab: 'citas',         title: 'Agenda', desc: 'Aquí gestionas las solicitudes de cita de tus clientes: confirma, rechaza o reprograma sesiones. Las solicitudes pendientes aparecen con una notificación.' },
    { icon: 'roadmap',     tab: 'roadmap',       title: 'Roadmap', desc: 'Diseña y monitorea la ruta de bienestar de cada uno de tus clientes. Agrega objetivos e hitos para llevar un seguimiento claro del progreso.' },
    { icon: 'ingresos',    tab: 'ingresos',      title: 'Ingresos', desc: 'Visualiza tus ingresos por sesiones y eventos. Filtra por período y exporta el historial para llevar el control de tu actividad.' },
    { icon: 'escribir',    tab: 'escribir',      title: 'Blog', desc: 'Publica artículos de bienestar para posicionarte como referente. El contenido que escribas será visible para toda la comunidad.' },
    { icon: 'membresia',   tab: 'membresia',     title: '¡Elige tu plan y despega!', desc: 'Los planes Starter y Premium desbloquean instrumentos de evaluación, reportes de ingresos y más herramientas para hacer crecer tu práctica. ¡Comienza hoy!' },
  ] : meta?.role === 'empresa' ? [
    { icon: 'directorio',     title: '¡Bienvenido a Giro Lab!', desc: 'Esta es tu plataforma de bienestar organizacional. Te mostramos las secciones clave para que tu equipo empiece a transformarse.' },
    { icon: 'comunidad',      title: 'Menú de navegación (☰)', desc: 'El ícono ☰ en la esquina superior derecha abre el menú rápido: volver a Comunidad, crear acceso directo (instalar la app), atención al cliente y cerrar sesión.' },
    { icon: 'perfil',         tab: 'perfil',               title: 'Mi Perfil', desc: 'Aquí puedes ver y personalizar la información de tu cuenta. Agrega una foto, completa tus datos y mantén tu perfil al día.' },
    { icon: 'citas',          tab: 'mis-citas',             title: 'Mis Citas', desc: 'Consulta y gestiona tus sesiones con Menters. Puedes ver el historial, solicitar reprogramaciones o cancelar con anticipación.' },
    { icon: 'roadmap',        tab: 'objetivos',             title: 'Objetivos Empresariales', desc: 'Define los objetivos de bienestar de tu organización, asigna colaboradores y Menters, y monitorea el avance con hitos medibles.' },
    { icon: 'instrumentos',   tab: 'instrumentos_empresa',  title: 'Instrumentos', desc: 'Aplica evaluaciones psicológicas validadas a tu equipo para medir clima laboral, inteligencia emocional y otras dimensiones.' },
    { icon: 'resultados',     tab: 'resultados_tests',      title: 'Mis Resultados', desc: 'Consulta los resultados de los tests que tú mismo hayas completado. Son una guía de autoconocimiento para tu proceso personal.' },
    { icon: 'directorio',     tab: 'destacados',            title: '¡Encuentra a tu Menter ideal!', desc: 'Explora el directorio de profesionales de bienestar validados. Filtra por especialidad, precio o país y agenda la primera sesión para tu equipo hoy mismo.' },
  ] : [
    { icon: 'directorio',    title: '¡Bienvenido a Giro Lab!', desc: 'Tu espacio de bienestar personal. Te mostramos las secciones clave para que comiences tu camino hacia el bienestar.' },
    { icon: 'comunidad',     title: 'Menú de navegación (☰)', desc: 'El ícono ☰ en la esquina superior derecha abre el menú rápido: volver a Comunidad, crear acceso directo (instalar la app), atención al cliente y cerrar sesión.' },
    { icon: 'perfil',        tab: 'perfil',            title: 'Mi Perfil', desc: 'Aquí puedes ver y personalizar tu información. Agrega una foto, revisa tus insignias y accede rápidamente a tus datos.' },
    { icon: 'citas',         tab: 'mis-citas',         title: 'Mis Citas', desc: 'Consulta y gestiona tus sesiones con Menters. Puedes ver el historial, solicitar reprogramaciones y dejar reseñas.' },
    { icon: 'roadmap',       tab: 'roadmap',           title: 'Mi Ruta de Bienestar', desc: 'Tu Menter diseña aquí tu plan personalizado. Sigue el progreso de tus objetivos e hitos semana a semana.' },
    { icon: 'resultados',    tab: 'resultados_tests',  title: 'Mis Resultados', desc: 'Consulta los resultados de los instrumentos que hayas completado. Son una guía de autoconocimiento para tu proceso.' },
    { icon: 'eventos',       tab: 'eventos',           title: 'Eventos', desc: 'Descubre talleres y webinars de la comunidad. Inscríbete y obtén certificados de participación.' },
    { icon: 'directorio',    tab: 'destacados',        title: '¡Agenda tu primera sesión!', desc: 'Explora nuestro directorio de Menters certificados. Filtra por especialidad, modalidad o precio y da el primer paso hacia tu bienestar hoy mismo.' },
  ]

  const closeTour = () => {
    setTourActive(false)
    localStorage.setItem('giro_tour_done', '1')
  }
  const tourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      const next = tourStep + 1
      setTourStep(next)
      const tab = tourSteps[next].tab
      if (tab) switchTab(tab)
    } else {
      closeTour()
    }
  }
  const tourPrev = () => {
    if (tourStep > 0) {
      const prev = tourStep - 1
      setTourStep(prev)
      const tab = tourSteps[prev].tab
      if (tab) switchTab(tab)
    }
  }

  // ─── Render helpers ──────────────────────────────────────────────────────────
  const planBadge = (p: string) => {
    const pi = PLANES[p] || PLANES.free
    return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: pi.bg, color: pi.color, letterSpacing: 0.5 }}>{pi.emoji} {pi.label.toUpperCase()}</span>
  }
  const modalidadLabel: Record<string, string> = { video: 'Virtual', presencial: 'Presencial', ambas: 'Virtual · Presencial' }

  const renderProximamente = (titulo: string, emoji: string) => (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>{emoji}</div>
      <h3 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', fontSize: 24, marginBottom: 10 }}>{titulo}</h3>
      <p style={{ color: '#666', fontSize: 16 }}>Esta sección estará disponible muy pronto.</p>
    </div>
  )

  const renderUpgradeRequired = (titulo: string) => (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <h3 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', fontSize: 24, marginBottom: 10 }}>{titulo}</h3>
      <p style={{ color: '#666', fontSize: 16, marginBottom: 24 }}>Esta función está disponible a partir del plan <strong>Premium</strong>.</p>
      <button onClick={() => switchTab('membresia')} style={{ background: '#6a1b9a', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Ver planes →</button>
    </div>
  )

  const INSIGNIAS_CLIENTE = [
  { id: 'primer_paso',       nombre: 'Primer paso',           color: '#3C3489', bg: '#EEEDFE', desc: 'Primer objetivo completado'           },
  { id: 'en_camino',         nombre: 'En camino',             color: '#085041', bg: '#E1F5EE', desc: 'Superaste el 50% del roadmap'          },
  { id: 'transformacion',    nombre: 'Transformación lograda',color: '#633806', bg: '#FAEEDA', desc: '100% del roadmap completado'           },
  { id: 'constancia',        nombre: 'Constancia',            color: '#72243E', bg: '#FBEAF0', desc: '4 semanas de actividad continua'       },
  { id: 'colaborador',       nombre: 'Colaborador activo',    color: '#0C447C', bg: '#E6F1FB', desc: '5 o más objetivos propios creados'     },
  { id: 'equilibrio',        nombre: 'Equilibrio total',      color: '#27500A', bg: '#EAF3DE', desc: 'Objetivos en 4 áreas distintas'        },
]
 
const INSIGNIAS_MENTER = [
  { id: 'menter_destacado',  nombre: 'Menter destacado',      color: '#3C3489', bg: '#EEEDFE', desc: 'Valoración promedio 4.8+'             },
  { id: 'red_activa',        nombre: 'Red activa',            color: '#085041', bg: '#E1F5EE', desc: '5+ clientes con roadmap activo'        },
  { id: 'guia_constante',    nombre: 'Guía constante',        color: '#633806', bg: '#FAEEDA', desc: 'Actualizaciones semanales por un mes'  },
  { id: 'transformador',     nombre: 'Transformador',         color: '#72243E', bg: '#FBEAF0', desc: 'Un cliente completó su ruta'           },
  { id: 'maestro',           nombre: 'Maestro del bienestar', color: '#27500A', bg: '#EAF3DE', desc: '5 clientes graduados'                  },
  { id: 'chispa',            nombre: 'Chispa Giro Lab',       color: '#633806', bg: '#FAEEDA', desc: 'Otorgada por el equipo Giro Lab'       },
]

const AREAS_EMPRESA = [
  'Cultura y Clima Organizacional','Salud Mental Laboral','Productividad y Rendimiento',
  'Trabajo en Equipo','Liderazgo Consciente','Gestión del Cambio','Innovación',
  'Consultoría','Diversidad e Inclusión','Ventas y Negociación',
  'Comunicación Interna','Bienestar Integral',
]

const AREA_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Cultura y Clima Organizacional': { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
  'Salud Mental Laboral':           { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  'Productividad y Rendimiento':    { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  'Trabajo en Equipo':              { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  'Liderazgo Consciente':           { bg: '#FCE7F3', color: '#9D174D', border: '#F9A8D4' },
  'Gestión del Cambio':             { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  'Innovación':                     { bg: '#F0FDF4', color: '#14532D', border: '#86EFAC' },
  'Consultoría':                    { bg: '#F0F9FF', color: '#0C4A6E', border: '#7DD3FC' },
  'Diversidad e Inclusión':         { bg: '#FDF4FF', color: '#6B21A8', border: '#E879F9' },
  'Ventas y Negociación':           { bg: '#FFFBEB', color: '#78350F', border: '#FDE68A' },
  'Comunicación Interna':           { bg: '#F8FAFC', color: '#334155', border: '#CBD5E1' },
  'Bienestar Integral':             { bg: '#ECFDF5', color: '#064E3B', border: '#34D399' },
}

// ── Test linking helpers ──────────────────────────────────────────────────────
const cargarTestsObjetivo = async (objetivo_id: string, tipo: 'roadmap' | 'empresa', user_id?: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  setObjTestsLoading(prev => ({ ...prev, [objetivo_id]: true }))
  const params = new URLSearchParams({ objetivo_id, tipo })
  if (user_id) params.set('user_id', user_id)
  const [vinculadosRes, dispRes] = await Promise.all([
    fetch(`/api/objetivos/vincular-test?${params}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`/api/objetivos/vincular-test?${params}&disponibles=true`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  ])
  setObjTestsVinculados(prev => ({ ...prev, [objetivo_id]: vinculadosRes.results || [] }))
  setObjTestsDisponibles(prev => ({ ...prev, [objetivo_id]: dispRes.results || [] }))
  setObjTestsLoading(prev => ({ ...prev, [objetivo_id]: false }))
}

const vincularTest = async (objetivo_id: string, tipo: 'roadmap' | 'empresa', result_id: string, user_id?: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  const res = await fetch('/api/objetivos/vincular-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ objetivo_id, tipo, result_id }),
  })
  if (res.ok) await cargarTestsObjetivo(objetivo_id, tipo, user_id)
}

const desvincularTest = async (objetivo_id: string, tipo: 'roadmap' | 'empresa', result_id: string, user_id?: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  const res = await fetch('/api/objetivos/vincular-test', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ objetivo_id, tipo, result_id }),
  })
  if (res.ok) await cargarTestsObjetivo(objetivo_id, tipo, user_id)
}

const toggleTestsPanel = async (objetivo_id: string, tipo: 'roadmap' | 'empresa', user_id?: string) => {
  if (objTestsShowPanel === objetivo_id) {
    setObjTestsShowPanel(null)
    return
  }
  setObjTestsShowPanel(objetivo_id)
  if (!objTestsVinculados[objetivo_id]) {
    await cargarTestsObjetivo(objetivo_id, tipo, user_id)
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const renderObjetivosEmpresa = () => {

const agregarObjetivo = async () => {
  if (!objForm.titulo.trim() || !user?.id) return
  setObjSaving(true)
  const { data } = await supabase
    .from('empresa_objetivos')
    .insert({
      empresa_id: user.id,
      titulo: objForm.titulo,
      descripcion: objForm.descripcion || null,
      area: objForm.area || null,
      periodo_inicio: objForm.periodo_inicio || null,
      periodo_fin: objForm.periodo_fin || null,
      status: 'activo',
    })
    .select('*')
    .single()
  if (data) {
    setObjEmpresa(prev => [...prev, { ...data, empresa_hitos: [] }])
    setObjForm({ titulo: '', descripcion: '', area: '', periodo_inicio: '', periodo_fin: '' })
    setObjShowForm(false)
  }
  setObjSaving(false)
}

const buscarMenters = async (query: string) => {
    setObjMenterSearch(query)
    if (query.length < 2) { setObjMenterResults([]); return }
    setObjMenterSearching(true)
    const { data } = await supabase
      .from('menter_public_profiles')
      .select('id, nombre, apellidos, avatar_url, plan')
      .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%`)
      .limit(6)
    setObjMenterResults(data || [])
    setObjMenterSearching(false)
  }

  const actualizarStatusObjetivo = async (id: string, status: string) => {
    await supabase
      .from('empresa_objetivos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    setObjEmpresa(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const eliminarObjetivo = async (id: string) => {
    if (!confirm('¿Eliminar este objetivo y todos sus hitos?')) return
    await supabase.from('empresa_objetivos').delete().eq('id', id)
    setObjEmpresa(prev => prev.filter(o => o.id !== id))
  }

  const agregarHito = async (objetivoId: string) => {
    if (!hitoForm.nombre.trim() || !user?.id) return
    setObjSaving(true)
    const { data } = await supabase
      .from('empresa_hitos')
      .insert({
        objetivo_id: objetivoId,
        nombre: hitoForm.nombre,
        fecha: hitoForm.fecha || null,
        notas: hitoForm.notas || null,
        status: 'pendiente',
        autor_id: user.id,
        autor_role: 'empresa',
      })
      .select()
      .single()
    if (data) {
      setObjEmpresa(prev => prev.map(o =>
        o.id === objetivoId
          ? { ...o, empresa_hitos: [...(o.empresa_hitos || []), data] }
          : o
      ))
      setHitoForm({ nombre: '', fecha: '', notas: '' })
      setHitoShowForm(null)
    }
    setObjSaving(false)
  }

  const cambiarStatusHito = async (hitoId: string, objetivoId: string, status: string) => {
    await supabase
      .from('empresa_hitos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', hitoId)
    setObjEmpresa(prev => prev.map(o =>
      o.id === objetivoId
        ? { ...o, empresa_hitos: o.empresa_hitos.map((h: any) => h.id === hitoId ? { ...h, status } : h) }
        : o
    ))

  // ── Colaborador hitos ─────────────────────────────────────────────────────
  const agregarHitoColab = async (colaboradorId: string, objetivoId: string) => {
    if (!objColabHitoForm.nombre.trim()) return
    setObjSaving(true)
    const { data } = await supabase
      .from('empresa_colaborador_hitos')
      .insert({
        colaborador_id: colaboradorId,
        objetivo_id: objetivoId,
        nombre: objColabHitoForm.nombre,
        fecha_inicio: objColabHitoForm.fecha_inicio || null,
        fecha_fin: objColabHitoForm.fecha_fin || null,
        notas: objColabHitoForm.notas || null,
        status: 'pendiente',
      })
      .select('*')
      .single()
    if (data) {
      setObjColabHitos(prev => ({
        ...prev,
        [colaboradorId]: [...(prev[colaboradorId] || []), data]
      }))
      setObjColabHitoForm({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' })
      setObjColabHitoShow(null)
    }
    setObjSaving(false)
  }

  const cambiarStatusHitoColab = async (hitoId: string, colaboradorId: string, status: string) => {
    await supabase.from('empresa_colaborador_hitos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', hitoId)
    setObjColabHitos(prev => ({
      ...prev,
      [colaboradorId]: (prev[colaboradorId] || []).map((h: any) =>
        h.id === hitoId ? { ...h, status } : h
      )
    }))
  }

  // ── Cálculo progreso colaborador ──────────────────────────────────────────
  const calcularProgresoColab = (colaboradorId: string) => {
    const hitos = objColabHitos[colaboradorId] || []
    if (hitos.length === 0) return 0
    const completados = hitos.filter((h: any) => h.status === 'completado').length
    return Math.round((completados / hitos.length) * 100)
  }

  const calcularProgresoEquipo = (objetivoId: string) => {
    const colabs = objColaboradores[objetivoId] || []
    if (colabs.length === 0) return 0
    const promedios = colabs.map((c: any) => calcularProgresoColab(c.id))
    return Math.round(promedios.reduce((a: number, b: number) => a + b, 0) / promedios.length)
  }

  // ── Insignias colaborador ─────────────────────────────────────────────────
  const calcularInsigniasColab = (colaboradorId: string) => {
    const hitos = objColabHitos[colaboradorId] || []
    const progreso = calcularProgresoColab(colaboradorId)
    const ganadas: string[] = []
    if (hitos.some((h: any) => h.status === 'completado')) ganadas.push('primer_paso')
    if (progreso >= 50) ganadas.push('en_camino')
    if (progreso === 100) ganadas.push('transformacion')
    return ganadas
  }

  // ── Copiar link invitación ────────────────────────────────────────────────
  const copiarLinkInvitacion = (inviteToken: string) => {
    const url = `${window.location.origin}/unirse/${inviteToken}`
    navigator.clipboard.writeText(url).then(() => {
      setToastMsg('Link de invitación copiado')
      setTimeout(() => setToastMsg(null), 3000)
    })
  }
  }

const asignarMenter = async (objetivoId: string) => {
  if (!objMenterForm.menter_nombre.trim() && !objMenterForm.menter_id) return
  setObjSaving(true)
  await supabase.from('empresa_objetivo_menter').delete().eq('objetivo_id', objetivoId)
  const { data } = await supabase
    .from('empresa_objetivo_menter')
    .insert({
      objetivo_id: objetivoId,
      menter_id: objMenterForm.menter_externo ? null : (objMenterForm.menter_id || null),
      menter_nombre: objMenterForm.menter_nombre, // ← siempre guardar el nombre
      menter_externo: objMenterForm.menter_externo,
    })
    .select('*')
    .single()
  if (data) {
    setObjMenters(prev => ({
      ...prev,
      [objetivoId]: { ...data }
    }))
    setObjMenterShow(null)
    setObjMenterSearch('')
    setObjMenterResults([])
    setObjMenterForm({ menter_id: '', menter_nombre: '', menter_externo: false })
  }
  setObjSaving(false)
}

  // ── Colaborador hitos ─────────────────────────────────────────────────────
  const agregarHitoColab = async (colaboradorId: string, objetivoId: string) => {
    if (!objColabHitoForm.nombre.trim()) return
    setObjSaving(true)
    const { data } = await supabase
      .from('empresa_colaborador_hitos')
      .insert({
        colaborador_id: colaboradorId,
        objetivo_id: objetivoId,
        nombre: objColabHitoForm.nombre,
        fecha_inicio: objColabHitoForm.fecha_inicio || null,
        fecha_fin: objColabHitoForm.fecha_fin || null,
        notas: objColabHitoForm.notas || null,
        status: 'pendiente',
      })
      .select('*')
      .single()
    if (data) {
      setObjColabHitos(prev => ({
        ...prev,
        [colaboradorId]: [...(prev[colaboradorId] || []), data]
      }))
      setObjColabHitoForm({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' })
      setObjColabHitoShow(null)
    }
    setObjSaving(false)
  }

  const cambiarStatusHitoColab = async (hitoId: string, colaboradorId: string, status: string) => {
    await supabase.from('empresa_colaborador_hitos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', hitoId)
    setObjColabHitos(prev => ({
      ...prev,
      [colaboradorId]: (prev[colaboradorId] || []).map((h: any) =>
        h.id === hitoId ? { ...h, status } : h
      )
    }))
  }

  const calcularProgresoColab = (colaboradorId: string) => {
    const hitos = objColabHitos[colaboradorId] || []
    if (hitos.length === 0) return 0
    const completados = hitos.filter((h: any) => h.status === 'completado').length
    return Math.round((completados / hitos.length) * 100)
  }

  const calcularProgresoEquipo = (objetivoId: string) => {
    const colabs = objColaboradores[objetivoId] || []
    if (colabs.length === 0) return 0
    const promedios = colabs.map((c: any) => calcularProgresoColab(c.id))
    return Math.round(promedios.reduce((a: number, b: number) => a + b, 0) / promedios.length)
  }

  const calcularInsigniasColab = (colaboradorId: string) => {
    const hitos = objColabHitos[colaboradorId] || []
    const progreso = calcularProgresoColab(colaboradorId)
    const ganadas: string[] = []
    if (hitos.some((h: any) => h.status === 'completado')) ganadas.push('primer_paso')
    if (progreso >= 50) ganadas.push('en_camino')
    if (progreso === 100) ganadas.push('transformacion')
    return ganadas
  }

  const copiarLinkInvitacion = (inviteToken: string) => {
    const url = `${window.location.origin}/unirse/${inviteToken}`
    navigator.clipboard.writeText(url).then(() => {
      setToastMsg('Link de invitación copiado')
      setTimeout(() => setToastMsg(null), 3000)
    })
  }

  const calcularProgreso = (hitos: any[]) => {
    if (!hitos || hitos.length === 0) return 0
    const completados = hitos.filter((h: any) => h.status === 'completado').length
    return Math.round((completados / hitos.length) * 100)
  }

  const statusHitoConfig: Record<string, { label: string; color: string; bg: string }> = {
    pendiente:   { label: 'Pendiente',   color: '#888780', bg: '#F1EFE8' },
    en_progreso: { label: 'En progreso', color: '#854F0B', bg: '#FAEEDA' },
    completado:  { label: 'Completado',  color: '#085041', bg: '#E1F5EE' },
    incompleto:  { label: 'Incompleto',  color: '#A32D2D', bg: '#FCEBEB' },
  }

  const statusObjConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    activo:     { label: 'Activo',     color: '#1E40AF', bg: '#DBEAFE', border: '#93C5FD' },
    completado: { label: 'Completado', color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
    pausado:    { label: 'Pausado',    color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  }

  // ── Métricas rápidas ──
  const totalObjetivos = objEmpresa.length
  const completados = objEmpresa.filter(o => o.status === 'completado').length
  const totalHitos = objEmpresa.flatMap(o => o.empresa_hitos || []).length
  const hitosCompletados = objEmpresa.flatMap(o => o.empresa_hitos || []).filter((h: any) => h.status === 'completado').length
  const progresoGeneral = totalHitos > 0 ? Math.round((hitosCompletados / totalHitos) * 100) : 0

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── HEADER CON MÉTRICAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Objetivos activos', value: String(totalObjetivos - completados), sub: `${completados} completados` },
          { label: 'Progreso general',  value: `${progresoGeneral}%`,               sub: `${hitosCompletados}/${totalHitos} hitos` },
          { label: 'Áreas cubiertas',   value: String(new Set(objEmpresa.map(o => o.area).filter(Boolean)).size), sub: 'de bienestar' },
        ].map((m, i) => (
          <div key={i} style={{ background: '#f8f9fa', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#421869' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── BARRA PROGRESO GENERAL ── */}
      {totalHitos > 0 && (
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#666' }}>Progreso general del programa</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#421869' }}>{progresoGeneral}%</span>
          </div>
          <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: 8, width: `${progresoGeneral}%`, background: 'linear-gradient(90deg, #421869, #995bd5)', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {/* ── LISTA DE OBJETIVOS ── */}
      {objEmpresaLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>Cargando objetivos...</div>
      ) : objEmpresa.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}></div>
          <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 8 }}>Define los objetivos de tu empresa</h3>
          <p style={{ color: '#666', fontSize: 14 }}>Crea objetivos de bienestar, asigna hitos y vincula Menters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {objEmpresa.map(obj => {
            const hitos = obj.empresa_hitos || []
            const progreso = calcularProgreso(hitos)
            const areaColor = AREA_COLORS[obj.area] || { bg: '#f3e8ff', color: '#6a1b9a', border: '#c4b5fd' }
            const stObj = statusObjConfig[obj.status] || statusObjConfig.activo

            return (
              <div key={obj.id} style={{ background: 'white', borderRadius: 16, border: '0.5px solid #e0e0e0', overflow: 'hidden' }}>

                {/* Header objetivo */}
                <div style={{ padding: '16px 18px', borderBottom: '0.5px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 15, fontWeight: 700, margin: 0 }}>
                          {obj.titulo}
                        </h3>
                        {obj.area && (
                          <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600, background: areaColor.bg, color: areaColor.color, border: `1px solid ${areaColor.border}` }}>
                            {obj.area}
                          </span>
                        )}
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600, background: stObj.bg, color: stObj.color, border: `1px solid ${stObj.border}` }}>
                          {stObj.label}
                        </span>
                      </div>
                      {obj.descripcion && (
                        <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px', lineHeight: 1.5 }}>{obj.descripcion}</p>
                      )}
                      {(obj.periodo_inicio || obj.periodo_fin) && (
                        <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 8 }}>
                          {obj.periodo_inicio && <span>Inicio: {new Date(obj.periodo_inicio + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          {obj.periodo_fin && <span>Fin: {new Date(obj.periodo_fin + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        </div>
                      )}
                    </div>

                    {/* Acciones objetivo */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                      <select
                        value={obj.status}
                        onChange={e => actualizarStatusObjetivo(obj.id, e.target.value)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, border: `1px solid ${stObj.border}`, background: stObj.bg, color: stObj.color, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}
                      >
                        <option value="activo">Activo</option>
                        <option value="pausado">Pausado</option>
                        <option value="completado">Completado</option>
                      </select>
                      <button
                        onClick={() => eliminarObjetivo(obj.id)}
                        style={{ padding: '4px 10px', borderRadius: 8, border: '0.5px solid #ffebee', background: 'white', color: '#c62828', fontSize: 11, cursor: 'pointer' }}
                      >

                      </button>
                    </div>
                  </div>

                  {/* Barra progreso del objetivo */}
                  {hitos.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#999' }}>{hitos.filter((h: any) => h.status === 'completado').length}/{hitos.length} hitos</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#421869' }}>{progreso}%</span>
                      </div>
                      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: 4, width: `${progreso}%`, background: areaColor.color, borderRadius: 2, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de hitos */}
                <div style={{ padding: '0 18px' }}>
                  {hitos.map((hito: any, idx: number) => {
                    const st = statusHitoConfig[hito.status] || statusHitoConfig.pendiente
                    return (
                      <div key={hito.id} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 10, alignItems: 'start', padding: '10px 0', borderBottom: idx < hitos.length - 1 ? '0.5px solid #f5f5f5' : 'none' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', marginTop: 2, flexShrink: 0, background: hito.status === 'completado' ? '#1D9E75' : hito.status === 'en_progreso' ? '#EF9F27' : hito.status === 'incompleto' ? '#E24B4A' : '#e0e0e0', border: hito.status === 'pendiente' ? '1.5px solid #ccc' : 'none' }} />
                        <div>
                          <div style={{ fontSize: 13, color: '#333' }}>{hito.nombre}</div>
                          {hito.fecha && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{new Date(hito.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                          {hito.notas && <div style={{ fontSize: 11, color: '#666', marginTop: 4, padding: '4px 8px', background: '#f8f8f8', borderLeft: `2px solid ${areaColor.color}`, borderRadius: '0 4px 4px 0' }}>{hito.notas}</div>}
                        </div>
                        <select
                          value={hito.status}
                          onChange={e => cambiarStatusHito(hito.id, obj.id, e.target.value)}
                          style={{ fontSize: 11, padding: '3px 6px', borderRadius: 8, border: `0.5px solid ${st.color}44`, background: st.bg, color: st.color, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_progreso">En progreso</option>
                          <option value="completado">Completado</option>
                          <option value="incompleto">Incompleto</option>
                        </select>
                      </div>
                    )
                  })}
                </div>

                {/* ── MENTER ASIGNADO ── */}
                <div style={{ padding: '14px 18px', borderTop: '0.5px solid #f0f0f0', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      Menter asignado
                    </span>
                    <button
                      onClick={() => { setObjMenterShow(obj.id); setObjMenterForm({ menter_id: '', menter_nombre: '', menter_externo: false }) }}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '0.5px solid #ddd', background: 'white', color: '#421869', cursor: 'pointer' }}
                    >
                      {objMenters[obj.id] ? 'Cambiar' : '+ Asignar'}
                    </button>
                  </div>

                  {objMenters[obj.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {objMenters[obj.id].menter_externo
                          ? (objMenters[obj.id].menter_nombre?.[0] || 'M')
                          : (objMenters[obj.id].menter?.raw_user_meta_data?.nombre?.[0] || 'M')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>
                          {objMenters[obj.id].menter_nombre || 
                           objMenters[obj.id].menter?.raw_user_meta_data?.nombre || 
                           'Menter Giro Lab'}
                        </div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {objMenters[obj.id].menter_externo ? 'Menter externo' : 'Menter Giro Lab'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Sin Menter asignado</p>
                  )}

                  {objMenterShow === obj.id && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setObjMenterForm(p => ({ ...p, menter_externo: false }))}
                          style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${!objMenterForm.menter_externo ? '#421869' : '#ddd'}`, background: !objMenterForm.menter_externo ? '#f3e8ff' : 'white', color: !objMenterForm.menter_externo ? '#421869' : '#666', fontSize: 12, cursor: 'pointer', fontWeight: !objMenterForm.menter_externo ? 700 : 400 }}
                        >Giro Lab</button>
                        <button
                          onClick={() => setObjMenterForm(p => ({ ...p, menter_externo: true }))}
                          style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${objMenterForm.menter_externo ? '#421869' : '#ddd'}`, background: objMenterForm.menter_externo ? '#f3e8ff' : 'white', color: objMenterForm.menter_externo ? '#421869' : '#666', fontSize: 12, cursor: 'pointer', fontWeight: objMenterForm.menter_externo ? 700 : 400 }}
                        >Externo</button>
                      </div>
                      {objMenterForm.menter_externo ? (
                        <input
                          placeholder="Nombre del Menter externo"
                          
                        />
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <input
                            placeholder="Buscar Menter por nombre..."
                            value={objMenterSearch}
                            onChange={e => buscarMenters(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', boxSizing: 'border-box' as const }}
                          />
                          {objMenterSearching && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '0.5px solid #ddd', borderRadius: 8, padding: '10px', fontSize: 12, color: '#999', zIndex: 10 }}>
                              Buscando...
                            </div>
                          )}
                          {objMenterResults.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '0.5px solid #ddd', borderRadius: 8, zIndex: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                              {objMenterResults.map((m: any) => (
                                <div
                                  key={m.id}
                                  onClick={() => {
                                    setObjMenterForm(p => ({ ...p, menter_id: m.id, menter_nombre: `${m.nombre} ${m.apellidos || ''}`.trim() }))
setObjMenterSearch(`${m.nombre} ${m.apellidos || ''}`.trim())
                                    setObjMenterResults([])
                                  }}
                                  
                                >
                                  {m.avatar_url ? (
                                    <img src={m.avatar_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' as const }} />
                                  ) : (
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>
  {[m.nombre, m.apellidos].filter(Boolean).join(' ')}
</div>
                                  )}
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>{m.nombre}</div>
                                    
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {objMenterForm.menter_id && (
                            <div style={{ marginTop: 6, fontSize: 11, color: '#085041', background: '#E1F5EE', padding: '4px 10px', borderRadius: 20, display: 'inline-block' }}>
                              Seleccionado: {objMenterSearch}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setObjMenterShow(null)}
                          style={{ flex: 1, padding: '7px', borderRadius: 8, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 12, cursor: 'pointer' }}>
                          Cancelar
                        </button>
                        <button onClick={() => asignarMenter(obj.id)} disabled={objSaving}
                          style={{ flex: 2, padding: '7px', borderRadius: 8, border: 'none', background: '#421869', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Raleway' }}>
                          {objSaving ? 'Guardando...' : 'Asignar Menter'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── EQUIPO / COLABORADORES ── */}
                <div style={{ padding: '14px 18px', borderTop: '0.5px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      Equipo ({(objColaboradores[obj.id] || []).length} colaboradores)
                    </span>
                    <button
                      onClick={() => copiarLinkInvitacion(obj.invite_token)}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '0.5px solid #421869', background: '#f3e8ff', color: '#421869', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Invitar
                    </button>
                  </div>

                  {(objColaboradores[obj.id] || []).length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#999' }}>Progreso del equipo</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#421869' }}>{calcularProgresoEquipo(obj.id)}%</span>
                      </div>
                      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: 4, width: `${calcularProgresoEquipo(obj.id)}%`, background: 'linear-gradient(90deg,#421869,#995bd5)', borderRadius: 2, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  )}

                  {(objColaboradores[obj.id] || []).length === 0 ? (
                    <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
                      Aún no hay colaboradores. Comparte el link de invitación.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(objColaboradores[obj.id] || []).map((colab: any) => {
                        const nombreColab = colab.user?.raw_user_meta_data?.nombre || 'Colaborador'
                        const apellidoColab = colab.user?.raw_user_meta_data?.apellidos || ''
                        const progColab = calcularProgresoColab(colab.id)
                        const insigniasColab = calcularInsigniasColab(colab.id)
                        const hitosColab = objColabHitos[colab.id] || []

                        return (
                          <div key={colab.id} style={{ background: '#f8f9fa', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#995bd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                                  {nombreColab[0]}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>{nombreColab} {apellidoColab}</div>
                                  <div style={{ fontSize: 11, color: '#999' }}>{progColab}% completado</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {INSIGNIAS_CLIENTE.filter(ins => insigniasColab.includes(ins.id)).map(ins => (
                                  <span key={ins.id} title={ins.desc} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: ins.bg, color: ins.color, fontWeight: 700, border: `0.5px solid ${ins.color}44` }}>
                                    {ins.nombre}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div style={{ padding: '0 14px 8px' }}>
                              <div style={{ height: 3, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: 3, width: `${progColab}%`, background: '#995bd5', borderRadius: 2, transition: 'width 0.4s' }} />
                              </div>
                            </div>

                            {hitosColab.length > 0 && (
                              <div style={{ padding: '0 14px 8px' }}>
                                {hitosColab.map((hito: any, idx: number) => {
                                  const st = statusHitoConfig[hito.status] || statusHitoConfig.pendiente
                                  const isEditing = editandoHitoColab === hito.id
                                  return (
                                    <div key={hito.id} style={{ padding: '7px 0', borderBottom: idx < hitosColab.length - 1 ? '0.5px solid #eee' : 'none' }}>
                                      {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                          <input
                                            value={editHitoColabForm.nombre}
                                            onChange={e => setEditHitoColabForm(p => ({ ...p, nombre: e.target.value }))}
                                            style={{ padding: '5px 8px', borderRadius: 6, border: '0.5px solid #995bd5', fontSize: 12, fontFamily: 'DM Sans' }}
                                          />
                                          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                            <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>Desde</span>
                                            <input type="date" value={editHitoColabForm.fecha_inicio}
                                              onChange={e => setEditHitoColabForm(p => ({ ...p, fecha_inicio: e.target.value }))}
                                              style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 11 }} />
                                            <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>Hasta</span>
                                            <input type="date" value={editHitoColabForm.fecha_fin}
                                              onChange={e => setEditHitoColabForm(p => ({ ...p, fecha_fin: e.target.value }))}
                                              style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 11 }} />
                                          </div>
                                          <input placeholder="Nota" value={editHitoColabForm.notas}
                                            onChange={e => setEditHitoColabForm(p => ({ ...p, notas: e.target.value }))}
                                            style={{ padding: '5px 8px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 11, fontFamily: 'DM Sans' }} />
                                          <div style={{ display: 'flex', gap: 5 }}>
                                            <button onClick={() => setEditandoHitoColab(null)}
                                              style={{ flex: 1, padding: '4px', borderRadius: 6, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 11, cursor: 'pointer' }}>
                                              Cancelar
                                            </button>
                                            <button onClick={() => guardarEdicionHitoColab(hito.id, colab.id)}
                                              style={{ flex: 2, padding: '4px', borderRadius: 6, border: 'none', background: '#421869', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                              Guardar
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto auto', gap: 8, alignItems: 'center' }}>
                                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: hito.status === 'completado' ? '#1D9E75' : hito.status === 'en_progreso' ? '#EF9F27' : hito.status === 'incompleto' ? '#E24B4A' : '#e0e0e0' }} />
                                          <div>
                                            <div style={{ fontSize: 12, color: '#333' }}>{hito.nombre}</div>
                                            {(hito.fecha_inicio || hito.fecha_fin) && (
                                              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                                                {hito.fecha_inicio && <>{hito.fecha_inicio}</>}
                                                {hito.fecha_inicio && hito.fecha_fin && ' → '}
                                                {hito.fecha_fin && <>{hito.fecha_fin}</>}
                                              </div>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => { setEditandoHitoColab(hito.id); setEditHitoColabForm({ nombre: hito.nombre, fecha_inicio: hito.fecha_inicio || '', fecha_fin: hito.fecha_fin || '', notas: hito.notas || '' }) }}
                                            style={{ padding: '2px 6px', borderRadius: 5, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 10, cursor: 'pointer' }}>

                                          </button>
                                          <select
                                            value={hito.status}
                                            onChange={e => cambiarStatusHitoColab(hito.id, colab.id, e.target.value)}
                                            style={{ fontSize: 10, padding: '2px 4px', borderRadius: 6, border: `0.5px solid ${st.color}44`, background: st.bg, color: st.color, fontWeight: 600, cursor: 'pointer' }}
                                          >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_progreso">En progreso</option>
                                            <option value="completado">Completado</option>
                                            <option value="incompleto">Incompleto</option>
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div style={{ padding: '6px 14px 10px' }}>
                              {objColabHitoShow === colab.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <input
                                    placeholder="Nombre del hito *"
                                    value={objColabHitoForm.nombre}
                                    onChange={e => setObjColabHitoForm(p => ({ ...p, nombre: e.target.value }))}
                                    style={{ padding: '6px 10px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 12, fontFamily: 'DM Sans' }}
                                  />
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>Desde</span>
                                    <input type="date" value={objColabHitoForm.fecha_inicio}
                                      onChange={e => setObjColabHitoForm(p => ({ ...p, fecha_inicio: e.target.value }))}
                                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 12 }} />
                                    <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>Hasta</span>
                                    <input type="date" value={objColabHitoForm.fecha_fin}
                                      onChange={e => setObjColabHitoForm(p => ({ ...p, fecha_fin: e.target.value }))}
                                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 12 }} />
                                  </div>
                                  <input placeholder="Nota (opcional)" value={objColabHitoForm.notas}
                                    onChange={e => setObjColabHitoForm(p => ({ ...p, notas: e.target.value }))}
                                    style={{ padding: '6px 10px', borderRadius: 6, border: '0.5px solid #ddd', fontSize: 12, fontFamily: 'DM Sans' }} />
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => { setObjColabHitoShow(null); setObjColabHitoForm({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' }) }}
                                      style={{ flex: 1, padding: '6px', borderRadius: 6, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 11, cursor: 'pointer' }}>
                                      Cancelar
                                    </button>
                                    <button onClick={() => agregarHitoColab(colab.id, obj.id)}
                                      disabled={objSaving || !objColabHitoForm.nombre.trim()}
                                      style={{ flex: 2, padding: '6px', borderRadius: 6, border: 'none', background: '#995bd5', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                      + Agregar hito
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setObjColabHitoShow(colab.id)}
                                  style={{ width: '100%', padding: '5px', borderRadius: 6, border: '0.5px dashed #995bd5', background: 'transparent', color: '#995bd5', fontSize: 11, cursor: 'pointer' }}>
                                  + hito del colaborador
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── TESTS VINCULADOS (empresa objetivo) ── */}
                <div style={{ padding: '14px 18px', borderTop: '0.5px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: objTestsShowPanel === obj.id ? 10 : 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      Tests vinculados {(objTestsVinculados[obj.id] || []).length > 0 && `(${objTestsVinculados[obj.id].length})`}
                    </span>
                    <button
                      onClick={() => toggleTestsPanel(obj.id, 'empresa')}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '0.5px solid #ddd', background: 'white', color: '#421869', cursor: 'pointer' }}
                    >
                      {objTestsShowPanel === obj.id ? 'Cerrar' : 'Ver tests'}
                    </button>
                  </div>
                  {objTestsShowPanel === obj.id && (
                    <div>
                      {objTestsLoading[obj.id] ? (
                        <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0' }}>Cargando...</p>
                      ) : (
                        <>
                          {(objTestsVinculados[obj.id] || []).length === 0 ? (
                            <p style={{ fontSize: 12, color: '#999', margin: '8px 0' }}>Sin tests vinculados aún.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                              {(objTestsVinculados[obj.id] || []).map((r: any) => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: '#f8f4ff', borderRadius: 8, gap: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#421869' }}>{INSTRUMENTS[r.instrument_id as keyof typeof INSTRUMENTS]?.nombre || r.instrument_id || 'Test'}</div>
                                    <div style={{ fontSize: 11, color: '#999' }}>{r.puntuacion_bruta != null ? `Puntaje: ${r.puntuacion_bruta}` : ''} {r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                                  </div>
                                  <button
                                    onClick={() => desvincularTest(obj.id, 'empresa', r.id)}
                                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, border: '0.5px solid #ffebee', background: 'white', color: '#c62828', cursor: 'pointer', flexShrink: 0 }}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {(objTestsDisponibles[obj.id] || []).length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>Vincular un test:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {(objTestsDisponibles[obj.id] || []).map((r: any) => (
                                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#fafafa', borderRadius: 8, border: '0.5px solid #e0e0e0', gap: 8 }}>
                                    <div style={{ fontSize: 12, color: '#333' }}>
                                      {INSTRUMENTS[r.instrument_id as keyof typeof INSTRUMENTS]?.nombre || r.instrument_id || 'Test'}{r.puntuacion_bruta != null ? ` — ${r.puntuacion_bruta}` : ''}
                                    </div>
                                    <button
                                      onClick={() => vincularTest(obj.id, 'empresa', r.id)}
                                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, border: '0.5px solid #421869', background: '#f3e8ff', color: '#421869', cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
                                    >
                                      Vincular
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Form agregar hito */}
                <div style={{ padding: '10px 18px', background: '#fafafa', borderTop: '0.5px solid #f0f0f0' }}>
                  {hitoShowForm === obj.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        placeholder="Nombre del hito *"
                        value={hitoForm.nombre}
                        onChange={e => setHitoForm(p => ({ ...p, nombre: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="date"
                          value={hitoForm.fecha}
                          onChange={e => setHitoForm(p => ({ ...p, fecha: e.target.value }))}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13 }}
                        />
                        <input
                          placeholder="Nota (opcional)"
                          value={hitoForm.notas}
                          onChange={e => setHitoForm(p => ({ ...p, notas: e.target.value }))}
                          style={{ flex: 2, padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setHitoShowForm(null); setHitoForm({ nombre: '', fecha: '', notas: '' }) }}
                          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 12, cursor: 'pointer' }}>
                          Cancelar
                        </button>
                        <button
                          onClick={() => agregarHito(obj.id)}
                          disabled={objSaving || !hitoForm.nombre.trim()}
                          style={{ flex: 2, padding: '8px', borderRadius: 8, border: 'none', background: hitoForm.nombre.trim() ? areaColor.color : '#e0e0e0', color: hitoForm.nombre.trim() ? 'white' : '#999', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Raleway' }}
                        >
                          {objSaving ? 'Guardando...' : '+ Agregar hito'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setHitoShowForm(obj.id)}
                      style={{ width: '100%', padding: '7px', borderRadius: 8, border: `0.5px dashed ${areaColor.color}88`, background: 'transparent', color: areaColor.color, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                    >
                      + agregar hito
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── FORM NUEVO OBJETIVO ── */}
      <div style={{ marginTop: 16 }}>
        {objShowForm ? (
          <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#421869', marginBottom: 14, fontFamily: 'Raleway' }}>Nuevo objetivo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                placeholder="Título del objetivo *"
                value={objForm.titulo}
                onChange={e => setObjForm(p => ({ ...p, titulo: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, fontFamily: 'DM Sans' }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={objForm.descripcion}
                onChange={e => setObjForm(p => ({ ...p, descripcion: e.target.value }))}
                rows={2}
                style={{ padding: '10px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', resize: 'none' }}
              />
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Área</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {AREAS_EMPRESA.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setObjForm(p => ({ ...p, area: p.area === area ? '' : area }))}
                      style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: objForm.area === area ? 700 : 400, border: `1px solid ${objForm.area === area ? (AREA_COLORS[area]?.color || '#421869') : '#ddd'}`, background: objForm.area === area ? (AREA_COLORS[area]?.bg || '#f3e8ff') : 'white', color: objForm.area === area ? (AREA_COLORS[area]?.color || '#421869') : '#666', transition: 'all 0.15s' }}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Fecha inicio</label>
                  <input type="date" value={objForm.periodo_inicio} onChange={e => setObjForm(p => ({ ...p, periodo_inicio: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, boxSizing: 'border-box' as const }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Fecha fin</label>
                  <input type="date" value={objForm.periodo_fin} onChange={e => setObjForm(p => ({ ...p, periodo_fin: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, boxSizing: 'border-box' as const }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => { setObjShowForm(false); setObjForm({ titulo: '', descripcion: '', area: '', periodo_inicio: '', periodo_fin: '' }) }}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  onClick={agregarObjetivo}
                  disabled={objSaving || !objForm.titulo.trim()}
                  style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: objForm.titulo.trim() ? '#421869' : '#e0e0e0', color: objForm.titulo.trim() ? 'white' : '#999', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway' }}
                >
                  {objSaving ? 'Guardando...' : 'Crear objetivo'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setObjShowForm(true)}
            style={{ width: '100%', padding: '11px', borderRadius: 12, border: '0.5px dashed #421869', background: 'transparent', color: '#421869', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            + Agregar Objetivo
          </button>
        )}
      </div>
    </div>
  )
}

const renderRutaEmpresas = () => {
  if (rutaEmpresasLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}></div>
        <p style={{ color: '#999', fontFamily: 'DM Sans, sans-serif' }}>Cargando rutas de empresa...</p>
      </div>
    )
  }

  if (rutaEmpresasData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}></div>
        <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', marginBottom: 8 }}>Sin asignaciones de empresa</h3>
        <p style={{ color: '#666', fontSize: 14 }}>Cuando una empresa te asigne a un objetivo, aparecerá aquí.</p>
      </div>
    )
  }

  const statusHitoColors: Record<string, { dot: string; bg: string; color: string; label: string }> = {
    pendiente:   { dot: '#e0e0e0', bg: '#f0f0f0',  color: '#888',    label: 'Pendiente'   },
    en_progreso: { dot: '#EF9F27', bg: '#FAEEDA',  color: '#854F0B', label: 'En progreso' },
    completado:  { dot: '#1D9E75', bg: '#E1F5EE',  color: '#085041', label: 'Completado'  },
    incompleto:  { dot: '#E24B4A', bg: '#FCEBEB',  color: '#A32D2D', label: 'Incompleto'  },
  }

  const calcProgreso = (hitos: any[]) => {
    if (!hitos.length) return 0
    return Math.round(hitos.filter((h: any) => h.status === 'completado').length / hitos.length * 100)
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        Vista de solo lectura — progreso de los objetivos en los que estás asignado como Menter.
      </p>

      {rutaEmpresasData.map((asig: any) => {
        const obj = asig.objetivo
        if (!obj) return null
        const hitos: any[] = obj.empresa_hitos || []
        const colabs: any[] = obj.colaboradores || []
        const progresoEquipo = calcProgreso(hitos)

        return (
          <div key={asig.id} style={{ background: 'white', borderRadius: 16, border: '0.5px solid #e0e0e0', marginBottom: 18, overflow: 'hidden' }}>

            {/* Cabecera objetivo */}
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#f9f5ff,#f0e8ff)', borderBottom: '0.5px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18 }}></span>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 16, fontWeight: 700, margin: 0, flex: 1 }}>
                  {obj.titulo}
                </h3>
                {obj.area && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: '#f3e8ff', color: '#6a1b9a', border: '1px solid #c4b5fd' }}>
                    {obj.area}
                  </span>
                )}
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                  background: obj.status === 'completado' ? '#E1F5EE' : obj.status === 'pausado' ? '#FEF3C7' : '#DBEAFE',
                  color:      obj.status === 'completado' ? '#085041' : obj.status === 'pausado' ? '#92400E' : '#1E40AF',
                }}>
                  {obj.status === 'completado' ? 'Completado' : obj.status === 'pausado' ? 'Pausado' : 'Activo'}
                </span>
              </div>
              {obj.descripcion && (
                <p style={{ fontSize: 13, color: '#555', margin: '0 0 8px', lineHeight: 1.5 }}>{obj.descripcion}</p>
              )}
              {hitos.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#9c27b0' }}>{hitos.filter((h: any) => h.status === 'completado').length}/{hitos.length} hitos del equipo</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#421869' }}>{progresoEquipo}%</span>
                  </div>
                  <div style={{ height: 5, background: '#e9d5ff', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: 5, width: `${progresoEquipo}%`, background: 'linear-gradient(90deg,#421869,#995bd5)', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Hitos del equipo (solo lectura) */}
            {hitos.length > 0 && (
              <div style={{ padding: '12px 20px', borderBottom: colabs.length > 0 ? '0.5px solid #f0f0f0' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
                  Hitos del equipo
                </div>
                {hitos.map((hito: any, idx: number) => {
                  const st = statusHitoColors[hito.status] || statusHitoColors.pendiente
                  return (
                    <div key={hito.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: idx < hitos.length - 1 ? '0.5px solid #f5f5f5' : 'none' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: st.dot }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#333' }}>{hito.nombre}</div>
                        {(hito.fecha_inicio || hito.fecha_fin || hito.fecha) && (
                          <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                            {hito.fecha_inicio
                              ? <>{hito.fecha_inicio}{hito.fecha_fin ? ` → ${hito.fecha_fin}` : ''}</>
                              : hito.fecha ? <>{hito.fecha}</> : null}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: st.bg, color: st.color, fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Colaboradores (solo lectura) */}
            {colabs.length > 0 && (
              <div style={{ padding: '12px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 10 }}>
                  Colaboradores ({colabs.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {colabs.map((colab: any) => {
                    const nombre = colab.user?.nombre || 'Colaborador'
                    const apellido = colab.user?.apellidos || ''
                    const misHitos = rutaEmpresasColabHitos[colab.id] || []
                    const progColab = calcProgreso(misHitos)

                    return (
                      <div key={colab.id} style={{ background: '#faf7ff', borderRadius: 12, overflow: 'hidden', border: '0.5px solid #e9d5ff' }}>
                        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#421869,#995bd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {nombre[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>{nombre} {apellido}</div>
                            <div style={{ fontSize: 11, color: '#9c27b0' }}>{progColab}% completado · {misHitos.length} compromisos</div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: progColab === 100 ? '#085041' : '#421869' }}>
                            {progColab}%
                          </span>
                        </div>

                        <div style={{ padding: '0 14px 8px' }}>
                          <div style={{ height: 3, background: '#e9d5ff', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: 3, width: `${progColab}%`, background: 'linear-gradient(90deg,#6a1b9a,#995bd5)', borderRadius: 2, transition: 'width 0.4s' }} />
                          </div>
                        </div>

                        {misHitos.length > 0 ? (
                          <div style={{ padding: '0 14px 10px' }}>
                            {misHitos.map((hito: any, idx: number) => {
                              const st = statusHitoColors[hito.status] || statusHitoColors.pendiente
                              return (
                                <div key={hito.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: idx < misHitos.length - 1 ? '0.5px solid #ede9f6' : 'none' }}>
                                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: '#333' }}>{hito.nombre}</div>
                                    {(hito.fecha_inicio || hito.fecha_fin) && (
                                      <div style={{ fontSize: 10, color: '#9c27b0', marginTop: 1 }}>
                                        {hito.fecha_inicio && <>{hito.fecha_inicio}</>}
                                        {hito.fecha_inicio && hito.fecha_fin && ' → '}
                                        {hito.fecha_fin && <>{hito.fecha_fin}</>}
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: st.bg, color: st.color, fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                                    {st.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p style={{ padding: '0 14px 10px', fontSize: 11, color: '#bbb', margin: 0 }}>Sin compromisos aún.</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {colabs.length === 0 && hitos.length === 0 && (
              <p style={{ padding: '16px 20px', fontSize: 13, color: '#999', margin: 0 }}>
                Este objetivo aún no tiene hitos ni colaboradores.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

const cambiarStatusHitoColab = async (hitoId: string, colaboradorId: string, status: string) => {
  await supabase.from('empresa_colaborador_hitos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', hitoId)
  setObjColabHitos(prev => ({
    ...prev,
    [colaboradorId]: (prev[colaboradorId] || []).map((h: any) =>
      h.id === hitoId ? { ...h, status } : h
    )
  }))
}

const guardarEdicionHitoColab = async (hitoId: string, colaboradorId: string) => {
  if (!editHitoColabForm.nombre.trim()) return
  await supabase.from('empresa_colaborador_hitos')
    .update({
      nombre: editHitoColabForm.nombre,
      fecha_inicio: editHitoColabForm.fecha_inicio || null,
      fecha_fin: editHitoColabForm.fecha_fin || null,
      notas: editHitoColabForm.notas || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hitoId)
  setObjColabHitos(prev => ({
    ...prev,
    [colaboradorId]: (prev[colaboradorId] || []).map((h: any) =>
      h.id === hitoId ? { ...h, ...editHitoColabForm } : h
    )
  }))
  setEditandoHitoColab(null)
}

// ── Hitos propios del colaborador (desde su vista de roadmap) ─────────────
const agregarMiHitoColab = async (colabId: string, objetivoId: string) => {
  if (!miHitoColabForm.nombre.trim()) return
  setObjSaving(true)
  const { data } = await supabase
    .from('empresa_colaborador_hitos')
    .insert({
      colaborador_id: colabId,
      objetivo_id: objetivoId,
      nombre: miHitoColabForm.nombre,
      fecha_inicio: miHitoColabForm.fecha_inicio || null,
      fecha_fin: miHitoColabForm.fecha_fin || null,
      notas: miHitoColabForm.notas || null,
      status: 'pendiente',
    })
    .select('*')
    .single()
  if (data) {
    setObjColabHitos(prev => ({
      ...prev,
      [colabId]: [...(prev[colabId] || []), data],
    }))
    setMiHitoColabForm({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' })
    setMiHitoColabShow(null)
  }
  setObjSaving(false)
}

const renderRoadmap = () => {

    const cargarRoadmap = async (clienteId: string) => {
    if (!user?.id) return
    setRoadmapLoading(true)
    let { data: rm } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('menter_id', user.id)
      .eq('client_id', clienteId)
      .single()
    if (!rm) {
      const { data: nuevo } = await supabase
        .from('roadmaps')
        .insert({ menter_id: user.id, client_id: clienteId })
        .select()
        .single()
      rm = nuevo
    }
    if (rm) {
      const { data: objetivos } = await supabase
        .from('roadmap_objectives')
        .select('*, roadmap_milestones(*)')
        .eq('roadmap_id', rm.id)
        .order('created_at', { ascending: true })
      setRoadmapData({ ...rm, objetivos: objetivos || [] })
    }
    setRoadmapLoading(false)
  }

  const cargarRoadmapPersona = async (menterId?: string) => {
    if (!user?.id) return
    setRoadmapLoading(true)
    const mId = menterId || roadmapClienteActivo
    if (!mId) { setRoadmapLoading(false); return }
    const { data: rm } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('menter_id', mId)
      .eq('client_id', user.id)
      .single()
    if (rm) {
      const { data: objetivos } = await supabase
        .from('roadmap_objectives')
        .select('*, roadmap_milestones(*)')
        .eq('roadmap_id', rm.id)
        .order('created_at', { ascending: true })
      setRoadmapData({ ...rm, objetivos: objetivos || [] })
    } else {
      setRoadmapData(null)
    }
    setRoadmapLoading(false)
  }

  const cargarRoadmapPropio = async (menterId: string) => {
    if (!user?.id) return
    const { data: rm } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('menter_id', menterId)
      .eq('client_id', user.id)
      .single()
    if (rm) {
      const { data: objetivos } = await supabase
        .from('roadmap_objectives')
        .select('*, roadmap_milestones(*)')
        .eq('roadmap_id', rm.id)
        .order('created_at', { ascending: true })
      setRoadmapDataPropio({ ...rm, objetivos: objetivos || [] })
    }
  }

  const agregarObjetivo = async () => {
  if (!roadmapObjetivoForm.titulo.trim() || !user?.id) return
    const dataActiva = viendoComoCliente ? roadmapDataPropio : roadmapData
    if (!dataActiva?.id) return
    setRoadmapSaving(true)
    const autorRole = viendoComoCliente ? 'cliente' : isMenter ? 'menter' : 'cliente'
    const { data } = await supabase
      .from('roadmap_objectives')
      .insert({
        roadmap_id:  dataActiva.id,
        titulo:      roadmapObjetivoForm.titulo,
        descripcion: roadmapObjetivoForm.descripcion || null,
        autor_role:  autorRole,
        autor_id:    user!.id,
      })
      .select('*, roadmap_milestones(*)')
      .single()
    if (data) {
      const setter = viendoComoCliente ? setRoadmapDataPropio : setRoadmapData
      setter((prev: any) => ({ ...prev, objetivos: [...(prev.objetivos || []), data] }))
      setRoadmapObjetivoForm({ titulo: '', descripcion: '' })
      setRoadmapShowObjetivoForm(false)
    }
    setRoadmapSaving(false)
  }

  const agregarHito = async (objetivoId: string) => {
    if (!roadmapHitoForm.nombre.trim()) return
    setRoadmapSaving(true)
    const { data } = await supabase
      .from('roadmap_milestones')
      .insert({
        objective_id: objetivoId,
        nombre:       roadmapHitoForm.nombre,
        fecha:        roadmapHitoForm.fecha || null,
        notas:        roadmapHitoForm.notas || null,
        status:       'pendiente',
        autor_id:     user!.id,
      })
      .select()
      .single()
    if (data) {
      const setter = viendoComoCliente ? setRoadmapDataPropio : setRoadmapData
      setter((prev: any) => ({
        ...prev,
        objetivos: prev.objetivos.map((obj: any) =>
          obj.id === objetivoId
            ? { ...obj, roadmap_milestones: [...(obj.roadmap_milestones || []), data] }
            : obj
        ),
      }))
      setRoadmapHitoForm({ nombre: '', fecha: '', notas: '' })
      setRoadmapShowHitoForm(null)
    }
    setRoadmapSaving(false)
  }

  // Cualquier participante del roadmap puede cambiar el estado de cualquier hito
  const cambiarEstadoHito = async (hitoId: string, objetivoId: string, nuevoEstado: string) => {
    await supabase
      .from('roadmap_milestones')
      .update({ status: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('id', hitoId)
    const setter = viendoComoCliente ? setRoadmapDataPropio : setRoadmapData
    setter((prev: any) => ({
      ...prev,
      objetivos: prev.objetivos.map((obj: any) =>
        obj.id === objetivoId
          ? {
              ...obj,
              roadmap_milestones: obj.roadmap_milestones.map((h: any) =>
                h.id === hitoId ? { ...h, status: nuevoEstado } : h
              ),
            }
          : obj
      ),
    }))
  }

  // Compartir hito u objetivo — preparado para comunidad
  const compartirLogro = (tipo: 'hito' | 'objetivo', nombre: string) => {
    const texto = tipo === 'hito'
      ? `¡Avancé en mi ruta de bienestar! Hito: "${nombre}"`
      : `¡Nuevo objetivo en mi ruta de bienestar: "${nombre}"`
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg('Logro copiado — listo para compartir')
      setTimeout(() => setToastMsg(null), 3000)
    })
    // TODO: cuando exista la comunidad, llamar aquí a:
    // supabase.from('community_posts').insert({ content: texto, user_id: user.id, tipo })
  }

  // ── Helpers de cálculo ────────────────────────────────────────────────────

  const calcularProgreso = (objetivos: any[]) => {
    const todos = objetivos.flatMap((o: any) => o.roadmap_milestones || [])
    if (todos.length === 0) return 0
    // incompleto cuenta como no completado
    const completados = todos.filter((h: any) => h.status === 'completado').length
    return Math.round((completados / todos.length) * 100)
  }

  const calcularInsigniasGanadas = (objetivos: any[], progreso: number) => {
    const ganadas: string[] = []
    const objCompletados = objetivos.filter((o: any) =>
      (o.roadmap_milestones || []).length > 0 &&
      (o.roadmap_milestones || []).every((h: any) => h.status === 'completado')
    )
    if (objCompletados.length >= 1) ganadas.push('primer_paso')
    if (progreso >= 50)             ganadas.push('en_camino')
    if (progreso === 100)           ganadas.push('transformacion')
    const propios = objetivos.filter((o: any) =>
      viendoComoCliente
        ? o.autor_role === 'cliente'
        : isMenter ? o.autor_role === 'menter' : o.autor_role === 'cliente'
    )
    if (propios.length >= 5) ganadas.push('colaborador')
    return ganadas
  }

  const colorAutor = (role: string) => role === 'menter' ? '#7F77DD' : '#1D9E75'
  const bgAutor    = (role: string) => role === 'menter' ? '#EEEDFE'  : '#E1F5EE'

  // Nuevo estado "incompleto" agregado
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pendiente:   { label: 'Pendiente',   color: '#888780', bg: '#F1EFE8' },
    en_progreso: { label: 'En progreso', color: '#854F0B', bg: '#FAEEDA' },
    completado:  { label: 'Completado',  color: '#085041', bg: '#E1F5EE' },
    incompleto:  { label: 'Incompleto',  color: '#A32D2D', bg: '#FCEBEB' },
  }

  // Color del indicador circular por estado
  const colorIndicador = (status: string) => {
    if (status === 'completado')  return '#1D9E75'
    if (status === 'en_progreso') return '#EF9F27'
    if (status === 'incompleto')  return '#E24B4A'
    return '#e0e0e0'
  }

  // Cualquier participante del roadmap puede editar — solo no puede tocar
  // lo que escribió el otro (los campos de texto), pero sí el estado
  const puedeEditarTexto = (autorRole: string) => {
    if (viendoComoCliente) return autorRole === 'cliente'
    return (isMenter && autorRole === 'menter') || (!isMenter && autorRole === 'cliente')
  }

  // ── Variables de vista ────────────────────────────────────────────────────

  const viendoComoCliente = isMenter && roadmapVistaActiva === 'como_cliente'
  const dataActiva = viendoComoCliente ? roadmapDataPropio : roadmapData
  const progreso = dataActiva ? calcularProgreso(dataActiva.objetivos || []) : 0
  const insigniasGanadas = dataActiva
    ? calcularInsigniasGanadas(dataActiva.objetivos || [], progreso)
    : []
  const insignias = (isMenter && !viendoComoCliente) ? INSIGNIAS_MENTER : INSIGNIAS_CLIENTE

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── TOGGLE MENTER / MENTER-COMO-CLIENTE / RUTA EMPRESAS ── */}
      {isMenter && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setRoadmapVistaActiva('como_menter')}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              border: roadmapVistaActiva === 'como_menter' ? '2px solid #7F77DD' : '2px solid #e0e0e0',
              background: roadmapVistaActiva === 'como_menter' ? '#EEEDFE' : 'white',
              color: roadmapVistaActiva === 'como_menter' ? '#3C3489' : '#555',
              fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans',
            }}
          >
            Mis clientes
          </button>
          {roadmapMentersPropios.length > 0 && (
            <button
              onClick={() => setRoadmapVistaActiva('como_cliente')}
              style={{
                padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
                border: roadmapVistaActiva === 'como_cliente' ? '2px solid #1D9E75' : '2px solid #e0e0e0',
                background: roadmapVistaActiva === 'como_cliente' ? '#E1F5EE' : 'white',
                color: roadmapVistaActiva === 'como_cliente' ? '#085041' : '#555',
                fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans',
              }}
            >
              Mi ruta propia
            </button>
          )}
          <button
            onClick={() => setRoadmapVistaActiva('ruta_empresas')}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              border: roadmapVistaActiva === 'ruta_empresas' ? '2px solid #F57C00' : '2px solid #e0e0e0',
              background: roadmapVistaActiva === 'ruta_empresas' ? '#FFF3E0' : 'white',
              color: roadmapVistaActiva === 'ruta_empresas' ? '#E65100' : '#555',
              fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans',
            }}
          >
            Ruta de Empresas
          </button>
        </div>
      )}

      {/* ── RUTA DE EMPRESAS ── */}
      {isMenter && roadmapVistaActiva === 'ruta_empresas' && renderRutaEmpresas()}

      {/* ── SELECTOR DE CLIENTE (Menter viendo sus clientes) ── */}
      {isMenter && roadmapVistaActiva === 'como_menter' && (
        <ClienteSelectorRoadmap
          clientes={roadmapClientes}
          loading={roadmapLoading}
          clienteActivo={roadmapClienteActivo}
          onSelect={(id) => { setRoadmapClienteActivo(id); cargarRoadmap(id) }}
        />
      )}

      {/* ── TOGGLE PERSONAL / EMPRESA (solo Persona con objetivos de empresa) ── */}
      {!isMenter && roadmapEmpresaColabs.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setRoadmapVistaPersona('personal')}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              border: roadmapVistaPersona === 'personal' ? '2px solid #7F77DD' : '2px solid #e0e0e0',
              background: roadmapVistaPersona === 'personal' ? '#EEEDFE' : 'white',
              color: roadmapVistaPersona === 'personal' ? '#3C3489' : '#555',
              fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans',
            }}
          >
            Mi ruta personal
          </button>
          <button
            onClick={() => setRoadmapVistaPersona('empresa')}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              border: roadmapVistaPersona === 'empresa' ? '2px solid #421869' : '2px solid #e0e0e0',
              background: roadmapVistaPersona === 'empresa' ? '#f3e8ff' : 'white',
              color: roadmapVistaPersona === 'empresa' ? '#421869' : '#555',
              fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans',
            }}
          >
            Objetivos de empresa
          </button>
        </div>
      )}

      {/* ── VISTA EMPRESA (colaborador) ── */}
      {!isMenter && roadmapVistaPersona === 'empresa' && (
        <div>
          {roadmapEmpresaColabs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p>No estás vinculado a ningún objetivo de empresa.</p>
            </div>
          ) : (
            roadmapEmpresaColabs.map((colab: any) => {
              const obj = colab.objetivo
              if (!obj) return null
              const hitos = obj.empresa_hitos || []
              const completados = hitos.filter((h: any) => h.status === 'completado').length
              const progreso = hitos.length > 0 ? Math.round((completados / hitos.length) * 100) : 0
              const areaColor = { bg: '#f3e8ff', color: '#6a1b9a', border: '#c4b5fd' }

              return (
                <div key={colab.id} style={{ background: 'white', borderRadius: 16, border: '0.5px solid #e0e0e0', marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}></span>
                      <h3 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 15, fontWeight: 700, margin: 0 }}>
                        {obj.titulo}
                      </h3>
                      {obj.area && (
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600, background: areaColor.bg, color: areaColor.color, border: `1px solid ${areaColor.border}` }}>
                          {obj.area}
                        </span>
                      )}
                    </div>
                    {hitos.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: '#999' }}>{completados}/{hitos.length} hitos del equipo</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#421869' }}>{progreso}%</span>
                        </div>
                        <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: 4, width: `${progreso}%`, background: 'linear-gradient(90deg,#421869,#995bd5)', borderRadius: 2 }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hitos del equipo (solo lectura) */}
                  {hitos.length > 0 ? (
                    <div style={{ padding: '0 18px' }}>
                      {hitos.map((hito: any, idx: number) => (
                        <div key={hito.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < hitos.length - 1 ? '0.5px solid #f5f5f5' : 'none' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: hito.status === 'completado' ? '#1D9E75' : hito.status === 'en_progreso' ? '#EF9F27' : hito.status === 'incompleto' ? '#E24B4A' : '#e0e0e0' }} />
                          <span style={{ fontSize: 13, color: '#333', flex: 1 }}>{hito.nombre}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: hito.status === 'completado' ? '#E1F5EE' : hito.status === 'incompleto' ? '#FCEBEB' : '#f0f0f0', color: hito.status === 'completado' ? '#085041' : hito.status === 'incompleto' ? '#A32D2D' : '#999', fontWeight: 600 }}>
                            {hito.status === 'completado' ? 'Completado' : hito.status === 'en_progreso' ? 'En progreso' : hito.status === 'incompleto' ? 'Incompleto' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ padding: '10px 18px 0', fontSize: 13, color: '#999', margin: 0 }}>
                      El equipo aún no tiene hitos definidos.
                    </p>
                  )}

                  {/* ── Mis compromisos (hitos propios del colaborador) ── */}
                  {(() => {
                    const misHitos = objColabHitos[colab.id] || []
                    const miProgreso = misHitos.length > 0
                      ? Math.round(misHitos.filter((h: any) => h.status === 'completado').length / misHitos.length * 100)
                      : 0
                    return (
                      <div style={{ margin: '12px 18px 0', padding: '12px 14px', background: '#faf7ff', borderRadius: 12, border: '0.5px solid #e9d5ff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#6a1b9a' }}>Mis compromisos</span>
                          {misHitos.length > 0 && (
                            <span style={{ fontSize: 11, color: '#9c27b0', fontWeight: 600 }}>{miProgreso}%</span>
                          )}
                        </div>

                        {misHitos.length > 0 && (
                          <>
                            <div style={{ height: 3, background: '#e9d5ff', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                              <div style={{ height: 3, width: `${miProgreso}%`, background: 'linear-gradient(90deg,#6a1b9a,#995bd5)', borderRadius: 2, transition: 'width 0.4s' }} />
                            </div>
                            {misHitos.map((hito: any, idx: number) => (
                              <div key={hito.id} style={{ padding: '6px 0', borderBottom: idx < misHitos.length - 1 ? '0.5px solid #ede9f6' : 'none' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto', gap: 8, alignItems: 'center' }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: hito.status === 'completado' ? '#1D9E75' : hito.status === 'en_progreso' ? '#EF9F27' : hito.status === 'incompleto' ? '#E24B4A' : '#c4b5fd' }} />
                                  <div>
                                    <div style={{ fontSize: 12, color: '#333' }}>{hito.nombre}</div>
                                    {(hito.fecha_inicio || hito.fecha_fin) && (
                                      <div style={{ fontSize: 10, color: '#9c27b0', marginTop: 2 }}>
                                        {hito.fecha_inicio && <>{hito.fecha_inicio}</>}
                                        {hito.fecha_inicio && hito.fecha_fin && ' → '}
                                        {hito.fecha_fin && <>{hito.fecha_fin}</>}
                                      </div>
                                    )}
                                  </div>
                                  <select
                                    value={hito.status}
                                    onChange={e => cambiarStatusHitoColab(hito.id, colab.id, e.target.value)}
                                    style={{ fontSize: 10, padding: '2px 4px', borderRadius: 6, border: '0.5px solid #c4b5fd', background: '#f3e8ff', color: '#6a1b9a', fontWeight: 600, cursor: 'pointer' }}
                                  >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="en_progreso">En progreso</option>
                                    <option value="completado">Completado</option>
                                    <option value="incompleto">Incompleto</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {misHitos.length === 0 && (
                          <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px' }}>Aún no tienes compromisos en este objetivo.</p>
                        )}

                        {miHitoColabShow === colab.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                            <input
                              placeholder="Nombre del compromiso *"
                              value={miHitoColabForm.nombre}
                              onChange={e => setMiHitoColabForm(p => ({ ...p, nombre: e.target.value }))}
                              style={{ padding: '7px 10px', borderRadius: 8, border: '0.5px solid #c4b5fd', fontSize: 12, fontFamily: 'DM Sans' }}
                            />
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>Desde</span>
                              <input type="date" value={miHitoColabForm.fecha_inicio}
                                onChange={e => setMiHitoColabForm(p => ({ ...p, fecha_inicio: e.target.value }))}
                                style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #c4b5fd', fontSize: 12 }} />
                              <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>Hasta</span>
                              <input type="date" value={miHitoColabForm.fecha_fin}
                                onChange={e => setMiHitoColabForm(p => ({ ...p, fecha_fin: e.target.value }))}
                                style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #c4b5fd', fontSize: 12 }} />
                            </div>
                            <input placeholder="Nota (opcional)" value={miHitoColabForm.notas}
                              onChange={e => setMiHitoColabForm(p => ({ ...p, notas: e.target.value }))}
                              style={{ padding: '7px 10px', borderRadius: 8, border: '0.5px solid #c4b5fd', fontSize: 12, fontFamily: 'DM Sans' }} />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setMiHitoColabShow(null); setMiHitoColabForm({ nombre: '', fecha_inicio: '', fecha_fin: '', notas: '' }) }}
                                style={{ flex: 1, padding: '6px', borderRadius: 8, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 11, cursor: 'pointer' }}>
                                Cancelar
                              </button>
                              <button onClick={() => agregarMiHitoColab(colab.id, obj.id)}
                                disabled={objSaving || !miHitoColabForm.nombre.trim()}
                                style={{ flex: 2, padding: '6px', borderRadius: 8, border: 'none', background: '#6a1b9a', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: objSaving || !miHitoColabForm.nombre.trim() ? 0.6 : 1 }}>
                                + Agregar compromiso
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setMiHitoColabShow(colab.id)}
                            style={{ marginTop: 8, width: '100%', padding: '7px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#421869,#6a1b9a)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            + Agregar mi compromiso
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── SELECTOR DE MENTER (Menter viendo su ruta propia o Persona) ── */}
      {(viendoComoCliente || !isMenter) && roadmapMentersPropios.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Mi Menter</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(viendoComoCliente ? roadmapMentersPropios : roadmapClientes).map((m: any) => (
              <button
                key={m.menter_id}
                onClick={() => {
                  if (viendoComoCliente) {
                    setRoadmapMenterPropioActivo(m.menter_id)
                    cargarRoadmapPropio(m.menter_id)
                  } else {
                    setRoadmapClienteActivo(m.menter_id)
                    cargarRoadmapPersona(m.menter_id)
                  }
                }}
                style={{
                  padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans',
                  border: (viendoComoCliente ? roadmapMenterPropioActivo : roadmapClienteActivo) === m.menter_id ? '2px solid #1D9E75' : '2px solid #e0e0e0',
                  background: (viendoComoCliente ? roadmapMenterPropioActivo : roadmapClienteActivo) === m.menter_id ? '#E1F5EE' : 'white',
                  color: (viendoComoCliente ? roadmapMenterPropioActivo : roadmapClienteActivo) === m.menter_id ? '#085041' : '#555',
                  fontSize: 13, fontWeight: 400,
                }}
              >
                {m.menter_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── VISTA PERSONAL (ocultar cuando Persona ve empresa o Menter ve ruta empresas) ── */}
      {(!isMenter && roadmapVistaPersona === 'empresa') || roadmapVistaActiva === 'ruta_empresas' ? null : <>

      {/* ── ESTADO VACÍO ── */}
      {!roadmapLoading && !dataActiva && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}></div>
          <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', marginBottom: 8 }}>
            {isMenter && !viendoComoCliente
              ? 'Selecciona un cliente para comenzar'
              : 'Tu ruta de bienestar está por comenzar'}
          </h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            {isMenter && !viendoComoCliente
              ? 'Crea objetivos e hitos para guiar el proceso de tu cliente.'
              : 'Tu Menter creará los objetivos del proceso. Tú puedes agregar los tuyos propios.'}
          </p>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      {dataActiva && (
        <>
          {/* Barra de progreso */}
          <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#666' }}>Progreso general del roadmap</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#421869' }}>{progreso}%</span>
            </div>
            <div style={{ height: 6, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: 6, width: `${progreso}%`, background: '#7F77DD', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Insignias */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {insignias.map((ins) => {
              const ganada = insigniasGanadas.includes(ins.id)
              return (
                <div
                  key={ins.id}
                  title={ins.desc}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 20,
                    border: `0.5px solid ${ganada ? ins.color + '44' : '#e0e0e0'}`,
                    background: ganada ? ins.bg : '#f8f8f8',
                    opacity: ganada ? 1 : 0.45,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <span style={{ fontSize: 11, color: ganada ? ins.color : '#999', fontWeight: ganada ? 600 : 400 }}>{ins.nombre}</span>
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7F77DD' }} />
              <span style={{ fontSize: 12, color: '#666' }}>Objetivos del Menter</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75' }} />
              <span style={{ fontSize: 12, color: '#666' }}>Objetivos del cliente</span>
            </div>
          </div>

          {/* Lista de objetivos */}
          {(dataActiva.objetivos || []).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p style={{ fontSize: 14 }}>
                {isMenter && !viendoComoCliente
                  ? '¡Crea el primer objetivo para este cliente!'
                  : 'Tu Menter agregará los primeros objetivos pronto.'}
              </p>
            </div>
          )}

          {(dataActiva.objetivos || []).map((obj: any) => {
            const hitos = obj.roadmap_milestones || []
            const completados = hitos.filter((h: any) => h.status === 'completado').length
            const pct = hitos.length > 0 ? Math.round((completados / hitos.length) * 100) : 0
            const esMioTexto = puedeEditarTexto(obj.autor_role)
            const color = colorAutor(obj.autor_role)

            return (
              <div
                key={obj.id}
                style={{
                  background: 'white', borderRadius: 14,
                  border: `0.5px solid ${color}44`,
                  marginBottom: 12, overflow: 'hidden',
                }}
              >
                {/* Header del objetivo */}
                <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#421869' }}>{obj.titulo}</div>
                          {obj.descripcion && (
                            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{obj.descripcion}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color }}>{pct}%</span>
                          <button
                            onClick={() => compartirLogro('objetivo', obj.titulo)}
                            title="Compartir este objetivo con la comunidad"
                            style={{
                              padding: '3px 8px', borderRadius: 10, border: '0.5px solid #e0e0e0',
                              background: 'white', color: '#888', fontSize: 10, cursor: 'pointer',
                              fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 3,
                            }}
                          >
                            compartir
                          </button>
                          {!esMioTexto && (
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#f0f0f0', color: '#999' }}>
                              Solo lectura
                            </span>
                          )}
                        </div>
                      </div>
                      {hitos.length > 0 && (
                        <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                          <div style={{ height: 3, width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hitos */}
                <div style={{ padding: '0 16px' }}>
                  {hitos.map((hito: any, idx: number) => {
                    const st = statusConfig[hito.status] || statusConfig.pendiente
                    return (
                      <div
                        key={hito.id}
                        style={{
                          display: 'grid', gridTemplateColumns: '16px 1fr auto',
                          gap: 10, alignItems: 'start', padding: '10px 0',
                          borderBottom: idx < hitos.length - 1 ? '0.5px solid #f5f5f5' : 'none',
                        }}
                      >
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%', marginTop: 2, flexShrink: 0,
                          background: colorIndicador(hito.status),
                          border: hito.status === 'pendiente' ? '1.5px solid #ccc' : 'none',
                        }} />
                        <div>
                          <div style={{ fontSize: 13, color: '#333' }}>{hito.nombre}</div>
                          {hito.fecha && (
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                              {new Date(hito.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {hito.notas && (
                            <div style={{
                              fontSize: 11, color: '#666', marginTop: 4,
                              padding: '4px 8px', background: '#f8f8f8',
                              borderLeft: `2px solid ${color}`, borderRadius: '0 4px 4px 0',
                            }}>
                              {hito.notas}
                            </div>
                          )}
                          {hito.status === 'completado' && (
                            <button
                              onClick={() => compartirLogro('hito', hito.nombre)}
                              style={{
                                marginTop: 6, padding: '3px 8px', borderRadius: 10,
                                border: '0.5px solid #9FE1CB', background: '#E1F5EE',
                                color: '#085041', fontSize: 10, cursor: 'pointer',
                                fontFamily: 'DM Sans', display: 'inline-flex', alignItems: 'center', gap: 3,
                              }}
                            >
                              compartir logro
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <select
                            value={hito.status}
                            onChange={(e) => cambiarEstadoHito(hito.id, obj.id, e.target.value)}
                            style={{
                              fontSize: 11, padding: '3px 6px', borderRadius: 10,
                              border: `0.5px solid ${st.color}44`,
                              background: st.bg, color: st.color,
                              fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans',
                            }}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="completado">Completado</option>
                            <option value="incompleto">Incompleto</option>
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ── TESTS VINCULADOS (roadmap objetivo) ── */}
                <div style={{ padding: '14px 16px', borderTop: '0.5px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: objTestsShowPanel === obj.id ? 10 : 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      Tests vinculados {(objTestsVinculados[obj.id] || []).length > 0 && `(${objTestsVinculados[obj.id].length})`}
                    </span>
                    <button
                      onClick={() => toggleTestsPanel(obj.id, 'roadmap', dataActiva?.client_id || user?.id || undefined)}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '0.5px solid #ddd', background: 'white', color: '#421869', cursor: 'pointer' }}
                    >
                      {objTestsShowPanel === obj.id ? 'Cerrar' : 'Ver tests'}
                    </button>
                  </div>
                  {objTestsShowPanel === obj.id && (
                    <div>
                      {objTestsLoading[obj.id] ? (
                        <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0' }}>Cargando...</p>
                      ) : (
                        <>
                          {(objTestsVinculados[obj.id] || []).length === 0 ? (
                            <p style={{ fontSize: 12, color: '#999', margin: '8px 0' }}>Sin tests vinculados aún.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                              {(objTestsVinculados[obj.id] || []).map((r: any) => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: '#f8f4ff', borderRadius: 8, gap: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#421869' }}>{INSTRUMENTS[r.instrument_id as keyof typeof INSTRUMENTS]?.nombre || r.instrument_id || 'Test'}</div>
                                    <div style={{ fontSize: 11, color: '#999' }}>{r.puntuacion_bruta != null ? `Puntaje: ${r.puntuacion_bruta}` : ''} {r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                                  </div>
                                  <button
                                    onClick={() => desvincularTest(obj.id, 'roadmap', r.id, dataActiva?.client_id || user?.id || undefined)}
                                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, border: '0.5px solid #ffebee', background: 'white', color: '#c62828', cursor: 'pointer', flexShrink: 0 }}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {(objTestsDisponibles[obj.id] || []).length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>Vincular un test:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {(objTestsDisponibles[obj.id] || []).map((r: any) => (
                                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#fafafa', borderRadius: 8, border: '0.5px solid #e0e0e0', gap: 8 }}>
                                    <div style={{ fontSize: 12, color: '#333' }}>
                                      {INSTRUMENTS[r.instrument_id as keyof typeof INSTRUMENTS]?.nombre || r.instrument_id || 'Test'}{r.puntuacion_bruta != null ? ` — ${r.puntuacion_bruta}` : ''}
                                    </div>
                                    <button
                                      onClick={() => vincularTest(obj.id, 'roadmap', r.id, dataActiva?.client_id || user?.id || undefined)}
                                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, border: '0.5px solid #421869', background: '#f3e8ff', color: '#421869', cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
                                    >
                                      Vincular
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Form agregar hito */}
                {esMioTexto && (
                  <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '0.5px solid #f0f0f0' }}>
                    {roadmapShowHitoForm === obj.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                          placeholder="Nombre del hito *"
                          value={roadmapHitoForm.nombre}
                          onChange={(e) => setRoadmapHitoForm((p) => ({ ...p, nombre: e.target.value }))}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="date"
                            value={roadmapHitoForm.fecha}
                            onChange={(e) => setRoadmapHitoForm((p) => ({ ...p, fecha: e.target.value }))}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13 }}
                          />
                          <input
                            placeholder="Nota (opcional)"
                            value={roadmapHitoForm.notas}
                            onChange={(e) => setRoadmapHitoForm((p) => ({ ...p, notas: e.target.value }))}
                            style={{ flex: 2, padding: '8px 12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setRoadmapShowHitoForm(null); setRoadmapHitoForm({ nombre: '', fecha: '', notas: '' }) }}
                            style={{ flex: 1, padding: '8px', borderRadius: 8, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 12, cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => agregarHito(obj.id)}
                            disabled={roadmapSaving || !roadmapHitoForm.nombre.trim()}
                            style={{
                              flex: 2, padding: '8px', borderRadius: 8, border: 'none',
                              background: roadmapHitoForm.nombre.trim() ? color : '#e0e0e0',
                              color: roadmapHitoForm.nombre.trim() ? 'white' : '#999',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Raleway',
                            }}
                          >
                            {roadmapSaving ? 'Guardando...' : '+ Agregar hito'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRoadmapShowHitoForm(obj.id)}
                        style={{
                          width: '100%', padding: '7px', borderRadius: 8,
                          border: `0.5px dashed ${color}88`, background: 'transparent',
                          color, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                        }}
                      >
                        + agregar hito
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Botón agregar objetivo */}
          <div style={{ marginTop: 8 }}>
            {roadmapShowObjetivoForm ? (
              <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 14, padding: '16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#421869', marginBottom: 10 }}>
                  Nuevo objetivo
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    placeholder="Título del objetivo *"
                    value={roadmapObjetivoForm.titulo}
                    onChange={(e) => setRoadmapObjetivoForm((p) => ({ ...p, titulo: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 14, fontFamily: 'DM Sans' }}
                  />
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={roadmapObjetivoForm.descripcion}
                    onChange={(e) => setRoadmapObjetivoForm((p) => ({ ...p, descripcion: e.target.value }))}
                    rows={2}
                    style={{ padding: '10px 14px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', resize: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setRoadmapShowObjetivoForm(false); setRoadmapObjetivoForm({ titulo: '', descripcion: '' }) }}
                      style={{ flex: 1, padding: '10px', borderRadius: 10, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={agregarObjetivo}
                      disabled={roadmapSaving || !roadmapObjetivoForm.titulo.trim()}
                      style={{
                        flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                        background: roadmapObjetivoForm.titulo.trim() ? '#421869' : '#e0e0e0',
                        color: roadmapObjetivoForm.titulo.trim() ? 'white' : '#999',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway',
                      }}
                    >
                      {roadmapSaving ? 'Guardando...' : 'Crear objetivo'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setRoadmapShowObjetivoForm(true)}
                style={{
                  width: '100%', padding: '11px', borderRadius: 10,
                  border: 'none',
                  background: '#995bd5',
                  color: 'white',
                  fontSize: 13, cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                }}
              >
                + Agregar Objetivo
              </button>
            )}
          </div>
        </>
      )}

      </>}

    </div>
  )
}

const renderIngresos = () => {

  // ── Cálculo de métricas ───────────────────────────────────────────────────

  const totalSesiones = ingresosSesiones
    .filter((s: any) => s.payment_status === 'pagado')
    .reduce((a: number, s: any) => a + (s.price || 0), 0)

  const totalEventos = ingresosEventos
    .reduce((a: number, e: any) => a + e.recaudado, 0)

  const totalGeneral = totalSesiones + totalEventos

  const sesionesCompletadas = ingresosSesiones.length

  const sesionesPagadas = ingresosSesiones.filter((s: any) => s.payment_status === 'pagado')
  const promedioPorSesion = sesionesPagadas.length > 0
    ? Math.round(totalSesiones / sesionesPagadas.length)
    : 0

  const ticketsTotales = ingresosEventos.reduce((a: number, e: any) => a + e.tickets, 0)

  // ── Helpers de formato ────────────────────────────────────────────────────

  const fmtFecha = (f: string) =>
    new Date(f + 'T00:00:00').toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  const badgeEstado = (estado: string) => {
    const cfg: Record<string, { label: string; color: string; bg: string }> = {
      pagado:    { label: 'Pagado',    color: '#085041', bg: '#E1F5EE' },
      pendiente: { label: 'Pendiente', color: '#633806', bg: '#FAEEDA' },
      gratis:    { label: 'Gratis',    color: '#0C447C', bg: '#E6F1FB' },
    }
    const c = cfg[estado] || cfg.pendiente
    return (
      <span style={{
        fontSize: 10, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' as const,
        background: c.bg, color: c.color, fontWeight: 600,
      }}>
        {c.label}
      </span>
    )
  }

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── FILTROS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Desde</span>
          <input
            type="month"
            value={ingresosDesde}
            onChange={e => setIngresosDesde(e.target.value)}
            style={{ fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'DM Sans', width: '100%', boxSizing: 'border-box' as const }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Hasta</span>
          <input
            type="month"
            value={ingresosHasta}
            onChange={e => setIngresosHasta(e.target.value)}
            style={{ fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'DM Sans', width: '100%', boxSizing: 'border-box' as const }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Estado</span>
          <select
            value={ingresosEstado}
            onChange={e => setIngresosEstado(e.target.value)}
            style={{ fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontFamily: 'DM Sans', width: '100%', boxSizing: 'border-box' as const }}
          >
            <option value="todos">Todos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="gratis">Gratis</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Fuente</span>
          <select
            value={ingresosFuente}
            onChange={e => setIngresosFuente(e.target.value)}
            style={{ fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontFamily: 'DM Sans', width: '100%', boxSizing: 'border-box' as const }}
          >
            <option value="todas">Todas</option>
            <option value="sesion">Sesiones</option>
            <option value="evento">Eventos</option>
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <button
            onClick={cargarIngresos}
            disabled={ingresosLoading}
            style={{
              width: '100%', padding: '9px 16px', borderRadius: 8, border: 'none',
              background: ingresosLoading ? '#ccc' : '#421869',
              color: 'white', fontSize: 13, fontWeight: 600,
              cursor: ingresosLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Raleway',
            }}
          >
            {ingresosLoading ? 'Cargando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {/* ── MÉTRICAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total ingresado',      value: `$${totalGeneral.toLocaleString()}`,                  sub: 'sesiones + eventos' },
          { label: 'Sesiones realizadas',  value: String(sesionesCompletadas),                          sub: 'completadas en período' },
          { label: 'Ingresos por eventos', value: `$${totalEventos.toLocaleString()}`,                  sub: `${ticketsTotales} tickets` },
          { label: 'Promedio por sesión',  value: promedioPorSesion > 0 ? `$${promedioPorSesion}` : '—', sub: 'USD / sesión pagada' },
        ].map((m, i) => (
          <div key={i} style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#421869' }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── GRÁFICO ── */}
      {(ingresosSesiones.length > 0 || ingresosEventos.length > 0) && (
        <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#421869' }}>Evolución de ingresos</span>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ color: '#7F77DD', label: 'Sesiones' }, { color: '#1D9E75', label: 'Eventos' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 180 }}>
            <canvas ref={ingresosChartRef} />
          </div>
        </div>
      )}

      {/* ── TABS DETALLE ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '0.5px solid #e0e0e0' }}>
        {(['sesiones', 'eventos'] as const)
          .filter(t => ingresosFuente === 'todas' || (ingresosFuente === 'sesion' ? t === 'sesiones' : t === 'eventos'))
          .map(tab => (
            <button
              key={tab}
              onClick={() => setIngresosTab(tab)}
              style={{
                padding: '8px 16px', fontSize: 12, cursor: 'pointer',
                border: 'none', background: 'none',
                borderBottom: ingresosTab === tab ? '2px solid #421869' : '2px solid transparent',
                color: ingresosTab === tab ? '#421869' : '#666',
                fontWeight: ingresosTab === tab ? 600 : 400,
                fontFamily: 'DM Sans',
              }}
            >
              {tab === 'sesiones' ? `Sesiones (${ingresosSesiones.length})` : `Eventos (${ingresosEventos.length})`}
            </button>
          ))}
      </div>

      {/* Tab Sesiones */}
      {ingresosTab === 'sesiones' && (
        <>
          {ingresosSesiones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: 13 }}>
              {ingresosLoading ? 'Cargando...' : 'Sin sesiones en este período con los filtros seleccionados.'}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #ddd' }}>
                {['Cliente', 'Fecha', 'Monto', 'Estado'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {ingresosSesiones.map((s: any, i: number) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#421869' }}>{s.client_name}</span>
                  <span style={{ fontSize: 12, color: '#666' }}>{fmtFecha(s.date)}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#2d2926', textAlign: 'right' as const }}>
                    {s.price ? `$${s.price} USD` : '—'}
                  </span>
                  {badgeEstado(s.payment_status || 'pendiente')}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0', gap: 8, borderTop: '0.5px solid #e0e0e0', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#666' }}>Subtotal pagado:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#421869' }}>${totalSesiones.toLocaleString()} USD</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Tab Eventos */}
      {ingresosTab === 'eventos' && (
        <>
          {ingresosEventos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: 13 }}>
              {ingresosLoading ? 'Cargando...' : 'Sin eventos en este período.'}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #ddd' }}>
                {['Evento', 'Fecha', 'Recaudado', 'Tickets'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {ingresosEventos.map((e: any, i: number) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#421869' }}>{e.titulo}</span>
                  <span style={{ fontSize: 12, color: '#666' }}>{fmtFecha(e.fecha)}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#2d2926', textAlign: 'right' as const }}>
                    ${e.recaudado.toLocaleString()} USD
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#E1F5EE', color: '#085041', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                    {e.tickets} vendidos
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0', gap: 8, borderTop: '0.5px solid #e0e0e0', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#666' }}>Subtotal eventos:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#421869' }}>${totalEventos.toLocaleString()} USD</span>
              </div>
            </>
          )}
        </>
      )}

      {/* ── ESTADO INICIAL ── */}
      {ingresosSesiones.length === 0 && ingresosEventos.length === 0 && !ingresosLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', marginBottom: 8 }}>
            Selecciona un período y aplica los filtros
          </h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Verás el resumen de tus ingresos por sesiones y eventos en el rango seleccionado.
          </p>
        </div>
      )}

    </div>
  )
}

  // ─── Sections ────────────────────────────────────────────────────────────────
  const renderPerfil = () => (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, paddingBottom: 20, borderBottom: '2px solid #f0f0f0', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: avatarUrl ? 'white' : 'linear-gradient(135deg,#995bd5,#ffa719)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid #995bd5', flexShrink: 0 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{initials}</span>
            }
          </div>
          <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#ffa719', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
            {avatarUploading ? <span style={{ fontSize: 12 }}>...</span> : <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#2d2926' }}><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 24, color: '#421869', fontWeight: 700 }}>{meta?.nombre} {meta?.apellidos}</h3>
            {isMenter && <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: planInfo.bg, color: planInfo.color }}>{planInfo.emoji} {planInfo.label}</span>}
          </div>
          <button onClick={() => switchTab('editar')} style={{ padding: '9px 20px', borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway', whiteSpace: 'nowrap' }}>Editar perfil</button>
        </div>
      </div>
      {/* ── Link de perfil público (solo menters) ── */}
      {isMenter && user?.id && (
        <div style={{ background: 'linear-gradient(135deg,#f3e8ff,#fff3e0)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tu link de perfil</p>
            <p style={{ margin: 0, fontSize: 13, color: '#421869', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {`${process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'}/menter/${user.id}`}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'}/menter/${user.id}`)
              const btn = document.getElementById('copy-link-btn')
              if (btn) { btn.textContent = '¡Copiado!'; setTimeout(() => { btn.textContent = 'Copiar' }, 2000) }
            }}
            id="copy-link-btn"
            style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, fontFamily: 'Raleway, sans-serif' }}>
            Copiar
          </button>
          <a href={`/menter/${user.id}`} target="_blank" rel="noopener noreferrer"
            style={{ padding: '8px 18px', borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, fontFamily: 'Raleway, sans-serif', textDecoration: 'none' }}>
            Ver
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <FieldBlock label="Email" value={user?.email} />
        {meta?.telefono   && <FieldBlock label="Teléfono"  value={meta.telefono} />}
        {meta?.pais       && <FieldBlock label="País"       value={meta.pais} />}
        {meta?.cumpleanos && <FieldBlock label="Cumpleaños" value={(() => { const [y,m,d] = meta.cumpleanos!.split('-'); const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']; return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}` })()} />}
        {meta?.empresa    && <FieldBlock label="Empresa"   value={meta.empresa} highlight />}
        {meta?.cargo      && <FieldBlock label="Cargo"     value={meta.cargo} />}
      </div>
      {respuestas && Object.keys(respuestas).length > 0 && (
        <div style={{ marginTop: 30, paddingTop: 30, borderTop: '2px solid #f0f0f0' }}>
          <h4 style={{ fontSize: 18, color: '#421869', margin: '0 0 20px 0', fontWeight: 700 }}>{isMenter ? 'Especialidades' : meta?.role === 'empresa' ? 'Info Corporativa' : 'Info de Consulta'}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(respuestas).map(([key, val]) => {
              if (!val || key === 'especialidades_otros') return null
              const values = Array.isArray(val) ? val : [String(val)]
              return values.map((v, i) => <span key={`${key}-${i}`} style={{ background: '#995bd5', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{String(v)}</span>)
            })}
          </div>
        </div>
      )}
      <div style={{ marginTop: 20, padding: 15, background: isMenter ? '#fff8e1' : '#f0f7ff', borderLeft: `4px solid ${isMenter ? '#ffa719' : '#1976d2'}`, borderRadius: '0 8px 8px 0' }}>
        <p style={{ margin: 0, fontSize: 14, color: isMenter ? '#e65100' : '#1565c0' }}>
          {isMenter
            ? <><strong>Tip:</strong> Completa tu <button onClick={() => switchTab('perfil-pro')} style={{ background: 'none', border: 'none', color: '#421869', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: 14 }}>Perfil Profesional</button> para aparecer en el matching.</>
            : <><strong>Tip:</strong> Puedes editar tu información desde el botón &quot;Editar&quot; en el menú lateral.</>
          }
        </p>
      </div>

      {/* Zona de peligro */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '2px solid #fee2e2' }}>
        <h4 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 15, fontWeight: 800, color: '#c62828', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Zona de peligro</h4>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px' }}>Al eliminar tu cuenta se borrarán permanentemente todos tus datos, sesiones, publicaciones y cualquier información asociada. Esta acción no se puede deshacer.</p>
        <button
          onClick={async () => {
            const confirmado = window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es permanente e irreversible.')
            if (!confirmado) return
            const segunda = window.confirm('Última confirmación: se eliminarán TODOS tus datos. ¿Continuar?')
            if (!segunda) return
            // Guardar datos antes de borrar
            const nombreUsuario = `${meta?.nombre || ''} ${meta?.apellidos || ''}`.trim() || 'Usuario'
            const emailUsuario  = user!.email || ''

            const res = await fetch('/api/account/delete', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ userId: user!.id }),
            })
            if (res.ok) {
              // Email de despedida antes del signOut
              if (emailUsuario) {
                await fetch('/api/email', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ tipo: 'despedida', data: { userName: nombreUsuario, userEmail: emailUsuario } }),
                })
              }
              await supabase.auth.signOut()
              window.location.href = '/'
            } else {
              alert('Error al eliminar la cuenta. Escríbenos a contacto@girolab.net')
            }
          }}
          style={{ padding: '10px 24px', borderRadius: 20, border: '2px solid #c62828', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}
        >
          Eliminar mi cuenta
        </button>
      </div>
    </div>
  )

  const renderEditar = () => (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {editMsg && <div style={{ padding: 15, borderRadius: 10, marginBottom: 20, fontWeight: 500, background: editMsg.type === 'success' ? '#d4edda' : '#f8d7da', color: editMsg.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${editMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>{editMsg.text}</div>}
      <h3 style={{ color: '#421869', marginBottom: 20, fontFamily: 'Raleway, sans-serif' }}>Editar Información</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <FormField label="Nombre *"    value={editForm.nombre}    onChange={v => setEditForm(p => ({ ...p, nombre: v }))} />
        <FormField label="Apellidos *" value={editForm.apellidos} onChange={v => setEditForm(p => ({ ...p, apellidos: v }))} />
        {meta?.role === 'empresa' && <>
          <FormField label="Empresa" value={editForm.empresa} onChange={v => setEditForm(p => ({ ...p, empresa: v }))} />
          <FormField label="Cargo"   value={editForm.cargo}   onChange={v => setEditForm(p => ({ ...p, cargo: v }))} />
        </>}
        <FormField label="Teléfono" value={editForm.telefono} onChange={v => setEditForm(p => ({ ...p, telefono: v }))} />
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>País</label>
          <select value={editForm.pais} onChange={e => setEditForm(p => ({ ...p, pais: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }}>
            <option value="">Selecciona tu país</option>
            {PAISES.map(p => <option key={p} value={p} disabled={p.startsWith('─')}>{p}</option>)}
          </select>
        </div>
        <DateField label="Fecha de cumpleaños" value={editForm.cumpleanos} onChange={v => setEditForm(p => ({ ...p, cumpleanos: v }))} />
      </div>
      <div style={{ marginTop: 30 }}>
        <button onClick={handleSaveEdit} disabled={editSaving} style={{ background: editSaving ? 'rgba(255,167,25,0.5)' : '#ffa719', color: '#2d2926', border: 'none', padding: '10px 20px', borderRadius: 30, fontWeight: 600, fontSize: 14, cursor: editSaving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', textTransform: 'uppercase' }}>
          {editSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )

  const renderMembresia = () => {
    const trialEndsAt = (membership as any)?.trial_ends_at
    const trialDaysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
      : null
    const enTrial = trialDaysLeft !== null && trialDaysLeft > 0 && plan !== 'free'
    const downgradeReason = (membership as any)?.downgrade_reason

    return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Banner trial */}
      {enTrial && (
        <div style={{ padding: '14px 20px', borderRadius: 12, background: '#e8f5e9', border: '1.5px solid #4caf50', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#2e7d32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#1b5e20', fontSize: 14 }}>
              Período de prueba — {trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''}
            </p>
            <p style={{ margin: 0, color: '#2e7d32', fontSize: 12 }}>
              Tu tarjeta será cobrada automáticamente al terminar. Puedes cancelar cuando quieras.
            </p>
          </div>
        </div>
      )}
      {/* Banner downgrade */}
      {downgradeReason && plan === 'free' && (
        <div style={{ padding: '14px 20px', borderRadius: 12, background: '#FFEBEE', border: '1.5px solid #ef5350', marginBottom: 20 }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#b71c1c', fontSize: 14 }}>
            {downgradeReason === 'payment_failed'
              ? 'Tu plan fue reducido a Free por un problema de pago. Suscríbete de nuevo para recuperar el acceso.'
              : 'Tu suscripción fue cancelada. Suscríbete de nuevo para continuar con tu plan.'}
          </p>
        </div>
      )}
      <div style={{ padding: 24, borderRadius: 16, background: planInfo.bg, border: `2px solid ${planInfo.color}`, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>{planInfo.emoji}</span>
          <div>
            <h3 style={{ margin: 0, color: planInfo.color, fontFamily: 'Raleway, sans-serif', fontSize: 22, fontWeight: 900 }}>Plan {planInfo.label}</h3>
            <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
              {membership?.expires_at ? `Vence: ${new Date(membership.expires_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}` : plan === 'free' ? 'Plan gratuito' : plan === 'master' ? 'Otorgado por Giro Lab' : enTrial ? `Prueba gratuita hasta el ${new Date(trialEndsAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}` : 'Activo'}
            </p>
          </div>
        </div>
      </div>
      {plan !== 'master' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #421869 0%, #6a1b9a 100%)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🎁</span>
            <div>
              {activePromo && (
                <p style={{ margin: '0 0 2px', fontSize: 11, color: '#ffa719', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                  {activePromo.nombre}
                </p>
              )}
              <p style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: 15, fontFamily: 'Raleway, sans-serif' }}>
                {activePromo ? activePromo.trial_dias : 20} días de prueba gratuita incluidos
              </p>
              <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                Ingresa tu tarjeta hoy y empieza a usar todas las herramientas. Sin cargo durante los primeros {activePromo ? activePromo.trial_dias : 20} días — cancela cuando quieras.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: 0 }}>Elige tu plan</h3>
            <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: 30, padding: 4 }}>
              <button onClick={() => setBillingCycle('monthly')} style={{ padding: '8px 20px', borderRadius: 26, border: 'none', background: billingCycle === 'monthly' ? '#421869' : 'transparent', color: billingCycle === 'monthly' ? 'white' : '#666', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans' }}>Mensual</button>
              <button onClick={() => setBillingCycle('annual')} style={{ padding: '8px 20px', borderRadius: 26, border: 'none', background: billingCycle === 'annual' ? '#421869' : 'transparent', color: billingCycle === 'annual' ? 'white' : '#666', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 6 }}>
                Anual <span style={{ background: '#2e7d32', color: 'white', fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>-10%</span>
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            {(['free','starter','premium'] as const).map(p => {
              const pi = PLANES[p]; const esPlanActual = plan === p
              const precio = p === 'free' ? null : billingCycle === 'monthly' ? pi.precio_mensual : pi.precio_anual
              return (
                <div key={p} style={{ borderRadius: 16, border: `2px solid ${esPlanActual ? pi.color : p !== 'free' ? pi.color : '#e0e0e0'}`, padding: 22, background: esPlanActual ? pi.bg : 'white', position: 'relative' }}>
                  {esPlanActual && <div style={{ position: 'absolute', top: -1, right: 16, background: pi.color, color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: '0 0 10px 10px', letterSpacing: 1 }}>ACTUAL</div>}
                  {!esPlanActual && p !== 'free' && <div style={{ position: 'absolute', top: -1, right: 16, background: '#ffa719', color: '#2d2926', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: '0 0 10px 10px', letterSpacing: 0.5 }}>20 DÍAS GRATIS</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ fontSize: 22 }}>{pi.emoji}</span><h4 style={{ margin: 0, color: pi.color, fontFamily: 'Raleway, sans-serif', fontSize: 17, fontWeight: 900 }}>{pi.label}</h4></div>
                  <div style={{ marginBottom: 6 }}>
                    {precio === null ? <div style={{ fontSize: 20, fontWeight: 700, color: '#2d2926' }}>Gratis</div>
                      : <div style={{ fontSize: 20, fontWeight: 700, color: '#2d2926' }}>${precio}<span style={{ fontSize: 13, fontWeight: 400, color: '#666' }}>{billingCycle === 'annual' ? '/año' : '/mes'}</span></div>}
                  </div>
                  {p !== 'free' && (
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#16a34a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      {activePromo ? activePromo.trial_dias : 20} días gratis — sin cargo hasta que termines la prueba
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: '#4d4d4d', lineHeight: 1.7, marginBottom: 16 }}>
                    {p === 'free'    && <><span>Especialidades y casos</span><br/><span>Bio y presentación</span><br/><span>Precio y disponibilidad</span><br/><span>Descuento a Menters</span><br/><span style={{color:'#bbb'}}>Sin matching automático</span></>}
                    {p === 'starter' && <><span>Todo lo de Free</span><br/><span>Matching automático</span><br/><span>Idiomas</span><br/><span>Formación académica</span><br/><span>Experiencia laboral</span></>}
                    {p === 'premium' && <><span>Todo lo de Starter</span><br/><span>Número de colegiatura</span><br/><span>Certificados</span><br/><span>Escribir en blog</span><br/><span>Redes y enlaces</span></>}
                  </div>
                  {!esPlanActual && p !== 'free' && (
                    <>
                    <button
                      disabled={subLoading === p}
                      onClick={async () => {
                        setSubLoading(p)
                        try {
                          const res = await fetch('/api/paypal/create-subscription', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: p, billing_cycle: billingCycle }),
                          })
                          const data = await res.json()
                          if (data.approve_url) {
                            if (typeof window !== 'undefined' && (window as any).gtag) {
                              (window as any).gtag('event', 'suscripcion_iniciada', { plan: p, billing_cycle: billingCycle })
                            }
                            if (typeof window !== 'undefined' && (window as any).ttq) {
                              (window as any).ttq.track('InitiateCheckout', { content_name: p })
                            }
                            fetch('/api/checkout/attempt', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ plan: p, billing_cycle: billingCycle }),
                            }).catch(() => {})
                            window.location.href = data.approve_url
                          } else {
                            setPpModal({ type: 'error', msg: data.error || 'Error al iniciar suscripción' })
                          }
                        } catch {
                          setPpModal({ type: 'error', msg: 'Error de conexión. Intenta de nuevo.' })
                        } finally {
                          setSubLoading(null)
                        }
                      }}
                      style={{ width: '100%', padding: '12px', borderRadius: 30, border: 'none', background: subLoading === p ? '#ccc' : pi.color, color: 'white', fontWeight: 800, fontSize: 14, cursor: subLoading === p ? 'not-allowed' : 'pointer', fontFamily: 'Raleway, sans-serif' }}
                    >
                      {subLoading === p ? 'Redirigiendo…' : `Probar ${activePromo ? activePromo.trial_dias : 20} días gratis →`}
                    </button>
                    <p style={{ margin: '8px 0 0', fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 1.5 }}>
                      Requiere tarjeta · Sin cobro por {activePromo ? activePromo.trial_dias : 20} días · Cancela cuando quieras
                    </p>
                    </>
                  )}
                  {esPlanActual && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', fontSize: 13, color: pi.color, fontWeight: 600 }}>Tu plan actual</div>
                      {(membership as any)?.paypal_subscription_id && plan !== 'free' && (plan as string) !== 'master' && (
                        <button
                          onClick={() => setPpModal({
                            type: 'confirm',
                            msg: '¿Cancelar suscripción? Tu plan bajará a Free de inmediato.',
                            onConfirm: async () => {
                              setPpModal(null)
                              const res = await fetch('/api/paypal/cancel-subscription', { method: 'POST' })
                              const data = await res.json()
                              if (data.ok) {
                                setMembership(prev => prev ? { ...prev, plan: 'free', is_active: false } : prev)
                                setPpModal({ type: 'success', msg: 'Suscripción cancelada. Tu plan es ahora Free.' })
                              } else {
                                setPpModal({ type: 'error', msg: data.error || 'Error al cancelar. Intenta de nuevo.' })
                              }
                            },
                          })}
                          style={{ fontSize: 11, color: '#999', background: 'none', border: '1px solid #ddd', borderRadius: 20, padding: '4px 14px', cursor: 'pointer' }}
                        >
                          Cancelar suscripción
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
      {plan === 'master' && <div style={{ padding: 20, background: '#fff3e0', borderRadius: 12, border: '2px solid #e65100' }}><p style={{ margin: 0, color: '#e65100', fontWeight: 600, fontSize: 15 }}>Tienes acceso Master otorgado por Giro Lab. Disfrutas de todos los beneficios de la plataforma.</p></div>}
    </div>
  )}

const renderCitasMenter = () => {
  const hoy = new Date().toISOString().split('T')[0]
  const pendientes = citasMenter.filter(c =>
    c.status === 'pendiente' ||
    (c.status === 'reprogramacion_pendiente' && c.reprogramacion_propuesta_por !== user?.id)
  )
  const confirmadas = citasMenter.filter(c => c.status === 'confirmada' && c.date >= hoy)
  const pasadas = citasMenter.filter(c =>
    c.status === 'completada' || c.status === 'cancelada' ||
    (c.status === 'confirmada' && c.date < hoy)
  )
  const pasadasTotal = pasadas.length
  const pasadasVisible = pasadas.slice(0, historialMenterLimit)

  const handleEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      setCitasMenter(prev => prev.map(c => c.id === id ? { ...c, status: nuevoEstado } : c))
      setCitas(prev => prev.map(c => c.id === id ? { ...c, status: nuevoEstado } : c))

      // Disparar email al cliente según el nuevo estado
      const cita = citasMenter.find(c => c.id === id)
      if (cita && cita.client_email && (nuevoEstado === 'confirmada' || nuevoEstado === 'rechazada')) {
        const citaData = {
          clientName:    cita.client_name,
          clientEmail:   cita.client_email,
          menterName:    cita.menter_name,
          menterEmail:   user?.email || '',
          date:          new Date(cita.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          startTime:     cita.start_time?.slice(0, 5) || '',
          endTime:       cita.end_time?.slice(0, 5) || '',
          modality:      cita.modality || 'online',
          price:         cita.price || 0,
          appointmentId: id,
        }
        if (nuevoEstado === 'confirmada') {
          dispararEmail('confirmacion_cliente', citaData)
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) return
            fetch('/api/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
              body: JSON.stringify({
                user_id: cita.client_id,
                title: '¡Cita confirmada!',
                body: `Tu sesión con ${cita.menter_name} el ${citaData.date} a las ${citaData.startTime} está confirmada.`,
                url: '/dashboard?tab=mis-citas',
              }),
            }).catch(() => {})
          })
        }
        if (nuevoEstado === 'rechazada') {
          dispararEmail('rechazo_cliente', citaData)
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session || !cita.client_id) return
            fetch('/api/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
              body: JSON.stringify({
                user_id: cita.client_id,
                title: 'Solicitud no confirmada',
                body: `${cita.menter_name} no pudo aceptar tu solicitud para el ${citaData.date}.`,
                url: '/dashboard?tab=mis-citas',
              }),
            }).catch(() => {})
          })
        }
      }
    }
  }

  const Section = ({ title, items, empty }: { title: string; items: any[]; empty: string }) => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</h3>
      {items.length === 0
        ? <p style={{ color: '#aaa', fontSize: 14, padding: '20px 0' }}>{empty}</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(c => (
              <CitaCardMenter
                key={c.id}
                c={c}
                onEstado={handleEstado}
                onReprogramar={(c) => { setModalReprogramar(c); setReprogramarFecha(c.date); setReprogramarHoraInicio(c.start_time?.slice(0,5)||''); setReprogramarHoraFin(c.end_time?.slice(0,5)||'') }}
                onCancelar={(c) => setModalCancelar(c)}
                onAceptar={handleAceptarReprogramacion}
                onRechazar={handleRechazarReprogramacion}
              />
            ))}
          </div>
      }
    </div>
  )

  if (citasMenterLoading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}></div>
      <p style={{ color: '#666' }}>Cargando citas...</p>
    </div>
  )

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {citasMenter.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}></div>
          <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 8 }}>No tienes citas aún</h3>
          <p style={{ color: '#666', fontSize: 14 }}>Cuando un cliente agende una sesión contigo, aparecerá aquí.</p>
        </div>
      ) : (
        <div>
          <Section title="Por confirmar" items={pendientes} empty="No tienes citas pendientes." />
          <Section title="Confirmadas próximas" items={confirmadas} empty="No tienes citas confirmadas próximas." />
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Historial</h3>
            {pasadasVisible.length === 0
              ? <p style={{ color: '#aaa', fontSize: 14, padding: '20px 0' }}>Aún no tienes citas pasadas.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pasadasVisible.map(c => (
                    <div key={c.id}>
                      <CitaCardMenter c={c} onEstado={handleEstado} onReprogramar={(c) => { setModalReprogramar(c); setReprogramarFecha(c.date); setReprogramarHoraInicio(c.start_time?.slice(0,5)||''); setReprogramarHoraFin(c.end_time?.slice(0,5)||'') }} onCancelar={(c) => setModalCancelar(c)} onAceptar={handleAceptarReprogramacion} onRechazar={handleRechazarReprogramacion} />
                      {c.status === 'completada' && resenasMenter[c.id] && (
                        <div style={{ marginTop: 8, padding: '10px 16px', background: '#fdf8ff', border: '1px solid #e9d5ff', borderRadius: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: resenasMenter[c.id].comentario ? 6 : 0 }}>
                            <span style={{ color: '#ffa719', fontSize: 16, letterSpacing: 1 }}>{'★'.repeat(resenasMenter[c.id].estrellas)}{'☆'.repeat(5 - resenasMenter[c.id].estrellas)}</span>
                            <span style={{ fontSize: 12, color: '#6a1b9a', fontWeight: 600 }}>{resenasMenter[c.id].estrellas}/5</span>
                          </div>
                          {resenasMenter[c.id].comentario && (
                            <p style={{ margin: 0, fontSize: 13, color: '#555', fontStyle: 'italic' }}>"{resenasMenter[c.id].comentario}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            }
          </div>
          {pasadasTotal > historialMenterLimit && (
            <button onClick={() => setHistorialMenterLimit(prev => prev + 3)}
              style={{ width: '100%', padding: '12px', marginTop: 12, borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
              Ver más ({pasadasTotal - historialMenterLimit} restantes)
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const renderMisCitas = () => {
  const hoy = new Date().toISOString().split('T')[0]
  const pendientes = citas.filter(c =>
    c.status === 'pendiente' ||
    (c.status === 'reprogramacion_pendiente' && c.reprogramacion_propuesta_por !== user?.id)
  )
  const confirmadas = citas.filter(c => c.status === 'confirmada' && c.date >= hoy)
  const pasadas = citas.filter(c =>
    c.status === 'completada' || c.status === 'cancelada' ||
    (c.status === 'confirmada' && c.date < hoy)
  )
  const pasadasTotal = pasadas.length
  const pasadasVisible = pasadas.slice(0, historialClienteLimit)

  const Section = ({ title, items, empty }: { title: string; items: any[]; empty: string }) => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</h3>
      {items.length === 0
        ? <p style={{ color: '#aaa', fontSize: 14, padding: '20px 0' }}>{empty}</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(c => (
              <CitaCardPersona
                key={c.id}
                c={c}
                onReprogramar={(c) => { setModalReprogramar(c); setReprogramarFecha(c.date); setReprogramarHoraInicio(c.start_time?.slice(0,5)||''); setReprogramarHoraFin(c.end_time?.slice(0,5)||'') }}
                onCancelar={(c) => setModalCancelar(c)}
                onAceptar={handleAceptarReprogramacion}
                onRechazar={handleRechazarReprogramacion}
              />
            ))}
          </div>
      }
    </div>
  )

  if (citasLoading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 32 }}></div>
      <p style={{ color: '#666' }}>Cargando tus citas...</p>
    </div>
  )

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {citas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}></div>
          <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 8 }}>Aún no tienes citas</h3>
          <p style={{ color: '#666', fontSize: 14 }}>Encuentra un Menter y agenda tu primera sesión.</p>
          <button onClick={() => switchTab('destacados')}
            style={{ marginTop: 16, padding: '12px 28px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Ver Menters →
          </button>
        </div>
      ) : (
        <>
          <Section title="Pendientes de confirmación" items={pendientes} empty="No tienes citas pendientes." />
          <Section title="Próximas confirmadas" items={confirmadas} empty="No tienes citas confirmadas próximas." />
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Historial</h3>
            {pasadasVisible.length === 0
              ? <p style={{ color: '#aaa', fontSize: 14, padding: '20px 0' }}>Aún no tienes citas pasadas.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pasadasVisible.map(c => (
                    <div key={c.id}>
                      <CitaCardPersona
                        c={c}
                        onReprogramar={(c) => { setModalReprogramar(c); setReprogramarFecha(c.date); setReprogramarHoraInicio(c.start_time?.slice(0,5)||''); setReprogramarHoraFin(c.end_time?.slice(0,5)||'') }}
                        onCancelar={(c) => setModalCancelar(c)}
                        onAceptar={handleAceptarReprogramacion}
                        onRechazar={handleRechazarReprogramacion}
                      />
                      {c.status === 'completada' && (
                        <div style={{ marginTop: 8, paddingLeft: 4 }}>
                          {misResenas[c.id] ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#085041', background: '#E1F5EE', padding: '4px 12px', borderRadius: 20 }}>
                                <span style={{ color: '#ffa719' }}>{'★'.repeat(misResenas[c.id].estrellas)}</span> Ya reseñaste esta sesión
                              </div>
                              <button
                                onClick={() => compartirResena(c, misResenas[c.id])}
                                style={{ padding: '4px 12px', borderRadius: 20, border: '0.5px solid #421869', background: 'transparent', color: '#421869', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                              >
                                Compartir en comunidad
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReviewModal({ appointmentId: c.id, reviewedId: c.menter_id, reviewedName: c.menter_name })
                                setReviewForm({ estrellas: 0, comentario: '', puntualidad: 0, comunicacion: 0, efectividad: 0 })
                              }}
                              style={{ padding: '6px 14px', borderRadius: 20, border: '0.5px solid #421869', background: '#f3e8ff', color: '#421869', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Dejar resena
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            }
          </div>
          {pasadasTotal > historialClienteLimit && (
            <button onClick={() => setHistorialClienteLimit(prev => prev + 3)}
              style={{ width: '100%', padding: '12px', marginTop: 12, borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
              Ver más ({pasadasTotal - historialClienteLimit} restantes)
            </button>
          )}
        </>
      )}
    </div>
  )
}

const renderBlogMenter = () => {
  if (blogView === 'editor') return (
    <div style={{ padding: '24px 0' }}>
      <button onClick={() => { setBlogView('lista'); setBlogEditId(null); setBlogForm({ title: '', content: '', tags: '', cover_image: '', status: 'borrador' }) }}
        style={{ background: 'none', border: 'none', color: '#421869', fontWeight: 600, cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        ← Volver a mis posts
      </button>
      <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 20 }}>
        {blogEditId ? 'Editar post' : 'Nuevo post'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          placeholder="Título del post"
          value={blogForm.title}
          onChange={e => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 15, fontFamily: 'inherit' }}
        />
        {/* Upload imagen de portada */}
<div>
  <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>
    Imagen de portada (opcional, máx. 2MB)
  </label>
  {blogForm.cover_image && (
    <div style={{ position: 'relative', marginBottom: 8, display: 'inline-block' }}>
      <img src={blogForm.cover_image} alt="Portada"
        style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12 }} />
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => setBlogForm(prev => ({ ...prev, cover_image: '' }))}
        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
        ✕
      </button>
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no puede superar 2 MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => setBlogForm(prev => ({ ...prev, cover_image: reader.result as string }))
      reader.readAsDataURL(file)
      e.target.value = ''
    }}
    style={{ padding: '10px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer' }}
  />
</div>
        <input
          placeholder="Etiquetas separadas por coma (ej: ansiedad, coaching)"
          value={blogForm.tags}
          onChange={e => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }}
        />

        <div>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Contenido</p>
          <RichTextEditor
            content={blogForm.content}
            onChange={(html: string) => setBlogForm(prev => ({ ...prev, content: html }))}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={async () => {
              const tags = blogForm.tags.split(',').map(t => t.trim()).filter(Boolean)
              if (blogEditId) {
                await supabase.from('blog_posts').update({ ...blogForm, tags, updated_at: new Date().toISOString() }).eq('id', blogEditId)
              } else {
                await supabase.from('blog_posts').insert({ ...blogForm, tags, menter_id: user?.id })
              }
              setBlogView('lista')
              setBlogEditId(null)
              setBlogForm({ title: '', content: '', tags: '', cover_image: '', status: 'borrador' })
              const { data } = await supabase.from('blog_posts').select('*').eq('menter_id', user?.id).order('created_at', { ascending: false })
              setBlogPosts(data || [])
            }}
            style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Guardar borrador
          </button>
          <button
            onClick={async () => {
              const tags = blogForm.tags.split(',').map(t => t.trim()).filter(Boolean)
              if (blogEditId) {
                await supabase.from('blog_posts').update({ ...blogForm, tags, status: 'publicado', updated_at: new Date().toISOString() }).eq('id', blogEditId)
              } else {
                await supabase.from('blog_posts').insert({ ...blogForm, tags, status: 'publicado', menter_id: user?.id })
                await supabase.from('community_posts').insert({
                  user_id: user?.id,
                  tipo: 'texto',
                  contenido: `Nuevo artículo: ${blogForm.title}${blogForm.content ? '\n\n' + blogForm.content.replace(/<[^>]+>/g, '').slice(0, 200) : ''}`,
                  media_url: blogForm.cover_image || null,
                })
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'comunidad_post_creado', { tipo: 'blog', titulo: blogForm.title })
                }
              }
              setBlogView('lista')
              setBlogEditId(null)
              setBlogForm({ title: '', content: '', tags: '', cover_image: '', status: 'borrador' })
              const { data } = await supabase.from('blog_posts').select('*').eq('menter_id', user?.id).order('created_at', { ascending: false })
              setBlogPosts(data || [])
            }}
            style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Publicar
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>Mis Posts</h2>
        <button onClick={() => setBlogView('editor')}
          style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
          + Nuevo post
        </button>
      </div>

      {blogLoading ? (
        <p style={{ color: '#999' }}>Cargando...</p>
      ) : blogPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p>Aún no tienes posts. ¡Escribe tu primer artículo!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {blogPosts.map(post => (
            <div key={post.id} style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 6px', fontSize: 16 }}>{post.title}</h3>
                  <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px' }}>
                    {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: post.status === 'publicado' ? '#e8f5e9' : '#fff8e1',
                    color: post.status === 'publicado' ? '#1b5e20' : '#e65100' }}>
                    {post.status === 'publicado' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => {
                    setBlogEditId(post.id)
                    setBlogForm({ title: post.title, content: post.content, tags: (post.tags || []).join(', '), cover_image: post.cover_image || '', status: post.status })
                    setBlogView('editor')
                  }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#421869', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Editar
                  </button>
                  <button onClick={async () => {
                    if (confirm('¿Eliminar este post?')) {
                      await supabase.from('blog_posts').delete().eq('id', post.id)
                      setBlogPosts(prev => prev.filter(p => p.id !== post.id))
                    }
                  }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección: posts de la comunidad */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '2px solid #f0f0f0' }}>
        <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 8 }}>Posts de la comunidad</h3>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>Lo que están compartiendo otros Menters</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['reciente', 'popular', 'destacado'] as const).map(orden => (
            <button key={orden} onClick={() => setBlogFiltroOrden(orden)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: blogFiltroOrden === orden ? '#421869' : '#f0f0f0',
              color: blogFiltroOrden === orden ? 'white' : '#333', fontWeight: 600, fontSize: 13
            }}>
              {orden === 'reciente' ? 'Reciente' : orden === 'popular' ? 'Popular' : 'Destacados'}
            </button>
          ))}
        </div>
        {renderGrillaPostsPublicos(
          blogPostsPublicos
            .filter(p => p.menter_id !== user?.id)
            .sort((a, b) => {
              if (blogFiltroOrden === 'popular') return (b.blog_likes?.[0]?.count || 0) - (a.blog_likes?.[0]?.count || 0)
              if (blogFiltroOrden === 'destacado') {
                const planOrder: Record<string, number> = { master: 0, premium: 1, starter: 2, free: 3 }
                return (planOrder[a.menter?.raw_user_meta_data?.plan] ?? 3) - (planOrder[b.menter?.raw_user_meta_data?.plan] ?? 3)
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
        )}
      </div>
    </div>
  )
}

const renderBlogModal = () => {
  if (!blogModalPost) return null

  const handleLike = async () => {
    if (!user?.id) return
    if (blogUserLiked) {
      await supabase.from('blog_likes').delete().eq('post_id', blogModalPost.id).eq('user_id', user.id)
      setBlogLikes(prev => prev - 1)
      setBlogUserLiked(false)
    } else {
      await supabase.from('blog_likes').insert({ post_id: blogModalPost.id, user_id: user.id })
      setBlogLikes(prev => prev + 1)
      setBlogUserLiked(true)
    }
  }

  const handleComment = async () => {
    if (!blogComment.trim() || !user?.id) return
    await supabase.from('blog_comments').insert({ post_id: blogModalPost.id, user_id: user.id, content: blogComment })
    setBlogComment('')
    const { data } = await supabase.from('blog_comments')
      .select('*, user:user_id(raw_user_meta_data)')
      .eq('post_id', blogModalPost.id)
      .order('created_at', { ascending: true })
    setBlogComments(data || [])
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }} onClick={() => setBlogModalPost(null)}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 800,
        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    {blogModalPost.menter?.avatar_url ? (
      <img src={blogModalPost.menter.avatar_url} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
        {blogModalPost.menter?.nombre?.[0] || 'M'}
      </div>
    )}
    <div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#421869' }}>
        {blogModalPost.menter?.nombre || 'Menter'}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
        {new Date(blogModalPost.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  </div>
  <button onClick={() => setBlogModalPost(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666' }}aria-label="Cerrar">✕</button>
</div>

        {/* Contenido */}
        <div style={{ padding: '24px' }}>
          {blogModalPost.cover_image && (
            <img src={blogModalPost.cover_image} alt={blogModalPost.title}
              style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }} />
          )}

          <h1 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 26, margin: '0 0 12px' }}>
            {blogModalPost.title}
          </h1>

          {blogModalPost.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {blogModalPost.tags.map((tag: string) => (
                <span key={tag} style={{ background: '#f3e8ff', color: '#6d28d9', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div dangerouslySetInnerHTML={{ __html: blogModalPost.content }}
            style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 24 }} />

          {/* Like y compartir */}
          <div style={{ display: 'flex', gap: 12, padding: '16px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
            <button onClick={handleLike} style={{
              padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: blogUserLiked ? '#421869' : '#f3e8ff',
              color: blogUserLiked ? 'white' : '#421869', fontWeight: 700, fontSize: 14
            }}>
              {blogLikes} Me gusta
            </button>
            <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/blog/${blogModalPost.id}`)
  .then(() => {
    setToastMsg('Link copiado al portapapeles')
    setTimeout(() => setToastMsg(null), 3000)
  })
  .catch(() => {

    const input = document.createElement('input')
    input.value = `${window.location.origin}/blog/${blogModalPost.id}`
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    setToastMsg('Link copiado al portapapeles')
    setTimeout(() => setToastMsg(null), 3000)
  })
              setToastMsg('Link copiado al portapapeles')
              setTimeout(() => setToastMsg(null), 3000)
            }} style={{
              padding: '8px 20px', borderRadius: 20, border: '1px solid #ddd',
              background: 'white', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer'
            }}>
              Compartir
            </button>
          </div>

          {/* Comentarios */}
          <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 16 }}>
            Comentarios ({blogComments.length})
          </h3>

          <div style={{ marginBottom: 20 }}>
            <textarea
              value={blogComment}
              onChange={e => setBlogComment(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button onClick={handleComment} style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 20, border: 'none',
              background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer'
            }}>
              Publicar comentario
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {blogComments.map(c => (
              <div key={c.id} style={{ background: '#f8f9fa', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#421869', margin: '0 0 4px' }}>
                  {c.user?.raw_user_meta_data?.nombre || 'Usuario'}
                </p>
                <p style={{ fontSize: 14, color: '#333', margin: '0 0 4px' }}>{c.content}</p>
                <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                  {new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            ))}
            {blogComments.length === 0 && (
              <p style={{ color: '#999', fontSize: 14 }}>Sé el primero en comentar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

 const abrirBlogPost = async (post: any) => {
  const { sanitizeHtml } = await import('@/lib/sanitize')
  const safeContent = await sanitizeHtml(post.content || '')
  setBlogModalPost({ ...post, content: safeContent })
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'blog_leido', { post_id: post.id, titulo: post.title })
  }
  
  const { data: likesData, count } = await supabase
    .from('blog_likes').select('*', { count: 'exact' }).eq('post_id', post.id)
  setBlogLikes(count || 0)
  setBlogUserLiked((likesData || []).some((l: any) => l.user_id === user?.id))
  // Cargar comentarios
  const { data: commentsData } = await supabase
    .from('blog_comments')
    .select('*, user:user_id(raw_user_meta_data)')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true })
  setBlogComments(commentsData || [])
}

const abrirEvento = async (evento: any) => {
  const { sanitizeHtml } = await import('@/lib/sanitize')
  const safeDesc = await sanitizeHtml(evento.description || '')
  setEventoModal({ ...evento, description: safeDesc })
}

const renderGrillaPostsPublicos = (posts: any[]) => {
  if (blogPostsPublicosLoading) return <p style={{ color: '#999' }}>Cargando posts...</p>
  
  return posts.length === 0 ? (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
      <p>Aún no hay posts publicados.</p>
    </div>
  ) : (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {posts.map(post => (
        <div key={post.id} onClick={() => abrirBlogPost(post)}
          style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'transform 0.1s', }}>

          {post.cover_image && (
            <img src={post.cover_image} alt={post.title}
              style={{ width: '100%', height: 140, objectFit: 'cover' }} />
          )}

          <div style={{ padding: '16px' }}>
            {/* Autor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {post.menter?.avatar_url || post.menter?.raw_user_meta_data?.avatar_url ? (
                <img src={post.menter.avatar_url || post.menter?.raw_user_meta_data?.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>
                  {post.menter?.nombre || post.menter?.raw_user_meta_data?.nombre}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#421869' }}>
                {post.menter?.nombre || post.menter?.raw_user_meta_data?.nombre}
              </span>
            </div>

            <h3 style={{ fontFamily: 'Raleway', color: '#333', fontSize: 15, margin: '0 0 8px', lineHeight: 1.4 }}>
              {post.title}
            </h3>

            {post.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {post.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} style={{ background: '#f3e8ff', color: '#6d28d9', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, color: '#999', fontSize: 12 }}>
              <span>{post.blog_likes?.[0]?.count || 0}</span>
              <span>{post.blog_comments?.[0]?.count || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const renderGrillaEventosPublicos = (eventosLista: any[]) => {
  if (eventosLista.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}></div>
      <p>{eventosPublicosLoaded ? 'No hay eventos próximos' : 'Cargando eventos...'}</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {eventosLista.slice(0, eventosComunidadLimit).map(evento => (
        <div key={evento.id} onClick={() => abrirEvento(evento)}
          style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', cursor: 'pointer' }}>
          {evento.cover_image && (
            <img src={evento.cover_image} style={{ width: '100%', height: 140, objectFit: 'cover' as const }} />
          )}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {evento.menter?.avatar_url ? (
                <img src={evento.menter.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' as const }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>
                  {evento.menter?.nombre?.[0] || 'M'}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#421869' }}>{evento.menter?.nombre || 'Menter'}</span>
            </div>
            <h3 style={{ fontFamily: 'Raleway', color: '#333', fontSize: 15, margin: '0 0 8px', lineHeight: 1.4 }}>{evento.title}</h3>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 10px' }}>
              {new Date(evento.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} · {evento.start_time?.slice(0,5)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: evento.modality === 'virtual' ? '#1565c0' : '#2e7d32', fontWeight: 600 }}>
                {evento.modality === 'virtual' ? 'Virtual' : evento.modality === 'presencial' ? 'Presencial' : 'Híbrido'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#421869' }}>
                {evento.event_tickets?.length > 0
                  ? (Math.min(...evento.event_tickets.map((t: any) => t.price)) === 0 ? 'Gratis' : `$${Math.min(...evento.event_tickets.map((t: any) => t.price))} USD`)
                  : 'Ver detalles'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

const saveEvento = async (status: string) => {
  const payload = {
    ...eventoForm,
    status,
    max_participants: eventoForm.max_participants ? parseInt(eventoForm.max_participants) : null,
    organizers: eventoForm.organizers.split(',').map((o: string) => o.trim()).filter(Boolean),
    sponsors: eventoForm.sponsors.split(',').map((s: string) => s.trim()).filter(Boolean),
    menter_id: user?.id
  }

  let savedEventoId: string | null = eventoEditId

  if (eventoEditId) {
    await supabase.from('events')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', eventoEditId)
  } else {
    const { data } = await supabase.from('events').insert(payload).select().single()
    savedEventoId = data?.id || null
  }

  if (savedEventoId && eventoTickets.length > 0) {
    await supabase.from('event_tickets').delete().eq('event_id', savedEventoId)
    const ticketsToInsert = eventoTickets.map(t => ({
      name: t.name,
      type: t.type,
      price: t.price,
      quantity: t.quantity || null,
      preventa_ends_at: t.preventa_ends_at || null,
      combo_min_people: t.combo_min_people || null,
      discount_pct: t.discount_pct || null,
      discount_codes: t.discount_codes?.length ? t.discount_codes : null,
      sold: 0,
      is_active: true,
      event_id: savedEventoId
    }))
    const { error } = await supabase.from('event_tickets').insert(ticketsToInsert)
    if (error) console.log('Error tickets:', error)
  }

  if (status === 'publicado' && !eventoEditId) {
    await supabase.from('community_posts').insert({
      user_id: user?.id,
      tipo: 'texto',
      contenido: `Nuevo evento: ${eventoForm.title}${eventoForm.description ? '\n\n' + eventoForm.description.slice(0, 200) : ''}`,
      media_url: eventoForm.cover_image || null,
    })
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'comunidad_post_creado', { tipo: 'evento', titulo: eventoForm.title })
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch('/api/push/notify-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          title: 'Nuevo evento en Giro Lab',
          body: eventoForm.title,
          url: '/dashboard?tab=eventos',
        }),
      }).catch(() => {})
    })
  }

  setEventoView('lista')
  setEventoEditId(null)
  setEventoForm({ title: '', description: '', cover_image: '', date: '', start_time: '', end_time: '', modality: 'virtual', location_address: '', meeting_link: '', max_participants: '', presenter: '', organizers: '', sponsors: '', status: 'borrador', certificate_text: '', certificate_firma: '' })
  setEventoTickets([])
  const { data } = await supabase
    .from('events')
    .select('*, event_tickets(*), event_registrations(count)')
    .eq('menter_id', user?.id)
    .order('date', { ascending: true })
  setEventos(data || [])
}

const agregarTicket = () => {
  if (!eventoTicketForm.name || !eventoTicketForm.price) return
  setEventoTickets(prev => [...prev, {
    ...eventoTicketForm,
    price: parseFloat(eventoTicketForm.price),
    quantity: eventoTicketForm.quantity ? parseInt(eventoTicketForm.quantity) : null,
    combo_min_people: eventoTicketForm.combo_min_people ? parseInt(eventoTicketForm.combo_min_people) : null,
    discount_pct: eventoTicketForm.discount_pct ? parseFloat(eventoTicketForm.discount_pct) : null,
    discount_codes: eventoTicketForm.discount_codes.split(',').map((c: string) => c.trim()).filter(Boolean),
    sold: 0
  }])
  setEventoTicketForm({ name: '', type: 'general', price: '', quantity: '', preventa_ends_at: '', combo_min_people: '', discount_pct: '', discount_codes: '' })
}

const renderInscritosModal = () => {
  if (!inscritosModal) return null

  const descargarCSV = () => {
    const headers = ['Nombre', 'Email', 'Tipo de entrada', 'Cantidad', 'Estado de pago', 'Fecha']
    const rows = inscritosList.map(r => [
      r.user?.nombre || '—',   // nombre ✅
      r.user?.email || '—',    // email ✅
      r.ticket?.name || '',
      r.quantity || 1,
      r.payment_status || '',
      new Date(r.created_at).toLocaleDateString('es-MX')
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inscritos_${inscritosModal.title.replace(/ /g,'_')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={() => { setInscritosModal(null); setInscritosList([]); setCertifiedMap({}) }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <div>
            <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0, fontSize: 18 }}>
              Inscritos
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>{inscritosModal.title}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {inscritosList.length > 0 && (
              <button
                disabled={certIssuing === 'all'}
                onClick={async () => {
                  setCertIssuing('all')
                  const pendientes = inscritosList.filter(r => !certifiedMap[r.user_id])
                  if (pendientes.length === 0) { setCertIssuing(null); return }
                  const rows = pendientes.map(r => ({
                    event_id: inscritosModal.id,
                    user_id: r.user_id,
                    menter_id: user?.id
                  }))
                  await supabase.from('event_certificates').upsert(rows, { onConflict: 'event_id,user_id' })
                  const newMap = { ...certifiedMap }
                  pendientes.forEach(r => { newMap[r.user_id] = true })
                  setCertifiedMap(newMap)
                  setCertIssuing(null)
                }}
                style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: certIssuing === 'all' ? '#ccc' : '#6d28d9', color: 'white', fontWeight: 700, fontSize: 13, cursor: certIssuing === 'all' ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                {certIssuing === 'all' ? 'Emitiendo...' : 'Emitir a todos'}
              </button>
            )}
            <button onClick={descargarCSV}
              style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Descargar CSV
            </button>
            <button onClick={() => { setInscritosModal(null); setInscritosList([]); setCertifiedMap({}) }}
              style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666' }}aria-label="Cerrar">✕</button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {inscritosLoading ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>Cargando inscritos...</p>
          ) : inscritosList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}></div>
              <p>Aún no hay inscritos en este evento.</p>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#f3e8ff', borderRadius: 12, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#421869' }}>{inscritosList.length}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total inscritos</p>
                </div>
                <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1b5e20' }}>
                    {inscritosList.filter(r => r.payment_status === 'pagado' || r.payment_status === 'gratis').length}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Confirmados</p>
                </div>
                <div style={{ background: '#fff8e1', borderRadius: 12, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e65100' }}>
                    {inscritosList.filter(r => r.payment_status === 'pendiente').length}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Pago pendiente</p>
                </div>
              </div>

              {/* Tabla */}
              <div style={{ border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden' }}>
                {/* Header tabla */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.2fr', gap: 0, background: '#f8f9fa', padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#666' }}>
                  <span>Nombre</span>
                  <span>Email</span>
                  <span>Entrada</span>
                  <span>Cant.</span>
                  <span>Pago</span>
                  <span>Certificado</span>
                </div>
                {/* Filas */}
                {inscritosList.map((r, i) => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.2fr', gap: 0, padding: '12px 16px', fontSize: 13, color: '#333', borderTop: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{r.user?.nombre || '—'}</span>
                    <span style={{ color: '#666', fontSize: 12 }}>{r.user?.email || '—'}</span>
                    <span style={{ fontSize: 12 }}>{r.ticket?.name || '—'}</span>
                    <span style={{ textAlign: 'center' }}>{r.quantity || 1}</span>
                    <span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                        background: r.payment_status === 'pagado' ? '#e8f5e9' : r.payment_status === 'gratis' ? '#e3f2fd' : '#fff8e1',
                        color: r.payment_status === 'pagado' ? '#1b5e20' : r.payment_status === 'gratis' ? '#1565c0' : '#e65100'
                      }}>
                        {r.payment_status === 'pagado' ? 'Pagado' : r.payment_status === 'gratis' ? 'Gratis' : 'Pendiente'}
                      </span>
                    </span>
                    <span>
                      {certifiedMap[r.user_id] ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#e8f5e9', color: '#1b5e20' }}>Emitido</span>
                      ) : (
                        <button
                          disabled={certIssuing === r.user_id}
                          onClick={async () => {
                            setCertIssuing(r.user_id)
                            await supabase.from('event_certificates').upsert({
                              event_id: inscritosModal.id,
                              user_id: r.user_id,
                              menter_id: user?.id
                            }, { onConflict: 'event_id,user_id' })
                            setCertifiedMap(prev => ({ ...prev, [r.user_id]: true }))
                            setCertIssuing(null)
                          }}
                          style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: 'none', background: certIssuing === r.user_id ? '#ccc' : '#f3e8ff', color: '#6d28d9', cursor: certIssuing === r.user_id ? 'default' : 'pointer' }}>
                          {certIssuing === r.user_id ? '...' : 'Emitir'}
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const renderEventosMenterWrapper = () => (
  <div>
    {!canPremium && (
      <div style={{ marginBottom: 24, padding: '16px 20px', background: '#fff8e1', border: '2px solid #ffa719', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#7c4a00', fontWeight: 600 }}>
          Publicar eventos está disponible a partir del plan <strong>Premium</strong>.
        </p>
        <button onClick={() => switchTab('membresia')} style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway', whiteSpace: 'nowrap' }}>
          Ver planes →
        </button>
      </div>
    )}
    {canPremium ? renderEventosMenter() : renderEventosPersona()}
  </div>
)

const renderEventosMenter = () => {
  if (eventoView === 'editor') return (
    <div style={{ padding: '24px 0' }}>
      <button onClick={() => { setEventoView('lista'); setEventoEditId(null) }}
        style={{ background: 'none', border: 'none', color: '#421869', fontWeight: 600, cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        ← Volver a mis eventos
      </button>
      <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>
        {eventoEditId ? 'Editar evento' : 'Nuevo evento'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>Imagen de portada (máx. 2MB · dimensiones sugeridas: 1200 × 628 px)</label>
          {eventoForm.cover_image && (
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <img src={eventoForm.cover_image} style={{ width: '100%', maxHeight: 180, objectFit: 'cover' as const, borderRadius: 12 }} />
              <button type="button" onClick={() => setEventoForm(prev => ({ ...prev, cover_image: '' }))}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'white', cursor: 'pointer', fontWeight: 700 }}aria-label="Cerrar">✕</button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 2 * 1024 * 1024) { alert('Máx. 2MB'); return }
            const reader = new FileReader()
            reader.onload = () => setEventoForm(prev => ({ ...prev, cover_image: reader.result as string }))
            reader.readAsDataURL(file)
          }} style={{ padding: '10px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer' }} />
        </div>

        <input placeholder="Título del evento *" value={eventoForm.title}
          onChange={e => setEventoForm(prev => ({ ...prev, title: e.target.value }))}
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 15, fontFamily: 'inherit' }} />

        <div>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>Descripción del evento *</label>
          <RichTextEditor
            content={eventoForm.description}
            onChange={html => setEventoForm(prev => ({ ...prev, description: html }))}
          />
        </div>

        <input placeholder="Expositor / Presenter" value={eventoForm.presenter}
          onChange={e => setEventoForm(prev => ({ ...prev, presenter: e.target.value }))}
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }} />

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Fecha *</label>
            <input type="date" value={eventoForm.date}
              onChange={e => setEventoForm(prev => ({ ...prev, date: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' as const }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Hora inicio *</label>
            <input type="time" value={eventoForm.start_time}
              onChange={e => setEventoForm(prev => ({ ...prev, start_time: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' as const }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Hora fin</label>
            <input type="time" value={eventoForm.end_time}
              onChange={e => setEventoForm(prev => ({ ...prev, end_time: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' as const }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select value={eventoForm.modality}
            onChange={e => setEventoForm(prev => ({ ...prev, modality: e.target.value }))}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
            <option value="virtual">Virtual</option>
            <option value="presencial">Presencial</option>
            <option value="ambas">Híbrido</option>
          </select>
          <input placeholder="Máx. participantes (opcional)" value={eventoForm.max_participants}
            onChange={e => setEventoForm(prev => ({ ...prev, max_participants: e.target.value }))}
            type="number" style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
        </div>

        {(eventoForm.modality === 'virtual' || eventoForm.modality === 'ambas') && (
          <input placeholder="Link de acceso (Zoom, Meet, etc.)" value={eventoForm.meeting_link}
            onChange={e => setEventoForm(prev => ({ ...prev, meeting_link: e.target.value }))}
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }} />
        )}

        {(eventoForm.modality === 'presencial' || eventoForm.modality === 'ambas') && (
          <input placeholder="Dirección del lugar" value={eventoForm.location_address}
            onChange={e => setEventoForm(prev => ({ ...prev, location_address: e.target.value }))}
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }} />
        )}

        <input placeholder="Organizadores (separados por coma)" value={eventoForm.organizers}
          onChange={e => setEventoForm(prev => ({ ...prev, organizers: e.target.value }))}
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }} />

        <input placeholder="Auspiciadores (separados por coma)" value={eventoForm.sponsors}
          onChange={e => setEventoForm(prev => ({ ...prev, sponsors: e.target.value }))}
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }} />

        {/* Certificado de participación */}
        <div style={{ background: '#f3e8ff', borderRadius: 16, padding: '20px', border: '1px solid #e9d5ff' }}>
          <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 6px', fontSize: 16 }}>Certificado de participación</h3>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b21a8' }}>
            Opcional. Giro Lab generará el certificado con nuestra plantilla. Puedes personalizar el texto y subir una firma.
          </p>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Texto del certificado (opcional)</label>
          <textarea
            placeholder={`Por haber participado en "${eventoForm.title || 'el evento'}"`}
            value={eventoForm.certificate_text}
            onChange={e => setEventoForm(prev => ({ ...prev, certificate_text: e.target.value }))}
            rows={3}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #c4b5fd', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const, resize: 'vertical', marginBottom: 12 }}
          />
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Firma del expositor (opcional, PNG transparente recomendado)</label>
          {eventoForm.certificate_firma && (
            <div style={{ position: 'relative', marginBottom: 10, display: 'inline-block' }}>
              <img src={eventoForm.certificate_firma} style={{ maxHeight: 80, borderRadius: 8, border: '1px solid #ddd', background: '#f9f0ff' }} alt="Firma" />
              <button type="button" onClick={() => setEventoForm(prev => ({ ...prev, certificate_firma: '' }))}
                style={{ position: 'absolute', top: -8, right: -8, background: '#c62828', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 13, lineHeight: '22px', textAlign: 'center' }}aria-label="Cerrar">✕</button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 2 * 1024 * 1024) { alert('Máx. 2MB'); return }
            const reader = new FileReader()
            reader.onload = () => setEventoForm(prev => ({ ...prev, certificate_firma: reader.result as string }))
            reader.readAsDataURL(file)
          }} style={{ padding: '10px', borderRadius: 12, border: '1px dashed #a855f7', fontSize: 13, width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer', background: 'white' }} />
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 16, padding: '20px' }}>
          <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 16 }}>Tipos de entrada</h3>

          {eventoTickets.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 10, padding: '10px 14px', marginBottom: 8, border: '1px solid #eee' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#421869' }}>{t.name}</span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>{t.type} · ${t.price} USD</span>
                {t.quantity && <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{t.quantity} disponibles</span>}
              </div>
              <button onClick={() => setEventoTickets(prev => prev.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: 16 }}></button>
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input placeholder="Nombre (ej: General, VIP)" value={eventoTicketForm.name}
                onChange={e => setEventoTicketForm(prev => ({ ...prev, name: e.target.value }))}
                style={{ flex: 2, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
              <select value={eventoTicketForm.type}
                onChange={e => setEventoTicketForm(prev => ({ ...prev, type: e.target.value }))}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, background: 'white' }}>
                <option value="preventa">Preventa</option>
                <option value="general">General</option>
                <option value="combo">Combo</option>
                <option value="vip">VIP</option>
                <option value="supervip">Super VIP</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input placeholder="Precio en USD (0 = gratis)" value={eventoTicketForm.price} type="number"
                onChange={e => setEventoTicketForm(prev => ({ ...prev, price: e.target.value }))}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
              <input placeholder="Cantidad disponible" value={eventoTicketForm.quantity} type="number"
                onChange={e => setEventoTicketForm(prev => ({ ...prev, quantity: e.target.value }))}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
            </div>
            {eventoTicketForm.type === 'preventa' && (
              <input type="datetime-local" placeholder="Preventa válida hasta"
                value={eventoTicketForm.preventa_ends_at}
                onChange={e => setEventoTicketForm(prev => ({ ...prev, preventa_ends_at: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
            )}
            {eventoTicketForm.type === 'combo' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Mín. personas para combo" value={eventoTicketForm.combo_min_people} type="number"
                  onChange={e => setEventoTicketForm(prev => ({ ...prev, combo_min_people: e.target.value }))}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
                <input placeholder="% descuento" value={eventoTicketForm.discount_pct} type="number"
                  onChange={e => setEventoTicketForm(prev => ({ ...prev, discount_pct: e.target.value }))}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
              </div>
            )}
            <input placeholder="Códigos de descuento (separados por coma)" value={eventoTicketForm.discount_codes}
              onChange={e => setEventoTicketForm(prev => ({ ...prev, discount_codes: e.target.value }))}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13 }} />
            <button onClick={agregarTicket}
              style={{ padding: '10px', borderRadius: 10, border: '2px dashed #421869', background: 'transparent', color: '#421869', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              + Agregar tipo de entrada
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={() => saveEvento('borrador')}
            style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Guardar borrador
          </button>
          <button onClick={() => saveEvento('publicado')}
            style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Publicar evento
          </button>
        </div>
      </div>
    </div>
  )

  // ── VISTA LISTA ──────────────────────────────────
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>Mis Eventos</h2>
        <button onClick={() => setEventoView('editor')}
          style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
          + Nuevo evento
        </button>
      </div>

      {eventosLoading ? (
        <p style={{ color: '#999' }}>Cargando...</p>
      ) : eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p>Aún no tienes eventos. ¡Crea tu primer evento!</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {eventos.slice(0, eventosLimit).map(evento => (
              <div key={evento.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                {evento.cover_image && (
                  <img src={evento.cover_image} style={{ width: '100%', height: 140, objectFit: 'cover' as const }} />
                )}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 6px', fontSize: 16 }}>{evento.title}</h3>
                      <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>
                        {new Date(evento.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} · {evento.start_time?.slice(0,5)}
                        {evento.modality === 'virtual' ? ' · Virtual' : evento.modality === 'presencial' ? ' · Presencial' : ' · Híbrido'}
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: evento.status === 'publicado' ? '#e8f5e9' : '#fff8e1',
                          color: evento.status === 'publicado' ? '#1b5e20' : '#e65100' }}>
                          {evento.status === 'publicado' ? 'Publicado' : 'Borrador'}
                        </span>
                        <span style={{ fontSize: 12, color: '#666' }}>
                          {evento.event_registrations?.[0]?.count || 0} inscritos
                          {evento.max_participants && ` / ${evento.max_participants}`}
                        </span>
                        {evento.event_tickets?.length > 0 && (
                          <span style={{ fontSize: 12, color: '#421869', fontWeight: 600 }}>
                            Desde ${Math.min(...evento.event_tickets.map((t: any) => t.price))} USD
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={async () => {
                        setInscritosModal(evento)
                        setInscritosLoading(true)
                        const { data: regs } = await supabase
                          .from('event_registrations')
                          .select('*, ticket:ticket_id(name, type)')
                          .eq('event_id', evento.id)
                          .order('created_at', { ascending: true })
                        if (regs && regs.length > 0) {
                          const userIds = regs.map(r => r.user_id)
                          const [{ data: users }, { data: certs }] = await Promise.all([
                            supabase.from('user_public_data').select('id, nombre, email').in('id', userIds),
                            supabase.from('event_certificates').select('user_id').eq('event_id', evento.id)
                          ])
                          const certMap: Record<string, boolean> = {}
                          certs?.forEach(c => { certMap[c.user_id] = true })
                          setCertifiedMap(certMap)
                          setInscritosList(regs.map(r => ({
                            ...r,
                            user: users?.find(u => u.id === r.user_id) || null
                          })))
                        } else {
                          setCertifiedMap({})
                          setInscritosList([])
                        }
                        setInscritosLoading(false)
                      }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #e3f2fd', background: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        Ver inscritos
                      </button>

                      <button onClick={() => {
                        setEventoEditId(evento.id)
                        setEventoForm({
                          title: evento.title, description: evento.description || '',
                          cover_image: evento.cover_image || '', date: evento.date,
                          start_time: evento.start_time || '', end_time: evento.end_time || '',
                          modality: evento.modality, location_address: evento.location_address || '',
                          meeting_link: evento.meeting_link || '', max_participants: evento.max_participants?.toString() || '',
                          presenter: evento.presenter || '',
                          organizers: (evento.organizers || []).join(', '),
                          sponsors: (evento.sponsors || []).join(', '), status: evento.status,
                          certificate_text: evento.certificate_text || '', certificate_firma: evento.certificate_firma || ''
                        })
                        setEventoTickets(evento.event_tickets || [])
                        setEventoView('editor')
                      }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#421869', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        Editar
                      </button>

                      <button onClick={() => {
                        setEventoEditId(null)
                        setEventoForm({
                          title: `${evento.title} (copia)`,
                          description: evento.description || '',
                          cover_image: evento.cover_image || '',
                          date: '',
                          start_time: evento.start_time || '',
                          end_time: evento.end_time || '',
                          modality: evento.modality,
                          location_address: evento.location_address || '',
                          meeting_link: evento.meeting_link || '',
                          max_participants: evento.max_participants?.toString() || '',
                          presenter: evento.presenter || '',
                          organizers: (evento.organizers || []).join(', '),
                          sponsors: (evento.sponsors || []).join(', '),
                          status: 'borrador',
                          certificate_text: evento.certificate_text || '', certificate_firma: evento.certificate_firma || ''
                        })
                        setEventoTickets(evento.event_tickets?.map((t: any) => ({
                          name: t.name, type: t.type, price: t.price,
                          quantity: t.quantity || null, preventa_ends_at: null,
                          combo_min_people: t.combo_min_people || null,
                          discount_pct: t.discount_pct || null,
                          discount_codes: t.discount_codes || null,
                          sold: 0, is_active: true
                        })) || [])
                        setEventoView('editor')
                      }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #e8f5e9', background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        Duplicar
                      </button>

                      <button onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/eventos/${evento.id}`)
                          .then(() => { setToastMsg('Link del evento copiado'); setTimeout(() => setToastMsg(null), 3000) })
                      }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #f3e8ff', background: '#f3e8ff', color: '#6d28d9', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        Compartir
                      </button>

                      <button onClick={async () => {
                        if (!confirm('¿Eliminar este evento? Se notificará por email a todos los inscritos.')) return
                        // Notificar a inscritos antes de eliminar
                        const { data: regs } = await supabase
                          .from('event_registrations')
                          .select('user_id, payment_status')
                          .eq('event_id', evento.id)
                        if (regs && regs.length > 0) {
                          const userIds = regs.map((r: any) => r.user_id)
                          const { data: usersData } = await supabase
                            .from('user_public_data')
                            .select('id, nombre, email')
                            .in('id', userIds)
                          const eventoFecha = new Date(evento.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                          for (const u of (usersData || [])) {
                            const reg = regs.find((r: any) => r.user_id === u.id)
                            dispararEmail('evento_cancelado', {
                              clientName:   u.nombre || u.email.split('@')[0],
                              clientEmail:  u.email,
                              eventoTitulo: evento.title,
                              eventoFecha,
                              tuvioPago:    reg?.payment_status === 'pagado',
                            })
                          }
                        }
                        await supabase.from('events').delete().eq('id', evento.id)
                        setEventos(prev => prev.filter(e => e.id !== evento.id))
                      }} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>

                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ver más — FUERA del map */}
          {eventos.length > eventosLimit && (
            <button onClick={() => setEventosLimit(prev => prev + 6)}
              style={{ width: '100%', padding: '12px', marginTop: 16, borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
              Ver más ({eventos.length - eventosLimit} restantes)
            </button>
          )}
        </>
      )}

      {/* Sección comunidad */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '2px solid #f0f0f0' }}>
        <h3 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 20 }}>Eventos de la comunidad</h3>
        {renderGrillaEventosPublicos(
          eventosPublicos
            .filter(e => e.menter_id !== user?.id)
            .slice(0, eventosComunidadLimit)
        )}
        {eventosPublicos.filter(e => e.menter_id !== user?.id).length > eventosComunidadLimit && (
          <button onClick={() => setEventosComunidadLimit(prev => prev + 6)}
            style={{ width: '100%', padding: '12px', marginTop: 16, borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Ver más ({eventosPublicos.filter(e => e.menter_id !== user?.id).length - eventosComunidadLimit} restantes)
          </button>
        )}
      </div>
    </div>
  )
}

const renderEventosPersona = () => (
  <div style={{ padding: '24px 0' }}>
    <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 20px' }}>Eventos de Bienestar</h2>
    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      {(['proximo', 'popular', 'destacado'] as const).map(orden => (
        <button key={orden} onClick={() => setEventoFiltroOrden(orden)} style={{
          padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: eventoFiltroOrden === orden ? '#421869' : '#f0f0f0',
          color: eventoFiltroOrden === orden ? 'white' : '#333', fontWeight: 600, fontSize: 13
        }}>
          {orden === 'proximo' ? 'Próximos' : orden === 'popular' ? 'Popular' : 'Destacados'}
        </button>
      ))}
    </div>
    {renderGrillaEventosPublicos(
      [...eventosPublicos].sort((a, b) => {
        if (eventoFiltroOrden === 'popular') return (b.event_registrations?.[0]?.count || 0) - (a.event_registrations?.[0]?.count || 0)
        if (eventoFiltroOrden === 'destacado') {
          const planOrder: Record<string, number> = { master: 0, premium: 1, starter: 2, free: 3 }
          return (planOrder[a.menter?.plan] ?? 3) - (planOrder[b.menter?.plan] ?? 3)
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }).slice(0, eventosComunidadLimit)
    )}
    {eventosPublicos.length > eventosComunidadLimit && (
      <button onClick={() => setEventosComunidadLimit(prev => prev + 6)}
        style={{ width: '100%', padding: '12px', marginTop: 16, borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
        Ver más ({eventosPublicos.length - eventosComunidadLimit} restantes)
      </button>
    )}
  </div>
)

const renderEventoModal = () => {
  if (!eventoModal) return null

  const closeModal = () => {
    setEventoModal(null)
    setEventoInscritoConfirmado(false)
    setTicketSeleccionado(null)
    setCantidadTickets(1)
  }

  const handleInscribirse = async () => {
    if (!user?.id) return
    setInscribiendose(true)
    const { data: reg, error } = await supabase.from('event_registrations').insert({
      event_id: eventoModal.id,
      user_id: user.id,
      quantity: 1,
      total_price: 0,
      payment_status: 'pendiente'
    }).select('id').single()
    setInscribiendose(false)
    if (error || !reg) return

    const fechaFormato = new Date(eventoModal.date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'confirmacion_evento',
        data: {
          clientName:     meta?.nombre || user.email || 'Usuario',
          clientEmail:    user.email,
          eventoTitulo:   eventoModal.title,
          eventoFecha:    fechaFormato,
          eventoHora:     eventoModal.start_time || '',
          eventoLugar:    eventoModal.location_address || eventoModal.meeting_link || 'Por confirmar',
          modalidad:      eventoModal.modality || 'presencial',
          tipoEntrada:    'General',
          cantidad:       1,
          precioTotal:    0,
          registrationId: reg.id,
          eventoId:       eventoModal.id,
        }
      })
    }).catch(() => {})

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'evento_inscripcion', { evento_id: eventoModal.id, evento_titulo: eventoModal.title })
    }
    setEventoInscritoConfirmado(true)
  }

  const addToGoogleCalendar = () => {
    const start = `${eventoModal.date.replace(/-/g,'')}T${(eventoModal.start_time || '0000').replace(':','')}00`
    const end = eventoModal.end_time
      ? `${eventoModal.date.replace(/-/g,'')}T${eventoModal.end_time.replace(':','')}00`
      : start
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventoModal.title)}&dates=${start}/${end}&details=${encodeURIComponent(eventoModal.description || '')}&location=${encodeURIComponent(eventoModal.location_address || eventoModal.meeting_link || '')}`
    window.open(url, '_blank')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={closeModal}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {eventoModal.menter?.avatar_url ? (
              <img src={eventoModal.menter.avatar_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' as const }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {eventoModal.menter?.nombre?.[0] || 'M'}
              </div>
            )}
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#421869' }}>{eventoModal.menter?.nombre || 'Menter'}</p>
          </div>
          <button onClick={closeModal}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666' }}aria-label="Cerrar">✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {eventoModal.cover_image && (
            <img src={eventoModal.cover_image} style={{ width: '100%', height: 240, objectFit: 'cover' as const, borderRadius: 16, marginBottom: 20 }} />
          )}

          <h1 style={{ fontFamily: 'Raleway', fontWeight: 'bolder', textTransform: 'uppercase', color: '#421869', fontSize: 24, margin: '0 0 12px' }}>{eventoModal.title}</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, background: '#f8f9fa', borderRadius: 16, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
              <span></span>
              <span>
                {new Date(eventoModal.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {eventoModal.start_time && ` · ${eventoModal.start_time.slice(0,5)}`}
                {eventoModal.end_time && ` — ${eventoModal.end_time.slice(0,5)}`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
              <span></span>
              <span>
                {eventoModal.modality === 'virtual' ? 'Virtual'
                  : eventoModal.modality === 'presencial' ? `Presencial${eventoModal.location_address ? ` · ${eventoModal.location_address}` : ''}`
                  : `Híbrido${eventoModal.location_address ? ` · ${eventoModal.location_address}` : ''}`}
              </span>
            </div>
            {eventoModal.presenter && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
                <span></span><span>{eventoModal.presenter}</span>
              </div>
            )}
            {eventoModal.max_participants && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ background: '#421869', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                  {eventoModal.event_registrations?.[0]?.count || 0} / {eventoModal.max_participants} inscritos
                </span>
              </div>
            )}
          </div>

          {eventoInscritoConfirmado ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>¡Inscripción confirmada!</h3>
              <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
                Tu lugar en <strong>{eventoModal.title}</strong> está reservado. Revisa tu correo para los detalles.
              </p>
              <div style={{ background: '#fff8e1', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left', border: '1.5px solid #ffa719' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#e65100', margin: '0 0 6px' }}>Coordina el pago con el organizador</p>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
                  Escríbele a <strong>{eventoModal.menter?.nombre || 'el organizador'}</strong> para confirmar tu asistencia y acordar el método de pago.
                </p>
              </div>
              {eventoModal.menter?.enlaces?.whatsapp ? (
                <a href={eventoModal.menter.enlaces.whatsapp} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px', borderRadius: 30, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 12, boxSizing: 'border-box' as const }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.107.549 4.09 1.51 5.814L0 24l6.335-1.488A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.017-1.373l-.36-.214-3.733.977.999-3.645-.234-.374A9.817 9.817 0 012.182 12c0-5.415 4.403-9.818 9.818-9.818 5.416 0 9.819 4.403 9.819 9.818 0 5.416-4.403 9.818-9.819 9.818z"/></svg>
                  Escribir por WhatsApp
                </a>
              ) : (
                <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#666' }}>
                  Contacta directamente a <strong>{eventoModal.menter?.nombre || 'el organizador'}</strong> para coordinar el pago.
                </div>
              )}
              <button onClick={closeModal}
                style={{ width: '100%', padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxSizing: 'border-box' as const }}>
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {eventoModal.description && (
                <div style={{ fontSize: 15, color: '#444', lineHeight: 1.7, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: eventoModal.description }} />
              )}

              {eventoModal.organizers?.length > 0 && (
                <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Organiza: {eventoModal.organizers.join(', ')}</p>
              )}
              {eventoModal.sponsors?.length > 0 && (
                <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Auspicia: {eventoModal.sponsors.join(', ')}</p>
              )}

              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <button onClick={addToGoogleCalendar}
                  style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Google Calendar
                </button>
                <button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/eventos/${eventoModal.id}`)
                    .then(() => { setToastMsg('Link del evento copiado'); setTimeout(() => setToastMsg(null), 3000) })
                }} style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Compartir
                </button>
              </div>

              <div style={{ fontSize: 12, color: '#666', marginBottom: 12, padding: '8px 12px', background: '#e8f5e9', borderRadius: 8 }}>
                Inscripción a nombre de: <strong>{(user as any)?.user_metadata?.nombre || meta?.nombre || user?.email}</strong>
              </div>
              <button onClick={handleInscribirse} disabled={inscribiendose}
                style={{ width: '100%', padding: '14px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 800, fontSize: 15, cursor: inscribiendose ? 'not-allowed' : 'pointer', fontFamily: 'Raleway', opacity: inscribiendose ? 0.7 : 1 }}>
                {inscribiendose ? 'Registrando...' : 'Confirmar inscripción'}
              </button>
              <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 }}>
                Coordinarás el pago directamente con el organizador
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


const renderBlogPersona = () => {
  const allTags = [...new Set(blogPostsPublicos.flatMap(p => p.tags || []))]

  const postsFiltrados = blogPostsPublicos
    .filter(p => !blogFiltroTag || p.tags?.includes(blogFiltroTag))
    .sort((a, b) => {
      if (blogFiltroOrden === 'popular') return (b.blog_likes?.[0]?.count || 0) - (a.blog_likes?.[0]?.count || 0)
      if (blogFiltroOrden === 'destacado') {
        const planOrder: Record<string, number> = { master: 0, premium: 1, starter: 2, free: 3 }
        return (planOrder[a.menter?.raw_user_meta_data?.plan] ?? 3) - (planOrder[b.menter?.raw_user_meta_data?.plan] ?? 3)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div style={{ padding: '24px 0' }}>
      <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 20px' }}>Blog de Bienestar</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {(['reciente', 'popular', 'destacado'] as const).map(orden => (
          <button key={orden} onClick={() => { setBlogFiltroOrden(orden); setBlogPersonaLimit(6) }} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: blogFiltroOrden === orden ? '#421869' : '#f0f0f0',
            color: blogFiltroOrden === orden ? 'white' : '#333', fontWeight: 600, fontSize: 13
          }}>
            {orden === 'reciente' ? 'Reciente' : orden === 'popular' ? 'Popular' : 'Destacados'}
          </button>
        ))}

        {allTags.length > 0 && (
          <>
            <div style={{ width: 1, background: '#ddd', margin: '0 4px' }} />
            <select
              value={blogFiltroTag || ''}
              onChange={e => { setBlogFiltroTag(e.target.value || null); setBlogPersonaLimit(6) }}
              style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #ddd', background: blogFiltroTag ? '#f3e8ff' : '#f0f0f0', color: blogFiltroTag ? '#6d28d9' : '#333', fontWeight: 600, fontSize: 13, cursor: 'pointer', outline: 'none' }}
            >
              <option value="">Todos los temas</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </>
        )}
      </div>

      {renderGrillaPostsPublicos(postsFiltrados.slice(0, blogPersonaLimit))}

{postsFiltrados.length > blogPersonaLimit && (
  <button onClick={() => setBlogPersonaLimit(prev => prev + 6)}
    style={{ width: '100%', padding: '12px', marginTop: 16, borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
    Ver más ({postsFiltrados.length - blogPersonaLimit} restantes)
  </button>
)}
    </div>
  )
}

  const renderPerfilPro = () => (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Modal de éxito / error */}
      {menterProfileMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setMenterProfileMsg(null)}>
          <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            {menterProfileMsg.type === 'success' ? (
              <>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: '#421869' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>¡Guardado!</h3>
                <p style={{ color: '#666', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>Tu perfil profesional y disponibilidad han sido actualizados.</p>
              </>
            ) : (
              <>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: '#c62828' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#c62828', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Error al guardar</h3>
                <p style={{ color: '#666', fontSize: 13, margin: '0 0 24px', lineHeight: 1.6 }}>{menterProfileMsg.text}</p>
              </>
            )}
            <button onClick={() => setMenterProfileMsg(null)} style={{ width: '100%', padding: '12px', borderRadius: 30, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
              Entendido
            </button>
          </div>
        </div>
      )}
      <SectionHeader emoji="" title="Casos que atiendes" subtitle="Selecciona los temas con los que trabajas — esto determina tu matching." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
        {CASOS_DISPONIBLES.map(caso => { const sel = menterProfile.casos_que_atiende.includes(caso); return <button key={caso} onClick={() => toggleCaso(caso)} style={{ padding: '10px 12px', borderRadius: 10, border: `2px solid ${sel ? '#995bd5' : '#e0e0e0'}`, background: sel ? '#995bd5' : 'white', color: sel ? 'white' : '#4d4d4d', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>{caso}</button> })}
        <button onClick={() => setShowOtrosCasos(true)} style={{ padding: '10px 12px', borderRadius: 10, border: '2px dashed #995bd5', background: 'transparent', color: '#995bd5', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Otros</button>
      </div>
      {menterProfile.casos_otros && <div style={{ padding: '10px 14px', background: '#f3e8ff', borderRadius: 10, fontSize: 13, color: '#421869', marginBottom: 24 }}><strong>Otros:</strong> {menterProfile.casos_otros}</div>}

      <SectionHeader emoji="" title="Presentación / Bio" />
      <textarea value={menterProfile.bio} onChange={e => setMenterProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Cuéntale a tus futuros clientes quién eres, tu enfoque y cómo los puedes ayudar..." rows={4} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box', resize: 'vertical', outline: 'none', marginBottom: 24 }} />

      <SectionHeader emoji="" title="Configuración de sesiones" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div><label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Precio por sesión (USD)</label><input type="number" placeholder="ej: 50" value={menterProfile.precio_sesion} onChange={e => setMenterProfile(p => ({ ...p, precio_sesion: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }} /></div>
        <div><label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Duración de sesión</label><select value={menterProfile.duracion_sesion} onChange={e => setMenterProfile(p => ({ ...p, duracion_sesion: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }}><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min (1 hora)</option><option value="90">90 min</option><option value="120">120 min (2 horas)</option></select></div>
        <div><label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Anticipación mínima</label><select value={menterProfile.anticipacion_minima} onChange={e => setMenterProfile(p => ({ ...p, anticipacion_minima: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }}><option value="2">2 horas</option><option value="6">6 horas</option><option value="12">12 horas</option><option value="24">24 horas</option><option value="48">48 horas</option></select></div>
        <div><label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Modalidad</label><select value={menterProfile.modalidad} onChange={e => setMenterProfile(p => ({ ...p, modalidad: e.target.value as 'video'|'presencial'|'ambas' }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }}><option value="video">Solo Virtual</option><option value="presencial">Solo Presencial</option><option value="ambas">Presencial / Virtual</option></select></div>
      </div>
      {(menterProfile.modalidad === 'video' || menterProfile.modalidad === 'ambas') && <div style={{ marginBottom: 16 }}><FormField label="Link de videollamada" value={menterProfile.meet_link} onChange={v => setMenterProfile(p => ({ ...p, meet_link: v }))} /></div>}
      {(menterProfile.modalidad === 'presencial' || menterProfile.modalidad === 'ambas') && <div style={{ marginBottom: 16 }}><FormField label="Dirección (sesiones presenciales)" value={menterProfile.direccion} onChange={v => setMenterProfile(p => ({ ...p, direccion: v }))} /></div>}

      <div style={{ marginBottom: 24, padding: '16px 20px', background: '#f8f9fa', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Descuento a Menters */}
<div style={{ marginBottom: 24, padding: '16px 20px', background: '#f8f9fa', borderRadius: 12 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: menterProfile.descuento_menters ? 16 : 0 }}>
    <input
      type="checkbox"
      id="descuento"
      checked={menterProfile.descuento_menters}
      onChange={e => {
        setMenterProfile(p => ({
          ...p,
          descuento_menters: e.target.checked,
          descuento_porcentaje: e.target.checked ? p.descuento_porcentaje : undefined,
          descuento_codigo: e.target.checked ? p.descuento_codigo : '',
        }))
      }}
      style={{ width: 18, height: 18, accentColor: '#995bd5', cursor: 'pointer' }}
    />
    <label htmlFor="descuento" style={{ fontSize: 14, color: '#4d4d4d', cursor: 'pointer', fontWeight: 500 }}>
      Ofrezco descuento especial a otros Menters de Giro Lab
    </label>
  </div>

{menterProfile.descuento_menters && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
          % de descuento
        </label>
        <div style={{ position: 'relative', width: 140 }}>
          <input
            type="number"
            min={1}
            max={99}
            placeholder="ej: 20"
            value={menterProfile.descuento_porcentaje || ''}
            onChange={e => {
              const pct = parseInt(e.target.value) || 0
              const iniciales = `${meta?.nombre?.[0] || ''}${meta?.apellidos?.[0] || ''}`.toUpperCase()
              const codigo = pct > 0 ? `MENTER-${iniciales}-${pct}` : ''
              setMenterProfile(p => ({
                ...p,
                descuento_porcentaje: pct || undefined,
                descuento_codigo: codigo,
              }))
            }}
            style={{
              width: '100%', padding: '10px 36px 10px 14px',
              border: '2px solid #e0e0e0', borderRadius: 10,
              fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' as const,
            }}
          />
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, color: '#666', fontWeight: 700,
          }}>%</span>
        </div>
      </div>

      {menterProfile.descuento_codigo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderRadius: 10,
          background: '#EEEDFE', border: '2px solid #7F77DD',
          height: 44,
        }}>
          <span style={{ fontSize: 12, color: '#666' }}>Código:</span>
          <span style={{
            fontSize: 15, fontWeight: 800, color: '#3C3489',
            letterSpacing: '0.08em', fontFamily: 'monospace',
          }}>
            {menterProfile.descuento_codigo}
          </span>
        </div>
      )}
    </div>

    {menterProfile.descuento_codigo && (
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: '#E1F5EE', border: '0.5px solid #1D9E75',
        fontSize: 13, color: '#085041',
      }}>
        Visible solo para otros Menters · {menterProfile.descuento_porcentaje}% de descuento al ingresar este código al agendar.
      </div>
    )}
  </div>
)}
</div>
        <label htmlFor="descuento" style={{ fontSize: 14, color: '#4d4d4d', cursor: 'pointer', fontWeight: 500 }}></label>
      </div>

      <PlanGatesRow>
        <PlanGate plan={plan} required="starter" onUpgrade={() => switchTab('membresia')}>
          <SectionHeader emoji="" title="Idiomas" subtitle="¿En qué idiomas puedes atender?" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {IDIOMAS_DISPONIBLES.map(idioma => { const sel = menterProfile.idiomas.includes(idioma); return <button key={idioma} onClick={() => toggleIdioma(idioma)} style={{ padding: '8px 16px', borderRadius: 20, border: `2px solid ${sel ? '#1565c0' : '#e0e0e0'}`, background: sel ? '#1565c0' : 'white', color: sel ? 'white' : '#4d4d4d', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>{idioma}</button> })}
          </div>
          <SectionHeader emoji="" title="Formación académica" subtitle="Puedes agregar varios títulos." />
{menterProfile.formacion.map((f, i) => (
  <div key={i} style={{ marginBottom: 12, padding: 16, background: '#f8f9fa', borderRadius: 12, position: 'relative' }}>
    <button onClick={() => setMenterProfile(p => ({ ...p, formacion: p.formacion.filter((_,idx) => idx !== i) }))} style={{ position: 'absolute', top: 8, right: 8, background: '#ffebee', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#c62828', fontSize: 12, fontWeight: 600 }}aria-label="Cerrar">✕</button>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 40 }}>
      <FormField label="Título" value={f.titulo} onChange={v => setMenterProfile(p => { const arr = [...p.formacion]; arr[i] = { ...arr[i], titulo: v }; return { ...p, formacion: arr } })} />
      <FormField label="Casa de estudios" value={f.institucion} onChange={v => setMenterProfile(p => { const arr = [...p.formacion]; arr[i] = { ...arr[i], institucion: v }; return { ...p, formacion: arr } })} />
      <FormField label="Año inicio" value={f.anio_inicio} onChange={v => setMenterProfile(p => { const arr = [...p.formacion]; arr[i] = { ...arr[i], anio_inicio: v }; return { ...p, formacion: arr } })} />
      <FormField label="Año fin" value={f.anio_fin} onChange={v => setMenterProfile(p => { const arr = [...p.formacion]; arr[i] = { ...arr[i], anio_fin: v }; return { ...p, formacion: arr } })} />
    </div>
  </div>
))}
<button onClick={() => setMenterProfile(p => ({ ...p, formacion: [...p.formacion, { titulo: '', institucion: '', anio_inicio: '', anio_fin: '' }] }))} style={{ marginBottom: 24, padding: '10px 20px', borderRadius: 10, border: '2px dashed #1565c0', background: 'transparent', color: '#1565c0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Agregar formación</button>

<SectionHeader emoji="" title="Experiencia laboral" />
{menterProfile.experiencia_laboral.map((e, i) => (
  <div key={i} style={{ marginBottom: 12, padding: 16, background: '#f8f9fa', borderRadius: 12, position: 'relative' }}>
    <button onClick={() => setMenterProfile(p => ({ ...p, experiencia_laboral: p.experiencia_laboral.filter((_,idx) => idx !== i) }))} style={{ position: 'absolute', top: 8, right: 8, background: '#ffebee', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#c62828', fontSize: 12, fontWeight: 600 }}aria-label="Cerrar">✕</button>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 40 }}>
      <FormField label="Empresa" value={e.empresa} onChange={v => setMenterProfile(p => { const arr = [...p.experiencia_laboral]; arr[i] = { ...arr[i], empresa: v }; return { ...p, experiencia_laboral: arr } })} />
      <FormField label="Cargo" value={e.cargo} onChange={v => setMenterProfile(p => { const arr = [...p.experiencia_laboral]; arr[i] = { ...arr[i], cargo: v }; return { ...p, experiencia_laboral: arr } })} />
      <FormField label="Año inicio" value={e.anio_inicio} onChange={v => setMenterProfile(p => { const arr = [...p.experiencia_laboral]; arr[i] = { ...arr[i], anio_inicio: v }; return { ...p, experiencia_laboral: arr } })} />
      <FormField label="Año fin" value={e.anio_fin} onChange={v => setMenterProfile(p => { const arr = [...p.experiencia_laboral]; arr[i] = { ...arr[i], anio_fin: v }; return { ...p, experiencia_laboral: arr } })} />
    </div>
  </div>
))}
<button onClick={() => setMenterProfile(p => ({ ...p, experiencia_laboral: [...p.experiencia_laboral, { empresa: '', cargo: '', anio_inicio: '', anio_fin: '' }] }))} style={{ marginBottom: 24, padding: '10px 20px', borderRadius: 10, border: '2px dashed #1565c0', background: 'transparent', color: '#1565c0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Agregar experiencia</button>
        </PlanGate>
        <PlanGate plan={plan} required="premium" onUpgrade={() => switchTab('membresia')}>
          <SectionHeader emoji="" title="Número de colegiatura" subtitle="Opcional — para profesionales colegiados." />
          <div style={{ marginBottom: 24 }}><FormField label="Número de colegiatura" value={menterProfile.numero_colegiatura} onChange={v => setMenterProfile(p => ({ ...p, numero_colegiatura: v }))} /></div>
          <SectionHeader emoji="" title="Redes sociales y enlaces" subtitle="Agrega los que tengas." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            {(['linkedin','instagram','facebook','tiktok','x','youtube'] as const).map(red => (
              <FormField key={red} label={red.charAt(0).toUpperCase() + red.slice(1)} value={menterProfile.enlaces[red]} onChange={v => setMenterProfile(p => ({ ...p, enlaces: { ...p.enlaces, [red]: v } }))} />
            ))}
          </div>
        </PlanGate>
        {/* WhatsApp disponible para todos los planes — necesario para coordinar pagos */}
        <div style={{ marginTop: 8 }}>
          <SectionHeader emoji="" title="WhatsApp de contacto" subtitle="Los clientes usarán este enlace para coordinar el pago contigo." />
          <div style={{ maxWidth: 320, marginBottom: 24 }}>
            <FormField label="WhatsApp (ej: https://wa.me/51999999999)" value={menterProfile.enlaces.whatsapp} onChange={v => setMenterProfile(p => ({ ...p, enlaces: { ...p.enlaces, whatsapp: v } }))} />
          </div>
        </div>
      </PlanGatesRow>

      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 32, marginBottom: 32 }}>
        <SectionHeader emoji="" title="Disponibilidad semanal" subtitle="Activa los días que atiendes y define tus horarios." />

        {/* Aplicar mismo horario a todos los días activos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', background: '#f3e8ff', borderRadius: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#421869', whiteSpace: 'nowrap' }}>Aplicar a todos:</span>
          <input type="time" defaultValue="09:00" id="bulk-start" style={{ padding: '6px 10px', border: '2px solid #995bd5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans' }} />
          <span style={{ fontSize: 13, color: '#666' }}>a</span>
          <input type="time" defaultValue="18:00" id="bulk-end" style={{ padding: '6px 10px', border: '2px solid #995bd5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans' }} />
          <button onClick={() => {
            const start = (document.getElementById('bulk-start') as HTMLInputElement)?.value || '09:00'
            const end   = (document.getElementById('bulk-end')   as HTMLInputElement)?.value || '18:00'
            setAvailability(prev => prev.map(a => ({ ...a, is_active: true, start_time: start, end_time: end })))
          }} style={{ padding: '7px 18px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway' }}>
            Marcar todos
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DIAS_SEMANA.map((dia, i) => { const av = availability[i]; return (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: av.is_active ? '#f3e8ff' : '#f8f9fa', border: `2px solid ${av.is_active ? '#995bd5' : '#e0e0e0'}` }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: av.is_active ? 12 : 0 }}>
                <input type="checkbox" checked={av.is_active} onChange={e => setAvailability(prev => prev.map((a, idx) => idx === i ? { ...a, is_active: e.target.checked } : a))} style={{ width: 18, height: 18, accentColor: '#995bd5', cursor: 'pointer' }} />
                <span style={{ fontWeight: 700, color: av.is_active ? '#421869' : '#999', fontSize: 15 }}>{dia}</span>
              </label>
              {av.is_active && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const }}>De</span>
                    <input type="time" value={av.start_time} onChange={e => setAvailability(prev => prev.map((a, idx) => idx === i ? { ...a, start_time: e.target.value } : a))} style={{ padding: '8px 10px', border: '2px solid #995bd5', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans', width: '100%', boxSizing: 'border-box' as const }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase' as const }}>Hasta</span>
                    <input type="time" value={av.end_time} onChange={e => setAvailability(prev => prev.map((a, idx) => idx === i ? { ...a, end_time: e.target.value } : a))} style={{ padding: '8px 10px', border: '2px solid #995bd5', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans', width: '100%', boxSizing: 'border-box' as const }} />
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      </div>

      <div style={{ padding: '20px 24px', background: '#f3e8ff', borderRadius: 12, border: '2px solid #995bd5', marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={menterProfile.declaracion_jurada} onChange={e => setMenterProfile(p => ({ ...p, declaracion_jurada: e.target.checked }))} style={{ width: 20, height: 20, accentColor: '#995bd5', marginTop: 2, cursor: 'pointer', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: '#421869', lineHeight: 1.6 }}><strong>Declaración jurada de veracidad:</strong> Declaro que toda la información proporcionada en este perfil es verídica y auténtica. Entiendo que proporcionar información falsa puede resultar en la suspensión de mi cuenta en Giro Lab.</span>
        </label>
      </div>
      <button onClick={handleSaveMenterProfile} disabled={menterProfileSaving || !menterProfile.declaracion_jurada} style={{ background: (!menterProfile.declaracion_jurada || menterProfileSaving) ? 'rgba(255,167,25,0.4)' : '#ffa719', color: '#2d2926', border: 'none', padding: '14px 32px', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: (!menterProfile.declaracion_jurada || menterProfileSaving) ? 'not-allowed' : 'pointer', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase' }}>
        {menterProfileSaving ? 'Guardando...' : 'Guardar Perfil Profesional'}
      </button>

      {showOtrosCasos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 460, width: '100%' }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', marginBottom: 8 }}>Agrega otros casos</h3>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Escribe uno o varios separados por coma</p>
            <textarea value={menterProfile.casos_otros} onChange={e => setMenterProfile(p => ({ ...p, casos_otros: e.target.value }))} placeholder="Ej: Fobias, Trastorno Bipolar, Crisis existencial..." rows={4} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box', resize: 'none', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowOtrosCasos(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => setShowOtrosCasos(false)} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway' }}>Guardar →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

const renderDestacados = () => (
  <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

{/* CARRUSEL Master & Premium */}
{featuredMenters.length > 0 && (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ fontFamily: 'Raleway', color: '#421869', fontSize: 16, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      Menters Destacados
    </h3>
    <div ref={carruselRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, scrollSnapType: 'x mandatory' }}>
      {featuredMenters.map(m => (
        <div key={m.menter_id} onClick={() => { setSelectedMenter(m); setYoutubePlayerOpen(false); if (typeof window !== 'undefined' && (window as any).gtag) { (window as any).gtag('event', 'menter_perfil_visto', { menter_id: m.menter_id }) } }} style={{ minWidth: 180, maxWidth: 180, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexShrink: 0, position: 'relative', height: 220 }}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
            {m.avatar_url && <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(66,24,105,0.95) 0%, transparent 100%)', padding: '32px 12px 12px' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'Raleway', textAlign: 'center', marginBottom: 6 }}>{m.nombre} {m.apellidos}</div>
            {m.especialidad && <div style={{ textAlign: 'center' }}><span style={{ fontSize: 11, background: '#ffa719', color: '#2d2926', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{m.especialidad}</span></div>}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    {/* AVISO MENTER */}
    {isMenter && (
      <div style={{ marginBottom: 20, padding: '12px 18px', background: '#fff8e1', borderRadius: 12, border: '2px solid #ffa719', fontSize: 14, color: '#e65100' }}>
        Los Menters que ofrecen descuento a colegas están marcados. ¡Aprovecha la comunidad Giro Lab!
      </div>
    )}

    {/* FILTROS */}
    <div className="giro-filtros-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24, padding: 20, background: '#f8f9fa', borderRadius: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Especialidad</label>
        <select value={filtros.especialidad} onChange={e => setFiltros(p => ({ ...p, especialidad: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', background: 'white' }}>
          <option value="">Todas</option>
          {CASOS_DISPONIBLES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Precio máx. (USD)</label>
        <input type="number" placeholder="ej: 80" value={filtros.precio_max} onChange={e => setFiltros(p => ({ ...p, precio_max: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>País</label>
        <select value={filtros.pais} onChange={e => setFiltros(p => ({ ...p, pais: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', background: 'white' }}>
          <option value="">Todos</option>
          {PAISES.filter(p => !p.startsWith('─')).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button onClick={() => setFiltros({ especialidad: '', precio_max: '', pais: '', soloDescuento: false })} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' }}>✕ Limpiar filtros</button>
      </div>
    </div>

    {isMenter && (
      <button
        onClick={() => setFiltros(p => ({ ...p, soloDescuento: !p.soloDescuento }))}
        style={{
          marginBottom: 16, padding: '9px 20px', borderRadius: 20, cursor: 'pointer',
          border: `2px solid ${(filtros as any).soloDescuento ? '#ffa719' : '#e0e0e0'}`,
          background: (filtros as any).soloDescuento ? '#fff8e1' : 'white',
          color: (filtros as any).soloDescuento ? '#e65100' : '#666',
          fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans',
        }}
      >
        {(filtros as any).soloDescuento ? '✓ Mostrando: con descuento Menter' : '% Ver solo con descuento Menter'}
      </button>
    )}

    {/* GRILLA */}
    {mentersLoading && <div style={{ textAlign: 'center', padding: 40 }}><div style={{ fontSize: 32, marginBottom: 8 }}></div><p style={{ color: '#666' }}>Buscando Menters...</p></div>}
    {!mentersLoading && menters.length === 0 && (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}></div>
        <p style={{ color: '#666', fontSize: 16 }}>No hay Menters con esos filtros.</p>
      </div>
    )}
    <div style={{ display: 'grid', flex: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
      {menters.map((m) => {
  const ini = `${m.nombre?.[0]||''}${m.apellidos?.[0]||''}`.toUpperCase() || '?'
  // Insignias públicas del Menter
  const insigniasPublicas = INSIGNIAS_MENTER.filter(ins =>
    ['menter_destacado','red_activa','transformador','maestro','chispa'].includes(ins.id) &&
    m.insignias_ganadas?.includes(ins.id)
  )

  return (
    <div key={m.menter_id} style={{ 
  borderRadius: 16, border: '2px solid #f0f0f0', background: 'white', 
  overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex', flexDirection: 'column'  // ← agregar
}}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 20px 14px', position: 'relative' }}>

        {/* Badge descuento — solo visible para Menters */}
        {isMenter && (m as any).descuento_menters && (m as any).descuento_codigo && (
          <div style={{
            position: 'absolute', top: 12, right: 14,
            background: '#ffa719', color: '#2d2926',
            fontSize: 10, fontWeight: 800,
            padding: '3px 10px', borderRadius: 20,
            letterSpacing: '0.03em',
          }}>
            {(m as any).descuento_porcentaje}% · {(m as any).descuento_codigo}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: isMenter && (m as any).descuento_menters ? 20 : 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: m.avatar_url ? 'white' : 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {m.avatar_url
              ? <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{ini}</span>}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, fontFamily: 'Raleway, sans-serif' }}>{m.nombre} {m.apellidos}</div>
            {m.especialidad && (
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 11, background: '#ffa719', color: '#2d2926', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{m.especialidad}</span>
              </div>
            )}
            {/* Insignias públicas */}
            {insigniasPublicas.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {insigniasPublicas.map(ins => (
                  <span
                    key={ins.id}
                    title={ins.desc}
                    style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20,
                      background: ins.bg, color: ins.color,
                      fontWeight: 700, border: `0.5px solid ${ins.color}44`,
                    }}
                  >
                    {ins.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex',  flexDirection: 'column',        
}}>
        {m.bio && <p style={{ fontSize: 13, color: '#4d4d4d', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.bio}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {m.casos_que_atiende?.slice(0,3).map(c => <span key={c} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f3e8ff', color: '#6a1b9a', fontWeight: 600 }}>{c}</span>)}
          {(m.casos_que_atiende?.length||0) > 3 && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f0f0f0', color: '#666' }}>+{m.casos_que_atiende.length - 3}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
          <span>{m.precio_sesion ? <strong style={{ color: '#421869' }}>${m.precio_sesion} USD</strong> : 'Precio a acordar'}{m.duracion_sesion ? ` · ${m.duracion_sesion} min` : ''}</span>
          {m.pais && <span>{m.pais}</span>}
        </div>
        {m.modalidad && <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>{modalidadLabel[m.modalidad] || m.modalidad}</div>}
        {menterRatings[m.menter_id] ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ color: '#ffa719', fontSize: 15, letterSpacing: 1 }}>{'★'.repeat(Math.round(menterRatings[m.menter_id].avg))}</span>
            <span style={{ fontSize: 12, color: '#666' }}>{menterRatings[m.menter_id].avg} ({menterRatings[m.menter_id].count} {menterRatings[m.menter_id].count === 1 ? 'reseña' : 'reseñas'})</span>
          </div>
        ) : <div style={{ marginBottom: 12 }} />}
        <button onClick={() => { setSelectedMenter(m); setYoutubePlayerOpen(false); if (typeof window !== 'undefined' && (window as any).gtag) { (window as any).gtag('event', 'menter_perfil_visto', { menter_id: m.menter_id }) } }} style={{
  width: '100%', padding: '11px', borderRadius: 30, border: 'none',
  background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 14,
  cursor: 'pointer', fontFamily: 'Raleway, sans-serif',
  marginTop: 'auto'
}}>
  Ver perfil y agendar →
        </button>
            </div>
          </div>
        )
      })}
    </div>

    {/* MODAL PERFIL */}
    {selectedMenter && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '90px 16px 16px', overflowY: 'auto' }} onClick={() => setSelectedMenter(null)}>
    <div style={{ background: 'white', borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 20px 16px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: selectedMenter.avatar_url ? 'white' : 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {selectedMenter.avatar_url
              ? <img src={selectedMenter.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>{`${selectedMenter.nombre?.[0]||''}${selectedMenter.apellidos?.[0]||''}`.toUpperCase()}</span>}
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'white', fontFamily: 'Raleway, sans-serif', fontSize: 22 }}>{selectedMenter.nombre} {selectedMenter.apellidos}</h2>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedMenter.especialidad && <span style={{ fontSize: 11, background: '#ffa719', color: '#2d2926', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{selectedMenter.especialidad}</span>}
              {selectedMenter.pais && <span style={{ fontSize: 11, color: 'white', background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>📍 {selectedMenter.pais}</span>}
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>{selectedMenter.plan}</span>
            </div>
            {menterRatings[selectedMenter.menter_id] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <span style={{ color: '#ffa719', fontSize: 16, letterSpacing: 1 }}>{'★'.repeat(Math.round(menterRatings[selectedMenter.menter_id].avg))}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{menterRatings[selectedMenter.menter_id].avg} · {menterRatings[selectedMenter.menter_id].count} {menterRatings[selectedMenter.menter_id].count === 1 ? 'reseña' : 'reseñas'}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setSelectedMenter(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}aria-label="Cerrar">✕</button>
      </div>

      <div style={{ padding: 28 }}>

        {/* Insignias */}
{selectedMenter.insignias_ganadas && selectedMenter.insignias_ganadas.length > 0 && (
  <div style={{ marginBottom: 20 }}>
    <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Insignias</h4>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {INSIGNIAS_MENTER
        .filter(ins => selectedMenter.insignias_ganadas!.includes(ins.id))
        .map(ins => (
          <div
            key={ins.id}
            title={ins.desc}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: ins.bg, border: `1px solid ${ins.color}44`,
            }}
          >
            <span style={{ fontSize: 12, color: ins.color, fontWeight: 600 }}>{ins.nombre}</span>
          </div>
        ))}
    </div>
  </div>
)}

        {/* BIO */}
        {selectedMenter.bio && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 8px' }}>Sobre mí</h4>
            <p style={{ color: '#4d4d4d', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{selectedMenter.bio}</p>
          </div>
        )}

        {/* CASOS */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Especialidades</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedMenter.casos_que_atiende?.map(c => <span key={c} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f3e8ff', color: '#6a1b9a', fontWeight: 600 }}>{c}</span>)}
          </div>
        </div>

        {/* PRECIO Y MODALIDAD */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 14, background: '#f8f9fa', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Precio</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#421869' }}>{selectedMenter.precio_sesion ? `$${selectedMenter.precio_sesion} USD` : 'A acordar'}</div>
            {selectedMenter.duracion_sesion && <div style={{ fontSize: 12, color: '#666' }}>{selectedMenter.duracion_sesion} minutos</div>}
          </div>
          <div style={{ padding: 14, background: '#f8f9fa', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Modalidad</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>{modalidadLabel[selectedMenter.modalidad||''] || selectedMenter.modalidad}</div>
          </div>
        </div>

        {/* IDIOMAS - starter+ */}
        {selectedMenter.idiomas && selectedMenter.idiomas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Idiomas</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedMenter.idiomas.map(i => <span key={i} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}>{i}</span>)}
            </div>
          </div>
        )}

        {/* FORMACIÓN - starter+ */}
        {selectedMenter.formacion && (selectedMenter.formacion as any[]).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Formación académica</h4>
            {(selectedMenter.formacion as any[]).map((f, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#f8f9fa', borderRadius: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#421869' }}>{f.titulo}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{f.institucion}</div>
                {(f.anio_inicio || f.anio_fin) && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{f.anio_inicio}{f.anio_fin ? ` — ${f.anio_fin}` : ''}</div>}
              </div>
            ))}
          </div>
        )}

        {/* EXPERIENCIA - starter+ */}
        {selectedMenter.experiencia_laboral && (selectedMenter.experiencia_laboral as any[]).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Experiencia laboral</h4>
            {(selectedMenter.experiencia_laboral as any[]).map((e, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#f8f9fa', borderRadius: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#421869' }}>{e.cargo}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{e.empresa}</div>
                {(e.anio_inicio || e.anio_fin) && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{e.anio_inicio}{e.anio_fin ? ` — ${e.anio_fin}` : ''}</div>}
              </div>
            ))}
          </div>
        )}

        {/* COLEGIATURA - premium+ */}
        {selectedMenter.numero_colegiatura && (
          <div style={{ marginBottom: 20, padding: '10px 14px', background: '#f3e8ff', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}></span>
            <div>
              <div style={{ fontSize: 11, color: '#6a1b9a', fontWeight: 700, textTransform: 'uppercase' }}>Colegiatura</div>
              <div style={{ fontSize: 14, color: '#421869', fontWeight: 600 }}>{selectedMenter.numero_colegiatura}</div>
            </div>
          </div>
        )}

        {/* VIDEO YouTube embebido */}
        {selectedMenter.enlaces?.youtube && (() => {
          const yt = selectedMenter.enlaces.youtube
          const match = yt.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
          if (!match) return null
          const videoId = match[1]
          return (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Presentación en video</h4>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 14, overflow: 'hidden', background: '#000' }}>
                {youtubePlayerOpen ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="Presentación del Menter"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div onClick={() => setYoutubePlayerOpen(true)} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt="Presentación en video"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {youtubePlayerOpen && (
                <a href={/^https?:\/\//i.test(yt) ? yt : `https://${yt}`} target="_blank" rel="noreferrer"
                  style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#ff0000', textDecoration: 'none', textAlign: 'right' }}>
                  Ver en YouTube →
                </a>
              )}
            </div>
          )
        })()}

        {/* REDES - premium+ */}
        {selectedMenter.enlaces && Object.values(selectedMenter.enlaces).some(v => v) && (() => {
          const safeHref = (url: string) => /^https?:\/\//i.test(url) ? url : `https://${url}`
          return (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 10px' }}>Redes y contacto</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedMenter.enlaces.linkedin && <a href={safeHref(selectedMenter.enlaces.linkedin)} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#0077b5', color: 'white', fontWeight: 600, textDecoration: 'none' }}>LinkedIn</a>}
                {selectedMenter.enlaces.instagram && <a href={safeHref(selectedMenter.enlaces.instagram)} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#e1306c', color: 'white', fontWeight: 600, textDecoration: 'none' }}>Instagram</a>}
                {selectedMenter.enlaces.facebook && <a href={safeHref(selectedMenter.enlaces.facebook)} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#1877f2', color: 'white', fontWeight: 600, textDecoration: 'none' }}>Facebook</a>}
                {selectedMenter.enlaces.tiktok && <a href={safeHref(selectedMenter.enlaces.tiktok)} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#010101', color: 'white', fontWeight: 600, textDecoration: 'none' }}>TikTok</a>}
                {selectedMenter.enlaces.x && <a href={safeHref(selectedMenter.enlaces.x)} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#000', color: 'white', fontWeight: 600, textDecoration: 'none' }}>X</a>}
                {selectedMenter.enlaces.whatsapp && <a href={safeHref(selectedMenter.enlaces.whatsapp)} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, background: '#25d366', color: 'white', fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>}
              </div>
            </div>
          )
        })()}

        {/* Botón compartir perfil */}
<div style={{ marginBottom: 16 }}>
  <button
    onClick={() => {
      const url = `${window.location.origin}/menter/${selectedMenter.menter_id}`
      navigator.clipboard.writeText(url)
        .then(() => {
          setToastMsg('Link del perfil copiado al portapapeles')
          setTimeout(() => setToastMsg(null), 3000)
        })
        .catch(() => {
          const input = document.createElement('input')
          input.value = url
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
          setToastMsg('Link del perfil copiado al portapapeles')
          setTimeout(() => setToastMsg(null), 3000)
        })
    }}
    style={{
      width: '100%', padding: '11px', borderRadius: 30,
      border: '2px solid #e0e0e0', background: 'white',
      color: '#421869', fontWeight: 700, fontSize: 14,
      cursor: 'pointer', fontFamily: 'Raleway, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}
  >
    Compartir perfil
  </button>
</div>

        {/* BOTONES */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setSelectedMenter(null)} style={{ flex: 1, padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Volver</button>
          <button onClick={() => setShowAgenda(true)} style={{ flex: 2, padding: '12px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Agendar sesión →</button>
        </div>

      </div>
    </div>
  </div>
)}


    {/* MODAL AGENDA */}
    {showAgenda && selectedMenter && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '90px 16px 16px', overflowY: 'auto' }}>
        <div style={{ background: 'white', borderRadius: 20, maxWidth: 520, width: '100%' }}>
          <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 28px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontFamily: 'Raleway, sans-serif' }}>Agendar sesión</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>con {selectedMenter.nombre} {selectedMenter.apellidos}</p>
            </div>
            <button onClick={() => setShowAgenda(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}aria-label="Cerrar">✕</button>
          </div>
          <AgendaModal
            menter={selectedMenter}
            clientId={user!.id}
            clientName={`${meta?.nombre} ${meta?.apellidos}`}
            clientEmail={user!.email}
            onClose={() => setShowAgenda(false)}
            onBooked={() => { setShowAgenda(false); setSelectedMenter(null); switchTab('mis-citas') }}
          />
        </div>
      </div>
    )}

  </div>
)

 const renderSoporte = () => (
  <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
    <p style={{ fontSize: 16, color: '#4d4d4d', marginBottom: 20 }}>¿Tienes algún problema? Estamos aquí para ayudarte.</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#f3e8ff', borderRadius: 16, border: '1.5px solid #e0d4f7', maxWidth: 420 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #421869, #7b2fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#421869', fontSize: 15, fontFamily: 'Raleway, sans-serif' }}>Chat de soporte</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Haz clic en el ícono morado en la esquina inferior derecha para iniciar una conversación con nuestro equipo.</div>
      </div>
    </div>

    {/* Tour */}
    <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>¿Quieres repasar cómo funciona la plataforma?</p>
      <button onClick={() => { setTourStep(0); setTourActive(true) }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 30, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
        Volver a hacer el tour
      </button>
    </div>

    {/* Botón Panel — visible para admins y asesores */}
    {(ADMIN_EMAILS.includes(user?.email || '') || isStaff) && (
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>
          {isStaff && !ADMIN_EMAILS.includes(user?.email || '') ? 'Acceso de asesor de soporte' : 'Acceso administrativo'}
        </p>
        <a href="/admin" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 20,
          background: '#421869', color: 'white',
          fontSize: 13, fontWeight: 700, textDecoration: 'none'
        }}>
          {isStaff && !ADMIN_EMAILS.includes(user?.email || '') ? 'Panel de Soporte' : 'Panel Admin'}
        </a>
      </div>
    )}
  </div>
)

const renderMisCertificados = () => {
  if (misCertificadosLoading) {
    return <p style={{ color: '#999', padding: '40px 0', textAlign: 'center' }}>Cargando certificados...</p>
  }
  if (misCertificados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
        <svg viewBox="0 0 24 24" width={56} height={56} style={{ fill: '#ddd', marginBottom: 16 }}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
        </svg>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#666', marginBottom: 6 }}>Aún no tienes certificados</p>
        <p style={{ fontSize: 14, color: '#aaa' }}>Cuando un Menter emita tu certificado de participación en un evento, aparecerá aquí.</p>
      </div>
    )
  }
  return (
    <div>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
        {misCertificados.length} {misCertificados.length === 1 ? 'certificado' : 'certificados'} recibidos
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {misCertificados.map(cert => {
          const evento = cert.event
          const fechaEvento = evento?.date
            ? new Date(evento.date + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'
          const fechaEmision = cert.issued_at
            ? new Date(cert.issued_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'
          return (
            <div key={cert.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(66,24,105,0.1)', border: '1px solid #f0e6ff' }}>
              {/* Preview del certificado */}
              <div style={{ position: 'relative', background: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)', minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/certificate-template.svg" style={{ width: '100%', height: 160, objectFit: 'cover' as const, opacity: 0.7 }} alt="" />
                <span style={{ position: 'absolute', top: 10, right: 10, background: '#16a34a', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  Emitido
                </span>
              </div>
              {/* Info */}
              <div style={{ padding: '14px 16px' }}>
                <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', margin: '0 0 4px', fontSize: 15, lineHeight: 1.3 }}>
                  {evento?.title || 'Evento'}
                </h3>
                <p style={{ margin: '0 0 2px', fontSize: 12, color: '#888' }}>Evento: {fechaEvento}</p>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: '#aaa' }}>Emitido el {fechaEmision}</p>
                <button
                  onClick={() => setCertModal({ cert, evento })}
                  style={{ width: '100%', padding: '9px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                  Ver y descargar certificado
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type SectionMap = { [K in TabId]: { title: string; content: React.ReactNode } }
  const sectionContent: SectionMap = {
    perfil:       { title: 'Tu Perfil',                                                    content: renderPerfil() },
    editar:       { title: isMenter ? 'Editar Perfil' : 'Editar Mis Datos',                content: renderEditar() },
    'perfil-pro': { title: 'Perfil Profesional',                                        content: renderPerfilPro() },
    membresia:    { title: 'Mi Membresía',                                              content: renderMembresia() },
    citas:        { title: 'Mi Agenda',                                             content: renderCitasMenter() },
    'mis-citas':  { title: 'Mis Citas Agendadas',                                          content: renderMisCitas() },
    roadmap:      { title: isMenter ? 'Roadmap de clientes' : 'Mi Ruta de Bienestar', content: renderRoadmap()},
    destacados:   { title: isMenter ? 'Directorio de Menters' : 'Menters Destacados', content: renderDestacados() },
     ingresos:    { title: 'Mis Ingresos', content: isMenter ? renderIngresos() : renderProximamente('Ingresos', '') },
    objetivos:            { title: 'Objetivos Empresariales', content: meta?.role === 'empresa' ? renderObjetivosEmpresa() : renderProximamente('Objetivos Empresariales', '') },
    instrumentos:         { title: 'Instrumentos', content: isMenter && user?.id
      ? <>
          <RenderInstrumentosMenter userId={user.id} menterPlan={plan} />
          <div style={{ marginTop: 36, borderTop: '2px solid #f0f0f0', paddingTop: 28 }}>
            <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 18, fontWeight: 800, margin: '0 0 20px' }}>Evaluaciones para Equipos y Empresas</h3>
            <RenderInstrumentosEmpresa empresaId={user.id} isMaster={plan === 'master'} />
          </div>
        </>
      : renderProximamente('Instrumentos', '') },
    resultados_tests:     { title: 'Mis Resultados', content: !isMenter && user?.id ? <RenderResultadosTests userId={user.id} /> : renderProximamente('Mis Resultados', '') },
    instrumentos_empresa: { title: 'Instrumentos', content: (meta?.role === 'empresa' || (isMenter && plan === 'master')) && user?.id ? <RenderInstrumentosEmpresa empresaId={user.id} isMaster={isMenter && plan === 'master'} /> : renderProximamente('Instrumentos', '') },
     compras:      { title: 'Historial de Compras',                                         content: user?.id ? <RenderCompras userId={user.id} isMenter={isMenter} /> : null },
     certificados: { title: 'Mis Certificados',                                             content: renderMisCertificados() },
   comunidad: {
  title: 'Comunidad',
  content: (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', borderRadius: 16, padding: '22px 28px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#ffa719', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>La frase del día</span>
          <blockquote style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: 'white', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'Raleway, sans-serif' }}>
            {fraseDelDia ? `"${fraseDelDia.frase}"` : '"El bienestar no es un destino, es una forma de caminar cada día."'}
          </blockquote>
          {fraseDelDia?.autor && <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>— {fraseDelDia.autor}</div>}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
          Conecta con la comunidad Giro Lab, comparte tu progreso<br/>y descubre contenido de bienestar.
        </p>
        <button
          onClick={() => router.push('/comunidad')}
          style={{ padding: '13px 32px', borderRadius: 30, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway', boxShadow: '0 4px 16px rgba(66,24,105,0.3)' }}>
          Ir a la Comunidad →
        </button>
      </div>
    </div>
  )
},

escribir: { title: 'Blog', content: isMenter && canPremium ? renderBlogMenter() : (
  <div>
    {isMenter && !canPremium && (
      <div style={{ background: 'linear-gradient(135deg,#421869,#6b21a8)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: '#ffa719', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Plan Premium</div>
          <div style={{ color: 'white', fontFamily: 'Raleway, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 2 }}>¿Quieres publicar en el blog?</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Escribe artículos y posiciónate como referente con el plan Premium.</div>
        </div>
        <button onClick={() => switchTab('membresia')} style={{ padding: '10px 22px', borderRadius: 30, border: 'none', background: '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', whiteSpace: 'nowrap' }}>
          Ver planes →
        </button>
      </div>
    )}
    {renderBlogPersona()}
  </div>
) },
   eventos: {
  title: 'Eventos',
  content: !isMenter
    ? renderEventosPersona()
    : renderEventosMenterWrapper()
},
    soporte:      { title: 'Centro de Ayuda',                                              content: renderSoporte() },
  }

  const current = sectionContent[activeTab]

  const sidebarBtnStyle = (id: string): React.CSSProperties => ({
    width: 60, height: 64,
    background: activeTab === id ? '#ffa719' : 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${activeTab === id ? '#ffa719' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: activeTab === id ? '#2d2926' : 'white', cursor: 'pointer', flexShrink: 0,
    position: 'relative', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: activeTab === id ? '0 8px 20px rgba(255,167,25,0.3)' : 'none',
  })

  const allFilled = (
    (!missingProfileFields.nombre     || !!completeForm.nombre.trim()) &&
    (!missingProfileFields.apellidos  || !!completeForm.apellidos.trim()) &&
    (!missingProfileFields.telefono   || !!completeForm.telefono.trim()) &&
    (!missingProfileFields.pais       || !!completeForm.pais) &&
    (!missingProfileFields.cumpleanos || !!completeForm.cumpleanos)
  )

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Push Notifications ──────────────────────────────────────────── */}
      {user?.id && <PushNotificationSetup userId={user.id} />}

      {/* ── Chat de soporte ─────────────────────────────────────────────── */}
      <ChatWidget />

      {/* ── Tour overlay ─────────────────────────────────────────────────── */}
      {tourActive && tourSteps[tourStep] && (() => {
        const step = tourSteps[tourStep]
        const isLast = tourStep === tourSteps.length - 1
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 40px', pointerEvents: 'none' }}>
            {/* backdrop semi-transparent */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,0,50,0.55)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'auto' }} onClick={closeTour} />
            {/* card */}
            <div style={{ position: 'relative', background: 'white', borderRadius: 24, padding: '32px 32px 28px', maxWidth: 440, width: '100%', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', pointerEvents: 'auto', animation: 'tourSlideUp 0.35s cubic-bezier(.22,.68,0,1.2) both' }}>
              {/* close */}
              <button onClick={closeTour} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 20, lineHeight: 1, padding: 4 }}aria-label="Cerrar">✕</button>

              {/* icon */}
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)' }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="#6a1b9a">{icons[step.icon]}</svg>
                </div>
                {step.tab && (
                  <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#995bd5', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif' }}>
                    Sección: {step.title}
                  </div>
                )}
              </div>
              {/* title */}
              <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 20, fontWeight: 900, margin: '0 0 10px', textAlign: 'center' }}>{step.title}</h3>
              {/* desc */}
              <p style={{ color: '#555', fontSize: 15, lineHeight: 1.65, margin: '0 0 24px', textAlign: 'center' }}>{step.desc}</p>
              {/* progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
                {tourSteps.map((_, i) => (
                  <div key={i} style={{ width: i === tourStep ? 20 : 8, height: 8, borderRadius: 4, background: i === tourStep ? '#421869' : '#e0d6f0', transition: 'all 0.3s' }} />
                ))}
              </div>
              {/* buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {tourStep > 0 && (
                  <button onClick={tourPrev} style={{ flex: 1, padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#555', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>← Anterior</button>
                )}
                {tourStep === 0 && (
                  <button onClick={closeTour} style={{ flex: 1, padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#999', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Saltar tour</button>
                )}
                <button onClick={tourNext} style={{ flex: 2, padding: '12px', borderRadius: 30, border: 'none', background: 'linear-gradient(135deg,#421869,#6a1b9a)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                  {isLast ? '¡Listo!' : 'Siguiente →'}
                </button>
              </div>
              {/* step counter */}
              <p style={{ textAlign: 'center', color: '#bbb', fontSize: 12, margin: '14px 0 0', fontFamily: 'DM Sans, sans-serif' }}>{tourStep + 1} de {tourSteps.length}</p>
            </div>
          </div>
        )
      })()}

      {showCompleteProfile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 40, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}></div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', margin: '0 0 8px 0', fontSize: 24, fontWeight: 900 }}>Un último paso</h2>
              <p style={{ color: '#666', fontSize: 15, margin: 0 }}>Completa estos datos para encontrar tu match perfecto</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {missingProfileFields.nombre && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Nombre *</label>
                    <input type="text" placeholder="Tu nombre" value={completeForm.nombre} onChange={e => setCompleteForm(p => ({ ...p, nombre: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Apellidos *</label>
                    <input type="text" placeholder="Tus apellidos" value={completeForm.apellidos} onChange={e => setCompleteForm(p => ({ ...p, apellidos: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}
              {missingProfileFields.telefono && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Teléfono *</label>
                  <input type="tel" placeholder="ej: +51 987 654 321" value={completeForm.telefono} onChange={e => setCompleteForm(p => ({ ...p, telefono: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
                </div>
              )}
              {missingProfileFields.pais && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>País *</label>
                  <select value={completeForm.pais} onChange={e => setCompleteForm(p => ({ ...p, pais: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }}>
                    <option value="">Selecciona tu país</option>
                    {PAISES.map(p => <option key={p} value={p} disabled={p.startsWith('─')}>{p}</option>)}
                  </select>
                </div>
              )}
              {missingProfileFields.cumpleanos && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Fecha de nacimiento *</label>
                  <input type="date" value={completeForm.cumpleanos} onChange={e => setCompleteForm(p => ({ ...p, cumpleanos: e.target.value }))} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
                </div>
              )}
            </div>
            <button onClick={handleCompleteProfile} disabled={completeSaving || !allFilled} style={{ width: '100%', marginTop: 24, padding: '14px', background: allFilled ? '#ffa719' : '#e0e0e0', color: allFilled ? '#2d2926' : '#999', border: 'none', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: allFilled ? 'pointer' : 'not-allowed', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase' }}>
              {completeSaving ? 'Guardando...' : 'Completar mi perfil →'}
            </button>
          </div>          
        </div>
      )}

      {showVerification && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', margin: '0 0 8px 0', fontSize: 22, fontWeight: 900 }}>Verifica tu correo</h2>
              <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                Te enviamos un código de 6 dígitos a <strong>{user?.email}</strong>.<br />Ingrésalo para continuar.
              </p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="_ _ _ _ _ _"
              value={verifyCode}
              onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); setVerifyError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleVerifyCode() }}
              style={{
                width: '100%', padding: '16px', textAlign: 'center', fontSize: 28, fontWeight: 800,
                letterSpacing: 12, border: '2px solid #421869', borderRadius: 12, fontFamily: 'monospace',
                boxSizing: 'border-box', outline: 'none', color: '#421869',
              }}
              autoFocus
            />
            {verifyError && <p style={{ color: '#c62828', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 0 }}>{verifyError}</p>}
            {verifyResent && <p style={{ color: '#2e7d32', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 0 }}>Código reenviado. Revisa tu bandeja de entrada.</p>}
            <button
              onClick={handleVerifyCode}
              disabled={verifySending || verifyCode.length !== 6}
              style={{ width: '100%', marginTop: 20, padding: '14px', background: verifyCode.length === 6 ? '#ffa719' : '#e0e0e0', color: verifyCode.length === 6 ? '#2d2926' : '#999', border: 'none', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: verifyCode.length === 6 ? 'pointer' : 'not-allowed', fontFamily: 'Raleway, sans-serif', textTransform: 'uppercase' }}
            >
              {verifySending ? 'Verificando...' : 'Verificar →'}
            </button>
            <button
              onClick={handleResendCode}
              style={{ width: '100%', marginTop: 12, padding: '10px', background: 'none', border: 'none', color: '#421869', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
            >
              No recibí el código — Reenviar
            </button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#421869', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <ul style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', margin: 0, padding: 0, zIndex: 0, pointerEvents: 'none', listStyle: 'none' }}>
          {[{left:'25%',size:80,delay:0,dur:25},{left:'10%',size:20,delay:2,dur:12},{left:'70%',size:20,delay:4,dur:25},{left:'40%',size:60,delay:8,dur:20},{left:'85%',size:30,delay:1,dur:18}].map((c,i) => (
            <li key={i} style={{ position:'absolute', display:'block', width:c.size, height:c.size, background:'rgba(255,255,255,0.05)', bottom:-150, left:c.left, borderRadius:'50%', animation:`animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
          ))}
        </ul>
        <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
          @keyframes animateUp{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-110vh) rotate(720deg);opacity:0}}
          @keyframes tourSlideUp{from{opacity:0;transform:translateY(40px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
          .giro-icon-btn:hover{background:#ffa719!important;border-color:#ffa719!important;color:#2d2926!important;box-shadow:0 8px 20px rgba(255,167,25,.3)!important}
          .giro-icon-btn:hover svg{transform:scale(1.1)}
          @media(max-width:900px){
            .giro-main-panel{margin-left:0!important;padding:90px 12px 40px 12px!important}
            .giro-desktop-header{display:none!important}
            .giro-lottie-desktop{display:none!important}
            .giro-sidebar{transform:translateX(-120%)!important;top:0!important;bottom:0!important;left:0!important;background:rgba(153,91,213,.98)!important;padding-top:90px!important;width:80px!important}
            .giro-sidebar.open{transform:translateX(0)!important}
            .giro-mobile-header{display:flex!important}
            .giro-content-card{padding:20px!important}
            .giro-filtros-box{padding:12px!important}
          }
          @media(min-width:901px){.giro-mobile-header{display:none!important}}
          .giro-menu-btn:hover{background:#995bd5!important}
        `}</style>

        <div className="giro-lottie-desktop" style={{ position:'fixed', top:30, right:15, width:100, height:100, zIndex:50, pointerEvents:'none', opacity:scrolled?0:1, transition:'opacity 0.4s ease' }}>
          <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" autoplay loop style={{ width:70, height:70 }} />
        </div>

        <div className="giro-mobile-header" style={{ position:'fixed', top:0, left:0, width:'100%', padding:'10px 20px', zIndex:9999, alignItems:'center', justifyContent:'space-between', background:'rgba(66,24,105,.98)', borderBottom:'1px solid rgba(255,255,255,.1)', height:70, boxSizing:'border-box' }}>
          <div style={{ display:'flex', alignItems:'center', flex:1 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background:'#ffa719', border:'none', width:40, height:40, borderRadius:8, cursor:'pointer', marginRight:15, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg viewBox="0 0 24 24" style={{ width:24, height:24, fill:'#2d2926' }}>
                {sidebarOpen?<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>:<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>}
              </svg>
            </button>
            <div style={{ color:'white', fontFamily:'Raleway, sans-serif', fontWeight:700, fontSize:15 }}>Hola, <span style={{ color:'#ffa719' }}>{firstName}</span></div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, position:'relative' }}>
            <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" autoplay loop style={{ width:50, height:50 }} />
            <button
              onClick={e => { e.stopPropagation(); setHeaderMenuOpen(o => !o) }}
              style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, width:40, height:40, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, cursor:'pointer', padding:8 }}
              aria-label="Menú"
            >
              <span style={{ display:'block', width:20, height:2, background:'white', borderRadius:2 }} />
              <span style={{ display:'block', width:20, height:2, background:'white', borderRadius:2 }} />
              <span style={{ display:'block', width:20, height:2, background:'white', borderRadius:2 }} />
            </button>
            {headerMenuOpen && (
              <div onClick={e => e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'#421869', borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.2)', minWidth:230, zIndex:200, boxShadow:'0 8px 28px rgba(0,0,0,0.35)' }}>
                {[
                  { label:'Ir a Comunidad', action:() => { setHeaderMenuOpen(false); router.push('/comunidad') } },
                  { label:'Crear acceso directo', action:() => { setHeaderMenuOpen(false); const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent); const p = (window as any)._deferredInstallPrompt; if (isIOS) { alert('En Safari: toca el botón Compartir ↑ (cuadrado con flecha) y luego "Añadir a pantalla de inicio".') } else if (p) { p.prompt() } else { alert('En Chrome, abre el menú ⋮ y selecciona "Instalar app".') } } },
                  { label:'Atención al cliente', action:() => { setHeaderMenuOpen(false); switchTab('soporte') } },
                  { label:'Cerrar sesión', action:() => { setHeaderMenuOpen(false); handleLogout() } },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action} className="giro-menu-btn" style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.08)', color:'white', padding:'13px 18px', fontSize:14, fontWeight:600, textAlign:'left', cursor:'pointer', whiteSpace:'nowrap' }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div ref={sidebarRef} onScroll={revisarScrollMenu} className={`giro-sidebar${sidebarOpen?' open':''}`} style={{ position:'fixed', left:20, top:100, bottom:30, zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', gap:10, overflowY:'auto', overflowX:'hidden', scrollbarWidth:'none', width:70, transition:'transform 0.3s ease' }}>
          {menuItems.map(item => {
  const badgeCount = 
    (item.id === 'citas' && isMenter && citasPendientesCount > 0) ||
    (item.id === 'mis-citas' && !isMenter && citasPendientesCount > 0)
      ? citasPendientesCount : 0
  return (
    <div key={item.id} className="giro-icon-btn" onClick={() => switchTab(item.id)} style={{ ...sidebarBtnStyle(item.id), position: 'relative' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, pointerEvents:'none' }}>
        <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'currentColor', transition:'transform 0.3s ease' }}>{icons[item.icon]}</svg>
        <span style={{ fontSize:8, fontWeight:700, textAlign:'center', lineHeight:1.2, maxWidth:54, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>
      </div>
      {badgeCount > 0 && (
        <div style={{ position:'absolute', top:6, right:6, background:'#e53935', color:'white', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(66,24,105,0.8)' }}>
          {badgeCount}
        </div>
      )}
    </div>
  )
})}
          <div className="giro-icon-btn" onClick={() => switchTab('soporte')} style={sidebarBtnStyle('soporte')}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, pointerEvents:'none' }}>
              <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'currentColor' }}>{icons.soporte}</svg>
              <span style={{ fontSize:8, fontWeight:700, textAlign:'center', lineHeight:1.2, maxWidth:54 }}>Soporte</span>
            </div>
          </div>

          {/* Señal de que el menú sigue hacia abajo. Se pega al borde inferior
              mientras quede contenido y desaparece al llegar al final. */}
          {hayMasMenu && (
            <div aria-hidden="true" style={{ position:'sticky', bottom:0, flexShrink:0, display:'flex', justifyContent:'center', width:'100%', paddingTop:4, pointerEvents:'none' }}>
              <span style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,0.22)', backdropFilter:'blur(4px)', color:'#fff', fontSize:13, lineHeight:'26px', textAlign:'center', fontWeight:800, boxShadow:'0 2px 8px rgba(0,0,0,0.25)' }}>▾</span>
            </div>
          )}
        </div>
        <main className="giro-main-panel" style={{ marginLeft:110, padding:'40px 40px 100px 40px', position:'relative', zIndex:10, maxWidth:1200 }}>
          <div className="giro-desktop-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:30, paddingRight:110 }}>
            <h1 style={{ fontFamily:'Raleway, sans-serif', fontWeight:900, fontSize:'2.5rem', color:'white', lineHeight:1.2, margin:0 }}>
              Hola, <span style={{ color:'#ffa719' }}>{firstName}</span>
            </h1>
            <div style={{ position:'relative' }}>
              <button
                onClick={e => { e.stopPropagation(); setHeaderMenuOpen(o => !o) }}
                style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10, width:44, height:44, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, cursor:'pointer', padding:8 }}
                aria-label="Menú"
              >
                <span style={{ display:'block', width:20, height:2, background:'white', borderRadius:2 }} />
                <span style={{ display:'block', width:20, height:2, background:'white', borderRadius:2 }} />
                <span style={{ display:'block', width:20, height:2, background:'white', borderRadius:2 }} />
              </button>
              {headerMenuOpen && (
                <div onClick={e => e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'#421869', borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.2)', minWidth:230, zIndex:200, boxShadow:'0 8px 28px rgba(0,0,0,0.35)' }}>
                  {[
                    { label:'Ir a Comunidad', action:() => { setHeaderMenuOpen(false); router.push('/comunidad') } },
                    { label:'Crear acceso directo', action:() => { setHeaderMenuOpen(false); const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent); const p = (window as any)._deferredInstallPrompt; if (isIOS) { alert('En Safari: toca el botón Compartir ↑ (cuadrado con flecha) y luego "Añadir a pantalla de inicio".') } else if (p) { p.prompt() } else { alert('En Chrome, abre el menú ⋮ y selecciona "Instalar app".') } } },
                    { label:'Atención al cliente', action:() => { setHeaderMenuOpen(false); switchTab('soporte') } },
                    { label:'Cerrar sesión', action:() => { setHeaderMenuOpen(false); handleLogout() } },
                  ].map(({ label, action }) => (
                    <button key={label} onClick={action} className="giro-menu-btn" style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.08)', color:'white', padding:'13px 18px', fontSize:14, fontWeight:600, textAlign:'left', cursor:'pointer', whiteSpace:'nowrap' }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="giro-content-card" style={{ background:'white', borderRadius:20, padding:40, color:'#2d2926', boxShadow:'0 10px 40px rgba(0,0,0,.2)' }}>
            <h2 style={{ fontFamily:'Raleway, sans-serif', color:'#421869', marginTop:0, borderBottom:'2px solid #f0f0f0', paddingBottom:20, marginBottom:20 }}>{current.title}</h2>
            {current.content}
          </div>
        </main>
      </div>

      {modalCancelar && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setModalCancelar(null)}>
    <div style={{ background: 'white', borderRadius: 20, maxWidth: 440, width: '100%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
      <div style={{ background: 'linear-gradient(135deg,#c62828,#e53935)', padding: '20px 24px' }}>
        <h3 style={{ margin: 0, color: 'white', fontFamily: 'Raleway' }}>Cancelar cita</h3>
        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
          {modalCancelar.menter_name || modalCancelar.client_name} · {new Date(modalCancelar.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff8e1', border: '2px solid #ffa719', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e65100', marginBottom: 6 }}>Política de cancelación de Giro Lab</div>
          <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            Las cancelaciones deben realizarse con <strong>más de 24 horas de anticipación</strong>. Si el pago fue procesado a través de Giro Lab y la cancelación ocurre fuera de este plazo, el Menter conserva el pago por la sesión reservada.
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#4d4d4d', textAlign: 'center' }}>¿Estás seguro que deseas cancelar esta cita?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setModalCancelar(null)} style={{ flex: 1, padding: '12px', borderRadius: 20, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Volver</button>
          <button onClick={handleCancelar} disabled={cancelarLoading} style={{ flex: 1, padding: '12px', borderRadius: 20, border: 'none', background: cancelarLoading ? '#ccc' : '#c62828', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
            {cancelarLoading ? 'Cancelando...' : 'Sí, cancelar →'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {modalReprogramar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setModalReprogramar(null)}>
          <div style={{ background: 'white', borderRadius: 20, maxWidth: 460, width: '100%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', marginBottom: '10px', padding: '20px 24px' }}>
              <h3 style={{ margin: 0, color: 'white', fontFamily: 'Raleway' }}>Proponer nueva fecha</h3>
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                {isMenter ? modalReprogramar.client_name : modalReprogramar.menter_name}
              </p>
            </div>
            <div style={{ background: '#fff8e1', border: '2px solid #ffa719', margin: '0 20px 6px 20px' ,borderRadius: 12, padding: '14px 16px' }}>
  <div style={{ fontWeight: 700, fontSize: 13, color: '#e65100', marginBottom: 6 }}>Política de reprogramación de Giro Lab</div>
  <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
    Las reprogramaciones deben solicitarse con <strong>más de 24 horas de anticipación</strong>. La otra parte debe aceptar la nueva fecha para que el cambio sea efectivo.
  </p>
</div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase' }}>Nueva fecha</label>
                <input type="date" value={reprogramarFecha} onChange={e => setReprogramarFecha(e.target.value)} min={new Date(Date.now() + 25*60*60*1000).toISOString().split('T')[0]} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase' }}>Hora inicio</label>
                  <input type="time" value={reprogramarHoraInicio} onChange={e => setReprogramarHoraInicio(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase' }}>Hora fin</label>
                  <input type="time" value={reprogramarHoraFin} onChange={e => setReprogramarHoraFin(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#421869', marginBottom: 6, textTransform: 'uppercase' }}>Nota (opcional)</label>
                <textarea value={reprogramarNotas} onChange={e => setReprogramarNotas(e.target.value)} placeholder="Explica el motivo del cambio..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', boxSizing: 'border-box', resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModalReprogramar(null)} style={{ flex: 1, padding: '12px', borderRadius: 20, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleReprogramar} disabled={reprogramarLoading || !reprogramarFecha || !reprogramarHoraInicio || !reprogramarHoraFin} style={{ flex: 2, padding: '12px', borderRadius: 20, border: 'none', background: reprogramarLoading ? '#ccc' : '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
                  {reprogramarLoading ? 'Enviando...' : 'Proponer nueva fecha →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      

    {renderBlogModal()}
    {renderEventoModal()}
    {renderInscritosModal()}

      {/* ── Certificate Generator Modal ────────────────────────────────── */}
      {certModal && (
        <CertificateGenerator
          participantName={`${meta?.nombre || ''} ${meta?.apellidos || ''}`.trim() || 'Participante'}
          eventTitle={certModal.evento?.title || ''}
          eventDate={certModal.evento?.date || ''}
          certificateText={certModal.evento?.certificate_text || null}
          presenterName={certModal.evento?.presenter || null}
          firmaUrl={certModal.evento?.certificate_firma || null}
          onClose={() => setCertModal(null)}
        />
      )}

    {toastMsg && (
      <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#DC2626', color: 'white', padding: '14px 20px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', zIndex: 10001, fontSize: '15px', fontWeight: 600, minWidth: '280px', textAlign: 'center' }}>
        {toastMsg}
      </div>
)}

    {/* ── MODAL PAYPAL (éxito / error / confirmación cancelar) ── */}
    {ppModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 20, maxWidth: 420, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ background: ppModal.type === 'success' ? 'linear-gradient(135deg,#2e7d32,#43a047)' : ppModal.type === 'error' ? 'linear-gradient(135deg,#b71c1c,#e53935)' : 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 24px' }}>
            <div style={{ fontSize: 32, textAlign: 'center' }}>
              {ppModal.type === 'success' ? '✅' : ppModal.type === 'error' ? '⚠️' : '🔔'}
            </div>
          </div>
          <div style={{ padding: '24px 28px' }}>
            <p style={{ margin: '0 0 20px', fontSize: 15, color: '#2d2926', lineHeight: 1.6, textAlign: 'center' }}>{ppModal.msg}</p>
            {ppModal.type === 'confirm' ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setPpModal(null)} style={{ flex: 1, padding: '11px', borderRadius: 30, border: '1.5px solid #ddd', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                  Mantener plan
                </button>
                <button onClick={ppModal.onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 30, border: 'none', background: '#b71c1c', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                  Sí, cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setPpModal(null)} style={{ width: '100%', padding: '12px', borderRadius: 30, border: 'none', background: 'linear-gradient(135deg,#421869,#995bd5)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── MODAL RESEÑA ── */}
    {reviewModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ background: 'linear-gradient(135deg,#421869,#995bd5)', padding: '20px 24px' }}>
            <h3 style={{ color: 'white', margin: 0, fontFamily: 'Raleway', fontSize: 17, fontWeight: 800 }}>Resenar sesion</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: 13 }}>{reviewModal.reviewedName}</p>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Calificación general</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm(p => ({ ...p, estrellas: n }))}
                    style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#ffa719', opacity: n <= reviewForm.estrellas ? 1 : 0.25, transition: 'opacity 0.15s' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            {([
              { key: 'puntualidad', label: 'Puntualidad' },
              { key: 'comunicacion', label: 'Comunicacion' },
              { key: 'efectividad', label: 'Efectividad' },
            ] as { key: 'puntualidad' | 'comunicacion' | 'efectividad'; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{label}</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewForm(p => ({ ...p, [key]: n }))}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                        background: n <= reviewForm[key] ? '#421869' : '#f0f0f0',
                        color: n <= reviewForm[key] ? 'white' : '#999' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Comentario (opcional)</label>
              <textarea
                value={reviewForm.comentario}
                onChange={e => setReviewForm(p => ({ ...p, comentario: e.target.value }))}
                placeholder="Comparte tu experiencia..."
                rows={3}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '0.5px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', resize: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setReviewModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '0.5px solid #ddd', background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={guardarResena} disabled={reviewSaving}
                style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: reviewSaving ? '#ccc' : '#421869', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway' }}>
                {reviewSaving ? 'Guardando...' : 'Publicar resena'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  )
}

// ─── CitaCardMenter ──────────────────────────────────────────────────────────
function CitaCardMenter({ c, onEstado, onReprogramar, onCancelar, onAceptar, onRechazar }: {
  c: any
  onEstado: (id: string, estado: string) => void
  onReprogramar: (c: any) => void
  onCancelar: (c: any) => void
  onAceptar: (c: any) => void
  onRechazar: (c: any) => void
}) {
  const puede = (() => {
    const fecha = new Date(`${c.date}T${c.start_time}`)
    return (fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60) > 24
  })()

  return (
    <div style={{ borderRadius: 14, border: '2px solid #f0f0f0', background: 'white', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: 16, color: '#421869' }}>{c.client_name}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {new Date(c.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {c.start_time && ` · ${c.start_time.slice(0,5)}`}
            {c.end_time && ` — ${c.end_time.slice(0,5)}`}
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
          background: c.status === 'pendiente' ? '#fff8e1' : c.status === 'confirmada' ? '#e8f5e9' : c.status === 'reprogramacion_pendiente' ? '#e3f2fd' : '#f5f5f5',
          color: c.status === 'pendiente' ? '#e65100' : c.status === 'confirmada' ? '#1b5e20' : c.status === 'reprogramacion_pendiente' ? '#1565c0' : '#555'
        }}>
          {c.status === 'reprogramacion_pendiente' ? 'Reprogramación' : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: '#555', alignItems: 'center' }}>
        {c.modality && <span>{c.modality === 'video' ? 'Virtual' : c.modality === 'presencial' ? 'Presencial' : 'Ambas'}</span>}
        {c.price > 0 && <span>${c.price} USD</span>}
        {c.payment_method === 'directo'
          ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0f0f0', color: '#666' }}>Trato directo</span>
          : c.payment_status === 'pagado'
            ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#e8f5e9', color: '#1b5e20' }}>Pagado</span>
            : <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fff8e1', color: '#e65100' }}>Pago pendiente</span>
        }
      </div>

      {c.notes && <div style={{ fontSize: 13, color: '#666', background: '#f8f9fa', padding: '8px 12px', borderRadius: 8, fontStyle: 'italic' }}>{c.notes}</div>}

      {c.status === 'reprogramacion_pendiente' && c.reprogramacion_propuesta_por !== 'menter' && (
        <div style={{ background: '#fff8e1', border: '2px solid #ffa719', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e65100', marginBottom: 6 }}>La Persona propone reprogramar</div>
          <div style={{ fontSize: 13, color: '#555' }}>
            Nueva fecha: <strong>{new Date(c.reprogramacion_fecha.slice(0,10) + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            {c.reprogramacion_hora_inicio && ` · ${c.reprogramacion_hora_inicio.slice(0,5)}`}
            {c.reprogramacion_hora_fin && ` — ${c.reprogramacion_hora_fin.slice(0,5)}`}
          </div>
          {c.reprogramacion_notas && <div style={{ fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' }}>{c.reprogramacion_notas}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => onAceptar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aceptar</button>
            <button onClick={() => onRechazar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Rechazar</button>
          </div>
        </div>
      )}

      {c.status === 'pendiente' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={() => onEstado(c.id, 'confirmada')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>Confirmar</button>
          <button onClick={() => onEstado(c.id, 'rechazada')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: '2px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Rechazar</button>
        </div>
      )}

      {c.status === 'confirmada' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {puede ? (
            <>
              <button onClick={() => onReprogramar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reprogramar</button>
              <button onClick={() => onEstado(c.id, 'completada')} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #e3f2fd', background: 'white', color: '#1565c0', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Completada</button>
              <button onClick={() => onCancelar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#999', padding: '8px 0' }}>No se puede modificar con menos de 24 horas de anticipación</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CitaCardPersona ──────────────────────────────────────────────────────────
function CitaCardPersona({ c, onReprogramar, onCancelar, onAceptar, onRechazar }: {
  c: any
  onReprogramar: (c: any) => void
  onCancelar: (c: any) => void
  onAceptar: (c: any) => void
  onRechazar: (c: any) => void
}) {
  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    pendiente:                { label: 'Pendiente',      color: '#e65100', bg: '#fff8e1' },
    confirmada:               { label: 'Confirmada',     color: '#1b5e20', bg: '#e8f5e9' },
    completada:               { label: 'Completada',     color: '#1565c0', bg: '#e3f2fd' },
    rechazada:                { label: 'Rechazada',      color: '#b71c1c', bg: '#ffebee' },
    cancelada:                { label: 'Cancelada',      color: '#555',    bg: '#f5f5f5' },
    reprogramacion_pendiente: { label: 'Reprogramación', color: '#1565c0', bg: '#e3f2fd' },
  }

  const puede = (() => {
    const fecha = new Date(`${c.date}T${c.start_time}`)
    return (fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60) > 24
  })()

  const st = statusLabel[c.status] || statusLabel.pendiente

  return (
    <div style={{ borderRadius: 14, border: '2px solid #f0f0f0', background: 'white', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: 16, color: '#421869' }}>{c.menter_name}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {new Date(c.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {c.start_time && ` · ${c.start_time.slice(0,5)}`}
            {c.end_time && ` — ${c.end_time.slice(0,5)}`}
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: '#555', alignItems: 'center' }}>
        {c.modality && <span>{c.modality === 'video' ? 'Virtual' : c.modality === 'presencial' ? 'Presencial' : 'Ambas'}</span>}
        {c.price > 0 && <span>${c.price} USD</span>}
        {/* Badge de pago */}
        {c.payment_method === 'directo'
          ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0f0f0', color: '#666' }}>Trato directo</span>
          : c.payment_status === 'pagado'
            ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#e8f5e9', color: '#1b5e20' }}>Pagado</span>
            : <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fff8e1', color: '#e65100' }}>Pago pendiente</span>
        }
      </div>

      {c.notes && <div style={{ fontSize: 13, color: '#666', background: '#f8f9fa', padding: '8px 12px', borderRadius: 8, fontStyle: 'italic' }}>{c.notes}</div>}

      {c.meet_link && c.status === 'confirmada' && (
        <a href={c.meet_link} target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 20, background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center' }}>
          Unirse a la sesión
        </a>
      )}

      {c.status === 'reprogramacion_pendiente' && c.reprogramacion_propuesta_por !== 'persona' && (
        <div style={{ background: '#fff8e1', border: '2px solid #ffa719', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e65100', marginBottom: 6 }}>El Menter propone reprogramar</div>
          <div style={{ fontSize: 13, color: '#555' }}>
            Nueva fecha: <strong>{new Date(c.reprogramacion_fecha.slice(0,10) + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            {c.reprogramacion_hora_inicio && ` · ${c.reprogramacion_hora_inicio.slice(0,5)}`}
            {c.reprogramacion_hora_fin && ` — ${c.reprogramacion_hora_fin.slice(0,5)}`}
          </div>
          {c.reprogramacion_notas && <div style={{ fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' }}>{c.reprogramacion_notas}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => onAceptar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aceptar</button>
            <button onClick={() => onRechazar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Rechazar</button>
          </div>
        </div>
      )}

      {c.status === 'pendiente' && (
        <div style={{ marginTop: 4 }}>
          <button onClick={() => onCancelar(c)}
            style={{ padding: '8px 18px', borderRadius: 20, border: '2px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Cancelar solicitud
          </button>
          <p style={{ fontSize: 11, color: '#999', margin: '6px 0 0' }}>
            Si el Menter no responde en 24 h, la solicitud se cancela automáticamente.
          </p>
        </div>
      )}

      {c.status === 'confirmada' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {puede ? (
            <>
              <button onClick={() => onReprogramar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #421869', background: 'white', color: '#421869', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reprogramar</button>
              <button onClick={() => onCancelar(c)} style={{ flex: 1, padding: '9px', borderRadius: 20, border: '2px solid #ffebee', background: 'white', color: '#c62828', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#999', padding: '8px 0' }}>No se puede modificar con menos de 24 horas de anticipación</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────
function FieldBlock({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? '#fffbf5' : '#f8f9fa', padding: 15, borderRadius: '0 12px 12px 0', borderLeft: `4px solid ${highlight ? '#ffa719' : '#995bd5'}` }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</label>
      <div style={{ fontSize: 16, color: value ? '#2d2926' : '#999', fontWeight: 500, fontStyle: value ? 'normal' : 'italic' }}>{value || 'No especificado'}</div>
    </div>
  )
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.3s' }} onFocus={e => (e.target.style.borderColor = '#995bd5')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
    </div>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.3s', colorScheme: 'light' }}
          onFocus={e => (e.target.style.borderColor = '#995bd5')}
          onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
        {!value && (
          <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#aaa', pointerEvents: 'none', fontFamily: 'DM Sans, sans-serif' }}>
            Toca para seleccionar fecha
          </span>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ color: '#421869', fontFamily: 'Raleway, sans-serif', margin: '0 0 4px 0', fontSize: 18 }}>{emoji} {title}</h3>
      {subtitle && <p style={{ color: '#666', fontSize: 14, margin: 0 }}>{subtitle}</p>}
    </div>
  )
}

function PlanGate({ plan, required, onUpgrade, children }: { plan: string; required: 'starter' | 'premium'; onUpgrade: () => void; children: React.ReactNode }) {
  const order: Record<string, number> = { free: 0, starter: 1, premium: 2, master: 3 }
  const hasAccess = order[plan] >= order[required]
  const info = { starter: { label: 'Starter', color: '#1565c0', emoji: '' }, premium: { label: 'Premium', color: '#6a1b9a', emoji: '' } }[required]
  if (hasAccess) return <>{children}</>
  return (
    <div style={{ flex: 1, minWidth: 200, padding: '20px 24px', borderRadius: 16, border: `2px dashed ${info.color}`, background: `${info.color}08`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ fontSize: 28 }}>{info.emoji}</div>
      <h4 style={{ color: info.color, fontFamily: 'Raleway, sans-serif', margin: 0, fontSize: 15 }}>Plan {info.label}</h4>
      <p style={{ color: '#999', fontSize: 13, margin: 0, lineHeight: 1.4 }}>Sube tu plan para desbloquear estas funcionalidades.</p>
      <button onClick={onUpgrade} style={{ marginTop: 4, padding: '8px 20px', borderRadius: 30, border: 'none', background: info.color, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Ver planes →</button>
    </div>
  )
}

function PlanGatesRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>{children}</div>
}
  // ─── AgendaModal ─────────────────────────────────────────────────────────────
function AgendaModal({ menter, clientId, clientName, clientEmail, onClose, onBooked }: {
  menter: MenterResult
  clientId: string
  clientName: string
  clientEmail: string
  onClose: () => void
  onBooked: () => void
}) {
  const [step, setStep] = useState<'fecha' | 'slot' | 'confirm'>('fecha')
  const [fecha, setFecha] = useState('')
  const [slots, setSlots] = useState<{ slot_start: string; slot_end: string }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [citas, setCitas] = useState<any[]>([])
  const [citasLoading, setCitasLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ slot_start: string; slot_end: string } | null>(null)
  const [modalidad, setModalidad] = useState<'video' | 'presencial'>(menter.modalidad === 'presencial' ? 'presencial' : 'video')
  const [showWhatsappModal, setShowWhatsappModal] = useState(false)
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
  if (!selectedSlot || !fecha) return
  setBooking(true)
  // reCAPTCHA v3 — no bloqueante: si falla (dominio no registrado, red, etc) se continúa igual
  // El usuario ya está autenticado por Supabase Auth, eso provee la capa de seguridad principal
  const rcToken = await getRecaptchaToken('agendar_cita')
  if (rcToken) {
    const ok = await verifyRecaptcha(rcToken, 'agendar_cita')
    if (!ok) console.warn('[recaptcha] verificación fallida — se continúa igual (dominio pendiente de registro)')
  }
  const { data: apt, error } = await supabase.from('appointments').insert({
    menter_id:      menter.menter_id,
    client_id:      clientId,
    menter_name:    `${menter.nombre} ${menter.apellidos}`,
    client_name:    clientName,
    client_email:   clientEmail,
    date:           fecha,
    start_time:     selectedSlot.slot_start,
    end_time:       selectedSlot.slot_end,
    modality:       modalidad,
    payment_method: 'directo',
    payment_status: 'pendiente',
    price:          menter.precio_sesion,
    status:         'pendiente',
    notes:          notas || null,
  }).select('id').single()
  if (error || !apt) {
    setBooking(false)
    setBookingMsg('Error al agendar. Intenta nuevamente.')
    return
  }

  setBooking(false)

  const citaData = {
    clientName:    clientName,
    clientEmail:   clientEmail,
    menterName:    `${menter.nombre} ${menter.apellidos}`,
    menterId:      menter.menter_id,
    menterEmail:   '',  // resuelto server-side por menterId
    date:          formatFecha(fecha),
    startTime:     selectedSlot!.slot_start.slice(0, 5),
    endTime:       selectedSlot!.slot_end.slice(0, 5),
    modality:      modalidad,
    price:         menter.precio_sesion,
    appointmentId: apt.id,
  }
  // Notificar siempre, independiente del flujo de pago
  dispararEmail('nueva_solicitud_menter', citaData)
  if (clientEmail) dispararEmail('solicitud_confirmada_cliente', citaData)

  // Push al cliente y al Menter
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) return
    const h = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }
    if (clientId) {
      fetch('/api/push/send', {
        method: 'POST', headers: h,
        body: JSON.stringify({
          user_id: clientId,
          title: '¡Solicitud enviada!',
          body: `Tu cita con ${menter.nombre} el ${formatFecha(fecha)} está pendiente de confirmación.`,
          url: '/dashboard?tab=mis-citas',
        }),
      }).catch(() => {})
    }
    fetch('/api/push/send', {
      method: 'POST', headers: h,
      body: JSON.stringify({
        user_id: menter.menter_id,
        title: 'Nueva solicitud de sesión',
        body: `${clientName} quiere agendar el ${formatFecha(fecha)} a las ${selectedSlot!.slot_start.slice(0, 5)}.`,
        url: '/dashboard?tab=citas',
      }),
    }).catch(() => {})
  })

  // Si el Menter tiene precio y WhatsApp → mostrar modal de pago
  if (menter.precio_sesion && menter.precio_sesion > 0 && menter.enlaces?.whatsapp) {
    setShowWhatsappModal(true)
    return
  }
  setBookingMsg('¡Solicitud enviada! El Menter confirmará tu cita pronto.')
  setTimeout(() => onBooked(), 2500)
}

  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const formatFecha = (f: string) => {
    if (!f) return ''
    const [y, m, d] = f.split('-')
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
    const date = new Date(parseInt(y), parseInt(m)-1, parseInt(d))
    return `${dias[date.getDay()]}, ${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`
  }

  if (showWhatsappModal) {
    const whatsappUrl = menter.enlaces?.whatsapp || null
    return (
      <div style={{ padding: '40px 28px', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>¡Cita reservada!</h3>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
          Tu sesión con <strong>{menter.nombre}</strong> está pendiente de confirmación.
        </p>
        <div style={{ background: '#f3e8ff', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#421869', margin: '0 0 4px' }}>Precio de la sesión</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#421869', margin: 0 }}>${menter.precio_sesion} USD</p>
        </div>
        <div style={{ background: '#fff8e1', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left', border: '1.5px solid #ffa719' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#e65100', margin: '0 0 6px' }}>Acuerda el pago con el Menter</p>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
            Escríbele a <strong>{menter.nombre}</strong> para confirmar el método de pago y asegurar tu cita.
          </p>
        </div>
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px', borderRadius: 30, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 12, boxSizing: 'border-box' as const }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.107.549 4.09 1.51 5.814L0 24l6.335-1.488A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.017-1.373l-.36-.214-3.733.977.999-3.645-.234-.374A9.817 9.817 0 012.182 12c0-5.415 4.403-9.818 9.818-9.818 5.416 0 9.819 4.403 9.819 9.818 0 5.416-4.403 9.818-9.819 9.818z"/></svg>
            WhatsApp
          </a>
        ) : (
          <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#666' }}>
            Contacta directamente a <strong>{menter.nombre}</strong> para coordinar el pago.
          </div>
        )}
        <button onClick={() => { setShowWhatsappModal(false); onBooked() }}
          style={{ width: '100%', padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxSizing: 'border-box' as const }}>
          Cerrar
        </button>
      </div>
    )
  }

  if (bookingMsg) return (
    <div style={{ padding: '40px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}></div>
      <p style={{ fontSize: 16, color: bookingMsg.startsWith('Error') ? '#c62828' : '#2e7d32', fontWeight: 600, lineHeight: 1.6 }}>{bookingMsg}</p>
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
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>Selecciona el día que quieres tu sesión con <strong>{menter.nombre}</strong>.</p>
          <input type="date" min={today} value={fecha} onChange={e => handleFechaChange(e.target.value)}
            style={{ width: '100%', padding: '14px', border: '2px solid #995bd5', borderRadius: 12, fontSize: 16, fontFamily: 'DM Sans', boxSizing: 'border-box', cursor: 'pointer' }} />
        </div>
      )}

      {/* Step 2: Slots */}
      {step === 'slot' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setStep('fecha'); setSlots([]) }} style={{ background: 'none', border: 'none', color: '#995bd5', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <p style={{ margin: 0, color: '#421869', fontWeight: 600, fontSize: 14 }}>{formatFecha(fecha)}</p>
          </div>
          {slotsLoading && <div style={{ textAlign: 'center', padding: 30, color: '#666' }}>Buscando horarios...</div>}
          {!slotsLoading && slots.length === 0 && (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}></div>
              <p style={{ color: '#666', fontSize: 14 }}>No hay horarios disponibles para este día.<br/>Prueba con otra fecha.</p>
              <button onClick={() => setStep('fecha')} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 30, border: 'none', background: '#421869', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway' }}>Cambiar fecha</button>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{slots.length} horarios disponibles — sesión de {menter.duracion_sesion || 60} min</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 16 }}>
                {slots.map((s, i) => {
                  const sel = selectedSlot?.slot_start === s.slot_start
                  return (
                    <button key={i} onClick={() => setSelectedSlot(s)} style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${sel ? '#421869' : '#e0e0e0'}`, background: sel ? '#421869' : 'white', color: sel ? 'white' : '#2d2926', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {formatTime(s.slot_start)}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => selectedSlot && setStep('confirm')} disabled={!selectedSlot}
                style={{ width: '100%', padding: '12px', borderRadius: 30, border: 'none', background: selectedSlot ? '#ffa719' : '#e0e0e0', color: selectedSlot ? '#2d2926' : '#999', fontWeight: 700, fontSize: 14, cursor: selectedSlot ? 'pointer' : 'not-allowed', fontFamily: 'Raleway' }}>
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
            <button onClick={() => setStep('slot')} style={{ background: 'none', border: 'none', color: '#995bd5', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
            <p style={{ margin: 0, color: '#421869', fontWeight: 600, fontSize: 14 }}>Confirma los detalles</p>
          </div>
          <div style={{ background: '#f3e8ff', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Menter</div><div style={{ fontWeight: 700, color: '#421869', fontSize: 14 }}>{menter.nombre} {menter.apellidos}</div></div>
              <div><div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Fecha</div><div style={{ fontWeight: 600, color: '#2d2926', fontSize: 13 }}>{formatFecha(fecha)}</div></div>
              <div><div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Horario</div><div style={{ fontWeight: 600, color: '#2d2926', fontSize: 13 }}>{formatTime(selectedSlot!.slot_start)} — {formatTime(selectedSlot!.slot_end)}</div></div>
              <div><div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Precio</div><div style={{ fontWeight: 700, color: '#421869', fontSize: 14 }}>{menter.precio_sesion ? `$${menter.precio_sesion} USD` : 'A acordar'}</div></div>
            </div>
          </div>
          {menter.modalidad === 'ambas' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Modalidad</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['video','presencial'] as const).map(mo => (
                  <button key={mo} onClick={() => setModalidad(mo)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${modalidad === mo ? '#421869' : '#e0e0e0'}`, background: modalidad === mo ? '#421869' : 'white', color: modalidad === mo ? 'white' : '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {mo === 'video' ? 'Virtual' : 'Presencial'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {Number(menter.precio_sesion) > 0 && (
            <div style={{ background: '#fff8e1', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1.5px solid #ffa719', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>💬</span>
              <p style={{ fontSize: 13, color: '#e65100', margin: 0, lineHeight: 1.5 }}>
                El pago se coordina directamente con el Menter. Al confirmar te daremos el contacto para acordarlo.
              </p>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Notas para el Menter <span style={{ fontWeight: 400, color: '#999' }}>(opcional)</span></label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Cuéntale brevemente sobre lo que quieres trabajar..." rows={3}
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans', boxSizing: 'border-box', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 30, border: '2px solid #e0e0e0', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleConfirm} disabled={booking} style={{ flex: 2, padding: '12px', borderRadius: 30, border: 'none', background: booking ? 'rgba(255,167,25,0.5)' : '#ffa719', color: '#2d2926', fontWeight: 700, fontSize: 15, cursor: booking ? 'not-allowed' : 'pointer', fontFamily: 'Raleway' }}>
              {booking ? 'Enviando...' : 'Confirmar cita'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}