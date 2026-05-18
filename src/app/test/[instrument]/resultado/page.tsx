// src/app/test/[instrument]/resultado/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { INSTRUMENTS, type InstrumentId } from '@/lib/assessments/instruments';
import { EMPRESA_INSTRUMENTS, type EmpresaInstrumentId } from '@/lib/assessments/instruments_empresa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const CHART_PALETTE = [
  '#5C6BC0','#42A5F5','#66BB6A','#FFA726','#EC407A',
  '#26C6DA','#AB47BC','#FF7043','#8D6E63','#78909C'
];
const DISC_COLORS: Record<string, string> = { D: '#E53935', I: '#FB8C00', S: '#43A047', C: '#1E88E5' };

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
    shareText:  r => `Mi perfil de personalidad OCEAN: ${getOceanType(r)}. Descúbre el tuyo en Giro Lab`,
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
  BARON_ICE: {
    headline:   r => `CE ${r.ceTotal ?? r.puntuacionBruta ?? '—'} · ${r.semaforoCE?.label ?? r.severidadLabel ?? ''}`,
    subline:    _ => 'BarOn ICE · Inteligencia Emocional',
    badge:      _ => 'BarOn ICE',
    gradient:   'linear-gradient(135deg, #3b0764 0%, #7C3AED 100%)',
    textColor:  '#fff',
    accentColor:'#DDD6FE',
    shareText:  r => `Evalué mi inteligencia emocional con el BarOn ICE en Giro Lab. CE Total: ${r.ceTotal}. ¿Cuál es el tuyo?`,
    cta:        '¿Cuál es tu cociente emocional?',
    showDimensions: true,
    dimensionMax: 145,
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
// INTERPRETACIONES RICAS POR INSTRUMENTO
// ─────────────────────────────────────────────────────────────
interface RichContent {
  fortalezas: string[];
  desarrollo: string[];
  recomendaciones: string[];
  notaClinica?: string;
}

function generarInterpretacion(instrumentId: string, result: any): RichContent | null {
  const dim = (nombre: string) =>
    (result.dimensiones || []).find((d: any) =>
      d.dimension?.toLowerCase().includes(nombre.toLowerCase())
    );
  const score = (nombre: string) => dim(nombre)?.score ?? 0;
  const label = (nombre: string) => dim(nombre)?.label ?? '';

  switch (instrumentId) {

    case 'BIG_FIVE': {
      const E = score('Extravers'); const lE = label('Extravers');
      const A = score('Amabilid'); const lA = label('Amabilid');
      const R = score('Responsab'); const lR = label('Responsab');
      const N = score('Neuroticis'); const lN = label('Neuroticis');
      const O = score('Apertura'); const lO = label('Apertura');
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (lE === 'Alto') fortalezas.push(`Alta Extraversión (${E.toFixed(1)}/5): eres sociable, enérgico y tiendes a buscar estímulo en el entorno social. Esto se traduce en facilidad para construir redes, liderar grupos y comunicar ideas con naturalidad.`);
      if (lA === 'Alto') fortalezas.push(`Alta Amabilidad (${A.toFixed(1)}/5): muestras empatía genuina, disposición para cooperar y orientación al bienestar de los demás. Esto fortalece relaciones interpersonales duraderas y genera confianza rápida.`);
      if (lR === 'Alto') fortalezas.push(`Alta Responsabilidad (${R.toFixed(1)}/5): tu perfil indica disciplina, planificación y orientación al logro. Las personas con este nivel tienden a cumplir compromisos, gestionar bien el tiempo y sostener proyectos exigentes.`);
      if (lO === 'Alto') fortalezas.push(`Alta Apertura (${O.toFixed(1)}/5): eres intelectualmente curioso, creativo y abierto a nuevas perspectivas. Esto es un activo en entornos cambiantes y en procesos de aprendizaje continuo.`);
      if (lN === 'Bajo') fortalezas.push(`Bajo Neuroticismo (${N.toFixed(1)}/5): tu estabilidad emocional está por encima del promedio. Manejas el estrés con mayor ecuanimidad y es menos probable que reacciones de forma desproporcionada ante adversidades.`);

      if (lN === 'Alto') desarrollo.push(`Neuroticismo elevado (${N.toFixed(1)}/5): presentas mayor sensibilidad al estrés, la crítica y situaciones de incertidumbre. Esto puede impactar tu toma de decisiones bajo presión y generar desgaste emocional acumulado si no se gestiona activamente.`);
      if (lE === 'Bajo') desarrollo.push(`Extraversión baja (${E.toFixed(1)}/5): los entornos sociales intensos o los roles de alta exposición pública pueden generarte mayor fatiga. Esto no es un déficit, pero sí requiere gestión consciente en contextos colaborativos frecuentes.`);
      if (lA === 'Bajo') desarrollo.push(`Amabilidad baja (${A.toFixed(1)}/5): puedes mostrarte más escéptico, directo o competitivo en relaciones. Si bien esto es funcional en negociación, puede generar roces interpersonales si no se calibra con empatía estratégica.`);
      if (lR === 'Bajo') desarrollo.push(`Responsabilidad baja (${R.toFixed(1)}/5): la dificultad para mantener rutinas, cumplir plazos o organizar tareas complejas puede ser un freno real en tu desempeño. Es el factor OCEAN con mayor impacto comprobado en productividad a largo plazo.`);

      if (lN === 'Alto') recomendaciones.push('Incorpora práctica regular de mindfulness o técnicas de regulación emocional (respiración, journaling). La terapia cognitivo-conductual es especialmente efectiva para reducir el neuroticismo funcional.');
      if (lR === 'Bajo') recomendaciones.push('Diseña sistemas externos de accountability: un compañero de metas, bloques de tiempo fijos en tu calendario, o apps de seguimiento de hábitos. La estructura reduce la dependencia de motivación interna.');
      if (lA === 'Bajo') recomendaciones.push('Practica escucha activa deliberada: en conversaciones, enfócate en comprender antes de responder. La empatía es una habilidad entrenable y mejora significativamente la calidad de tus relaciones.');
      if (lO === 'Alto' && lR === 'Bajo') recomendaciones.push('Tu combinación de alta creatividad y baja estructura es frecuente en perfiles innovadores, pero puede llevar a proyectos inconclusos. Trabaja con un Menter para canalizar tu creatividad hacia resultados concretos.');
      recomendaciones.push('Este perfil es un punto de partida, no un destino. Los rasgos de personalidad son relativamente estables pero responden al trabajo personal sostenido. Un Menter especializado puede ayudarte a convertir tu perfil OCEAN en un plan de desarrollo real.');

      return { fortalezas, desarrollo, recomendaciones };
    }

    case 'DISC': {
      const perfil = result.perfilCombinado || result.factorDominanteAdaptado || 'D';
      const pcts = result.percentiles?.adaptado || {};
      const D = pcts.D || 0; const I = pcts.I || 0;
      const S = pcts.S || 0; const C = pcts.C || 0;
      const dominant = ([['D',D],['I',I],['S',S],['C',C]] as [string,number][]).sort((a,b)=>b[1]-a[1])[0][0];
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (D >= 60) fortalezas.push(`Dominance alto (${D}%): orientado a resultados, toma decisiones rápido y acepta retos con confianza. Destacas en situaciones donde se necesita dirección y acción inmediata. Los perfiles D son frecuentes en liderazgo ejecutivo y emprendimiento.`);
      if (I >= 60) fortalezas.push(`Influence alto (${I}%): generas entusiasmo, conectas con facilidad y movilizas a los demás. Eres persuasivo de forma natural y tu energía impacta positivamente el clima de equipo.`);
      if (S >= 60) fortalezas.push(`Steadiness alto (${S}%): aportas estabilidad, consistencia y lealtad. Eres el tipo de perfil que sostiene al equipo en momentos de turbulencia y genera confianza por tu predictibilidad y paciencia.`);
      if (C >= 60) fortalezas.push(`Conscientiousness alto (${C}%): eres analítico, preciso y orientado a la calidad. Evalúas riesgos antes de actuar y produces trabajo de alta exactitud. Clave en roles que requieren rigor técnico o planificación detallada.`);

      if (D >= 70) desarrollo.push(`Con Dominance muy alto (${D}%), el riesgo es volverse impaciente, autoritario o poco receptivo al input ajeno. La velocidad para decidir puede convertirse en impulsividad si no se equilibra con escucha activa.`);
      if (I >= 70) desarrollo.push(`Influence muy alto (${I}%): la orientación social puede dificultar el seguimiento de detalles, la constancia en tareas rutinarias y la objetividad bajo presión emocional. El entusiasmo no siempre se traduce en ejecución.`);
      if (S >= 70) desarrollo.push(`Steadiness muy alto (${S}%): el confort con la estabilidad puede frenar la adaptación al cambio. Tiendes a evitar conflictos y a postponer decisiones difíciles, lo que en entornos dinámicos puede convertirse en un cuello de botella.`);
      if (C >= 70) desarrollo.push(`Conscientiousness muy alto (${C}%): el perfeccionismo puede paralizar. La búsqueda de datos completos antes de actuar es valiosa, pero puede generar lentitud o rigidez en entornos donde la agilidad es crítica.`);
      if (D < 30) desarrollo.push('Dominance bajo: si bien reduces el riesgo de conflictos, puede que te cueste imponer criterios, defender ideas propias o asumir el liderazgo cuando el contexto lo requiere. Desarrollar asertividad es clave.');
      if (I < 30) desarrollo.push('Influence bajo: la comunicación interpersonal y la construcción de redes puede requerir esfuerzo consciente. En roles colaborativos o de ventas, esto puede limitar tu alcance si no se trabaja.');

      recomendaciones.push(`Tu perfil ${perfil} indica que trabajas mejor cuando ${dominant === 'D' ? 'tienes autonomía y metas claras' : dominant === 'I' ? 'hay variedad, contacto social y reconocimiento' : dominant === 'S' ? 'el entorno es predecible y colaborativo' : 'dispones de tiempo para analizar y los estándares son claros'}. Diseña tus proyectos y tu entorno laboral en torno a esto.`);
      recomendaciones.push('El DISC no mide capacidad ni inteligencia — mide estilo. Conocer el estilo de los demás te permite adaptar tu comunicación y reducir fricciones innecesarias. Comparte este resultado con tu equipo o pareja si es relevante.');
      recomendaciones.push('Trabaja con un Menter especializado en desarrollo de liderazgo o coaching organizacional para explorar cómo tu perfil DISC impacta tus relaciones laborales, tu estilo de toma de decisiones y tu gestión del estrés.');

      return { fortalezas, desarrollo, recomendaciones };
    }

    case 'BDI_II': {
      const pb = result.puntuacionBruta ?? 0;
      const sev = result.severidadLabel || '';
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (pb <= 13) {
        fortalezas.push('Tu puntuación indica un estado de ánimo dentro del rango esperado para la población general. No se detectan síntomas depresivos clínicamente significativos en este momento.');
        fortalezas.push('Esta es una buena oportunidad para consolidar hábitos de bienestar preventivos: sueño regular, actividad física, conexión social y gestión del estrés.');
        desarrollo.push('Incluso con puntuaciones bajas, algunos ítems pueden señalar áreas de atención: fatiga, irritabilidad o pérdida de energía que, si se sostienen, merecen seguimiento.');
        recomendaciones.push('Repite este test cada 3-4 meses como parte de un monitoreo de bienestar emocional. Los cambios en el puntaje pueden ser señales tempranas antes de que un problema se establezca.');
      } else if (pb <= 19) {
        fortalezas.push('Identificar que existen síntomas depresivos leves es el primer paso. Muchas personas con este perfil responden muy bien a intervenciones tempranas sin necesidad de tratamiento intensivo.');
        desarrollo.push(`Depresión ${sev} (${pb}/63): síntomas como tristeza persistente, falta de energía, dificultad para disfrutar actividades o pensamiento negativo recurrente pueden estar presentes. Si llevan más de 2 semanas, es importante darles atención.`);
        desarrollo.push('El riesgo de no actuar: los síntomas leves tienden a escalar si no se interviene. La depresión leve no tratada puede convertirse en moderada o severa en semanas o meses.');
        recomendaciones.push('La actividad física aeróbica (30 min, 3-4 veces/semana) tiene evidencia equivalente a antidepresivos para depresión leve. Es una primera línea de acción concreta y accesible.');
        recomendaciones.push('Considera iniciar sesiones con un Menter o psicólogo. A este nivel de severidad, la psicoterapia (especialmente CBT) tiene tasas de éxito muy altas. No esperes a que empeore.');
      } else if (pb <= 28) {
        desarrollo.push(`Depresión Moderada (${pb}/63): a este nivel los síntomas impactan de forma notable la vida diaria — trabajo, relaciones, sueño y funcionamiento general. Esto no es debilidad: es un estado clínico tratable.`);
        desarrollo.push('Los síntomas cognitivos (autocrítica intensa, dificultad para concentrarse, visión negativa del futuro) son característicos de este rango y pueden sesgar tu percepción de la realidad.');
        recomendaciones.push('Se recomienda evaluación profesional pronto. Un psicólogo o psiquiatra puede determinar si se necesita psicoterapia, medicación o ambas. No postergues: el tratamiento temprano acorta significativamente la duración del episodio.');
        recomendaciones.push('Informa a alguien de confianza sobre cómo te sientes. El aislamiento amplifica los síntomas depresivos. La conexión social, aunque cueste iniciativa, es parte del tratamiento.');
      } else {
        desarrollo.push(`Depresión Severa (${pb}/63): tus síntomas se ubican en el rango que requiere atención profesional urgente. A este nivel, el funcionamiento cotidiano suele verse seriamente comprometido.`);
        desarrollo.push('La depresión severa puede incluir pensamientos de inutilidad intensa, desesperanza profunda o, en algunos casos, ideación suicida. Si experimentas esto, es importante que lo comuniques a alguien de confianza o busques ayuda inmediata.');
        recomendaciones.push('Busca evaluación psiquiátrica esta semana. No es necesario esperar a estar "listo" — la consulta en sí ya es un paso terapéutico. La depresión severa es altamente tratable con la combinación adecuada de apoyo profesional.');
        recomendaciones.push('Línea de apoyo emocional en Perú: 113 (opción 5). En otros países, busca la línea de crisis de salud mental de tu región. Este test no reemplaza una evaluación clínica.');
      }
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'Este instrumento es una herramienta de screening, no un diagnóstico. Solo un profesional de salud mental puede diagnosticar depresión.' };
    }

    case 'BAI': {
      const pb = result.puntuacionBruta ?? 0;
      const sev = result.severidadLabel || '';
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (pb <= 7) {
        fortalezas.push('No se detectan síntomas de ansiedad clínicamente significativos. Tu sistema nervioso responde de forma proporcional a los estímulos del entorno en este momento.');
        fortalezas.push('Mantener este estado requiere atención proactiva: el estrés acumulado, la falta de sueño y los cambios vitales son los principales precursores de ansiedad futura.');
        recomendaciones.push('Monitorea tu estado cada 3-4 meses. La ansiedad es el trastorno mental más común y puede desarrollarse gradualmente. La detección temprana facilita mucho la intervención.');
      } else if (pb <= 15) {
        fortalezas.push('Detectar ansiedad leve a tiempo es una ventaja. En este rango, las estrategias de autorregulación son altamente efectivas y pueden revertir el patrón sin intervención clínica intensiva.');
        desarrollo.push(`Ansiedad ${sev} (${pb}/63): síntomas físicos como tensión muscular, inquietud o palpitaciones, y/o síntomas cognitivos como preocupación excesiva o dificultad para relajarse, son señales que merecen atención.`);
        recomendaciones.push('La respiración diafragmática (4-7-8) practicada diariamente reduce la activación del sistema nervioso simpático en pocas semanas. Es simple, gratuita y con evidencia robusta.');
        recomendaciones.push('Reduce los estimulantes (cafeína, pantallas antes de dormir) y establece una rutina de sueño consistente. El sueño deficiente multiplica la percepción de amenaza del cerebro ansioso.');
      } else if (pb <= 25) {
        desarrollo.push(`Ansiedad Moderada (${pb}/63): a este nivel los síntomas son persistentes e impactan la calidad de vida. Puede haber evitación de situaciones, hipervigilancia, síntomas físicos frecuentes o pensamientos intrusivos.`);
        desarrollo.push('La ansiedad moderada no tratada tiende a cronificarse y a expandirse a nuevos dominios de vida. El costo de no actuar supera ampliamente el costo de buscar ayuda.');
        recomendaciones.push('La Terapia Cognitivo-Conductual (CBT) es el tratamiento de primera línea para la ansiedad, con evidencia comparable o superior a la medicación. Busca un psicólogo especializado.');
        recomendaciones.push('Identifica tus detonadores: lleva un registro durante una semana de cuándo aparece la ansiedad, qué la precede y qué la alivia. Este mapeo es el primer paso del tratamiento.');
      } else {
        desarrollo.push(`Ansiedad Severa (${pb}/63): en este rango los síntomas son intensos y probablemente están afectando de forma significativa tu trabajo, relaciones y bienestar general.`);
        recomendaciones.push('Busca evaluación profesional pronto. La combinación de psicoterapia y, si es indicado, medicación ansiolítica tiene tasas de remisión muy altas en ansiedad severa.');
        recomendaciones.push('No te aísles. Compartir lo que vives con alguien de confianza reduce la carga y abre la puerta a que otros puedan acompañarte en la búsqueda de ayuda.');
      }
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'El BAI es una herramienta de screening, no diagnóstico clínico. Consulta con un profesional de salud mental.' };
    }

    case 'ASRS_v1_1': {
      const pos = result.screeningPositivo;
      const pb = result.puntuacionBruta ?? 0;
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (!pos) {
        fortalezas.push(`Tu screening es negativo (${pb}/6 ítems significativos en Parte A). No se detectan patrones de inatención o hiperactividad/impulsividad que superen el umbral clínico de este instrumento.`);
        fortalezas.push('Esto no descarta dificultades de atención o concentración — simplemente indica que no alcanzan el umbral de screening para TDAH adulto con este instrumento.');
        recomendaciones.push('Si a pesar del resultado negativo experimentas dificultades persistentes de concentración, considera que pueden tener otra causa: ansiedad, sueño deficiente, sobreestimulación digital o estrés crónico.');
      } else {
        desarrollo.push(`Screening positivo (${pb}/6 ítems). Esto no es un diagnóstico de TDAH — es una señal de que los síntomas reportados superan el umbral y merecen evaluación clínica especializada.`);
        desarrollo.push('El TDAH adulto frecuentemente se manifiesta más como inatención que como hiperactividad visible: dificultad para sostener atención en tareas largas, procrastinación crónica, olvidos frecuentes, cambio constante de actividades.');
        desarrollo.push('Si el TDAH no se diagnostica ni trata, el impacto acumulado en productividad, relaciones y autoestima puede ser considerable — muchos adultos con TDAH llegan a la adultez con baja autoestima por años de "falla" sin explicación.');
        recomendaciones.push('Busca evaluación con un psicólogo o psiquiatra especializado en TDAH adulto. El diagnóstico requiere entrevista clínica, historia evolutiva y, a menudo, pruebas neuropsicológicas complementarias.');
        recomendaciones.push('Mientras tanto: reduce la multitarea, trabaja en bloques de tiempo (técnica Pomodoro), minimiza distracciones en tu entorno y documenta tus síntomas para la consulta.');
        recomendaciones.push('El TDAH tiene tratamientos muy efectivos: terapia cognitivo-conductual adaptada, coaching de TDAH, y en muchos casos medicación que transforma significativamente la calidad de vida.');
      }
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'El ASRS v1.1 es un instrumento de screening validado por la OMS. No constituye diagnóstico clínico.' };
    }

    case 'MDQ': {
      const pos = result.screeningPositivo;
      const sumA = (result.dimensiones?.find((d: any) => d.dimension?.includes('Parte A'))?.score) ?? 0;
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (!pos) {
        fortalezas.push('Tu screening es negativo para Trastorno Bipolar según el MDQ. No se cumplen los criterios combinados de síntomas, simultaneidad e impacto funcional que definen un resultado positivo.');
        fortalezas.push('Esto es tranquilizador, aunque no descarta fluctuaciones en el estado de ánimo que puedan tener otras causas (estrés, ciclos de sueño, etc.).');
        if (sumA >= 5) desarrollo.push(`Reportaste ${sumA}/13 síntomas en la Parte A — por debajo del umbral diagnóstico, pero suficiente para prestar atención a tus patrones de energía, sueño y estado de ánimo.`);
        recomendaciones.push('Lleva un registro semanal breve de tu energía, sueño y estado de ánimo. Este hábito tiene valor preventivo y facilita mucho cualquier consulta futura con un profesional.');
      } else {
        desarrollo.push(`Screening positivo: cumples los 3 criterios MDQ (${sumA}+ síntomas en Parte A, simultaneidad e impacto funcional significativo). Esto no confirma un diagnóstico de Trastorno Bipolar, pero sí justifica urgentemente una evaluación psiquiátrica.`);
        desarrollo.push('El Trastorno Bipolar es frecuentemente subdiagnosticado o diagnosticado tarde (en promedio, 8-10 años después de los primeros síntomas). Este resultado puede ser el inicio de un camino de mayor comprensión de tu experiencia.');
        desarrollo.push('Los períodos de alta energía, euforia, reducción de la necesidad de sueño, grandiosidad o impulsividad que luego alternan con períodos de baja energía o tristeza son patrones clave a explorar con un especialista.');
        recomendaciones.push('Busca evaluación psiquiátrica. El MDQ tiene especificidad alta, por lo que un resultado positivo amerita atención profesional. El Trastorno Bipolar tiene tratamientos efectivos que mejoran significativamente la calidad de vida.');
        recomendaciones.push('No automediques ni tomes decisiones mayores (económicas, relacionales, laborales) en momentos de euforia o baja anímica sin consultar antes con alguien de confianza.');
        recomendaciones.push('Registra tus ciclos: hay apps de estado de ánimo (como eMoods) diseñadas para este fin. Esta información es valiosa para cualquier evaluación clínica.');
      }
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'El MDQ es una herramienta de screening desarrollada por Hirschfeld et al. (2000). No diagnostica Trastorno Bipolar. Solo un psiquiatra puede realizar ese diagnóstico.' };
    }

    case 'NPI_40': {
      const pb = result.puntuacionBruta ?? 0;
      const sev = result.severidadLabel || '';
      const subs = result.dimensiones || [];
      const topSub = [...subs].sort((a: any, b: any) => b.score - a.score).slice(0, 2);
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (pb <= 11) {
        fortalezas.push(`Puntuación baja (${pb}/40): tu perfil indica una autoestima saludable sin rasgos narcisistas elevados. Esto generalmente se asocia con mayor capacidad de empatía, relaciones más igualitarias y menor tendencia a explotar a los demás.`);
        fortalezas.push('Las personas con bajo NPI tienden a ser más receptivas al feedback, más colaborativas y menos defensivas ante la crítica — habilidades relacionales de alto valor.');
      } else if (pb <= 15) {
        fortalezas.push(`Rango promedio (${pb}/40): una cuota moderada de narcisismo es funcional. Está asociada con mayor confianza, ambición y capacidad de influencia en contextos sociales y laborales.`);
        desarrollo.push('Sin embargo, vale la pena revisar las subescalas donde puntúas más alto, ya que pueden estar influyendo en cómo te relacionas con el feedback, la crítica o las necesidades de los demás.');
      } else if (pb <= 22) {
        desarrollo.push(`Narcisismo elevado (${pb}/40): tus respuestas sugieren rasgos como necesidad de admiración, tendencia a la grandiosidad o dificultad para empatizar bajo presión. Estos rasgos, en exceso, impactan negativamente las relaciones cercanas y el liderazgo sostenible.`);
        if (topSub.length > 0) desarrollo.push(`Tus subescalas más altas son ${topSub.map((d: any) => d.dimension).join(' y ')}, que se relacionan con ${topSub[0]?.dimension === 'Autoridad' ? 'la necesidad de poder y control' : topSub[0]?.dimension === 'Explotación' ? 'el uso instrumental de los demás' : topSub[0]?.dimension === 'Vanidad' ? 'la preocupación por la imagen y el atractivo' : 'la percepción de derechos o prerrogativas especiales'}.`);
        recomendaciones.push('La psicoterapia (especialmente la orientada hacia el apego y la mentalización) puede ser muy útil para desarrollar una autoestima más genuina y estable, menos dependiente de la validación externa.');
      } else {
        desarrollo.push(`Narcisismo muy elevado (${pb}/40): en este rango los rasgos narcisistas son prominentes y probablemente generan patrones relacionales disfuncionales. La empatía puede estar comprometida, la tolerancia a la crítica es baja y la explotación interpersonal puede ser un patrón habitual.`);
        desarrollo.push('El narcisismo elevado se asocia con dificultades serias en relaciones íntimas, conflictos laborales recurrentes y, paradójicamente, baja autoestima encubierta bajo una fachada de grandiosidad.');
        recomendaciones.push('Busca apoyo psicológico especializado. El trabajo terapéutico con rasgos narcisistas es posible y efectivo, especialmente cuando existe motivación genuina para el cambio. El primer paso es reconocer el impacto de estos patrones en las personas cercanas.');
      }
      recomendaciones.push('El NPI-40 mide rasgos narcisistas subclínicos, no Trastorno Narcisista de Personalidad. Una puntuación alta en este instrumento no equivale a un diagnóstico clínico. Interpreta este resultado como información para el autoconocimiento, no como una etiqueta.');
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'El NPI-40 mide rasgos narcisistas en población no clínica (Raskin & Hall, 1979). No diagnostica Trastorno Narcisista de Personalidad.' };
    }

    case 'DARK_TRIAD': {
      const narc = result.dimensiones?.find((d: any) => d.dimension === 'Narcisismo');
      const maq  = result.dimensiones?.find((d: any) => d.dimension === 'Maquiavelismo');
      const psic = result.dimensiones?.find((d: any) => d.dimension === 'Psicopatía');
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      const todos = [narc, maq, psic].filter(Boolean);
      const todosEquilibrados = todos.every((d: any) => d?.label !== 'Alto');
      if (todosEquilibrados) {
        fortalezas.push('Perfil equilibrado: ninguno de los tres rasgos oscuros alcanza un nivel elevado. Esto sugiere buena capacidad de empatía, cooperación genuina y manejo ético de las relaciones.');
        fortalezas.push('Las personas con este perfil tienden a ser percibidas como confiables, leales y predecibles en sus relaciones — atributos de alto valor tanto en lo personal como en lo profesional.');
      }
      if (narc?.label === 'Alto') desarrollo.push(`Narcisismo elevado (${narc.score?.toFixed(1)}/5): necesidad intensa de admiración y tendencia a sobrestimar tus capacidades. Puede generar dificultades cuando el reconocimiento no llega o cuando debes subordinar tus intereses a los del equipo.`);
      if (maq?.label === 'Alto') desarrollo.push(`Maquiavelismo elevado (${maq.score?.toFixed(1)}/5): tendencia a usar a los demás instrumentalmente para lograr objetivos propios, planificación estratégica fría y baja preocupación por la ética cuando está en juego el beneficio personal. Esto puede deteriorar relaciones de confianza a largo plazo.`);
      if (psic?.label === 'Alto') desarrollo.push(`Psicopatía elevada (${psic.score?.toFixed(1)}/5): reducida empatía afectiva, impulsividad y búsqueda de sensaciones. Puede traducirse en decisiones de riesgo, dificultad para internalizar consecuencias emocionales de las propias acciones y frialdad percibida por los demás.`);

      if (maq?.label === 'Alto' || psic?.label === 'Alto') recomendaciones.push('Trabaja conscientemente en identificar el impacto real de tus decisiones sobre los demás. Llevar un "diario de consecuencias" — donde registres cómo tus acciones afectan a tu entorno — puede ser una práctica transformadora.');
      if (narc?.label === 'Alto') recomendaciones.push('Practica recibir feedback sin defenderte: en la próxima crítica que recibas, simplemente agradece y reflexiona antes de responder. Es un ejercicio simple con impacto alto.');
      recomendaciones.push('Los rasgos de la tríada oscura están distribuidos en la población general y tienen expresiones funcionales. Conocerlos es una ventaja: te permite gestionar activamente las conductas que pueden dañar tus relaciones o tu reputación.');
      return { fortalezas, desarrollo, recomendaciones };
    }

    case 'MSI_BPD': {
      const pb = result.puntuacionBruta ?? 0;
      const pos = result.screeningPositivo;
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (!pos) {
        fortalezas.push(`Screening negativo (${pb}/10 criterios). No se alcanzan los indicadores combinados asociados a Trastorno Límite de Personalidad en este instrumento.`);
        if (pb >= 4) desarrollo.push(`Con ${pb}/10 criterios marcados, hay algunos indicadores que merecen atención aunque no alcancen el umbral. Dificultades en regulación emocional, relaciones interpersonales intensas o una imagen de sí mismo inestable pueden estar presentes de forma subclínica.`);
        recomendaciones.push('Si experimentas cambios de ánimo intensos y rápidos, dificultad para tolerar el abandono o relaciones muy inestables, merece exploración con un profesional, independientemente del resultado de este screening.');
      } else {
        desarrollo.push(`Screening positivo (${pb}/10 criterios ≥ 7). Esto indica que tus respuestas son consistentes con varios indicadores del TLP. Es importante subrayar que esto no es un diagnóstico — es una señal de que merece evaluación clínica.`);
        desarrollo.push('El TLP incluye patrones como miedo intenso al abandono, relaciones intensas pero inestables (idealización/devaluación), impulsividad, inestabilidad emocional rápida, y a veces conductas autolesivas. Si reconoces estos patrones, hay ayuda efectiva disponible.');
        recomendaciones.push('La Terapia Dialéctica Conductual (DBT), desarrollada específicamente para TLP, tiene una de las mayores tasas de éxito entre los tratamientos de salud mental. Busca un terapeuta formado en DBT.');
        recomendaciones.push('Busca evaluación psiquiátrica completa. El TLP a menudo coexiste con depresión, ansiedad o TDAH, y el tratamiento integrado es más efectivo que tratar cada cosa por separado.');
        recomendaciones.push('No estás "roto". El TLP tiene bases en experiencias vitales y patrones aprendidos, y con el acompañamiento adecuado, hay una recuperación real y sostenida posible.');
      }
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'El MSI-BPD es un instrumento de screening (Zanarini et al., 2003). El diagnóstico de TLP solo puede realizarlo un psiquiatra o psicólogo clínico.' };
    }

    case 'PID_5': {
      const dominios = (result.dimensiones || []).filter((d: any) => d.label === 'Elevado');
      const bajos = (result.dimensiones || []).filter((d: any) => d.label === 'Bajo');
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (bajos.length >= 4) {
        fortalezas.push('La mayoría de tus dominios de personalidad DSM-5 se ubican en rango bajo, lo que indica ausencia de rasgos problemáticos significativos en esta evaluación.');
        fortalezas.push('Un perfil bajo en los 5 dominios del PID-5 está asociado con mayor estabilidad emocional, relaciones más predecibles y mejor funcionamiento general.');
      }
      if (dominios.length === 0) {
        fortalezas.push('No se detectan dominios de personalidad en rango elevado. Esto sugiere que los rasgos disfuncionales de personalidad medidos por el DSM-5 no son prominentes en tu funcionamiento actual.');
      }
      dominios.forEach((d: any) => {
        const desc: Record<string, string> = {
          'Afecto Negativo': 'experiencias emocionales negativas frecuentes e intensas, alta reactividad emocional y dificultad para regular el estado de ánimo',
          'Distanciamiento': 'tendencia al retraimiento social, restricción emocional, poca expresividad y experiencias de vacío o anhedonia',
          'Antagonismo': 'tendencia a poner los intereses propios por encima de los ajenos, manipulación, grandiosidad o hostilidad',
          'Desinhibición': 'impulsividad, irresponsabilidad, orientación al presente, búsqueda de novedad y dificultad para planificar a largo plazo',
          'Psicoticismo': 'pensamientos inusuales, percepciones poco convencionales, comportamiento o discurso extravagante',
        };
        desarrollo.push(`${d.dimension} elevado (${d.score?.toFixed(1)}/3): indica ${desc[d.dimension] || 'rasgos disfuncionales en este dominio'}. Cuando este dominio es elevado, puede impactar significativamente tus relaciones y funcionamiento cotidiano.`);
      });
      if (dominios.length > 0) {
        recomendaciones.push('Los rasgos de personalidad evaluados por el PID-5 son relativamente estables, pero responden al trabajo terapéutico sostenido. La psicoterapia orientada a la personalidad (como la Terapia Basada en la Mentalización o el Análisis Transaccional) puede ser muy útil.');
        recomendaciones.push('Comparte este resultado con un psicólogo o psiquiatra para una evaluación más completa. El PID-5 es un punto de partida, no una conclusión.');
      }
      recomendaciones.push('Conocer tu perfil de personalidad DSM-5 es el inicio del autoconocimiento profundo. Trabaja con un Menter para convertir esta información en un plan de desarrollo personal concreto.');
      return { fortalezas, desarrollo, recomendaciones, notaClinica: 'El PID-5-BF es un instrumento dimensional del DSM-5 (Krueger et al., 2012). No diagnostica trastornos de personalidad.' };
    }

    case 'BARON_ICE': {
      const ce = result.ceTotal ?? 0;
      const semaforoCE = result.semaforoCE;
      const componentes: any[] = result.componentes || [];
      const alertas = result.alertas || {};
      const valido = result.valido !== false;
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (!valido) {
        desarrollo.push(
          alertas.omision
            ? `Se omitieron más de 10 ítems (${result.omitidos} sin respuesta), lo que invalida el protocolo según las normas del BarOn ICE. Los resultados deben interpretarse con cautela.`
            : `El Índice de Inconsistencia supera el umbral (${result.scoreInconsistencia}/12 pares inconsistentes ≥ 9). Esto puede indicar respuestas aleatorias o falta de comprensión de las afirmaciones.`
        );
      }
      if (alertas.ipElevado) {
        desarrollo.push(`Impresión Positiva elevada (IP = ${result.scoreIP}/35): es probable que hayas respondido de forma más favorable de lo habitual. Toma en cuenta que esto puede inflar los resultados.`);
      }

      // CE Total global
      if (ce > 110) {
        fortalezas.push(`CE Total ${ce} — Capacidad Muy Desarrollada: tu inteligencia emocional y social se ubica por encima del promedio poblacional (normas Lima Metropolitana, Ugarriza 2001). Esto indica una gestión efectiva de tus emociones, relaciones y adaptación al entorno en condiciones normales y de estrés.`);
      } else if (ce >= 90) {
        fortalezas.push(`CE Total ${ce} — Capacidad Adecuada: tu inteligencia emocional se ubica dentro del rango promedio esperado para adultos. Funciona bien en la mayoría de situaciones cotidianas, con espacio para desarrollar habilidades específicas.`);
      } else {
        desarrollo.push(`CE Total ${ce} — Área de Oportunidad: tu puntuación global se ubica por debajo del promedio poblacional. Esto no define quien eres, sino que señala habilidades emocionales que con trabajo consciente pueden desarrollarse significativamente.`);
      }

      // Fortalezas por componente (PE > 110)
      const fuertes = componentes.filter(c => c.pe > 110);
      const debiles = componentes.filter(c => c.pe < 90);
      if (fuertes.length > 0) {
        fortalezas.push(`Componentes destacados: ${fuertes.map(c => `${c.nombre} (PE ${c.pe})`).join(', ')}. Estas son tus fortalezas emocionales más desarrolladas — recursos que puedes apoyar intencionalmente en situaciones de presión.`);
      }
      if (debiles.length > 0) {
        desarrollo.push(`Componentes a desarrollar: ${debiles.map(c => `${c.nombre} (PE ${c.pe})`).join(', ')}. Estas áreas se ubican por debajo del promedio y representan las oportunidades de crecimiento emocional más relevantes para ti.`);
      }

      // Recomendaciones por componentes débiles
      const nombresDebiles = debiles.map(c => c.clave || c.nombre);
      if (nombresDebiles.includes('IA') || nombresDebiles.includes('Intrapersonal')) {
        recomendaciones.push('Para el componente Intrapersonal (autoconciencia, asertividad, autoconcepto, autorrealización, independencia): practica la escritura reflexiva diaria (journaling). Registrar tus emociones y decisiones fortalece la autoconciencia y mejora la congruencia entre tus valores y tus acciones.');
      }
      if (nombresDebiles.includes('IE') || nombresDebiles.includes('Interpersonal')) {
        recomendaciones.push('Para el componente Interpersonal (empatía, responsabilidad social, relaciones): dedica tiempo a escuchar activamente sin preparar tu respuesta. La calidad de la atención que das a los demás es el núcleo del desarrollo interpersonal.');
      }
      if (nombresDebiles.includes('AE') || nombresDebiles.includes('Adaptabilidad')) {
        recomendaciones.push('Para el componente Adaptabilidad (prueba de realidad, flexibilidad, solución de problemas): cuando enfrentes un problema, escribe 3 perspectivas distintas antes de actuar. Esta técnica reduce la rigidez cognitiva y amplía el repertorio de respuestas.');
      }
      if (nombresDebiles.includes('ME') || nombresDebiles.includes('Manejo del Estrés')) {
        recomendaciones.push('Para el Manejo del Estrés (tolerancia, control de impulsos): implementa una "pausa de 90 segundos" antes de reaccionar en situaciones de alta carga emocional. La fisiología del impulso dura menos de 90 segundos — esperar ese tiempo rompe el ciclo reactivo.');
      }
      if (nombresDebiles.includes('AG') || nombresDebiles.includes('Ánimo General')) {
        recomendaciones.push('Para el Ánimo General (felicidad, optimismo): practica el registro de 3 cosas positivas al día. La neurociencia del bienestar muestra que este hábito, sostenido por 21 días, recalibra el sesgo negativo del cerebro.');
      }
      recomendaciones.push('La inteligencia emocional es una capacidad entrenable. A diferencia del CI, el CE tiene mayor plasticidad y responde bien al trabajo con un coach o Menter especializado en desarrollo emocional. Considera trabajar las subescalas más bajas con acompañamiento profesional.');

      return {
        fortalezas, desarrollo, recomendaciones,
        notaClinica: 'BarOn ICE — Ugarriza (2001). Baremos Lima Metropolitana, muestra adulta mixta. PE: Puntuación Estándar (media=100, DS=15). No es una herramienta diagnóstica clínica.',
      };
    }

    case 'HEXACO_HH': {
      const nivel = result.nivelIntegridad || '';
      const score_ = result.scoreTotal ?? 0;
      const redFlags = (result.dimensiones || []).filter((d: any) => d.redFlagCount > 0);
      const fortalezas: string[] = [];
      const desarrollo: string[] = [];
      const recomendaciones: string[] = [];

      if (['Alta', 'Muy alta'].includes(nivel)) {
        fortalezas.push(`Integridad ${nivel} (${score_.toFixed(1)}/5): tu perfil HEXACO-HH indica sinceridad, equidad, evitación de la codicia y modestia en niveles por encima del promedio. Este es el rasgo de personalidad con mayor correlación con comportamiento ético en el trabajo.`);
        fortalezas.push('Las personas con alta Honestidad-Humildad son percibidas como confiables, justas y no-manipuladoras. En entornos de equipo y liderazgo, esto genera capital social de alto valor y bajo costo de mantenimiento.');
        recomendaciones.push('Tu perfil es un activo en entornos donde la confianza es crítica. Cultívalo y protégelo: la integridad, una vez cuestionada, es costosa de reconstruir.');
      } else if (nivel === 'Moderada') {
        fortalezas.push(`Integridad Moderada (${score_.toFixed(1)}/5): tu perfil muestra una base ética sólida con algunas áreas donde los principios pueden ceder ante intereses personales o presiones del contexto.`);
        desarrollo.push('Una puntuación moderada puede indicar que en situaciones de alta tensión o beneficio personal, las decisiones éticas requieren mayor esfuerzo consciente. No es un déficit moral — es una oportunidad de desarrollo.');
        recomendaciones.push('Identifica tus situaciones de riesgo ético: ¿cuándo es más probable que tomes atajos o que pongas tus intereses por encima de los ajenos? El autoconocimiento de estos contextos es el primer paso para manejarlos.');
      } else {
        desarrollo.push(`Integridad ${nivel} (${score_.toFixed(1)}/5): el perfil indica rasgos que pueden predisponer a conductas poco éticas bajo presión, incluyendo egocentrismo, manipulación o priorización sistemática del beneficio propio.`);
        desarrollo.push('En contextos organizacionales, un perfil bajo en HH está asociado con mayor riesgo de comportamiento deshonesto, abuso de poder o falta de transparencia.');
        recomendaciones.push('El desarrollo de la ética personal requiere trabajo profundo: reflexión sobre valores, comprensión del impacto de tus acciones y, en muchos casos, acompañamiento profesional.');
      }
      if (redFlags.length > 0) {
        desarrollo.push(`Se detectaron indicadores de riesgo en: ${redFlags.map((d: any) => d.dimension).join(', ')}. Estas áreas requieren atención especial en cualquier proceso de selección o desarrollo de liderazgo.`);
      }
      return { fortalezas, desarrollo, recomendaciones };
    }

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function ResultadoPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const rawId        = params?.instrument as string;
  const rawNormalized = rawId?.replace(/-/g, '_') ?? ''
  const instrumentId  =
    (INSTRUMENTS[rawNormalized as InstrumentId] || EMPRESA_INSTRUMENTS[rawNormalized as EmpresaInstrumentId])
      ? rawNormalized
      : rawNormalized.toUpperCase();
  const resultId   = searchParams?.get('r') || '';
  const token      = searchParams?.get('t') || '';

  const [result, setResult]       = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [user, setUser]           = useState<any>(null);
  const [sharing, setSharing]     = useState(false);
  const [shared, setShared]       = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const inst = INSTRUMENTS[instrumentId as InstrumentId] ||
               EMPRESA_INSTRUMENTS[instrumentId as EmpresaInstrumentId];
  const cfg  = CARD_CONFIGS[instrumentId];

  useEffect(() => {
    setLoading(true);
    setResult(null);
    setShowFallback(false);

    const timer = setTimeout(() => setShowFallback(true), 8000);

    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      if (resultId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`/api/assessment/result?r=${resultId}&t=${encodeURIComponent(token)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.resultado_json) {
          clearTimeout(timer)
          setResult(data.resultado_json)
          setLoading(false)
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'test_resultado_visto', { instrument: instrumentId, result_id: resultId })
          }
          return
        }
      }
    } catch (_) {}
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000))
  }
 }
      // No se encontró resultado: mantener loading=true para que el timer de fallback dispare
    };
    init();
    return () => clearTimeout(timer);
  }, [resultId, token]);

  const handleShare = async () => {
    if (!cfg || !result) return;
    setSharing(true);
    const text = cfg.shareText(result);
    const url  = `https://girolab.net/test/${rawId}`;
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
    const text = encodeURIComponent(`${cfg.shareText(result)}\n\nhttps://girolab.net/test/${rawId}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

const handleRegister = () => {
  if (token) localStorage.setItem('pendingTestToken', token)
  const returnUrl = `/test/${rawId}/resultado?r=${resultId}&t=${token}`
  router.push(`/registro?returnUrl=${encodeURIComponent(returnUrl)}`)
}

  if (loading) return <LoadingScreen showFallback={showFallback} onRegister={handleRegister} />;
  if (!result || !inst || !cfg) return <div style={rs.notFound}>Resultado no encontrado.</div>;

  const headline = cfg.headline(result);
  const subline  = cfg.subline(result);
  const dims     = result.dimensiones as any[] | undefined;
  const rich     = generarInterpretacion(instrumentId, result);

  const baronBarColor = (label?: string) =>
    label === 'Capacidad Muy Desarrollada' ? '#4CAF50'
    : label === 'Área de Oportunidad' ? '#FF9800'
    : '#2196F3'

  const ResultCard = (
    <div ref={cardRef} style={{ ...rs.card, background: 'white', padding: 0, overflow: 'hidden' }}>
      {/* Header blanco */}
      <div style={{ background: 'white', padding: '28px 28px 20px', position: 'relative', borderBottom: '1px solid #f0f0f0' }}>
        <div style={rs.watermark}>
          <span style={{ ...rs.watermarkText, color: '#421869' }}>Giro Lab</span>
          <span style={{ ...rs.watermarkDot, background: '#421869' }} />
        </div>
        <span style={{ ...rs.instBadge, background: '#f3e8ff', color: '#421869' }}>
          {cfg.badge(result)}
        </span>
        <div style={rs.cardCenter}>
          <h1 style={{ ...rs.cardHeadline, color: '#421869' }}>{headline}</h1>
          <p style={{ ...rs.cardSubline, color: '#7c3aed99' }}>{subline}</p>
        </div>
      </div>

      {/* Cuerpo blanco: barras + cta */}
      <div style={{ padding: '20px 28px 24px', background: 'white' }}>
        {cfg.showDimensions && dims && dims.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {dims.slice(0, 5).map((dim, i) => {
              const pct = Math.min(((dim.score || 0) / cfg.dimensionMax) * 100, 100);
              const barColor = instrumentId === 'BARON_ICE' ? baronBarColor(dim.label) : CHART_PALETTE[i % CHART_PALETTE.length];
              return (
                <div key={i} style={rs.dimRow}>
                  <span style={{ ...rs.dimName, color: '#444' }}>
                    {dim.dimension?.length > 14 ? dim.dimension.slice(0,14)+'…' : dim.dimension}
                  </span>
                  <div style={{ ...rs.dimTrack, background: '#f0f0f0' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background: barColor, borderRadius:3, transition:'width 0.8s ease' }} />
                  </div>
                  <span style={{ ...rs.dimScore, color: barColor }}>
                    {typeof dim.score === 'number' ? dim.score.toFixed(dim.score < 10 ? 1 : 0) : dim.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {instrumentId === 'DISC' && result.percentiles?.adaptado && (
          <div style={rs.discBars}>
            {(['D','I','S','C'] as const).map(f => {
              const pct = result.percentiles.adaptado[f] || 0;
              return (
                <div key={f} style={rs.discBarCol}>
                  <div style={rs.discBarTrack}>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:`${pct}%`, background: DISC_COLORS[f] || cfg.accentColor, borderRadius:'4px 4px 0 0' }} />
                  </div>
                  <span style={{ ...rs.discBarLabel, color: '#555' }}>{f}</span>
                  <span style={{ ...rs.discBarPct, color: DISC_COLORS[f] || cfg.accentColor }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
        <p style={{ ...rs.cardCta, color: '#888', margin: '4px 0 2px' }}>{cfg.cta}</p>
        <p style={{ ...rs.cardUrl, color: '#bbb' }}>girolab.net</p>
      </div>
    </div>
  );

  return (
    <div style={rs.page}>
      <ul style={rs.circles}>
        {[{left:'25%',size:80,delay:0,dur:25},{left:'10%',size:20,delay:2,dur:12},{left:'70%',size:20,delay:4,dur:25},{left:'40%',size:60,delay:8,dur:20},{left:'85%',size:30,delay:1,dur:18}].map((c,i) => (
          <li key={i} style={{ position:'absolute', display:'block', width:c.size, height:c.size, background:'rgba(255,255,255,0.05)', bottom:-150, left:c.left, borderRadius:'50%', animation:`animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </ul>
      <style>{`@keyframes animateUp{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-110vh) rotate(720deg);opacity:0}} @media(max-width:860px){.rs-cols{flex-direction:column!important}}`}</style>

      {/* ── CONTENEDOR BLANCO ── */}
      <div style={rs.wrapper}>
      <div className="rs-cols" style={rs.cols}>
        {/* IZQUIERDA: card + interpretación rica */}
        <div style={rs.colLeft}>
          {ResultCard}

          {rich && (
            <div style={rs.richCard}>
              {rich.fortalezas.length > 0 && (
                <div style={rs.richSection}>
                  <h3 style={{ ...rs.richTitle, color: '#15803d' }}>Fortalezas</h3>
                  {rich.fortalezas.map((t, i) => (
                    <div key={i} style={rs.richItem}>
                      <span style={{ ...rs.richBullet, background: '#dcfce7', color: '#15803d' }}>+</span>
                      <p style={rs.richText}>{t}</p>
                    </div>
                  ))}
                </div>
              )}
              {rich.desarrollo.length > 0 && (
                <div style={rs.richSection}>
                  <h3 style={{ ...rs.richTitle, color: '#b45309' }}>Areas de desarrollo</h3>
                  {rich.desarrollo.map((t, i) => (
                    <div key={i} style={rs.richItem}>
                      <span style={{ ...rs.richBullet, background: '#fef3c7', color: '#b45309' }}>!</span>
                      <p style={rs.richText}>{t}</p>
                    </div>
                  ))}
                </div>
              )}
              {rich.recomendaciones.length > 0 && (
                <div style={rs.richSection}>
                  <h3 style={{ ...rs.richTitle, color: '#421869' }}>Que puedes hacer</h3>
                  {rich.recomendaciones.map((t, i) => (
                    <div key={i} style={rs.richItem}>
                      <span style={{ ...rs.richBullet, background: '#ede9fe', color: '#421869' }}>→</span>
                      <p style={rs.richText}>{t}</p>
                    </div>
                  ))}
                </div>
              )}
              {rich.notaClinica && (
                <p style={rs.notaClinica}>{rich.notaClinica}</p>
              )}
            </div>
          )}

          {/* Fallback si no hay rich content */}
          {!rich && result.interpretacion && (
            <div style={rs.interpBox}>
              <p style={rs.interpText}>{result.interpretacion}</p>
            </div>
          )}
          {result.nota && (
            <div style={rs.notaBox}>
              <p style={rs.notaText}>Nota: {result.nota}</p>
            </div>
          )}
          {result.alertas?.length > 0 && (
            <div style={rs.alertBox}>
              {result.alertas.map((a: string, i: number) => (
                <p key={i} style={rs.alertText}>{a}</p>
              ))}
            </div>
          )}
        </div>

        {/* DERECHA: compartir + CTA + footer */}
        <div style={rs.colRight}>
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
                {sharing ? '...' : shared ? 'Copiado' : 'Compartir'}
              </button>
            </div>
          </div>

          <div style={rs.ctaSection}>
            <div style={rs.ctaCard}>
              <h2 style={rs.ctaTitle}>¿Quieres trabajar esto con un especialista?</h2>
              <p style={rs.ctaSubtitle}>
                Conecta con un Menter certificado que puede acompañarte en tu proceso.
              </p>
              {user ? (
                <button style={rs.ctaBtn} onClick={() => router.push('/dashboard?tab=directorio')}>
                  Ver Menters especializados
                </button>
              ) : (
                <>
                  <button style={rs.ctaBtn} onClick={handleRegister}>
                    Crear mi cuenta gratis
                  </button>
                  <button style={rs.ctaSecondary} onClick={() => router.push(`/login?returnUrl=/dashboard`)}>
                    Ya tengo cuenta — iniciar sesión
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={rs.footer}>
            <p style={rs.footerText}>
              Giro Lab — Este test es una herramienta de autoconocimiento. No constituye diagnóstico clínico.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function LoadingScreen({ showFallback, onRegister }: { showFallback?: boolean; onRegister?: () => void }) {
  return (
    <div style={{ minHeight:'100vh', background:'#421869', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 16 }}>
      <DotLottieReact
        src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie"
        loop autoplay style={{ width: 120, height: 120 }}
      />
      <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>
        Analizando tu resultado...
      </p>
      {showFallback && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 28px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, maxWidth: 320, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            ¿No ves tu resultado? Crea una cuenta para guardarlo y acceder desde tu perfil.
          </p>
          <button
            onClick={onRegister}
            style={{ padding: '12px 28px', borderRadius: 10, background: '#fff', color: '#421869', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
          >
            Crear cuenta gratis
          </button>
        </div>
      )}
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────
const rs: Record<string, React.CSSProperties> = {
  page:           { minHeight:'100vh', backgroundColor:'#421869', position:'relative', overflowX:'hidden', fontFamily:"'DM Sans', system-ui, sans-serif" },
  circles:        { position:'fixed', top:0, left:0, width:'100%', height:'100%', overflow:'hidden', margin:0, padding:0, zIndex:0, pointerEvents:'none', listStyle:'none' },
  notFound:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#888' },
  // CONTENEDOR BLANCO
  wrapper:        { position:'relative', zIndex:1, maxWidth:1020, margin:'0 auto', padding:'32px 20px 60px' },
  // TWO-COLUMN LAYOUT
  cols:           { display:'flex', flexDirection:'row', gap:24, alignItems:'flex-start' },
  colLeft:        { flex:1, display:'flex', flexDirection:'column', gap:12 },
  colRight:       { width:340, flexShrink:0, display:'flex', flexDirection:'column', gap:16 },
  // CARD
  card:           { width:'100%', minHeight:480, borderRadius:20, padding:'32px 28px', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' },
  watermark:      { display:'flex', alignItems:'center', gap:6, marginBottom:20 },
  watermarkText:  { fontSize:13, fontWeight:800, color:'rgba(255,255,255,0.5)', letterSpacing:2, textTransform:'uppercase' },
  watermarkDot:   { width:6, height:6, borderRadius:'50%', opacity:0.6 },
  instBadge:      { alignSelf:'flex-start', fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:999, letterSpacing:1.5, textTransform:'uppercase', marginBottom:16 },
  cardCenter:     { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'16px 0' },
  cardHeadline:   { fontSize:32, fontWeight:800, margin:'0 0 8px', lineHeight:1.1, fontFamily:"'Raleway', sans-serif" },
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
  // INTERPRETACIÓN RICA
  richCard:       { background:'#fff', borderRadius:20, padding:'28px 24px', display:'flex', flexDirection:'column', gap:20 },
  richSection:    { display:'flex', flexDirection:'column', gap:10 },
  richTitle:      { fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:1.2, margin:'0 0 4px', fontFamily:"'Raleway', sans-serif" },
  richItem:       { display:'flex', gap:12, alignItems:'flex-start' },
  richBullet:     { width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0, marginTop:1 },
  richText:       { fontSize:14, color:'#374151', lineHeight:1.75, margin:0 },
  notaClinica:    { fontSize:11, color:'#6b7280', lineHeight:1.5, margin:'4px 0 0', borderTop:'1px solid #f3f4f6', paddingTop:12 },
  // FALLBACK
  interpBox:      { background:'#fff', borderRadius:16, padding:'20px 24px', border:'1px solid #eee' },
  interpText:     { fontSize:14, color:'#444', lineHeight:1.7, margin:0 },
  notaBox:        { background:'#FFF8E1', borderRadius:12, padding:'12px 16px', border:'1px solid #FFE082' },
  notaText:       { fontSize:12, color:'#795548', margin:0, lineHeight:1.5 },
  alertBox:       { background:'#FFEBEE', borderRadius:12, padding:'12px 16px', border:'1px solid #FFCDD2' },
  alertText:      { fontSize:12, color:'#B71C1C', margin:'2px 0' },
  // SHARE
  shareSection:   { background:'white', borderRadius:16, padding:'20px' },
  shareSectionTitle:{ fontSize:12, color:'#666', textAlign:'center', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:1 },
  shareBtns:      { display:'flex', gap:10 },
  whatsappBtn:    { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:12, border:'none', background:'#25D366', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' },
  shareBtn:       { flex:1, padding:'14px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s' },
  // CTA
  ctaSection:     { },
  ctaCard:        { background:'#1a1a1a', borderRadius:20, padding:'28px 24px', textAlign:'center' },
  ctaTitle:       { fontSize:18, fontWeight:800, color:'#fff', margin:'0 0 8px', fontFamily:"'Raleway', sans-serif" },
  ctaSubtitle:    { fontSize:13, color:'rgba(255,255,255,0.6)', margin:'0 0 20px', lineHeight:1.6 },
  ctaBtn:         { width:'100%', padding:'16px', borderRadius:12, background:'#fff', color:'#1a1a1a', border:'none', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:8, fontFamily:"'Raleway', sans-serif" },
  ctaSecondary:   { width:'100%', padding:'12px', borderRadius:12, background:'none', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.2)', fontSize:13, cursor:'pointer' },
  // FOOTER
  footer:         { textAlign:'center', paddingTop:8 },
  footerText:     { fontSize:11, color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.6 },
};