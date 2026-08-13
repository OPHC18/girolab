// src/app/dashboard/components/renderInstrumentosMenter.tsx
// Tab "Instrumentos" del Menter: genera links de evaluación reutilizables
// (uno o varios instrumentos por link) y muestra los resultados de sus Personas.

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { INSTRUMENTS, InstrumentId } from '@/lib/assessments/instruments';
import type { AssessmentResult } from '@/lib/assessments/instruments';
import { CATALOG_LIST } from '@/lib/assessments/catalog';
import GeneradorLinkEvaluacion from './GeneradorLinkEvaluacion';
import ModalComprarCreditos from './ModalComprarCreditos';
import { useCreditos } from './useCreditos';

interface PersonaResult {
  id: string;
  candidato_nombre: string | null;
  candidato_email: string | null;
  persona_nombre: string | null;
  persona_email: string | null;
  persona_id: string | null;
  es_registrado: boolean;
  instrument_id: InstrumentId;
  puntuacion_bruta: number | null;
  severidad_label: string | null;
  screening_positivo: boolean | null;
  resultado_json: AssessmentResult;
  roadmap_objetivo_id: string | null;
  created_at: string;
}
interface Objetivo { id: string; titulo: string; }

interface Props {
  userId: string;
  menterPlan: string; // 'free' | 'starter' | 'premium' | 'master'
}

