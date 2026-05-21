// src/components/assessments/TestStepper.tsx
// Stepper de tests con el mismo look & feel del onboarding de Giro Lab
// ─ Una pregunta por pantalla
// ─ Auto-avance 1.8s tras seleccionar (o Siguiente manual)
// ─ Barra de progreso animada arriba
// ─ Botón ← Atrás
// ─ Logo Giro Lab visible
// ─ Animación slide-in por pregunta
// ─ Soporta: Likert, Binario, Frecuencia, NPI elección forzada, DISC, MDQ multi-parte

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
export interface StepperOption {
  valor: number;
  etiqueta: string;
  emoji?: string;
}

export interface StepperItem {
  numero: number;
  texto: string;
  instruccion?: string;
  tipo?: 'likert' | 'binario' | 'frecuencia' | 'npi_par' | 'mdq_b' | 'mdq_c';
  // NPI: par de opciones A/B
  parA?: string;
  parB?: string;
}

export interface StepperConfig {
  instrumentId: string;
  nombre: string;
  icono: string;
  color: string;       // color primario del instrumento
  opciones: StepperOption[];
  autoAvanceMs?: number; // default 1800ms
}

interface Props {
  config: StepperConfig;
  items: StepperItem[];
  onComplete: (responses: Record<number, number>) => void;
  onBack?: () => void; // volver a la pantalla intro
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function TestStepper({ config, items, onComplete, onBack }: Props) {
  const [itemIndex, setItemIndex]     = useState(0);
  const [responses, setResponses]     = useState<Record<number, number>>({});
  const [selected, setSelected]       = useState<number | null>(null);
  const [animDir, setAnimDir]         = useState<'in' | 'out'>('in');
  const [npiChoice, setNpiChoice]     = useState<'A' | 'B' | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentItem   = items[itemIndex];
  const totalItems    = items.length;
  const progress      = Math.round(((itemIndex) / totalItems) * 100);
  const isLast        = itemIndex === totalItems - 1;
  const autoAvance    = config.autoAvanceMs ?? 1800;
  const isNPI         = currentItem?.tipo === 'npi_par';
  const isMDQ_C       = currentItem?.tipo === 'mdq_c';

  // Limpiar selección al cambiar de ítem
  useEffect(() => {
    setSelected(null);
    setNpiChoice(null);
    setAnimDir('in');
  }, [itemIndex]);

  // Auto-avance
  const advance = useCallback((valor: number) => {
    const itemNum = currentItem.numero;
    const newResp = { ...responses, [itemNum]: valor };
    setResponses(newResp);

    if (isLast) {
      setTimeout(() => onComplete(newResp), autoAvance * 0.6);
      return;
    }

    setAnimDir('out');
    autoTimer.current = setTimeout(() => {
      setItemIndex(i => i + 1);
    }, 320);
  }, [currentItem, responses, isLast, autoAvance, onComplete]);

  const handleSelect = useCallback((valor: number) => {
    if (selected !== null) return; // evita doble clic
    setSelected(valor);
  }, [selected]);

  const handleNext = () => {
    if (selected === null && npiChoice === null) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    const valor = npiChoice === 'A' ? 1 : npiChoice === 'B' ? 0 : selected!;
    advance(valor);
  };

  const handleBack = () => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (itemIndex === 0) { onBack?.(); return; }
    setAnimDir('out');
    setTimeout(() => setItemIndex(i => i - 1), 200);
  };

  // NPI: elegir A o B
  const handleNPI = (choice: 'A' | 'B') => {
    if (npiChoice !== null) return;
    setNpiChoice(choice);
  };

  // MDQ-C: escala 0-3 especial
  const mdqCOpciones: StepperOption[] = [
    { valor: 0, etiqueta: 'Sin problema' },
    { valor: 1, etiqueta: 'Problema menor' },
    { valor: 2, etiqueta: 'Problema moderado' },
    { valor: 3, etiqueta: 'Problema grave' },
  ];

  const opciones = isMDQ_C ? mdqCOpciones : config.opciones;

