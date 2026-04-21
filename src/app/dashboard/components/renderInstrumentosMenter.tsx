// src/app/dashboard/components/renderInstrumentosMenter.tsx
// Tab "Instrumentos" exclusivo para Menters Premium y Master
// Permite ver todos los tests, generar links compartibles, y ver resultados de sus Personas

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { INSTRUMENTS, InstrumentId } from '@/lib/assessments/instruments';
import type { AssessmentResult } from '@/lib/assessments/instruments';

interface ShareLink { token: string; url: string; copied: boolean; }
interface PersonaResult {
  id: string;
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
  const [shareLinks, setShareLinks] = useState<Record<InstrumentId, ShareLink | null>>({} as any);
  const [loadingLink, setLoadingLink] = useState<InstrumentId | null>(null);
  const [resultados, setResultados] = useState<PersonaResult[]>([]);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [selectedResult, setSelectedResult] = useState<PersonaResult | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [vinculandoId, setVinculandoId] = useState<string | null>(null);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<string>('');

  const canAccess = (plan: ('master' | 'premium')[]) =>
    menterPlan === 'master' || (menterPlan === 'premium' && !plan.every(p => p === 'master'));

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

  // Generar link compartible
  const handleGenerarLink = async (instrumentId: InstrumentId) => {
    if (!canAccess(INSTRUMENTS[instrumentId].planesMenter)) return;
    setLoadingLink(instrumentId);
    const { data, error } = await supabase.rpc('create_assessment_link', {
      p_instrument_id: instrumentId,
      p_menter_id: userId,
    });
    if (!error && data) {
      // Construir URL desde el origen actual (evita dominio hardcodeado en la DB)
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://girolab.net'
      const url = `${origin}/test/${instrumentId}?t=${data.token}`
      setShareLinks(prev => ({ ...prev, [instrumentId]: { token: data.token, url, copied: false } }));
    }
    setLoadingLink(null);
  };

  // Copiar link
  const handleCopiarLink = (instrumentId: InstrumentId) => {
    const link = shareLinks[instrumentId];
    if (!link) return;
    navigator.clipboard.writeText(link.url);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'enlace_test_copiado', { instrument: instrumentId })
    }
    setShareLinks(prev => ({ ...prev, [instrumentId]: { ...link, copied: true } }));
    setTimeout(() => setShareLinks(prev => ({ ...prev, [instrumentId]: { ...link, copied: false } })), 2000);
  };

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

  if (!['premium', 'master'].includes(menterPlan)) {
    return (
      <div style={s.upgradeBox}>
        <span style={{ fontSize: 40 }}></span>
        <h3 style={s.upgradeTitle}>Instrumentos Psicométricos</h3>
        <p style={s.upgradeText}>Disponible para Menters Premium y Master. Actualiza tu plan para acceder a los 9 instrumentos validados.</p>
        <button style={s.upgradeBtn}>Ver planes</button>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Instrumentos Psicométricos</h2>
          <p style={s.subtitulo}>Comparte tests validados con tus personas y visualiza sus resultados</p>
        </div>
        <span style={{ ...s.planBadge, background: menterPlan === 'master' ? '#FFF3E0' : '#E8EAF6', color: menterPlan === 'master' ? '#E65100' : '#3949AB' }}>
          {menterPlan.charAt(0).toUpperCase() + menterPlan.slice(1)}
        </span>
      </div>

      {/* TABS */}
      <div style={s.tabBar}>
        {(['biblioteca', 'resultados'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabBtnActive : {}) }}>
            {tab === 'biblioteca' ? 'Biblioteca' : 'Resultados de personas'}
          </button>
        ))}
      </div>

      {/* ── BIBLIOTECA ── */}
      {activeTab === 'biblioteca' && (
        <div style={s.grid}>
          {(Object.values(INSTRUMENTS) as typeof INSTRUMENTS[InstrumentId][]).map(inst => {
            const acceso = canAccess(inst.planesMenter);
            const link = shareLinks[inst.id];
            const isLoading = loadingLink === inst.id;
            const soloMaster = inst.planesMenter.every((p: string) => p === 'master');

            return (
              <div key={inst.id} style={{ ...s.card, opacity: acceso ? 1 : 0.6 }}>
                {/* Badge Master-only */}
                {soloMaster && menterPlan !== 'master' && (
                  <span style={s.masterOnlyBadge}>Solo Master</span>
                )}
                {/* Ícono + nombre */}
                <div style={s.cardHeader}>
                  <span style={{ fontSize: 28 }}>{inst.icono}</span>
                  <div style={{ flex: 1 }}>
                    <p style={s.cardTitle}>{inst.nombre}</p>
                    <p style={s.cardDesc}>{inst.descripcion}</p>
                  </div>
                </div>

                {/* Meta */}
                <div style={s.metaRow}>
                  <span style={s.meta}>{inst.totalItems} ítems</span>
                  <span style={s.meta}>~{inst.tiempoMinutos} min</span>
                  <span style={s.meta}>{inst.referencia}</span>
                </div>

                {/* Tags */}
                <div style={s.tagsRow}>
                  {inst.tagsMenters.map((tag: string) => (
                    <span key={tag} style={{ ...s.tag, background: `${inst.color}22`, color: inst.color }}>{tag}</span>
                  ))}
                </div>

                {/* Link generado */}
                {link && (
                  <div style={s.linkBox}>
                    <span style={s.linkText}>{link.url}</span>
                    <button style={{ ...s.copyBtn, background: link.copied ? '#4CAF5022' : '#f5f5f5', color: link.copied ? '#4CAF50' : '#444' }}
                      onClick={() => handleCopiarLink(inst.id)}>
                      {link.copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}

                {/* Botones */}
                {acceso ? (
                  <button style={{ ...s.actionBtn, background: inst.color }}
                    disabled={isLoading}
                    onClick={() => link ? handleCopiarLink(inst.id) : handleGenerarLink(inst.id)}>
                    {isLoading ? 'Generando...' : link ? 'Copiar link' : 'Generar link'}
                  </button>
                ) : (
                  <button style={{ ...s.actionBtn, background: '#ccc', cursor: 'not-allowed' }} disabled>
                    Solo para Master
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
                        <p style={s.resultName}>{res.persona_nombre || 'Anónimo'}</p>
                        {res.persona_email && <p style={s.resultEmail}>{res.persona_email}</p>}
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
              Resultado de <strong>{selectedResult.persona_nombre}</strong> en <em>{INSTRUMENTS[selectedResult.instrument_id]?.nombre}</em>.
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
  tabBtn:         { padding:'10px 20px', borderRadius:'10px 10px 0 0', border:'none', background:'none', color:'#888', cursor:'pointer', fontSize:14, fontWeight:500 },
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
};