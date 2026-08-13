// src/app/dashboard/components/PerfilesPuesto.tsx
// Perfiles de puesto: se eligen los tests, se fijan los percentiles esperados
// y al guardar se crea también el link de evaluación de esa vacante.
// Cada tarjeta permite copiar ese link, editar el puesto o darlo de baja.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CATALOG_LIST } from '@/lib/assessments/catalog';
import type { Destinatario } from './GeneradorLinkEvaluacion';

export interface PerfilPuesto {
  id: string;
  nombre: string;
  instrument_ids: string[];
  disc_d_target: number; disc_i_target: number;
  disc_s_target: number; disc_c_target: number;
  hexaco_minimo: number;
  candidatos: Destinatario[];
  link_token: string | null;
  link_url: string | null;
  created_at: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Solo estos instrumentos tienen objetivo comparable en el perfil. */
const CON_PERCENTIL = { DISC: 'disc', HEXACO_HH: 'hexaco' } as const;

const FORM_VACIO = {
  nombre: '', instrument_ids: [] as string[],
  disc_d_target: 70, disc_i_target: 60, disc_s_target: 40, disc_c_target: 50,
  hexaco_minimo: 3.5,
};

interface Props {
  onPerfilesChange?: (perfiles: PerfilPuesto[]) => void;
}

export default function PerfilesPuesto({ onPerfilesChange }: Props) {
  const [perfiles, setPerfiles]   = useState<PerfilPuesto[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [modal, setModal]         = useState<'nuevo' | 'editar' | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm]           = useState(FORM_VACIO);
  const [candidatos, setCandidatos] = useState<Destinatario[]>([]);
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [aviso, setAviso]         = useState<string | null>(null);
  const [copiado, setCopiado]     = useState<string | null>(null);
  const csvRef                    = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    try {
      const res  = await fetch('/api/evaluacion/perfiles');
      const json = await res.json();
      // La URL se rearma con el dominio actual para que el link copiado sirva
      // donde estés (local, preview o producción). El servidor la construye con
      // NEXT_PUBLIC_APP_URL, que es lo correcto para el correo del candidato
      // pero no para probar en localhost.
      const origin = window.location.origin;
      const lista: PerfilPuesto[] = (json.perfiles || []).map((p: PerfilPuesto) => ({
        ...p,
        link_url: p.link_token ? `${origin}/e/${p.link_token}` : null,
      }));
      setPerfiles(lista);
      onPerfilesChange?.(lista);
    } finally {
      setCargando(false);
    }
  }, [onPerfilesChange]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Modal ────────────────────────────────────────────────────────────────
  const abrirNuevo = () => {
    setForm(FORM_VACIO); setCandidatos([]); setEditandoId(null);
    setError(null); setAviso(null); setEnviarEmail(true); setModal('nuevo');
  };

  const abrirEditar = (p: PerfilPuesto) => {
    setForm({
      nombre: p.nombre, instrument_ids: p.instrument_ids || [],
      disc_d_target: p.disc_d_target, disc_i_target: p.disc_i_target,
      disc_s_target: p.disc_s_target, disc_c_target: p.disc_c_target,
      hexaco_minimo: p.hexaco_minimo,
    });
    setCandidatos(p.candidatos || []);
    setEditandoId(p.id); setError(null); setAviso(null); setModal('editar');
  };

