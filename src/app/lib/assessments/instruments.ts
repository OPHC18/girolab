// src/lib/assessments/instruments.ts
// Configuración completa de los 9 instrumentos + lógica de scoring

export type InstrumentId =
  | 'BDI_II' | 'BAI' | 'MDQ' | 'ASRS_v1_1'
  | 'BIG_FIVE' | 'NPI_40' | 'MSI_BPD' | 'DARK_TRIAD' | 'PID_5';

export type ResponseType = 'likert_0_3' | 'likert_1_5' | 'binary' | 'forced_choice' | 'frequency_0_4' | 'mdq_c';

export interface InstrumentOption { valor: number; etiqueta: string; }

export interface InstrumentConfig {
  id: InstrumentId;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  totalItems: number;
  tiempoMinutos: number;
  responseType: ResponseType;
  opciones?: InstrumentOption[];
  tagsMenters: string[];
  planesMenter: ('master' | 'premium')[];
  referencia: string;
}

export const INSTRUMENTS: Record<InstrumentId, InstrumentConfig> = {
  BDI_II: {
    id: 'BDI_II', nombre: 'Inventario de Depresión de Beck II', descripcion: 'Evalúa la presencia y severidad de síntomas depresivos en adultos.',
    icono: '🌧', color: '#5C6BC0', totalItems: 21, tiempoMinutos: 10, responseType: 'likert_0_3',
    opciones: [
      { valor: 0, etiqueta: 'En absoluto' }, { valor: 1, etiqueta: 'Levemente' },
      { valor: 2, etiqueta: 'Moderadamente' }, { valor: 3, etiqueta: 'Severamente' },
    ],
    tagsMenters: ['depresion', 'salud_mental', 'psicologia_clinica'], planesMenter: ['master', 'premium'],
    referencia: 'Beck, Steer & Brown (1996)',
  },
  BAI: {
    id: 'BAI', nombre: 'Inventario de Ansiedad de Beck', descripcion: 'Mide la intensidad de síntomas de ansiedad física y cognitiva.',
    icono: '⚡', color: '#EF5350', totalItems: 21, tiempoMinutos: 10, responseType: 'likert_0_3',
    opciones: [
      { valor: 0, etiqueta: 'En absoluto' }, { valor: 1, etiqueta: 'Levemente' },
      { valor: 2, etiqueta: 'Moderadamente' }, { valor: 3, etiqueta: 'Severamente' },
    ],
    tagsMenters: ['ansiedad', 'salud_mental', 'psicologia_clinica'], planesMenter: ['master', 'premium'],
    referencia: 'Beck & Steer (1993)',
  },
  MDQ: {
    id: 'MDQ', nombre: 'Cuestionario de Trastornos del Estado de Ánimo', descripcion: 'Screening de 3 pasos para detectar posible trastorno bipolar.',
    icono: '🔄', color: '#AB47BC', totalItems: 15, tiempoMinutos: 5, responseType: 'binary',
    opciones: [{ valor: 0, etiqueta: 'No' }, { valor: 1, etiqueta: 'Sí' }],
    tagsMenters: ['bipolaridad', 'trastorno_afectivo', 'psicologia_clinica'], planesMenter: ['master', 'premium'],
    referencia: 'Hirschfeld et al. (2000)',
  },
  ASRS_v1_1: {
    id: 'ASRS_v1_1', nombre: 'Escala ASRS v1.1 para TDAH', descripcion: 'Autoevaluación de síntomas de TDAH en adultos, validada por la OMS.',
    icono: '🧠', color: '#26A69A', totalItems: 18, tiempoMinutos: 10, responseType: 'frequency_0_4',
    opciones: [
      { valor: 0, etiqueta: 'Nunca' }, { valor: 1, etiqueta: 'Raramente' },
      { valor: 2, etiqueta: 'A veces' }, { valor: 3, etiqueta: 'A menudo' }, { valor: 4, etiqueta: 'Muy a menudo' },
    ],
    tagsMenters: ['tdah', 'atencion', 'neuropsicologia'], planesMenter: ['master', 'premium'],
    referencia: 'Kessler et al. (2005)',
  },
  BIG_FIVE: {
    id: 'BIG_FIVE', nombre: 'Inventario de los Cinco Grandes (OCEAN)', descripcion: 'Perfil de personalidad en las 5 dimensiones universales.',
    icono: '🌟', color: '#FF7043', totalItems: 44, tiempoMinutos: 15, responseType: 'likert_1_5',
    opciones: [
      { valor: 1, etiqueta: 'Muy en desacuerdo' }, { valor: 2, etiqueta: 'En desacuerdo' },
      { valor: 3, etiqueta: 'Neutral' }, { valor: 4, etiqueta: 'De acuerdo' }, { valor: 5, etiqueta: 'Muy de acuerdo' },
    ],
    tagsMenters: ['personalidad', 'desarrollo_personal', 'coaching'], planesMenter: ['master', 'premium'],
    referencia: 'John & Srivastava (1999)',
  },
  NPI_40: {
    id: 'NPI_40', nombre: 'Inventario de Personalidad Narcisista (NPI-40)', descripcion: '40 pares de elección forzada para evaluar rasgos narcisistas.',
    icono: '👑', color: '#FFA726', totalItems: 40, tiempoMinutos: 15, responseType: 'forced_choice',
    tagsMenters: ['personalidad', 'narcisismo', 'psicologia_clinica'], planesMenter: ['master'],
    referencia: 'Raskin & Hall (1979)',
  },
  MSI_BPD: {
    id: 'MSI_BPD', nombre: 'Screening para Trastorno Límite (MSI-BPD)', descripcion: 'Instrumento de screening breve para Trastorno Límite de Personalidad.',
    icono: '🌊', color: '#26C6DA', totalItems: 10, tiempoMinutos: 5, responseType: 'binary',
    opciones: [{ valor: 0, etiqueta: 'No' }, { valor: 1, etiqueta: 'Sí' }],
    tagsMenters: ['borderline', 'trastorno_personalidad', 'psicologia_clinica'], planesMenter: ['master'],
    referencia: 'Zanarini et al. (2003)',
  },
  DARK_TRIAD: {
    id: 'DARK_TRIAD', nombre: 'Dark Triad – Dirty Dozen', descripcion: 'Evalúa narcisismo, maquiavelismo y psicopatía en 12 ítems.',
    icono: '🃏', color: '#78909C', totalItems: 12, tiempoMinutos: 5, responseType: 'likert_1_5',
    opciones: [
      { valor: 1, etiqueta: 'Totalmente en desacuerdo' }, { valor: 2, etiqueta: 'En desacuerdo' },
      { valor: 3, etiqueta: 'Neutral' }, { valor: 4, etiqueta: 'De acuerdo' }, { valor: 5, etiqueta: 'Totalmente de acuerdo' },
    ],
    tagsMenters: ['personalidad', 'psicologia_clinica', 'terapia'], planesMenter: ['master'],
    referencia: 'Jonason & Webster (2010)',
  },
  PID_5: {
    id: 'PID_5', nombre: 'Inventario de Personalidad DSM-5 (PID-5-BF)', descripcion: '25 ítems para evaluar los 5 dominios de personalidad del DSM-5.',
    icono: '📊', color: '#66BB6A', totalItems: 25, tiempoMinutos: 10, responseType: 'likert_0_3',
    opciones: [
      { valor: 0, etiqueta: 'Falso o muy raramente verdadero' }, { valor: 1, etiqueta: 'A veces verdadero' },
      { valor: 2, etiqueta: 'A menudo verdadero' }, { valor: 3, etiqueta: 'Muy verdadero o siempre verdadero' },
    ],
    tagsMenters: ['personalidad', 'dsm5', 'psicologia_clinica'], planesMenter: ['master', 'premium'],
    referencia: 'Krueger et al. (2012)',
  },
};

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────

