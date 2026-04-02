// ============================================================
// ARCHIVO 1: src/app/dashboard/components/renderResultadosTests.tsx
// Tab "Mis Resultados" en el dashboard de Persona
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { INSTRUMENTS } from '@/lib/assessments/instruments';
import type { InstrumentId, AssessmentResult, DimensionScore } from '@/lib/assessments/instruments';

interface PersonaResult {
  id: string;
  instrument_id: InstrumentId;
  puntuacion_bruta: number | null;
  severidad_label: string | null;
  screening_positivo: boolean | null;
  resultado_json: AssessmentResult;
  roadmap_objetivo_id: string | null;
  created_at: string;
  menter_nombre: string | null;
  menter_avatar: string | null;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  Mínima:      { bg:'#E8F5E9', text:'#2E7D32' },
  Leve:        { bg:'#FFF8E1', text:'#F57F17' },
  Moderada:    { bg:'#FFF3E0', text:'#E65100' },
  Severa:      { bg:'#FFEBEE', text:'#B71C1C' },
  Positivo:    { bg:'#FFEBEE', text:'#B71C1C' },
  Negativo:    { bg:'#E8F5E9', text:'#2E7D32' },
  Bajo:        { bg:'#E8F5E9', text:'#2E7D32' },
  Medio:       { bg:'#FFF8E1', text:'#F57F17' },
  Moderado:    { bg:'#FFF3E0', text:'#E65100' },
  Promedio:    { bg:'#FFF8E1', text:'#F57F17' },
  Alto:        { bg:'#FFF3E0', text:'#E65100' },
  Elevado:     { bg:'#FFF3E0', text:'#E65100' },
  'Muy elevado':{ bg:'#FFEBEE', text:'#B71C1C' },
};

interface Props { userId: string; }