  const toggleTest = (id: string) =>
    setForm(f => ({
      ...f,
      instrument_ids: f.instrument_ids.includes(id)
        ? f.instrument_ids.filter(x => x !== id)
        : [...f.instrument_ids, id],
    }));

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed: Destinatario[] = [];
      for (const fila of String(ev.target?.result ?? '').split('\n').filter(Boolean)) {
        const [nombre, email] = fila.split(',').map(t => t.trim().replace(/^"|"$/g, ''));
        if (email && EMAIL_RE.test(email)) parsed.push({ nombre: nombre || '', email });
      }
      if (parsed.length > 0) setCandidatos(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const guardar = async () => {
    setGuardando(true); setError(null); setAviso(null);
    try {
      const esNuevo = modal === 'nuevo';
      const res = await fetch('/api/evaluacion/perfiles', {
        method: esNuevo ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(esNuevo ? {} : { id: editandoId }),
          ...form,
          candidatos: candidatos.filter(c => EMAIL_RE.test(c.email.trim())),
          enviar_email: esNuevo && enviarEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'No se pudo guardar el puesto.'); return; }

      const enviados = json.emails?.enviados?.length ?? 0;
      setAviso(esNuevo
        ? `Puesto creado con su link${enviados > 0 ? ` · invitación enviada a ${enviados} persona${enviados !== 1 ? 's' : ''}` : ''}.`
        : 'Puesto actualizado. El link sigue siendo el mismo.');
      setModal(null);
      await cargar();
    } catch {
      setError('No se pudo guardar. Revisa tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (p: PerfilPuesto) => {
    if (!confirm(`¿Dar de baja el puesto "${p.nombre}"? Su link dejará de admitir gente nueva, pero los resultados ya recibidos se conservan.`)) return;
    await fetch('/api/evaluacion/perfiles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    });
    setAviso(`Puesto "${p.nombre}" dado de baja.`);
    await cargar();
  };

  const copiar = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const usaDISC   = form.instrument_ids.includes('DISC');
  const usaHEXACO = form.instrument_ids.includes('HEXACO_HH');
  const sinPercentil = form.instrument_ids.filter(id => !(id in CON_PERCENTIL));
  const valido = form.nombre.trim().length > 0 && form.instrument_ids.length > 0;

  return (
    <div>
      <div style={s.header}>
        <p style={s.sub}>
          Define qué evaluaciones rinde cada puesto y el perfil que esperas del candidato.
          Al guardar se crea el link que puedes enviarles.
        </p>
        <button style={s.btnCrear} onClick={abrirNuevo}>+ Nuevo perfil</button>
      </div>

      {aviso && <p style={s.aviso}>{aviso}</p>}

      {cargando ? (
        <p style={s.vacio}>Cargando puestos…</p>
      ) : perfiles.length === 0 ? (
        <div style={s.vacioBox}>
          <p style={{ margin: 0 }}>Aún no hay puestos creados.</p>
          <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#999' }}>
            Crea el primero para tener su link de evaluación listo.
          </p>
        </div>
      ) : (
        <div style={s.grid}>
          {perfiles.map(p => (
            <div key={p.id} style={s.card}>
              <p style={s.cardTitulo}>{p.nombre}</p>

              <div style={s.tests}>
                {(p.instrument_ids || []).length === 0
                  ? <span style={s.testVacio}>Sin tests asignados</span>
                  : p.instrument_ids.map(id => {
                      const inst = CATALOG_LIST.find(i => i.id === id);
                      return (
                        <span key={id} style={{ ...s.testTag, background: `${inst?.color ?? '#888'}18`, color: inst?.color ?? '#666' }}>
                          {inst?.nombre ?? id}
                        </span>
                      );
                    })}
              </div>

              <div style={s.metaRow}>
                <span style={s.meta}>DISC objetivo · D{p.disc_d_target} I{p.disc_i_target} S{p.disc_s_target} C{p.disc_c_target}</span>
                <span style={s.meta}>Integridad mín. {Number(p.hexaco_minimo).toFixed(1)}</span>
                {p.candidatos?.length > 0 && (
                  <span style={s.meta}>{p.candidatos.length} postulante{p.candidatos.length !== 1 ? 's' : ''}</span>
                )}
              </div>

              {p.link_url && (
                <div style={s.linkBox}>
                  <span style={s.linkUrl}>{p.link_url}</span>
                  <button
                    style={{ ...s.btnCopiar, background: copiado === p.id ? '#4CAF5022' : '#fff', color: copiado === p.id ? '#4CAF50' : '#421869' }}
                    onClick={() => copiar(p.link_url!, p.id)}>
                    {copiado === p.id ? 'Copiado' : 'Copiar link'}
                  </button>
                </div>
              )}

              <div style={s.acciones}>
                <button style={s.btnSec} onClick={() => abrirEditar(p)}>Editar</button>
                <button style={s.btnBorrar} onClick={() => eliminar(p)}>Dar de baja</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal crear / editar ── */}
      {modal && (
        <div style={s.overlay} onClick={() => !guardando && setModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitulo}>{modal === 'nuevo' ? 'Nuevo Perfil de Puesto' : 'Editar Perfil de Puesto'}</h3>

            <label style={s.label}>Nombre del puesto</label>
            <input style={s.input} placeholder="Ej: Gerente Comercial" maxLength={120}
              value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />

            {/* Tests */}
            <label style={{ ...s.label, marginTop: 20 }}>
              Evaluaciones que rendirá el candidato ({form.instrument_ids.length})
            </label>
            <div style={s.testsGrid}>
              {CATALOG_LIST.map(inst => {
                const activo = form.instrument_ids.includes(inst.id);
                return (
                  <button key={inst.id} onClick={() => toggleTest(inst.id)}
                    style={{ ...s.testCard, borderColor: activo ? inst.color : '#e8e8e8', background: activo ? `${inst.color}0D` : '#fff' }}>
                    <span style={{ ...s.check, borderColor: activo ? inst.color : '#ccc', background: activo ? inst.color : 'transparent' }}>
                      {activo && '✓'}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={s.testNombre}>{inst.nombre}</span>
                      <span style={s.testMeta}>{inst.totalItems} ítems · ~{inst.tiempoMinutos} min</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Percentiles — solo de los tests elegidos que los admiten */}
            {usaDISC && (
              <>
                <h4 style={{ ...s.label, marginTop: 20 }}>Percentiles DISC objetivo</h4>
                {([['D','disc_d_target'],['I','disc_i_target'],['S','disc_s_target'],['C','disc_c_target']] as const).map(([f, campo]) => (
                  <div key={f} style={s.sliderRow}>
                    <span style={s.sliderLabel}>Factor {f}</span>
                    <input type="range" min={0} max={100} value={form[campo]}
                      onChange={e => setForm(prev => ({ ...prev, [campo]: Number(e.target.value) }))} style={{ flex: 1 }} />
                    <span style={s.sliderVal}>{form[campo]}%</span>
                  </div>
                ))}
              </>
            )}

            {usaHEXACO && (
              <>
                <label style={{ ...s.label, marginTop: 20 }}>Integridad mínima HEXACO (1–5)</label>
                <div style={s.sliderRow}>
                  <input type="range" min={1} max={5} step={0.1} value={form.hexaco_minimo}
                    onChange={e => setForm(f => ({ ...f, hexaco_minimo: Number(e.target.value) }))} style={{ flex: 1 }} />
                  <span style={s.sliderVal}>{form.hexaco_minimo.toFixed(1)}</span>
                </div>
              </>
            )}

            {sinPercentil.length > 0 && (
              <p style={s.notaInfo}>
                {sinPercentil.length === 1 ? 'El test' : 'Los tests'}{' '}
                <strong>{sinPercentil.map(id => CATALOG_LIST.find(i => i.id === id)?.nombre ?? id).join(', ')}</strong>{' '}
                no {sinPercentil.length === 1 ? 'tiene' : 'tienen'} percentil objetivo: se incluyen en el link
                y verás su puntuación, pero no suman al match del puesto.
              </p>
            )}

            {/* Postulantes */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <div style={s.candHeader}>
                <label style={{ ...s.label, marginBottom: 0 }}>Correos de los postulantes</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.btnSec} onClick={() => setCandidatos(prev => [...prev, { nombre: '', email: '' }])}>+ Agregar</button>
                  <button style={s.btnSec} onClick={() => csvRef.current?.click()}>Cargar CSV</button>
                  <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {candidatos.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="Nombre" value={c.nombre}
                      onChange={e => setCandidatos(prev => prev.map((x, idx) => idx === i ? { ...x, nombre: e.target.value } : x))} />
                    <input style={{ ...s.input, flex: 2, marginBottom: 0 }} placeholder="correo@empresa.com" value={c.email}
                      onChange={e => setCandidatos(prev => prev.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x))} />
                    <button onClick={() => setCandidatos(prev => prev.filter((_, idx) => idx !== i))} style={s.btnQuitar}>×</button>
                  </div>
                ))}
              </div>
              <p style={s.hint}>Opcional. CSV: una fila por postulante, formato <code>Nombre,correo@email.com</code></p>
              {modal === 'nuevo' && candidatos.length > 0 && (
                <label style={s.checkLine}>
                  <input type="checkbox" checked={enviarEmail} onChange={e => setEnviarEmail(e.target.checked)} />
                  Enviarles la invitación por correo al crear el puesto
                </label>
              )}
              {modal === 'editar' && (
                <p style={s.hint}>Para invitar gente nueva a este puesto, usa la pestaña Candidatos.</p>
              )}
            </div>

            {error && <p style={s.error}>{error}</p>}

            <div style={s.modalBtns}>
              <button style={s.btnCancelar} onClick={() => setModal(null)} disabled={guardando}>Cancelar</button>
              <button style={{ ...s.btnConfirmar, opacity: valido && !guardando ? 1 : 0.5, cursor: valido && !guardando ? 'pointer' : 'not-allowed' }}
                disabled={!valido || guardando} onClick={guardar}>
                {guardando ? 'Guardando…' : modal === 'nuevo' ? 'Crear puesto y su link' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:16, flexWrap:'wrap' },
  sub:         { fontSize:13, color:'#666', margin:0, maxWidth:560, lineHeight:1.55 },
  btnCrear:    { padding:'10px 20px', borderRadius:10, background:'#421869', color:'#fff', border:'none', fontWeight:700, fontSize:13, cursor:'pointer', flexShrink:0 },
  aviso:       { fontSize:13, color:'#2e7d32', background:'#e8f5e9', borderRadius:8, padding:'10px 14px', marginBottom:16, fontWeight:600 },
  vacio:       { color:'#999', fontSize:13 },
  vacioBox:    { textAlign:'center', color:'#666', padding:'44px 20px', background:'#fafafa', borderRadius:14 },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 },
  card:        { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  cardTitulo:  { fontSize:15, fontWeight:800, color:'#1a1a2e', margin:'0 0 10px', fontFamily:'Raleway, sans-serif' },
  tests:       { display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 },
  testTag:     { fontSize:11, padding:'3px 9px', borderRadius:999, fontWeight:600 },
  testVacio:   { fontSize:11.5, color:'#bbb', fontStyle:'italic' },
  metaRow:     { display:'flex', flexDirection:'column', gap:3, marginBottom:12 },
  meta:        { fontSize:11.5, color:'#888' },
  linkBox:     { display:'flex', alignItems:'center', gap:8, background:'#faf5ff', borderRadius:10, padding:'8px 10px', marginBottom:12 },
  linkUrl:     { flex:1, fontSize:11, color:'#6d28d9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  btnCopiar:   { fontSize:11.5, padding:'6px 12px', borderRadius:8, border:'1px solid #ddd6fe', cursor:'pointer', fontWeight:700, flexShrink:0 },
  acciones:    { display:'flex', gap:8, justifyContent:'flex-end' },
  btnSec:      { padding:'6px 14px', borderRadius:8, border:'1px solid #421869', background:'#fff', color:'#421869', fontWeight:600, fontSize:12, cursor:'pointer' },
  btnBorrar:   { padding:'6px 14px', borderRadius:8, border:'1px solid #ffcdd2', background:'#fff5f5', color:'#c62828', fontWeight:600, fontSize:12, cursor:'pointer' },
  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:16 },
  modal:       { background:'#fff', borderRadius:20, padding:28, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' },
  modalTitulo: { fontSize:18, fontWeight:800, color:'#1a1a2e', margin:'0 0 18px', fontFamily:'Raleway, sans-serif' },
  label:       { fontSize:12, color:'#555', display:'block', marginBottom:6, fontWeight:700 },
  input:       { width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box', marginBottom:4 },
  testsGrid:   { display:'grid', gridTemplateColumns:'1fr', gap:8, maxHeight:230, overflowY:'auto', padding:2 },
  testCard:    { display:'flex', alignItems:'center', gap:10, border:'2px solid', borderRadius:10, padding:'9px 11px', cursor:'pointer', textAlign:'left' },
  check:       { width:18, height:18, borderRadius:5, border:'2px solid', color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  testNombre:  { display:'block', fontSize:12.5, fontWeight:700, color:'#1a1a2e', lineHeight:1.3 },
  testMeta:    { display:'block', fontSize:10.5, color:'#999', marginTop:2 },
  sliderRow:   { display:'flex', alignItems:'center', gap:10, marginBottom:10 },
  sliderLabel: { fontSize:13, color:'#444', width:70 },
  sliderVal:   { fontSize:13, fontWeight:700, color:'#1a1a2e', minWidth:40, textAlign:'right' },
  notaInfo:    { fontSize:11.5, color:'#6d28d9', background:'#f3e8ff', borderRadius:8, padding:'8px 12px', marginTop:14, lineHeight:1.5 },
  candHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, gap:8, flexWrap:'wrap' },
  btnQuitar:   { background:'none', border:'none', color:'#c62828', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 6px' },
  hint:        { fontSize:11, color:'#999', margin:'8px 0 0' },
  checkLine:   { display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'#444', marginTop:12, cursor:'pointer' },
  error:       { fontSize:12.5, color:'#c62828', background:'#ffebee', borderRadius:8, padding:'8px 12px', marginTop:14 },
  modalBtns:   { display:'flex', gap:10, justifyContent:'flex-end', marginTop:22 },
  btnCancelar: { padding:'10px 20px', borderRadius:8, border:'1px solid #ddd', background:'none', cursor:'pointer', fontSize:13 },
  btnConfirmar:{ padding:'10px 20px', borderRadius:8, background:'#421869', color:'#fff', border:'none', fontWeight:700, fontSize:13 },
};