export type Responses = Record<number, number>;

export interface DimensionScore { dimension: string; score: number; label?: string; }
export interface AssessmentResult {
  instrumentId: InstrumentId;
  puntuacionBruta?: number;
  screeningPositivo?: boolean;
  severidadLabel?: string;
  dimensiones: DimensionScore[];
  tagsMenters: string[];
  interpretacion: string;
  nota?: string;
}

const mean = (vals: number[]) => vals.reduce((a, v) => a + v, 0) / vals.length;
const inv6 = (v: number) => 6 - v;
const getSeverity = (pb: number, rangos: { label: string; min: number; max: number }[]) =>
  rangos.find(r => pb >= r.min && pb <= r.max)?.label ?? '';

const NPI_KEY: Record<number, 'A' | 'B'> = {
  1:'A',2:'A',3:'A',4:'A',5:'A',6:'B',7:'B',8:'A',9:'B',10:'A',
  11:'A',12:'B',13:'A',14:'A',15:'A',16:'A',17:'B',18:'A',19:'A',20:'A',
  21:'A',22:'B',23:'A',24:'B',25:'A',26:'B',27:'A',28:'A',29:'A',30:'A',
  31:'A',32:'B',33:'A',34:'B',35:'A',36:'B',37:'A',38:'A',39:'A',40:'B',
};

