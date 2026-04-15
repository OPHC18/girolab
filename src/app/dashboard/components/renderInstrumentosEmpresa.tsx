'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { EMPRESA_INSTRUMENTS, EmpresaInstrumentId } from '@/lib/assessments/instruments_empresa';
import { INSTRUMENTS, InstrumentId } from '@/lib/assessments/instruments';

// ── Catálogo combinado de todos los instrumentos disponibles para empresa ──────
type AnyInstrumentId = EmpresaInstrumentId | InstrumentId;

const ALL_INSTRUMENTS: { id: AnyInstrumentId; nombre: string; descripcion: string; color: string; totalItems: number; tiempoMinutos: number; tags: string[]; referencia: string }[] = [
  ...Object.values(EMPRESA_INSTRUMENTS).map(i => ({
    id: i.id as AnyInstrumentId,
    nombre: i.nombre,
    descripcion: i.descripcion,
    color: i.color,
    totalItems: i.totalItems,
    tiempoMinutos: i.tiempoMinutos,
    tags: i.tagsMenters,
    referencia: i.referencia,
  })),
  ...Object.values(INSTRUMENTS).map(i => ({
    id: i.id as AnyInstrumentId,
    nombre: i.nombre,
    descripcion: i.descripcion,
    color: i.color,
    totalItems: i.totalItems,
    tiempoMinutos: i.tiempoMinutos,
    tags: i.tagsMenters,
    referencia: i.referencia,
  })),
];

const CREDIT_PACKS = [
  { id: 'pack_1',  creditos: 1,  precio: 5,  label: '1 evaluación',   ahorro: null },
  { id: 'pack_5',  creditos: 5,  precio: 20, label: '5 evaluaciones',  ahorro: 'Ahorra $5' },
  { id: 'pack_10', creditos: 10, precio: 35, label: '10 evaluaciones', ahorro: 'Ahorra $15' },
  { id: 'pack_20', creditos: 20, precio: 60, label: '20 evaluaciones', ahorro: 'Ahorra $40' },
];

interface Candidato { nombre: string; email: string; }
interface ShareLink { url: string; copied: boolean; candidato: string; }
interface JobProfile { id: string; nombre: string; }

interface Props {
  empresaId: string;
  menterId?: string;
}

