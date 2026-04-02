// src/lib/assessments/instruments_empresa.ts
// Extensión de instruments.ts para el módulo Empresa
// DISC + Test de Integridad HEXACO-HH

export type EmpresaInstrumentId = 'DISC' | 'HEXACO_HH';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE INSTRUMENTOS
// ─────────────────────────────────────────────────────────────────────────────

export const EMPRESA_INSTRUMENTS = {
  DISC: {
    id: 'DISC' as EmpresaInstrumentId,
    nombre: 'DISC – Perfil de Comportamiento Laboral',
    descripcion: 'Evalúa los 4 factores de comportamiento: Decisión, Influencia, Serenidad y Cumplimiento. Genera Perfil Natural y Perfil Adaptado.',
    icono: '🎯',
    color: '#1565C0',
    totalItems: 24,        // 24 grupos × 4 adjetivos = 96 respuestas
    tiempoMinutos: 15,
    responseType: 'disc_forced_choice' as const,
    tagsMenters: ['disc', 'seleccion_talento', 'liderazgo', 'equipos'],
    planesMenter: ['master', 'premium'] as ('master' | 'premium')[],
    soloEmpresas: true,
    referencia: 'Marston (1928) – adaptación psicométrica estándar',
  },
  HEXACO_HH: {
    id: 'HEXACO_HH' as EmpresaInstrumentId,
    nombre: 'Test de Integridad y Ética Laboral (HEXACO-HH)',
    descripcion: 'Mide Honestidad-Humildad en 4 dimensiones: Sinceridad, Justeza, Evitación de la Codicia y Modestia. Incluye algoritmo de Red Flags.',
    icono: '🛡️',
    color: '#2E7D32',
    totalItems: 24,         // 6 ítems × 4 dimensiones
    tiempoMinutos: 10,
    responseType: 'likert_1_5' as const,
    opciones: [
      { valor: 1, etiqueta: 'Totalmente en desacuerdo' },
      { valor: 2, etiqueta: 'En desacuerdo' },
      { valor: 3, etiqueta: 'Neutral' },
      { valor: 4, etiqueta: 'De acuerdo' },
      { valor: 5, etiqueta: 'Totalmente de acuerdo' },
    ],
    tagsMenters: ['integridad', 'seleccion_talento', 'etica_laboral', 'rrhh'],
    planesMenter: ['master', 'premium'] as ('master' | 'premium')[],
    soloEmpresas: true,
    referencia: 'Ashton & Lee (2007) – HEXACO Personality Inventory',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DISC – ESTRUCTURA DE ÍTEMS
// ─────────────────────────────────────────────────────────────────────────────
// Cada grupo tiene 4 adjetivos. El evaluado marca:
//   "M" (Más parecido a mí)  → +1 al vector correspondiente
//   "L" (Menos parecido a mí) → -1 al vector correspondiente
//   Los dos adjetivos restantes = 0
//
// Cada adjetivo pertenece a uno de los 4 factores: D | I | S | C
// El sistema produce PERFIL NATURAL (respuesta espontánea "Menos") 
// y PERFIL ADAPTADO (respuesta instrumental "Más")

export interface DISCItem {
  grupo: number;
  adjetivos: { texto: string; factor: 'D' | 'I' | 'S' | 'C' }[];
}

export const DISC_ITEMS: DISCItem[] = [
  { grupo:  1, adjetivos: [{ texto:'Decisivo',      factor:'D' },{ texto:'Entusiasta',   factor:'I' },{ texto:'Tranquilo',    factor:'S' },{ texto:'Cuidadoso',    factor:'C' }] },
  { grupo:  2, adjetivos: [{ texto:'Dominante',     factor:'D' },{ texto:'Convincente',  factor:'I' },{ texto:'Paciente',     factor:'S' },{ texto:'Preciso',      factor:'C' }] },
  { grupo:  3, adjetivos: [{ texto:'Directo',       factor:'D' },{ texto:'Optimista',    factor:'I' },{ texto:'Leal',         factor:'S' },{ texto:'Sistemático',  factor:'C' }] },
  { grupo:  4, adjetivos: [{ texto:'Retador',       factor:'D' },{ texto:'Sociable',     factor:'I' },{ texto:'Receptivo',    factor:'S' },{ texto:'Analítico',    factor:'C' }] },
  { grupo:  5, adjetivos: [{ texto:'Arriesgado',    factor:'D' },{ texto:'Motivador',    factor:'I' },{ texto:'Constante',    factor:'S' },{ texto:'Detallista',   factor:'C' }] },
  { grupo:  6, adjetivos: [{ texto:'Ambicioso',     factor:'D' },{ texto:'Expresivo',    factor:'I' },{ texto:'Colaborador',  factor:'S' },{ texto:'Exacto',       factor:'C' }] },
  { grupo:  7, adjetivos: [{ texto:'Competitivo',   factor:'D' },{ texto:'Simpático',    factor:'I' },{ texto:'Apacible',     factor:'S' },{ texto:'Reservado',    factor:'C' }] },
  { grupo:  8, adjetivos: [{ texto:'Exigente',      factor:'D' },{ texto:'Persuasivo',   factor:'I' },{ texto:'Estable',      factor:'S' },{ texto:'Perfeccionista',factor:'C' }] },
  { grupo:  9, adjetivos: [{ texto:'Firme',         factor:'D' },{ texto:'Comunicativo', factor:'I' },{ texto:'Tolerante',    factor:'S' },{ texto:'Metódico',     factor:'C' }] },
  { grupo: 10, adjetivos: [{ texto:'Emprendedor',   factor:'D' },{ texto:'Dinámico',     factor:'I' },{ texto:'Seguro',       factor:'S' },{ texto:'Disciplinado', factor:'C' }] },
  { grupo: 11, adjetivos: [{ texto:'Autosuficiente',factor:'D' },{ texto:'Popular',      factor:'I' },{ texto:'Servicial',    factor:'S' },{ texto:'Organizado',   factor:'C' }] },
  { grupo: 12, adjetivos: [{ texto:'Audaz',         factor:'D' },{ texto:'Abierto',      factor:'I' },{ texto:'Moderado',     factor:'S' },{ texto:'Cauteloso',    factor:'C' }] },
  { grupo: 13, adjetivos: [{ texto:'Independiente', factor:'D' },{ texto:'Animado',      factor:'I' },{ texto:'Deliberado',   factor:'S' },{ texto:'Obediente',    factor:'C' }] },
  { grupo: 14, adjetivos: [{ texto:'Insistente',    factor:'D' },{ texto:'Inspirador',   factor:'I' },{ texto:'Confiable',    factor:'S' },{ texto:'Cuidadoso',    factor:'C' }] },
  { grupo: 15, adjetivos: [{ texto:'Resuelto',      factor:'D' },{ texto:'Jovial',       factor:'I' },{ texto:'Armonioso',    factor:'S' },{ texto:'Riguroso',     factor:'C' }] },
  { grupo: 16, adjetivos: [{ texto:'Enérgico',      factor:'D' },{ texto:'Encantador',   factor:'I' },{ texto:'Agradable',    factor:'S' },{ texto:'Lógico',       factor:'C' }] },
  { grupo: 17, adjetivos: [{ texto:'Valiente',      factor:'D' },{ texto:'Empático',     factor:'I' },{ texto:'Pasivo',       factor:'S' },{ texto:'Reflexivo',    factor:'C' }] },
  { grupo: 18, adjetivos: [{ texto:'Contundente',   factor:'D' },{ texto:'Promotor',     factor:'I' },{ texto:'Estable',      factor:'S' },{ texto:'Formal',       factor:'C' }] },
  { grupo: 19, adjetivos: [{ texto:'Rápido',        factor:'D' },{ texto:'Creativo',     factor:'I' },{ texto:'Calmado',      factor:'S' },{ texto:'Preciso',      factor:'C' }] },
  { grupo: 20, adjetivos: [{ texto:'Poderoso',      factor:'D' },{ texto:'Espontáneo',   factor:'I' },{ texto:'Gentil',       factor:'S' },{ texto:'Convencional', factor:'C' }] },
  { grupo: 21, adjetivos: [{ texto:'Franco',        factor:'D' },{ texto:'Generoso',     factor:'I' },{ texto:'Comprensivo',  factor:'S' },{ texto:'Meticuloso',   factor:'C' }] },
  { grupo: 22, adjetivos: [{ texto:'Asertivo',      factor:'D' },{ texto:'Sociable',     factor:'I' },{ texto:'Modesto',      factor:'S' },{ texto:'Técnico',      factor:'C' }] },
  { grupo: 23, adjetivos: [{ texto:'Determinado',   factor:'D' },{ texto:'Influyente',   factor:'I' },{ texto:'Fiel',         factor:'S' },{ texto:'Estructurado', factor:'C' }] },
  { grupo: 24, adjetivos: [{ texto:'Pionero',       factor:'D' },{ texto:'Vivaz',        factor:'I' },{ texto:'Considerado',  factor:'S' },{ texto:'Ordenado',     factor:'C' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// DISC – LÓGICA DE RESPUESTA
// ─────────────────────────────────────────────────────────────────────────────
// Por cada grupo, el evaluado elige:
//   masIndex: índice (0-3) del adjetivo "Más parecido"
//   menosIndex: índice (0-3) del adjetivo "Menos parecido"

export interface DISCGroupResponse {
  grupo: number;
  masIndex: number;    // 0-3
  menosIndex: number;  // 0-3
}

export interface DISCVector { D: number; I: number; S: number; C: number; }

export interface DISCResult {
  instrumentId: 'DISC';
  // Perfil Natural = acumulado de "Menos" (comportamiento bajo presión, instintivo)
  perfilNatural: DISCVector;
  // Perfil Adaptado = acumulado de "Más" (comportamiento consciente, instrumental)
  perfilAdaptado: DISCVector;
  // Perfil de Trabajo = Natural + Adaptado (perfil mixto)
  perfilTrabajo: DISCVector;
  // Percentiles (0-100) calculados sobre baremos normativos estándar
  percentiles: {
    natural: DISCVector;
    adaptado: DISCVector;
  };
  // Factor dominante en cada perfil
  factorDominanteNatural: 'D' | 'I' | 'S' | 'C';
  factorDominanteAdaptado: 'D' | 'I' | 'S' | 'C';
  // Tipo de perfil combinado (ej: "DI", "SC", "C")
  perfilCombinado: string;
  interpretacion: string;
  tagsMenters: string[];
}

// Baremos normativos (puntuación directa → percentil)
// Basados en muestras de referencia de población laboral hispanohablante
// Los rangos directos van de -24 a +24 por factor
const DISC_BAREMOS: Record<keyof DISCVector, { score: number; percentil: number }[]> = {
  D: [
    { score:-12, percentil:5  },{ score:-8, percentil:10 },{ score:-4, percentil:20 },
    { score:0,   percentil:35 },{ score:4,  percentil:50 },{ score:8,  percentil:65 },
    { score:12,  percentil:80 },{ score:16, percentil:90 },{ score:20, percentil:95 },{ score:24, percentil:99 },
  ],
  I: [
    { score:-12, percentil:5  },{ score:-8, percentil:10 },{ score:-4, percentil:20 },
    { score:0,   percentil:30 },{ score:4,  percentil:50 },{ score:8,  percentil:68 },
    { score:12,  percentil:82 },{ score:16, percentil:92 },{ score:20, percentil:97 },{ score:24, percentil:99 },
  ],
  S: [
    { score:-12, percentil:3  },{ score:-8, percentil:8  },{ score:-4, percentil:18 },
    { score:0,   percentil:32 },{ score:4,  percentil:52 },{ score:8,  percentil:70 },
    { score:12,  percentil:83 },{ score:16, percentil:92 },{ score:20, percentil:97 },{ score:24, percentil:99 },
  ],
  C: [
    { score:-12, percentil:4  },{ score:-8, percentil:9  },{ score:-4, percentil:19 },
    { score:0,   percentil:33 },{ score:4,  percentil:51 },{ score:8,  percentil:67 },
    { score:12,  percentil:81 },{ score:16, percentil:91 },{ score:20, percentil:96 },{ score:24, percentil:99 },
  ],
};

function interpolatePercentil(factor: keyof DISCVector, score: number): number {
  const baremo = DISC_BAREMOS[factor];
  if (score <= baremo[0].score) return baremo[0].percentil;
  if (score >= baremo[baremo.length - 1].score) return baremo[baremo.length - 1].percentil;
  for (let i = 0; i < baremo.length - 1; i++) {
    const lo = baremo[i], hi = baremo[i + 1];
    if (score >= lo.score && score <= hi.score) {
      const t = (score - lo.score) / (hi.score - lo.score);
      return Math.round(lo.percentil + t * (hi.percentil - lo.percentil));
    }
  }
  return 50;
}

function dominantFactor(vec: DISCVector): 'D' | 'I' | 'S' | 'C' {
  return (Object.entries(vec) as [keyof DISCVector, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

function buildCombinedProfile(vec: DISCVector): string {
  const sorted = (Object.entries(vec) as [keyof DISCVector, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v >= 4); // Solo factores con puntuación significativa
  return sorted.slice(0, 2).map(([k]) => k).join('') || dominantFactor(vec);
}

const DISC_INTERPRETACIONES: Record<string, string> = {
  D:  'Perfil orientado a la acción y los resultados. Liderazgo directo, alta iniciativa.',
  I:  'Perfil orientado a las personas y la persuasión. Alta sociabilidad, energía positiva.',
  S:  'Perfil orientado a la estabilidad y el equipo. Alta lealtad, consistencia y soporte.',
  C:  'Perfil orientado a la calidad y el proceso. Alta precisión, análisis y cumplimiento.',
  DI: 'Líder inspirador. Combina decisión con influencia. Ideal para ventas y dirección.',
  DC: 'Líder técnico. Decisión con rigor analítico. Ideal para gestión y dirección técnica.',
  DS: 'Líder estabilizador. Decisión con empatía. Ideal para coordinación de equipos.',
  ID: 'Emprendedor social. Influencia con iniciativa. Ideal para relaciones públicas.',
  IS: 'Colaborador entusiasta. Influencia con calidez. Ideal para servicio al cliente.',
  IC: 'Comunicador preciso. Influencia con rigor. Ideal para consultoría y enseñanza.',
  SD: 'Ejecutor consistente. Estabilidad con decisión. Ideal para operaciones.',
  SI: 'Apoyo motivador. Estabilidad con carisma. Ideal para recursos humanos.',
  SC: 'Ejecutor meticuloso. Estabilidad con precisión. Ideal para calidad y cumplimiento.',
  CD: 'Analista decisivo. Precisión con liderazgo. Ideal para finanzas y auditoría.',
  CI: 'Experto comunicativo. Precisión con sociabilidad. Ideal para roles técnicos de cara al cliente.',
  CS: 'Especialista constante. Precisión con paciencia. Ideal para investigación y procesos.',
};

export function scoreDISC(groupResponses: DISCGroupResponse[]): DISCResult {
  const natural:  DISCVector = { D:0, I:0, S:0, C:0 };
  const adaptado: DISCVector = { D:0, I:0, S:0, C:0 };

  groupResponses.forEach(({ grupo, masIndex, menosIndex }) => {
    const item = DISC_ITEMS.find(it => it.grupo === grupo);
    if (!item) return;
    // "Más" alimenta el Perfil Adaptado (+1)
    adaptado[item.adjetivos[masIndex].factor]  += 1;
    adaptado[item.adjetivos[menosIndex].factor] -= 1;
    // "Menos" alimenta el Perfil Natural (-1 → natural = comportamiento instintivo)
    natural[item.adjetivos[menosIndex].factor] += 1;
    natural[item.adjetivos[masIndex].factor]   -= 1;
  });

  const trabajo: DISCVector = {
    D: adaptado.D + natural.D,
    I: adaptado.I + natural.I,
    S: adaptado.S + natural.S,
    C: adaptado.C + natural.C,
  };

  const factDomNat = dominantFactor(natural);
  const factDomAdp = dominantFactor(adaptado);
  const perfil = buildCombinedProfile(adaptado);

  return {
    instrumentId: 'DISC',
    perfilNatural: natural,
    perfilAdaptado: adaptado,
    perfilTrabajo: trabajo,
    percentiles: {
      natural:  { D: interpolatePercentil('D', natural.D),  I: interpolatePercentil('I', natural.I),  S: interpolatePercentil('S', natural.S),  C: interpolatePercentil('C', natural.C)  },
      adaptado: { D: interpolatePercentil('D', adaptado.D), I: interpolatePercentil('I', adaptado.I), S: interpolatePercentil('S', adaptado.S), C: interpolatePercentil('C', adaptado.C) },
    },
    factorDominanteNatural:  factDomNat,
    factorDominanteAdaptado: factDomAdp,
    perfilCombinado: perfil,
    interpretacion: DISC_INTERPRETACIONES[perfil] || DISC_INTERPRETACIONES[factDomAdp],
    tagsMenters: EMPRESA_INSTRUMENTS.DISC.tagsMenters,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HEXACO-HH – ESTRUCTURA DE ÍTEMS (24 ítems, 6 por dimensión)
// ─────────────────────────────────────────────────────────────────────────────

export interface HEXACOItem {
  numero: number;
  texto: string;
  dimension: 'SIN' | 'JUS' | 'COD' | 'MOD'; // Sinceridad | Justeza | Codicia | Modestia
  inverso: boolean; // true = ítems que detectan justificación del engaño
}

export const HEXACO_ITEMS: HEXACOItem[] = [
  // SINCERIDAD (SIN) – honestidad en expresión de intenciones y emociones
  { numero:1,  dimension:'SIN', inverso:false, texto:'Soy completamente honesto con las personas, incluso cuando no es lo que quieren escuchar.' },
  { numero:2,  dimension:'SIN', inverso:true,  texto:'Si pudiera obtener un beneficio sin que nadie se diera cuenta, lo haría sin dudarlo.' },
  { numero:3,  dimension:'SIN', inverso:false, texto:'Me siento incómodo cuando tengo que ocultar mis verdaderas intenciones.' },
  { numero:4,  dimension:'SIN', inverso:true,  texto:'Está bien exagerar un poco los logros propios para conseguir un trabajo.' },
  { numero:5,  dimension:'SIN', inverso:false, texto:'Digo lo que pienso aunque eso me perjudique.' },
  { numero:6,  dimension:'SIN', inverso:true,  texto:'En una negociación, la honestidad total no es siempre la mejor estrategia.' },

  // JUSTEZA (JUS) – rechazo a la deshonestidad y al engaño
  { numero:7,  dimension:'JUS', inverso:false, texto:'Me niego a participar en actividades ilegales, incluso si la recompensa es alta.' },
  { numero:8,  dimension:'JUS', inverso:true,  texto:'Si descubriera un error en mi favor, no lo reportaría si nadie lo sabe.' },
  { numero:9,  dimension:'JUS', inverso:false, texto:'Me resulta difícil engañar a alguien, aunque sea para su propio bien.' },
  { numero:10, dimension:'JUS', inverso:true,  texto:'A veces vale la pena mentir para evitar problemas en el trabajo.' },
  { numero:11, dimension:'JUS', inverso:false, texto:'Reportaría a un compañero que hace trampa, aunque sea mi amigo.' },
  { numero:12, dimension:'JUS', inverso:true,  texto:'Inflar gastos de trabajo es aceptable si la empresa no paga bien.' },

  // EVITACIÓN DE CODICIA (COD) – rechazo a la acumulación excesiva o desleal
  { numero:13, dimension:'COD', inverso:false, texto:'Prefiero ganar menos dinero con ética que más dinero de forma cuestionable.' },
  { numero:14, dimension:'COD', inverso:true,  texto:'Merece la pena hacer algo éticamente cuestionable si el beneficio económico es grande.' },
  { numero:15, dimension:'COD', inverso:false, texto:'No necesito más lujos de los que puedo costearme honestamente.' },
  { numero:16, dimension:'COD', inverso:true,  texto:'Es razonable usar recursos de la empresa para asuntos personales, siempre con moderación.' },
  { numero:17, dimension:'COD', inverso:false, texto:'El dinero no es razón suficiente para comprometer mis valores.' },
  { numero:18, dimension:'COD', inverso:true,  texto:'Si pudiera llevarme algo pequeño de la empresa sin que nadie lo notara, no vería el problema.' },

  // MODESTIA (MOD) – ausencia de arrogancia y sentido de superioridad
  { numero:19, dimension:'MOD', inverso:false, texto:'Reconozco fácilmente cuando me equivoco, incluso delante de los demás.' },
  { numero:20, dimension:'MOD', inverso:true,  texto:'Las reglas de la empresa aplican diferente para quienes son más capaces.' },
  { numero:21, dimension:'MOD', inverso:false, texto:'No me considero mejor que mis compañeros de trabajo.' },
  { numero:22, dimension:'MOD', inverso:true,  texto:'Hay personas que merecen tener privilegios que otros no.' },
  { numero:23, dimension:'MOD', inverso:false, texto:'Acepto bien las críticas aunque provengan de alguien con menos experiencia que yo.' },
  { numero:24, dimension:'MOD', inverso:true,  texto:'El éxito me da derecho a esperar más reconocimiento del que normalmente recibo.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HEXACO-HH – SCORING
// ─────────────────────────────────────────────────────────────────────────────

export type HEXACOResponses = Record<number, 1 | 2 | 3 | 4 | 5>;

export interface HEXACODimensionScore {
  dimension: 'Sinceridad' | 'Justeza' | 'Evitación de Codicia' | 'Modestia';
  codigo: 'SIN' | 'JUS' | 'COD' | 'MOD';
  score: number;          // Promedio 1.0 – 5.0
  redFlagCount: number;   // Cuántos ítems inversos tuvieron valor ≥ 4
  riesgo: 'Bajo' | 'Moderado' | 'Alto';
}

export interface HEXACOResult {
  instrumentId: 'HEXACO_HH';
  dimensiones: HEXACODimensionScore[];
  scoreTotal: number;               // Promedio global 1.0 – 5.0
  redFlagTotal: number;             // Total de red flags en todo el test
  nivelIntegridad: 'Alto' | 'Moderado' | 'Bajo' | 'Crítico';
  alertas: string[];                // Mensajes de alerta específicos
  recomendacionContratacion: 'Apto' | 'Revisar' | 'No recomendado';
  tagsMenters: string[];
}

const DIM_NAMES: Record<string, string> = {
  SIN: 'Sinceridad', JUS: 'Justeza', COD: 'Evitación de Codicia', MOD: 'Modestia',
};

export function scoreHEXACO(responses: HEXACOResponses): HEXACOResult {
  const dims = ['SIN', 'JUS', 'COD', 'MOD'] as const;
  const dimScores: HEXACODimensionScore[] = dims.map(dim => {
    const items = HEXACO_ITEMS.filter(it => it.dimension === dim);
    let sum = 0;
    let redFlagCount = 0;

    items.forEach(item => {
      const raw = responses[item.numero] ?? 3;
      // Invertir ítems inversos: 6 - valor
      const scored = item.inverso ? (6 - raw) : raw;
      sum += scored;
      // Red flag: ítem inverso con acuerdo alto (≥ 4 antes de invertir = justifica conducta)
      if (item.inverso && raw >= 4) redFlagCount++;
    });

    const avg = sum / items.length;
    const riesgo: HEXACODimensionScore['riesgo'] =
      avg >= 3.5 && redFlagCount === 0 ? 'Bajo' :
      avg >= 2.5 || redFlagCount <= 1  ? 'Moderado' : 'Alto';

    return {
      dimension: DIM_NAMES[dim] as any,
      codigo: dim,
      score: Math.round(avg * 100) / 100,
      redFlagCount,
      riesgo,
    };
  });

  const scoreTotal = Math.round((dimScores.reduce((a, d) => a + d.score, 0) / 4) * 100) / 100;
  const redFlagTotal = dimScores.reduce((a, d) => a + d.redFlagCount, 0);

  const nivelIntegridad: HEXACOResult['nivelIntegridad'] =
    redFlagTotal >= 5 ? 'Crítico' :
    redFlagTotal >= 3 || scoreTotal < 2.5 ? 'Bajo' :
    scoreTotal < 3.5 ? 'Moderado' : 'Alto';

  const recomendacion: HEXACOResult['recomendacionContratacion'] =
    nivelIntegridad === 'Crítico' ? 'No recomendado' :
    nivelIntegridad === 'Bajo'    ? 'Revisar' : 'Apto';

  // Alertas específicas
  const alertas: string[] = [];
  if (redFlagTotal >= 5)
    alertas.push('⚠️ CRÍTICO: El evaluado muestra un patrón consistente de justificación de conductas deshonestas.');
  dimScores.forEach(d => {
    if (d.redFlagCount >= 2)
      alertas.push(`🚩 Red flag en ${d.dimension}: ${d.redFlagCount} indicadores de riesgo detectados.`);
    if (d.score < 2.5)
      alertas.push(`⬇️ Puntuación baja en ${d.dimension} (${d.score.toFixed(1)}/5.0).`);
  });

  return {
    instrumentId: 'HEXACO_HH',
    dimensiones: dimScores,
    scoreTotal,
    redFlagTotal,
    nivelIntegridad,
    alertas,
    recomendacionContratacion: recomendacion,
    tagsMenters: EMPRESA_INSTRUMENTS.HEXACO_HH.tagsMenters,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB PROFILE MATCH – Fórmula de Compatibilidad
// ─────────────────────────────────────────────────────────────────────────────
// El Menter / Empresa define un "Perfil de Puesto" ideal con percentiles target.
// Se calcula la distancia euclidiana normalizada y se convierte a % de match.

export interface JobProfile {
  nombre: string;         // Ej: "Gerente Comercial"
  disc: Partial<DISCVector>;  // Percentiles target por factor (solo los relevantes)
  hexaco?: Partial<Record<'SIN' | 'JUS' | 'COD' | 'MOD', number>>; // Scores mínimos
  pesosDISC?: Partial<DISCVector>;  // Peso relativo de cada factor (default: 1.0)
  integridad_minima?: number;       // Score mínimo HEXACO total (ej: 3.5)
}

export function calcularMatch(
  discResult: DISCResult,
  hexacoResult: HEXACOResult | null,
  jobProfile: JobProfile
): {
  matchTotal: number;    // 0 – 100
  matchDISC: number;
  matchHEXACO: number | null;
  detalles: Record<string, number>;
  apto: boolean;
} {
  const factores: (keyof DISCVector)[] = ['D', 'I', 'S', 'C'];
  const pesos = jobProfile.pesosDISC || {};
  let sumDist = 0, sumPesos = 0;
  const detalles: Record<string, number> = {};

  factores.forEach(f => {
    if (jobProfile.disc[f] === undefined) return;
    const target = jobProfile.disc[f]!;
    const actual = discResult.percentiles.adaptado[f];
    const peso = pesos[f] ?? 1.0;
    const dist = Math.abs(target - actual);        // Distancia en percentiles (0–100)
    const contrib = Math.max(0, 100 - dist);        // Contribución al match (0–100)
    detalles[`DISC_${f}`] = Math.round(contrib);
    sumDist += contrib * peso;
    sumPesos += peso;
  });

  const matchDISC = sumPesos > 0 ? Math.round(sumDist / sumPesos) : 100;

  let matchHEXACO: number | null = null;
  if (hexacoResult && jobProfile.integridad_minima !== undefined) {
    const minScore = jobProfile.integridad_minima;
    const actual = hexacoResult.scoreTotal;
    // Match de integridad: si supera el mínimo = 100, si está por debajo penaliza proporcionalmente
    matchHEXACO = actual >= minScore
      ? 100
      : Math.round(Math.max(0, (actual / minScore) * 100));
    detalles['HEXACO_total'] = matchHEXACO;

    // Red flags anulan la aptitud independientemente del score
    if (hexacoResult.nivelIntegridad === 'Crítico') matchHEXACO = 0;
  }

  // Promedio ponderado: DISC 70% + HEXACO 30% (cuando ambos están disponibles)
  const matchTotal = matchHEXACO !== null
    ? Math.round(matchDISC * 0.7 + matchHEXACO * 0.3)
    : matchDISC;

  const apto = matchTotal >= 65
    && (hexacoResult?.recomendacionContratacion !== 'No recomendado')
    && (hexacoResult?.nivelIntegridad !== 'Crítico');

  return { matchTotal, matchDISC, matchHEXACO, detalles, apto };
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT JSON – Ejemplo de estructura de resultado
// ─────────────────────────────────────────────────────────────────────────────
/*
Ejemplo de resultado_json que viaja al backend (assessment_results.resultado_json):

DISC:
{
  "instrumentId": "DISC",
  "perfilCombinado": "DI",
  "factorDominanteNatural": "D",
  "factorDominanteAdaptado": "D",
  "perfilNatural":  { "D": 10, "I": 6,  "S": -8, "C": -8 },
  "perfilAdaptado": { "D": 12, "I": 8,  "S": -10, "C": -10 },
  "perfilTrabajo":  { "D": 22, "I": 14, "S": -18, "C": -18 },
  "percentiles": {
    "natural":  { "D": 80, "I": 72, "S": 18, "C": 15 },
    "adaptado": { "D": 85, "I": 78, "S": 12, "C": 10 }
  },
  "interpretacion": "Líder inspirador. Combina decisión con influencia. Ideal para ventas y dirección.",
  "tagsMenters": ["disc", "seleccion_talento", "liderazgo", "equipos"]
}

HEXACO:
{
  "instrumentId": "HEXACO_HH",
  "dimensiones": [
    { "dimension": "Sinceridad",           "codigo": "SIN", "score": 4.2, "redFlagCount": 0, "riesgo": "Bajo" },
    { "dimension": "Justeza",              "codigo": "JUS", "score": 3.8, "redFlagCount": 1, "riesgo": "Moderado" },
    { "dimension": "Evitación de Codicia", "codigo": "COD", "score": 4.5, "redFlagCount": 0, "riesgo": "Bajo" },
    { "dimension": "Modestia",             "codigo": "MOD", "score": 3.2, "redFlagCount": 0, "riesgo": "Moderado" }
  ],
  "scoreTotal": 3.93,
  "redFlagTotal": 1,
  "nivelIntegridad": "Alto",
  "alertas": [],
  "recomendacionContratacion": "Apto",
  "tagsMenters": ["integridad", "seleccion_talento", "etica_laboral", "rrhh"]
}

JOB PROFILE MATCH:
{
  "matchTotal": 82,
  "matchDISC": 86,
  "matchHEXACO": 100,
  "apto": true,
  "detalles": {
    "DISC_D": 90,
    "DISC_I": 85,
    "DISC_S": 78,
    "DISC_C": 70,
    "HEXACO_total": 100
  }
}
*/