export function scoreInstrument(id: InstrumentId, responses: Responses): AssessmentResult {
  switch (id) {
    case 'BDI_II': {
      const pb = Object.values(responses).reduce((a, v) => a + v, 0);
      const sev = getSeverity(pb, [{ label:'Mínima',min:0,max:13 },{ label:'Leve',min:14,max:19 },{ label:'Moderada',min:20,max:28 },{ label:'Severa',min:29,max:63 }]);
      return { instrumentId: id, puntuacionBruta: pb, severidadLabel: sev,
        dimensiones: [
          { dimension: 'Cognitivo-Afectivo', score: [1,2,3,4,5,6,7,8,9,10,11,12,13,14].reduce((a,i)=>a+(responses[i]??0),0) },
          { dimension: 'Somático', score: [15,16,17,18,19,20,21].reduce((a,i)=>a+(responses[i]??0),0) },
        ],
        tagsMenters: INSTRUMENTS.BDI_II.tagsMenters,
        interpretacion: `Depresión ${sev} — Puntuación: ${pb}/63` };
    }
    case 'BAI': {
      const pb = Object.values(responses).reduce((a, v) => a + v, 0);
      const sev = getSeverity(pb, [{ label:'Mínima',min:0,max:7 },{ label:'Leve',min:8,max:15 },{ label:'Moderada',min:16,max:25 },{ label:'Severa',min:26,max:63 }]);
      return { instrumentId: id, puntuacionBruta: pb, severidadLabel: sev,
        dimensiones: [
          { dimension: 'Subjetivo-Cognitivo', score: [1,3,6,7,8,12,19].reduce((a,i)=>a+(responses[i]??0),0) },
          { dimension: 'Neurofisiológico', score: [2,4,5,9,10,11,13,14,15,16,17,18,20,21].reduce((a,i)=>a+(responses[i]??0),0) },
        ],
        tagsMenters: INSTRUMENTS.BAI.tagsMenters,
        interpretacion: `Ansiedad ${sev} — Puntuación: ${pb}/63` };
    }
    case 'MDQ': {
      const sumA = [1,2,3,4,5,6,7,8,9,10,11,12,13].reduce((a,i)=>a+(responses[i]??0),0);
      const pos = sumA >= 7 && (responses[14]??0) === 1 && (responses[15]??0) >= 2;
      return { instrumentId: id, puntuacionBruta: sumA, screeningPositivo: pos,
        severidadLabel: pos ? 'Positivo' : 'Negativo',
        dimensiones: [
          { dimension: 'Síntomas Maníacos (Parte A)', score: sumA },
          { dimension: 'Simultaneidad (Parte B)', score: responses[14]??0 },
          { dimension: 'Deterioro Funcional (Parte C)', score: responses[15]??0 },
        ],
        tagsMenters: INSTRUMENTS.MDQ.tagsMenters,
        interpretacion: pos ? 'Screening positivo — posible Trastorno Bipolar' : 'Screening negativo',
        nota: 'Este instrumento es de screening, no diagnóstico.' };
    }
    case 'ASRS_v1_1': {
      const umbral: Record<number,number> = {1:3,2:3,3:3,4:3,5:2,6:2};
      const shadedCount = [1,2,3,4,5,6].filter(i=>(responses[i]??0)>=umbral[i]).length;
      const scoreB = [7,8,9,10,11,12,13,14,15,16,17,18].reduce((a,i)=>a+(responses[i]??0),0);
      const pos = shadedCount >= 4;
      return { instrumentId: id, puntuacionBruta: shadedCount, screeningPositivo: pos,
        severidadLabel: pos ? 'Positivo' : 'Negativo',
        dimensiones: [
          { dimension: 'Parte A — Ítems sombreados', score: shadedCount },
          { dimension: 'Parte B — Score complementario', score: scoreB },
        ],
        tagsMenters: INSTRUMENTS.ASRS_v1_1.tagsMenters,
        interpretacion: pos ? `Screening positivo para TDAH (${shadedCount}/6 ítems en Parte A)` : `Screening negativo (${shadedCount}/6 ítems en Parte A)` };
    }
    case 'BIG_FIVE': {
      const d = (items: number[]) => items.map(i=>responses[i]??3);
      const r = (items: number[]) => items.map(i=>inv6(responses[i]??3));
      const getLevel = (s: number) => s < 2.5 ? 'Bajo' : s < 3.5 ? 'Medio' : 'Alto';
      const dims = {
        'Extraversión':     mean([...d([1,11,16,26,36]), ...r([6,21,31])]),
        'Amabilidad':       mean([...d([7,17,22,32,42]), ...r([2,12,27,37])]),
        'Responsabilidad':  mean([...d([3,13,28,33,38]), ...r([8,18,23,43])]),
        'Neuroticismo':     mean([...d([4,14,19,29,39]), ...r([9,24,34,44])]),
        'Apertura':         mean([...d([5,10,15,20,25,30,40,44]), ...r([35,41])]),
      };
      return { instrumentId: id,
        dimensiones: Object.entries(dims).map(([k,v]) => ({ dimension:k, score:Math.round(v*100)/100, label:getLevel(v) })),
        tagsMenters: INSTRUMENTS.BIG_FIVE.tagsMenters,
        interpretacion: 'Perfil OCEAN calculado — ver dimensiones' };
    }
    case 'NPI_40': {
      const pb = Object.values(responses).reduce((a,v)=>a+v,0);
      const sev = getSeverity(pb, [{ label:'Bajo',min:0,max:11 },{ label:'Promedio',min:12,max:15 },{ label:'Elevado',min:16,max:22 },{ label:'Muy elevado',min:23,max:40 }]);
      const subs: Record<string,number[]> = { Autoridad:[1,8,10,11,12,32,33,36], Exhibicionismo:[2,3,7,20,28,30,38], Superioridad:[4,9,26,37,40], Derechos:[5,14,18,24,25], Explotación:[6,13,17,22,31], Autosuficiencia:[15,16,23,29,35], Vanidad:[19,21,27,34,39] };
      return { instrumentId: id, puntuacionBruta: pb, severidadLabel: sev,
        dimensiones: Object.entries(subs).map(([k,items])=>({ dimension:k, score:items.reduce((a,i)=>a+(responses[i]??0),0) })),
        tagsMenters: INSTRUMENTS.NPI_40.tagsMenters,
        interpretacion: `Narcisismo ${sev} — Puntuación: ${pb}/40` };
    }
    case 'MSI_BPD': {
      const pb = Object.values(responses).reduce((a,v)=>a+v,0);
      const pos = pb >= 7;
      return { instrumentId: id, puntuacionBruta: pb, screeningPositivo: pos,
        severidadLabel: pos ? 'Positivo' : 'Negativo',
        dimensiones: [{ dimension: 'Criterios BPD', score: pb }],
        tagsMenters: INSTRUMENTS.MSI_BPD.tagsMenters,
        interpretacion: pos ? `Screening positivo para BPD (${pb}/10 ≥ 7)` : `Screening negativo (${pb}/10)`,
        nota: 'Requiere confirmación diagnóstica por profesional.' };
    }
    case 'DARK_TRIAD': {
      const getLevel = (s: number) => s < 2.4 ? 'Bajo' : s < 3.7 ? 'Medio' : 'Alto';
      const narc = mean([1,2,3,4].map(i=>responses[i]??1));
      const maq  = mean([5,6,7,8].map(i=>responses[i]??1));
      const psic = mean([9,10,11,12].map(i=>responses[i]??1));
      return { instrumentId: id,
        dimensiones: [
          { dimension:'Narcisismo',    score:Math.round(narc*100)/100, label:getLevel(narc) },
          { dimension:'Maquiavelismo', score:Math.round(maq*100)/100,  label:getLevel(maq) },
          { dimension:'Psicopatía',    score:Math.round(psic*100)/100, label:getLevel(psic) },
        ],
        tagsMenters: INSTRUMENTS.DARK_TRIAD.tagsMenters,
        interpretacion: 'Perfil Dark Triad calculado — ver dimensiones' };
    }
    case 'PID_5': {
      const getLevel = (s: number) => s < 1.0 ? 'Bajo' : s < 2.0 ? 'Moderado' : 'Elevado';
      const doms = {
        'Afecto Negativo':  mean([8,9,10,11,12].map(i=>responses[i]??0)),
        'Distanciamiento':  mean([13,14,15,16,17].map(i=>responses[i]??0)),
        'Antagonismo':      mean([18,19,20,21,22].map(i=>responses[i]??0)),
        'Desinhibición':    mean([1,2,3,4,5].map(i=>responses[i]??0)),
        'Psicoticismo':     mean([23,24,25].map(i=>responses[i]??0)),
      };
      return { instrumentId: id,
        dimensiones: Object.entries(doms).map(([k,v])=>({ dimension:k, score:Math.round(v*100)/100, label:getLevel(v) })),
        tagsMenters: INSTRUMENTS.PID_5.tagsMenters,
        interpretacion: 'Perfil PID-5 (DSM-5) calculado — ver 5 dominios' };
    }
    default:
      throw new Error(`Instrumento desconocido: ${id}`);
  }
}

// Helper NPI-40: convierte { item: 'A' | 'B' } → { item: 0 | 1 }
export function parseNPIResponses(raw: Record<number, 'A' | 'B'>): Responses {
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [Number(k), v === NPI_KEY[Number(k)] ? 1 : 0]));
}