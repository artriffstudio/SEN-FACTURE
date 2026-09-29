"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function SlaPage() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const incidentLevels = [
    {
      level: "P1 — Critique",
      desc: isAr ? "انقطاع كامل في المنصة أو تعذر إصدار الفواتير" : "Plateforme indisponible ou impossibilité totale d'émettre des factures",
      sla: isAr ? "استجابة خلال 30 دقيقة" : "Prise en charge < 30 min",
      res: isAr ? "حل خلال ساعتين" : "Résolution cible < 2 heures",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      badge: "bg-rose-500 text-white",
    },
    {
      level: "P2 — Majeur",
      desc: isAr ? "خلل في توليد ملفات PDF أو تأخر في مزامنة المدفوعات" : "Génération PDF bloquée ou anomalie de rapprochement de paiement",
      sla: isAr ? "استجابة خلال ساعتين" : "Prise en charge < 2 heures",
      res: isAr ? "حل خلال 6 ساعات" : "Résolution cible < 6 heures",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      badge: "bg-amber-500 text-white",
    },
    {
      level: "P3 — Normal",
      desc: isAr ? "وظيفة ثانوية متأثرة مع وجود بديل عملي" : "Fonctionnalité secondaire dégradée avec contournement possible",
      sla: isAr ? "استجابة خلال 4 ساعات" : "Prise en charge < 4 heures",
      res: isAr ? "حل خلال 24 ساعة" : "Résolution cible < 24 heures",
      color: "bg-sky-50 text-sky-800 border-sky-200",
      badge: "bg-sky-500 text-white",
    },
    {
      level: "P4 — Mineur / Question",
      desc: isAr ? "استفسارات الاستخدام، طلبات التوجيه أو تحسينات" : "Questions d'utilisation, demande d'assistance ou d'évolution",
      sla: isAr ? "استجابة خلال يوم عمل واحد" : "Prise en charge < 1 jour ouvré",
      res: isAr ? "معالجة مستمرة" : "Prise en charge continue",
      color: "bg-slate-50 text-slate-700 border-slate-200",
      badge: "bg-slate-600 text-white",
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
              <Clock size={13} className="text-sky-600" />
              <span>{isAr ? "مستوى الخدمة والالتزامات (SLA)" : "Engagements de Disponibilité & Support B2B"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isAr ? "اتفاقية مستوى الخدمة (SLA)" : "Accord de Niveau de Service (SLA)"}
            </h1>

            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isAr
                ? "التزام رسمي بضمان توفر الخدمة بنسبة 99.9% واستجابة فورية للأعطال الحرجة."
                : "Garantie de disponibilité à 99,9% et grille d'intervention prioritaire pour les entreprises."}
            </p>
          </div>
        </div>

        {/* MATRICE D'INTERVENTION P1-P4 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">
            {isAr ? "مصفوفة معالجة الحوادث والاستجابة" : "Matrice de Traitement des Incidents (P1 à P4)"}
          </h2>

          <div className="space-y-4">
            {incidentLevels.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${item.color} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${item.badge}`}>
                      {item.level.split("—")[0].trim()}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {item.level.split("—")[1]?.trim() || item.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end gap-1 text-xs shrink-0">
                  <span className="font-extrabold text-slate-900">{item.sla}</span>
                  <span className="text-[11px] text-slate-500">{item.res}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CANAUX D'ASSISTANCE DÉDIÉS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-bold text-slate-400">WhatsApp Pro Mauritanie</span>
            <p className="text-sm font-extrabold text-slate-900 mt-1">+222 36 00 00 00</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Réponse immédiate 7j/7</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-bold text-slate-400">Hotline Entreprises</span>
            <p className="text-sm font-extrabold text-slate-900 mt-1">+222 45 00 00 00</p>
            <span className="text-[11px] text-slate-500">Du Dimanche au Jeudi (8h-18h)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-bold text-slate-400">Support Technique</span>
            <p className="text-sm font-extrabold text-slate-900 mt-1">support@facturim.net</p>
            <span className="text-[11px] text-sky-600 font-semibold">Ticketing certifié</span>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
