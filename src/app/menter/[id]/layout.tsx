import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";

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
      title: "Perfil de Menter",
      description: "Conoce a nuestros Menters especializados en desarrollo humano y bienestar.",
    };
  }

  const nombre = `${data.nombre} ${data.apellidos}`;
  const especialidad = data.especialidad || "Desarrollo Humano";

  return {
    title: `${nombre} – Especialista en ${especialidad}`,
    description: `Conoce a ${nombre}, especialista en ${especialidad}. Agenda sesiones y comienza tu proceso de transformación personal o profesional.`,
    openGraph: {
      title: `${nombre} – Especialista en ${especialidad} | Giro Lab`,
      description: `Conoce a ${nombre}, especialista en ${especialidad}. Agenda sesiones y comienza tu proceso de transformación.`,
      images: data.avatar_url ? [{ url: data.avatar_url, width: 400, height: 400, alt: nombre }] : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Giro Lab" }],
    },
    twitter: {
      card: "summary",
      title: `${nombre} | Giro Lab`,
      description: `Especialista en ${especialidad}. Agenda tu sesión en Giro Lab.`,
      images: data.avatar_url ? [data.avatar_url] : ["/og-image.jpg"],
    },
  };
}

export default function MenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
