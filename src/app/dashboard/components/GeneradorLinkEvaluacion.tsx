// src/app/dashboard/components/GeneradorLinkEvaluacion.tsx
// Genera un link de evaluación reutilizable: se eligen uno o varios
// instrumentos y sale UNA sola URL que puede responder toda la gente que
// haga falta, dejando un registro independiente por persona.
// Lo usan el tab Instrumentos del Menter y el de la Empresa.

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { CATALOG_LIST, tiempoTotalMinutos, type CatalogEntry } from '@/lib/assessments/catalog';
import { costoEstimadoPorPersona } from '@/lib/creditos';

export interface Destinatario { nombre: string; email: string }
export interface JobProfile { id: string; nombre: string; candidatos?: Destinatario[] }

interface LinkCreado {
  token: string;
  url: string;
  instrument_ids: string[];
  titulo: string | null;
  created_at: string;
  activo: boolean;
  max_usos: number | null;
  expires_at: string | null;
  enviados: string[];
  fallidos: string[];
}

interface ParticipanteFila {
  id: string;
  link_token: string;
  nombre: string | null;
  email: string | null;
  es_registrado: boolean;
  iniciado_at: string | null;
  completado_at: string | null;
  total_tests: number;
  tests_completados: number;
}

interface Props {
  /** Instrumentos ofrecidos; por defecto, todo el catálogo. */
  instrumentos?: CatalogEntry[];
  /** Perfiles de puesto disponibles (solo Empresa). */
  jobProfiles?: JobProfile[];
  /** true si el plan del usuario consume créditos al generar. */
  consumeCreditos: boolean;
  creditos: number | null;
  onSinCreditos: () => void;
  /** Instrumentos bloqueados por plan, con el motivo a mostrar. */
  bloqueados?: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

export default function GeneradorLinkEvaluacion({
  instrumentos = CATALOG_LIST,
  jobProfiles,
  consumeCreditos,
  creditos,
  onSinCreditos,
  bloqueados = {},
}: Props) {
  const [seleccion, setSeleccion]         = useState<string[]>([]);
  const [titulo, setTitulo]               = useState('');
  const [mensaje, setMensaje]             = useState('');
  const [perfilId, setPerfilId]           = useState('');
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [enviarEmail, setEnviarEmail]     = useState(true);
  const [limitarCupo, setLimitarCupo]     = useState(false);
  const [maxUsos, setMaxUsos]             = useState(10);
  const [venceEl, setVenceEl]             = useState('');
  const [generando, setGenerando]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [links, setLinks]                 = useState<LinkCreado[]>([]);
  const [copiado, setCopiado]             = useState<string | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteFila[]>([]);
  const [linkAbierto, setLinkAbierto]     = useState<string | null>(null);
  const csvRef                            = useRef<HTMLInputElement>(null);

  // Sin saldo NO se bloquea nada: generar es gratis y los links siguen
  // funcionando aunque el dueño esté en cero. Solo se avisa.
  const sinSaldo = consumeCreditos && creditos !== null && creditos <= 0;

  // ── Historial de links y de quién respondió cada uno ─────────────────────
  useEffect(() => {
    let cancelado = false;

    (async () => {
      const { data } = await supabase
        .from('assessment_links')
        .select('token, instrument_ids, titulo, created_at, activo, max_usos, expires_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (cancelado) return;
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://girolab.net';
      setLinks((data || []).map(l => ({
        ...l,
        url: `${origin}/e/${l.token}`,
        enviados: [],
        fallidos: [],
      })));

      const { data: filas } = await supabase
        .from('v_link_participantes')
        .select('id, link_token, nombre, email, es_registrado, iniciado_at, completado_at, total_tests, tests_completados')
        .not('iniciado_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!cancelado) setParticipantes(filas || []);
    })();

    return () => { cancelado = true; };
  }, []);

  // Al elegir un puesto se precargan los correos guardados en su perfil
  useEffect(() => {
    if (!perfilId) return;
    const perfil = jobProfiles?.find(p => p.id === perfilId);
    const candidatos = perfil?.candidatos ?? [];
    if (candidatos.length === 0) return;
    setDestinatarios(prev => {
      const yaCargados = new Set(prev.map(d => d.email.toLowerCase()));
      const nuevos = candidatos.filter(c => c.email && !yaCargados.has(c.email.toLowerCase()));
      return [...prev, ...nuevos];
    });
  }, [perfilId, jobProfiles]);

  // ── Instrumentos ─────────────────────────────────────────────────────────
  const toggle = (id: string) => {
    if (bloqueados[id]) return;
    setSeleccion(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ── Destinatarios ────────────────────────────────────────────────────────
  const addDestinatario    = () => setDestinatarios(prev => [...prev, { nombre: '', email: '' }]);
  const removeDestinatario = (i: number) => setDestinatarios(prev => prev.filter((_, idx) => idx !== i));
  const updateDestinatario = (i: number, campo: keyof Destinatario, valor: string) =>
    setDestinatarios(prev => prev.map((d, idx) => idx === i ? { ...d, [campo]: valor } : d));

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const filas = String(ev.target?.result ?? '').split('\n').filter(Boolean);
      const parsed: Destinatario[] = [];
      for (const fila of filas) {
        const [nombre, email] = fila.split(',').map(t => t.trim().replace(/^"|"$/g, ''));
        if (email && EMAIL_RE.test(email)) parsed.push({ nombre: nombre || '', email });
      }
      if (parsed.length > 0) setDestinatarios(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const destinatariosValidos = destinatarios.filter(d => EMAIL_RE.test(d.email.trim()));

  // ── Generar ──────────────────────────────────────────────────────────────
  const handleGenerar = async () => {
    if (seleccion.length === 0) return;

    setGenerando(true);
    setError(null);
    try {
      const res = await fetch('/api/evaluacion/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument_ids: seleccion,
          titulo:         titulo.trim() || null,
          mensaje:        mensaje.trim() || null,
          job_profile_id: perfilId || null,
          max_usos:       limitarCupo ? maxUsos : null,
          // El input da una fecha local; el link vence al terminar ese día
          expires_at:     venceEl ? new Date(`${venceEl}T23:59:59`).toISOString() : null,
          destinatarios:  destinatariosValidos,
          enviar_email:   enviarEmail && destinatariosValidos.length > 0,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'No se pudo generar el link.');
        return;
      }

      (window as GtagWindow).gtag?.('event', 'link_evaluacion_generado', { instrumentos: seleccion.length });

      // La URL se arma con el origen actual para que el link copiado sirva en
      // el entorno donde estás (local, preview o producción). El correo usa
      // NEXT_PUBLIC_APP_URL, que es lo correcto para el destinatario real.
      const origin = window.location.origin;
      setLinks(prev => [{
        ...json.link,
        url:        `${origin}/e/${json.link.token}`,
        activo:     true,
        max_usos:   limitarCupo ? maxUsos : null,
        expires_at: venceEl ? new Date(`${venceEl}T23:59:59`).toISOString() : null,
        enviados:   json.emails.enviados,
        fallidos:   json.emails.fallidos,
      }, ...prev]);
      setSeleccion([]);
      setTitulo('');
      setMensaje('');
      setDestinatarios([]);
      setLimitarCupo(false);
      setVenceEl('');
    } catch {
      setError('No se pudo generar el link. Revisa tu conexión.');
    } finally {
      setGenerando(false);
    }
  };

  const copiar = (url: string, token: string) => {
    navigator.clipboard.writeText(url);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  };

  // Cerrar un link ya repartido sin tener que borrarlo: deja de admitir gente
  // nueva, pero quien está a medias puede terminar.
  const alternarActivo = async (token: string, activo: boolean) => {
    const { error } = await supabase
      .from('assessment_links')
      .update({ activo })
      .eq('token', token);
    if (!error) {
      setLinks(prev => prev.map(l => l.token === token ? { ...l, activo } : l));
    }
  };

  const minutos = tiempoTotalMinutos(seleccion);

  return (
    <div>
      {/* ── Paso 1: instrumentos ── */}
      <div style={s.bloque}>
        <div style={s.bloqueHeader}>
          <div>
            <p style={s.pasoTitulo}>1. Elige las evaluaciones</p>
            <p style={s.pasoSub}>Puedes incluir varias en un mismo link: la persona las rinde una tras otra.</p>
          </div>
          {seleccion.length > 0 && (
            <span style={s.resumenChip}>
              {seleccion.length} seleccionada{seleccion.length !== 1 ? 's' : ''} · ~{minutos} min
            </span>
          )}
        </div>

        <div style={s.grid}>
          {instrumentos.map(inst => {
            const activo   = seleccion.includes(inst.id);
            const bloqueo  = bloqueados[inst.id];
            return (
              <button
                key={inst.id}
                onClick={() => toggle(inst.id)}
                disabled={!!bloqueo}
                style={{
                  ...s.card,
                  borderColor: activo ? inst.color : '#eee',
                  background:  activo ? `${inst.color}0D` : '#fff',
                  opacity:     bloqueo ? 0.5 : 1,
                  cursor:      bloqueo ? 'not-allowed' : 'pointer',
                }}>
                <div style={s.cardTop}>
                  <span style={{ ...s.checkbox, borderColor: activo ? inst.color : '#ccc', background: activo ? inst.color : 'transparent' }}>
                    {activo && '✓'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.cardTitle}>{inst.nombre}</p>
                    <p style={s.cardDesc}>{inst.descripcion}</p>
                  </div>
                </div>
                <div style={s.metaRow}>
                  <span style={s.meta}>{inst.totalItems} ítems</span>
                  <span style={s.meta}>~{inst.tiempoMinutos} min</span>
                  {bloqueo && <span style={s.bloqueoTag}>{bloqueo}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Paso 2: a quién ── */}
      <div style={s.bloque}>
        <p style={s.pasoTitulo}>2. ¿A quién se lo envías? <span style={s.opcional}>(opcional)</span></p>
        <p style={s.pasoSub}>
          Si cargas correos, cada persona recibe la invitación con el link. Si no, generas
          el link igual y lo compartes por donde quieras.
        </p>

        {jobProfiles && (
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Perfil de puesto</label>
            <select style={s.select} value={perfilId} onChange={e => setPerfilId(e.target.value)}>
              <option value="">— Sin perfil (evaluación libre) —</option>
              {jobProfiles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <label style={s.label}>Destinatarios ({destinatariosValidos.length} válidos)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.btnSec} onClick={addDestinatario}>+ Agregar</button>
            <button style={s.btnSec} onClick={() => csvRef.current?.click()}>Cargar CSV</button>
            <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {destinatarios.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Nombre" value={d.nombre}
                onChange={e => updateDestinatario(i, 'nombre', e.target.value)} />
              <input style={{ ...s.input, flex: 2 }} placeholder="correo@empresa.com" value={d.email}
                onChange={e => updateDestinatario(i, 'email', e.target.value)} />
              <button onClick={() => removeDestinatario(i)} style={s.btnQuitar} aria-label="Quitar">×</button>
            </div>
          ))}
        </div>
        {destinatarios.length === 0 && (
          <p style={s.hint}>Sin destinatarios: se genera solo el link para que lo compartas tú.</p>
        )}
        {destinatarios.length > 0 && (
          <>
            <p style={s.hint}>CSV: una fila por persona, formato <code>Nombre,correo@email.com</code></p>
            <label style={s.checkLine}>
              <input type="checkbox" checked={enviarEmail} onChange={e => setEnviarEmail(e.target.checked)} />
              Enviarles la invitación por correo ahora
            </label>
            <p style={s.explica}>
              {enviarEmail
                ? 'Al generar el link, cada correo de la lista recibe la invitación.'
                : 'No se envía ningún correo: solo se genera el link para que lo compartas tú.'}
            </p>
          </>
        )}
      </div>

      {/* ── Paso 3: detalles y generar ── */}
      <div style={s.bloque}>
        <p style={s.pasoTitulo}>3. Genera el link</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={s.label}>Título <span style={s.opcional}>(opcional)</span></label>
            <input style={s.input} placeholder="ej. Evaluación Gerente Comercial" maxLength={120}
              value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div style={{ flex: 2, minWidth: 240 }}>
            <label style={s.label}>Mensaje para la persona <span style={s.opcional}>(opcional)</span></label>
            <input style={s.input} placeholder="ej. Completa estas evaluaciones antes del viernes" maxLength={500}
              value={mensaje} onChange={e => setMensaje(e.target.value)} />
          </div>
        </div>

        {/* Límites del link — el cobro es por link, no por respuesta, así que
            el cupo es lo que evita que una URL quede abierta para siempre */}
        <div style={s.limites}>
          <label style={s.checkLine}>
            <input type="checkbox" checked={limitarCupo} onChange={e => setLimitarCupo(e.target.checked)} />
            Limitar a
            <input
              type="number" min={1} max={10000} value={maxUsos}
              onChange={e => setMaxUsos(Math.max(1, Number(e.target.value) || 1))}
              disabled={!limitarCupo}
              style={{ ...s.input, width: 78, padding: '5px 8px', opacity: limitarCupo ? 1 : 0.5 }} />
            personas
          </label>
          <label style={{ ...s.checkLine, marginTop: 0 }}>
            Vence el
            <input type="date" value={venceEl} min={new Date().toISOString().slice(0, 10)}
              onChange={e => setVenceEl(e.target.value)}
              style={{ ...s.input, width: 158, padding: '5px 8px' }} />
            {venceEl && (
              <button onClick={() => setVenceEl('')} style={s.btnLimpiar}>quitar</button>
            )}
          </label>
        </div>
        <p style={s.hint}>
          Sin límites, el link acepta respuestas de forma indefinida.
        </p>

        {consumeCreditos && (
          <div style={{ ...s.costo, marginTop: 12 }}>
            Generar el link es gratis. Se descuenta <strong>1 crédito por cada test que una
            persona termina</strong>: {seleccion.length > 0
              ? <>estos {seleccion.length === 1 ? 'test consumirán' : `${seleccion.length} tests consumirán`} <strong>{costoEstimadoPorPersona(seleccion)} crédito{costoEstimadoPorPersona(seleccion) !== 1 ? 's' : ''} por cada persona</strong> que los complete.</>
              : <>si envías 3 tests a 4 personas, necesitas 12 créditos.</>}
            {creditos !== null && (
              <> Tienes <strong>{Math.max(0, creditos)}</strong> disponible{creditos === 1 ? '' : 's'}.</>
            )}
          </div>
        )}
        {sinSaldo && (
          <p style={s.deuda}>
            {creditos < 0
              ? `Sin créditos: llevas ${Math.abs(creditos)} evaluación${Math.abs(creditos) !== 1 ? 'es' : ''} pendiente${Math.abs(creditos) !== 1 ? 's' : ''} de pago.`
              : 'Te quedaste sin créditos.'}{' '}
            Tus links siguen funcionando y nadie queda a medias, pero conviene recargar.{' '}
            <button style={s.btnRecargar} onClick={onSinCreditos}>Comprar créditos</button>
          </p>
        )}
        {error && <p style={s.error}>{error}</p>}

        <button
          style={{
            ...s.btnPrimario,
            background: seleccion.length === 0 || generando ? '#ccc' : '#421869',
            color:      '#fff',
            cursor:     seleccion.length === 0 || generando ? 'not-allowed' : 'pointer',
          }}
          disabled={seleccion.length === 0 || generando}
          onClick={handleGenerar}>
          {generando
            ? 'Generando…'
            : seleccion.length === 0
              ? 'Elige al menos una evaluación'
              : destinatariosValidos.length > 0 && enviarEmail
                ? `Generar link y enviar a ${destinatariosValidos.length} persona${destinatariosValidos.length !== 1 ? 's' : ''}`
                : 'Generar link'}
        </button>
      </div>

      {/* ── Links generados ── */}
      {links.length > 0 && (
        <div style={s.bloque}>
          <p style={s.pasoTitulo}>Tus links</p>
          <p style={s.pasoSub}>Cada link admite varias personas y guarda un registro independiente por cada una.</p>
          {links.map(link => {
            const gente     = participantes.filter(p => p.link_token === link.token);
            const terminados = gente.filter(p => p.completado_at).length;
            const abierto   = linkAbierto === link.token;

            return (
              <div key={link.token} style={s.linkWrap}>
                <div style={s.linkCard}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.linkTitulo}>
                      {link.titulo || `${link.instrument_ids.length} evaluación${link.instrument_ids.length !== 1 ? 'es' : ''}`}
                      {!link.activo && <span style={s.tagCerrado}>Cerrado</span>}
                    </p>
                    <p style={s.linkUrl}>{link.url}</p>
                    {(link.max_usos || link.expires_at) && (
                      <p style={s.linkLimites}>
                        {link.max_usos && `Cupo ${gente.length}/${link.max_usos}`}
                        {link.max_usos && link.expires_at && ' · '}
                        {link.expires_at && `Vence ${new Date(link.expires_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                      </p>
                    )}
                    {link.enviados.length > 0 && (
                      <p style={s.linkOk}>Enviado a {link.enviados.length} destinatario{link.enviados.length !== 1 ? 's' : ''}</p>
                    )}
                    {link.fallidos.length > 0 && (
                      <p style={s.linkFail}>No se pudo enviar a: {link.fallidos.join(', ')}</p>
                    )}
                    <button
                      style={s.linkToggle}
                      onClick={() => setLinkAbierto(abierto ? null : link.token)}>
                      {gente.length === 0
                        ? 'Nadie lo ha respondido aún'
                        : `${gente.length} persona${gente.length !== 1 ? 's' : ''} · ${terminados} completada${terminados !== 1 ? 's' : ''}`}
                      {gente.length > 0 && (abierto ? ' ▲' : ' ▼')}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button
                      style={{ ...s.btnCopiar, background: copiado === link.token ? '#4CAF5022' : '#f5f5f5', color: copiado === link.token ? '#4CAF50' : '#444' }}
                      onClick={() => copiar(link.url, link.token)}>
                      {copiado === link.token ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                      style={{ ...s.btnCopiar, background: 'none', color: link.activo ? '#c62828' : '#2e7d32', fontSize: 11 }}
                      onClick={() => alternarActivo(link.token, !link.activo)}>
                      {link.activo ? 'Cerrar' : 'Reabrir'}
                    </button>
                  </div>
                </div>

                {abierto && gente.length > 0 && (
                  <div style={s.participantes}>
                    {gente.map(p => (
                      <div key={p.id} style={s.participanteRow}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={s.participanteNombre}>
                            {p.nombre || 'Sin nombre'}
                            <span style={p.es_registrado ? s.tagRegistrado : s.tagAnonimo}>
                              {p.es_registrado ? 'Registrado' : 'Sin cuenta'}
                            </span>
                          </p>
                          <p style={s.participanteEmail}>{p.email}</p>
                        </div>
                        <span style={{ ...s.participanteProgreso, color: p.completado_at ? '#2e7d32' : '#b45309' }}>
                          {p.tests_completados}/{p.total_tests}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bloque:       { background:'#fff', borderRadius:16, padding:20, border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', marginBottom:16 },
  bloqueHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap', marginBottom:14 },
  pasoTitulo:   { fontSize:15, fontWeight:800, color:'#421869', margin:'0 0 4px', fontFamily:'Raleway, sans-serif' },
  pasoSub:      { fontSize:12.5, color:'#777', margin:'0 0 14px', lineHeight:1.5 },
  opcional:     { fontWeight:400, color:'#aaa', fontSize:12 },
  resumenChip:  { fontSize:12, fontWeight:700, background:'#f3e8ff', color:'#421869', borderRadius:20, padding:'6px 14px', whiteSpace:'nowrap' },
  grid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px, 1fr))', gap:12 },
  card:         { border:'2px solid', borderRadius:14, padding:14, textAlign:'left', transition:'all 0.15s', display:'flex', flexDirection:'column', gap:8 },
  cardTop:      { display:'flex', gap:10, alignItems:'flex-start' },
  checkbox:     { width:20, height:20, borderRadius:6, border:'2px solid', color:'#fff', fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 },
  cardTitle:    { fontSize:13.5, fontWeight:700, color:'#1a1a2e', margin:'0 0 3px', lineHeight:1.3 },
  cardDesc:     { fontSize:11.5, color:'#777', margin:0, lineHeight:1.45 },
  metaRow:      { display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' },
  meta:         { fontSize:11, color:'#999' },
  bloqueoTag:   { fontSize:10, background:'#FFF3E0', color:'#E65100', borderRadius:20, padding:'2px 8px', fontWeight:700 },
  label:        { fontSize:12, color:'#555', display:'block', marginBottom:5, fontWeight:600 },
  select:       { width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid #ddd', fontSize:13, background:'#fff' },
  input:        { width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' },
  btnSec:       { padding:'6px 12px', borderRadius:8, border:'1px solid #421869', background:'#fff', color:'#421869', fontWeight:600, fontSize:12, cursor:'pointer' },
  btnQuitar:    { background:'none', border:'none', color:'#c62828', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 6px' },
  hint:         { fontSize:11, color:'#999', marginTop:8, marginBottom:0 },
  explica:      { fontSize:11.5, color:'#999', margin:'4px 0 0', lineHeight:1.5, paddingLeft:24 },
  checkLine:    { display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#444', marginTop:12, cursor:'pointer', flexWrap:'wrap' },
  limites:      { display:'flex', gap:24, flexWrap:'wrap', alignItems:'center', background:'#fafafa', borderRadius:10, padding:'4px 14px 12px' },
  btnLimpiar:   { background:'none', border:'none', color:'#c62828', fontSize:11.5, cursor:'pointer', textDecoration:'underline', padding:0 },
  costo:        { fontSize:12.5, color:'#6d28d9', background:'#f3e8ff', borderRadius:8, padding:'8px 12px', margin:'0 0 12px', lineHeight:1.55 },
  deuda:        { fontSize:12.5, color:'#856404', background:'#fff3cd', border:'1px solid #ffc107', borderRadius:8, padding:'8px 12px', margin:'0 0 12px', lineHeight:1.55 },
  btnRecargar:  { background:'none', border:'none', color:'#6d28d9', fontWeight:700, textDecoration:'underline', cursor:'pointer', fontSize:12.5, padding:0 },
  error:        { fontSize:12.5, color:'#c62828', background:'#ffebee', borderRadius:8, padding:'8px 12px', margin:'0 0 12px' },
  btnPrimario:  { width:'100%', padding:13, borderRadius:10, border:'none', fontWeight:700, fontSize:14, fontFamily:'Raleway, sans-serif' },
  linkWrap:     { marginBottom:8 },
  linkCard:     { display:'flex', alignItems:'center', gap:12, background:'#f8f8f8', borderRadius:10, padding:'12px 14px' },
  linkToggle:   { background:'none', border:'none', padding:'6px 0 0', fontSize:11.5, color:'#421869', fontWeight:700, cursor:'pointer', textAlign:'left' },
  participantes:{ background:'#fff', border:'1px solid #eee', borderTop:'none', borderRadius:'0 0 10px 10px', padding:'4px 14px 8px' },
  participanteRow: { display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f6f6f6' },
  participanteNombre: { fontSize:12.5, fontWeight:700, color:'#1a1a2e', margin:0, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' },
  participanteEmail:  { fontSize:11, color:'#888', margin:'2px 0 0' },
  participanteProgreso: { fontSize:12, fontWeight:800, flexShrink:0 },
  tagRegistrado:{ fontSize:9.5, fontWeight:700, background:'#e8f5e9', color:'#2e7d32', borderRadius:20, padding:'2px 7px' },
  tagAnonimo:   { fontSize:9.5, fontWeight:700, background:'#f0f0f0', color:'#888', borderRadius:20, padding:'2px 7px' },
  linkTitulo:   { fontSize:13, fontWeight:700, color:'#1a1a2e', margin:'0 0 3px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' },
  linkUrl:      { fontSize:11, color:'#777', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  linkLimites:  { fontSize:11, color:'#6d28d9', margin:'4px 0 0', fontWeight:600 },
  tagCerrado:   { fontSize:9.5, fontWeight:700, background:'#ffebee', color:'#c62828', borderRadius:20, padding:'2px 8px' },
  linkOk:       { fontSize:11, color:'#2e7d32', margin:'4px 0 0', fontWeight:600 },
  linkFail:     { fontSize:11, color:'#c62828', margin:'4px 0 0' },
  btnCopiar:    { fontSize:12, padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, flexShrink:0 },
};
