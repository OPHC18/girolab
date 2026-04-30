'use client'

import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { dispararEmail } from '@/lib/email/send'
import Chart from 'chart.js/auto'
import { useState, useEffect, useRef, useMemo } from 'react'

const ADMIN_EMAILS = [
  'omar@girolab.net',     
  'admin@girolab.net',
  'luana@girolab.net', 
  'daniela@girolab.net', 
  'omarphc@hotmail.com',
]


type AdminTab = 'metricas' | 'personas' | 'empresas' | 'menters' | 'certificados' | 'frases' | 'eventos' | 'blog' | 'comunidad' | 'leads' | 'soporte' | 'pagos' | 'equipo'
type UserRole = 'admin' | 'asesor'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>('admin')
  const [activeTab, setActiveTab] = useState<AdminTab>('metricas')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Datos ──────────────────────────────────────────────────────────────────
  const [metricas, setMetricas] = useState<any>(null)
  const [personas, setPersonas] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [menters, setMenters] = useState<any[]>([])
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('')
  const [modalConfirmPlan, setModalConfirmPlan] = useState<{ menterId: string; plan: string; nombre: string; planAnterior: string } | null>(null)
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [filtroPais, setFiltroPais] = useState('')
  const [filtroMembresia, setFiltroMembresia] = useState('')
  const [mentersStats, setMentersStats] = useState<Record<string, any>>({})
  const [certificados, setCertificados] = useState<any[]>([])
  const [frases, setFrases] = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [comunidadPosts, setComunidadPosts] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [filtroLeadMenter, setFiltroLeadMenter] = useState('')
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [adminReply, setAdminReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [chatToast, setChatToast] = useState<{ nombre: string; mensaje: string } | null>(null)
  const [soporteBadge, setSoporteBadge] = useState(0)
  const [filtroMes, setFiltroMes] = useState('')
  const [syncingBrevo, setSyncingBrevo] = useState(false)
  const selectedChatRef = useRef<any>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<AdminTab>('metricas')
  const notifiedMsgIds = useRef<Set<string>>(new Set())
  const notifiedChatIds = useRef<Set<string>>(new Set())
  const seededRef = useRef(false)

  const playNotifSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }
  const [pagos, setPagos] = useState<any[]>([])
  const [memberships, setMemberships] = useState<any[]>([])
  const [filtroPagos, setFiltroPagos] = useState('')
  const [staff, setStaff] = useState<any[]>([])
  const [nuevoAsesorEmail, setNuevoAsesorEmail] = useState('')
  const [nuevoAsesorNombre, setNuevoAsesorNombre] = useState('')
  const [addingAsesor, setAddingAsesor] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)

  // ── Stats agregados ────────────────────────────────────────────────────────
  const [statsPersonas, setStatsPersonas] = useState<any>(null)
  const [statsEmpresas, setStatsEmpresas] = useState<any>(null)
  const [statsMenters, setStatsMenters] = useState<any>(null)
  const [metricasCitas, setMetricasCitas] = useState<any>(null)
  const [sinRespuesta, setSinRespuesta] = useState<any[]>([])

  // ── Lead scores ────────────────────────────────────────────────────────────
  const [leadScores, setLeadScores] = useState<Record<string, { score: number; factores: Record<string, number> }>>({})
  const [scoringLoading, setScoringLoading] = useState(false)

  const cargarLeadScores = async (role: 'menter' | 'empresa', userIds: string[]) => {
    if (!userIds.length) return
    setScoringLoading(true)
    try {
      const res = await fetch('/api/admin/lead-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, userIds }),
      })
      const { scores } = await res.json()
      if (scores) setLeadScores(prev => ({ ...prev, ...scores }))
    } finally {
      setScoringLoading(false)
    }
  }


  // Filtros Personas
const [filtroPersonaPais, setFiltroPersonaPais] = useState('')
const [filtroPersonaMotivo, setFiltroPersonaMotivo] = useState('')
const [filtroPersonaGenero, setFiltroPersonaGenero] = useState('')

// Filtros Empresas
const [filtroEmpresaPais, setFiltroEmpresaPais] = useState('')
const [filtroEmpresaArea, setFiltroEmpresaArea] = useState('')
const [filtroEmpresaTamano, setFiltroEmpresaTamano] = useState('')

  // ── Búsqueda ───────────────────────────────────────────────────────────────
  const [buscarPersona, setBuscarPersona] = useState('')
  const [buscarEmpresa, setBuscarEmpresa] = useState('')
  const [buscarMenter, setBuscarMenter] = useState('')
  const [authSearch, setAuthSearch] = useState('')
  const [authResults, setAuthResults] = useState<any[]>([])
  const [authSearching, setAuthSearching] = useState(false)

  // ── Forms ──────────────────────────────────────────────────────────────────
  const [fraseForm, setFraseForm] = useState({ frase: '', autor: '' })
  const [frasesTexto, setFrasesTexto] = useState('')
  const [certForm, setCertForm] = useState({
    user_id: '', tipo: 'sesiones_completadas',
    titulo: '', descripcion: '', menter_id: '', pdf_url: ''
  })
  const [loadings, setLoadings] = useState<Record<string, boolean>>({})
  const [modalEvento, setModalEvento] = useState<any>(null)
  const [modalBlog, setModalBlog] = useState<any>(null)

  // ── Chart refs ─────────────────────────────────────────────────────────────
  const chartPaisesPersonasRef   = useRef<HTMLCanvasElement>(null)
  const chartMotivosPersonasRef  = useRef<HTMLCanvasElement>(null)
  const chartPaisesEmpresasRef   = useRef<HTMLCanvasElement>(null)
  const chartPaisesMentersRef    = useRef<HTMLCanvasElement>(null)
  const chartEspecialidadesRef   = useRef<HTMLCanvasElement>(null)
  const chartCitasRef            = useRef<HTMLCanvasElement>(null)
  const chartCrecsRef            = useRef<HTMLCanvasElement>(null)
  const chartsInstances          = useRef<Record<string, any>>({})
  const chartAreasEmpresasRef = useRef<HTMLCanvasElement>(null)
  const chartTamanoEmpresasRef = useRef<HTMLCanvasElement>(null)

  const destroyChart = (key: string) => {
    if (chartsInstances.current[key]) {
      chartsInstances.current[key].destroy()
      delete chartsInstances.current[key]
    }
  }

  const crearBarras = (ref: React.RefObject<HTMLCanvasElement | null>, key: string, labels: string[], data: number[], color: string) => {
  if (!ref.current) return
  destroyChart(key)
  chartsInstances.current[key] = new Chart(ref.current as HTMLCanvasElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: color, borderRadius: 6, barPercentage: 0.6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, stepSize: 1 } },
      }
    }
  })
}

const crearDona = (ref: React.RefObject<HTMLCanvasElement | null>, key: string, labels: string[], data: number[], colors: string[]) => {
  if (!ref.current) return
  destroyChart(key)
  chartsInstances.current[key] = new Chart(ref.current as HTMLCanvasElement, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } } }
    }
  })
}

  const setLoad = (key: string, val: boolean) =>
    setLoadings(prev => ({ ...prev, [key]: val }))

  const toast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      if (ADMIN_EMAILS.includes(session.user.email!)) {
        setUserRole('admin')
        setUser(session.user)
        setLoading(false)
        cargarMetricas()
        return
      }

      // Check if staff (asesor)
      const res = await fetch('/api/admin/staff')
      if (res.ok) {
        const data = await res.json()
        if (data.role === 'asesor') {
          setUserRole('asesor')
          setUser(session.user)
          setActiveTab('soporte')
          setLoading(false)
          cargarChats()
          return
        }
      }

      router.push('/dashboard')
    }
    init()
  }, [])

  useEffect(() => {
    if (!user) return
    if (activeTab === 'personas')      cargarPersonas()
    else if (activeTab === 'empresas') cargarEmpresas()
    else if (activeTab === 'menters')  cargarMenters()
    else if (activeTab === 'certificados') cargarCertificados()
    else if (activeTab === 'frases')   cargarFrases()
    else if (activeTab === 'eventos')  cargarEventos()
    else if (activeTab === 'blog')     cargarBlogs()
    else if (activeTab === 'comunidad') cargarComunidad()
    else if (activeTab === 'leads')     cargarLeads()
    else if (activeTab === 'soporte') { cargarChats(); setSoporteBadge(0) }
    else if (activeTab === 'pagos')     cargarPagos()
    else if (activeTab === 'equipo')    cargarEquipo()
  }, [activeTab, user])

  // ── Gráficas se crean después de que los datos están disponibles ────────────
  useEffect(() => {
    if (activeTab !== 'personas' || !statsPersonas) return
    let id1: number, id2: number
    id1 = requestAnimationFrame(() => { id2 = requestAnimationFrame(() => {
      if (statsPersonas.paises?.length > 0)
        crearBarras(chartPaisesPersonasRef, 'paisesPersonas',
          statsPersonas.paises.slice(0,10).map((p: any) => p.pais),
          statsPersonas.paises.slice(0,10).map((p: any) => p.count),
          '#421869')
      if (statsPersonas.motivos?.length > 0)
        crearDona(chartMotivosPersonasRef, 'motivosPersonas',
          statsPersonas.motivos.slice(0,8).map((m: any) => m.motivo),
          statsPersonas.motivos.slice(0,8).map((m: any) => m.count),
          ['#421869','#995bd5','#ffa719','#1D9E75','#1565c0','#e65100','#633806','#72243E'])
    })})
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2) }
  }, [statsPersonas, activeTab])

  useEffect(() => {
    if (activeTab !== 'menters' || !statsMenters) return
    let id1: number, id2: number
    id1 = requestAnimationFrame(() => { id2 = requestAnimationFrame(() => {
      if (statsMenters.paises?.length > 0)
        crearBarras(chartPaisesMentersRef, 'paisesMenters',
          statsMenters.paises.slice(0, 10).map((p: any) => p.pais),
          statsMenters.paises.slice(0, 10).map((p: any) => p.count),
          '#6a1b9a')
      if (statsMenters.especialidades?.length > 0)
        crearDona(chartEspecialidadesRef, 'especialidades',
          statsMenters.especialidades.slice(0, 8).map((e: any) => e.especialidad),
          statsMenters.especialidades.slice(0, 8).map((e: any) => e.count),
          ['#421869','#995bd5','#ffa719','#1D9E75','#1565c0','#e65100','#633806','#085041'])
    })})
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2) }
  }, [statsMenters, activeTab])

  useEffect(() => {
    if (activeTab !== 'empresas' || !statsEmpresas) return
    let id1: number, id2: number
    id1 = requestAnimationFrame(() => { id2 = requestAnimationFrame(() => {
      if (statsEmpresas.paises?.length > 0)
        crearBarras(chartPaisesEmpresasRef, 'paisesEmpresas',
          statsEmpresas.paises.slice(0,10).map((p: any) => p.pais),
          statsEmpresas.paises.slice(0,10).map((p: any) => p.count),
          '#1565c0')
      if (statsEmpresas.areas?.length > 0)
        crearDona(chartAreasEmpresasRef, 'areasEmpresas',
          statsEmpresas.areas.slice(0,8).map((a: any) => a.area),
          statsEmpresas.areas.slice(0,8).map((a: any) => a.count),
          ['#1565c0','#42a5f5','#ffa719','#421869','#1D9E75','#e65100','#633806','#085041'])
      if (statsEmpresas.tamanos?.length > 0)
        crearBarras(chartTamanoEmpresasRef, 'tamanoEmpresas',
          statsEmpresas.tamanos.map((t: any) => t.tamano),
          statsEmpresas.tamanos.map((t: any) => t.count),
          '#085041')
    })})
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2) }
  }, [statsEmpresas, activeTab])

  useEffect(() => {
    if (activeTab !== 'metricas' || !metricasCitas) return
    let id1: number, id2: number
    id1 = requestAnimationFrame(() => { id2 = requestAnimationFrame(() => {
      if (metricasCitas.porEstado)
        crearDona(chartCitasRef, 'citasEstado',
          Object.keys(metricasCitas.porEstado),
          Object.values(metricasCitas.porEstado) as number[],
          ['#1D9E75','#421869','#ffa719','#c62828','#666','#6a1b9a'])
    })})
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2) }
  }, [metricasCitas, activeTab])

  // ── Loaders ────────────────────────────────────────────────────────────────
  const cargarMetricas = async () => {
    const [
      { count: totalPersonas },
      { count: totalEmpresas },
      { count: totalMenters },
      { count: totalCitas },
      { count: totalEventos },
      { count: totalBlogs },
      { data: citasData },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('menter_memberships').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('status'),
    ])

    // Citas por estado
    const porEstado: Record<string, number> = {}
    ;(citasData || []).forEach((c: any) => {
      const label = c.status === 'confirmada' ? 'Confirmada'
        : c.status === 'completada' ? 'Completada'
        : c.status === 'pendiente' ? 'Pendiente'
        : c.status === 'cancelada' ? 'Cancelada'
        : c.status === 'rechazada' ? 'Rechazada'
        : 'Reprogramación'
      porEstado[label] = (porEstado[label] || 0) + 1
    })

    setMetricas({ totalPersonas, totalEmpresas, totalMenters, totalCitas, totalEventos, totalBlogs })
    setMetricasCitas({ porEstado, total: citasData?.length || 0 })

    // Solicitudes sin respuesta (pendiente > 24h)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: sinResp } = await supabase
      .from('appointments')
      .select('id, menter_id, menter_name, client_name, date, start_time, created_at')
      .eq('status', 'pendiente')
      .lt('created_at', cutoff)
      .order('created_at', { ascending: true })
    setSinRespuesta(sinResp || [])
  }

  const contarCampo = (arr: any[], campo: string) => {
    const map: Record<string, number> = {}
    arr.forEach(item => {
      const val = item[campo] || 'Sin especificar'
      map[val] = (map[val] || 0) + 1
    })
    return Object.entries(map)
      .map(([key, count]) => ({ [campo]: key, count }))
      .sort((a: any, b: any) => b.count - a.count)
  }

 const cargarPersonas = async () => {
  setLoad('personas', true)
  const res = await fetch('/api/admin/users-data?role=persona')
  const { users: usersData } = await res.json()

  // Fetch respuestas from auth.user_metadata via admin API
  const metaRes = await fetch('/api/admin/users-metadata').then(r => r.json()).catch(() => ({ users: [] }))
  const perfilesMap: Record<string, any> = {}
  ;(metaRes.users || []).forEach((p: any) => { if (p.respuestas) perfilesMap[p.id] = p.respuestas })

  const soloPersonas = (usersData || [])
    .filter((u: any) => !u.role || u.role === 'persona')
    .map((u: any) => ({
      ...u,
      respuestas: { ...(u.respuestas || {}), ...(perfilesMap[u.id] || {}) },
    }))

  setPersonas(soloPersonas)

  // Stats de países
  const paises = contarCampo(soloPersonas, 'pais')

  // Motivos y género desde respuestas del onboarding
  const motivosMap: Record<string, number> = {}
  const generoMap: Record<string, number> = {}

  soloPersonas.forEach((u: any) => {
    const resp = u.respuestas || {}
    // Motivos — campo 'motivo' (singular) en el onboarding
    const motivos = Array.isArray(resp.motivo) ? resp.motivo : []
    motivos.forEach((m: string) => {
      motivosMap[m] = (motivosMap[m] || 0) + 1
    })
    // Género — campo 'genero', es un array de un elemento
    const genero = Array.isArray(resp.genero) ? resp.genero[0] : resp.genero
    if (genero) generoMap[genero] = (generoMap[genero] || 0) + 1
  })

  const motivos = Object.entries(motivosMap)
    .map(([motivo, count]) => ({ motivo, count }))
    .sort((a, b) => b.count - a.count)

  const generos = Object.entries(generoMap)
    .map(([genero, count]) => ({ genero, count }))
    .sort((a, b) => b.count - a.count)

  // Stats de citas
  const { data: citasPersonas } = await supabase
    .from('appointments')
    .select('client_id')
    .limit(500)

  const citasPorPersona = (citasPersonas || []).reduce((acc: Record<string, number>, c: any) => {
    acc[c.client_id] = (acc[c.client_id] || 0) + 1
    return acc
  }, {})
  const promCitas = Object.values(citasPorPersona).length > 0
    ? (Object.values(citasPorPersona).reduce((a: any, b: any) => a + b, 0) / Object.values(citasPorPersona).length).toFixed(1)
    : 0

  setStatsPersonas({
    total: soloPersonas.length,
    paises,
    motivos,
    generos,
    promCitas,
    totalCitas: citasPersonas?.length || 0,
  })
  setLoad('personas', false)
}

