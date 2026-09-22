// src/app/dashboard/components/FiltroResultados.tsx
// Filtro de selección múltiple por persona + botón de impresión.
// Lo comparten la pestaña Resultados del Menter y la de Empresa: sin filtro
// la lista se vuelve un listón imposible de revisar, y varias empresas siguen
// necesitando el resultado en papel.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface OpcionPersona {
  key: string;
  nombre: string;
  email: string | null;
  total: number;
}

/** Clave estable de una persona: el correo si lo hay, si no el nombre. */
export function clavePersona(nombre: string | null, email: string | null): string {
  return (email || nombre || 'anonimo').trim().toLowerCase();
}

/** Agrupa las filas de resultados en una opción por persona. */
export function opcionesPersonas<T>(
  filas: T[],
  datos: (fila: T) => { nombre: string | null; email: string | null },
): OpcionPersona[] {
  const mapa = new Map<string, OpcionPersona>();
  for (const fila of filas) {
    const { nombre, email } = datos(fila);
    const key = clavePersona(nombre, email);
    const previa = mapa.get(key);
    if (previa) previa.total += 1;
    else mapa.set(key, { key, nombre: nombre || 'Anónimo', email, total: 1 });
  }
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** id del contenedor que se manda a la impresora. */
export const PRINT_AREA_ID = 'girolab-print-area';

/**
 * Reglas de impresión: se oculta todo el dashboard salvo el área marcada.
 * `visibility` (y no `display`) para no romper el layout del árbol de arriba.
 */
export function EstilosImpresion() {
  return (
    <style>{`
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { margin: 10mm; }
        body { background: #fff !important; }
        body * { visibility: hidden !important; }
        #${PRINT_AREA_ID}, #${PRINT_AREA_ID} * { visibility: visible !important; }
        #${PRINT_AREA_ID} {
          position: absolute;
          left: 0; right: 0; top: 0;
          width: auto; max-width: 100%;
          box-sizing: border-box;
          margin: 0; padding: 0;
          overflow-wrap: break-word;
        }
        .no-print, .no-print * { display: none !important; visibility: hidden !important; }
        /* Solo sale el resultado elegido, y en papel es un documento, no un
           elemento de lista: se le quita el marco. Un informe largo (BarOn ICE,
           PID-5) debe poder seguir en la hoja siguiente, así que no se bloquea
           el corte aquí; lo que no se parte son las filas de dimensión. */
        #${PRINT_AREA_ID} .print-card:not(.print-target) { display: none !important; }
        #${PRINT_AREA_ID} .print-target {
          border: none !important; border-radius: 0 !important;
          padding: 0 !important; box-shadow: none !important;
          break-inside: auto; page-break-inside: auto;
        }
      }
    `}</style>
  );
}

/**
 * Manda a la impresora el resultado elegido. El contador hace que dos clics
 * seguidos al mismo botón vuelvan a disparar el efecto, y `afterprint` limpia
 * cuando se cierra el diálogo.
 */
export function useImpresion() {
  const [pendiente, setPendiente] = useState<{ id: string; n: number } | null>(null);
  const contador = useRef(0);

  useEffect(() => {
    if (!pendiente) return;
    const terminar = () => setPendiente(null);
    window.addEventListener('afterprint', terminar);
    // Un frame de margen para que la tarjeta ya esté marcada al abrir el diálogo.
    const raf = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('afterprint', terminar);
    };
  }, [pendiente]);

  return {
    /** id del resultado que se está imprimiendo; se dibuja como informe. */
    soloId:      pendiente?.id ?? null,
    imprimirUno: (id: string) => setPendiente({ id, n: ++contador.current }),
  };
}

/** Botón de imprimir de una tarjeta de resultado. */
export function BotonImprimirResultado({ onClick, color = '#421869' }: { onClick: () => void; color?: string }) {
  return (
    <button className="no-print" style={{ ...s.btnTarjeta, borderColor: color, color }} onClick={onClick}>
      Imprimir
    </button>
  );
}

