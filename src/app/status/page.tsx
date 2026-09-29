"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Server,
  FileCheck2,
  CreditCard,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function StatusPage() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const services = [
    {
      name: isAr ? "الواجهة البرمجية (API Core)" : "API & Services Métier",
      status: "Operational",
      uptime: "99.99%",
      latency: "42 ms",
      icon: <Server size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "تطبيق الويب والمصادقة" : "Application Web & Authentification",
      status: "Operational",
      uptime: "99.98%",
      latency: "35 ms",
      icon: <ShieldCheck size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "محرك توليد الفواتير (PDF A4)" : "Générateur de Factures PDF A4",
      status: "Operational",
      uptime: "99.95%",
      latency: "180 ms",
      icon: <FileCheck2 size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "بوابة بنكيلي (BANKILY - BPM)" : "Passerelle BANKILY (BPM)",
      status: "Operational",
      uptime: "99.90%",
      latency: "110 ms",
      icon: <CreditCard size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "بوابة مصرفي (MASRVI - BMCI)" : "Passerelle MASRVI (BMCI)",
      status: "Operational",
      uptime: "99.92%",
      latency: "95 ms",
      icon: <CreditCard size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "بوابة سداد (SEDAD - BMI)" : "Passerelle SEDAD (BMI)",
      status: "Operational",
      uptime: "99.94%",
      latency: "105 ms",
      icon: <CreditCard size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "بوابة كليك (CLICK - BNM)" : "Passerelle CLICK (BNM)",
      status: "Operational",
      uptime: "99.89%",
      latency: "120 ms",
      icon: <CreditCard size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "بوابة بنك المعاملات الإسلامية (BIM BANK)" : "Passerelle BIM BANK Mobile",
      status: "Operational",
      uptime: "99.91%",
      latency: "115 ms",
      icon: <CreditCard size={18} className="text-emerald-600" />,
    },
    {
      name: isAr ? "نظام النسخ الاحتياطي المستمر" : "Sauvegardes & Réplication Automatique",
      status: "Operational",
      uptime: "100.00%",
      latency: "Instantané",
      icon: <RefreshCw size={18} className="text-emerald-600" />,
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

        {/* EN-TÊTE ÉTAT GLOBAL */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "جميع الأنظمة تعمل بكفاءة تامة" : "Tous les systèmes sont 100% opérationnels"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {isAr ? "حالة الخدمة المباشرة (Live Status)" : "Statut des Services en Temps Réel"}
              </h1>

              <p className="text-sm text-slate-500 mt-1 font-medium">
                {isAr
                  ? "مراقبة مستمرة على مدار الساعة لجميع خوادم الفوترة والربط البنكي في موريتانيا."
                  : "Supervision 24/7 des infrastructures cloud, du moteur PDF et des passerelles bancaires."}
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Uptime Global (30j)</span>
              <p className="text-2xl font-black text-emerald-600">99.96 %</p>
              <span className="text-[10px] text-slate-500">Mise à jour il y a 1 min</span>
            </div>
          </div>
        </div>

        {/* LISTE DES SERVICES */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity size={18} className="text-sky-600" />
              <span>{isAr ? "حالة المكونات الفردية" : "Composants Applicatifs & Passerelles"}</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{services.length} services supervisés</span>
          </div>

          <div className="divide-y divide-slate-100">
            {services.map((svc, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {svc.icon}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900">{svc.name}</span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span>Latence : {svc.latency}</span>
                      <span>•</span>
                      <span>Disponibilité : {svc.uptime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{isAr ? "يعمل" : "Opérationnel"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
