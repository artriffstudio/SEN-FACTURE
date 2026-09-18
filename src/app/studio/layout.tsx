import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturim Studio — Dashboard Nouvelle Génération",
  description: "Proposition d'interface moderne, épurée et interactive pour la facturation d'entreprise.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
      {children}
    </div>
  );
}
