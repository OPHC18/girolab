import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.google.com https://www.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://analytics.tiktok.com https://snap.licdn.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://supabase.co https://lh3.googleusercontent.com https://img.youtube.com https://i.ytimg.com https://px.ads.linkedin.com https://www.facebook.com",
      "media-src 'self' https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.brevo.com https://www.google.com https://lottie.host https://cdn.jsdelivr.net https://unpkg.com https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://analytics.tiktok.com https://snap.licdn.com https://px.ads.linkedin.com https://www.facebook.com https://connect.facebook.net",
      "worker-src 'self' blob:",
      "frame-src https://www.google.com https://js.mercadopago.com https://www.mercadopago.com https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,

  // Bake the deploy SHA into the client bundle for update detection
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now()}`,
  },

  // Turbopack (default en Next 16) — WASM soportado nativamente, sin config extra
  turbopack: {},

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
