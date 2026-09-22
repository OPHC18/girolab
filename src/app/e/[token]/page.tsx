// src/app/e/[token]/page.tsx
// Landing pública de un link de evaluación multiuso.
// Muestra todas las evaluaciones que la persona debe rendir, la identifica
// (o la reconoce si vino invitada por correo o tiene sesión iniciada) y la
// encadena a la primera evaluación pendiente.

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/app/lib/supabase';
import PageShell from '@/components/assessments/PageShell';

interface InstrumentoResumen {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  totalItems: number;
  tiempoMinutos: number;
}
interface Paso {
  instrument_id: string;
  nombre: string;
  session_token: string;
  completado: boolean;
  result_id: string | null;
}
interface LinkData {
  estado: 'activo' | 'inactivo' | 'expirado' | 'cupo_lleno';
  link: { titulo: string | null; mensaje: string | null; instrumentos: InstrumentoResumen[]; tiempoTotalMinutos: number };
  participante: { nombre: string | null; email: string | null; participante_token: string; completado: boolean } | null;
  progreso: Paso[] | null;
  siguiente: Paso | null;
}

const MENSAJE_ESTADO: Record<string, string> = {
  inactivo:   'Este enlace fue desactivado por quien lo generó.',
  expirado:   'Este enlace venció y ya no admite nuevas respuestas.',
  cupo_lleno: 'Este enlace alcanzó el número máximo de participantes.',
};

