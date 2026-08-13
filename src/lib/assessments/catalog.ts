// src/lib/assessments/catalog.ts
// Catálogo unificado de instrumentos (clínicos + empresa).
// Única fuente de verdad para listar, validar y describir instrumentos:
// la usan el dashboard, las API routes de links y la página pública /e/[token].

import { INSTRUMENTS, type InstrumentId } from './instruments';
import { EMPRESA_INSTRUMENTS, type EmpresaInstrumentId } from './instruments_empresa';

export type AnyInstrumentId = InstrumentId | EmpresaInstrumentId;

export interface CatalogEntry {
  id: AnyInstrumentId;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  totalItems: number;
  tiempoMinutos: number;
  tags: string[];
  referencia: string;
  planesMenter: ('master' | 'premium')[];
  /** true = instrumento del módulo de selección (DISC, HEXACO) */
  soloEmpresas: boolean;
}

/** Forma común de INSTRUMENTS e EMPRESA_INSTRUMENTS. */
interface RawInstrument {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  totalItems: number;
  tiempoMinutos: number;
  referencia: string;
  tagsMenters?: string[];
  planesMenter?: ('master' | 'premium')[];
}

function toEntry(i: RawInstrument, soloEmpresas: boolean): CatalogEntry {
  return {
    id:            i.id as AnyInstrumentId,
    nombre:        i.nombre,
    descripcion:   i.descripcion,
    icono:         i.icono,
    color:         i.color,
    totalItems:    i.totalItems,
    tiempoMinutos: i.tiempoMinutos,
    tags:          i.tagsMenters ?? [],
    referencia:    i.referencia,
    planesMenter:  i.planesMenter ?? [],
    soloEmpresas,
  };
}

export const CATALOG: Record<string, CatalogEntry> = {
  ...Object.fromEntries(
    Object.values(INSTRUMENTS).map(i => [i.id, toEntry(i, false)])
  ),
  ...Object.fromEntries(
    Object.values(EMPRESA_INSTRUMENTS).map(i => [i.id, toEntry(i, true)])
  ),
};

/** Todos los instrumentos: primero los clínicos, luego los de selección. */
export const CATALOG_LIST: CatalogEntry[] = Object.values(CATALOG);

/** Instrumentos que ve un Menter (todos) o una Empresa (todos). */
export const CATALOG_MENTER:  CatalogEntry[] = CATALOG_LIST;
export const CATALOG_EMPRESA: CatalogEntry[] = CATALOG_LIST;

export function getInstrument(id: string): CatalogEntry | null {
  return CATALOG[id] ?? null;
}

export function isInstrumentId(id: unknown): id is AnyInstrumentId {
  return typeof id === 'string' && id in CATALOG;
}

/** Minutos estimados para rendir la lista completa de instrumentos. */
export function tiempoTotalMinutos(ids: string[]): number {
  return ids.reduce((total, id) => total + (CATALOG[id]?.tiempoMinutos ?? 0), 0);
}

/** Nombres legibles, para emails y pantallas de resumen. */
export function nombresInstrumentos(ids: string[]): string[] {
  return ids.map(id => CATALOG[id]?.nombre ?? id);
}
