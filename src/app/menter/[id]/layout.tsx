import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
const DEFAULT_OG = `${APP_URL}/og-image.jpg`

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabase
    .from("menter_public_profiles")
    .select("nombre, apellidos, especialidad, avatar_url")
    .eq("menter_id", id)
    .single();

  if (!data) {
    return {
      title: "Perfil de Menter | Giro Lab",
      description: "Conoce a nuestros Menters especializados en desarrollo humano y bienestar.",
      openGraph: { images: [{ url: DEFAULT_OG, width: 1200, height: 630 }] },
    };
  }

  const nombre = `${data.nombre} ${data.apellidos}`;
  const especialidad = data.especialidad || "Desarrollo Humano";
  const ogImage = data.avatar_url || DEFAULT_OG;

  return {
    title: `${nombre} – Especialista en ${especialidad}`,
    description: `Conoce a ${nombre}, especialista en ${especialidad}. Agenda sesiones y comienza tu proceso de transformación personal o profesional.`,
    openGraph: {
      title: `${nombre} – ${especialidad} | Giro Lab`,
      description: `Agenda sesiones con ${nombre} y comienza tu proceso de transformación.`,
      url: `${APP_URL}/menter/${id}`,
      siteName: 'Giro Lab',
      images: [{ url: ogImage, width: 800, height: 800, alt: nombre }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${nombre} | Giro Lab`,
      description: `Especialista en ${especialidad}. Agenda tu sesión en Giro Lab.`,
      images: [ogImage],
    },
  };
}

export default function MenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
