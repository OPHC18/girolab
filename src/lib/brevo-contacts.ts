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
//
// Atributos adicionales para B2B (crear igual en Brevo):
//   B2B_EMPRESA   → Texto
//   B2B_CARGO     → Texto
//   B2B_SERVICIO  → Texto
//   B2B_PERSONAS  → Texto
//   B2B_CUANDO    → Texto
//   B2B_PRESUPUESTO → Texto

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

// ── B2B ───────────────────────────────────────────────────────────────────────

export interface BrevoB2bData {
  email:      string
  nombres:    string
  apellidos?: string
  empresa:    string
  cargo?:     string
  telefono?:  string
  servicio?:  string
  personas?:  string
  cuando?:    string
  presupuesto?: string
}

let _b2bListId: number | null = null

async function getOrCreateB2bList(): Promise<number | null> {
  if (_b2bListId) return _b2bListId
  try {
    const res  = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0', {
      headers: { 'api-key': BREVO_API_KEY },
    })
    const data = await res.json()
    const found = (data.lists as Array<{ id: number; name: string }> | undefined)
      ?.find(l => l.name === 'B2B Leads')
    if (found) { _b2bListId = found.id; return _b2bListId }

    const create = await fetch('https://api.brevo.com/v3/contacts/lists', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'B2B Leads', folderId: 1 }),
    })
    const created = await create.json()
    _b2bListId = created.id ?? null
    return _b2bListId
  } catch {
    return null
  }
}

export async function syncB2bContact(data: BrevoB2bData): Promise<void> {
  if (!BREVO_API_KEY) return
  try {
    const listId = await getOrCreateB2bList()
    const attributes: Record<string, string> = {
      FIRSTNAME: data.nombres,
      PERFIL:    'empresa',
    }
    if (data.apellidos)   attributes.LASTNAME       = data.apellidos
    if (data.empresa)     attributes.B2B_EMPRESA    = data.empresa
    if (data.cargo)       attributes.B2B_CARGO      = data.cargo
    if (data.servicio)    attributes.B2B_SERVICIO   = data.servicio
    if (data.personas)    attributes.B2B_PERSONAS   = data.personas
    if (data.cuando)      attributes.B2B_CUANDO     = data.cuando
    if (data.presupuesto) attributes.B2B_PRESUPUESTO = data.presupuesto

    const payload: Record<string, unknown> = {
      email: data.email,
      updateEnabled: true,
      attributes,
    }
    if (listId) payload.listIds = [listId]

    await fetch(CONTACTS_URL, {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[brevo-contacts] b2b sync error:', err)
  }
}