interface Props {
  opciones: OpcionPersona[];
  /** Vacío = se muestran todas. */
  seleccion: string[];
  onSeleccion: (keys: string[]) => void;
  /** Cuántos resultados quedan visibles con el filtro puesto. */
  visibles: number;
  color?: string;
}

export default function FiltroResultados({
  opciones, seleccion, onSeleccion, visibles, color = '#421869',
}: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto]   = useState(false);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return opciones;
    return opciones.filter(o =>
      o.nombre.toLowerCase().includes(q) || (o.email || '').toLowerCase().includes(q));
  }, [opciones, busqueda]);

  const alternar = (key: string) =>
    onSeleccion(seleccion.includes(key) ? seleccion.filter(k => k !== key) : [...seleccion, key]);

  const resumen = seleccion.length === 0
    ? `Todas las personas (${opciones.length})`
    : `${seleccion.length} de ${opciones.length} personas`;

  return (
    <div className="no-print" style={s.caja}>
      <div style={s.header}>
        <button style={{ ...s.toggle, color }} onClick={() => setAbierto(a => !a)}>
          Filtrar por persona · <strong>{resumen}</strong> {abierto ? '▲' : '▼'}
        </button>
        <span style={s.contador}>{visibles} resultado{visibles !== 1 ? 's' : ''}</span>
      </div>

      {abierto && (
        <div style={s.panel}>
          <input
            style={s.input}
            placeholder="Buscar por nombre o correo"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)} />

          <div style={s.filaBotones}>
            <button style={{ ...s.btnSec, borderColor: color, color }}
              onClick={() => onSeleccion(filtradas.map(o => o.key))}>
              Seleccionar {busqueda ? 'lo encontrado' : 'todas'}
            </button>
            <button style={{ ...s.btnSec, borderColor: '#ddd', color: '#777' }}
              onClick={() => onSeleccion([])}>
              Limpiar filtro
            </button>
          </div>

          <div style={s.lista}>
            {filtradas.length === 0 ? (
              <p style={s.vacio}>Nadie coincide con la búsqueda.</p>
            ) : filtradas.map(o => (
              <label key={o.key} style={s.item}>
                <input type="checkbox" checked={seleccion.includes(o.key)} onChange={() => alternar(o.key)} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={s.itemNombre}>{o.nombre}</span>
                  {o.email && <span style={s.itemEmail}>{o.email}</span>}
                </span>
                <span style={s.itemTotal}>{o.total}</span>
              </label>
            ))}
          </div>
          <p style={s.hint}>Sin nadie marcado se muestran todas las personas.</p>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  caja:       { background:'#fafafa', borderRadius:12, padding:'10px 14px', marginBottom:16 },
  header:     { display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' },
  toggle:     { background:'none', border:'none', padding:0, fontSize:13, cursor:'pointer', fontWeight:600, textAlign:'left' },
  contador:   { fontSize:12, color:'#888' },
  btnTarjeta: { fontSize:12, padding:'6px 14px', borderRadius:8, borderWidth:1, borderStyle:'solid', background:'none', cursor:'pointer', fontWeight:600 },
  panel:      { marginTop:12 },
  input:      { width:'100%', padding:'8px 11px', borderRadius:8, border:'1px solid #ddd', fontSize:13, boxSizing:'border-box' },
  filaBotones:{ display:'flex', gap:8, margin:'10px 0' },
  btnSec:     { padding:'5px 12px', borderRadius:8, borderWidth:1, borderStyle:'solid', background:'#fff', fontWeight:600, fontSize:12, cursor:'pointer' },
  lista:      { maxHeight:220, overflowY:'auto', background:'#fff', borderRadius:8, border:'1px solid #eee' },
  item:       { display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderBottom:'1px solid #f6f6f6', cursor:'pointer', fontSize:13 },
  itemNombre: { display:'block', fontWeight:600, color:'#1a1a2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  itemEmail:  { display:'block', fontSize:11, color:'#999', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  itemTotal:  { fontSize:11.5, fontWeight:800, color:'#888', flexShrink:0 },
  vacio:      { fontSize:12.5, color:'#999', padding:'12px 14px', margin:0 },
  hint:       { fontSize:11, color:'#999', margin:'8px 0 0' },
};