export default function RenderInstrumentosMenter({ userId, menterPlan }: Props) {
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'resultados'>('biblioteca');
  const [resultados, setResultados] = useState<PersonaResult[]>([]);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [selectedResult, setSelectedResult] = useState<PersonaResult | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [vinculandoId, setVinculandoId] = useState<string | null>(null);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<string>('');
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Free y Starter generan links pagando créditos; Premium y Master, sin costo
  const isFreeStarter = !['premium', 'master'].includes(menterPlan);
  const { creditos, setCreditos, mensaje: buyMsg } = useCreditos(userId, isFreeStarter);

  // Instrumentos reservados a Master, deshabilitados para Premium
  const bloqueados = Object.fromEntries(
    CATALOG_LIST
      .filter(i => menterPlan === 'premium' && i.planesMenter.every(p => p === 'master'))
      .map(i => [i.id, 'Solo Master'])
  );

  // Cargar resultados de personas
  useEffect(() => {
    if (activeTab !== 'resultados') return;
    setLoadingResultados(true);
    supabase.from('v_menter_assessment_results').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setResultados(data || []); setLoadingResultados(false); });
  }, [activeTab]);

  // Cargar objetivos del Menter (para vincular al Roadmap)
  useEffect(() => {
    if (!selectedResult?.persona_id) return;
    setObjetivos([]);
    supabase
      .from('roadmaps')
      .select('id')
      .eq('menter_id', userId)
      .eq('client_id', selectedResult.persona_id)
      .maybeSingle()
      .then(({ data: roadmap }) => {
        if (!roadmap) return;
        supabase
          .from('roadmap_objectives')
          .select('id, titulo')
          .eq('roadmap_id', roadmap.id)
          .order('created_at', { ascending: true })
          .then(({ data }) => setObjetivos(data || []));
      });
  }, [selectedResult, userId]);

  // Vincular resultado al Roadmap
  const handleVincular = async (resultId: string) => {
    if (!objetivoSeleccionado) return;
    setVinculandoId(resultId);
    await supabase.rpc('link_result_to_roadmap', {
      p_result_id: resultId,
      p_objetivo_id: objetivoSeleccionado,
      p_menter_id: userId,
    });
    setResultados(prev => prev.map(r => r.id === resultId ? { ...r, roadmap_objetivo_id: objetivoSeleccionado } : r));
    setVinculandoId(null);
    setSelectedResult(null);
    setObjetivoSeleccionado('');
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  const SEVERITY_COLORS: Record<string, string> = {
    Mínima: '#4CAF50', Leve: '#FFC107', Moderada: '#FF9800', Severa: '#F44336',
    Positivo: '#F44336', Negativo: '#4CAF50', Bajo: '#4CAF50', Promedio: '#FFC107',
    Elevado: '#FF9800', 'Muy elevado': '#F44336', Medio: '#FFC107', Alto: '#FF9800', Moderado: '#FF9800',
    // BarOn ICE
    'Capacidad Muy Desarrollada': '#4CAF50',
    'Capacidad Adecuada':         '#2196F3',
    'Área de Oportunidad':        '#FF9800',
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Instrumentos Psicométricos</h2>
          <p style={s.subtitulo}>Genera un link con las evaluaciones que necesites y compártelo con tus personas</p>
        </div>
        <span style={{ ...s.planBadge, background: menterPlan === 'master' ? '#FFF3E0' : '#E8EAF6', color: menterPlan === 'master' ? '#E65100' : '#3949AB' }}>
          {menterPlan.charAt(0).toUpperCase() + menterPlan.slice(1)}
        </span>
      </div>

      {isFreeStarter && (
        <div style={s.creditBanner}>
          <span style={s.creditBannerText}>
            {creditos === null
              ? '...'
              : creditos < 0
                ? `Sin créditos · ${Math.abs(creditos)} evaluación${Math.abs(creditos) !== 1 ? 'es' : ''} pendiente${Math.abs(creditos) !== 1 ? 's' : ''} de pago`
                : `${creditos} crédito${creditos !== 1 ? 's' : ''} disponible${creditos !== 1 ? 's' : ''}`}
          </span>
          <button style={s.creditBannerBtn} onClick={() => setShowBuyModal(true)}>+ Comprar</button>
        </div>
      )}
      {buyMsg && (
        <div style={{ background: '#e8f5e9', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#2e7d32', fontWeight: 600 as const }}>
          {buyMsg}
        </div>
      )}

      {/* TABS */}
      <div style={s.tabBar}>
        {(['biblioteca', 'resultados'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabBtnActive : {}) }}>
            {tab === 'biblioteca' ? 'Enviar evaluaciones' : 'Resultados de personas'}
          </button>
        ))}
      </div>

      {/* ── GENERAR LINK ── */}
      {activeTab === 'biblioteca' && (
        <GeneradorLinkEvaluacion
          consumeCreditos={isFreeStarter}
          creditos={creditos}
          onSinCreditos={() => setShowBuyModal(true)}
          bloqueados={bloqueados}
        />
      )}

      {/* ── RESULTADOS ── */}
      {activeTab === 'resultados' && (
        <div>
          {loadingResultados ? (
            <div style={s.loading}>Cargando resultados...</div>
          ) : resultados.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize: 40 }}></span>
              <p>Aún no hay resultados. Comparte un link de test con tus personas.</p>
            </div>
          ) : (
            <div style={s.resultsList}>
              {resultados.map(res => {
                const inst = INSTRUMENTS[res.instrument_id as InstrumentId];
                return (
                  <div key={res.id} style={s.resultCard}>
                    <div style={s.resultHeader}>
                      <span style={{ fontSize: 22 }}>{inst?.icono || '📋'}</span>
                      <div style={{ flex: 1 }}>
                        <p style={s.resultName}>{res.candidato_nombre || res.persona_nombre || 'Anónimo'}</p>
                        {(res.candidato_email || res.persona_email) && <p style={s.resultEmail}>{res.candidato_email || res.persona_email}</p>}
                        <p style={s.resultInst}>{inst?.nombre || res.instrument_id}</p>
                        <p style={s.resultDate}>{new Date(res.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}</p>
                      </div>
                      {/* Severidad / Screening */}
                      {res.severidad_label && (
                        <span style={{ ...s.severityBadge, background: `${SEVERITY_COLORS[res.severidad_label] || '#999'}22`, color: SEVERITY_COLORS[res.severidad_label] || '#999' }}>
                          {res.severidad_label}
                        </span>
                      )}
                      {res.screening_positivo !== null && !res.severidad_label && (
                        <span style={{ ...s.severityBadge, background: res.screening_positivo ? '#F4433622' : '#4CAF5022', color: res.screening_positivo ? '#F44336' : '#4CAF50' }}>
                          {res.screening_positivo ? 'Positivo' : 'Negativo'}
                        </span>
                      )}
                    </div>

                    {/* Dimensiones */}
                    {res.resultado_json?.dimensiones?.map((dim: { dimension: string; score: number; label?: string }, i: number) => (
                      <div key={i} style={s.dimRow}>
                        <span style={s.dimName}>{dim.dimension}</span>
                        <span style={s.dimScore}>{typeof dim.score === 'number' ? dim.score.toFixed(dim.score < 10 ? 2 : 0) : dim.score}</span>
                        {dim.label && <span style={{ ...s.dimLabel, background: `${SEVERITY_COLORS[dim.label] || '#999'}22`, color: SEVERITY_COLORS[dim.label] || '#999' }}>{dim.label}</span>}
                      </div>
                    ))}

                    {/* Acciones */}
                    <div style={s.resultActions}>
                      {res.roadmap_objetivo_id ? (
                        <>
                          <span style={s.vinculadoBadge}>Vinculado al Roadmap</span>
                          <button style={s.reubicarBtn} onClick={() => { setObjetivoSeleccionado(res.roadmap_objetivo_id!); setSelectedResult(res); }}>
                            Cambiar objetivo
                          </button>
                        </>
                      ) : (
                        <button style={s.vincularBtn} onClick={() => setSelectedResult(res)}>
                          Vincular al Roadmap
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: VINCULAR AL ROADMAP ── */}
      {selectedResult && (
        <div style={s.modalOverlay} onClick={() => { setSelectedResult(null); setObjetivoSeleccionado(''); }}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{selectedResult.roadmap_objetivo_id ? 'Cambiar objetivo vinculado' : 'Vincular resultado al Roadmap'}</h3>
            <p style={s.modalSub}>
              Resultado de <strong>{selectedResult.candidato_nombre || selectedResult.persona_nombre || 'Anónimo'}</strong> en <em>{INSTRUMENTS[selectedResult.instrument_id]?.nombre}</em>.
            </p>
            {objetivos.length === 0 ? (
              <p style={{ color: '#888', fontSize: 14 }}>No hay objetivos en el Roadmap de esta persona aún.</p>
            ) : (
              <select style={s.select} value={objetivoSeleccionado} onChange={e => setObjetivoSeleccionado(e.target.value)}>
                <option value="">— Selecciona un objetivo —</option>
                {objetivos.map(obj => <option key={obj.id} value={obj.id}>{obj.titulo}</option>)}
              </select>
            )}
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => { setSelectedResult(null); setObjetivoSeleccionado(''); }}>Cancelar</button>
              <button style={{ ...s.confirmBtn, opacity: objetivoSeleccionado ? 1 : 0.5 }}
                disabled={!objetivoSeleccionado || !!vinculandoId}
                onClick={() => handleVincular(selectedResult.id)}>
                {vinculandoId === selectedResult.id ? 'Guardando...' : selectedResult.roadmap_objetivo_id ? 'Actualizar' : 'Vincular'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL COMPRAR CRÉDITOS (plan free/starter) ── */}
      {isFreeStarter && showBuyModal && (
        <ModalComprarCreditos onClose={() => setShowBuyModal(false)} />
      )}
    </div>
  );
}

// ── ESTILOS ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container:      { padding: '24px 0' },
  header:         { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  titulo:         { fontSize:22, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  subtitulo:      { fontSize:14, color:'#555', margin:0 },
  planBadge:      { fontSize:12, padding:'4px 12px', borderRadius:999, fontWeight:700, textTransform:'capitalize' },
  tabBar:         { display:'flex', gap:8, marginBottom:24, borderBottom:'1px solid #f0f0f0', paddingBottom:0 },
  // Sin `border` abreviada: la pestaña activa cambia solo borderBottom y
  // mezclar ambas hace que React avise por estilos inconsistentes al alternar.
  tabBtn:         { padding:'10px 20px', borderRadius:'10px 10px 0 0', borderTop:'none', borderLeft:'none', borderRight:'none', borderBottom:'2px solid transparent', background:'none', color:'#888', cursor:'pointer', fontSize:14, fontWeight:500 },
  tabBtnActive:   { background:'#fff', color:'#1a1a2e', borderBottom:'2px solid #5C6BC0' },
  grid:           { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 },
  card:           { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative' },
  masterOnlyBadge:{ position:'absolute', top:12, right:12, fontSize:10, padding:'2px 8px', borderRadius:999, background:'#FFF3E0', color:'#E65100', fontWeight:700 },
  cardHeader:     { display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 },
  cardTitle:      { fontSize:14, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  cardDesc:       { fontSize:12, color:'#555', margin:0, lineHeight:1.4 },
  metaRow:        { display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 },
  meta:           { fontSize:11, color:'#666' },
  tagsRow:        { display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 },
  tag:            { fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600 },
  linkBox:        { display:'flex', alignItems:'center', gap:8, background:'#f8f8f8', borderRadius:8, padding:'8px 12px', marginBottom:10 },
  linkText:       { flex:1, fontSize:11, color:'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  copyBtn:        { fontSize:12, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontWeight:600, transition:'all 0.2s' },
  actionBtn:      { width:'100%', padding:'12px', borderRadius:10, border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' },
  loading:        { textAlign:'center', color:'#555', padding:40, fontSize:14 },
  empty:          { textAlign:'center', color:'#666', padding:60, display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  resultsList:    { display:'flex', flexDirection:'column', gap:12 },
  resultCard:     { background:'#fff', borderRadius:14, padding:18, border:'1px solid #f0f0f0', boxShadow:'0 2px 6px rgba(0,0,0,0.04)' },
  resultHeader:   { display:'flex', alignItems:'center', gap:12, marginBottom:12 },
  resultName:     { fontSize:15, fontWeight:700, color:'#1a1a2e', margin:'0 0 2px' },
  resultEmail:    { fontSize:11, color:'#666', margin:'0 0 2px' },
  resultInst:     { fontSize:12, color:'#555', margin:'0 0 2px' },
  resultDate:     { fontSize:11, color:'#666', margin:0 },
  severityBadge:  { fontSize:12, padding:'4px 12px', borderRadius:999, fontWeight:700 },
  dimRow:         { display:'flex', alignItems:'center', gap:8, padding:'4px 0', borderBottom:'1px solid #fafafa' },
  dimName:        { flex:1, fontSize:13, color:'#555' },
  dimScore:       { fontSize:13, fontWeight:700, color:'#1a1a2e' },
  dimLabel:       { fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600 },
  resultActions:  { marginTop:12, display:'flex', justifyContent:'flex-end' },
  vinculadoBadge: { fontSize:12, color:'#4CAF50', fontWeight:600 },
  vincularBtn:    { fontSize:13, padding:'6px 14px', borderRadius:8, border:'1px solid #5C6BC0', background:'none', color:'#5C6BC0', cursor:'pointer', fontWeight:600 },
  reubicarBtn:    { fontSize:12, padding:'4px 10px', borderRadius:8, border:'1px solid #ddd', background:'none', color:'#888', cursor:'pointer', marginLeft:8 },
  upgradeBox:     { textAlign:'center', padding:60, display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  upgradeTitle:   { fontSize:20, fontWeight:700, color:'#1a1a2e', margin:0 },
  upgradeText:    { fontSize:14, color:'#555', maxWidth:360 },
  upgradeBtn:     { padding:'12px 28px', borderRadius:10, background:'#5C6BC0', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' },
  modalOverlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal:          { background:'#fff', borderRadius:20, padding:32, maxWidth:440, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' },
  modalTitle:     { fontSize:18, fontWeight:700, color:'#1a1a2e', marginBottom:8, marginTop:0 },
  modalSub:       { fontSize:14, color:'#666', marginBottom:20, lineHeight:1.6 },
  select:         { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, marginBottom:20 },
  modalBtns:      { display:'flex', gap:10, justifyContent:'flex-end' },
  cancelBtn:      { padding:'10px 20px', borderRadius:8, border:'1px solid #ddd', background:'none', cursor:'pointer', fontSize:14 },
  confirmBtn:     { padding:'10px 20px', borderRadius:8, background:'#5C6BC0', color:'#fff', border:'none', cursor:'pointer', fontSize:14, fontWeight:700 },
  creditBanner:     { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f3e8ff', borderRadius:12, padding:'10px 16px', marginBottom:16 },
  creditBannerText: { fontSize:13, color:'#421869', fontWeight:700 },
  creditBannerBtn:  { padding:'6px 14px', borderRadius:20, background:'#421869', color:'#fff', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' },
  buyModal:       { background:'#fff', borderRadius:24, padding:32, maxWidth:480, width:'90%', position:'relative' },
  closeBtn:       { position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#888' },
  buyModalSub:    { fontSize:13, color:'#666', marginBottom:24, lineHeight:1.6 },
  packsGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 },
  packCard:       { border:'2px solid #e0e0e0', borderRadius:16, padding:'16px 12px', textAlign:'center', cursor:'pointer', background:'white' },
  packCardActive: { border:'2px solid #421869', background:'#f3e8ff' },
  packCreditos:   { fontSize:32, fontWeight:900, color:'#421869', fontFamily:'Raleway, sans-serif' },
  packLabel:      { fontSize:12, color:'#555', margin:'4px 0' },
  packPrecio:     { fontSize:18, fontWeight:700, color:'#2d2926', margin:'4px 0' },
  packAhorro:     { fontSize:11, background:'#e8f5e9', color:'#2e7d32', borderRadius:99, padding:'2px 8px', display:'inline-block', fontWeight:600 },
  packLoading:    { fontSize:11, color:'#421869', marginTop:6 },
  paypalNote:     { textAlign:'center', fontSize:11, color:'#aaa', marginTop:12 },
};