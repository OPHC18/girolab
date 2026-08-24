// src/app/dashboard/components/ResultadoImpresion.tsx
// Informe de un resultado para papel: no es la tarjeta resumen de la lista,
// sino el detalle completo — interpretación, todas las dimensiones con su
// nivel, notas y alertas — que es lo que la empresa archiva o entrega.
//
// Se dibuja solo mientras se imprime esa tarjeta (ver useImpresion), así que
// no compite con el diseño de pantalla.

'use client';

import { CATALOG } from '@/lib/assessments/catalog';

/** Tope de la escala de cada instrumento, para que la barra sea proporcional. */
export function maximoEscala(instrumentId: string, dim?: { score: number }): number {
  const porInstrumento: Record<string, number> = {
    BDI_II: 63, BAI: 63, MDQ: 13, ASRS_v1_1: 6,
    BIG_FIVE: 5, NPI_40: 40, MSI_BPD: 10, DARK_TRIAD: 5, PID_5: 3,
    BARON_ICE: 145, HEXACO_HH: 5, DISC: 100,
  };
  const max = porInstrumento[instrumentId];
  if (max) return max;
  // Instrumento desconocido: al menos que la barra nunca se desborde.
  return dim && dim.score > 100 ? dim.score : 100;
}

const COLOR_NIVEL: Record<string, string> = {
  Mínima: '#2E7D32', Leve: '#F9A825', Moderada: '#EF6C00', Severa: '#C62828',
  Positivo: '#C62828', Negativo: '#2E7D32',
  Bajo: '#2E7D32', Medio: '#F9A825', Promedio: '#F9A825',
  Moderado: '#EF6C00', Alto: '#EF6C00', Elevado: '#EF6C00', 'Muy elevado': '#C62828',
  Crítico: '#C62828',
  'Capacidad Muy Desarrollada': '#2E7D32',
  'Capacidad Adecuada':         '#1565C0',
  'Área de Oportunidad':        '#EF6C00',
};

interface DimensionImpresa {
  dimension: string;
  score: number;
  label?: string;
  riesgo?: string;
  redFlagCount?: number;
}

export interface DatosImpresion {
  nombre: string;
  email: string | null;
  instrumentId: string;
  instrumentoNombre: string;
  fecha: string;
  puntuacionBruta: number | null;
  severidadLabel: string | null;
  screeningPositivo: boolean | null;
  /** El AssessmentResult guardado; su forma cambia según el instrumento. */
  resultado: Record<string, unknown> | null;
  puesto?: string | null;
  matchTotal?: number | null;
  matchApto?: boolean | null;
}

