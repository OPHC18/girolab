'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/app/lib/supabase';
import TestStepper, { type StepperConfig, type StepperItem } from '@/components/assessments/TestStepper';
import {
  INSTRUMENTS,
  scoreInstrument,
  parseNPIResponses,
  type InstrumentId,
  type Responses,
} from '@/lib/assessments/instruments';
import { scoreBarOn } from '@/lib/assessments/baron-scoring';
import {
  EMPRESA_INSTRUMENTS,
  scoreDISC,
  scoreHEXACO,
  DISC_ITEMS,
  type EmpresaInstrumentId,
  type DISCGroupResponse,
  type HEXACOResponses,
} from '@/lib/assessments/instruments_empresa';
import { ITEMS, INSTRUMENT_INSTRUCTIONS } from '@/lib/assessments/items';

// ─────────────────────────────────────────────────────────────
// WRAPPER: fondo institucional con círculos animados
// ─────────────────────────────────────────────────────────────
const CIRCLES = [
  {left:'25%',size:80,delay:0,dur:25},{left:'10%',size:20,delay:2,dur:12},
  {left:'70%',size:20,delay:4,dur:25},{left:'40%',size:60,delay:8,dur:20},
  {left:'85%',size:30,delay:1,dur:18},
];

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#421869', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <ul style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', margin: 0, padding: 0, zIndex: 0, pointerEvents: 'none', listStyle: 'none' }}>
        {CIRCLES.map((c, i) => (
          <li key={i} style={{ position: 'absolute', display: 'block', width: c.size, height: c.size, background: 'rgba(255,255,255,0.05)', bottom: -150, left: c.left, borderRadius: '50%', animation: `animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </ul>
      <style>{`@keyframes animateUp{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-110vh) rotate(720deg);opacity:0}}`}</style>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 640, background: 'white', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONSTRUIR CONFIGURACIÓN DEL STEPPER POR INSTRUMENTO
// ─────────────────────────────────────────────────────────────
function buildStepperConfig(instrumentId: string): StepperConfig | null {
  const inst =
    INSTRUMENTS[instrumentId as InstrumentId] ||
    EMPRESA_INSTRUMENTS[instrumentId as EmpresaInstrumentId];
  if (!inst) return null;

  return {
    instrumentId,
    nombre:      inst.nombre,
    icono:       inst.icono,
    color:       inst.color,
    opciones:    (inst as any).opciones || [],
    autoAvanceMs: 1800,
  };
}

// Convertir ítems de DISC al formato StepperItem (elección forzada A/B)
// Para DISC usamos un stepper especial — cada grupo es un ítem con 4 adjetivos
// Los manejamos como 4 opciones por pantalla (2 pasos: Más → Menos)
// Aquí lo simplificamos: un grupo DISC = un StepperItem con tipo disc
function buildDISCItems(): StepperItem[] {
  return DISC_ITEMS.map(grupo => ({
    numero: grupo.grupo,
    texto:  `Grupo ${grupo.grupo} de 24`,
    tipo:   'likert' as const, // sobreescrito en el componente DISC
    instruccion: 'Selecciona la palabra que MÁS te describe y la que MENOS te describe',
  }));
}

// Convertir ítems NPI al formato par A/B
function buildNPIItems(): StepperItem[] {
  return (ITEMS.NPI_40 || []).map(item => {
    const lines = item.texto.split('\n');
    return {
      numero: item.numero,
      texto:  `Elige la afirmación que mejor te describe`,
      tipo:   'npi_par' as const,
      parA:   lines[0]?.replace(/^A:\s*/, '') || '',
      parB:   lines[1]?.replace(/^B:\s*/, '') || '',
    };
  });
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function TestPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const rawId        = params?.instrument as string;
  // Try ID preserving case first (ASRS_v1_1 has lowercase 'v'), fallback to uppercase
  const rawNormalized = rawId?.replace(/-/g, '_') ?? ''
  const instrumentId  =
    (INSTRUMENTS[rawNormalized as InstrumentId] || EMPRESA_INSTRUMENTS[rawNormalized as EmpresaInstrumentId])
      ? rawNormalized
      : rawNormalized.toUpperCase();
  const token        = searchParams?.get('t') || '';

  const [phase, setPhase]               = useState<'intro' | 'datos' | 'test' | 'submitting'>('intro');
  const [sessionToken, setSessionToken] = useState(token);
  const [anonNombre, setAnonNombre]     = useState('');
  const [anonEmail, setAnonEmail]       = useState('');
  const [isAnon, setIsAnon]             = useState(false);
  const [authChecked, setAuthChecked]   = useState(false);
  // DISC acumula respuestas grupo a grupo
  const [discResponses, setDiscResponses] = useState<DISCGroupResponse[]>([]);

  const isDisc   = instrumentId === 'DISC';
  const isHexaco = instrumentId === 'HEXACO_HH';
  const isNPI    = instrumentId === 'NPI_40';
  const isBarOn  = instrumentId === 'BARON_ICE';

  const inst   = INSTRUMENTS[instrumentId as InstrumentId] ||
                 EMPRESA_INSTRUMENTS[instrumentId as EmpresaInstrumentId];
  const config = buildStepperConfig(instrumentId);

  // Items listos para el Stepper
  const stepperItems: StepperItem[] = isNPI
    ? buildNPIItems()
    : (ITEMS[instrumentId as InstrumentId] || []).map(item => ({
        numero: item.numero,
        texto:  item.texto,
        instruccion: item.instruccion,
        tipo: instrumentId === 'MDQ' && item.numero === 15 ? 'mdq_c' : 'likert',
      }));

  // Detectar si el usuario es anónimo para mostrar formulario de datos
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) setIsAnon(true);
      setAuthChecked(true);
    });
  }, []);

  // Crear sesión si no hay token (usuario llega directo desde anuncio)
  useEffect(() => {
    if (sessionToken) return;
    const utms = Object.fromEntries(
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']
        .map(k => [k, new URLSearchParams(window.location.search).get(k) || ''])
        .filter(([, v]) => v)
    );
    supabase.rpc('create_assessment_link', {
      p_instrument_id: instrumentId,
      p_menter_id: null,
    }).then(({ data }) => {
      if (data?.token) {
        setSessionToken(data.token);
        if (Object.keys(utms).length) {
          supabase.from('assessment_sessions')
            .update({ metadata: { ...utms, fuente: 'landing' } })
            .eq('session_token', data.token).then(() => {});
        }
      }
    });
  }, [instrumentId]);

  // Guardar nombre/email en la sesión y avanzar al test
  const handleDatosConfirm = async () => {
    if (!anonNombre.trim() || !anonEmail.trim()) return;
    if (sessionToken) {
      // Use API route — direct update is blocked by RLS for anonymous users
      await fetch('/api/assessment/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken, nombre: anonNombre.trim(), email: anonEmail.trim() }),
      });
    }
    setPhase('test');
  };

  // ── SUBMIT ──
  const handleComplete = async (responses: Responses) => {
    setPhase('submitting');

    let result: any;
    let pb: number | undefined;
    let screening: boolean | undefined;
    let severidad: string | undefined;

    if (isDisc) {
      result   = scoreDISC(discResponses);
    } else if (isHexaco) {
      result   = scoreHEXACO(responses as HEXACOResponses);
      pb       = result.scoreTotal;
      severidad = result.nivelIntegridad;
    } else if (isBarOn) {
      result   = scoreBarOn(responses);
      pb       = result.puntuacionBruta;
      severidad = result.severidadLabel;
    } else {
      const parsed = isNPI ? parseNPIResponses(responses as any) : responses;
      result    = scoreInstrument(instrumentId as InstrumentId, parsed);
      pb        = result.puntuacionBruta;
      screening = result.screeningPositivo;
      severidad = result.severidadLabel;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase.rpc('save_assessment_result', {
      p_session_token:      sessionToken,
      p_persona_id:         user?.id || null,
      p_instrument_id:      instrumentId,
      p_puntuacion_bruta:   pb ?? null,
      p_resultado_json:     result,
      p_screening_positivo: screening ?? null,
      p_severidad_label:    severidad ?? null,
      p_tags_menters:       result.tagsMenters || [],
    });

    if (data?.result_id) {
      // Notify menter if this test was initiated from a menter's link
      try {
        const { data: session } = await supabase
          .from('assessment_sessions')
          .select('menter_id, persona_nombre, persona_email')
          .eq('session_token', sessionToken)
          .single()
        if (session?.menter_id) {
          const { data: menterProfile } = await supabase
            .from('menter_public_profiles')
            .select('nombre')
            .eq('id', session.menter_id)
            .single()
          if (menterProfile) {
            await fetch('/api/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tipo: 'resultado_test_menter',
                data: {
                  menter_id: session.menter_id,
                  menterNombre: (menterProfile as any).nombre,
                  personaNombre: session.persona_nombre || 'Un usuario',
                  personaEmail: session.persona_email || '',
                  instrumentoNombre: inst.nombre,
                  resultadoUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'}/test/${rawId}/resultado?r=${data.result_id}&t=${sessionToken}`,
                },
              }),
            })
          }
        }
      } catch { /* Non-critical — proceed to result page */ }

      router.push(`/test/${rawId}/resultado?r=${data.result_id}&t=${sessionToken}`);
    }
  };

  // ── DISCO: stepper especial con DISCStepperAdapter ──
  // Para DISC, cada "respuesta" del Stepper es el índice del adjetivo
  // seleccionado como "Más" en ese grupo. El "Menos" se pide en una
  // segunda pantalla por grupo.

  if (!inst || !config) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#888', fontFamily:'system-ui' }}>
        Test no encontrado.
      </div>
    );
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <PageShell>
        <IntroScreen
          inst={inst}
          instruccion={INSTRUMENT_INSTRUCTIONS[instrumentId] || ''}
          authChecked={authChecked}
          onStart={() => isAnon ? setPhase('datos') : setPhase('test')}
        />
      </PageShell>
    );
  }

  // ── DATOS ANÓNIMO ──
  if (phase === 'datos') {
    const valid = anonNombre.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(anonEmail);
    return (
      <PageShell>
        <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', fontFamily: "'DM Sans', system-ui" }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>👤</div>
              <h2 style={{ fontFamily: 'Raleway, sans-serif', color: '#421869', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>Un paso más</h2>
              <p style={{ color: '#888', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
                Ingresa tus datos para que el profesional que te compartió este test pueda identificar tu resultado.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Nombre completo *</label>
                <input
                  type="text"
                  placeholder="ej. María García"
                  value={anonNombre}
                  onChange={e => setAnonNombre(e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box', outline: 'none' }}
                  onKeyDown={e => e.key === 'Enter' && valid && handleDatosConfirm()}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#421869', marginBottom: 8, fontSize: 14 }}>Correo electrónico *</label>
                <input
                  type="email"
                  placeholder="ej. maria@email.com"
                  value={anonEmail}
                  onChange={e => setAnonEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans', boxSizing: 'border-box', outline: 'none' }}
                  onKeyDown={e => e.key === 'Enter' && valid && handleDatosConfirm()}
                />
              </div>
            </div>
            <button
              onClick={handleDatosConfirm}
              disabled={!valid}
              style={{ width: '100%', marginTop: 24, padding: '14px', background: valid ? '#421869' : '#e0e0e0', color: valid ? 'white' : '#999', border: 'none', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: valid ? 'pointer' : 'not-allowed', fontFamily: 'Raleway, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              Continuar al test →
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 16 }}>
              Tus datos son confidenciales y no se compartirán con terceros.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── SUBMITTING ──
  if (phase === 'submitting') {
    return (
      <PageShell>
        <SubmittingScreen color={config.color} />
      </PageShell>
    );
  }

  // ── DISC: adaptador especial ──
  if (isDisc) {
    return (
      <PageShell>
        <DISCStepperPage
          config={config}
          onComplete={(dr) => {
            setDiscResponses(dr);
            handleComplete({});
          }}
          onBack={() => setPhase('intro')}
        />
      </PageShell>
    );
  }

  // ── TEST ESTÁNDAR ──
  return (
    <PageShell>
      <TestStepper
        config={config}
        items={stepperItems}
        onComplete={handleComplete}
        onBack={() => setPhase('intro')}
      />
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────
// DISC: stepper de 2 pasos por grupo (Más → Menos)
// ─────────────────────────────────────────────────────────────
function DISCStepperPage({
  config,
  onComplete,
  onBack,
}: {
  config: StepperConfig;
  onComplete: (responses: DISCGroupResponse[]) => void;
  onBack: () => void;
}) {
  const [grupoIndex, setGrupoIndex] = useState(0);
  const [subStep, setSubStep]       = useState<'mas' | 'menos'>('mas');
  const [masIndex, setMasIndex]     = useState<number | null>(null);
  const [menosIndex, setMenosIndex] = useState<number | null>(null);
  const [responses, setResponses]   = useState<DISCGroupResponse[]>([]);
  const [animKey, setAnimKey]       = useState(0);

  const grupo      = DISC_ITEMS[grupoIndex];
  const totalSteps = DISC_ITEMS.length * 2;
  const currentStep = grupoIndex * 2 + (subStep === 'mas' ? 0 : 1);
  const progress   = Math.round((currentStep / totalSteps) * 100);

  const handleSelect = (idx: number) => {
    if (subStep === 'mas') {
      setMasIndex(idx);
      setTimeout(() => {
        setSubStep('menos');
        setAnimKey(k => k + 1);
      }, 600);
    } else {
      if (idx === masIndex) return; // no puede elegir el mismo
      setMenosIndex(idx);
      const newResponses = [...responses, { grupo: grupo.grupo, masIndex: masIndex!, menosIndex: idx }];
      setTimeout(() => {
        if (grupoIndex < DISC_ITEMS.length - 1) {
          setResponses(newResponses);
          setGrupoIndex(g => g + 1);
          setSubStep('mas');
          setMasIndex(null);
          setMenosIndex(null);
          setAnimKey(k => k + 1);
        } else {
          onComplete(newResponses);
        }
      }, 500);
    }
  };

  const handleBack = () => {
    if (subStep === 'menos') { setSubStep('mas'); setMenosIndex(null); setAnimKey(k => k + 1); return; }
    if (grupoIndex === 0) { onBack(); return; }
    setGrupoIndex(g => g - 1);
    setSubStep('mas');
    setMasIndex(null);
    setMenosIndex(null);
    setResponses(r => r.slice(0, -1));
    setAnimKey(k => k + 1);
  };

  const seleccionado = subStep === 'mas' ? masIndex : menosIndex;
  const instruccionJSX = subStep === 'mas' ? (
    <>¿CUÁL DE ESTAS PALABRAS TE DESCRIBE <span style={{ color: '#16a34a', fontWeight: 800 }}>MÁS</span>?</>
  ) : (
    <>¿Y CUÁL TE DESCRIBE <span style={{ color: '#dc2626', fontWeight: 800 }}>MENOS</span>?</>
  );

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={s.logoWrap}>
          <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" autoplay loop style={{ width: 36, height: 36 }} />
        </div>
        <span style={s.counterText}>{grupoIndex + 1}<span style={s.counterOf}>/{DISC_ITEMS.length}</span></span>
      </header>

      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width:`${progress}%`, background: config.color }} />
      </div>

      <main style={s.main}>
        <div key={animKey} style={{ ...s.questionWrap, animation: 'slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards' }}>
          <p style={s.instruccion}>{instruccionJSX}</p>
          <h2 style={{ ...s.questionText, fontSize: 18, marginBottom: 24 }}>
            Grupo {grupo.grupo} de {DISC_ITEMS.length}
          </h2>

          <div style={s.optionsList}>
            {grupo.adjetivos.map((adj, i) => {
              const isSelected = seleccionado === i;
              const isUsed     = subStep === 'menos' && masIndex === i;
              return (
                <button
                  key={i}
                  disabled={isUsed}
                  style={{
                    ...s.optionBtn,
                    borderColor:  isSelected ? config.color : isUsed ? '#F0F0EA' : '#E8E8E4',
                    background:   isSelected ? `${config.color}0F` : isUsed ? '#F8F8F5' : '#FAFAF8',
                    transform:    isSelected ? 'translateX(6px)' : 'translateX(0)',
                    opacity:      isUsed ? 0.4 : 1,
                    cursor:       isUsed ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => !isUsed && handleSelect(i)}
                >
                  <span style={{ ...s.optionBullet, background: isSelected ? config.color : 'transparent', borderColor: isSelected ? config.color : '#C4C4BC' }}>
                    {isSelected && <span style={s.bulletCheck}>·</span>}
                    {isUsed     && <span style={{ fontSize:10, color:'#bbb' }}>+</span>}
                  </span>
                  <span style={{ ...s.optionLabel, fontWeight: isSelected ? 700 : 400, fontSize: 17, color: isSelected ? '#1a1a1a' : isUsed ? '#bbb' : '#444' }}>
                    {adj.texto}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer style={s.footer}>
        <p style={{ ...s.footerHint, color: '#333', fontSize: 14, fontWeight: 600 }}>
          {subStep === 'mas' ? (
            <>Selecciona la que te describe <span style={{ color: '#16a34a', fontWeight: 800 }}>MÁS</span></>
          ) : (
            <>Selecciona la que te describe <span style={{ color: '#dc2626', fontWeight: 800 }}>MENOS</span></>
          )}
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes slideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTRO SCREEN
// ─────────────────────────────────────────────────────────────
function IntroScreen({ inst, instruccion, authChecked, onStart }: { inst: any; instruccion: string; authChecked: boolean; onStart: () => void }) {
  return (
    <div style={intro.page}>
      <div style={intro.card}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom: 24 }}>
          <DotLottieReact src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie" autoplay loop style={{ width: 70, height: 70 }} />
        </div>
        <div style={{ ...intro.colorBar, background: inst.color }} />
        <h1 style={intro.title}>{inst.nombre}</h1>
        <p style={intro.desc}>{instruccion || inst.descripcion}</p>

        <div style={intro.badges}>
          <div style={intro.badge}>
            <span style={intro.badgeNum}>{inst.totalItems}</span>
            <span style={intro.badgeLabel}>preguntas</span>
          </div>
          <div style={intro.sep} />
          <div style={intro.badge}>
            <span style={intro.badgeNum}>~{inst.tiempoMinutos}</span>
            <span style={intro.badgeLabel}>minutos</span>
          </div>
          <div style={intro.sep} />
          <div style={intro.badge}>
            <span style={intro.badgeNum}>100%</span>
            <span style={intro.badgeLabel}>privado</span>
          </div>
        </div>

        <button style={{ ...intro.btn, background: authChecked ? '#421869' : '#9e9e9e', cursor: authChecked ? 'pointer' : 'wait' }} onClick={authChecked ? onStart : undefined}>
          {authChecked ? 'Comenzar' : 'Cargando…'}
          {authChecked && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
        </button>
        <p style={intro.disclaimer}>
          Validado científicamente · {inst.referencia}
        </p>
      </div>
    </div>
  );
}

function SubmittingScreen({ color }: { color: string }) {
  return (
    <div style={{ flex:1, background:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, fontFamily:"'DM Sans', system-ui" }}>
      <div style={{ width:52, height:52, border:`3px solid #EBEBE7`, borderTopColor: color, borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
      <p style={{ fontSize:16, color:'#888', fontFamily:"'Raleway', sans-serif" }}>Calculando tu perfil…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ESTILOS COMPARTIDOS (stepper + DISC)
// ─────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:          { flex:1, background:'white', display:'flex', flexDirection:'column', fontFamily:"'DM Sans', system-ui, sans-serif", overflowX:'hidden' },
  header:        { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 10px', position:'sticky', top:0, background:'rgba(250,250,248,0.92)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', zIndex:20 },
  backBtn:       { width:38, height:38, borderRadius:12, border:'1.5px solid #E8E8E4', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#555', flexShrink:0 },
  logoWrap:      { display:'flex', alignItems:'center', gap:6 },
  counterText:   { fontSize:14, fontWeight:700, color:'#1a1a1a', minWidth:38, textAlign:'right' },
  counterOf:     { fontWeight:400, color:'#ABABAB', fontSize:13 },
  progressTrack: { height:3, background:'#EBEBE7', position:'relative', overflow:'hidden' },
  progressFill:  { height:'100%', borderRadius:99, transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)' },
  main:          { flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'32px 20px 20px', overflowY:'auto' },
  questionWrap:  { width:'100%', maxWidth:520 },
  instruccion:   { fontSize:13, color:'#444', fontWeight:600, textTransform:'uppercase', letterSpacing:1, margin:'0 0 10px' },
  questionText:  { fontSize:22, fontWeight:700, color:'#1a1a1a', lineHeight:1.45, margin:'0 0 28px', fontFamily:"'Raleway', sans-serif" },
  optionsList:   { display:'flex', flexDirection:'column', gap:10 },
  optionBtn:     { display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:16, border:'1.5px solid', cursor:'pointer', textAlign:'left', transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)', position:'relative', overflow:'hidden' },
  optionBullet:  { width:22, height:22, borderRadius:'50%', border:'2px solid', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s ease' },
  bulletCheck:   { fontSize:12, color:'#fff', fontWeight:700, lineHeight:1 },
  optionLabel:   { flex:1, fontSize:15, lineHeight:1.4, transition:'color 0.15s' },
  footer:        { padding:'16px 20px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, background:'rgba(250,250,248,0.92)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderTop:'1px solid #EBEBE7' },
  footerHint:    { fontSize:13, color:'#555', fontWeight:500, margin:0 },
};

const intro: Record<string, React.CSSProperties> = {
  page:        { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px', fontFamily:"'DM Sans', system-ui" },
  card:        { maxWidth:440, width:'100%', textAlign:'center' },
  colorBar:    { width:40, height:4, borderRadius:99, margin:'0 auto 20px' },
  icon:        { fontSize:52, display:'block', marginBottom:12 },
  title:       { fontSize:26, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px', lineHeight:1.25, fontFamily:"'Raleway', sans-serif" },
  desc:        { fontSize:14, color:'#777', lineHeight:1.7, margin:'0 0 28px' },
  badges:      { display:'flex', justifyContent:'center', alignItems:'center', background:'#f8f8f8', borderRadius:16, border:'1px solid #EBEBE7', padding:'16px 0', marginBottom:24 },
  badge:       { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  badgeNum:    { fontSize:22, fontWeight:800, color:'#1a1a1a' },
  badgeLabel:  { fontSize:11, color:'#ABABAB', textTransform:'uppercase', letterSpacing:0.8 },
  sep:         { width:1, height:32, background:'#EBEBE7' },
  btn:         { width:'100%', padding:'17px', borderRadius:16, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16, fontFamily:"'Raleway', sans-serif" },
  disclaimer:  { fontSize:11, color:'#C4C4BC', lineHeight:1.6 },
};