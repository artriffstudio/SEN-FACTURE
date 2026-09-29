"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";
import { useTranslation } from "@/contexts/LanguageContext";

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useTranslation();

  const plans = [
    {
      id: "starter",
      name: t.landing.plans.starter.name,
      subtitle: t.landing.plans.starter.subtitle,
      monthlyPrice: 590,
      badgeGuarantee: t.landing.plans.starter.badge,
      features: t.landing.plans.starter.features.map((f) => ({ text: f })),
      ctaText: t.landing.plans.starter.cta,
      ctaHref: "/register?plan=starter",
      isPopular: false,
    },
    {
      id: "pro",
      name: t.landing.plans.pro.name,
      subtitle: t.landing.plans.pro.subtitle,
      monthlyPrice: 1490,
      badgeGuarantee: t.landing.plans.pro.badge,
      features: t.landing.plans.pro.features.map((f, i) => ({
        text: f,
        isBold: i < 2,
      })),
      ctaText: t.landing.plans.pro.cta,
      ctaHref: "/register?plan=pro",
      isPopular: true,
    },
    {
      id: "enterprise",
      name: t.landing.plans.enterprise.name,
      subtitle: t.landing.plans.enterprise.subtitle,
      monthlyPrice: 3490,
      badgeGuarantee: t.landing.plans.enterprise.badge,
      features: t.landing.plans.enterprise.features.map((f) => ({ text: f })),
      ctaText: t.landing.plans.enterprise.cta,
      ctaHref: "#contact",
      isPopular: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/60" id="tarifs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* En-tête : Titre Tarifs + Commutateur Mensuel / Annuel */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mb-6 leading-tight">
            {t.landing.pricingTitle}
          </h2>

          {/* Commutateur Mensuel / Annuel (-20%) */}
          <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-full border border-slate-300/50 shadow-inner">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                !isYearly
                  ? "bg-white text-slate-900 shadow-sm scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.landing.monthly}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center space-x-1.5 cursor-pointer ${
                isYearly
                  ? "bg-white text-slate-900 shadow-sm scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{t.landing.yearly}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Grille des 3 Offres */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              subtitle={plan.subtitle}
              monthlyPrice={plan.monthlyPrice}
              isYearly={isYearly}
              features={plan.features}
              ctaText={plan.ctaText}
              ctaHref={plan.ctaHref}
              badgeGuarantee={plan.badgeGuarantee}
              isPopular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