export default function ResultadoImpresion({ datos }: { datos: DatosImpresion }) {
  const r     = datos.resultado ?? {};
  const ficha = CATALOG[datos.instrumentId];

  // El JSON guardado cambia de forma según el instrumento, así que cada campo
  // se lee con su comprobación en vez de confiar en un tipo único.
  const texto  = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null);
  const textos = (v: unknown) => (Array.isArray(v) ? v.filter(x => typeof x === 'string') as string[] : []);

  const dimensiones: DimensionImpresa[] = Array.isArray(r.dimensiones) ? r.dimensiones as DimensionImpresa[] : [];
  const alertas         = textos(r.alertas);
  const tags            = textos(r.tagsMenters);
  const interpretacion  = texto(r.interpretacion);
  const nota            = texto(r.nota);
  const nivelIntegridad = texto(r.nivelIntegridad);

  const fechaLarga = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={s.hoja}>
      {/* Cabecera */}
      <div style={s.cabecera}>
        <div>
          <h1 style={s.titulo}>Informe de evaluación</h1>
          <p style={s.subtitulo}>{datos.instrumentoNombre}</p>
        </div>
        <div style={s.marca}>
          <span style={s.marcaNombre}>Giro Lab</span>
          <span style={s.marcaFecha}>Impreso el {fechaLarga(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Datos de la persona */}
      <div style={s.fichaDatos}>
        <Dato etiqueta="Evaluado" valor={datos.nombre} />
        {datos.email && <Dato etiqueta="Correo" valor={datos.email} />}
        <Dato etiqueta="Fecha de aplicación" valor={fechaLarga(datos.fecha)} />
        {datos.puesto && <Dato etiqueta="Puesto" valor={datos.puesto} />}
      </div>

      {/* Resultado global */}
      <h2 style={s.seccion}>Resultado</h2>
      <div style={s.globalFila}>
        {datos.puntuacionBruta !== null && (
          <div style={s.globalCaja}>
            <span style={s.globalNum}>{datos.puntuacionBruta}</span>
            <span style={s.globalLabel}>puntuación bruta</span>
          </div>
        )}
        {datos.severidadLabel && (
          <div style={{ ...s.globalCaja, borderColor: COLOR_NIVEL[datos.severidadLabel] ?? '#999' }}>
            <span style={{ ...s.globalNum, fontSize: 20, color: COLOR_NIVEL[datos.severidadLabel] ?? '#333' }}>
              {datos.severidadLabel}
            </span>
            <span style={s.globalLabel}>nivel</span>
          </div>
        )}
        {datos.severidadLabel === null && datos.screeningPositivo !== null && (
          <div style={{ ...s.globalCaja, borderColor: datos.screeningPositivo ? '#C62828' : '#2E7D32' }}>
            <span style={{ ...s.globalNum, fontSize: 20, color: datos.screeningPositivo ? '#C62828' : '#2E7D32' }}>
              {datos.screeningPositivo ? 'Positivo' : 'Negativo'}
            </span>
            <span style={s.globalLabel}>screening</span>
          </div>
        )}
        {nivelIntegridad && (
          <div style={{ ...s.globalCaja, borderColor: COLOR_NIVEL[nivelIntegridad] ?? '#999' }}>
            <span style={{ ...s.globalNum, fontSize: 20 }}>{nivelIntegridad}</span>
            <span style={s.globalLabel}>integridad</span>
          </div>
        )}
        {typeof datos.matchTotal === 'number' && (
          <div style={s.globalCaja}>
            <span style={s.globalNum}>{datos.matchTotal}%</span>
            <span style={s.globalLabel}>match con el puesto</span>
          </div>
        )}
        {datos.matchApto !== null && datos.matchApto !== undefined && (
          <div style={{ ...s.globalCaja, borderColor: datos.matchApto ? '#2E7D32' : '#C62828' }}>
            <span style={{ ...s.globalNum, fontSize: 20, color: datos.matchApto ? '#2E7D32' : '#C62828' }}>
              {datos.matchApto ? 'Apto' : 'No recomendado'}
            </span>
            <span style={s.globalLabel}>recomendación</span>
          </div>
        )}
      </div>

      {/* Interpretación */}
      {interpretacion && (
        <>
          <h2 style={s.seccion}>Interpretación</h2>
          <p style={s.parrafo}>{interpretacion}</p>
        </>
      )}

      {nota && (
        <div style={s.nota}>
          <strong>Nota:</strong> {nota}
        </div>
      )}

      {/* Alertas (HEXACO y similares) */}
      {alertas.length > 0 && (
        <>
          <h2 style={s.seccion}>Alertas</h2>
          <ul style={s.lista}>
            {alertas.map((a, i) => <li key={i} style={s.listaItem}>{a}</li>)}
          </ul>
        </>
      )}

      {/* Dimensiones */}
      {dimensiones.length > 0 && (
        <>
          <h2 style={s.seccion}>Dimensiones</h2>
          <div>
            {dimensiones.map((dim, i) => {
              const max   = maximoEscala(datos.instrumentId, dim);
              const pct   = Math.max(0, Math.min((dim.score / max) * 100, 100));
              const nivel = dim.label ?? dim.riesgo;
              const color = (nivel && COLOR_NIVEL[nivel]) || '#421869';
              return (
                <div key={i} style={s.dimFila}>
                  <div style={s.dimCabecera}>
                    <span style={s.dimNombre}>{dim.dimension}</span>
                    <span style={s.dimDerecha}>
                      <span style={s.dimScore}>
                        {typeof dim.score === 'number'
                          ? dim.score.toFixed(dim.score < 10 ? 2 : 0)
                          : dim.score}
                        <span style={s.dimMax}> / {max}</span>
                      </span>
                      {nivel && <span style={{ ...s.dimNivel, color }}>{nivel}</span>}
                    </span>
                  </div>
                  <div style={s.barra}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                  </div>
                  {typeof dim.redFlagCount === 'number' && dim.redFlagCount > 0 && (
                    <span style={s.redFlag}>{dim.redFlagCount} indicador{dim.redFlagCount !== 1 ? 'es' : ''} de riesgo</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tags.length > 0 && (
        <p style={s.tags}><strong>Áreas señaladas:</strong> {tags.join(' · ')}</p>
      )}

      {/* Pie */}
      <div style={s.pie}>
        {ficha && (
          <p style={s.pieLinea}>
            <strong>{ficha.nombre}</strong> — {ficha.totalItems} ítems · ~{ficha.tiempoMinutos} min.
            {ficha.referencia ? ` ${ficha.referencia}` : ''}
          </p>
        )}
        <p style={s.pieLinea}>
          Documento confidencial. Un instrumento de tamizaje no constituye un diagnóstico:
          su lectura corresponde a un profesional calificado.
        </p>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div style={s.dato}>
      <span style={s.datoEtiqueta}>{etiqueta}</span>
      <span style={s.datoValor}>{valor}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  hoja:         { color:'#1a1a2e', fontSize:12.5, lineHeight:1.55, padding:'8mm 10mm',
                  boxSizing:'border-box', maxWidth:'100%', overflowWrap:'break-word' },
  cabecera:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:24, borderBottom:'2px solid #421869', paddingBottom:12, marginBottom:18 },
  titulo:       { fontSize:20, fontWeight:800, margin:'0 0 2px' },
  subtitulo:    { fontSize:13, color:'#555', margin:0 },
  marca:        { textAlign:'right', flexShrink:0 },
  marcaNombre:  { display:'block', fontSize:13, fontWeight:800, color:'#421869' },
  marcaFecha:   { display:'block', fontSize:10.5, color:'#777' },
  fichaDatos:   { display:'flex', flexWrap:'wrap', gap:'12px 32px', marginBottom:4 },
  dato:         { minWidth:150 },
  datoEtiqueta: { display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:0.6, color:'#888', fontWeight:700 },
  datoValor:    { display:'block', fontSize:13, fontWeight:600, overflowWrap:'anywhere' },
  seccion:      { fontSize:12, fontWeight:800, color:'#421869', textTransform:'uppercase', letterSpacing:0.8, margin:'22px 0 10px', borderBottom:'1px solid #e6e0ee', paddingBottom:5 },
  globalFila:   { display:'flex', flexWrap:'wrap', gap:12 },
  globalCaja:   { borderWidth:1, borderStyle:'solid', borderColor:'#ddd', borderRadius:8, padding:'10px 16px', minWidth:112 },
  globalNum:    { display:'block', fontSize:24, fontWeight:800, lineHeight:1.15 },
  globalLabel:  { display:'block', fontSize:10, color:'#777', textTransform:'uppercase', letterSpacing:0.5 },
  parrafo:      { margin:0, fontSize:12.5 },
  nota:         { background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:8, padding:'10px 14px', marginTop:12, fontSize:12 },
  lista:        { margin:'0', paddingLeft:18 },
  listaItem:    { fontSize:12, marginBottom:3 },
  dimFila:      { marginBottom:12, breakInside:'avoid' },
  dimCabecera:  { display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, marginBottom:3 },
  dimNombre:    { fontSize:12, fontWeight:600 },
  dimDerecha:   { display:'flex', alignItems:'baseline', gap:10, flexShrink:0 },
  dimScore:     { fontSize:12.5, fontWeight:800 },
  dimMax:       { fontSize:10.5, fontWeight:500, color:'#999' },
  dimNivel:     { fontSize:11, fontWeight:700 },
  barra:        { height:7, background:'#f0f0f0', borderRadius:3, overflow:'hidden' },
  redFlag:      { fontSize:10.5, color:'#C62828', fontWeight:600 },
  tags:         { fontSize:11.5, color:'#555', marginTop:18 },
  pie:          { marginTop:26, borderTop:'1px solid #e0e0e0', paddingTop:10 },
  pieLinea:     { fontSize:10, color:'#888', margin:'0 0 3px', lineHeight:1.5 },
};
