// src/app/dashboard/components/CandidatosEvaluacion.tsx
// Pestaña Candidatos: elegir un puesto, sumar personas y enviarles la
// invitación del link que ese puesto ya tiene. Muestra en qué va cada una.
//
// Antes esto vivía dentro de la pestaña Instrumentos, mezclado con la
// selección de tests. Ahora el puesto define qué se evalúa y acá solo se
// decide a quién se le manda.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { CATALOG_LIST } from '@/lib/assessments/catalog';
import type { PerfilPuesto } from './PerfilesPuesto';
import type { Destinatario } from './GeneradorLinkEvaluacion';

interface ParticipanteFila {
  id: string;
  link_token: string;
  nombre: string | null;
  email: string | null;
  es_registrado: boolean;
  invitado: boolean;
  iniciado_at: string | null;
  completado_at: string | null;
  total_tests: number;
  tests_completados: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CandidatosEvaluacion({ perfiles }: { perfiles: PerfilPuesto[] }) {
  const [perfilId, setPerfilId]       = useState('');
  const [nuevos, setNuevos]           = useState<Destinatario[]>([{ nombre: '', email: '' }]);
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [enviando, setEnviando]       = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [aviso, setAviso]             = useState<string | null>(null);
  const [gente, setGente]             = useState<ParticipanteFila[]>([]);
  const [cargando, setCargando]       = useState(true);
  const csvRef                        = useRef<HTMLInputElement>(null);

  const conLink = perfiles.filter(p => p.link_token);
  const perfil  = conLink.find(p => p.id === perfilId) ?? null;

  const cargarGente = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase
      .from('v_link_participantes')
      .select('id, link_token, nombre, email, es_registrado, invitado, iniciado_at, completado_at, total_tests, tests_completados')
      .order('created_at', { ascending: false })
      .limit(300);
    setGente(data || []);
    setCargando(false);
  }, []);

  useEffect(() => { cargarGente(); }, [cargarGente]);

  // Preseleccionar el único puesto disponible ahorra un clic
  useEffect(() => {
    if (!perfilId && conLink.length === 1) setPerfilId(conLink[0].id);
  }, [conLink, perfilId]);

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
      if (parsed.length > 0) setNuevos(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const validos = nuevos.filter(c => EMAIL_RE.test(c.email.trim()));

  const enviar = async () => {
    if (!perfil?.link_token || validos.length === 0) return;
    setEnviando(true); setError(null); setAviso(null);
    try {
      const res = await fetch('/api/evaluacion/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_token:    perfil.link_token,
          destinatarios: validos,
          enviar_email:  enviarEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'No se pudo enviar.'); return; }

      const { enviados = [], fallidos = [], yaInvitados = [] } = json.emails ?? {};
      const partes = [
        enviados.length    > 0 ? `${enviados.length} invitación${enviados.length !== 1 ? 'es' : ''} enviada${enviados.length !== 1 ? 's' : ''}` : '',
        yaInvitados.length > 0 ? `${yaInvitados.length} ya estaba${yaInvitados.length !== 1 ? 'n' : ''} en la lista` : '',
        fallidos.length    > 0 ? `no se pudo enviar a ${fallidos.join(', ')}` : '',
      ].filter(Boolean);

      setAviso(partes.join(' · ') || 'Personas agregadas al puesto.');
      setNuevos([{ nombre: '', email: '' }]);
      await cargarGente();
    } catch {
      setError('No se pudo enviar. Revisa tu conexión.');
    } finally {
      setEnviando(false);
    }
  };

  const gentePerfil = perfil ? gente.filter(g => g.link_token === perfil.link_token) : [];

  if (conLink.length === 0) {
    return (
      <div style={s.vacioBox}>
        <p style={{ margin: 0, fontWeight: 700, color: '#421869' }}>Primero crea un puesto</p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#777', lineHeight: 1.6 }}>
          Los candidatos se invitan al link de un puesto, que define qué evaluaciones rinden.
          Ve a <strong>Perfiles de Puesto</strong> y crea el primero.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Puesto */}
      <div style={s.bloque}>
        <label style={s.label}>Puesto a evaluar</label>
        <select style={s.select} value={perfilId} onChange={e => { setPerfilId(e.target.value); setAviso(null); }}>
          <option value="">— Elige un puesto —</option>
          {conLink.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        {perfil && (
          <div style={s.resumen}>
            <span style={s.resumenLabel}>Rendirán:</span>
            {(perfil.instrument_ids || []).map(id => {
              const inst = CATALOG_LIST.find(i => i.id === id);
              return (
                <span key={id} style={{ ...s.testTag, background: `${inst?.color ?? '#888'}18`, color: inst?.color ?? '#666' }}>
                  {inst?.nombre ?? id}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Personas */}
      {perfil && (
        <div style={s.bloque}>
          <div style={s.filaHeader}>
            <label style={{ ...s.label, marginBottom: 0 }}>Personas a evaluar ({validos.length} válidas)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.btnSec} onClick={() => setNuevos(prev => [...prev, { nombre: '', email: '' }])}>+ Agregar</button>
              <button style={s.btnSec} onClick={() => csvRef.current?.click()}>Cargar CSV</button>
              <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nuevos.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input style={{ ...s.input, flex: 1 }} placeholder="Nombre" value={c.nombre}
                  onChange={e => setNuevos(prev => prev.map((x, idx) => idx === i ? { ...x, nombre: e.target.value } : x))} />
                <input style={{ ...s.input, flex: 2 }} placeholder="correo@empresa.com" value={c.email}
                  onChange={e => setNuevos(prev => prev.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x))} />
                {nuevos.length > 1 && (
                  <button onClick={() => setNuevos(prev => prev.filter((_, idx) => idx !== i))} style={s.btnQuitar}>×</button>
                )}
              </div>
            ))}
          </div>
          <p style={s.hint}>CSV: una fila por persona, formato <code>Nombre,correo@email.com</code></p>

          <label style={s.checkLine}>
            <input type="checkbox" checked={enviarEmail} onChange={e => setEnviarEmail(e.target.checked)} />
            Enviarles la invitación por correo ahora
          </label>

          {error && <p style={s.error}>{error}</p>}
          {aviso && <p style={s.aviso}>{aviso}</p>}

          <button
            style={{ ...s.btnPrimario, background: validos.length === 0 || enviando ? '#ccc' : '#421869', cursor: validos.length === 0 || enviando ? 'not-allowed' : 'pointer' }}
            disabled={validos.length === 0 || enviando} onClick={enviar}>
            {enviando
              ? 'Enviando…'
              : validos.length === 0
                ? 'Agrega al menos un correo'
                : enviarEmail
                  ? `Invitar a ${validos.length} persona${validos.length !== 1 ? 's' : ''}`
                  : `Agregar ${validos.length} persona${validos.length !== 1 ? 's' : ''} sin enviar correo`}
          </button>
        </div>
      )}

      {/* Estado de cada persona */}
      {perfil && (
        <div style={s.bloque}>
          <p style={s.bloqueTitulo}>Estado de los candidatos de {perfil.nombre}</p>
          {cargando ? (
            <p style={s.hint}>Cargando…</p>
          ) : gentePerfil.length === 0 ? (
            <p style={s.hint}>Todavía no hay nadie invitado a este puesto.</p>
          ) : (
            <div>
              {gentePerfil.map(g => {
                const estado = g.completado_at ? 'Completó' : g.iniciado_at ? 'En curso' : 'Invitado';
                const color  = g.completado_at ? '#2e7d32' : g.iniciado_at ? '#b45309' : '#888';
                return (
                  <div key={g.id} style={s.fila}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={s.filaNombre}>
                        {g.nombre || 'Sin nombre'}
                        <span style={g.es_registrado ? s.tagReg : s.tagAnon}>
                          {g.es_registrado ? 'Registrado' : 'Sin cuenta'}
                        </span>
                      </p>
                      <p style={s.filaEmail}>{g.email}</p>
                    </div>
                    <span style={{ ...s.estado, color }}>{estado}</span>
                    <span style={s.progreso}>{g.tests_completados}/{g.total_tests}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bloque:      { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', marginBottom:16 },
  bloqueTitulo:{ fontSize:14, fontWeight:800, color:'#421869', margin:'0 0 12px', fontFamily:'Raleway, sans-serif' },
  vacioBox:    { textAlign:'center', padding:'48px 24px', background:'#fafafa', borderRadius:16 },
  label:       { fontSize:12, color:'#555', display:'block', marginBottom:6, fontWeight:700 },
  select:      { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:13, background:'#fff' },
  resumen:     { display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginTop:12 },
  resumenLabel:{ fontSize:11.5, color:'#888', fontWeight:600 },
  testTag:     { fontSize:11, padding:'3px 9px', borderRadius:999, fontWeight:600 },
  filaHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, gap:8, flexWrap:'wrap' },
  input:       { width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' },
  btnSec:      { padding:'6px 12px', borderRadius:8, border:'1px solid #421869', background:'#fff', color:'#421869', fontWeight:600, fontSize:12, cursor:'pointer' },
  btnQuitar:   { background:'none', border:'none', color:'#c62828', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 6px' },
  hint:        { fontSize:11, color:'#999', margin:'8px 0 0' },
  checkLine:   { display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#444', margin:'12px 0', cursor:'pointer' },
  error:       { fontSize:12.5, color:'#c62828', background:'#ffebee', borderRadius:8, padding:'8px 12px', margin:'0 0 12px' },
  aviso:       { fontSize:12.5, color:'#2e7d32', background:'#e8f5e9', borderRadius:8, padding:'8px 12px', margin:'0 0 12px', fontWeight:600 },
  btnPrimario: { width:'100%', padding:13, borderRadius:10, border:'none', color:'#fff', fontWeight:700, fontSize:14, fontFamily:'Raleway, sans-serif' },
  fila:        { display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #f6f6f6' },
  filaNombre:  { fontSize:13, fontWeight:700, color:'#1a1a2e', margin:0, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' },
  filaEmail:   { fontSize:11.5, color:'#888', margin:'2px 0 0' },
  estado:      { fontSize:11.5, fontWeight:700, flexShrink:0 },
  progreso:    { fontSize:12.5, fontWeight:800, color:'#421869', minWidth:34, textAlign:'right', flexShrink:0 },
  tagReg:      { fontSize:9.5, fontWeight:700, background:'#e8f5e9', color:'#2e7d32', borderRadius:20, padding:'2px 7px' },
  tagAnon:     { fontSize:9.5, fontWeight:700, background:'#f0f0f0', color:'#888', borderRadius:20, padding:'2px 7px' },
};
