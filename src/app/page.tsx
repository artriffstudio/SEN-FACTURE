import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SettingsShowcase from "@/components/landing/SettingsShowcase";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import LandingFooter from "@/components/landing/LandingFooter";
import "@/styles/landing.css";

export const metadata: Metadata = {
  title: "Facturim — La solution de facturation électronique de référence en Mauritanie",
  description:
    "Facturation électronique conforme DGI Mauritanie (TVA 16%, NIF optionnel), devis en 1 clic, encaissements BANKILY, MASRVI, SEDAD, CLICK & BIM BANK direct, devises MRU et multilingue Arabe, Anglais, Chinois et Français.",
  keywords: [
    "Facturim",
    "facturation Mauritanie",
    "facture électronique Nouakchott",
    "Bankily facturation",
    "SEDAD paiement",
    "Masrvi paiement",
    "Click BNM",
    "BIM Bank Mobile",
    "NIF Mauritanie",
    "TVA 16% Mauritanie",
    "MRU Ouguiya",
    "logiciel comptable Mauritanie",
    "devis et factures Nouakchott",
  ],
  openGraph: {
    title: "Facturim — Solution de facturation de référence en Mauritanie",
    description:
      "Générez des factures certifiées, encaissez par BANKILY, MASRVI, SEDAD, CLICK & BIM BANK et pilotez votre trésorerie en MRU en temps réel.",
    type: "website",
    locale: "fr_MR",
  },
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Facturim",
        "operatingSystem": "Web, iOS, Android (PWA)",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "590",
          "priceCurrency": "MRU",
        },
        "description":
          "Plateforme SaaS de facturation électronique conforme DGI Mauritanie (TVA 16%, NIF optionnel) avec encaissement Mobile Banking (Bankily, Masrvi, Sedad, Click, BIM Bank).",
        "publisher": {
          "@type": "Organization",
          "name": "Facturim Mauritanie SARL",
          "url": "https://facturim.net",
          "logo": "https://facturim.net/images/logo.png",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Avenue du Roi Fayçal, Tevragh-Zeina",
            "addressLocality": "Nouakchott",
            "addressCountry": "MR",
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+222-45-00-00-00",
            "contactType": "customer service",
            "availableLanguage": ["French", "Arabic", "English", "Chinese"],
          },
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-800 font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden flex flex-col justify-between">
      {/* Données structurées Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header / Navbar de Navigation Fixe & Responsive */}
      <LandingHeader />

      <main className="flex-1">
        {/* 2. Hero Section épurée avec Laptop 3D sans cadre + Marquee en pied de page Hero */}
        <LandingHero />

        {/* 3. Section Écosystème Facturation (6 Cartes Fonctionnalités) */}
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
