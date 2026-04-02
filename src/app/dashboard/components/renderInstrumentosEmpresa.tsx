// ============================================================
// ARCHIVO 1: src/app/dashboard/components/renderInstrumentosEmpresa.tsx
// Tab "Instrumentos" en el dashboard de Empresa
// Misma dinámica que renderInstrumentosMenter pero orientado a
// Selección de Talento y Diagnóstico Organizacional
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { EMPRESA_INSTRUMENTS, EmpresaInstrumentId } from '@/lib/assessments/instruments_empresa';
import { INSTRUMENTS, InstrumentId } from '@/lib/assessments/instruments';

// Instrumentos disponibles para Empresa (organizacionales + bienestar colectivo)
const EMPRESA_INSTRUMENT_IDS: EmpresaInstrumentId[] = ['DISC', 'HEXACO_HH'];

interface ShareLink { token: string; url: string; copied: boolean; candidato?: string; }
interface JobProfile { id: string; nombre: string; }

interface Props {
  empresaId: string;
  menterId?: string; // Si la empresa trabaja con un Menter asignado
}

export default function RenderInstrumentosEmpresa({ empresaId, menterId }: Props) {
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'resultados' | 'perfiles'>('biblioteca');
  const [shareLinks, setShareLinks] = useState<Record<string, ShareLink>>({});
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [candidatoEmail, setCandidatoEmail] = useState('');
  const [candidatoNombre, setCandidatoNombre] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [showCrearPerfil, setShowCrearPerfil] = useState(false);
  const [nuevoPerfil, setNuevoPerfil] = useState({ nombre: '', disc_D: 70, disc_I: 60, disc_S: 40, disc_C: 50, hexaco_minimo: 3.5 });

  useEffect(() => {
    supabase.from('job_profiles').select('id, nombre').eq('empresa_id', empresaId).eq('activo', true)
      .then(({ data }) => setJobProfiles(data || []));
  }, [empresaId]);

  useEffect(() => {
    if (activeTab !== 'resultados') return;
    setLoadingRes(true);
    supabase.from('v_empresa_assessment_results').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setResultados(data || []); setLoadingRes(false); });
  }, [activeTab]);

  const handleGenerarLink = async (instrumentId: string) => {
    const key = `${instrumentId}_${selectedProfile || 'libre'}`;
    setLoadingLink(key);
    const { data } = await supabase.rpc('create_empresa_assessment_link', {
      p_instrument_id: instrumentId,
      p_empresa_id: empresaId,
      p_menter_id: menterId || null,
      p_job_profile_id: selectedProfile || null,
      p_candidato_email: candidatoEmail || null,
      p_candidato_nombre: candidatoNombre || null,
    });
    if (data) setShareLinks(prev => ({ ...prev, [key]: { token: data.token, url: data.url, copied: false, candidato: candidatoNombre } }));
    setLoadingLink(null);
  };

  const handleCopiar = (key: string) => {
    const link = shareLinks[key];
    if (!link) return;
    navigator.clipboard.writeText(link.url);
    setShareLinks(prev => ({ ...prev, [key]: { ...link, copied: true } }));
    setTimeout(() => setShareLinks(prev => ({ ...prev, [key]: { ...link, copied: false } })), 2000);
  };

  const handleCrearPerfil = async () => {
    const { data } = await supabase.from('job_profiles').insert({
      empresa_id: empresaId,
      menter_id: menterId || null,
      nombre: nuevoPerfil.nombre,
      disc_D_target: nuevoPerfil.disc_D,
      disc_I_target: nuevoPerfil.disc_I,
      disc_S_target: nuevoPerfil.disc_S,
      disc_C_target: nuevoPerfil.disc_C,
      hexaco_minimo: nuevoPerfil.hexaco_minimo,
    }).select().single();
    if (data) { setJobProfiles(prev => [...prev, { id: data.id, nombre: data.nombre }]); setShowCrearPerfil(false); }
  };

  const MATCH_COLOR = (m: number) => m >= 80 ? '#4CAF50' : m >= 65 ? '#FF9800' : '#F44336';

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>Instrumentos de Selección y Diagnóstico</h2>
          <p style={s.sub}>Envía evaluaciones a candidatos y colaboradores</p>
        </div>
      </div>

      {/* TABS */}
      <div style={s.tabBar}>
        {(['biblioteca', 'resultados', 'perfiles'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabActive : {}) }}>
            {tab === 'biblioteca' ? '📚 Instrumentos' : tab === 'resultados' ? '📊 Resultados' : '🎯 Perfiles de Puesto'}
          </button>
        ))}
      </div>

      {/* ── BIBLIOTECA ── */}
      {activeTab === 'biblioteca' && (
        <div>
          {/* Selector de perfil y candidato */}
          <div style={s.filterBox}>
            <div style={s.filterRow}>
              <div style={s.filterField}>
                <label style={s.label}>Perfil de Puesto (opcional)</label>
                <select style={s.select} value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}>
                  <option value="">— Sin perfil (evaluación libre) —</option>
                  {jobProfiles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div style={s.filterField}>
                <label style={s.label}>Nombre del candidato</label>
                <input style={s.input} placeholder="Ej: María García" value={candidatoNombre} onChange={e => setCandidatoNombre(e.target.value)} />
              </div>
              <div style={s.filterField}>
                <label style={s.label}>Email del candidato</label>
                <input style={s.input} placeholder="candidato@email.com" value={candidatoEmail} onChange={e => setCandidatoEmail(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Cards de instrumentos */}
          <div style={s.grid}>
            {EMPRESA_INSTRUMENT_IDS.map(id => {
              const inst = EMPRESA_INSTRUMENTS[id];
              const key = `${id}_${selectedProfile || 'libre'}`;
              const link = shareLinks[key];
              const isLoading = loadingLink === key;

              return (
                <div key={id} style={s.card}>
                  <div style={s.cardHeader}>
                    <span style={{ fontSize:28 }}>{inst.icono}</span>
                    <div>
                      <p style={s.cardTitle}>{inst.nombre}</p>
                      <p style={s.cardDesc}>{inst.descripcion}</p>
                    </div>
                  </div>
                  <div style={s.metaRow}>
                    <span style={s.meta}>📝 {inst.totalItems} ítems</span>
                    <span style={s.meta}>⏱ ~{inst.tiempoMinutos} min</span>
                    <span style={s.meta}>📖 {inst.referencia}</span>
                  </div>
                  <div style={s.tagsRow}>
                    {inst.tagsMenters.map((tag: string) => (
                      <span key={tag} style={{ ...s.tag, background:`${inst.color}22`, color:inst.color }}>{tag}</span>
                    ))}
                  </div>

                  {link && (
                    <div style={s.linkBox}>
                      {link.candidato && <span style={s.candidatoBadge}>👤 {link.candidato}</span>}
                      <div style={s.linkRow}>
                        <span style={s.linkText}>{link.url}</span>
                        <button style={{ ...s.copyBtn, background: link.copied ? '#4CAF5022' : '#f5f5f5', color: link.copied ? '#4CAF50' : '#444' }}
                          onClick={() => handleCopiar(key)}>
                          {link.copied ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <button style={{ ...s.actionBtn, background: inst.color }}
                    disabled={isLoading}
                    onClick={() => link ? handleCopiar(key) : handleGenerarLink(id)}>
                    {isLoading ? 'Generando...' : link ? '🔗 Copiar link' : '🔗 Generar link de evaluación'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── RESULTADOS ── */}
      {activeTab === 'resultados' && (
        <div>
          {loadingRes ? <div style={s.loading}>Cargando...</div> :
           resultados.length === 0 ? (
            <div style={s.empty}><span style={{fontSize:40}}>📭</span><p>Aún no hay resultados. Envía evaluaciones a tus candidatos.</p></div>
           ) : (
            <div style={s.resultsList}>
              {resultados.map((res, i) => {
                const inst = EMPRESA_INSTRUMENTS[res.instrument_id as EmpresaInstrumentId] || INSTRUMENTS[res.instrument_id as InstrumentId];
                return (
                  <div key={i} style={s.resultCard}>
                    <div style={s.resultHeader}>
                      <span style={{fontSize:22}}>{(inst as any)?.icono || '📋'}</span>
                      <div style={{flex:1}}>
                        <p style={s.resName}>{res.candidato_nombre || 'Candidato'}</p>
                        <p style={s.resEmail}>{res.candidato_email}</p>
                        <p style={s.resInst}>{(inst as any)?.nombre || res.instrument_id}</p>
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
                          {res.match_apto ? '✓ Apto' : '✕ No recomendado'}
                        </span>
                      )}
                    </div>
                    <p style={s.resDate}>{new Date(res.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}</p>
                  </div>
                );
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
            <div style={s.empty}><span style={{fontSize:40}}>🎯</span><p>No hay perfiles creados. Crea el primero para activar el Match automático.</p></div>
          ) : (
            <div style={s.grid}>
              {jobProfiles.map(p => (
                <div key={p.id} style={s.perfilCard}>
                  <span style={{fontSize:24}}>🎯</span>
                  <p style={s.perfilNombre}>{p.nombre}</p>
                </div>
              ))}
            </div>
          )}

          {showCrearPerfil && (
            <div style={s.overlay} onClick={() => setShowCrearPerfil(false)}>
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

                <div style={s.modalBtns}>
                  <button style={s.cancelBtn} onClick={() => setShowCrearPerfil(false)}>Cancelar</button>
                  <button style={{ ...s.confirmBtn, opacity: nuevoPerfil.nombre ? 1 : 0.5 }}
                    disabled={!nuevoPerfil.nombre} onClick={handleCrearPerfil}>Crear perfil</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ============================================================
// ARCHIVO 2: Extensión de renderInstrumentosMenter.tsx
// Sub-tabs Personas / Empresas en la pestaña "Resultados"
// Reemplaza la sección activeTab === 'resultados' existente
// ============================================================

// Agregar este import al archivo existente:
// import type { EmpresaInstrumentId } from '@/lib/assessments/instruments_empresa';
// import { EMPRESA_INSTRUMENTS } from '@/lib/assessments/instruments_empresa';

export function ResultadosMenterTabs({ userId }: { userId: string }) {
  const [subTab, setSubTab] = useState<'personas' | 'empresas'>('personas');
  const [resPersonas, setResPersonas] = useState<any[]>([]);
  const [resEmpresas, setResEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (subTab === 'personas') {
      supabase.from('v_menter_assessment_results').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { setResPersonas(data || []); setLoading(false); });
    } else {
      supabase.from('v_menter_empresa_results').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { setResEmpresas(data || []); setLoading(false); });
    }
  }, [subTab]);

  const MATCH_COLOR = (m: number) => m >= 80 ? '#4CAF50' : m >= 65 ? '#FF9800' : '#F44336';
  const SEV_COLORS: Record<string, { bg: string; text: string }> = {
    Mínima:{bg:'#E8F5E9',text:'#2E7D32'},Leve:{bg:'#FFF8E1',text:'#F57F17'},
    Moderada:{bg:'#FFF3E0',text:'#E65100'},Severa:{bg:'#FFEBEE',text:'#B71C1C'},
    Positivo:{bg:'#FFEBEE',text:'#B71C1C'},Negativo:{bg:'#E8F5E9',text:'#2E7D32'},
  };

  return (
    <div>
      {/* SUB-TABS Personas / Empresas */}
      <div style={s.subTabBar}>
        <button style={{ ...s.subTab, ...(subTab === 'personas' ? s.subTabActive : {}) }}
          onClick={() => setSubTab('personas')}>👤 Personas</button>
        <button style={{ ...s.subTab, ...(subTab === 'empresas' ? s.subTabActive : {}) }}
          onClick={() => setSubTab('empresas')}>🏢 Empresas</button>
      </div>

      {loading && <div style={s.loading}>Cargando...</div>}

      {/* ── Personas ── */}
      {!loading && subTab === 'personas' && (
        resPersonas.length === 0
          ? <div style={s.empty}><span style={{fontSize:40}}>📭</span><p>Sin resultados de personas aún.</p></div>
          : <div style={s.resultsList}>
              {resPersonas.map((res, i) => {
                const inst = INSTRUMENTS[res.instrument_id as InstrumentId];
                const sev = res.severidad_label;
                const sevC = sev ? SEV_COLORS[sev] : null;
                return (
                  <div key={i} style={s.resultCard}>
                    <div style={s.resultHeader}>
                      <span style={{fontSize:22}}>{inst?.icono || '📋'}</span>
                      <div style={{flex:1}}>
                        <p style={s.resName}>{res.persona_nombre || 'Persona'}</p>
                        <p style={s.resInst}>{inst?.nombre || res.instrument_id}</p>
                        <p style={s.resDate}>{new Date(res.created_at).toLocaleDateString('es-PE', {day:'2-digit',month:'short',year:'numeric'})}</p>
                      </div>
                      {sevC && sev && <span style={{...s.badge, background:sevC.bg, color:sevC.text}}>{sev}</span>}
                    </div>
                    {res.resultado_json?.dimensiones?.slice(0,3).map((dim: any, j: number) => (
                      <div key={j} style={s.dimRow}>
                        <span style={s.dimName}>{dim.dimension}</span>
                        <span style={s.dimScore}>{typeof dim.score === 'number' ? dim.score.toFixed(dim.score < 10 ? 1 : 0) : dim.score}</span>
                        {dim.label && <span style={{...s.badge, background:`${SEV_COLORS[dim.label]?.bg||'#eee'}`, color:`${SEV_COLORS[dim.label]?.text||'#666'}`, fontSize:11}}>{dim.label}</span>}
                      </div>
                    ))}
                    {res.roadmap_objetivo_id && <p style={{color:'#5C6BC0',fontSize:12,margin:'8px 0 0',fontWeight:600}}>📌 Vinculado al Roadmap</p>}
                  </div>
                );
              })}
            </div>
      )}

      {/* ── Empresas ── */}
      {!loading && subTab === 'empresas' && (
        resEmpresas.length === 0
          ? <div style={s.empty}><span style={{fontSize:40}}>📭</span><p>Sin resultados de empresas aún.</p></div>
          : <div style={s.resultsList}>
              {resEmpresas.map((res, i) => (
                <div key={i} style={s.resultCard}>
                  <div style={s.resultHeader}>
                    <span style={{fontSize:22}}>{EMPRESA_INSTRUMENTS[res.instrument_id as EmpresaInstrumentId]?.icono || '📋'}</span>
                    <div style={{flex:1}}>
                      <p style={s.resName}>{res.candidato_nombre || 'Candidato'}</p>
                      <p style={s.resEmail}>{res.candidato_email}</p>
                      <p style={s.resInst}>{EMPRESA_INSTRUMENTS[res.instrument_id as EmpresaInstrumentId]?.nombre || res.instrument_id}</p>
                      {res.empresa_nombre && <p style={s.resPerfil}>Empresa: {res.empresa_nombre}</p>}
                      {res.job_profile_nombre && <p style={s.resPerfil}>Puesto: {res.job_profile_nombre}</p>}
                      <p style={s.resDate}>{new Date(res.created_at).toLocaleDateString('es-PE', {day:'2-digit',month:'short',year:'numeric'})}</p>
                    </div>
                    {res.match_total !== null && (
                      <div style={s.matchCircle(MATCH_COLOR(res.match_total))}>
                        <span style={s.matchNum}>{res.match_total}%</span>
                        <span style={s.matchLabel}>match</span>
                      </div>
                    )}
                    {res.match_apto !== null && (
                      <span style={{...s.aptoBadge, background: res.match_apto ? '#E8F5E9' : '#FFEBEE', color: res.match_apto ? '#2E7D32' : '#B71C1C'}}>
                        {res.match_apto ? '✓ Apto' : '✕ No recomendado'}
                      </span>
                    )}
                  </div>
                  {/* DISC percentiles rápidos */}
                  {res.resultado_json?.percentiles?.adaptado && (
                    <div style={s.discRow}>
                      {(['D','I','S','C'] as const).map(f => (
                        <div key={f} style={s.discFactor}>
                          <span style={{fontSize:10,color:'#888'}}>Factor {f}</span>
                          <div style={s.discBar}>
                            <div style={{width:`${res.resultado_json.percentiles.adaptado[f]}%`, height:'100%', background:'#1565C0', borderRadius:3}} />
                          </div>
                          <span style={{fontSize:11,fontWeight:700}}>{res.resultado_json.percentiles.adaptado[f]}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* HEXACO alertas */}
                  {res.resultado_json?.alertas?.length > 0 && (
                    <div style={s.alertBox}>
                      {res.resultado_json.alertas.slice(0,2).map((a: string, j: number) => (
                        <p key={j} style={{fontSize:12,margin:'2px 0',color:'#B71C1C'}}>{a}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}
    </div>
  );
}

// ── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────
const s: Record<string, any> = {
  container:    { padding:'24px 0' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  titulo:       { fontSize:22, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  sub:          { fontSize:14, color:'#888', margin:0 },
  tabBar:       { display:'flex', gap:8, marginBottom:24, borderBottom:'1px solid #f0f0f0' },
  tabBtn:       { padding:'10px 20px', borderRadius:'10px 10px 0 0', border:'none', background:'none', color:'#888', cursor:'pointer', fontSize:14, fontWeight:500 },
  tabActive:    { background:'#fff', color:'#1a1a2e', borderBottom:'2px solid #1565C0' },
  subTabBar:    { display:'flex', gap:6, marginBottom:20 },
  subTab:       { padding:'8px 18px', borderRadius:8, border:'1px solid #eee', background:'none', color:'#888', cursor:'pointer', fontSize:14 },
  subTabActive: { background:'#1a1a2e', color:'#fff', border:'1px solid #1a1a2e' },
  filterBox:    { background:'#f8f9fa', borderRadius:12, padding:16, marginBottom:20 },
  filterRow:    { display:'flex', gap:12, flexWrap:'wrap' },
  filterField:  { flex:1, minWidth:200 },
  label:        { fontSize:12, color:'#888', display:'block', marginBottom:4, fontWeight:600 },
  select:       { width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:13 },
  input:        { width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' },
  grid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 },
  card:         { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader:   { display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 },
  cardTitle:    { fontSize:14, fontWeight:700, color:'#1a1a2e', margin:'0 0 4px' },
  cardDesc:     { fontSize:12, color:'#888', margin:0, lineHeight:1.4 },
  metaRow:      { display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 },
  meta:         { fontSize:11, color:'#aaa' },
  tagsRow:      { display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 },
  tag:          { fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600 },
  linkBox:      { background:'#f8f8f8', borderRadius:8, padding:'8px 10px', marginBottom:10 },
  candidatoBadge:{ fontSize:11, color:'#5C6BC0', fontWeight:600, marginBottom:6, display:'block' },
  linkRow:      { display:'flex', alignItems:'center', gap:8 },
  linkText:     { flex:1, fontSize:11, color:'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  copyBtn:      { fontSize:12, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontWeight:600 },
  actionBtn:    { width:'100%', padding:'12px', borderRadius:10, border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' },
  loading:      { textAlign:'center', color:'#888', padding:40 },
  empty:        { textAlign:'center', color:'#aaa', padding:60, display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  resultsList:  { display:'flex', flexDirection:'column', gap:12 },
  resultCard:   { background:'#fff', borderRadius:14, padding:18, border:'1px solid #f0f0f0', boxShadow:'0 2px 6px rgba(0,0,0,0.04)' },
  resultHeader: { display:'flex', alignItems:'center', gap:12, marginBottom:8 },
  resName:      { fontSize:15, fontWeight:700, color:'#1a1a2e', margin:'0 0 2px' },
  resEmail:     { fontSize:11, color:'#aaa', margin:'0 0 2px' },
  resInst:      { fontSize:12, color:'#888', margin:'0 0 2px' },
  resPerfil:    { fontSize:11, color:'#5C6BC0', margin:0, fontWeight:600 },
  resDate:      { fontSize:11, color:'#bbb', margin:0 },
  badge:        { fontSize:11, padding:'3px 10px', borderRadius:999, fontWeight:700 },
  dimRow:       { display:'flex', alignItems:'center', gap:8, padding:'3px 0', borderBottom:'1px solid #fafafa' },
  dimName:      { flex:1, fontSize:12, color:'#666' },
  dimScore:     { fontSize:12, fontWeight:700, color:'#1a1a2e' },
  matchCircle:  (c: string) => ({ width:56, height:56, borderRadius:'50%', border:`3px solid ${c}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:`${c}11`, flexShrink:0 }),
  matchNum:     { fontSize:15, fontWeight:800, color:'#1a1a2e', lineHeight:1 },
  matchLabel:   { fontSize:9, color:'#888' },
  aptoBadge:    { fontSize:11, padding:'4px 10px', borderRadius:999, fontWeight:700 },
  discRow:      { display:'flex', gap:8, marginTop:10 },
  discFactor:   { flex:1, display:'flex', flexDirection:'column', gap:3 },
  discBar:      { height:6, background:'#f0f0f0', borderRadius:3, overflow:'hidden' },
  alertBox:     { marginTop:8, background:'#FFEBEE', borderRadius:8, padding:'8px 12px' },
  perfilesHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  crearBtn:     { padding:'10px 20px', borderRadius:10, background:'#1565C0', color:'#fff', border:'none', fontWeight:700, fontSize:13, cursor:'pointer' },
  perfilCard:   { background:'#fff', borderRadius:14, padding:20, border:'1px solid #f0f0f0', display:'flex', alignItems:'center', gap:12 },
  perfilNombre: { fontSize:14, fontWeight:700, color:'#1a1a2e', margin:0 },
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal:        { background:'#fff', borderRadius:20, padding:32, maxWidth:460, width:'90%', maxHeight:'90vh', overflowY:'auto' },
  modalTitle:   { fontSize:18, fontWeight:700, color:'#1a1a2e', marginBottom:16, marginTop:0 },
  sliderRow:    { display:'flex', alignItems:'center', gap:10, marginBottom:10 },
  sliderLabel:  { fontSize:13, color:'#444', width:70 },
  sliderVal:    { fontSize:13, fontWeight:700, color:'#1a1a2e', minWidth:36, textAlign:'right' },
  modalBtns:    { display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 },
  cancelBtn:    { padding:'10px 20px', borderRadius:8, border:'1px solid #ddd', background:'none', cursor:'pointer' },
  confirmBtn:   { padding:'10px 20px', borderRadius:8, background:'#1565C0', color:'#fff', border:'none', cursor:'pointer', fontWeight:700 },
};