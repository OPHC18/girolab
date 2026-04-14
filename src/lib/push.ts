/**
 * Envía una notificación push a un usuario.
 * Usar solo desde API routes (server-side).
 */
export async function sendPushNotification({
  user_id,
  title,
  body,
  url,
}: {
  user_id: string
  title: string
  body?: string
  url?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
  try {
    await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET!,
      },
      body: JSON.stringify({ user_id, title, body, url }),
    })
  } catch {
    // No bloquear el flujo principal si falla el push
  }
}
