import type { Metadata } from "next";
import "./globals.css";
import { UpdateBanner } from "@/components/UpdateBanner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Giro Lab | Bienestar y Desarrollo",
    template: "%s | Giro Lab",
  },
  description: "Acompañamos a personas y empresas a alcanzar objetivos reales mediante procesos estratégicos, humanos y medibles. Descubre una nueva forma de evolucionar.",
  keywords: ["bienestar", "desarrollo personal", "mentoría", "transformación organizacional", "menter", "coaching", "salud mental"],
  authors: [{ name: "Giro Lab", url: APP_URL }],
  creator: "Giro Lab",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: APP_URL,
    siteName: "Giro Lab",
    title: "Giro Lab: Donde el caos se vuelve evolución.",
    description: "Un espacio para agendar con expertos, aprender en comunidad y trackear tu avance emocional. Porque la salud mental también es ciencia y rebeldía.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 628,
        alt: "Giro Lab: Donde el caos se vuelve evolución.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Giro Lab: Donde el caos se vuelve evolución.",
    description: "Un espacio para agendar con expertos, aprender en comunidad y trackear tu avance emocional. Porque la salud mental también es ciencia y rebeldía.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  // const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WMXX32N3');` }} />
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GC03RS3H0W" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GC03RS3H0W');` }} />
        {/* TikTok Pixel */}
        <script dangerouslySetInnerHTML={{ __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('D7L27IJC77U471PGSQM0');ttq.page()}(window,document,'ttq');` }} />
        {/* LinkedIn Insight Tag */}
        <script dangerouslySetInnerHTML={{ __html: `_linkedin_partner_id="10004945";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);` }} />
        {/* Meta Pixel — descomentar cuando esté listo el Pixel ID */}
        {/* {metaPixelId && (
          <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');` }} />
        )} */}
        {siteKey && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
            async
            defer
          />
        )}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WMXX32N3" height="0" width="0" style="display:none;visibility:hidden"></iframe>` }} />
        {/* LinkedIn Insight Tag (noscript) */}
        <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=10004945&fmt=gif" />` }} />
        {/* Meta Pixel (noscript) — descomentar cuando esté listo el Pixel ID */}
        {/* {metaPixelId && (
          <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" />` }} />
        )} */}
        {children}
        <UpdateBanner />
      </body>
    </html>
  );
}
