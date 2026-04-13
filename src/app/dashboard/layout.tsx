import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Usuario",
  description: "Gestiona tus sesiones, perfil y actividades dentro de Giro Lab desde tu panel personalizado.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
