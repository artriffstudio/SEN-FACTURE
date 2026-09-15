"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const plans = isAr
    ? [
        {
          id: "starter",
          name: "البداية",
          subtitle: "مثالي للمستقلين والأنشطة الفردية في بداية انطلاقها.",
          monthlyPrice: 590,
          features: [
            { text: "حتى 30 فاتورة شهرياً" },
            { text: "عروض أسعار وتحويل فوري" },
            { text: "مستخدم واحد" },
            { text: "تصدير PDF معتمد في موريتانيا" },
          ],
          ctaText: "اختيار البداية",
          ctaHref: "/register?plan=starter",
          isPopular: false,
        },
        {
          id: "pro",
          name: "برو للشركات",
          subtitle: "للشركات الصغيرة والمتوسطة التي ترغب في أتمتة الفوترة.",
          monthlyPrice: 1490,
          features: [
            { text: "فواتير وعروض أسعار غير محدودة", isBold: true },
            { text: "دفع عبر بنكيلي وسداد", isBold: true },
            { text: "تذكير تلقائي عبر واتساب والرسائل" },
            { text: "حتى 5 مستخدمين متعاونين" },
            { text: "تصدير محاسبي للدفتر المعتمد" },
          ],
          ctaText: "بدء التجربة المجانية 14 يوماً ←",
          ctaHref: "/register?plan=pro",
          isPopular: true,
        },
        {
          id: "enterprise",
          name: "المؤسسات الكبرى",
          subtitle: "للشركات الكبرى متعددة الفروع وحجم المعاملات المرتفع.",
          monthlyPrice: 3490,
          features: [
            { text: "إدارة شركات متعددة وفروع" },
            { text: "مستخدمون غير محدودين" },
            { text: "واجهة برمجية API وربط مع ERP" },
            { text: "مدير حسابات مخصص في نواكشوط" },
          ],
          ctaText: "تواصل مع المبيعات",
          ctaHref: "#contact",
          isPopular: false,
        },
      ]
    : [
        {
          id: "starter",
          name: "Starter",
          subtitle: "Idéal pour les indépendants et freelances qui débutent.",
          monthlyPrice: 590,
          features: [
            { text: "Jusqu'à 30 factures / mois" },
            { text: "Devis & conversion 1-clic" },
            { text: "1 utilisateur" },
            { text: "Export PDF aux normes Mauritanie" },
          ],
          ctaText: "Choisir Starter",
          ctaHref: "/register?plan=starter",
          isPopular: false,
        },
        {
          id: "pro",
          name: "Pro PME",
          subtitle: "Pour les PME en pleine croissance qui veulent automatiser.",
          monthlyPrice: 1490,
          features: [
            { text: "Facturation & Devis ILLIMITÉS", isBold: true },
            { text: "Paiements Bankily & Seddap", isBold: true },
            { text: "Relances automatiques SMS / WhatsApp" },
            { text: "Jusqu'à 5 utilisateurs collaborateurs" },
            { text: "Export comptable certifié DGI" },
          ],
          ctaText: "Démarrer l'essai 14 jours →",
          ctaHref: "/register?plan=pro",
          isPopular: true,
        },
        {
          id: "enterprise",
          name: "Entreprise",
          subtitle: "Grandes structures, multi-filiales et volume élevé.",
          monthlyPrice: 3490,
          features: [
            { text: "Multi-sociétés & filiales" },
            { text: "Utilisateurs illimités" },
            { text: "API complète & intégration ERP" },
            { text: "Account Manager dédié à Nouakchott" },
          ],
          ctaText: "Contacter les ventes",
          ctaHref: "#contact",
          isPopular: false,
        },
      ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/60" id="tarifs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de la section Tarifs */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider">
            {isAr ? "أسعار واضحة وشفافة" : "Tarifs Transparents"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mt-4 mb-3 leading-tight">
            {isAr ? "خطة مناسبة لكل مرحلة من مراحل نمو شركتك" : "Un plan adapté à chaque étape de votre croissance"}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {isAr
              ? "اشتراكات مرنة بدون التزام، قابلة للدفع بالأوقية (MRU) عبر بنكيلي، سداد أو البطاقة البنكية."
              : "Des formules sans engagement, payables en Ouguiya (MRU) via Bankily, Seddap ou Carte bancaire."}
          </p>

          {/* Commutateur Mensuel / Annuel (-20%) */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/80 rounded-full border border-slate-300/50 shadow-inner">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                !isYearly
                  ? "bg-white text-slate-900 shadow-sm scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "فاتورة شهرية" : "Facturation mensuelle"}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center space-x-1.5 cursor-pointer ${
                isYearly
                  ? "bg-white text-slate-900 shadow-sm scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{isAr ? "سنوي" : "Annuel"}</span>
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
              isPopular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
