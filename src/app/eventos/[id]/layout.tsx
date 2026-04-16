import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://girolab.net'
const DEFAULT_OG = `${APP_URL}/og-image.jpg`

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
      openGraph: { images: [{ url: DEFAULT_OG, width: 1200, height: 630 }] },
    };
  }

  const ogImage = data.cover_image || DEFAULT_OG;
  const desc = data.description
    ? data.description.slice(0, 155)
    : `Participa en ${data.title}, una experiencia diseñada para impulsar tu crecimiento.`;

  return {
    title: `${data.title} – Experiencia de Transformación`,
    description: desc,
    openGraph: {
      title: `${data.title} | Giro Lab`,
      description: desc,
      url: `${APP_URL}/eventos/${params.id}`,
      siteName: 'Giro Lab',
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | Giro Lab`,
      description: desc,
      images: [ogImage],
    },
  };
}

export default function EventoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
