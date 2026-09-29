"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  KeyRound,
  Users,
  HardDrive,
  RefreshCw,
  Activity,
  CheckCircle2,
  FileCode2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function SecurityPage() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const securityPillars = [
    {
      icon: <KeyRound size={22} className="text-sky-600" />,
      title: isAr ? "التشفير وبروتوكولات النقل" : "Chiffrement & Protocoles",
      desc: isAr
        ? "تشفير كامل TLS 1.3 أثناء النقل و AES-256 للبيانات والمرفقات في حالة السكون."
        : "TLS 1.3 de bout en bout pour les flux et chiffrement AES-256 pour les bases et pièces jointes.",
    },
    {
      icon: <Users size={22} className="text-sky-600" />,
      title: isAr ? "التحكم بالأدوار وسرية الأرقام (RBAC)" : "Contrôle d'Accès & RBAC",
      desc: isAr
        ? "فصل دقيق بين حساب المدير والمحاسب وعامل الفوترة، مع إمكانية إخفاء رقم المعاملات الكلي عن الموظفين."
        : "Cloisonnement étanche : le dirigeant peut masquer le CA global et les rapports fiscaux aux opérateurs guichet.",
    },
    {
      icon: <HardDrive size={22} className="text-sky-600" />,
      title: isAr ? "النسخ الاحتياطي المستمر والاستعادة" : "Sauvegardes & PRA",
      desc: isAr
        ? "نسخ احتياطي يومي مشفر خارج الموقع مع مؤشر RPO = 15 دقيقة و RTO = ساعتان."
        : "Sauvegardes quotidiennes chiffrées hors site, WAL continu, RPO = 15 min, RTO = 2 heures.",
    },
    {
      icon: <FileCode2 size={22} className="text-sky-600" />,
      title: isAr ? "سجل تدقيق غير قابل للتغيير" : "Piste d'Audit Immuable",
      desc: isAr
        ? "توثيق كل حركة (إصدار، إلغاء، تحصيل) مع الطابع الزمني وعنوان IP لمنع التلاعب."
        : "Journalisation horodatée UTC de chaque action (création, validation, annulation, encaissement).",
    },
    {
      icon: <Activity size={22} className="text-sky-600" />,
      title: isAr ? "المراقبة والجاهزية على مدار الساعة" : "Monitoring 24/7 & SLA 99.9%",
      desc: isAr
        ? "مراقبة مستمرة لمؤشرات الأداء وتوافر خدمات بنكيلي وسداد ومصرفي."
        : "Surveillance continue de la latence, des passerelles de paiement et de la génération PDF.",
    },
    {
      icon: <Shield size={22} className="text-sky-600" />,
      title: isAr ? "المصادقة الثنائية (2FA / TOTP)" : "Authentification Forte & 2FA",
      desc: isAr
        ? "حماية الدخول عبر تطبيقات المصادقة (Google Authenticator) ورموز الاسترداد للطوارئ."
        : "Support 2FA / TOTP avec codes de secours pour sécuriser les comptes administrateurs et comptables.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between"
      dir={isAr ? "rtl" : "ltr"}
    >
      <LandingHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
            <span>{isAr ? "العودة إلى الصفحة الرئيسية" : "Retour à l'accueil"}</span>
          </Link>
        </div>

        {/* EN-TÊTE */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold mb-4">
              <Shield size={13} className="text-sky-600" />
              <span>{isAr ? "الأمان المؤسسي المتقدم" : "Architecture de Sécurité Facturim"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isAr ? "الأمان والبنية التحتية والامتثال" : "Sécurité, Infrastructure & Résilience"}
            </h1>

            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isAr
                ? "معايير أمان بنكية لحماية الفواتير والبيانات المالية للشركات في موريتانيا."
                : "Les standards de sécurité et de gouvernance des données appliqués à la plateforme Facturim."}
            </p>
          </div>
        </div>

        {/* GRILLE DES PILIERS DE SÉCURITÉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {securityPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-sky-300/80 transition-all card-interactive"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center mb-4">
                {pillar.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* TABLEAU RÉCAPITULATIF TECHNIQUE */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">
            {isAr ? "المعايير التقنية ومؤشرات الأداء (KPIs)" : "Spécifications & Engagements Techniques"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Disponibilité (SLA)</span>
              <p className="text-xl font-extrabold text-sky-600 mt-1">99.9 %</p>
              <span className="text-[11px] text-slate-500">Monitoring 24/7 en continu</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Perte de Données Max (RPO)</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">&lt; 15 min</p>
              <span className="text-[11px] text-slate-500">Sauvegardes WAL redondantes</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Temps de Rétablissement (RTO)</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">&lt; 2 heures</p>
              <span className="text-[11px] text-slate-500">Procédure PRA testée</span>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
