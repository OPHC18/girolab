import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comunidad",
  description: "Conecta con la comunidad Giro Lab. Comparte experiencias, descubre Menters y crece junto a personas que buscan transformación real.",
  robots: { index: false, follow: false },
};

export default function ComunidadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
