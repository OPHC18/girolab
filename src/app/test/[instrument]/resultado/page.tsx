// src/app/test/[instrument]/resultado/page.tsx
// Página de resultado con card shareable para redes sociales
// Es la pieza que produce el loop viral: la persona comparte su perfil
// lo que trae nuevos usuarios sin gasto en pauta

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { INSTRUMENTS, type InstrumentId } from '@/lib/assessments/instruments';
import { EMPRESA_INSTRUMENTS, type EmpresaInstrumentId } from '@/lib/assessments/instruments_empresa';

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE CARDS POR INSTRUMENTO
// ─────────────────────────────────────────────────────────────
interface CardConfig {
  headline: (result: any) => string;
  subline:  (result: any) => string;
  badge:    (result: any) => string;
  gradient: string;
  textColor: string;
  accentColor: string;
  shareText: (result: any) => string;
  cta: string;
  showDimensions: boolean;
  dimensionMax: number;
}

const CARD_CONFIGS: Partial<Record<string, CardConfig>> = {
  BDI_II: {
    headline:   r => r.severidadLabel || 'Evaluado',
    subline:    r => `Depresión ${r.severidadLabel?.toLowerCase()} · ${r.puntuacionBruta}/63`,
    badge:      _ => 'BDI-II',
    gradient:   'linear-gradient(135deg, #1a1a2e 0%, #3a3a6e 100%)',
    textColor:  '#fff',
    accentColor:'#818CF8',
    shareText:  r => `Acabo de conocer mi nivel de bienestar emocional con Giro Lab. ¿Cómo estás tú realmente?`,
    cta:        '¿Cómo estás tú realmente?',
    showDimensions: true,
    dimensionMax: 40,
  },
  BAI: {
    headline:   r => `Ansiedad ${r.severidadLabel}`,
    subline:    r => `${r.puntuacionBruta}/63 · Inventario de Beck`,
    badge:      _ => 'BAI',
    gradient:   'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    textColor:  '#fff',
    accentColor:'#FCA5A5',
    shareText:  r => `Medí mi nivel de ansiedad con Giro Lab. Los resultados fueron reveladores. ¿Te animas?`,
    cta:        '¿Cuál es tu nivel de ansiedad?',
    showDimensions: true,
    dimensionMax: 40,
  },
  BIG_FIVE: {
    headline:   r => `Perfil ${getOceanType(r)}`,
    subline:    _ => 'Inventario de los Cinco Grandes · OCEAN',
    badge:      _ => 'OCEAN',
    gradient:   'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
    textColor:  '#fff',
    accentColor:'#7DD3FC',
    shareText:  r => `Mi perfil de personalidad OCEAN: ${getOceanType(r)}. Descúbre el tuyo en Giro Lab 👇`,
    cta:        '¿Cuál es tu perfil de personalidad?',
    showDimensions: true,
    dimensionMax: 5,
  },
  DARK_TRIAD: {
    headline:   r => getDarkTriadLabel(r),
    subline:    _ => 'Dark Triad · Dirty Dozen',
    badge:      _ => 'Dark Triad',
    gradient:   'linear-gradient(135deg, #111 0%, #374151 100%)',
    textColor:  '#fff',
    accentColor:'#D1D5DB',
    shareText:  r => `Descubrí mi lado oscuro con Giro Lab. Mi perfil Dark Triad: ${getDarkTriadLabel(r)}. ¿Y el tuyo?`,
    cta:        '¿Conoces tu lado oscuro?',
    showDimensions: true,
    dimensionMax: 5,
  },
  DISC: {
    headline:   r => `Perfil ${r.perfilCombinado || r.factorDominanteAdaptado}`,
    subline:    _ => 'DISC · Perfil de Comportamiento',
    badge:      _ => 'DISC',
    gradient:   'linear-gradient(135deg, #1e3a5f 0%, #1565C0 100%)',
    textColor:  '#fff',
    accentColor:'#93C5FD',
    shareText:  r => `Mi perfil DISC: ${r.perfilCombinado}. ${r.interpretacion?.split('.')[0]}. ¿Cuál es el tuyo?`,
    cta:        '¿Cuál es tu perfil DISC?',
    showDimensions: false,
    dimensionMax: 100,
  },
  ASRS_v1_1: {
    headline:   r => r.screeningPositivo ? 'Screening Positivo' : 'Screening Negativo',
    subline:    r => `TDAH · ${r.puntuacionBruta}/6 ítems significativos`,
    badge:      _ => 'ASRS',
    gradient:   'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    textColor:  '#fff',
    accentColor:'#6EE7B7',
    shareText:  _ => `Me hice el screening de TDAH con Giro Lab. Más de 1/3 de adultos no lo saben. ¿Y tú?`,
    cta:        '¿Conoces tu perfil de atención?',
    showDimensions: false,
    dimensionMax: 6,
  },
  MDQ: {
    headline:   r => r.screeningPositivo ? 'Screening Positivo' : 'Screening Negativo',
    subline:    _ => 'MDQ · Trastornos del Estado de Ánimo',
    badge:      _ => 'MDQ',
    gradient:   'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    textColor:  '#fff',
    accentColor:'#C4B5FD',
    shareText:  _ => `Completé una evaluación de bienestar emocional en Giro Lab. Tu salud mental importa.`,
    cta:        '¿Cómo está tu estado de ánimo?',
    showDimensions: false,
    dimensionMax: 13,
  },
  PID_5: {
    headline:   r => getDominantDomain(r),
    subline:    _ => 'PID-5 · Perfil DSM-5 de Personalidad',
    badge:      _ => 'PID-5',
    gradient:   'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
    textColor:  '#fff',
    accentColor:'#86EFAC',
    shareText:  r => `Mi perfil de personalidad DSM-5: ${getDominantDomain(r)}. Evaluado con Giro Lab.`,
    cta:        '¿Conoces tu perfil de personalidad?',
    showDimensions: true,
    dimensionMax: 3,
  },
  NPI_40: {
    headline:   r => `Narcisismo ${r.severidadLabel}`,
    subline:    r => `NPI-40 · ${r.puntuacionBruta}/40 puntos`,
    badge:      _ => 'NPI-40',
    gradient:   'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
    textColor:  '#fff',
    accentColor:'#FDE68A',
    shareText:  r => `Mi nivel de narcisismo: ${r.severidadLabel}. Evaluado con el NPI-40 en Giro Lab. ¿Y el tuyo?`,
    cta:        '¿Cuál es tu nivel de narcisismo?',
    showDimensions: true,
    dimensionMax: 8,
  },
  MSI_BPD: {
    headline:   r => r.screeningPositivo ? 'Screening Positivo' : 'Screening Negativo',
    subline:    _ => 'MSI-BPD · Trastorno Límite de Personalidad',
    badge:      _ => 'MSI-BPD',
    gradient:   'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)',
    textColor:  '#fff',
    accentColor:'#67E8F9',
    shareText:  _ => `Me hice un screening de bienestar psicológico en Giro Lab. La salud mental es prioridad.`,
    cta:        '¿Cómo está tu salud mental?',
    showDimensions: false,
    dimensionMax: 10,
  },
  HEXACO_HH: {
    headline:   r => `Integridad ${r.nivelIntegridad}`,
    subline:    r => `HEXACO-HH · ${r.scoreTotal?.toFixed(1)}/5.0`,
    badge:      _ => 'HEXACO',
    gradient:   'linear-gradient(135deg, #052e16 0%, #15803d 100%)',
    textColor:  '#fff',
    accentColor:'#86EFAC',
    shareText:  r => `Evalué mi perfil de integridad laboral con Giro Lab: ${r.nivelIntegridad}. ¿Cómo es el tuyo?`,
    cta:        '¿Cuál es tu perfil de integridad?',
    showDimensions: true,
    dimensionMax: 5,
  },
};

