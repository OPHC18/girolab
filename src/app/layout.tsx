import type { Metadata } from "next";
import "./globals.css";

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
  return (
    <html lang="es">
      <head>
        {siteKey && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
            async
            defer
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
