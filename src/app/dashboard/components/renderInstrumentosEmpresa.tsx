'use client';

import { useState, useEffect, useCallback } from 'react';
import GeneradorLinkEvaluacion from './GeneradorLinkEvaluacion';
import PerfilesPuesto, { type PerfilPuesto } from './PerfilesPuesto';
import CandidatosEvaluacion from './CandidatosEvaluacion';
import ModalComprarCreditos from './ModalComprarCreditos';
import { useCreditos } from './useCreditos';

type TabEmpresa = 'perfiles' | 'candidatos' | 'instrumentos' | 'resultados'

const TABS: { id: TabEmpresa; label: string }[] = [
  { id: 'perfiles',    label: 'Perfiles de Puesto' },
  { id: 'candidatos',  label: 'Candidatos'         },
  { id: 'instrumentos',label: 'Instrumentos'       },
  { id: 'resultados',  label: 'Resultados'         },
]

interface Props {
  empresaId: string;
  menterId?: string;
  isMaster?: boolean;
}

export default function RenderInstrumentosEmpresa({ empresaId, isMaster }: Props) {
  const [activeTab, setActiveTab]   = useState<TabEmpresa>('perfiles');
  const [perfiles, setPerfiles]     = useState<PerfilPuesto[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);

  // Créditos — Master evalúa sin costo
  const [showBuyModal, setShowBuyModal] = useState(false);
  const { creditos, mensaje: buyMsg } = useCreditos(empresaId, !isMaster);

  useEffect(() => {
    if (activeTab !== 'resultados') return
    let cancelado = false
    setLoadingRes(true)
    fetch('/api/evaluacion/resultados')
      .then(r => r.json())
      .then(json => { if (!cancelado) setResultados(json.resultados || []) })
      .catch(() => { if (!cancelado) setResultados([]) })
      .finally(() => { if (!cancelado) setLoadingRes(false) })
    return () => { cancelado = true }
  }, [activeTab])

  const handlePerfiles = useCallback((lista: PerfilPuesto[]) => setPerfiles(lista), [])

  const MATCH_COLOR = (m: number) => m >= 80 ? '#4CAF50' : m >= 65 ? '#FF9800' : '#F44336'

  return (
    <div style={s.container}>

      {/* ── HEADER con créditos ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Instrumentos de Selección y Diagnóstico</h2>
          <p style={s.sub}>Envía evaluaciones a candidatos y colaboradores</p>
        </div>
        {!isMaster && (
          <div style={s.creditBox}>
            <div style={s.creditCount}>
              <span style={s.creditNum}>{creditos ?? '—'}</span>
              <span style={s.creditLabel}>créditos</span>
            </div>
            <button style={s.buyBtn} onClick={() => setShowBuyModal(true)}>+ Comprar</button>
          </div>
        )}
      </div>

      {buyMsg && (
        <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>
          {buyMsg}
        </div>
      )}

      {!isMaster && creditos !== null && creditos <= 0 && (
        <div style={s.noCreditsBanner}>
          <span style={{ fontWeight: 700 }}>
            {creditos < 0
              ? `Sin créditos: ${Math.abs(creditos)} evaluación${Math.abs(creditos) !== 1 ? 'es' : ''} pendiente${Math.abs(creditos) !== 1 ? 's' : ''} de pago.`
              : 'Sin créditos disponibles.'}
          </span>{' '}
          Tus links siguen activos — nadie queda a medias — pero cada test terminado suma a la cuenta.
          <button style={s.bannerBuyBtn} onClick={() => setShowBuyModal(true)}>Comprar ahora</button>
        </div>
      )}

      {/* TABS */}
      <div style={s.tabBar}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...s.tabBtn, ...(activeTab === tab.id ? s.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PERFILES DE PUESTO: define los tests y crea el link ── */}
      {activeTab === 'perfiles' && <PerfilesPuesto onPerfilesChange={handlePerfiles} />}

      {/* ── CANDIDATOS: a quién se le envía ── */}
      {activeTab === 'candidatos' && <CandidatosEvaluacion perfiles={perfiles} />}

      {/* ── INSTRUMENTOS: link suelto, sin perfil de puesto ── */}
      {activeTab === 'instrumentos' && (
        <>
          <p style={s.notaTab}>
            Para una evaluación puntual que no corresponde a ningún puesto. Si estás
            seleccionando para una vacante, usa <strong>Perfiles de Puesto</strong>:
            ahí el link se crea solo y los resultados traen el match.
          </p>
          <GeneradorLinkEvaluacion
            consumeCreditos={!isMaster}
            creditos={creditos}
            onSinCreditos={() => setShowBuyModal(true)}
          />
        </>
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
                return (
                  <div key={i} style={s.resultCard}>
                    <div style={s.resultHeader}>
                      <div style={{flex:1}}>
                        <p style={s.resName}>{res.candidato_nombre || 'Candidato'}</p>
                        <p style={s.resEmail}>{res.candidato_email}</p>
                        <p style={s.resInst}>{res.instrumento_nombre || res.instrument_id}</p>
                        <p style={s.resPuntuacion}>
                          {res.severidad_label
                            ? res.severidad_label
                            : res.screening_positivo !== null
                              ? (res.screening_positivo ? 'Screening positivo' : 'Screening negativo')
                              : 'Sin puntuación'}
                          {res.puntuacion_bruta !== null && ` · ${res.puntuacion_bruta} pts`}
                        </p>
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

      {/* ── MODAL COMPRAR CRÉDITOS ── */}
      {!isMaster && showBuyModal && (
        <ModalComprarCreditos onClose={() => setShowBuyModal(false)} />
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
  tabBar:         { display:'flex', gap:8, marginBottom:24, borderBottom:'1px solid #f0f0f0', flexWrap:'wrap' },
  notaTab:        { fontSize:12.5, color:'#666', background:'#fafafa', borderRadius:10, padding:'10px 14px', marginBottom:16, lineHeight:1.6 },
  // Sin `border` abreviada: la pestaña activa cambia solo borderBottom y
  // mezclar ambas hace que React avise por estilos inconsistentes al alternar.
  tabBtn:         { padding:'10px 20px', borderRadius:'10px 10px 0 0', borderTop:'none', borderLeft:'none', borderRight:'none', borderBottom:'2px solid transparent', background:'none', color:'#888', cursor:'pointer', fontSize:14, fontWeight:500 },
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
  resPuntuacion:  { fontSize:12, color:'#1a1a2e', margin:'0 0 2px', fontWeight:700 },
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