// Helpers para labels dinámicos
function getOceanType(r: any): string {
  if (!r.dimensiones) return 'OCEAN';
  const dims = r.dimensiones as { dimension: string; label: string }[];
  const high = dims.filter(d => d.label === 'Alto').map(d => d.dimension[0]).join('');
  return high || dims.sort((a, b) => (b as any).score - (a as any).score)[0]?.dimension?.slice(0, 1) || 'O';
}
function getDarkTriadLabel(r: any): string {
  if (!r.dimensiones) return 'Equilibrado';
  const dom = r.dimensiones.sort((a: any, b: any) => b.score - a.score)[0];
  return dom?.label === 'Alto' ? `${dom.dimension} elevado` : 'Perfil equilibrado';
}
function getDominantDomain(r: any): string {
  if (!r.dimensiones) return 'Evaluado';
  const dom = r.dimensiones.sort((a: any, b: any) => b.score - a.score)[0];
  return dom?.dimension || 'Evaluado';
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function ResultadoPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const rawId      = params?.instrument as string;
  const instrumentId = rawId?.toUpperCase().replace(/-/g, '_');
  const resultId   = searchParams?.get('r') || '';
  const token      = searchParams?.get('t') || '';

  const [result, setResult]     = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [user, setUser]         = useState<any>(null);
  const [sharing, setSharing]   = useState(false);
  const [shared, setShared]     = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const inst = INSTRUMENTS[instrumentId as InstrumentId] ||
               EMPRESA_INSTRUMENTS[instrumentId as EmpresaInstrumentId];
  const cfg  = CARD_CONFIGS[instrumentId];

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      if (resultId) {
        const { data } = await supabase.from('assessment_results')
          .select('resultado_json, puntuacion_bruta, severidad_label, screening_positivo')
          .eq('id', resultId).single();
        if (data) setResult(data.resultado_json);
      }
      setLoading(false);
    };
    init();
  }, [resultId]);

  const handleShare = async () => {
    if (!cfg || !result) return;
    setSharing(true);
    const text = cfg.shareText(result);
    const url  = `https://app.girolab.net/test/${rawId}`;
    const fullText = `${text}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Giro Lab', text: fullText, url });
        setShared(true);
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(fullText);
      setShared(true);
    }
    setSharing(false);
    setTimeout(() => setShared(false), 3000);
  };

  const handleWhatsApp = () => {
    if (!cfg || !result) return;
    const text = encodeURIComponent(`${cfg.shareText(result)}\n\nhttps://app.girolab.net/test/${rawId}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleRegister = () => {
    localStorage.setItem('girolab_returnUrl', `/dashboard?tab=resultados`);
    router.push(`/onboarding?from=test_result&instrument=${instrumentId}&r=${resultId}`);
  };

  if (loading) return <LoadingScreen />;
  if (!result || !inst || !cfg) return <div style={rs.notFound}>Resultado no encontrado.</div>;

  const headline = cfg.headline(result);
  const subline  = cfg.subline(result);
  const dims     = result.dimensiones as any[] | undefined;

  return (
    <div style={rs.page}>
      {/* ── RESULT CARD (la que se comparte) ── */}
      <div ref={cardRef} style={{ ...rs.card, background: cfg.gradient }}>
        {/* Logo watermark */}
        <div style={rs.watermark}>
          <span style={rs.watermarkText}>Giro Lab</span>
          <span style={{ ...rs.watermarkDot, background: cfg.accentColor }} />
        </div>

        {/* Badge instrumento */}
        <span style={{ ...rs.instBadge, background: `${cfg.accentColor}30`, color: cfg.accentColor }}>
          {cfg.badge(result)}
        </span>

        {/* Resultado principal */}
        <div style={rs.cardCenter}>
          <span style={rs.cardIcon}>{inst.icono}</span>
          <h1 style={{ ...rs.cardHeadline, color: cfg.textColor }}>{headline}</h1>
          <p style={{ ...rs.cardSubline, color: `${cfg.textColor}99` }}>{subline}</p>
        </div>

        {/* Dimensiones (si aplica) */}
        {cfg.showDimensions && dims && dims.length > 0 && (
          <div style={rs.dimsArea}>
            {dims.slice(0, 5).map((dim, i) => {
              const pct = Math.min(((dim.score || 0) / cfg.dimensionMax) * 100, 100);
              return (
                <div key={i} style={rs.dimRow}>
                  <span style={{ ...rs.dimName, color: `${cfg.textColor}cc` }}>
                    {dim.dimension?.length > 14 ? dim.dimension.slice(0,14)+'…' : dim.dimension}
                  </span>
                  <div style={rs.dimTrack}>
                    <div style={{ width:`${pct}%`, height:'100%', background: cfg.accentColor, borderRadius:3, transition:'width 0.8s ease' }} />
                  </div>
                  <span style={{ ...rs.dimScore, color: cfg.accentColor }}>
                    {typeof dim.score === 'number' ? dim.score.toFixed(dim.score < 10 ? 1 : 0) : dim.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* DISC: mostrar percentiles como gráfico de 4 barras */}
        {instrumentId === 'DISC' && result.percentiles?.adaptado && (
          <div style={rs.discBars}>
            {(['D','I','S','C'] as const).map(f => {
              const pct = result.percentiles.adaptado[f] || 0;
              return (
                <div key={f} style={rs.discBarCol}>
                  <div style={rs.discBarTrack}>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:`${pct}%`, background: cfg.accentColor, borderRadius:'4px 4px 0 0' }} />
                  </div>
                  <span style={{ ...rs.discBarLabel, color: `${cfg.textColor}cc` }}>{f}</span>
                  <span style={{ ...rs.discBarPct, color: cfg.accentColor }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA dentro de la card */}
        <p style={{ ...rs.cardCta, color: `${cfg.textColor}80` }}>{cfg.cta}</p>
        <p style={{ ...rs.cardUrl, color: `${cfg.textColor}50` }}>app.girolab.net</p>
      </div>

      {/* ── INTERPRETACIÓN ── */}
      {result.interpretacion && (
        <div style={rs.interpBox}>
          <p style={rs.interpText}>{result.interpretacion}</p>
        </div>
      )}
      {result.nota && (
        <div style={rs.notaBox}>
          <span style={{fontSize:14}}>ℹ️</span>
          <p style={rs.notaText}>{result.nota}</p>
        </div>
      )}
      {result.alertas?.length > 0 && (
        <div style={rs.alertBox}>
          {result.alertas.map((a: string, i: number) => (
            <p key={i} style={rs.alertText}>{a}</p>
          ))}
        </div>
      )}

      {/* ── BOTONES DE COMPARTIR ── */}
      <div style={rs.shareSection}>
        <p style={rs.shareSectionTitle}>Comparte tu resultado</p>
        <div style={rs.shareBtns}>
          <button style={rs.whatsappBtn} onClick={handleWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.107.549 4.09 1.51 5.814L0 24l6.335-1.488A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.017-1.373l-.36-.214-3.733.977.999-3.645-.234-.374A9.817 9.817 0 012.182 12c0-5.415 4.403-9.818 9.818-9.818 5.416 0 9.819 4.403 9.819 9.818 0 5.416-4.403 9.818-9.819 9.818z"/>
            </svg>
            WhatsApp
          </button>
          <button
            style={{ ...rs.shareBtn, background: shared ? '#4CAF5022' : '#1a1a1a', color: shared ? '#4CAF50' : '#fff', border: shared ? '1.5px solid #4CAF50' : 'none' }}
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? '...' : shared ? '✓ ¡Copiado!' : '↑ Compartir'}
          </button>
        </div>
      </div>

      {/* ── CTA REGISTRO ── */}
      <div style={rs.ctaSection}>
        <div style={rs.ctaCard}>
          <span style={rs.ctaIcon}>🌱</span>
          <h2 style={rs.ctaTitle}>¿Quieres trabajar esto con un especialista?</h2>
          <p style={rs.ctaSubtitle}>
            Conecta con un Menter certificado que puede acompañarte en tu proceso.
          </p>
          {user ? (
            <button style={rs.ctaBtn} onClick={() => router.push('/dashboard?tab=directorio')}>
              Ver Menters especializados →
            </button>
          ) : (
            <>
              <button style={rs.ctaBtn} onClick={handleRegister}>
                Crear mi cuenta gratis →
              </button>
              <button style={rs.ctaSecondary} onClick={() => router.push(`/login?returnUrl=/dashboard`)}>
                Ya tengo cuenta — iniciar sesión
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={rs.footer}>
        <p style={rs.footerText}>
          Giro Lab · Marketplace de Bienestar · Lima, Perú
        </p>
        <p style={rs.footerDisclaimer}>
          Este test es una herramienta de autoconocimiento. No constituye diagnóstico clínico.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', background:'#FAFAF8', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:48, height:48, border:'3px solid #eee', borderTopColor:'#1a1a1a', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────
const rs: Record<string, React.CSSProperties> = {
  page:           { minHeight:'100vh', background:'#F5F4F0', display:'flex', flexDirection:'column', alignItems:'center', padding:'0 0 40px', fontFamily:"'DM Sans', system-ui, sans-serif" },
  notFound:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#888' },
  // CARD
  card:           { width:'100%', maxWidth:440, minHeight:480, borderRadius:'0 0 28px 28px', padding:'32px 28px', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' },
  watermark:      { display:'flex', alignItems:'center', gap:6, marginBottom:20 },
  watermarkText:  { fontSize:13, fontWeight:800, color:'rgba(255,255,255,0.5)', letterSpacing:2, textTransform:'uppercase' },
  watermarkDot:   { width:6, height:6, borderRadius:'50%', opacity:0.6 },
  instBadge:      { alignSelf:'flex-start', fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:999, letterSpacing:1.5, textTransform:'uppercase', marginBottom:16 },
  cardCenter:     { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'16px 0' },
  cardIcon:       { fontSize:52, marginBottom:12, display:'block' },
  cardHeadline:   { fontSize:32, fontWeight:800, margin:'0 0 8px', lineHeight:1.1, fontFamily:"'DM Serif Display', Georgia, serif" },
  cardSubline:    { fontSize:14, margin:0, lineHeight:1.5 },
  // DIMS
  dimsArea:       { display:'flex', flexDirection:'column', gap:8, marginTop:16, borderTop:'1px solid rgba(255,255,255,0.15)', paddingTop:16 },
  dimRow:         { display:'flex', alignItems:'center', gap:8 },
  dimName:        { fontSize:11, width:90, flexShrink:0 },
  dimTrack:       { flex:1, height:5, background:'rgba(255,255,255,0.15)', borderRadius:3, overflow:'hidden' },
  dimScore:       { fontSize:11, fontWeight:800, width:28, textAlign:'right' },
  // DISC bars
  discBars:       { display:'flex', gap:10, marginTop:16, borderTop:'1px solid rgba(255,255,255,0.15)', paddingTop:16 },
  discBarCol:     { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  discBarTrack:   { width:'100%', height:60, background:'rgba(255,255,255,0.15)', borderRadius:'4px 4px 0 0', position:'relative' },
  discBarLabel:   { fontSize:14, fontWeight:800 },
  discBarPct:     { fontSize:11, fontWeight:700 },
  // CARD FOOTER
  cardCta:        { fontSize:11, textAlign:'center', marginTop:20, marginBottom:4, fontStyle:'italic' },
  cardUrl:        { fontSize:10, textAlign:'center', margin:0, letterSpacing:1 },
  // INTERPRETACIÓN
  interpBox:      { width:'100%', maxWidth:440, background:'#fff', borderRadius:16, padding:'20px 24px', margin:'16px 0 0', border:'1px solid #eee' },
  interpText:     { fontSize:14, color:'#444', lineHeight:1.7, margin:0 },
  notaBox:        { width:'100%', maxWidth:440, background:'#FFF8E1', borderRadius:12, padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start', margin:'8px 0 0', border:'1px solid #FFE082' },
  notaText:       { fontSize:12, color:'#795548', margin:0, lineHeight:1.5 },
  alertBox:       { width:'100%', maxWidth:440, background:'#FFEBEE', borderRadius:12, padding:'12px 16px', margin:'8px 0 0', border:'1px solid #FFCDD2' },
  alertText:      { fontSize:12, color:'#B71C1C', margin:'2px 0' },
  // SHARE
  shareSection:   { width:'100%', maxWidth:440, padding:'20px 0 0' },
  shareSectionTitle:{ fontSize:12, color:'#aaa', textAlign:'center', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:1 },
  shareBtns:      { display:'flex', gap:10 },
  whatsappBtn:    { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:12, border:'none', background:'#25D366', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' },
  shareBtn:       { flex:1, padding:'14px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s' },
  // CTA
  ctaSection:     { width:'100%', maxWidth:440, marginTop:16 },
  ctaCard:        { background:'#1a1a1a', borderRadius:20, padding:'28px 24px', textAlign:'center' },
  ctaIcon:        { fontSize:36, display:'block', marginBottom:12 },
  ctaTitle:       { fontSize:18, fontWeight:700, color:'#fff', margin:'0 0 8px', fontFamily:"'DM Serif Display', Georgia, serif" },
  ctaSubtitle:    { fontSize:13, color:'rgba(255,255,255,0.6)', margin:'0 0 20px', lineHeight:1.6 },
  ctaBtn:         { width:'100%', padding:'16px', borderRadius:12, background:'#fff', color:'#1a1a1a', border:'none', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:8 },
  ctaSecondary:   { width:'100%', padding:'12px', borderRadius:12, background:'none', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.2)', fontSize:13, cursor:'pointer' },
  // FOOTER
  footer:         { width:'100%', maxWidth:440, marginTop:24, textAlign:'center' },
  footerText:     { fontSize:11, color:'#bbb', margin:'0 0 4px' },
  footerDisclaimer:{ fontSize:10, color:'#ccc', margin:0, lineHeight:1.5 },
};