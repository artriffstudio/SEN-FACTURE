import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import PartnerMarquee from "@/components/landing/PartnerMarquee";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SettingsShowcase from "@/components/landing/SettingsShowcase";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import LandingFooter from "@/components/landing/LandingFooter";
import "@/styles/landing.css";

export const metadata: Metadata = {
  title: "SEN FACTURE — La solution de facturation de nouvelle génération en Afrique de l'Ouest",
  description:
    "Facturation électronique normalisée OHADA, devis en 1 clic, encaissements Wave & Orange Money direct, conformité fiscale DGID et SYSCOHADA pour entreprises au Sénégal et dans l'UEMOA.",
  keywords: [
    "SEN FACTURE",
    "facturation Sénégal",
    "facture normalisée OHADA",
    "Wave Mobile Money facturation",
    "Orange Money Sénégal",
    "SYSCOHADA révisé",
    "NINEA Sénégal",
    "SaaS facturation Afrique",
    "devis et factures Dakar",
  ],
  openGraph: {
    title: "SEN FACTURE — Solution de facturation de référence au Sénégal",
    description:
      "Générez des factures certifiées, encaissez par Wave & Orange Money et pilotez votre trésorerie en temps réel.",
    type: "website",
    locale: "fr_SN",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-800 font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden flex flex-col justify-between">
      {/* 1. Header / Navbar de Navigation Fixe & Responsive */}
      <LandingHeader />

      <main className="flex-1">
        {/* 2. Hero Section avec 3D Jacks Organiques et Formulaire CTA Animé */}
        <LandingHero />

        {/* 3. Défilement Infini Continu des Partenaires & Banques */}
        <PartnerMarquee />

        {/* 4. Section Écosystème Facturation (6 Cartes Fonctionnalités) */}
        <FeaturesSection />

        {/* 5. Showcase Paramètres d'Entreprise & Terminal Sombre */}
        <SettingsShowcase />

        {/* 6. Section Tarifs Transparents avec Commutateur Mensuel/Annuel (-20%) */}
        <PricingSection />

        {/* 7. Section Contact & Prise de Démonstration */}
        <ContactSection />
      </main>

      {/* 8. Pied de page Complet avec Présence Régionale */}
      <LandingFooter />
    </div>
  );
}
