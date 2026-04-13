/**
 * Sanitización HTML del lado del cliente para prevenir XSS.
 * Usar siempre antes de dangerouslySetInnerHTML con contenido de usuarios.
 */

let _purify: any = null

async function getPurify() {
  if (_purify) return _purify
  // isomorphic-dompurify funciona en cliente y servidor
  const mod = await import('isomorphic-dompurify')
  _purify = mod.default ?? mod
  return _purify
}

// Configuración permitida — solo tags seguros de rich text
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'blockquote', 'a', 'img', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style']

/**
 * Sanitiza HTML de manera asíncrona (para uso en server components o effects).
 */
export async function sanitizeHtml(dirty: string): Promise<string> {
  const DOMPurify = await getPurify()
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  })
}

/**
 * Sanitiza HTML de manera síncrona (solo para uso en cliente donde DOMPurify ya cargó).
 * Para componentes 'use client' — llamar en useEffect o evento, nunca en render inicial del servidor.
 */
export function sanitizeHtmlSync(dirty: string): string {
  if (typeof window === 'undefined') return '' // SSR: no renderizar contenido no sanitizado
  if (!_purify) {
    // Si no está cargado aún, cargar sincrónicamente via require (solo cliente)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      _purify = require('isomorphic-dompurify')
      if (_purify?.default) _purify = _purify.default
    } catch {
      return ''
    }
  }
  return _purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}