const cargarEmpresas = async () => {
  setLoad('empresas', true)
  const res = await fetch('/api/admin/users-data?role=empresa')
  const { users: data } = await res.json()

  // Fetch respuestas from auth.user_metadata (igual que cargarPersonas)
  const metaRes = await fetch('/api/admin/users-metadata').then(r => r.json()).catch(() => ({ users: [] }))
  const perfilesMap: Record<string, any> = {}
  ;(metaRes.users || []).forEach((p: any) => { if (p.respuestas) perfilesMap[p.id] = p.respuestas })

  const soloEmpresas = (data || []).map((u: any) => ({
    ...u,
    respuestas: { ...(u.respuestas || {}), ...(perfilesMap[u.id] || {}) },
  }))
  setEmpresas(soloEmpresas)
  cargarLeadScores('empresa', soloEmpresas.map((e: any) => e.id))

  // Stats de países
  const paises = contarCampo(soloEmpresas, 'pais')

  // Stats de áreas
  const areasMap: Record<string, number> = {}
  soloEmpresas.forEach((u: any) => {
    const raw = u.respuestas?.areas ?? u.areas ?? u.respuestas?.area ?? []
    const areas = Array.isArray(raw) ? raw : (raw ? [raw] : [])
    areas.forEach((area: string) => {
      areasMap[area] = (areasMap[area] || 0) + 1
    })
  })
  const areas = Object.entries(areasMap)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)

  // Stats de tamaño
  const tamanoMap: Record<string, number> = {}
  soloEmpresas.forEach((u: any) => {
    const raw = u.respuestas?.tamano ?? u.tamano ?? u.respuestas?.empresa_tamano ?? []
    const tamanos = Array.isArray(raw) ? raw : (raw ? [raw] : [])
    tamanos.forEach((t: string) => {
      tamanoMap[t] = (tamanoMap[t] || 0) + 1
    })
  })
  const tamanos = Object.entries(tamanoMap)
    .map(([tamano, count]) => ({ tamano, count }))
    .sort((a, b) => b.count - a.count)

  setStatsEmpresas({ total: soloEmpresas.length, paises, areas, tamanos })
  setLoad('empresas', false)
}

const cargarMenters = async () => {
  setLoad('menters', true)

  // Query 1 — perfil básico
  const { data: menterData } = await supabase
    .from('menter_public_profiles')
    .select('*')
    .limit(200)

  if (!menterData || menterData.length === 0) {
    setMenters([])
    setStatsMenters({ total: 0, paises: [], especialidades: [], porPlan: {} })
    setLoad('menters', false)
    return
  }

  const menterIds = menterData.map((m: any) => m.id)

  // Query 2 — memberships, insignias, citas, eventos, perfiles detallados
  const [
    { data: memberships },
    { data: insigniasData },
    { data: citasData },
    { data: eventosData },
    { data: perfilesData },
    { data: emailsData },
  ] = await Promise.all([
    supabase.from('menter_memberships').select('menter_id, plan, is_active').in('menter_id', menterIds),
    supabase.from('menter_insignias').select('menter_id, insignia_id').in('menter_id', menterIds),
    supabase.from('appointments').select('menter_id, status').in('menter_id', menterIds),
    supabase.from('events').select('menter_id').in('menter_id', menterIds),
    supabase.from('menter_profile').select('menter_id, pais, casos_que_atiende, telefono').in('menter_id', menterIds),
    fetch(`/api/admin/users-data?ids=${menterIds.join(',')}`).then(r => r.json()).then(d => ({ data: d.users })),
  ])

  const mentersCompletos = menterData.map((m: any) => {
  const perfil = perfilesData?.find((p: any) => p.menter_id === m.id)
  return {
    ...m,
    menter_id: m.id,
    pais: perfil?.pais || null,
    telefono: perfil?.telefono || null,
    email: emailsData?.find((e: any) => e.id === m.id)?.email || null,
    casos_que_atiende: perfil?.casos_que_atiende || [],
    menter_memberships: memberships?.filter((mb: any) => mb.menter_id === m.id) || [],
    insignias_ganadas: (insigniasData || [])
      .filter((i: any) => i.menter_id === m.id)
      .map((i: any) => i.insignia_id),
  }
})
  setMenters(mentersCompletos)
  cargarLeadScores('menter', menterIds)

  // Stats de citas por menter
  const stats: Record<string, any> = {}
  menterIds.forEach((id: string) => {
    const mCitas = (citasData || []).filter((c: any) => c.menter_id === id)
    stats[id] = {
      completadas:   mCitas.filter((c: any) => c.status === 'completada').length,
      confirmadas:   mCitas.filter((c: any) => c.status === 'confirmada').length,
      pendientes:    mCitas.filter((c: any) => c.status === 'pendiente').length,
      canceladas:    mCitas.filter((c: any) => c.status === 'cancelada').length,
      rechazadas:    mCitas.filter((c: any) => c.status === 'rechazada').length,
      reprogramadas: mCitas.filter((c: any) => c.status === 'reprogramacion_pendiente').length,
      total_citas:   mCitas.length,
      total_eventos: (eventosData || []).filter((e: any) => e.menter_id === id).length,
    }
  })
  setMentersStats(stats)

  // Stats agregados
  const paises = contarCampo(mentersCompletos, 'pais')
  // Reemplaza el bloque de especialidadesMap:
const especialidadesMap: Record<string, number> = {}
mentersCompletos.forEach((m: any) => {
  ;(m.casos_que_atiende || []).forEach((caso: string) => {
    especialidadesMap[caso] = (especialidadesMap[caso] || 0) + 1
  })
})
const especialidades = Object.entries(especialidadesMap)
  .map(([especialidad, count]) => ({ especialidad, count }))
  .sort((a, b) => b.count - a.count)

  const porPlan: Record<string, number> = { free: 0, starter: 0, premium: 0, master: 0 }
  mentersCompletos.forEach((m: any) => {
    const plan = m.menter_memberships?.[0]?.plan || 'free'
    porPlan[plan] = (porPlan[plan] || 0) + 1
  })

  setStatsMenters({ total: mentersCompletos.length, paises, especialidades, porPlan })
  setLoad('menters', false)
}

  const cargarCertificados = async () => {
    setLoad('certificados', true)
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false }).limit(100)
    setCertificados(data || [])
    setLoad('certificados', false)
  }

  const cargarFrases = async () => {
    setLoad('frases', true)
    const { data } = await supabase.from('frases_del_dia').select('*').order('fecha', { ascending: true })
    setFrases(data || [])
    setLoad('frases', false)
  }

  const cargarEventos = async () => {
    setLoad('eventos', true)
    const { data } = await supabase
      .from('events')
      .select('*, menter:menter_public_profiles(nombre, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(100)
    setEventos(data || [])
    setLoad('eventos', false)
  }

  const cargarBlogs = async () => {
    setLoad('blogs', true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*, menter:menter_public_profiles(nombre, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(100)
    setBlogs(data || [])
    setLoad('blogs', false)
  }

  const cargarComunidad = async () => {
    setLoad('comunidad', true)
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)
    setComunidadPosts(data || [])
    setLoad('comunidad', false)
  }

  const cargarChats = async () => {
    setLoad('soporte', true)
    const res = await fetch('/api/chat?all=1')
    const { chats: data } = await res.json()
    setChats(data || [])
    setLoad('soporte', false)
  }

  // Polling soporte: actualiza chats y mensajes cada 4s cuando hay usuario admin
  useEffect(() => {
    selectedChatRef.current = selectedChat
  }, [selectedChat])

  useEffect(() => {
    activeTabRef.current = activeTab
    if (activeTab === 'soporte') setSoporteBadge(0)
  }, [activeTab])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChat?.support_messages?.length])

  useEffect(() => {
    if (!user) return
    const poll = async () => {
      const res = await fetch('/api/chat?all=1')
      if (!res.ok) return
      const { chats: fresh } = await res.json()
      if (!fresh) return

      setChats(prev => {
        // Primera carga: seed de IDs existentes sin notificar
        if (!seededRef.current) {
          seededRef.current = true
          fresh.forEach((fc: any) => {
            notifiedChatIds.current.add(fc.id)
            ;(fc.support_messages || []).forEach((msg: any) => notifiedMsgIds.current.add(msg.id))
          })
          return fresh
        }

        fresh.forEach((fc: any) => {
          const existing = prev.find((c: any) => c.id === fc.id)
          const onSoporte = activeTabRef.current === 'soporte'

          // Chat nuevo
          if (!existing && !notifiedChatIds.current.has(fc.id)) {
            notifiedChatIds.current.add(fc.id)
            if (!onSoporte) {
              setChatToast({ nombre: fc.user_name || 'Nuevo usuario', mensaje: 'Inició un chat de soporte' })
              setSoporteBadge(b => b + 1)
              setTimeout(() => setChatToast(null), 5000)
              playNotifSound()
            }
          }

          // Mensajes nuevos del usuario
          const msgs: any[] = fc.support_messages || []
          msgs.forEach((msg: any) => {
            if (msg.sender === 'user' && !notifiedMsgIds.current.has(msg.id)) {
              notifiedMsgIds.current.add(msg.id)
              if (!onSoporte) {
                setChatToast({ nombre: fc.user_name || 'Usuario', mensaje: msg.content })
                setSoporteBadge(b => b + 1)
                setTimeout(() => setChatToast(null), 5000)
                playNotifSound()
              }
            }
          })
        })
        return fresh
      })

      // Actualizar chat seleccionado con mensajes frescos
      if (selectedChatRef.current) {
        const updated = fresh.find((c: any) => c.id === selectedChatRef.current.id)
        if (updated) setSelectedChat(updated)
      }
    }

    poll()
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [user])

  const sendAdminReply = async () => {
    if (!selectedChat || !adminReply.trim()) return
    setSendingReply(true)
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', chat_id: selectedChat.id, sender: 'admin', content: adminReply.trim() }),
    })
    setAdminReply('')
    // Refrescar mensajes del chat seleccionado
    const res = await fetch(`/api/chat?chat_id=${selectedChat.id}`)
    const { messages } = await res.json()
    setSelectedChat((prev: any) => ({ ...prev, support_messages: messages }))
    setSendingReply(false)
  }

  const closeChat = async (chat_id: string) => {
    await fetch('/api/chat', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, status: 'closed' }),
    })
    setChats(prev => prev.map(c => c.id === chat_id ? { ...c, status: 'closed' } : c))
    if (selectedChat?.id === chat_id) setSelectedChat((prev: any) => ({ ...prev, status: 'closed' }))
  }

  const cargarEquipo = async () => {
    setLoad('equipo', true)
    const res = await fetch('/api/admin/staff')
    if (res.ok) { const { staff: data } = await res.json(); setStaff(data || []) }
    setLoad('equipo', false)
  }

  const agregarAsesor = async () => {
    if (!nuevoAsesorEmail.trim()) return
    setAddingAsesor(true)
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nuevoAsesorEmail.trim(), nombre: nuevoAsesorNombre.trim() }),
    })
    const data = await res.json()
    setAddingAsesor(false)
    if (data.ok) {
      toast('Asesor agregado')
      setNuevoAsesorEmail(''); setNuevoAsesorNombre('')
      cargarEquipo()
    } else {
      toast(data.error || 'Error al agregar')
    }
  }

  const eliminarAsesor = async (user_id: string) => {
    await fetch('/api/admin/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    })
    setStaff(prev => prev.filter(s => s.user_id !== user_id))
    toast('Asesor eliminado')
  }

  const cargarPagos = async () => {
    setLoad('pagos', true)
    const res = await fetch('/api/admin/payments')
    if (res.ok) {
      const data = await res.json()
      setPagos(data.payments || [])
      setMemberships(data.memberships || [])
    }
    setLoad('pagos', false)
  }

  const cargarLeads = async () => {
    setLoad('leads', true)
    const { data } = await supabase
      .from('assessment_sessions')
      .select('id, persona_nombre, persona_email, instrument_id, menter_id, created_at, metadata, menter:menter_public_profiles(nombre)')
      .not('persona_email', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500)
    setLeads(data || [])
    setLoad('leads', false)
  }

  const eliminarPostAdmin = async (postId: string) => {
    if (!confirm('¿Eliminar este post y todos sus comentarios?')) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/community/comment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ post_id: postId }),
    })
    setComunidadPosts(prev => prev.filter(p => p.id !== postId))
    toast('🗑️ Post eliminado')
  }

  const lanzarSeed = async () => {
    if (!confirm('¿Crear 4 Menters demo y posts de prueba? Esto no se puede deshacer.')) return
    setSeedLoading(true)
    const res = await fetch('/api/admin/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '' },
    })
    const data = await res.json()
    setSeedLoading(false)
    if (res.ok) toast(`✅ Seed completado: ${data.message}`)
    else toast(`❌ Error: ${data.error}`)
  }

  // ── Actions ────────────────────────────────────────────────────────────────
 const solicitarCambioPlan = (menterId: string, plan: string, nombre: string, planAnterior: string) => {
  if (plan === planAnterior) return
  setModalConfirmPlan({ menterId, plan, nombre, planAnterior })
  setPasswordConfirm('')
  setPasswordError('')
}