  // Detectar formato BDI: instruccion con "0 = ... · 1 = ..."
  const isBDI = !!currentItem?.instruccion && /^0\s*=/.test(currentItem.instruccion);
  const bdiOpciones: StepperOption[] = isBDI
    ? currentItem.instruccion!.split('·').map(part => {
        const [valStr, ...rest] = part.trim().split('=')
        return { valor: parseInt(valStr.trim()), etiqueta: rest.join('=').trim() }
      })
    : [];

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.logoWrap}>
          <DotLottieReact src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie" autoplay loop style={{ width: 40, height: 40 }} />
        </div>

        <span style={s.counterText}>{itemIndex + 1}<span style={s.counterOf}>/{totalItems}</span></span>
      </header>

      {/* ── BARRA DE PROGRESO ── */}
      <div style={s.progressTrack}>
        <div
          style={{
            ...s.progressFill,
            width: `${progress}%`,
            background: config.color,
          }}
        />
      </div>

      {/* ── PREGUNTA ── */}
      <main style={s.main}>
        <div
          key={itemIndex}
          style={{
            ...s.questionWrap,
            animation: animDir === 'in'
              ? 'slideIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards'
              : 'slideOut 0.22s ease-in forwards',
          }}
        >
          {/* Ícono del instrumento — solo en primera pregunta, si existe */}
          {itemIndex === 0 && config.icono && (
            <div style={s.instIconWrap}>
              <span style={s.instIcon}>{config.icono}</span>
            </div>
          )}

          {isBDI ? (
            /* ── BDI: afirmaciones específicas como opciones ── */
            <>
              <h2 style={{ ...s.questionText, fontSize: 15, fontWeight: 500, color: '#555', marginBottom: 20 }}>
                Elige la afirmación que mejor te describe en las últimas dos semanas:
              </h2>
              <div style={s.optionsList}>
                {bdiOpciones.map((op, i) => {
                  const isSelected = selected === op.valor
                  return (
                    <button key={op.valor} style={{ ...s.optionBtn, borderColor: isSelected ? config.color : '#E8E8E4', background: isSelected ? `${config.color}0F` : '#FAFAF8', transform: isSelected ? 'translateX(6px)' : 'translateX(0)', animationDelay: `${i * 60}ms` }} onClick={() => handleSelect(op.valor)}>
                      <span style={{ ...s.optionBullet, background: isSelected ? config.color : 'transparent', borderColor: isSelected ? config.color : '#C4C4BC' }}>
                        {isSelected && <span style={s.bulletCheck}>✓</span>}
                      </span>
                      <span style={{ ...s.optionLabel, color: isSelected ? '#1a1a1a' : '#444', fontWeight: isSelected ? 600 : 400 }}>
                        {op.etiqueta}
                      </span>
                      {isSelected && <div style={{ ...s.optionRipple, background: config.color }} />}
                    </button>
                  )
                })}
              </div>
            </>
          ) : isNPI ? (
            /* ── NPI: par A/B ── */
            <>
              {currentItem.instruccion && <p style={s.instruccion}>{currentItem.instruccion}</p>}
              <h2 style={s.questionText}>{currentItem.texto}</h2>
              <div style={s.npiGrid}>
                {(['A', 'B'] as const).map(letter => {
                  const texto = letter === 'A' ? currentItem.parA! : currentItem.parB!;
                  const isChosen = npiChoice === letter;
                  return (
                    <button key={letter} style={{ ...s.npiCard, borderColor: isChosen ? config.color : '#E8E8E4', background: isChosen ? `${config.color}0F` : '#FAFAF8', transform: isChosen ? 'scale(1.02)' : 'scale(1)' }} onClick={() => handleNPI(letter)}>
                      <span style={{ ...s.npiLetter, color: isChosen ? config.color : '#C4C4BC' }}>{letter}</span>
                      <p style={{ ...s.npiText, color: isChosen ? '#1a1a1a' : '#555' }}>{texto}</p>
                      {isChosen && <span style={{ ...s.checkMark, color: config.color }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* ── OPCIONES ESTÁNDAR ── */
            <>
              {currentItem.instruccion && <p style={s.instruccion}>{currentItem.instruccion}</p>}
              <h2 style={s.questionText}>{currentItem.texto}</h2>
              <div style={s.optionsList}>
                {opciones.map((op, i) => {
                  const isSelected = selected === op.valor;
                  return (
                    <button key={op.valor} style={{ ...s.optionBtn, borderColor: isSelected ? config.color : '#E8E8E4', background: isSelected ? `${config.color}0F` : '#FAFAF8', transform: isSelected ? 'translateX(6px)' : 'translateX(0)', animationDelay: `${i * 60}ms` }} onClick={() => handleSelect(op.valor)}>
                      <span style={{ ...s.optionBullet, background: isSelected ? config.color : 'transparent', borderColor: isSelected ? config.color : '#C4C4BC' }}>
                        {isSelected && <span style={s.bulletCheck}>✓</span>}
                      </span>
                      {op.emoji && <span style={s.optionEmoji}>{op.emoji}</span>}
                      <span style={{ ...s.optionLabel, color: isSelected ? '#1a1a1a' : '#444', fontWeight: isSelected ? 600 : 400 }}>
                        {op.etiqueta}
                      </span>
                      {isSelected && <div style={{ ...s.optionRipple, background: config.color }} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── FOOTER: botones Regresar + Siguiente ── */}
      <footer style={s.footer}>
        {/* Dots de progreso (solo para tests cortos ≤15 ítems) */}
        {totalItems <= 15 && (
          <div style={s.dots}>
            {items.map((_, i) => (
              <div
                key={i}
                style={{
                  ...s.dot,
                  background: i < itemIndex
                    ? config.color
                    : i === itemIndex
                    ? config.color
                    : '#E0E0DA',
                  width:  i === itemIndex ? 20 : 6,
                  opacity: i < itemIndex ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        )}

        <div style={s.btnRow}>
          <button style={s.backBtnFooter} onClick={handleBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Regresar
          </button>

          <button
            style={{
              ...s.nextBtn,
              background: (selected !== null || npiChoice !== null) ? config.color : '#E0E0DA',
              cursor:     (selected !== null || npiChoice !== null) ? 'pointer' : 'default',
            }}
            disabled={selected === null && npiChoice === null}
            onClick={handleNext}
          >
            {isLast ? 'Ver resultado' : 'Siguiente'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <p style={s.footerHint}>
          {selected !== null || npiChoice !== null
            ? 'Presiona Siguiente para continuar'
            : 'Selecciona una opción para continuar'}
        </p>
      </footer>

      {/* ── CSS ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-30px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ripple {
          from { transform: scale(0); opacity: 0.3; }
          to   { transform: scale(3); opacity: 0; }
        }
        @keyframes dotExpand {
          from { width: 6px; }
          to   { width: 20px; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    background: '#FAFAF8',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    overflowX: 'hidden',
  },

  // HEADER
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px 10px',
    position: 'sticky',
    top: 0,
    background: 'rgba(250,250,248,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 20,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  counterText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
    minWidth: 38,
    textAlign: 'right',
  },
  counterOf: {
    fontWeight: 400,
    color: '#ABABAB',
    fontSize: 13,
  },

  // PROGRESS BAR
  progressTrack: {
    height: 3,
    background: '#EBEBE7',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  },

  // MAIN
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '16px 20px 12px',
    overflowY: 'auto',
  },
  questionWrap: {
    width: '100%',
    maxWidth: 520,
  },

  // ICONO INSTRUMENTO
  instIconWrap: {
    marginBottom: 12,
  },
  instIcon: {
    fontSize: 30,
    display: 'block',
    animation: 'fadeUp 0.4s ease forwards',
  },

  // INSTRUCCIÓN
  instruccion: {
    fontSize: 13,
    color: '#555',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    margin: '0 0 10px',
  },

  // PREGUNTA
  questionText: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1a1a1a',
    lineHeight: 1.4,
    margin: '0 0 16px',
    fontFamily: "'Raleway', sans-serif",
  },

  // OPCIONES ESTÁNDAR
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 16px',
    borderRadius: 16,
    border: '1.5px solid',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeUp 0.35s ease forwards',
    opacity: 1,
  },
  optionBullet: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '2px solid',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  bulletCheck: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 700,
    lineHeight: 1,
  },
  optionEmoji: {
    fontSize: 20,
    flexShrink: 0,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 1.4,
    transition: 'color 0.15s, font-weight 0.15s',
  },
  optionRipple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: '50%',
    top: '50%',
    left: 18,
    transform: 'translateY(-50%)',
    animation: 'ripple 0.5s ease-out forwards',
    pointerEvents: 'none',
    opacity: 0,
  },

  // NPI PAR A/B
  npiGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  npiCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '18px 20px',
    borderRadius: 18,
    border: '2px solid',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
    position: 'relative',
  },
  npiLetter: {
    fontSize: 18,
    fontWeight: 800,
    flexShrink: 0,
    fontFamily: "'Raleway', sans-serif",
    lineHeight: 1,
    marginTop: 2,
  },
  npiText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 1.5,
    transition: 'color 0.15s',
  },
  checkMark: {
    fontSize: 16,
    fontWeight: 800,
    flexShrink: 0,
  },

  // FOOTER
  footer: {
    padding: '16px 20px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(250,250,248,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid #EBEBE7',
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    height: 6,
  },
  dot: {
    height: 6,
    borderRadius: 99,
    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  btnRow: {
    display: 'flex',
    gap: 10,
    width: '100%',
    maxWidth: 400,
  },
  backBtnFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 18px',
    borderRadius: 16,
    border: '1.5px solid #E0E0DA',
    background: '#fff',
    color: '#555',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: 'background 0.2s ease',
  },
  nextBtn: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: 16,
    border: 'none',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'background 0.25s ease, transform 0.15s ease',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  footerHint: {
    fontSize: 13,
    color: '#555',
    margin: 0,
    fontWeight: 500,
    transition: 'opacity 0.2s',
  },
};