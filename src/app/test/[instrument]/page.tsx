'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import TestStepper, { type StepperConfig, type StepperItem } from '@/components/assessments/TestStepper';
import {
  INSTRUMENTS,
  scoreInstrument,
  parseNPIResponses,
  type InstrumentId,
  type Responses,
} from '@/lib/assessments/instruments';
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
  const instrumentId = rawId?.toUpperCase().replace(/-/g, '_');
  const token        = searchParams?.get('t') || '';

  const [phase, setPhase]               = useState<'intro' | 'test' | 'submitting'>('intro');
  const [sessionToken, setSessionToken] = useState(token);
  // DISC acumula respuestas grupo a grupo
  const [discResponses, setDiscResponses] = useState<DISCGroupResponse[]>([]);

  const isDisc   = instrumentId === 'DISC';
  const isHexaco = instrumentId === 'HEXACO_HH';
  const isNPI    = instrumentId === 'NPI_40';

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
      <IntroScreen
        inst={inst}
        instruccion={INSTRUMENT_INSTRUCTIONS[instrumentId] || ''}
        onStart={() => setPhase('test')}
      />
    );
  }

  // ── SUBMITTING ──
  if (phase === 'submitting') {
    return <SubmittingScreen color={config.color} />;
  }

  // ── DISC: adaptador especial ──
  if (isDisc) {
    return (
      <DISCStepperPage
        config={config}
        onComplete={(dr) => {
          setDiscResponses(dr);
          handleComplete({});
        }}
        onBack={() => setPhase('intro')}
      />
    );
  }

  // ── TEST ESTÁNDAR ──
  return (
    <TestStepper
      config={config}
      items={stepperItems}
      onComplete={handleComplete}
      onBack={() => setPhase('intro')}
    />
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
  const instruccion  = subStep === 'mas'
    ? '¿Cuál de estas palabras te describe MÁS?'
    : '¿Y cuál te describe MENOS?';

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={s.logoWrap}>
          <span style={s.logoMark}>◐</span>
          <span style={s.logoText}>Giro Lab</span>
        </div>
        <span style={s.counterText}>{grupoIndex + 1}<span style={s.counterOf}>/{DISC_ITEMS.length}</span></span>
      </header>

      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width:`${progress}%`, background: config.color }} />
      </div>

      <main style={s.main}>
        <div key={animKey} style={{ ...s.questionWrap, animation: 'slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards' }}>
          <p style={s.instruccion}>{instruccion}</p>
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
                    {isSelected && <span style={s.bulletCheck}>✓</span>}
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
        <p style={s.footerHint}>
          {subStep === 'mas' ? 'Selecciona la que MÁS te describe' : 'Ahora selecciona la que MENOS te describe'}
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
function IntroScreen({ inst, instruccion, onStart }: { inst: any; instruccion: string; onStart: () => void }) {
  return (
    <div style={intro.page}>
      <div style={intro.card}>
        <span style={intro.logo}>◐ Giro Lab</span>
        <div style={{ ...intro.colorBar, background: inst.color }} />
        <span style={intro.icon}>{inst.icono}</span>
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

        <button style={{ ...intro.btn, background: inst.color }} onClick={onStart}>
          Comenzar
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <p style={intro.disclaimer}>
          Validado científicamente · {inst.referencia}
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;600;700&display=swap');`}</style>
    </div>
  );
}

