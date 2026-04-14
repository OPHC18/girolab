// src/lib/brevo-contacts.ts
// Sincroniza usuarios de Giro Lab como contactos en Brevo con atributos de segmentación.
//
// Atributos que debes crear en Brevo antes de usar esto:
// Dashboard Brevo → Contacts → Settings → Contact attributes → Add attribute:
//   PERFIL        → Texto   (persona | menter | empresa)
//   PAIS          → Texto
//   FECHA_NAC     → Fecha   (para segmentar por rango de edad y cumpleaños)
//   ESPECIALIDADES → Texto  (lista separada por comas, solo para Menters)
//   PLAN          → Texto   (free | starter | premium | master, solo para Menters)

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const CONTACTS_URL  = 'https://api.brevo.com/v3/contacts'

export interface BrevoContactData {
  email:         string
  nombre?:       string
  apellidos?:    string
  perfil?:       'persona' | 'menter' | 'empresa'
  pais?:         string
  fechaNac?:     string        // formato ISO: 'YYYY-MM-DD'
  especialidades?: string[]   // solo Menters
  plan?:         string        // solo Menters
}

/**
 * Crea o actualiza un contacto en Brevo con los atributos de segmentación.
 * Usa updateEnabled: true para no duplicar si ya existe.
 */
export async function syncBrevoContact(data: BrevoContactData): Promise<void> {
  if (!BREVO_API_KEY) return

  const attributes: Record<string, string> = {}

  if (data.nombre || data.apellidos) {
    if (data.nombre)    attributes.FIRSTNAME = data.nombre
    if (data.apellidos) attributes.LASTNAME  = data.apellidos
  }
  if (data.perfil)         attributes.PERFIL         = data.perfil
  if (data.pais)           attributes.PAIS            = data.pais
  if (data.fechaNac)       attributes.FECHA_NAC       = data.fechaNac
  if (data.especialidades?.length) {
    attributes.ESPECIALIDADES = data.especialidades.join(', ')
  }
  if (data.plan)           attributes.PLAN            = data.plan

  try {
    await fetch(CONTACTS_URL, {
      method: 'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:         data.email,
        updateEnabled: true,
        attributes,
      }),
    })
  } catch (err) {
    // No crítico — no interrumpe el flujo principal
    console.error('[brevo-contacts] sync error:', err)
  }
}
