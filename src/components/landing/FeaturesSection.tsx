"use client";

import React from "react";
import FeatureCard from "./FeatureCard";
import {
  FileCheck2,
  Zap,
  Smartphone,
  BarChart3,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      id: "ohada",
      icon: <FileCheck2 className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-600",
      badgeText: "Conformité 100%",
      badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      title: "Factures Normalisées OHADA",
      description:
        "Éditez des factures certifiées intégrant automatiquement mentions légales, TVA sénégalaise (18%) ou régionale et NINEA sans risque d'erreur fiscale.",
    },
    {
      id: "devis",
      icon: <Zap className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-amber-50 border border-amber-100 group-hover:bg-amber-500",
      badgeText: "En 1 Clic",
      badgeColorClass: "bg-amber-50 text-amber-700 border border-amber-200/60",
      title: "Devis Rapides & Signature",
      description:
        "Créez des propositions commerciales soignées envoyées directement par WhatsApp ou Email, convertibles en factures finales en un clic.",
    },
    {
      id: "mobile-money",
      icon: <Smartphone className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-500",
      badgeText: "Mobile Money",
      badgeColorClass: "bg-sky-50 text-sky-700 border border-sky-200/60",
      title: "Wave & Orange Money Direct",
      description:
        "Un QR Code ou lien sécurisé inséré sur vos factures permet à vos clients de régler instantanément depuis leur smartphone.",
    },
    {
      id: "tresorerie",
      icon: <BarChart3 className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-600",
      badgeText: "Temps Réel",
      badgeColorClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
      title: "Suivi Trésorerie & Impayés",
      description:
        "Tableau de bord intelligent pour surveiller vos flux, votre prévisionnel d'encaissement et l'état exact des relances clients.",
    },
    {
      id: "relances",
      icon: <MessageCircle className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-600",
      badgeText: "Automatisé",
      badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      title: "Relances SMS & WhatsApp",
      description:
        "Divisez par deux vos délais de paiement grâce aux rappels programmés et bienveillants transmis sur les canaux préférés en Afrique.",
    },
    {
      id: "expert-comptable",
      icon: <ShieldCheck className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-purple-50 border border-purple-100 group-hover:bg-purple-600",
      badgeText: "Multi-comptes",
      badgeColorClass: "bg-purple-50 text-purple-700 border border-purple-200/60",
      title: "Accès Expert-Comptable",
      description:
        "Exportez vos écritures comptables sous format Excel, CSV ou invitez votre comptable avec des droits restreints et sécurisés.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/70" id="fonctionnalites">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider">
            Écosystème Facturation
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mt-4 mb-3 leading-tight">
            Tout pour piloter votre entreprise à grande vitesse
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Des outils automatisés conçus spécialement pour répondre aux spécificités comptables d&apos;Afrique de l&apos;Ouest.
          </p>
        </div>

        {/* Grille 3 colonnes responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              iconBgClass={feature.iconBgClass}
              badgeText={feature.badgeText}
              badgeColorClass={feature.badgeColorClass}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
