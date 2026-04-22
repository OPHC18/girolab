import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['omar@girolab.net', 'admin@girolab.net', 'omarphc@hotmail.com', 'omarphc180726@gmail.com']
const BREVO_API = 'https://api.brevo.com/v3'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { contacts, listName } = await req.json()
  if (!contacts?.length) return NextResponse.json({ error: 'Sin contactos' }, { status: 400 })

  const apiKey = process.env.BREVO_API_KEY!

  // 1. Crear lista en Brevo si no existe
  const listRes = await fetch(`${BREVO_API}/contacts/lists`, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: listName || `Chat Soporte ${new Date().toLocaleDateString('es-PE')}`, folderId: 1 }),
  })
  const listData = await listRes.json()
  const listId = listData.id

  if (!listId) return NextResponse.json({ error: 'No se pudo crear la lista en Brevo', detail: listData }, { status: 500 })

  // 2. Importar contactos
  const importRes = await fetch(`${BREVO_API}/contacts/import`, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listIds: [listId],
      updateEnabled: true,
      jsonBody: contacts.map((c: any) => ({
        email: c.email,
        attributes: {
          FIRSTNAME: c.name || '',
          SMS: '',
          ORIGEN: 'Chat Soporte Giro Lab',
          FECHA_CONSULTA: c.fecha || '',
          REGISTRADO: c.is_registered ? 'Sí' : 'No',
        },
      })),
    }),
  })
  const importData = await importRes.json()

  return NextResponse.json({ ok: true, listId, listName: listData.name, imported: contacts.length, brevo: importData })
}
