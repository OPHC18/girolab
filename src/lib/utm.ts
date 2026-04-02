export interface UTMData {
  utm_source?:   string;
  utm_medium?:   string;
  utm_campaign?: string;
  utm_content?:  string;
  utm_term?:     string;
}
 
/** Lee UTMs desde la cookie (server) o localStorage (client) */
export function getStoredUTMs(): UTMData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = document.cookie.split(';').find(c => c.trim().startsWith('girolab_utm='));
    if (raw) {
      const val = decodeURIComponent(raw.split('=')[1]);
      return JSON.parse(val);
    }
  } catch (_) {}
  return {};
}
 
/** Lee UTMs desde la URL actual */
export function getURLUTMs(): UTMData {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const utms: UTMData = {};
  (['utm_source','utm_medium','utm_campaign','utm_content','utm_term'] as (keyof UTMData)[]).forEach(k => {
    const v = p.get(k);
    if (v) utms[k] = v;
  });
  return utms;
}
 
/** Combina UTMs de URL y cookie (URL tiene prioridad) */
export function resolveUTMs(): UTMData {
  return { ...getStoredUTMs(), ...getURLUTMs() };
}
 
/** Limpia la cookie de UTMs (después de atribuir la conversión) */
export function clearUTMCookie() {
  document.cookie = 'girolab_utm=; Max-Age=0; path=/';
}