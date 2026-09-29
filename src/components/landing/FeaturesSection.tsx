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
import { useTranslation } from "@/contexts/LanguageContext";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      id: "dgi",
      icon: <FileCheck2 className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-600",
      badgeText: t.landing.featuresList.dgi.badge,
      badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      title: t.landing.featuresList.dgi.title,
      description: t.landing.featuresList.dgi.desc,
    },
    {
      id: "devis",
      icon: <Zap className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-amber-50 border border-amber-100 group-hover:bg-amber-500",
      badgeText: t.landing.featuresList.devis.badge,
      badgeColorClass: "bg-amber-50 text-amber-700 border border-amber-200/60",
      title: t.landing.featuresList.devis.title,
      description: t.landing.featuresList.devis.desc,
    },
    {
      id: "mobile-money",
      icon: <Smartphone className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-500",
      badgeText: t.landing.featuresList.mobileMoney.badge,
      badgeColorClass: "bg-sky-50 text-sky-700 border border-sky-200/60",
      title: t.landing.featuresList.mobileMoney.title,
      description: t.landing.featuresList.mobileMoney.desc,
    },
    {
      id: "tresorerie",
      icon: <BarChart3 className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-600",
      badgeText: t.landing.featuresList.tresorerie.badge,
      badgeColorClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
      title: t.landing.featuresList.tresorerie.title,
      description: t.landing.featuresList.tresorerie.desc,
    },
    {
      id: "relances",
      icon: <MessageCircle className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-600",
      badgeText: t.landing.featuresList.relances.badge,
      badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      title: t.landing.featuresList.relances.title,
      description: t.landing.featuresList.relances.desc,
    },
    {
      id: "expert-comptable",
      icon: <ShieldCheck className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />,
      iconBgClass: "bg-purple-50 border border-purple-100 group-hover:bg-purple-600",
      badgeText: t.landing.featuresList.expertComptable.badge,
      badgeColorClass: "bg-purple-50 text-purple-700 border border-purple-200/60",
      title: t.landing.featuresList.expertComptable.title,
      description: t.landing.featuresList.expertComptable.desc,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/70" id="fonctionnalites">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider">
            {t.landing.featuresBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mt-4 mb-3 leading-tight">
            {t.landing.featuresTitle}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {t.landing.featuresSubtitle}
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
