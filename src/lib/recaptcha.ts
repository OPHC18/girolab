// src/lib/recaptcha.ts
// Helper client-side para obtener y verificar tokens de reCAPTCHA v3

/**
 * Ejecuta reCAPTCHA v3 y devuelve el token.
 * Llama esto justo antes de hacer submit de un form.
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      resolve(null)
      return
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action })
        .then((token: string) => resolve(token))
        .catch(() => resolve(null))
    })
  })
}

/**
 * Verifica el token contra nuestra API.
 * Devuelve true si pasa, false si es sospechoso.
 */
export async function verifyRecaptcha(token: string, action: string): Promise<boolean> {
  try {
    const res = await fetch('/api/recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

// Extender tipado global para grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
