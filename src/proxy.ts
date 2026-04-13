import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_EMAILS = [
  'omar@girolab.net',
  'admin@girolab.net',
  'luana@girolab.net',
  'daniela@girolab.net',
  'omarphc@hotmail.com',
]

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()

  // ── Proteger rutas de administrador ──────────────────────────────
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (toSet) => {
            toSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  }

  // ── Capturar UTMs en cookie si vienen en la URL ───────────────────
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  const utms: Record<string, string> = {}
  let hasUtm = false

  utmParams.forEach(key => {
    const val = searchParams.get(key)
    if (val) { utms[key] = val; hasUtm = true }
  })

  if (hasUtm) {
    response.cookies.set('girolab_utm', JSON.stringify(utms), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/test/:path*', '/onboarding/:path*'],
}