const eliminarUsuarioAdmin = async (userId: string, userEmail: string, userName: string) => {
  const ok = window.confirm(`¿Eliminar la cuenta de ${userName} (${userEmail})?\n\nSe borrarán TODOS sus datos y recibirán un correo de notificación.`)
  if (!ok) return

  const res = await fetch('/api/account/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (res.ok) {
    setPersonas(prev => prev.filter(u => u.id !== userId))
    setEmpresas(prev => prev.filter(u => u.id !== userId))
    setMenters(prev => prev.filter(u => u.menter_id !== userId))
    toast(`✓ Cuenta de ${userName} eliminada`)
  } else {
    const errData = await res.json().catch(() => ({ error: 'Error desconocido' }))
    alert(`Error al eliminar: ${errData.error}`)
  }
}

const confirmarCambioPlan = async () => {
  if (!modalConfirmPlan) return
  setLoad('confirmPlan', true)

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: passwordConfirm,
  })

  if (authError) {
    setPasswordError('❌ Contraseña incorrecta')
    setLoad('confirmPlan', false)
    return
  }

  const { error } = await supabase
    .from('menter_memberships')
    .update({ plan: modalConfirmPlan.plan, updated_at: new Date().toISOString() })
    .eq('menter_id', modalConfirmPlan.menterId)

  setLoad('confirmPlan', false)

  if (!error) {
    setMenters(prev => prev.map(m => m.menter_id === modalConfirmPlan.menterId
      ? { ...m, menter_memberships: [{ ...m.menter_memberships?.[0], plan: modalConfirmPlan.plan }] }
      : m))
    setModalConfirmPlan(null)
    setPasswordConfirm('')
    toast('✅ Plan actualizado correctamente')
  } else {
    toast('❌ Error al actualizar plan')
  }
}

  const asignarInsignia = async (menterId: string, insigniaId: string) => {
    await supabase.from('menter_insignias')
      .upsert({ menter_id: menterId, insignia_id: insigniaId, otorgada_por: 'admin' },
        { onConflict: 'menter_id,insignia_id' })
    toast('🏅 Insignia asignada')
    cargarMenters()
  }

  const quitarInsignia = async (menterId: string, insigniaId: string) => {
    await supabase.from('menter_insignias').delete()
      .eq('menter_id', menterId).eq('insignia_id', insigniaId)
    toast('🗑️ Insignia removida')
    cargarMenters()
  }

  const activarFrase = async (id: string) => {
    await supabase.from('frases_del_dia').update({ activa: false }).neq('id', id)
    await supabase.from('frases_del_dia').update({ activa: true }).eq('id', id)
    setFrases(prev => prev.map(f => ({ ...f, activa: f.id === id })))
    toast('✅ Frase del día activada')
  }

  const eliminarFrase = async (id: string) => {
    await supabase.from('frases_del_dia').delete().eq('id', id)
    setFrases(prev => prev.filter(f => f.id !== id))
    toast('🗑️ Frase eliminada')
  }

  const agregarFrase = async () => {
    if (!fraseForm.frase.trim()) return
    setLoad('addFrase', true)
    await supabase.from('frases_del_dia').insert({
      frase: fraseForm.frase.trim(),
      autor: fraseForm.autor.trim() || null,
      activa: false,
    })
    setLoad('addFrase', false)
    setFraseForm({ frase: '', autor: '' })
    cargarFrases()
    toast('✅ Frase agregada')
  }

  const cargarFrasesAnuales = async () => {
    const lineas = frasesTexto.trim().split('\n').filter(l => l.trim())
    if (lineas.length === 0) return
    setLoad('cargaMasiva', true)
    const inserts = lineas.map((linea, i) => {
      const partes = linea.split('|')
      const frase = partes[0].trim()
      const autor = partes[1]?.trim() || null
      const fecha = new Date(new Date().getFullYear(), 0, i + 1).toISOString().split('T')[0]
      return { frase, autor, fecha, activa: false }
    })
    const { error } = await supabase.from('frases_del_dia').insert(inserts)
    setLoad('cargaMasiva', false)
    if (!error) { setFrasesTexto(''); cargarFrases(); toast(`✅ ${inserts.length} frases cargadas`) }
    else toast('❌ Error al cargar frases')
  }

  const cambiarStatusEvento = async (id: string, status: string) => {
    await supabase.from('events').update({ status }).eq('id', id)
    setEventos(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    if (modalEvento?.id === id) setModalEvento((prev: any) => ({ ...prev, status }))
    toast(`✅ Evento ${status === 'publicado' ? 'publicado' : 'despublicado'}`)
  }

  const eliminarEvento = async (id: string) => {
    if (!confirm('¿Eliminar este evento permanentemente? Se notificará a todos los inscritos.')) return
    // Notificar a inscritos antes de eliminar
    const eventoData = eventos.find((e: any) => e.id === id)
    if (eventoData) {
      const { data: regs } = await supabase
        .from('event_registrations')
        .select('user_id, payment_status')
        .eq('event_id', id)
      if (regs && regs.length > 0) {
        const userIds = regs.map((r: any) => r.user_id)
        const { users: usersData } = await fetch(`/api/admin/users-data?ids=${userIds.join(',')}`).then(r => r.json())
        const eventoFecha = new Date(eventoData.date + 'T00:00:00').toLocaleDateString('es-PE', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
        for (const u of (usersData || [])) {
          const reg = regs.find((r: any) => r.user_id === u.id)
          dispararEmail('evento_cancelado', {
            clientName:   u.nombre || u.email.split('@')[0],
            clientEmail:  u.email,
            eventoTitulo: eventoData.title,
            eventoFecha,
            tuvioPago:    reg?.payment_status === 'pagado',
          })
        }
      }
    }
    await supabase.from('events').delete().eq('id', id)
    setEventos(prev => prev.filter((e: any) => e.id !== id))
    setModalEvento(null)
    toast('Evento eliminado')
  }

  const cambiarStatusBlog = async (id: string, status: string) => {
    await supabase.from('blog_posts').update({ status }).eq('id', id)
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    if (modalBlog?.id === id) setModalBlog((prev: any) => ({ ...prev, status }))
    toast(`✅ Post ${status === 'publicado' ? 'publicado' : 'despublicado'}`)
  }

  const eliminarBlog = async (id: string) => {
    if (!confirm('¿Eliminar este post permanentemente?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    setBlogs(prev => prev.filter(b => b.id !== id))
    setModalBlog(null)
    toast('🗑️ Post eliminado')
  }

  const crearCertificado = async () => {
    if (!certForm.user_id || !certForm.titulo) return
    setLoad('cert', true)
    const { error } = await supabase.from('certificates').insert({
      user_id: certForm.user_id, tipo: certForm.tipo,
      titulo: certForm.titulo, descripcion: certForm.descripcion || null,
      menter_id: certForm.menter_id || null,
      pdf_url: certForm.pdf_url || null, emitido_por: 'Giro Lab',
    })
    setLoad('cert', false)
    if (!error) {
      setCertForm({ user_id: '', tipo: 'sesiones_completadas', titulo: '', descripcion: '', menter_id: '', pdf_url: '' })
      cargarCertificados()
      toast('✅ Certificado creado y asignado')
    } else toast('❌ Error: verifica el UUID del usuario')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#421869' }}>
      <div style={{ color: 'white', fontSize: 18 }}>Verificando acceso...</div>
    </div>
  )

  // ── Constantes UI ──────────────────────────────────────────────────────────
  const PLANES_COLOR: Record<string, { color: string; bg: string; emoji: string }> = {
    free:    { color: '#666',    bg: '#f0f0f0', emoji: '🌱' },
    starter: { color: '#1565c0', bg: '#e3f2fd', emoji: '⚡' },
    premium: { color: '#6a1b9a', bg: '#f3e5f5', emoji: '💎' },
    master:  { color: '#e65100', bg: '#fff3e0', emoji: '👑' },
  }

  const INSIGNIAS = [
    { id: 'menter_destacado', label: 'Destacado' },
    { id: 'red_activa',       label: 'Red activa' },
    { id: 'guia_constante',   label: 'Guía constante' },
    { id: 'transformador',    label: 'Transformador' },
    { id: 'maestro',          label: 'Maestro' },
    { id: 'chispa',           label: 'Chispa GL' },
  ]

  const tabs: { id: AdminTab; label: string; emoji: string }[] = [
    { id: 'metricas',     label: 'Métricas',     emoji: '📊' },
    { id: 'personas',     label: 'Personas',     emoji: '👤' },
    { id: 'empresas',     label: 'Empresas',     emoji: '🏢' },
    { id: 'menters',      label: 'Menters',      emoji: '⭐' },
    { id: 'certificados', label: 'Certificados', emoji: '🏅' },
    { id: 'frases',       label: 'Frases',       emoji: '✨' },
    { id: 'eventos',      label: 'Eventos',      emoji: '🎪' },
    { id: 'blog',         label: 'Blog',         emoji: '📝' },
    { id: 'comunidad',    label: 'Comunidad',    emoji: '💬' },
    { id: 'leads',        label: 'Leads',        emoji: '🎯' },
    { id: 'soporte',      label: 'Soporte',      emoji: '💬' },
    { id: 'pagos',        label: 'Pagos',        emoji: '💳' },
    { id: 'equipo',       label: 'Equipo',       emoji: '👥' },
  ]

  const visibleTabs = userRole === 'asesor'
    ? tabs.filter(t => t.id === 'soporte' || t.id === 'pagos')
    : tabs

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { label: string; color: string; bg: string }> = {
      publicado:              { label: '✅ Publicado',      color: '#1b5e20', bg: '#e8f5e9' },
      borrador:               { label: '📝 Borrador',       color: '#e65100', bg: '#fff8e1' },
      pendiente:              { label: '⏳ Pendiente',      color: '#e65100', bg: '#fff8e1' },
      confirmada:             { label: '✅ Confirmada',     color: '#1b5e20', bg: '#e8f5e9' },
      completada:             { label: '🏁 Completada',     color: '#1565c0', bg: '#e3f2fd' },
      cancelada:              { label: '❌ Cancelada',      color: '#b71c1c', bg: '#ffebee' },
      rechazada:              { label: '🚫 Rechazada',      color: '#b71c1c', bg: '#ffebee' },
      reprogramacion_pendiente: { label: '📆 Reprogramación', color: '#6a1b9a', bg: '#f3e5f5' },
    }
    const c = cfg[status] || { label: status, color: '#666', bg: '#f0f0f0' }
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>
  }

  const KpiCard = ({ emoji, label, value, color, onClick }: any) => (
    <div onClick={onClick} style={{
      background: 'white', borderRadius: 16, padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`,
      cursor: onClick ? 'pointer' : 'default',
    }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
      {onClick && <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>Ver detalle →</div>}
    </div>
  )

  const MenterCharts = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>🌍 Países de Menters</h4>
      <div style={{ position: 'relative', height: 220 }}>
        <canvas ref={chartPaisesMentersRef} />
      </div>
    </div>
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>🎯 Casos que atienden</h4>
      <div style={{ position: 'relative', height: 220 }}>
        <canvas ref={chartEspecialidadesRef} />
      </div>
    </div>
  </div>
)

  const ChartBox = ({ title, height = 220, children }: any) => (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>{title}</h4>
      <div style={{ position: 'relative', height }}>{children}</div>
    </div>
  )

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#421869', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, boxShadow: '0 2px 12px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Dashboard</button>
          <h1 style={{ margin: 0, color: 'white', fontFamily: 'Raleway, sans-serif', fontSize: 18, fontWeight: 900 }}>⚙️ Panel Admin — Giro Lab</h1>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user?.email}</span>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '0 32px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {visibleTabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400,
            color: activeTab === t.id ? '#421869' : '#666',
            borderBottom: activeTab === t.id ? '3px solid #421869' : '3px solid transparent',
            whiteSpace: 'nowrap' as const, fontFamily: 'DM Sans',
          }}>
            {t.emoji} {t.label}
            {t.id === 'soporte' && soporteBadge > 0 && (
              <span style={{ marginLeft: 6, background: '#e53935', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{soporteBadge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Toast notificación en pantalla */}
      {chatToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: 'linear-gradient(135deg,#421869,#7b2fd4)', color: 'white', borderRadius: 16, padding: '14px 20px', boxShadow: '0 8px 32px rgba(66,24,105,0.35)', maxWidth: 320, fontFamily: 'DM Sans', animation: 'slideUp 0.3s ease' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Nuevo mensaje — {chatToast.nombre}</div>
          <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>{chatToast.mensaje.slice(0, 80)}{chatToast.mensaje.length > 80 ? '…' : ''}</div>
          <button onClick={() => { setActiveTab('soporte'); setChatToast(null) }} style={{ marginTop: 10, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 20, padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Ver chat</button>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 12px' : '32px' }}>

        {/* ═══ MÉTRICAS ═══ */}
        {activeTab === 'metricas' && (
          <div>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>📊 Resumen general</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
              <KpiCard emoji="👤" label="Personas"        value={metricas?.totalPersonas}  color="#421869" onClick={() => setActiveTab('personas')} />
              <KpiCard emoji="🏢" label="Empresas"        value={metricas?.totalEmpresas}  color="#1565c0" onClick={() => setActiveTab('empresas')} />
              <KpiCard emoji="⭐" label="Menters activos" value={metricas?.totalMenters}   color="#6a1b9a" onClick={() => setActiveTab('menters')} />
              <KpiCard emoji="📅" label="Citas totales"   value={metricas?.totalCitas}     color="#085041" />
              <KpiCard emoji="🎪" label="Eventos"         value={metricas?.totalEventos}   color="#e65100" onClick={() => setActiveTab('eventos')} />
              <KpiCard emoji="📝" label="Posts blog"      value={metricas?.totalBlogs}     color="#633806" onClick={() => setActiveTab('blog')} />
            </div>

            {/* Gráfica citas por estado — canvas always in DOM for stable Chart.js ref */}
            <div style={{ display: metricasCitas ? 'grid' : 'none', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <ChartBox title="📅 Citas por estado" height={260}>
                <canvas ref={chartCitasRef} />
              </ChartBox>
              <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>📋 Desglose de citas</h4>
                {Object.entries(metricasCitas?.porEstado ?? {}).map(([estado, count]) => (
                  <div key={estado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <StatusBadge status={estado.toLowerCase().replace(/ /g, '_')} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#421869' }}>{count as number}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '2px solid #421869' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#421869' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#421869' }}>{metricasCitas?.total ?? 0}</span>
                </div>
              </div>
            </div>

            {/* ── Solicitudes sin respuesta (pendiente > 24h) ── */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Raleway', color: '#c62828', margin: 0, fontSize: 16 }}>
                  🚨 Solicitudes sin respuesta del Menter (&gt;24 h)
                </h3>
                <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: sinRespuesta.length > 0 ? '#ffebee' : '#e8f5e9', color: sinRespuesta.length > 0 ? '#c62828' : '#2e7d32' }}>
                  {sinRespuesta.length}
                </span>
              </div>
              {sinRespuesta.length === 0 ? (
                <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '16px 20px', color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>
                  Todos los Menters están respondiendo a tiempo.
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#fff3e0' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#e65100' }}>Menter</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#e65100' }}>Cliente</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#e65100' }}>Fecha solicitada</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#e65100' }}>Solicitud enviada</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#e65100' }}>Horas sin respuesta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sinRespuesta.map((c, i) => {
                        const horas = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60))
                        return (
                          <tr key={c.id} style={{ borderTop: '1px solid #f5f5f5', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                            <td style={{ padding: '10px 16px', fontWeight: 600, color: '#421869' }}>{c.menter_name || c.menter_id?.slice(0, 8)}</td>
                            <td style={{ padding: '10px 16px', color: '#333' }}>{c.client_name || '—'}</td>
                            <td style={{ padding: '10px 16px', color: '#555' }}>
                              {new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                              {c.start_time && ` · ${c.start_time.slice(0,5)}`}
                            </td>
                            <td style={{ padding: '10px 16px', color: '#555' }}>
                              {new Date(c.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                              {' '}{new Date(c.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: horas >= 48 ? '#ffebee' : '#fff3e0', color: horas >= 48 ? '#c62828' : '#e65100' }}>
                                {horas} h
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: '12px 16px', background: '#fff8e1', fontSize: 12, color: '#795548' }}>
                    Las solicitudes pendientes &gt;24 h se cancelan automáticamente por el cron job. Este reporte es en tiempo real.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ PERSONAS ═══ */}
        {activeTab === 'personas' && (
          <div>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>👤 Personas</h2>

            {/* KPIs */}
            {statsPersonas && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                <KpiCard emoji="👤" label="Total personas"    value={statsPersonas.total}       color="#421869" />
                <KpiCard emoji="📅" label="Total citas"       value={statsPersonas.totalCitas}   color="#085041" />
                <KpiCard emoji="📊" label="Promedio citas/persona" value={statsPersonas.promCitas} color="#6a1b9a" />
              </div>
            )}

            {/* Gráficas — canvas always in DOM */}
            <div style={{ display: statsPersonas ? 'grid' : 'none', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 28 }}>
              <ChartBox title="🌍 Distribución por país" height={200}>
                <canvas ref={chartPaisesPersonasRef} />
              </ChartBox>
              <ChartBox title="🎯 Motivos de consulta (por casos atendidos)" height={200}>
                <canvas ref={chartMotivosPersonasRef} />
              </ChartBox>
            </div>

            {/* Tabla */}
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#421869' }}>Lista de personas</span>
                <input placeholder="Buscar..." value={buscarPersona} onChange={e => setBuscarPersona(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, width: 220, fontFamily: 'DM Sans' }} />
            </div>

            {/* Filtros Personas */}
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#f8f9fa' }}>
  <select value={filtroPersonaPais} onChange={e => setFiltroPersonaPais(e.target.value)}
    style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
    <option value="">Todos los países</option>
    {statsPersonas?.paises.filter((p: any) => p.pais !== 'Sin especificar').map((p: any) => (
      <option key={p.pais} value={p.pais}>{p.pais} ({p.count})</option>
    ))}
  </select>
  <select value={filtroPersonaMotivo} onChange={e => setFiltroPersonaMotivo(e.target.value)}
    style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
    <option value="">Todos los motivos</option>
    {statsPersonas?.motivos.map((m: any) => (
      <option key={m.motivo} value={m.motivo}>{m.motivo} ({m.count})</option>
    ))}
  </select>
  <select value={filtroPersonaGenero} onChange={e => setFiltroPersonaGenero(e.target.value)}
    style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
    <option value="">Todos los géneros</option>
    {statsPersonas?.generos?.map((g: any) => (
      <option key={g.genero} value={g.genero}>{g.genero} ({g.count})</option>
    ))}
  </select>
  {(filtroPersonaPais || filtroPersonaMotivo || filtroPersonaGenero) && (
    <button onClick={() => { setFiltroPersonaPais(''); setFiltroPersonaMotivo(''); setFiltroPersonaGenero('') }}
      style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#c62828', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
      ✕ Limpiar
    </button>
  )}
</div>
              {loadings.personas ? <p style={{ padding: 20, color: '#999' }}>Cargando...</p> : isMobile ? (
                /* ── Vista cards en móvil ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {personas
                    .filter(u =>
                      (!buscarPersona || `${u.nombre} ${u.apellidos}`.toLowerCase().includes(buscarPersona.toLowerCase()) || u.email?.toLowerCase().includes(buscarPersona.toLowerCase())) &&
                      (!filtroPersonaPais || u.pais === filtroPersonaPais) &&
                      (!filtroPersonaMotivo || (u.respuestas?.motivo || u.respuestas?.motivos || u.respuestas?.casos || []).includes(filtroPersonaMotivo)) &&
                      (!filtroPersonaGenero || u.respuestas?.genero === filtroPersonaGenero)
                    )
                    .map(u => (
                      <div key={u.id} style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#421869', marginBottom: 2 }}>{u.nombre || '—'} {u.apellidos || ''}</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{u.email}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#888', marginBottom: 10 }}>
                          {u.pais && <span>{u.pais}</span>}
                          {u.telefono && <span>{u.telefono}</span>}
                          {u.created_at && <span>{new Date(u.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => navigator.clipboard.writeText(u.id).then(() => toast('📋 UUID copiado'))}
                            style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 10, cursor: 'pointer', color: '#999', fontFamily: 'monospace' }}>
                            {u.id?.slice(0, 8)}...
                          </button>
                          <button onClick={() => eliminarUsuarioAdmin(u.id, u.email, `${u.nombre || ''} ${u.apellidos || ''}`.trim())}
                            style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #ffcdd2', background: '#fff5f5', fontSize: 12, cursor: 'pointer', color: '#c62828', fontWeight: 600 }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* ── Vista tabla en desktop ── */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        {['Nombre', 'Email', 'País', 'Teléfono', 'Registro', 'UUID', ''].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {personas
                        .filter(u =>
                          (!buscarPersona || `${u.nombre} ${u.apellidos}`.toLowerCase().includes(buscarPersona.toLowerCase()) || u.email?.toLowerCase().includes(buscarPersona.toLowerCase())) &&
                          (!filtroPersonaPais || u.pais === filtroPersonaPais) &&
                          (!filtroPersonaMotivo || (u.respuestas?.motivo || u.respuestas?.motivos || u.respuestas?.casos || []).includes(filtroPersonaMotivo)) &&
                          (!filtroPersonaGenero || u.respuestas?.genero === filtroPersonaGenero)
                        )
                        .map((u, i) => (
                          <tr key={u.id} style={{ borderTop: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                            <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#421869' }}>{u.nombre || '—'} {u.apellidos || ''}</td>
                            <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.email}</td>
                            <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.pais || '—'}</td>
                            <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.telefono || '—'}</td>
                            <td style={{ padding: '10px 16px', fontSize: 12, color: '#999', whiteSpace: 'nowrap' as const }}>
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <button onClick={() => navigator.clipboard.writeText(u.id).then(() => toast('📋 UUID copiado'))}
                                style={{ padding: '3px 8px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 10, cursor: 'pointer', color: '#999', fontFamily: 'monospace' }}>
                                {u.id?.slice(0, 8)}...
                              </button>
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <button onClick={() => eliminarUsuarioAdmin(u.id, u.email, `${u.nombre || ''} ${u.apellidos || ''}`.trim())}
                                style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #ffcdd2', background: '#fff5f5', fontSize: 11, cursor: 'pointer', color: '#c62828', fontWeight: 600 }}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Buscador de emergencia en auth.users */}
            <div style={{ marginTop: 24, background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontFamily: 'Raleway', fontWeight: 700, color: '#421869', margin: '0 0 12px', fontSize: 14 }}>
                Buscar usuario por correo (incluye registros sin confirmar)
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="correo@ejemplo.com"
                  value={authSearch}
                  onChange={e => setAuthSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') {
                    setAuthSearching(true)
                    fetch(`/api/admin/search-user?email=${encodeURIComponent(authSearch)}`)
                      .then(r => r.json()).then(d => { setAuthResults(d.users || []); setAuthSearching(false) })
                  }}}
                  style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans' }}
                />
                <button
                  onClick={() => {
                    setAuthSearching(true)
                    fetch(`/api/admin/search-user?email=${encodeURIComponent(authSearch)}`)
                      .then(r => r.json()).then(d => { setAuthResults(d.users || []); setAuthSearching(false) })
                  }}
                  style={{ padding: '8px 18px', borderRadius: 20, background: '#421869', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans' }}
                >
                  {authSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {authResults.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {authResults.map(u => (
                    <div key={u.id} style={{ padding: '10px 14px', borderRadius: 10, background: '#f8f4ff', border: '1px solid #ddd', fontSize: 13 }}>
                      <div style={{ fontWeight: 700, color: '#421869' }}>{u.nombre} {u.apellidos}</div>
                      <div style={{ color: '#555' }}>{u.email} · {u.role} · {u.confirmed ? 'Confirmado' : 'Sin confirmar email'}</div>
                      <div style={{ color: '#999', fontSize: 11 }}>Registro: {new Date(u.created_at).toLocaleDateString('es-PE')} · Último login: {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('es-PE') : 'Nunca'}</div>
                      <div style={{ color: '#bbb', fontSize: 10, fontFamily: 'monospace', marginBottom: 8 }}>{u.id}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/auth/request-reset', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: u.email }),
                            })
                            toast(res.ok ? `Email de reset enviado a ${u.email}` : 'Error al enviar el email')
                          }}
                          style={{ padding: '4px 14px', borderRadius: 20, background: '#421869', color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans' }}
                        >
                          Enviar reset de contraseña
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`¿Desbloquear la cuenta de ${u.email}?`)) return
                            const res = await fetch('/api/admin/unlock-user', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: u.id }),
                            })
                            if (res.ok) {
                              setAuthResults(prev => prev.map(r => r.id === u.id ? { ...r, confirmed: true } : r))
                              toast(`Cuenta desbloqueada: ${u.email}`)
                            } else {
                              const errData = await res.json().catch(() => ({}))
                              toast(`Error: ${errData.error || 'No se pudo desbloquear'}`)
                            }
                          }}
                          style={{ padding: '4px 14px', borderRadius: 20, background: '#16a34a', color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans' }}
                        >
                          Desbloquear cuenta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {authResults.length === 0 && authSearch && !authSearching && (
                <p style={{ color: '#999', fontSize: 13, marginTop: 10 }}>No se encontró ningún usuario con ese correo.</p>
              )}
            </div>
          </div>
        )}

        {/* ═══ EMPRESAS ═══ */}
        {activeTab === 'empresas' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>🏢 Empresas</h2>
              <button onClick={() => cargarLeadScores('empresa', empresas.map((e: any) => e.id))} disabled={scoringLoading}
                style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: scoringLoading ? '#e0e0e0' : '#421869', color: 'white', fontSize: 13, fontWeight: 700, cursor: scoringLoading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans' }}>
                {scoringLoading ? 'Calculando…' : 'Recalcular scores'}
              </button>
            </div>

            {statsEmpresas && (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
      <KpiCard emoji="🏢" label="Total empresas" value={statsEmpresas.total} color="#1565c0" />
    </div>
  </>
)}
                {/* Charts siempre en DOM */}
<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
  <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>🌍 Distribución por país</h4>
    <div style={{ position: 'relative', height: 200 }}><canvas ref={chartPaisesEmpresasRef} /></div>
  </div>
  <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>🎯 Áreas de mejora</h4>
    {statsEmpresas?.areas?.length > 0
      ? <div style={{ position: 'relative', height: 200 }}><canvas ref={chartAreasEmpresasRef} /></div>
      : <p style={{ color: '#bbb', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sin datos — requiere que las empresas completen el onboarding</p>}
  </div>
</div>
<div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 28 }}>
  <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>👥 Tamaño de empresas</h4>
  {statsEmpresas?.tamanos?.length > 0
    ? <div style={{ position: 'relative', height: 180 }}><canvas ref={chartTamanoEmpresasRef} /></div>
    : <p style={{ color: '#bbb', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sin datos — requiere que las empresas completen el onboarding</p>}
</div>
                    

            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 14, fontWeight: 700, color: '#421869' }}>Lista de empresas</span>
    <input placeholder="Buscar..." value={buscarEmpresa} onChange={e => setBuscarEmpresa(e.target.value)}
      style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, width: 220, fontFamily: 'DM Sans' }} />
  </div>

  {/* Filtros — siempre visibles */}
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#f8f9fa' }}>
    <select value={filtroEmpresaPais} onChange={e => setFiltroEmpresaPais(e.target.value)}
      style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
      <option value="">Todos los países</option>
      {statsEmpresas?.paises.filter((p: any) => p.pais !== 'Sin especificar').map((p: any) => (
        <option key={p.pais} value={p.pais}>{p.pais} ({p.count})</option>
      ))}
    </select>
    <select value={filtroEmpresaArea} onChange={e => setFiltroEmpresaArea(e.target.value)}
      style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
      <option value="">Todas las áreas</option>
      {statsEmpresas?.areas?.map((a: any) => (
        <option key={a.area} value={a.area}>{a.area} ({a.count})</option>
      ))}
    </select>
    <select value={filtroEmpresaTamano} onChange={e => setFiltroEmpresaTamano(e.target.value)}
      style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
      <option value="">Todos los tamaños</option>
      {statsEmpresas?.tamanos?.map((t: any) => (
        <option key={t.tamano} value={t.tamano}>{t.tamano} ({t.count})</option>
      ))}
    </select>
    {(filtroEmpresaPais || filtroEmpresaArea || filtroEmpresaTamano) && (
      <button onClick={() => { setFiltroEmpresaPais(''); setFiltroEmpresaArea(''); setFiltroEmpresaTamano('') }}
        style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#c62828', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
        ✕ Limpiar
      </button>
    )}
  </div>

  {/* Contenido */}
  {loadings.empresas ? (
    <p style={{ padding: 20, color: '#999' }}>Cargando...</p>
  ) : empresas.length === 0 ? (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
      <p>Aún no hay usuarios con perfil de empresa registrados.</p>
    </div>
  ) : isMobile ? (
    /* ── Vista cards en móvil ── */
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
      {empresas
        .filter(u =>
          (!buscarEmpresa || `${u.nombre} ${u.apellidos} ${u.empresa}`.toLowerCase().includes(buscarEmpresa.toLowerCase())) &&
          (!filtroEmpresaPais || u.pais === filtroEmpresaPais) &&
          (!filtroEmpresaArea || (u.areas || []).includes(filtroEmpresaArea)) &&
          (!filtroEmpresaTamano || (u.tamano || []).includes(filtroEmpresaTamano))
        )
        .sort((a, b) => (leadScores[b.id]?.score ?? -1) - (leadScores[a.id]?.score ?? -1))
        .map(u => {
          const ls = leadScores[u.id]
          const scoreColor = !ls ? '#999' : ls.score >= 71 ? '#16a34a' : ls.score >= 41 ? '#ea580c' : '#dc2626'
          const scoreBg   = !ls ? '#f5f5f5' : ls.score >= 71 ? '#dcfce7' : ls.score >= 41 ? '#ffedd5' : '#fee2e2'
          const factoresTexto = ls ? Object.entries(ls.factores).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
          return (
          <div key={u.id} style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#421869', marginBottom: 2 }}>{u.nombre || '—'} {u.apellidos || ''}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1565c0', marginBottom: 2 }}>{u.empresa || '—'} {u.cargo ? `· ${u.cargo}` : ''}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{u.email}</div>
              </div>
              <div title={`Score: ${ls?.score ?? '?'}\n\n${factoresTexto}`}
                style={{ width: 42, height: 42, borderRadius: '50%', background: scoreBg, color: scoreColor, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${scoreColor}`, cursor: 'help', flexShrink: 0 }}>
                {scoringLoading && !ls ? '…' : (ls?.score ?? '?')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#888', marginBottom: 10 }}>
              {u.pais && <span>{u.pais}</span>}
              {u.telefono && <span>{u.telefono}</span>}
              {u.created_at && <span>{new Date(u.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => navigator.clipboard.writeText(u.id).then(() => toast('📋 UUID copiado'))}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 10, cursor: 'pointer', color: '#999', fontFamily: 'monospace' }}>
                {u.id?.slice(0, 8)}...
              </button>
              {u.email && (
                <a href={`mailto:${u.email}?subject=Giro Lab — Bienestar organizacional&body=Hola ${u.nombre}, te escribo desde el equipo de Giro Lab.`}
                  style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #c7d2fe', background: '#eef2ff', fontSize: 11, color: '#4338ca', fontWeight: 600, textDecoration: 'none' }}>
                  Email
                </a>
              )}
              {u.telefono && (
                <a href={`https://wa.me/${u.telefono.replace(/\D/g, '')}?text=Hola ${u.nombre}, te escribo desde Giro Lab para apoyarlos en bienestar organizacional.`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4', fontSize: 11, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                  WhatsApp
                </a>
              )}
              <button onClick={() => eliminarUsuarioAdmin(u.id, u.email, `${u.nombre || ''} ${u.apellidos || ''}`.trim())}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #ffcdd2', background: '#fff5f5', fontSize: 12, cursor: 'pointer', color: '#c62828', fontWeight: 600 }}>
                Eliminar
              </button>
            </div>
          </div>
        )})}

    </div>
  ) : (
    /* ── Vista tabla en desktop ── */
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            {['Contacto', 'Empresa', 'Cargo', 'Email', 'País', 'Teléfono', 'Registro', 'UUID', ''].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empresas
            .filter(u =>
              (!buscarEmpresa || `${u.nombre} ${u.apellidos} ${u.empresa}`.toLowerCase().includes(buscarEmpresa.toLowerCase())) &&
              (!filtroEmpresaPais || u.pais === filtroEmpresaPais) &&
              (!filtroEmpresaArea || (u.areas || []).includes(filtroEmpresaArea)) &&
              (!filtroEmpresaTamano || (u.tamano || []).includes(filtroEmpresaTamano))
            )
            .map((u, i) => (
              <tr key={u.id} style={{ borderTop: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#421869' }}>{u.nombre || '—'} {u.apellidos || ''}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#1565c0' }}>{u.empresa || '—'}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.cargo || '—'}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.email}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.pais || '—'}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#666' }}>{u.telefono || '—'}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#999', whiteSpace: 'nowrap' as const }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <button onClick={() => navigator.clipboard.writeText(u.id).then(() => toast('📋 UUID copiado'))}
                    style={{ padding: '3px 8px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 10, cursor: 'pointer', color: '#999', fontFamily: 'monospace' }}>
                    {u.id?.slice(0, 8)}...
                  </button>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <button onClick={() => eliminarUsuarioAdmin(u.id, u.email, `${u.nombre || ''} ${u.apellidos || ''}`.trim())}
                    style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #ffcdd2', background: '#fff5f5', fontSize: 11, cursor: 'pointer', color: '#c62828', fontWeight: 600 }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )}
            </div>
          </div>
        )}

{activeTab === 'menters' && (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>⭐ Menters</h2>
      <button onClick={() => cargarLeadScores('menter', menters.map(m => m.menter_id))} disabled={scoringLoading}
        style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: scoringLoading ? '#e0e0e0' : '#421869', color: 'white', fontSize: 13, fontWeight: 700, cursor: scoringLoading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans' }}>
        {scoringLoading ? 'Calculando…' : 'Recalcular scores'}
      </button>
    </div>

    {/* KPIs */}
    {statsMenters && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard emoji="⭐" label="Total Menters" value={statsMenters.total} color="#6a1b9a" />
        {Object.entries(statsMenters.porPlan).map(([plan, count]) => {
          const pi = PLANES_COLOR[plan]
          return <KpiCard key={plan} emoji={pi.emoji} label={plan.charAt(0).toUpperCase() + plan.slice(1)} value={count as number} color={pi.color} />
        })}
      </div>
    )}

    {/* Charts — SIEMPRE en el DOM cuando el tab está activo, nunca condicionales */}
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 28 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>🌍 Países de Menters</h4>
        <div style={{ position: 'relative', height: 220 }}>
          <canvas ref={chartPaisesMentersRef} />
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h4 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px', fontSize: 14 }}>🎯 Casos que atienden</h4>
        <div style={{ position: 'relative', height: 220 }}>
          <canvas ref={chartEspecialidadesRef} />
        </div>
      </div>
    </div>

              {/* Filtros */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <input placeholder="Buscar nombre..." value={buscarMenter} onChange={e => setBuscarMenter(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, width: 200, fontFamily: 'DM Sans' }} />
              <select value={filtroMembresia} onChange={e => setFiltroMembresia(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
                <option value="">Todos los planes</option>
                <option value="free">🌱 Free</option>
                <option value="starter">⚡ Starter</option>
                <option value="premium">💎 Premium</option>
                <option value="master">👑 Master</option>
              </select>
              <select value={filtroPais} onChange={e => setFiltroPais(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
                <option value="">Todos los países</option>
                {statsMenters?.paises.filter((p: any) => p.pais !== 'Sin especificar').map((p: any) => (
                  <option key={p.pais} value={p.pais}>{p.pais}</option>
                ))}
              </select>
              <select value={filtroEspecialidad} onChange={e => setFiltroEspecialidad(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white' }}>
                <option value="">Todos los casos</option>
                {statsMenters?.especialidades.map((e: any) => (
                  <option key={e.especialidad} value={e.especialidad}>{e.especialidad}</option>
                ))}
              </select>
            </div>

            {loadings.menters ? <p style={{ color: '#999' }}>Cargando...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {menters
                  .filter(m =>
                    (!buscarMenter || m.nombre?.toLowerCase().includes(buscarMenter.toLowerCase())) &&
                    (!filtroMembresia || (m.menter_memberships?.[0]?.plan || 'free') === filtroMembresia) &&
                    (!filtroPais || m.pais === filtroPais) &&
                    (!filtroEspecialidad || (m.casos_que_atiende || []).includes(filtroEspecialidad))
                  )
                  .sort((a, b) => (leadScores[b.menter_id]?.score ?? -1) - (leadScores[a.menter_id]?.score ?? -1))
                  .map(m => {
                    const plan = m.menter_memberships?.[0]?.plan || 'free'
                    const pi = PLANES_COLOR[plan]
                    const stats = mentersStats[m.menter_id] || {}
                    const ls = leadScores[m.menter_id]
                    const scoreColor = !ls ? '#999' : ls.score >= 71 ? '#16a34a' : ls.score >= 41 ? '#ea580c' : '#dc2626'
                    const scoreBg   = !ls ? '#f5f5f5' : ls.score >= 71 ? '#dcfce7' : ls.score >= 41 ? '#ffedd5' : '#fee2e2'
                    const factoresTexto = ls ? Object.entries(ls.factores).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
                    return (
                      <div key={m.menter_id} style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${pi.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {m.avatar_url
                              ? <img src={m.avatar_url} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' as const }} />
                              : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#421869', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>{m.nombre?.[0]}</div>
                            }
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: '#421869' }}>{m.nombre} {m.apellidos}</div>
                              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                                {m.casos_que_atiende?.slice(0, 2).join(', ') || 'Sin especialidad'} · 📍 {m.pais || '—'}
                              </div>
                              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                                {m.email    && <a href={`mailto:${m.email}`}    style={{ fontSize: 11, color: '#421869', textDecoration: 'none' }}>✉ {m.email}</a>}
                                {m.telefono && <span style={{ fontSize: 11, color: '#666' }}>📞 {m.telefono}</span>}
                                {m.created_at && <span style={{ fontSize: 11, color: '#bbb' }}>Desde {new Date(m.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {/* Score badge */}
                            <div title={`Score: ${ls?.score ?? '?'}\n\n${factoresTexto}`}
                              style={{ width: 42, height: 42, borderRadius: '50%', background: scoreBg, color: scoreColor, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${scoreColor}`, cursor: 'help', flexShrink: 0 }}>
                              {scoringLoading && !ls ? '…' : (ls?.score ?? '?')}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: pi.bg, color: pi.color }}>{pi.emoji} {plan.toUpperCase()}</span>
                            <select
                              value={plan}
                              onChange={e => solicitarCambioPlan(m.menter_id, e.target.value, m.nombre, plan)}
                              style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #ddd', fontSize: 12, fontFamily: 'DM Sans', background: 'white', cursor: 'pointer' }}>
                              <option value="free">🌱 Free</option>
                              <option value="starter">⚡ Starter</option>
                              <option value="premium">💎 Premium</option>
                              <option value="master">👑 Master</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 14 }}>
                          {[
                            { label: 'Completadas', value: stats.completadas  || 0, color: '#085041', bg: '#E1F5EE' },
                            { label: 'Confirmadas', value: stats.confirmadas  || 0, color: '#1565c0', bg: '#e3f2fd' },
                            { label: 'Pendientes',  value: stats.pendientes   || 0, color: '#e65100', bg: '#fff8e1' },
                            { label: 'Canceladas',  value: stats.canceladas   || 0, color: '#b71c1c', bg: '#ffebee' },
                            { label: 'Rechazadas',  value: stats.rechazadas   || 0, color: '#555',    bg: '#f5f5f5' },
                            { label: 'Reprog.',     value: stats.reprogramadas|| 0, color: '#6a1b9a', bg: '#f3e5f5' },
                            { label: 'Eventos',     value: stats.total_eventos|| 0, color: '#421869', bg: '#f3e8ff' },
                          ].map((s, i) => (
                            <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                              <div style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 8 }}>Insignias</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {INSIGNIAS.map(ins => {
                              const tiene = m.insignias_ganadas?.includes(ins.id)
                              return (
                                <button key={ins.id} onClick={() => tiene ? quitarInsignia(m.menter_id, ins.id) : asignarInsignia(m.menter_id, ins.id)}
                                  style={{ padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, border: `1px solid ${tiene ? '#421869' : '#ddd'}`, background: tiene ? '#421869' : 'white', color: tiene ? 'white' : '#666' }}>
                                  {tiene ? '✓ ' : '+ '}{ins.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => navigator.clipboard.writeText(m.menter_id).then(() => toast('📋 UUID copiado'))}
                            style={{ padding: '3px 8px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 10, cursor: 'pointer', color: '#999', fontFamily: 'monospace' }}>
                            {m.menter_id?.slice(0, 8)}...
                          </button>
                          {m.email && (
                            <a href={`mailto:${m.email}?subject=Giro Lab — Tu perfil está listo&body=Hola ${m.nombre}, te escribo desde el equipo de Giro Lab.`}
                              style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #c7d2fe', background: '#eef2ff', fontSize: 11, color: '#4338ca', fontWeight: 600, textDecoration: 'none' }}>
                              Email
                            </a>
                          )}
                          {m.telefono && (
                            <a href={`https://wa.me/${m.telefono.replace(/\D/g, '')}?text=Hola ${m.nombre}, te escribo desde Giro Lab para ayudarte con tu perfil.`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4', fontSize: 11, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                              WhatsApp
                            </a>
                          )}
                          <button onClick={() => eliminarUsuarioAdmin(m.menter_id, m.email || '', `${m.nombre || ''} ${m.apellidos || ''}`.trim())}
                            style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #ffcdd2', background: '#fff5f5', fontSize: 11, cursor: 'pointer', color: '#c62828', fontWeight: 600 }}>
                            Eliminar cuenta
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ═══ CERTIFICADOS ═══ */}
        {activeTab === 'certificados' && (
          <div>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>🏅 Certificados</h2>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 20px' }}>➕ Crear y asignar</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                {[
                  { label: 'UUID del usuario *', key: 'user_id',     placeholder: 'uuid-del-usuario' },
                  { label: 'Título *',            key: 'titulo',      placeholder: 'Proceso de Bienestar Completado' },
                  { label: 'UUID del Menter',     key: 'menter_id',   placeholder: 'opcional' },
                  { label: 'URL del PDF',         key: 'pdf_url',     placeholder: 'https://... (opcional)' },
                  { label: 'Descripción',         key: 'descripcion', placeholder: 'opcional' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#421869', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input placeholder={f.placeholder} value={(certForm as any)[f.key]}
                      onChange={e => setCertForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', boxSizing: 'border-box' as const }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#421869', display: 'block', marginBottom: 6 }}>Tipo *</label>
                  <select value={certForm.tipo} onChange={e => setCertForm(p => ({ ...p, tipo: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', background: 'white', boxSizing: 'border-box' as const }}>
                    <option value="sesiones_completadas">🌱 Proceso completado</option>
                    <option value="formacion_giro_lab">🎓 Formación Giro Lab</option>
                    <option value="evento">🎪 Asistencia a evento</option>
                    <option value="personalizado">🏅 Personalizado</option>
                  </select>
                </div>
              </div>
              <button onClick={crearCertificado} disabled={loadings.cert || !certForm.user_id || !certForm.titulo}
                style={{ marginTop: 16, padding: '11px 28px', borderRadius: 20, border: 'none', background: (!certForm.user_id || !certForm.titulo) ? '#e0e0e0' : '#421869', color: (!certForm.user_id || !certForm.titulo) ? '#999' : 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway' }}>
                {loadings.cert ? 'Creando...' : '🏅 Crear y asignar'}
              </button>
            </div>

            {loadings.certificados ? <p style={{ color: '#999' }}>Cargando...</p> : (
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['Título', 'Tipo', 'Usuario ID', 'Emitido', 'PDF'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {certificados.map((c, i) => (
                      <tr key={c.id} style={{ borderTop: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#421869' }}>{c.titulo}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{c.tipo.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{c.user_id?.slice(0, 8)}...</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{new Date(c.emitido_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '12px 16px' }}>{c.pdf_url ? <a href={c.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#421869', fontWeight: 600 }}>Ver PDF</a> : <span style={{ fontSize: 12, color: '#999' }}>Auto</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ FRASES ═══ */}
        {activeTab === 'frases' && (
          <div>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>✨ Frases del Día</h2>

            <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 16px' }}>➕ Agregar frase</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#421869', display: 'block', marginBottom: 6 }}>Frase *</label>
                  <input placeholder="Escribe la frase..." value={fraseForm.frase} onChange={e => setFraseForm(p => ({ ...p, frase: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', boxSizing: 'border-box' as const }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#421869', display: 'block', marginBottom: 6 }}>Autor</label>
                  <input placeholder="ej: Giro Lab" value={fraseForm.autor} onChange={e => setFraseForm(p => ({ ...p, autor: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', boxSizing: 'border-box' as const }} />
                </div>
                <button onClick={agregarFrase} disabled={loadings.addFrase || !fraseForm.frase.trim()}
                  style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway', whiteSpace: 'nowrap' as const }}>
                  {loadings.addFrase ? '...' : '+ Agregar'}
                </button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 8px' }}>📋 Carga masiva — 365 frases</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                Una frase por línea. Formato: <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>La frase | Autor</code>
              </p>
              <textarea placeholder={'El bienestar comienza con una decisión. | Giro Lab\nCada día es una nueva oportunidad.'}
                value={frasesTexto} onChange={e => setFrasesTexto(e.target.value)} rows={8}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 13, fontFamily: 'DM Sans', resize: 'vertical', boxSizing: 'border-box' as const, marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#999' }}>{frasesTexto.split('\n').filter(l => l.trim()).length} frases detectadas</span>
                <button onClick={cargarFrasesAnuales} disabled={loadings.cargaMasiva || !frasesTexto.trim()}
                  style={{ padding: '10px 24px', borderRadius: 20, border: 'none', background: frasesTexto.trim() ? '#421869' : '#e0e0e0', color: frasesTexto.trim() ? 'white' : '#999', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>
                  {loadings.cargaMasiva ? 'Cargando...' : '⬆️ Cargar todas'}
                </button>
              </div>
            </div>

            {loadings.frases ? <p style={{ color: '#999' }}>Cargando...</p> : (
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '14px 20px', background: '#f8f9fa', borderBottom: '1px solid #f0f0f0', fontSize: 13, color: '#666' }}>
                  {frases.length} frases cargadas
                </div>
                {frases.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: i === 0 ? 'none' : '1px solid #f0f0f0', background: f.activa ? '#f3fdf6' : 'white' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#2d2926', lineHeight: 1.5 }}>"{f.frase}"</div>
                      {f.autor && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>— {f.autor}</div>}
                      {f.fecha && <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>📅 {f.fecha}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {f.fecha === new Date().toISOString().split('T')[0] && (
                        <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: '#e8f5e9', color: '#1b5e20', fontWeight: 700 }}>✅ Hoy</span>
                      )}
                      <button onClick={() => eliminarFrase(f.id)} style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid #ffebee', background: 'white', color: '#c62828', fontSize: 11, cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ EVENTOS ═══ */}
        {activeTab === 'eventos' && (
          <div>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>🎪 Eventos</h2>
            {loadings.eventos ? <p style={{ color: '#999' }}>Cargando...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {eventos.map(e => (
                  <div key={e.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex' }}>
                      {e.cover_image && <img src={e.cover_image} style={{ width: 120, height: 90, objectFit: 'cover' as const, flexShrink: 0 }} />}
                      <div style={{ padding: '14px 18px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setModalEvento(e)}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#421869', textDecoration: 'underline' }}>{e.title}</div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>por {e.menter?.nombre || '—'} · 📅 {e.date}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <StatusBadge status={e.status} />
                          {e.status === 'publicado'
                            ? <button onClick={() => cambiarStatusEvento(e.id, 'borrador')} style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #fff8e1', background: '#fff8e1', color: '#e65100', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Despublicar</button>
                            : <button onClick={() => cambiarStatusEvento(e.id, 'publicado')} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Publicar</button>
                          }
                          <button onClick={() => eliminarEvento(e.id)} style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid #ffebee', background: 'white', color: '#c62828', fontSize: 11, cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ BLOG ═══ */}
        {activeTab === 'blog' && (
          <div>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', marginBottom: 24 }}>📝 Blog</h2>
            {loadings.blogs ? <p style={{ color: '#999' }}>Cargando...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {blogs.map(b => (
                  <div key={b.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex' }}>
                      {b.cover_image && <img src={b.cover_image} style={{ width: 120, height: 90, objectFit: 'cover' as const, flexShrink: 0 }} />}
                      <div style={{ padding: '14px 18px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={async () => {
                          const { sanitizeHtml } = await import('@/lib/sanitize')
                          setModalBlog({ ...b, content: await sanitizeHtml(b.content || '') })
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#421869', textDecoration: 'underline' }}>{b.title}</div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
                            por {b.menter?.nombre || '—'} · {new Date(b.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {b.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                              {b.tags.map((tag: string) => <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f3e8ff', color: '#6d28d9', fontWeight: 600 }}>{tag}</span>)}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <StatusBadge status={b.status} />
                          {b.status === 'publicado'
                            ? <button onClick={() => cambiarStatusBlog(b.id, 'borrador')} style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #fff8e1', background: '#fff8e1', color: '#e65100', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Despublicar</button>
                            : <button onClick={() => cambiarStatusBlog(b.id, 'publicado')} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Publicar</button>
                          }
                          <button onClick={() => eliminarBlog(b.id)} style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid #ffebee', background: 'white', color: '#c62828', fontSize: 11, cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ COMUNIDAD ═══ */}
        {activeTab === 'leads' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>Leads de Tests</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  placeholder="Filtrar por menter..."
                  value={filtroLeadMenter}
                  onChange={e => setFiltroLeadMenter(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, outline: 'none', minWidth: 180 }}
                />
                <button onClick={() => cargarLeads()} style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>↻ Recargar</button>
              </div>
            </div>
            {loadings.leads ? <p style={{ color: '#999' }}>Cargando...</p> : (() => {
              const filtered = leads.filter(l =>
                !filtroLeadMenter || (l.menter as any)?.nombre?.toLowerCase().includes(filtroLeadMenter.toLowerCase())
              )
              return (
                <>
                  <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{filtered.length} leads {filtroLeadMenter ? 'filtrados' : 'en total'}</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f8f4ff' }}>
                          {['Nombre', 'Email', 'Instrumento', 'Menter', 'Fuente', 'Fecha'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: '#421869', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#999' }}>Sin leads aún.</td></tr>
                        )}
                        {filtered.map(l => (
                          <tr key={l.id} style={{ borderBottom: '1px solid #f0f0f0' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafafa'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: '#333' }}>{l.persona_nombre || '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#555' }}>
                              <a href={`mailto:${l.persona_email}`} style={{ color: '#421869', textDecoration: 'none' }}>{l.persona_email}</a>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ background: '#f3e8ff', color: '#6a1b9a', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{l.instrument_id || '—'}</span>
                            </td>
                            <td style={{ padding: '10px 14px', color: '#555' }}>{(l.menter as any)?.nombre || <span style={{ color: '#bbb' }}>Sin menter</span>}</td>
                            <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>{l.metadata?.utm_source || l.metadata?.fuente || '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#999', whiteSpace: 'nowrap' }}>
                              {new Date(l.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {activeTab === 'soporte' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Contactos del chat — para campañas */}
          {(() => {
            const contactos = chats.filter(c => c.user_email)
            const meses = Array.from(new Set(contactos.map(c => c.created_at?.slice(0, 7)))).sort().reverse()
            const filtrados = filtroMes ? contactos.filter(c => c.created_at?.startsWith(filtroMes)) : contactos

            const exportCSV = () => {
              const headers = ['Nombre','Email','Registrado','Estado','Consentimiento email','Mensajes','Fecha']
              const rows = filtrados.map(c => [
                c.user_name || '',
                c.user_email || '',
                c.is_registered ? 'Sí' : 'No',
                c.status === 'needs_human' ? 'Pide asesor' : c.status === 'closed' ? 'Cerrado' : 'Abierto',
                c.email_consent ? 'Sí' : 'No',
                c.support_messages?.length || 0,
                new Date(c.created_at).toLocaleDateString('es-PE'),
              ])
              const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `chat_contactos_${filtroMes || 'todos'}.csv`; a.click()
            }

            const syncBrevo = async () => {
              setSyncingBrevo(true)
              const contacts = filtrados.filter(c => c.email_consent).map(c => ({
                name: c.user_name || '',
                email: c.user_email,
                is_registered: c.is_registered,
                fecha: new Date(c.created_at).toLocaleDateString('es-PE'),
              }))
              if (!contacts.length) { alert('Sin contactos con consentimiento de email en el filtro actual'); setSyncingBrevo(false); return }
              const res = await fetch('/api/admin/sync-brevo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts, listName: `Chat Soporte ${filtroMes || 'Todos'}` }),
              })
              const data = await res.json()
              setSyncingBrevo(false)
              if (data.ok) alert(`${data.imported} contactos enviados a Brevo. Lista: "${data.listName}"`)
              else alert('Error al sincronizar: ' + (data.error || 'desconocido'))
            }

            return (
              <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: 'Raleway', color: '#421869', fontSize: 16 }}>Contactos del chat</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #e0d4f7', fontSize: 13, color: '#421869', outline: 'none', cursor: 'pointer' }}>
                      <option value=''>Todos los meses</option>
                      {meses.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</option>)}
                    </select>
                    <span style={{ fontSize: 12, color: '#999' }}>{filtrados.length} contactos</span>
                    <button onClick={exportCSV} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #e0d4f7', background: 'white', color: '#421869', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Exportar CSV</button>
                    <button onClick={syncBrevo} disabled={syncingBrevo} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: syncingBrevo ? '#ccc' : '#421869', color: 'white', fontSize: 12, cursor: syncingBrevo ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                      {syncingBrevo ? 'Sincronizando...' : 'Enviar a Brevo'}
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8f4ff' }}>
                        {['Nombre','Email','Registrado','Consentimiento','Estado','Msgs','Fecha'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 700, color: '#421869', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafafa'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}
                          onClick={() => setSelectedChat(c)}>
                          <td style={{ padding: '9px 14px', fontWeight: 600, color: '#333' }}>{c.user_name || '—'}</td>
                          <td style={{ padding: '9px 14px' }}><a href={`mailto:${c.user_email}`} style={{ color: '#421869', textDecoration: 'none' }}>{c.user_email}</a></td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600, background: c.is_registered ? '#e8f5e9' : '#f5f5f5', color: c.is_registered ? '#1b5e20' : '#999' }}>
                              {c.is_registered ? 'Registrado' : 'No registrado'}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'center' }}>{c.email_consent ? '✓' : '—'}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600,
                              background: c.status === 'needs_human' ? '#fff3e0' : c.status === 'closed' ? '#f5f5f5' : '#ede7f6',
                              color: c.status === 'needs_human' ? '#e65100' : c.status === 'closed' ? '#999' : '#421869' }}>
                              {c.status === 'needs_human' ? 'Pide asesor' : c.status === 'closed' ? 'Cerrado' : 'Abierto'}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', color: '#666', textAlign: 'center' }}>{c.support_messages?.length || 0}</td>
                          <td style={{ padding: '9px 14px', color: '#999', whiteSpace: 'nowrap' }}>
                            {new Date(c.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                      {filtrados.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#bbb' }}>Sin contactos aún</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}
          {/* Chats */}
          <div style={{ display: 'flex', gap: 20, height: 600 }}>
            {/* Lista de chats */}
            <div style={{ width: 280, flexShrink: 0, background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontFamily: 'Raleway', color: '#421869', fontSize: 16 }}>Chats</h3>
                <button onClick={cargarChats} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 18 }}>↻</button>
              </div>
              {loadings.soporte ? <p style={{ padding: 20, color: '#999', fontSize: 13 }}>Cargando...</p> : (
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {chats.length === 0 && <p style={{ padding: 20, color: '#bbb', fontSize: 13, textAlign: 'center' }}>Sin chats aún</p>}
                  {chats.map(c => {
                    const statusColor: Record<string, string> = { open: '#e3f2fd', needs_human: '#fff3e0', closed: '#f5f5f5' }
                    const statusLabel: Record<string, string> = { open: 'Abierto', needs_human: 'Pide asesor', closed: 'Cerrado' }
                    const lastMsg = c.support_messages?.[c.support_messages.length - 1]
                    return (
                      <div key={c.id} onClick={() => setSelectedChat(c)}
                        style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: selectedChat?.id === c.id ? '#f3e8ff' : 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{c.user_name || 'Anónimo'}</div>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: statusColor[c.status] || '#f5f5f5', color: '#555', whiteSpace: 'nowrap', fontWeight: 600 }}>{statusLabel[c.status] || c.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{c.user_email}</div>
                        {lastMsg && <div style={{ fontSize: 12, color: '#bbb', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastMsg.content}</div>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Panel de mensajes */}
            <div style={{ flex: 1, background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selectedChat ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 14 }}>Selecciona un chat</div>
              ) : (
                <>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#333' }}>{selectedChat.user_name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{selectedChat.user_email}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: selectedChat.status === 'closed' ? '#f5f5f5' : selectedChat.status === 'needs_human' ? '#fff3e0' : '#ede7f6', color: selectedChat.status === 'closed' ? '#999' : selectedChat.status === 'needs_human' ? '#e65100' : '#421869', fontWeight: 600 }}>
                      {selectedChat.status === 'closed' ? 'Cerrado' : selectedChat.status === 'needs_human' ? 'Pide asesor' : 'Abierto'}
                    </span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(selectedChat.support_messages || []).map((m: any) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-start' : 'flex-end' }}>
                        <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                          background: m.sender === 'user' ? '#f3e8ff' : m.sender === 'admin' ? '#421869' : '#e8f5e9',
                          color: m.sender === 'admin' ? 'white' : '#333' }}>
                          {m.sender === 'bot' && <div style={{ fontSize: 10, fontWeight: 700, color: '#6a1b9a', marginBottom: 3 }}>BOT</div>}
                          {m.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                  {selectedChat.status !== 'closed' ? (
                    <>
                      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10 }}>
                        <input
                          placeholder="Responder..."
                          value={adminReply}
                          onChange={e => setAdminReply(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendAdminReply()}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', color: '#1a1a1a' }}
                        />
                        <button onClick={sendAdminReply} disabled={!adminReply.trim() || sendingReply}
                          style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: adminReply.trim() ? '#421869' : '#e0e0e0', color: 'white', fontWeight: 700, fontSize: 13, cursor: adminReply.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Raleway' }}>
                          {sendingReply ? '...' : 'Enviar'}
                        </button>
                      </div>
                      <div style={{ padding: '8px 16px 14px', textAlign: 'center' }}>
                        <button onClick={() => closeChat(selectedChat.id)}
                          style={{ fontSize: 12, color: '#999', background: 'none', border: '1px solid #e0e0e0', borderRadius: 20, padding: '5px 16px', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                          Terminar conversación
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '12px 16px', textAlign: 'center', color: '#bbb', fontSize: 13 }}>Conversación cerrada</div>
                  )}
                </>
              )}
            </div>
          </div>
          </div>
        )}

        {activeTab === 'pagos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Buscador */}
            <input
              placeholder="Buscar por nombre o correo..."
              value={filtroPagos}
              onChange={e => setFiltroPagos(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', maxWidth: 340, color: '#1a1a1a' }}
            />

            {/* Membresías Menter */}
            {(() => {
              const q = filtroPagos.toLowerCase()
              const filtradas = memberships.filter(m =>
                !q || m.nombre?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
              )
              return (
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Raleway', color: '#421869', fontSize: 16 }}>Membresías activas (Menters) <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>{filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}</span></h3>
              {loadings.pagos ? <p style={{ color: '#999', fontSize: 13 }}>Cargando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8f4ff' }}>
                        {['Menter','Email','Plan','Ciclo','Estado','Trial hasta','Inicio','Suscripción ID'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 700, color: '#421869', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((m: any) => (
                        <tr key={m.menter_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '9px 14px', fontWeight: 600 }}>{m.nombre || '—'}</td>
                          <td style={{ padding: '9px 14px', color: '#666' }}>{m.email || '—'}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: m.plan === 'premium' ? '#ede7f6' : m.plan === 'starter' ? '#e3f2fd' : '#f5f5f5',
                              color: m.plan === 'premium' ? '#4a148c' : m.plan === 'starter' ? '#0d47a1' : '#999' }}>
                              {m.plan?.toUpperCase() || 'FREE'}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', color: '#666', textTransform: 'capitalize' }}>{m.billing_cycle || '—'}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                              background: m.is_active ? '#e8f5e9' : '#ffebee', color: m.is_active ? '#1b5e20' : '#c62828' }}>
                              {m.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', color: '#999', whiteSpace: 'nowrap' }}>{m.trial_ends_at ? new Date(m.trial_ends_at).toLocaleDateString('es-PE') : '—'}</td>
                          <td style={{ padding: '9px 14px', color: '#999', whiteSpace: 'nowrap' }}>{m.starts_at ? new Date(m.starts_at).toLocaleDateString('es-PE') : '—'}</td>
                          <td style={{ padding: '9px 14px', color: '#bbb', fontSize: 11 }}>{m.paypal_subscription_id || m.mp_subscription_id || '—'}</td>
                        </tr>
                      ))}
                      {filtradas.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#bbb' }}>Sin resultados</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )
            })()}

            {/* Historial de pagos */}
            {(() => {
              const q = filtroPagos.toLowerCase()
              const filtrados = pagos.filter(p =>
                !q || p.payer_email?.toLowerCase().includes(q) || p.payer_nombre?.toLowerCase().includes(q)
              )
              return (
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Raleway', color: '#421869', fontSize: 16 }}>Historial de transacciones <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span></h3>
              {loadings.pagos ? <p style={{ color: '#999', fontSize: 13 }}>Cargando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8f4ff' }}>
                        {['Fecha','Tipo','Estado','Detalle','Monto','Moneda','Nombre','Email pagador','ID pago'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 700, color: '#421869', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map((p: any) => {
                        const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
                          approved:  { label: 'Aprobado',  bg: '#e8f5e9', color: '#1b5e20' },
                          rejected:  { label: 'Rechazado', bg: '#ffebee', color: '#c62828' },
                          pending:   { label: 'Pendiente', bg: '#fff8e1', color: '#f57f17' },
                          cancelled: { label: 'Cancelado', bg: '#f5f5f5', color: '#999' },
                          in_process:{ label: 'En proceso',bg: '#e3f2fd', color: '#0d47a1' },
                        }
                        const typeCfg: Record<string, string> = { appointment: 'Cita', event_reg: 'Evento', subscription: 'Suscripción' }
                        const cfg = statusCfg[p.mp_status] || { label: p.mp_status, bg: '#f5f5f5', color: '#666' }
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: '9px 14px', whiteSpace: 'nowrap', color: '#999' }}>
                              {new Date(p.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '9px 14px', color: '#555' }}>{typeCfg[p.type] || p.type || '—'}</td>
                            <td style={{ padding: '9px 14px' }}>
                              <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                            </td>
                            <td style={{ padding: '9px 14px', color: '#999', fontSize: 11 }}>{p.mp_status_detail || '—'}</td>
                            <td style={{ padding: '9px 14px', fontWeight: 700, color: '#333' }}>{p.amount ? `${parseFloat(p.amount).toFixed(2)}` : '—'}</td>
                            <td style={{ padding: '9px 14px', color: '#666' }}>{p.currency || '—'}</td>
                            <td style={{ padding: '9px 14px', fontWeight: 600, color: '#333' }}>{p.payer_nombre || '—'}</td>
                            <td style={{ padding: '9px 14px', color: '#421869' }}>{p.payer_email || '—'}</td>
                            <td style={{ padding: '9px 14px', color: '#bbb', fontSize: 11 }}>{p.mp_payment_id}</td>
                          </tr>
                        )
                      })}
                      {filtrados.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#bbb' }}>Sin resultados</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )
            })()}
          </div>
        )}

        {activeTab === 'equipo' && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 24px', fontSize: 22 }}>Equipo — Asesores de soporte</h2>

            {/* Agregar asesor */}
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Raleway', color: '#333', fontSize: 15 }}>Agregar asesor</h3>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                El colaborador debe tener una cuenta registrada en Giro Lab. Solo podrá acceder al tab <strong>Soporte</strong> del panel admin — sin posibilidad de modificar planes, usuarios ni contenido.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  placeholder="Correo electrónico del colaborador"
                  value={nuevoAsesorEmail}
                  onChange={e => setNuevoAsesorEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && agregarAsesor()}
                  style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', color: '#1a1a1a' }}
                />
                <input
                  placeholder="Nombre (opcional)"
                  value={nuevoAsesorNombre}
                  onChange={e => setNuevoAsesorNombre(e.target.value)}
                  style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', color: '#1a1a1a' }}
                />
                <button onClick={agregarAsesor} disabled={addingAsesor || !nuevoAsesorEmail.trim()}
                  style={{ padding: '11px 24px', borderRadius: 30, border: 'none', background: nuevoAsesorEmail.trim() ? '#421869' : '#ccc', color: 'white', fontWeight: 700, fontSize: 14, cursor: nuevoAsesorEmail.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Raleway', alignSelf: 'flex-start' }}>
                  {addingAsesor ? 'Agregando...' : 'Agregar asesor'}
                </button>
              </div>
            </div>

            {/* Lista de asesores */}
            <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Raleway', color: '#333', fontSize: 15 }}>Asesores activos</h3>
              {loadings.equipo ? <p style={{ color: '#999', fontSize: 13 }}>Cargando...</p> : (
                staff.length === 0 ? (
                  <p style={{ color: '#bbb', fontSize: 13, textAlign: 'center', padding: 20 }}>Sin asesores configurados aún</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {staff.map(s => (
                      <div key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8f4ff', borderRadius: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#333', fontSize: 14 }}>{s.nombre || s.email}</div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{s.email} · <span style={{ color: '#7b2fd4', fontWeight: 600 }}>Asesor de soporte</span></div>
                          <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>Desde {new Date(s.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <button onClick={() => eliminarAsesor(s.user_id)}
                          style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: '#ffebee', color: '#c62828', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Revocar acceso
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === 'comunidad' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>💬 Comunidad — Posts</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => cargarComunidad()} style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>↻ Recargar</button>
                <button onClick={lanzarSeed} disabled={seedLoading} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: seedLoading ? '#ccc' : '#421869', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway' }}>
                  {seedLoading ? 'Creando...' : '🌱 Seed Menters + Posts'}
                </button>
              </div>
            </div>
            {loadings.comunidad ? <p style={{ color: '#999' }}>Cargando...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comunidadPosts.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>No hay posts aún.</p>}
                {comunidadPosts.map(p => (
                  <div key={p.id} style={{ background: 'white', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 14, color: '#333', lineHeight: 1.5 }}>{p.contenido}</p>
                      <div style={{ fontSize: 11, color: '#999' }}>
                        {new Date(p.created_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{p.likes_count || 0} ❤️ · {p.comments_count || 0} 💬
                      </div>
                    </div>
                    <button onClick={() => eliminarPostAdmin(p.id)} style={{ background: '#ffebee', border: 'none', color: '#c62828', borderRadius: 10, padding: '6px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>🗑️ Eliminar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL CONFIRMAR CAMBIO DE PLAN ── */}
{modalConfirmPlan && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    onClick={() => setModalConfirmPlan(null)}>
    <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, padding: '32px' }}
      onClick={e => e.stopPropagation()}>
      <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: '0 0 8px' }}>🔐 Confirmar cambio de plan</h3>
      <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
        Cambiando plan de <strong>{modalConfirmPlan.nombre}</strong>:
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: '#f8f9fa', borderRadius: 12 }}>
        <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, background: PLANES_COLOR[modalConfirmPlan.planAnterior]?.bg, color: PLANES_COLOR[modalConfirmPlan.planAnterior]?.color, fontWeight: 700 }}>
          {PLANES_COLOR[modalConfirmPlan.planAnterior]?.emoji} {modalConfirmPlan.planAnterior.toUpperCase()}
        </span>
        <span style={{ color: '#999' }}>→</span>
        <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, background: PLANES_COLOR[modalConfirmPlan.plan]?.bg, color: PLANES_COLOR[modalConfirmPlan.plan]?.color, fontWeight: 700 }}>
          {PLANES_COLOR[modalConfirmPlan.plan]?.emoji} {modalConfirmPlan.plan.toUpperCase()}
        </span>
      </div>

      <label style={{ fontSize: 12, fontWeight: 700, color: '#421869', display: 'block', marginBottom: 8 }}>
        Contraseña de administrador
      </label>
      <input
        type="password"
        placeholder="Ingresa tu contraseña"
        value={passwordConfirm}
        onChange={e => { setPasswordConfirm(e.target.value); setPasswordError('') }}
        onKeyDown={e => e.key === 'Enter' && confirmarCambioPlan()}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${passwordError ? '#c62828' : '#ddd'}`, fontSize: 13, fontFamily: 'DM Sans', boxSizing: 'border-box' as const, marginBottom: 4 }}
        autoFocus
      />
      {passwordError && (
        <p style={{ fontSize: 12, color: '#c62828', margin: '4px 0 0' }}>{passwordError}</p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={() => setModalConfirmPlan(null)}
          style={{ flex: 1, padding: '10px', borderRadius: 20, border: '1px solid #ddd', background: 'white', color: '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Cancelar
        </button>
        <button
          onClick={confirmarCambioPlan}
          disabled={!passwordConfirm || loadings.confirmPlan}
          style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: !passwordConfirm ? '#e0e0e0' : '#421869', color: !passwordConfirm ? '#999' : 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Raleway' }}>
          {loadings.confirmPlan ? 'Verificando...' : '✅ Confirmar'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* ── MODAL EVENTO ── */}
      {modalEvento && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setModalEvento(null)}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0 }}>🎪 {modalEvento.title}</h3>
              <button onClick={() => setModalEvento(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              {modalEvento.cover_image && <img src={modalEvento.cover_image} style={{ width: '100%', height: 220, objectFit: 'cover' as const, borderRadius: 16, marginBottom: 20 }} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Menter',    value: modalEvento.menter?.nombre || '—' },
                  { label: 'Fecha',     value: modalEvento.date },
                  { label: 'Modalidad', value: modalEvento.modality },
                  { label: 'Status',    value: modalEvento.status },
                ].map(f => (
                  <div key={f.label} style={{ background: '#f8f9fa', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#421869' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {modalEvento.description && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>{modalEvento.description}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                {modalEvento.status === 'publicado'
                  ? <button onClick={() => cambiarStatusEvento(modalEvento.id, 'borrador')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#fff8e1', color: '#e65100', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Despublicar</button>
                  : <button onClick={() => cambiarStatusEvento(modalEvento.id, 'publicado')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Publicar</button>
                }
                <button onClick={() => eliminarEvento(modalEvento.id)} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#ffebee', color: '#c62828', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL BLOG ── */}
      {modalBlog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setModalBlog(null)}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <h3 style={{ fontFamily: 'Raleway', color: '#421869', margin: 0, fontSize: 16 }}>📝 {modalBlog.title}</h3>
              <button onClick={() => setModalBlog(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              {modalBlog.cover_image && <img src={modalBlog.cover_image} style={{ width: '100%', height: 220, objectFit: 'cover' as const, borderRadius: 16, marginBottom: 20 }} />}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#666' }}>por <strong>{modalBlog.menter?.nombre || '—'}</strong></span>
                <span style={{ fontSize: 12, color: '#999' }}>{new Date(modalBlog.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <StatusBadge status={modalBlog.status} />
              </div>
              {modalBlog.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                  {modalBlog.tags.map((tag: string) => <span key={tag} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: '#f3e8ff', color: '#6d28d9', fontWeight: 600 }}>{tag}</span>)}
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: modalBlog.content }} style={{ fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 24 }} />
              <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                {modalBlog.status === 'publicado'
                  ? <button onClick={() => cambiarStatusBlog(modalBlog.id, 'borrador')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#fff8e1', color: '#e65100', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Despublicar</button>
                  : <button onClick={() => cambiarStatusBlog(modalBlog.id, 'publicado')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#421869', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Publicar</button>
                }
                <button onClick={() => eliminarBlog(modalBlog.id)} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: '#ffebee', color: '#c62828', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#421869', color: 'white', padding: '14px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' as const }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}