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
import { useLanguage } from "@/contexts/LanguageContext";

export default function FeaturesSection() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const features = isAr
    ? [
        {
          id: "dgi",
          icon: <FileCheck2 className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-600",
          badgeText: "مطابقة 100%",
          badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          title: "فواتير معتمدة في موريتانيا",
          description:
            "إصدار فواتير قانونية تتضمن تلقائياً الرقم الضريبي (NIF)، وضريبة القيمة المضافة 16% وبيانات شركتك الرسمية بدون أخطاء.",
        },
        {
          id: "devis",
          icon: <Zap className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-amber-50 border border-amber-100 group-hover:bg-amber-500",
          badgeText: "بنقرة واحدة",
          badgeColorClass: "bg-amber-50 text-amber-700 border border-amber-200/60",
          title: "عروض أسعار وتحويل فوري",
          description:
            "أنشئ عروض أسعار احترافية وشاركها عبر واتساب أو البريد الإلكتروني مع إمكانية تحويلها إلى فاتورة نهائية بنقرة واحدة.",
        },
        {
          id: "mobile-money",
          icon: <Smartphone className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-500",
          badgeText: "محافظ إلكترونية",
          badgeColorClass: "bg-sky-50 text-sky-700 border border-sky-200/60",
          title: "بنكيلي وسداد مباشرة",
          description:
            "رمز QR أو رابط دفع سريع مدمج في فواتيرك يتيح لعملائك تسوية مستحقاتهم فوراً عبر Bankily و Seddap ومصرفي.",
        },
        {
          id: "tresorerie",
          icon: <BarChart3 className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-600",
          badgeText: "لحظي",
          badgeColorClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
          title: "متابعة السيولة بالأوقية (MRU)",
          description:
            "لوحة تحكم ذكية لمراقبة تدفقاتك المالية، وتوقعات التحصيل، وفواتيرك غير المسددة في موريتانيا في الوقت الفعلي.",
        },
        {
          id: "relances",
          icon: <MessageCircle className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-600",
          badgeText: "تلقائي",
          badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          title: "تذكير عبر واتساب والرسائل",
          description:
            "قلل فترات التأخير في السداد من خلال التذكيرات التلقائية اللطيفة المرسلة مباشرة إلى هواتف العملاء.",
        },
        {
          id: "expert-comptable",
          icon: <ShieldCheck className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-purple-50 border border-purple-100 group-hover:bg-purple-600",
          badgeText: "محاسبة معتمدة",
          badgeColorClass: "bg-purple-50 text-purple-700 border border-purple-200/60",
          title: "تصدير للدفتر المحاسبي",
          description:
            "تصدير قيودك المحاسبية بصيغ Excel و CSV لتسهيل الإقرارات الضريبية الشهرية والسنوية لدى إدارة الضرائب.",
        },
      ]
    : [
        {
          id: "dgi",
          icon: <FileCheck2 className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-sky-50 border border-sky-100 group-hover:bg-sky-600",
          badgeText: "Conformité 100%",
          badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          title: "Factures Normalisées Mauritanie",
          description:
            "Éditez des factures certifiées intégrant automatiquement le NIF, la TVA mauritanienne (16%) et toutes les mentions légales requises par la DGI.",
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
          title: "Bankily & Seddap Direct",
          description:
            "Un QR Code ou lien sécurisé inséré sur vos factures permet à vos clients de régler instantanément via Bankily, Seddap ou virement BPM.",
        },
        {
          id: "tresorerie",
          icon: <BarChart3 className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-600",
          badgeText: "Temps Réel",
          badgeColorClass: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
          title: "Suivi Trésorerie en MRU",
          description:
            "Tableau de bord intelligent pour surveiller vos encaissements en Ouguiya (MRU), votre prévisionnel et l'état des créances clients.",
        },
        {
          id: "relances",
          icon: <MessageCircle className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-600",
          badgeText: "Automatisé",
          badgeColorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          title: "Relances SMS & WhatsApp",
          description:
            "Divisez par deux vos délais de paiement grâce aux rappels programmés et courtois transmis sur WhatsApp et SMS.",
        },
        {
          id: "expert-comptable",
          icon: <ShieldCheck className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />,
          iconBgClass: "bg-purple-50 border border-purple-100 group-hover:bg-purple-600",
          badgeText: "Comptabilité",
          badgeColorClass: "bg-purple-50 text-purple-700 border border-purple-200/60",
          title: "Grand Livre & Déclarations",
          description:
            "Exportez vos écritures comptables sous format Excel, CSV pour faciliter vos déclarations de TVA (16%) auprès de la DGI Mauritanie.",
        },
      ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/70" id="fonctionnalites">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold uppercase tracking-wider">
            {isAr ? "منظومة الفوترة الإلكترونية" : "Écosystème Facturation"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mt-4 mb-3 leading-tight">
            {isAr ? "كل ما تحتاجه لإدارة أعمالك بسرعة واحترافية" : "Tout pour piloter votre entreprise à grande vitesse"}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {isAr
              ? "أدوات متطورة مصممة خصيصاً للتوافق التام مع متطلبات السوق والأنظمة المالية في موريتانيا."
              : "Des outils automatisés conçus spécialement pour répondre aux exigences fiscales et commerciales en Mauritanie."}
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