export default function RenderResultadosTests({ userId }: Props) {
  const [resultados, setResultados] = useState<PersonaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PersonaResult | null>(null);

  useEffect(() => {
    supabase.from('v_persona_assessment_results')
      .select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setResultados(data || []); setLoading(false); });
  }, [userId]);

  if (loading) return <div style={s.loading}>Cargando tus resultados...</div>;

  if (resultados.length === 0) return (
    <div style={s.empty}>
      <span style={{ fontSize: 48 }}>📋</span>
      <p style={s.emptyTitle}>Aún no tienes resultados</p>
      <p style={s.emptyText}>Tu Menter puede enviarte un test psicométrico para conocerte mejor.</p>
    </div>
  );

  return (
    <div style={s.container}>
      <h2 style={s.titulo}>Mis Resultados</h2>
      <p style={s.subtitulo}>Evaluaciones psicométricas compartidas por tu Menter</p>

      <div style={s.grid}>
        {resultados.map(res => {
          const inst = INSTRUMENTS[res.instrument_id];
          const sev = res.severidad_label;
          const sevStyle = sev ? SEVERITY_COLORS[sev] : null;

          return (
            <button key={res.id} style={s.card} onClick={() => setSelected(res)}>
              {/* Header */}
              <div style={s.cardTop}>
                <span style={{ fontSize: 30 }}>{inst?.icono || '📋'}</span>
                <div style={{ flex: 1 }}>
                  <p style={s.instName}>{inst?.nombre || res.instrument_id}</p>
                  <p style={s.dateText}>{new Date(res.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' })}</p>
                  {res.menter_nombre && (
                    <p style={s.menterText}>Enviado por {res.menter_nombre}</p>
                  )}
                </div>
                {sevStyle && sev && (
                  <span style={{ ...s.badge, background: sevStyle.bg, color: sevStyle.text }}>{sev}</span>
                )}
              </div>

              {/* Mini chart: barras por dimensión */}
              {res.resultado_json?.dimensiones && (
                <div style={s.miniDims}>
                  {res.resultado_json.dimensiones.slice(0, 3).map((dim: { dimension: string; score: number; label?: string }, i: number) => {
                    const inst2 = INSTRUMENTS[res.instrument_id];
                    const maxScore = getMaxScore(res.instrument_id, dim);
                    const pct = Math.min((dim.score / maxScore) * 100, 100);
                    return (
                      <div key={i} style={s.miniDimRow}>
                        <span style={s.miniDimName}>{dim.dimension.length > 18 ? dim.dimension.slice(0,18)+'…' : dim.dimension}</span>
                        <div style={s.miniBar}>
                          <div style={{ width:`${pct}%`, height:'100%', background: inst2?.color || '#5C6BC0', borderRadius:3, transition:'width 0.8s ease' }} />
                        </div>
                        <span style={s.miniScore}>{dim.score.toFixed(dim.score < 10 ? 1 : 0)}</span>
                      </div>
                    );
                  })}
                  {res.resultado_json.dimensiones.length > 3 && (
                    <p style={s.verMas}>+{res.resultado_json.dimensiones.length - 3} más — toca para ver todo</p>
                  )}
                </div>
              )}

              {/* Roadmap badge */}
              {res.roadmap_objetivo_id && (
                <div style={s.roadmapBadge}>📌 Vinculado a tu Ruta de Bienestar</div>
              )}
            </button>
          );
        })}
      </div>

      {/* MODAL DETALLE */}
      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <div style={s.modalHeader}>
              <span style={{ fontSize: 36 }}>{INSTRUMENTS[selected.instrument_id]?.icono || '📋'}</span>
              <div>
                <h3 style={s.modalTitle}>{INSTRUMENTS[selected.instrument_id]?.nombre}</h3>
                <p style={s.modalSub}>{new Date(selected.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' })}</p>
              </div>
            </div>

            {/* PB */}
            {selected.puntuacion_bruta !== null && (
              <div style={s.pbSection}>
                <span style={s.pbLabel}>Puntuación total</span>
                <span style={s.pbValue}>{selected.puntuacion_bruta}</span>
                {selected.severidad_label && (() => {
                  const c = SEVERITY_COLORS[selected.severidad_label];
                  return <span style={{ ...s.badge, background:c?.bg, color:c?.text }}>{selected.severidad_label}</span>;
                })()}
              </div>
            )}
            {selected.screening_positivo !== null && selected.puntuacion_bruta === null && (
              <div style={s.pbSection}>
                <span style={{ ...s.badge, background: selected.screening_positivo ? '#FFEBEE' : '#E8F5E9', color: selected.screening_positivo ? '#B71C1C' : '#2E7D32', fontSize:16, padding:'8px 20px' }}>
                  {selected.screening_positivo ? '⚠️ Screening Positivo' : '✓ Screening Negativo'}
                </span>
              </div>
            )}

            {/* Interpretación */}
            <p style={s.interp}>{selected.resultado_json?.interpretacion}</p>
            {selected.resultado_json?.nota && (
              <div style={s.notaBox}><span>ℹ️</span><p style={{ margin:0, fontSize:13 }}>{selected.resultado_json.nota}</p></div>
            )}

            {/* Dimensiones completas con barras */}
            <h4 style={s.dimsTitle}>Dimensiones</h4>
            <div style={s.dimsList}>
              {selected.resultado_json?.dimensiones?.map((dim: { dimension: string; score: number; label?: string }, i: number) => {
                const max = getMaxScore(selected.instrument_id, dim);
                const pct = Math.min((dim.score / max) * 100, 100);
                const inst = INSTRUMENTS[selected.instrument_id];
                const sevC = dim.label ? SEVERITY_COLORS[dim.label] : null;
                return (
                  <div key={i} style={s.dimItem}>
                    <div style={s.dimItemHeader}>
                      <span style={s.dimItemName}>{dim.dimension}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={s.dimItemScore}>{dim.score.toFixed(dim.score < 10 ? 2 : 0)}</span>
                        {sevC && dim.label && <span style={{ ...s.badge, background:sevC.bg, color:sevC.text, fontSize:11 }}>{dim.label}</span>}
                      </div>
                    </div>
                    <div style={s.barTrack}>
                      <div style={{ width:`${pct}%`, height:'100%', background: inst?.color || '#5C6BC0', borderRadius:4, transition:'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Roadmap */}
            {selected.roadmap_objetivo_id && (
              <div style={s.roadmapDetail}>📌 Este resultado está vinculado a tu Ruta de Bienestar</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getMaxScore(instrumentId: InstrumentId, dim: DimensionScore): number {
  const byInstrument: Partial<Record<InstrumentId, number>> = {
    BDI_II: 63, BAI: 63, MDQ: 13, ASRS_v1_1: 6,
    BIG_FIVE: 5, NPI_40: 40, MSI_BPD: 10, DARK_TRIAD: 5, PID_5: 3,
  };
  return byInstrument[instrumentId] ?? 100;
}

const s: Record<string, React.CSSProperties> = {
  container:     { padding:'24px 0' },
  titulo:        { fontSize:22, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  subtitulo:     { fontSize:14, color:'#888', margin:'0 0 24px' },
  loading:       { textAlign:'center', color:'#888', padding:60 },
  empty:         { textAlign:'center', padding:60, display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  emptyTitle:    { fontSize:18, fontWeight:700, color:'#1a1a2e', margin:0 },
  emptyText:     { fontSize:14, color:'#aaa', maxWidth:320, margin:0 },
  grid:          { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 },
  card:          { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', cursor:'pointer', textAlign:'left', transition:'box-shadow 0.2s' },
  cardTop:       { display:'flex', gap:12, alignItems:'flex-start', marginBottom:14 },
  instName:      { fontSize:13, fontWeight:700, color:'#1a1a2e', margin:'0 0 2px', lineHeight:1.3 },
  dateText:      { fontSize:11, color:'#bbb', margin:'0 0 2px' },
  menterText:    { fontSize:11, color:'#aaa', margin:0 },
  badge:         { fontSize:11, padding:'3px 10px', borderRadius:999, fontWeight:700 },
  miniDims:      { display:'flex', flexDirection:'column', gap:6, marginTop:4 },
  miniDimRow:    { display:'flex', alignItems:'center', gap:8 },
  miniDimName:   { fontSize:11, color:'#888', width:110, flexShrink:0 },
  miniBar:       { flex:1, height:6, background:'#f0f0f0', borderRadius:3, overflow:'hidden' },
  miniScore:     { fontSize:11, color:'#444', fontWeight:700, minWidth:24, textAlign:'right' },
  verMas:        { fontSize:11, color:'#bbb', margin:'4px 0 0', textAlign:'right' },
  roadmapBadge:  { marginTop:10, fontSize:11, color:'#5C6BC0', fontWeight:600 },
  overlay:       { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000 },
  modal:         { background:'#fff', borderRadius:'20px 20px 0 0', padding:28, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', position:'relative' },
  closeBtn:      { position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#888' },
  modalHeader:   { display:'flex', gap:14, alignItems:'center', marginBottom:20 },
  modalTitle:    { fontSize:18, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  modalSub:      { fontSize:13, color:'#aaa', margin:0 },
  pbSection:     { display:'flex', alignItems:'center', gap:12, marginBottom:12 },
  pbLabel:       { fontSize:13, color:'#888' },
  pbValue:       { fontSize:32, fontWeight:800, color:'#1a1a2e' },
  interp:        { fontSize:14, color:'#555', lineHeight:1.6, margin:'8px 0 12px', padding:'12px 16px', background:'#f8f8fb', borderRadius:10 },
  notaBox:       { display:'flex', gap:8, background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:10, padding:'10px 14px', marginBottom:12 },
  dimsTitle:     { fontSize:15, fontWeight:700, color:'#1a1a2e', margin:'16px 0 10px' },
  dimsList:      { display:'flex', flexDirection:'column', gap:12 },
  dimItem:       { },
  dimItemHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  dimItemName:   { fontSize:13, color:'#555', fontWeight:500 },
  dimItemScore:  { fontSize:15, fontWeight:800, color:'#1a1a2e' },
  barTrack:      { height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' },
  roadmapDetail: { marginTop:16, fontSize:13, color:'#5C6BC0', fontWeight:600, textAlign:'center' },
};


// ============================================================
// ARCHIVO 2: src/app/test/[instrument]/page.tsx
// Página pública de toma del test (URL compartible por Menter)
// ============================================================
// Ruta: /test/bdi-ii?t=TOKEN
// El TOKEN vincula la sesión al Menter que compartió el link

// NOTE: Este es el skeleton del flujo. Los ítems de cada test
// deben cargarse desde el archivo de preguntas correspondiente.
// Ver /src/lib/assessments/items/ (un archivo por instrumento)

/*
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { INSTRUMENTS, scoreInstrument, parseNPIResponses } from '@/lib/assessments/instruments';
import type { InstrumentId, Responses } from '@/lib/assessments/instruments';
import { ITEMS } from '@/lib/assessments/items'; // { BDI_II: [...], BAI: [...], ... }

export default function TestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const instrumentId = (params.instrument as string).toUpperCase().replace('-', '_') as InstrumentId;
  const token = searchParams.get('t') || '';

  const [itemIndex, setItemIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inst = INSTRUMENTS[instrumentId];
  const items = ITEMS[instrumentId] || [];
  const currentItem = items[itemIndex];
  const progress = Math.round(((itemIndex) / items.length) * 100);

  // Iniciar sesión al cargar
  useEffect(() => {
    if (!token) return; // Sin token: sesión nueva desde landing
    supabase.from('assessment_sessions')
      .select('id').eq('session_token', token).single()
      .then(({ data }) => { if (data) setSessionId(data.id); });
  }, [token]);

  const handleSelect = (valor: number) => {
    const newResponses = { ...responses, [currentItem.numero]: valor };
    setResponses(newResponses);
    if (itemIndex < items.length - 1) {
      setTimeout(() => setItemIndex(i => i + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Calcular resultado
    const parsedResponses = instrumentId === 'NPI_40'
      ? parseNPIResponses(responses as any)
      : responses;
    const result = scoreInstrument(instrumentId, parsedResponses);

    // Guardar en Supabase
    const { data } = await supabase.rpc('save_assessment_result', {
      p_session_token: token,
      p_persona_id: user?.id || null,
      p_instrument_id: instrumentId,
      p_puntuacion_bruta: result.puntuacionBruta ?? null,
      p_resultado_json: result,
      p_screening_positivo: result.screeningPositivo ?? null,
      p_severidad_label: result.severidadLabel ?? null,
      p_tags_menters: result.tagsMenters,
    });

    // Redirigir a resultados
    if (user) {
      router.push('/dashboard?tab=resultados');
    } else {
      router.push(`/test/${params.instrument}/resultado?t=${token}`);
    }
  };

  // ... render del stepper de preguntas
}
*/