export default function RenderInstrumentosEmpresa({ empresaId, menterId }: Props) {
  const [activeTab, setActiveTab]           = useState<'biblioteca' | 'resultados' | 'perfiles'>('biblioteca');
  const [shareLinks, setShareLinks]         = useState<Record<string, ShareLink[]>>({});
  const [loadingLink, setLoadingLink]       = useState<string | null>(null);
  const [jobProfiles, setJobProfiles]       = useState<JobProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [resultados, setResultados]         = useState<any[]>([]);
  const [loadingRes, setLoadingRes]         = useState(false);
  const [showCrearPerfil, setShowCrearPerfil] = useState(false);
  const [nuevoPerfil, setNuevoPerfil]       = useState({ nombre:'', disc_D:70, disc_I:60, disc_S:40, disc_C:50, hexaco_minimo:3.5 });
  const [crearPerfilError, setCrearPerfilError] = useState<string | null>(null);
  const [crearPerfilLoading, setCrearPerfilLoading] = useState(false);

  // Candidatos
  const [candidatos, setCandidatos]         = useState<Candidato[]>([{ nombre: '', email: '' }]);
  const csvInputRef                         = useRef<HTMLInputElement>(null);

  // Créditos
  const [creditos, setCreditos]             = useState<number | null>(null);
  const [showBuyModal, setShowBuyModal]     = useState(false);
  const [buyingPack, setBuyingPack]         = useState<string | null>(null);
  const [buyMsg, setBuyMsg]                 = useState<string | null>(null);

  const loadCreditos = useCallback(async () => {
    const { data } = await supabase
      .from('instrumento_creditos')
      .select('creditos')
      .eq('empresa_id', empresaId)
      .maybeSingle()
    setCreditos(data?.creditos ?? 0)
  }, [empresaId])

  useEffect(() => { loadCreditos() }, [loadCreditos])

  // Captura PayPal return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pp') === 'ok') {
      const orderId = sessionStorage.getItem('paypal_order_id')
      if (orderId) {
        sessionStorage.removeItem('paypal_order_id')
        fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId }),
        })
          .then(r => r.json())
          .then(d => { if (d.ok) { setCreditos(d.creditos_nuevos); setBuyMsg('¡Créditos acreditados!') } })
      }
    }
  }, [])

  useEffect(() => {
    supabase.from('job_profiles').select('id, nombre').eq('empresa_id', empresaId).eq('activo', true)
      .then(({ data }) => setJobProfiles(data || []))
  }, [empresaId])

  useEffect(() => {
    if (activeTab !== 'resultados') return
    setLoadingRes(true)
    supabase.from('v_empresa_assessment_results').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setResultados(data || []); setLoadingRes(false) })
  }, [activeTab])

  // ── Candidatos ────────────────────────────────────────────────────────────────
  const addCandidato = () => setCandidatos(prev => [...prev, { nombre: '', email: '' }])
  const removeCandidato = (i: number) => setCandidatos(prev => prev.filter((_, idx) => idx !== i))
  const updateCandidato = (i: number, field: keyof Candidato, value: string) =>
    setCandidatos(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = (ev.target?.result as string).split('\n').filter(Boolean)
      const parsed: Candidato[] = []
      lines.forEach(line => {
        const [nombre, email] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
        if (email && email.includes('@')) parsed.push({ nombre: nombre || '', email })
      })
      if (parsed.length > 0) setCandidatos(parsed)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const candidatosValidos = candidatos.filter(c => c.email.includes('@'))

  // ── Generar links ─────────────────────────────────────────────────────────────
  const handleGenerarLinks = async (instrumentId: string) => {
    if (!creditos || creditos <= 0) { setShowBuyModal(true); return }
    if (candidatosValidos.length === 0) return
    if (creditos < candidatosValidos.length) {
      alert(`Necesitas ${candidatosValidos.length} créditos. Solo tienes ${creditos}.`)
      return
    }

    setLoadingLink(instrumentId)
    const links: ShareLink[] = []
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://girolab.net'

    for (const c of candidatosValidos) {
      const { data } = await supabase.rpc('create_empresa_assessment_link', {
        p_instrument_id: instrumentId,
        p_empresa_id: empresaId,
        p_menter_id: menterId || null,
        p_job_profile_id: selectedProfile || null,
        p_candidato_email: c.email || null,
        p_candidato_nombre: c.nombre || null,
      })
      if (data) {
        links.push({ url: `${origin}/test/${instrumentId}?t=${data.token}`, copied: false, candidato: c.nombre || c.email })
      }
    }

    // Descontar créditos
    const nuevos = (creditos || 0) - links.length
    await supabase.from('instrumento_creditos').upsert(
      { empresa_id: empresaId, creditos: nuevos, updated_at: new Date().toISOString() },
      { onConflict: 'empresa_id' }
    )
    setCreditos(nuevos)
    setShareLinks(prev => ({ ...prev, [instrumentId]: links }))
    setLoadingLink(null)
  }

  const handleCopiar = (instrumentId: string, idx: number) => {
    const links = shareLinks[instrumentId]
    if (!links?.[idx]) return
    navigator.clipboard.writeText(links[idx].url)
    setShareLinks(prev => ({
      ...prev,
      [instrumentId]: prev[instrumentId].map((l, i) => i === idx ? { ...l, copied: true } : l)
    }))
    setTimeout(() => setShareLinks(prev => ({
      ...prev,
      [instrumentId]: prev[instrumentId].map((l, i) => i === idx ? { ...l, copied: false } : l)
    })), 2000)
  }

  const handleComprar = async (packId: string) => {
    setBuyingPack(packId)
    setBuyMsg(null)
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack_id: packId }),
    })
    const data = await res.json()
    if (data.approve_url) {
      sessionStorage.setItem('paypal_order_id', data.order_id)
      window.location.href = data.approve_url
    } else {
      setBuyMsg('Error al iniciar el pago. Intenta de nuevo.')
      setBuyingPack(null)
    }
  }

  const handleCrearPerfil = async () => {
    setCrearPerfilError(null)
    setCrearPerfilLoading(true)
    const { data, error } = await supabase.from('job_profiles').insert({
      empresa_id: empresaId,
      menter_id: menterId || null,
      nombre: nuevoPerfil.nombre,
      disc_d_target: nuevoPerfil.disc_D,
      disc_i_target: nuevoPerfil.disc_I,
      disc_s_target: nuevoPerfil.disc_S,
      disc_c_target: nuevoPerfil.disc_C,
      hexaco_minimo: nuevoPerfil.hexaco_minimo,
    }).select().single()
    setCrearPerfilLoading(false)
    if (error) { setCrearPerfilError(error.message); return }
    if (data) {
      setJobProfiles(prev => [...prev, { id: data.id, nombre: data.nombre }])
      setShowCrearPerfil(false)
      setNuevoPerfil({ nombre:'', disc_D:70, disc_I:60, disc_S:40, disc_C:50, hexaco_minimo:3.5 })
    }
  }

  const MATCH_COLOR = (m: number) => m >= 80 ? '#4CAF50' : m >= 65 ? '#FF9800' : '#F44336'

  return (
    <div style={s.container}>

      {/* ── HEADER con créditos ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Instrumentos de Selección y Diagnóstico</h2>
          <p style={s.sub}>Envía evaluaciones a candidatos y colaboradores</p>
        </div>
        <div style={s.creditBox}>
          <div style={s.creditCount}>
            <span style={s.creditNum}>{creditos ?? '—'}</span>
            <span style={s.creditLabel}>créditos</span>
          </div>
          <button style={s.buyBtn} onClick={() => setShowBuyModal(true)}>+ Comprar</button>
        </div>
      </div>

      {buyMsg && (
        <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>
          {buyMsg}
        </div>
      )}

      {creditos === 0 && (
        <div style={s.noCreditsBanner}>
          <span style={{ fontWeight: 700 }}>Sin créditos disponibles.</span> Cada evaluación que envíes consume 1 crédito.
          <button style={s.bannerBuyBtn} onClick={() => setShowBuyModal(true)}>Comprar ahora</button>
        </div>
      )}

      {/* TABS */}
      <div style={s.tabBar}>
        {(['biblioteca', 'resultados', 'perfiles'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabActive : {}) }}>
            {tab === 'biblioteca' ? 'Instrumentos' : tab === 'resultados' ? 'Resultados' : 'Perfiles de Puesto'}
          </button>
        ))}
      </div>

      {/* ── BIBLIOTECA ── */}
      {activeTab === 'biblioteca' && (
        <div>
          {/* Panel de configuración */}
          <div style={s.filterBox}>
            {/* Candidatos */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={s.label}>Candidatos ({candidatosValidos.length} válidos)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.addCandBtn} onClick={addCandidato}>+ Agregar</button>
                  <button style={s.addCandBtn} onClick={() => csvInputRef.current?.click()}>Cargar CSV</button>
                  <input ref={csvInputRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {candidatos.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ ...s.input, flex: 1 }} placeholder="Nombre" value={c.nombre}
                      onChange={e => updateCandidato(i, 'nombre', e.target.value)} />
                    <input style={{ ...s.input, flex: 2 }} placeholder="correo@empresa.com" value={c.email}
                      onChange={e => updateCandidato(i, 'email', e.target.value)} />
                    {candidatos.length > 1 && (
                      <button onClick={() => removeCandidato(i)}
                        style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
                CSV: una fila por candidato, formato <code>Nombre,correo@email.com</code>
              </p>
            </div>

            {/* Perfil de puesto */}
            <div style={s.filterField}>
              <label style={s.label}>Perfil de Puesto (opcional — solo para DISC/HEXACO)</label>
              <select style={s.select} value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}>
                <option value="">— Sin perfil (evaluación libre) —</option>
                {jobProfiles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Aviso de créditos necesarios */}
          {candidatosValidos.length > 1 && (creditos ?? 0) > 0 && (
            <div style={{ background: '#f3e8ff', borderRadius: 10, padding: '8px 14px', marginBottom: 16, fontSize: 13, color: '#6d28d9' }}>
              Con {candidatosValidos.length} candidatos, cada instrumento consumirá <strong>{candidatosValidos.length} créditos</strong>. Tienes {creditos} disponibles.
            </div>
          )}

          <div style={s.grid}>
            {ALL_INSTRUMENTS.map(inst => {
              const id = inst.id
              const links = shareLinks[id] || []
              const isLoading = loadingLink === id
              const sinCreditos = !creditos || creditos <= 0
              const necesita = candidatosValidos.length
              const sinSuficientes = (creditos ?? 0) < necesita

              return (
                <div key={id} style={s.card}>
                  <div style={{ borderLeft: `4px solid ${inst.color}`, paddingLeft: 12, marginBottom: 10 }}>
                    <p style={s.cardTitle}>{inst.nombre}</p>
                    <p style={s.cardDesc}>{inst.descripcion}</p>
                  </div>
                  <div style={s.metaRow}>
                    <span style={s.meta}>{inst.totalItems} ítems</span>
                    <span style={s.meta}>~{inst.tiempoMinutos} min</span>
                  </div>
                  <div style={s.tagsRow}>
                    {inst.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} style={{ ...s.tag, background:`${inst.color}22`, color:inst.color }}>{tag}</span>
                    ))}
                  </div>

                  <div style={s.costBadge}>
                    <span style={s.costText}>🎫 {necesita} crédito{necesita !== 1 ? 's' : ''} para {necesita} candidato{necesita !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Links generados */}
                  {links.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                      {links.map((link, idx) => (
                        <div key={idx} style={s.linkBox}>
                          {link.candidato && <span style={s.candidatoBadge}>{link.candidato}</span>}
                          <div style={s.linkRow}>
                            <span style={s.linkText}>{link.url}</span>
                            <button style={{ ...s.copyBtn, background: link.copied ? '#4CAF5022' : '#f5f5f5', color: link.copied ? '#4CAF50' : '#444' }}
                              onClick={() => handleCopiar(id, idx)}>
                              {link.copied ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sinCreditos ? (
                    <button style={{ ...s.actionBtn, background: '#ffa719', color: '#2d2926' }}
                      onClick={() => setShowBuyModal(true)}>
                      Comprar créditos para evaluar
                    </button>
                  ) : sinSuficientes && candidatosValidos.length > 0 ? (
                    <button style={{ ...s.actionBtn, background: '#ffa719', color: '#2d2926' }}
                      onClick={() => setShowBuyModal(true)}>
                      Comprar más créditos ({necesita} necesarios)
                    </button>
                  ) : (
                    <button style={{ ...s.actionBtn, background: inst.color }}
                      disabled={isLoading || candidatosValidos.length === 0}
                      onClick={() => links.length > 0
                        ? links.forEach((_, i) => handleCopiar(id, i))
                        : handleGenerarLinks(id)
                      }>
                      {isLoading
                        ? 'Generando...'
                        : links.length > 0
                          ? `Copiar todos (${links.length})`
                          : candidatosValidos.length === 0
                            ? 'Agrega un candidato'
                            : `Generar ${necesita > 1 ? `${necesita} links` : 'link'}`
                      }
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESULTADOS ── */}
      {activeTab === 'resultados' && (
        <div>
          {loadingRes ? <div style={s.loading}>Cargando...</div> :
           resultados.length === 0 ? (
            <div style={s.empty}><p>Aún no hay resultados. Envía evaluaciones a tus candidatos.</p></div>
           ) : (
            <div style={s.resultsList}>
              {resultados.map((res, i) => {
                const inst = (EMPRESA_INSTRUMENTS as any)[res.instrument_id] || (INSTRUMENTS as any)[res.instrument_id]
                return (
                  <div key={i} style={s.resultCard}>
                    <div style={s.resultHeader}>
                      <div style={{flex:1}}>
                        <p style={s.resName}>{res.candidato_nombre || 'Candidato'}</p>
                        <p style={s.resEmail}>{res.candidato_email}</p>
                        <p style={s.resInst}>{inst?.nombre || res.instrument_id}</p>
                        {res.job_profile_nombre && <p style={s.resPerfil}>Puesto: {res.job_profile_nombre}</p>}
                      </div>
                      {res.match_total !== null && (
                        <div style={s.matchCircle(MATCH_COLOR(res.match_total))}>
                          <span style={s.matchNum}>{res.match_total}%</span>
                          <span style={s.matchLabel}>match</span>
                        </div>
                      )}
                      {res.match_apto !== null && (
                        <span style={{ ...s.aptoBadge, background: res.match_apto ? '#E8F5E9' : '#FFEBEE', color: res.match_apto ? '#2E7D32' : '#B71C1C' }}>
                          {res.match_apto ? 'Apto' : 'No recomendado'}
                        </span>
                      )}
                    </div>
                    <p style={s.resDate}>{new Date(res.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PERFILES DE PUESTO ── */}
      {activeTab === 'perfiles' && (
        <div>
          <div style={s.perfilesHeader}>
            <p style={s.sub}>Define los percentiles DISC objetivo y el mínimo de integridad para cada puesto.</p>
            <button style={s.crearBtn} onClick={() => setShowCrearPerfil(true)}>+ Nuevo perfil</button>
          </div>
          {jobProfiles.length === 0 ? (
            <div style={s.empty}><p>No hay perfiles creados. Crea el primero para activar el Match automático.</p></div>
          ) : (
            <div style={s.grid}>
              {jobProfiles.map(p => (
                <div key={p.id} style={s.perfilCard}>
                  <p style={s.perfilNombre}>{p.nombre}</p>
                </div>
              ))}
            </div>
          )}
          {showCrearPerfil && (
            <div style={s.overlay} onClick={() => { setShowCrearPerfil(false); setCrearPerfilError(null) }}>
              <div style={s.modal} onClick={e => e.stopPropagation()}>
                <h3 style={s.modalTitle}>Nuevo Perfil de Puesto</h3>
                <label style={s.label}>Nombre del puesto</label>
                <input style={s.input} placeholder="Ej: Gerente Comercial" value={nuevoPerfil.nombre}
                  onChange={e => setNuevoPerfil(p => ({ ...p, nombre: e.target.value }))} />
                <h4 style={{ ...s.label, marginTop:16 }}>Percentiles DISC objetivo</h4>
                {(['D','I','S','C'] as const).map(f => (
                  <div key={f} style={s.sliderRow}>
                    <span style={s.sliderLabel}>Factor {f}</span>
                    <input type="range" min={0} max={100} value={nuevoPerfil[`disc_${f}` as keyof typeof nuevoPerfil] as number}
                      onChange={e => setNuevoPerfil(p => ({ ...p, [`disc_${f}`]: Number(e.target.value) }))} style={{ flex:1 }} />
                    <span style={s.sliderVal}>{nuevoPerfil[`disc_${f}` as keyof typeof nuevoPerfil]}%</span>
                  </div>
                ))}
                <label style={{ ...s.label, marginTop:16 }}>Integridad mínima HEXACO (1–5)</label>
                <div style={s.sliderRow}>
                  <input type="range" min={1} max={5} step={0.1} value={nuevoPerfil.hexaco_minimo}
                    onChange={e => setNuevoPerfil(p => ({ ...p, hexaco_minimo: Number(e.target.value) }))} style={{ flex:1 }} />
                  <span style={s.sliderVal}>{nuevoPerfil.hexaco_minimo.toFixed(1)}</span>
                </div>
                {crearPerfilError && (
                  <p style={{ color: '#c62828', fontSize: 12, marginTop: 12, background: '#ffebee', borderRadius: 8, padding: '8px 12px' }}>
                    Error: {crearPerfilError}
                  </p>
                )}
                <div style={s.modalBtns}>
                  <button style={s.cancelBtn} onClick={() => { setShowCrearPerfil(false); setCrearPerfilError(null) }}>Cancelar</button>
                  <button style={{ ...s.confirmBtn, opacity: nuevoPerfil.nombre && !crearPerfilLoading ? 1 : 0.5 }}
                    disabled={!nuevoPerfil.nombre || crearPerfilLoading} onClick={handleCrearPerfil}>
                    {crearPerfilLoading ? 'Guardando...' : 'Crear perfil'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL COMPRAR CRÉDITOS ── */}
      {showBuyModal && (
        <div style={s.overlay} onClick={() => { setShowBuyModal(false); setBuyingPack(null); setBuyMsg(null) }}>
          <div style={s.buyModal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => { setShowBuyModal(false); setBuyingPack(null); setBuyMsg(null) }}>✕</button>
            <h3 style={s.modalTitle}>Comprar créditos de evaluación</h3>
            <p style={s.buyModalSub}>Cada crédito = 1 evaluación enviada. Si tienes 3 candidatos y eliges un instrumento, se usan 3 créditos.</p>
            <div style={s.packsGrid}>
              {CREDIT_PACKS.map(pack => (
                <button key={pack.id}
                  style={{ ...s.packCard, ...(buyingPack === pack.id ? s.packCardActive : {}) }}
                  onClick={() => handleComprar(pack.id)}
                  disabled={!!buyingPack}>
                  <div style={s.packCreditos}>{pack.creditos}</div>
                  <div style={s.packLabel}>{pack.label}</div>
                  <div style={s.packPrecio}>${pack.precio} USD</div>
                  {pack.ahorro && <div style={s.packAhorro}>{pack.ahorro}</div>}
                  {buyingPack === pack.id && <div style={s.packLoading}>Redirigiendo...</div>}
                </button>
              ))}
            </div>
            {buyMsg && <p style={{ textAlign: 'center', color: '#c62828', fontSize: 13, marginTop: 12 }}>{buyMsg}</p>}
            <p style={s.paypalNote}>Pago seguro via PayPal. No se requiere cuenta PayPal.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function ResultadosMenterTabs({ userId }: { userId: string }) {
  return <div style={{ padding: 20, color: '#888' }}>Ver resultados en la pestaña Instrumentos de cada empresa.</div>
}

// ── ESTILOS ──────────────────────────────────────────────────────────────────
const s: Record<string, any> = {
  container:      { padding: '24px 0' },
  header:         { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, gap:12, flexWrap:'wrap' },
  titulo:         { fontSize:22, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  sub:            { fontSize:14, color:'#555', margin:0 },
  creditBox:      { display:'flex', alignItems:'center', gap:10, background:'#f8f9fa', borderRadius:12, padding:'10px 16px' },
  creditCount:    { display:'flex', flexDirection:'column', alignItems:'center' },
  creditNum:      { fontSize:24, fontWeight:800, color:'#421869', lineHeight:1 },
  creditLabel:    { fontSize:10, color:'#888', textTransform:'uppercase', letterSpacing:1 },
  buyBtn:         { padding:'8px 16px', borderRadius:20, background:'#421869', color:'#fff', border:'none', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Raleway, sans-serif' },
  noCreditsBanner:{ background:'#fff3cd', border:'1px solid #ffc107', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#856404', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' },
  bannerBuyBtn:   { padding:'6px 14px', borderRadius:20, background:'#ffa719', color:'#2d2926', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' },
  tabBar:         { display:'flex', gap:8, marginBottom:24, borderBottom:'1px solid #f0f0f0' },
  tabBtn:         { padding:'10px 20px', borderRadius:'10px 10px 0 0', border:'none', background:'none', color:'#888', cursor:'pointer', fontSize:14, fontWeight:500 },
  tabActive:      { background:'#fff', color:'#1a1a2e', borderBottom:'2px solid #421869' },
  filterBox:      { background:'#f8f9fa', borderRadius:12, padding:16, marginBottom:20 },
  filterRow:      { display:'flex', gap:12, flexWrap:'wrap' },
  filterField:    { flex:1, minWidth:200 },
  addCandBtn:     { padding:'6px 12px', borderRadius:8, border:'1px solid #421869', background:'white', color:'#421869', fontWeight:600, fontSize:12, cursor:'pointer' },
  label:          { fontSize:12, color:'#555', display:'block', marginBottom:4, fontWeight:600 },
  select:         { width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:13 },
  input:          { width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' },
  grid:           { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 },
  card:           { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  cardTitle:      { fontSize:14, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  cardDesc:       { fontSize:12, color:'#555', margin:0, lineHeight:1.4 },
  metaRow:        { display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 },
  meta:           { fontSize:11, color:'#666' },
  tagsRow:        { display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 },
  tag:            { fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600 },
  costBadge:      { display:'flex', alignItems:'center', gap:6, background:'#f3e8ff', borderRadius:8, padding:'6px 10px', marginBottom:14 },
  costText:       { fontSize:12, color:'#421869', fontWeight:600 },
  linkBox:        { background:'#f8f8f8', borderRadius:8, padding:'8px 10px' },
  candidatoBadge: { fontSize:11, color:'#421869', fontWeight:600, marginBottom:4, display:'block' },
  linkRow:        { display:'flex', alignItems:'center', gap:8 },
  linkText:       { flex:1, fontSize:11, color:'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  copyBtn:        { fontSize:12, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontWeight:600, flexShrink:0 },
  actionBtn:      { width:'100%', padding:'12px', borderRadius:10, border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' },
  loading:        { textAlign:'center', color:'#555', padding:40 },
  empty:          { textAlign:'center', color:'#666', padding:60, display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  resultsList:    { display:'flex', flexDirection:'column', gap:12 },
  resultCard:     { background:'#fff', borderRadius:14, padding:18, border:'1px solid #f0f0f0', boxShadow:'0 2px 6px rgba(0,0,0,0.04)' },
  resultHeader:   { display:'flex', alignItems:'center', gap:12, marginBottom:8 },
  resName:        { fontSize:15, fontWeight:700, color:'#1a1a2e', margin:'0 0 2px' },
  resEmail:       { fontSize:11, color:'#666', margin:'0 0 2px' },
  resInst:        { fontSize:12, color:'#555', margin:'0 0 2px' },
  resPerfil:      { fontSize:11, color:'#421869', margin:0, fontWeight:600 },
  resDate:        { fontSize:11, color:'#888', margin:'4px 0 0' },
  matchCircle:    (c: string) => ({ width:56, height:56, borderRadius:'50%', border:`3px solid ${c}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:`${c}11`, flexShrink:0 }),
  matchNum:       { fontSize:15, fontWeight:800, color:'#1a1a2e', lineHeight:1 },
  matchLabel:     { fontSize:9, color:'#555' },
  aptoBadge:      { fontSize:11, padding:'4px 10px', borderRadius:999, fontWeight:700 },
  perfilesHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  crearBtn:       { padding:'10px 20px', borderRadius:10, background:'#421869', color:'#fff', border:'none', fontWeight:700, fontSize:13, cursor:'pointer' },
  perfilCard:     { background:'#fff', borderRadius:14, padding:20, border:'1px solid #f0f0f0', display:'flex', alignItems:'center', gap:12 },
  perfilNombre:   { fontSize:14, fontWeight:700, color:'#1a1a2e', margin:0 },
  overlay:        { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 },
  modal:          { background:'#fff', borderRadius:20, padding:32, maxWidth:460, width:'90%', maxHeight:'90vh', overflowY:'auto' },
  modalTitle:     { fontSize:18, fontWeight:700, color:'#1a1a2e', marginBottom:8, marginTop:0 },
  sliderRow:      { display:'flex', alignItems:'center', gap:10, marginBottom:10 },
  sliderLabel:    { fontSize:13, color:'#444', width:70 },
  sliderVal:      { fontSize:13, fontWeight:700, color:'#1a1a2e', minWidth:36, textAlign:'right' },
  modalBtns:      { display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 },
  cancelBtn:      { padding:'10px 20px', borderRadius:8, border:'1px solid #ddd', background:'none', cursor:'pointer' },
  confirmBtn:     { padding:'10px 20px', borderRadius:8, background:'#421869', color:'#fff', border:'none', cursor:'pointer', fontWeight:700 },
  buyModal:       { background:'#fff', borderRadius:24, padding:32, maxWidth:480, width:'90%', position:'relative' },
  closeBtn:       { position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#888', lineHeight:1 },
  buyModalSub:    { fontSize:13, color:'#666', marginBottom:24, lineHeight:1.6 },
  packsGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 },
  packCard:       { border:'2px solid #e0e0e0', borderRadius:16, padding:'16px 12px', textAlign:'center', cursor:'pointer', background:'white', transition:'all 0.15s', position:'relative' },
  packCardActive: { border:'2px solid #421869', background:'#f3e8ff' },
  packCreditos:   { fontSize:32, fontWeight:900, color:'#421869', lineHeight:1, fontFamily:'Raleway, sans-serif' },
  packLabel:      { fontSize:12, color:'#555', margin:'4px 0' },
  packPrecio:     { fontSize:18, fontWeight:700, color:'#2d2926', margin:'4px 0' },
  packAhorro:     { fontSize:11, background:'#e8f5e9', color:'#2e7d32', borderRadius:99, padding:'2px 8px', display:'inline-block', fontWeight:600 },
  packLoading:    { fontSize:11, color:'#421869', marginTop:6 },
  paypalNote:     { textAlign:'center', fontSize:11, color:'#aaa', marginTop:12 },
}
