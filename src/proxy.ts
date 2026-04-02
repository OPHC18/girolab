import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { searchParams } = request.nextUrl;
 
  // Capturar UTMs en cookie si vienen en la URL
  const utmParams = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const utms: Record<string,string> = {};
  let hasUtm = false;
 
  utmParams.forEach(key => {
    const val = searchParams.get(key);
    if (val) { utms[key] = val; hasUtm = true; }
  });
 
  if (hasUtm) {
    // Cookie de 30 días — persiste a través del flujo de registro
    response.cookies.set('girolab_utm', JSON.stringify(utms), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
  }
 
  return response;
}
 
export const config = {
  matcher: ['/test/:path*', '/onboarding/:path*'],
};