function SubmittingScreen({ color }: { color: string }) {
  return (
    <div style={{ minHeight:'100dvh', background:'#FAFAF8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, fontFamily:"'DM Sans', system-ui" }}>
      <div style={{ width:52, height:52, border:`3px solid #EBEBE7`, borderTopColor: color, borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
      <p style={{ fontSize:16, color:'#888', fontFamily:"'DM Serif Display', Georgia, serif" }}>Calculando tu perfil…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ESTILOS COMPARTIDOS (stepper + DISC)
// ─────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:          { minHeight:'100dvh', background:'#FAFAF8', display:'flex', flexDirection:'column', fontFamily:"'DM Sans', system-ui, sans-serif", overflowX:'hidden' },
  header:        { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 10px', position:'sticky', top:0, background:'rgba(250,250,248,0.92)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', zIndex:20 },
  backBtn:       { width:38, height:38, borderRadius:12, border:'1.5px solid #E8E8E4', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#555', flexShrink:0 },
  logoWrap:      { display:'flex', alignItems:'center', gap:6 },
  logoMark:      { fontSize:18, color:'#1a1a1a', lineHeight:1 },
  logoText:      { fontSize:14, fontWeight:700, color:'#1a1a1a', letterSpacing:0.5, fontFamily:"'DM Serif Display', Georgia, serif" },
  counterText:   { fontSize:14, fontWeight:700, color:'#1a1a1a', minWidth:38, textAlign:'right' },
  counterOf:     { fontWeight:400, color:'#ABABAB', fontSize:13 },
  progressTrack: { height:3, background:'#EBEBE7', position:'relative', overflow:'hidden' },
  progressFill:  { height:'100%', borderRadius:99, transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)' },
  main:          { flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'32px 20px 20px', overflowY:'auto' },
  questionWrap:  { width:'100%', maxWidth:520 },
  instruccion:   { fontSize:12, color:'#ABABAB', fontWeight:600, textTransform:'uppercase', letterSpacing:1, margin:'0 0 10px' },
  questionText:  { fontSize:22, fontWeight:400, color:'#1a1a1a', lineHeight:1.45, margin:'0 0 28px', fontFamily:"'DM Serif Display', Georgia, serif" },
  optionsList:   { display:'flex', flexDirection:'column', gap:10 },
  optionBtn:     { display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:16, border:'1.5px solid', cursor:'pointer', textAlign:'left', transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)', position:'relative', overflow:'hidden' },
  optionBullet:  { width:22, height:22, borderRadius:'50%', border:'2px solid', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s ease' },
  bulletCheck:   { fontSize:12, color:'#fff', fontWeight:700, lineHeight:1 },
  optionLabel:   { flex:1, fontSize:15, lineHeight:1.4, transition:'color 0.15s' },
  footer:        { padding:'16px 20px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, background:'rgba(250,250,248,0.92)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderTop:'1px solid #EBEBE7' },
  footerHint:    { fontSize:12, color:'#ABABAB', margin:0 },
};

const intro: Record<string, React.CSSProperties> = {
  page:        { minHeight:'100dvh', background:'#FAFAF8', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px', fontFamily:"'DM Sans', system-ui" },
  card:        { maxWidth:440, width:'100%', textAlign:'center' },
  logo:        { fontSize:14, fontWeight:700, color:'#ABABAB', letterSpacing:1, display:'block', marginBottom:32, fontFamily:"'DM Serif Display', Georgia, serif" },
  colorBar:    { width:40, height:4, borderRadius:99, margin:'0 auto 20px' },
  icon:        { fontSize:52, display:'block', marginBottom:12 },
  title:       { fontSize:26, fontWeight:400, color:'#1a1a1a', margin:'0 0 12px', lineHeight:1.25, fontFamily:"'DM Serif Display', Georgia, serif" },
  desc:        { fontSize:14, color:'#777', lineHeight:1.7, margin:'0 0 28px' },
  badges:      { display:'flex', justifyContent:'center', alignItems:'center', background:'#fff', borderRadius:16, border:'1px solid #EBEBE7', padding:'16px 0', marginBottom:24 },
  badge:       { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  badgeNum:    { fontSize:22, fontWeight:800, color:'#1a1a1a' },
  badgeLabel:  { fontSize:11, color:'#ABABAB', textTransform:'uppercase', letterSpacing:0.8 },
  sep:         { width:1, height:32, background:'#EBEBE7' },
  btn:         { width:'100%', padding:'17px', borderRadius:16, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 },
  disclaimer:  { fontSize:11, color:'#C4C4BC', lineHeight:1.6 },
};