export default function EvaluacionLinkPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const token = (params?.token as string) || '';
  const ptUrl = searchParams?.get('p') || '';

  const [data, setData]         = useState<LinkData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [iniciando, setIniciando] = useState(false);

  // ── Cargar el link ───────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    try {
      const res  = await fetch(`/api/evaluacion/${token}${ptUrl ? `?p=${ptUrl}` : ''}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'No pudimos cargar esta evaluación.'); return; }
      setData(json);
      if (json.participante?.nombre) setNombre(json.participante.nombre);
      if (json.participante?.email)  setEmail(json.participante.email);
    } catch {
      setError('No pudimos cargar esta evaluación. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  }, [token, ptUrl]);

  useEffect(() => { cargar(); }, [cargar]);

  // Prellenar con los datos de la cuenta si la persona ya está registrada
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      setNombre(prev => prev || [meta.nombre, meta.apellidos].filter(Boolean).join(' ').trim());
      setEmail(prev => prev || user.email || '');
    });
  }, []);

  // ── Iniciar / reanudar ───────────────────────────────────────────────────
  const handleComenzar = async () => {
    setIniciando(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/evaluacion/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email:  email.trim(),
          participante_token: data?.participante?.participante_token || ptUrl || undefined,
          metadata: { referrer: document.referrer, device: getDeviceType() },
        }),
      });
      const json = await res.json();

      if (!res.ok) { setError(json.error || 'No pudimos iniciar la evaluación.'); setIniciando(false); return; }
      if (!json.siguiente) { await cargar(); setIniciando(false); return; }

      irAlTest(json.siguiente, json.participante_token);
    } catch {
      setError('No pudimos iniciar la evaluación. Intenta de nuevo.');
      setIniciando(false);
    }
  };

  const irAlTest = (paso: Paso, participanteToken: string) => {
    router.push(
      `/test/${paso.instrument_id}?t=${paso.session_token}&p=${participanteToken}&e=${token}`
    );
  };

  // ── Estados de carga / error ─────────────────────────────────────────────
  if (cargando) {
    return (
      <PageShell>
        <Centro><p style={{ color: '#888', fontSize: 15 }}>Cargando evaluación…</p></Centro>
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell>
        <Centro>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <h2 style={s.titulo}>Enlace no disponible</h2>
          <p style={s.desc}>{error}</p>
        </Centro>
      </PageShell>
    );
  }

  if (!data) return null;

  const { link, participante, progreso, siguiente } = data;
  const yaEmpezo    = !!progreso;
  const completadas = progreso?.filter(p => p.completado).length ?? 0;
  const total       = link.instrumentos.length;
  const termino     = yaEmpezo && !siguiente;

  // Link cerrado — salvo que la persona ya esté dentro y le falte terminar
  if (data.estado !== 'activo' && !yaEmpezo) {
    return (
      <PageShell>
        <Centro>
          <div style={{ fontSize: 44, marginBottom: 12 }}>⏳</div>
          <h2 style={s.titulo}>Enlace no disponible</h2>
          <p style={s.desc}>{MENSAJE_ESTADO[data.estado]}</p>
        </Centro>
      </PageShell>
    );
  }

  // ── Ya completó todo ─────────────────────────────────────────────────────
  if (termino) {
    return (
      <PageShell>
        <Centro>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={s.titulo}>¡Listo, terminaste!</h2>
          <p style={s.desc}>
            Completaste {total === 1 ? 'la evaluación' : `las ${total} evaluaciones`}. Quien te envió
            este enlace ya puede ver tus resultados.
          </p>
          <div style={{ width: '100%', marginTop: 8 }}>
            {progreso!.map(paso => (
              <div key={paso.instrument_id} style={s.pasoRow}>
                <span style={s.check}>✓</span>
                <span style={s.pasoNombre}>{paso.nombre}</span>
              </div>
            ))}
          </div>
        </Centro>
      </PageShell>
    );
  }

  const puedeContinuar =
    nombre.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // ── Intro + identificación ───────────────────────────────────────────────
  return (
    <PageShell>
      <div style={s.page}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <DotLottieReact
            src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie"
            autoplay loop style={{ width: 66, height: 66 }}
          />
        </div>

        <h1 style={s.titulo}>
          {link.titulo || (total > 1 ? `Tienes ${total} evaluaciones` : 'Tienes una evaluación')}
        </h1>
        <p style={s.desc}>
          {participante?.nombre ? `Hola ${participante.nombre}. ` : ''}
          {total > 1
            ? 'Vas a rendirlas una tras otra desde este mismo enlace.'
            : 'Te tomará solo unos minutos.'}
        </p>
        {link.mensaje && <p style={s.mensaje}>{link.mensaje}</p>}

        <div style={s.badges}>
          <div style={s.badge}>
            <span style={s.badgeNum}>{total}</span>
            <span style={s.badgeLabel}>{total === 1 ? 'evaluación' : 'evaluaciones'}</span>
          </div>
          <div style={s.sep} />
          <div style={s.badge}>
            <span style={s.badgeNum}>~{link.tiempoTotalMinutos}</span>
            <span style={s.badgeLabel}>minutos</span>
          </div>
          <div style={s.sep} />
          <div style={s.badge}>
            <span style={s.badgeNum}>100%</span>
            <span style={s.badgeLabel}>confidencial</span>
          </div>
        </div>

        {/* Lista de evaluaciones con su estado */}
        <div style={{ width: '100%', marginBottom: 24 }}>
          {link.instrumentos.map((inst, i) => {
            const paso = progreso?.find(p => p.instrument_id === inst.id);
            const hecho = paso?.completado ?? false;
            return (
              <div key={inst.id} style={{ ...s.pasoRow, opacity: hecho ? 0.55 : 1 }}>
                <span style={{ ...s.indice, background: hecho ? '#4CAF50' : inst.color }}>
                  {hecho ? '✓' : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={s.pasoNombre}>{inst.nombre}</p>
                  <p style={s.pasoMeta}>{inst.totalItems} ítems · ~{inst.tiempoMinutos} min</p>
                </div>
              </div>
            );
          })}
        </div>

        {yaEmpezo && (
          <p style={s.progresoTexto}>
            Llevas {completadas} de {total} completadas. Retomas donde lo dejaste.
          </p>
        )}

        {/* Identificación — se piden los datos una sola vez */}
        {!yaEmpezo && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={s.label}>Nombre completo *</label>
              <input
                type="text" placeholder="ej. María García" value={nombre}
                onChange={e => setNombre(e.target.value)} style={s.input}
                onKeyDown={e => e.key === 'Enter' && puedeContinuar && handleComenzar()}
              />
            </div>
            <div>
              <label style={s.label}>Correo electrónico *</label>
              <input
                type="email" placeholder="ej. maria@email.com" value={email}
                onChange={e => setEmail(e.target.value)} style={s.input}
                onKeyDown={e => e.key === 'Enter' && puedeContinuar && handleComenzar()}
              />
            </div>
          </div>
        )}

        {error && <p style={s.error}>{error}</p>}

        <button
          onClick={handleComenzar}
          disabled={!puedeContinuar || iniciando}
          style={{
            ...s.btn,
            background: puedeContinuar && !iniciando ? '#421869' : '#e0e0e0',
            color:      puedeContinuar && !iniciando ? '#fff' : '#999',
            cursor:     puedeContinuar && !iniciando ? 'pointer' : 'not-allowed',
          }}>
          {iniciando ? 'Preparando…' : yaEmpezo ? 'Continuar' : 'Comenzar'}
        </button>

        <p style={s.disclaimer}>
          Tus respuestas son confidenciales. Puedes cerrar y retomar desde este mismo enlace.
        </p>
      </div>
    </PageShell>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...s.page, justifyContent: 'center', textAlign: 'center' }}>{children}</div>
  );
}

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
}

const s: Record<string, React.CSSProperties> = {
  page:        { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 28px', fontFamily: "'DM Sans', system-ui" },
  titulo:      { fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 24, fontWeight: 900, margin: '0 0 10px', textAlign: 'center', lineHeight: 1.25 },
  desc:        { color: '#777', fontSize: 14, lineHeight: 1.65, margin: '0 0 18px', textAlign: 'center' },
  mensaje:     { color: '#555', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px', textAlign: 'center', fontStyle: 'italic', background: '#faf5ff', borderRadius: 12, padding: '12px 16px', width: '100%', boxSizing: 'border-box' },
  badges:      { display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f8f8', borderRadius: 16, border: '1px solid #EBEBE7', padding: '16px 0', marginBottom: 22, width: '100%' },
  badge:       { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  badgeNum:    { fontSize: 21, fontWeight: 800, color: '#1a1a1a' },
  badgeLabel:  { fontSize: 11, color: '#ABABAB', textTransform: 'uppercase', letterSpacing: 0.8 },
  sep:         { width: 1, height: 32, background: '#EBEBE7' },
  pasoRow:     { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f4f4f2' },
  indice:      { width: 26, height: 26, borderRadius: '50%', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  check:       { width: 26, height: 26, borderRadius: '50%', background: '#4CAF50', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pasoNombre:  { fontSize: 14, color: '#1a1a1a', fontWeight: 600, margin: 0, lineHeight: 1.35 },
  pasoMeta:    { fontSize: 11, color: '#999', margin: '2px 0 0' },
  progresoTexto: { fontSize: 13, color: '#421869', fontWeight: 600, marginBottom: 16, textAlign: 'center' },
  label:       { display: 'block', fontWeight: 600, color: '#421869', marginBottom: 7, fontSize: 14 },
  input:       { width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box', outline: 'none' },
  btn:         { width: '100%', padding: 14, border: 'none', borderRadius: 30, fontWeight: 700, fontSize: 15, fontFamily: 'Raleway, sans-serif', transition: 'all 0.2s' },
  error:       { color: '#c62828', fontSize: 13, background: '#ffebee', borderRadius: 10, padding: '10px 14px', width: '100%', boxSizing: 'border-box', marginBottom: 12, textAlign: 'center' },
  disclaimer:  { textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 16, lineHeight: 1.6 },
};
