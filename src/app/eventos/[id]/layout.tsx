import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from("events")
    .select("title, description, cover_image, date")
    .eq("id", params.id)
    .single();

  if (!data) {
    return {
      title: "Evento | Giro Lab",
      description: "Descubre eventos de transformación personal y organizacional en Giro Lab.",
    };
  }

  return {
    title: `${data.title} – Experiencia de Transformación`,
    description: data.description
      ? data.description.slice(0, 155)
      : `Participa en ${data.title}, una experiencia diseñada para impulsar tu crecimiento y alcanzar nuevos resultados.`,
    openGraph: {
      title: `${data.title} | Giro Lab`,
      description: `Participa en ${data.title}, una experiencia diseñada para impulsar tu crecimiento y alcanzar nuevos resultados.`,
      images: data.cover_image
        ? [{ url: data.cover_image, width: 1200, height: 630, alt: data.title }]
        : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Giro Lab" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.title} | Giro Lab`,
      description: `Participa en ${data.title}, una experiencia de transformación.`,
      images: data.cover_image ? [data.cover_image] : ["/og-image.jpg"],
    },
  };
}

export default function EventoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
