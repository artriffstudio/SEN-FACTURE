"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, X, Check, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CookieConsent() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const [isVisible, setIsVisible] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem("facturim_cookie_consent");
    if (!consent) {
      // Déclencher après un léger délai pour une expérience fluide
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "facturim_cookie_consent",
      JSON.stringify({ necessary: true, analytics: true, timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
    setShowCustomModal(false);
  };

  const handleRefuseNonEssential = () => {
    localStorage.setItem(
      "facturim_cookie_consent",
      JSON.stringify({ necessary: true, analytics: false, timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
    setShowCustomModal(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(
      "facturim_cookie_consent",
      JSON.stringify({ necessary: true, analytics: analyticsAllowed, timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
    setShowCustomModal(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* BANNIÈRE FLOTTANTE EN BAS DE PAGE */}
      <div
        className={`fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-5 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          isAr ? "font-sans text-right" : ""
        }`}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 shrink-0">
            <Cookie size={20} className="stroke-[2.2]" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{isAr ? "حماية البيانات وملفات تعريف الارتباط" : "Confidentialité & Cookies"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck size={11} />
                  <span>{isAr ? "قانون 2017-020" : "Loi 2017-020"}</span>
                </span>
              </h4>
              <button
                onClick={handleRefuseNonEssential}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
                title={isAr ? "إغلاق" : "Fermer"}
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {isAr
                ? "تستخدم فاكتوريم ملفات تعريف ارتباط تقنية لازمة لتأمين جلسات الفوترة وتجربة الاستخدام، وفقاً لقانون حماية البيانات الشخصية الموريتاني رقم 2017-020. نحن لا نبيع بياناتك أبداً."
                : "Facturim utilise des traceurs techniques indispensables au fonctionnement sécurisé de la facturation et à la mesure d'audience anonymisée, conformément à la Loi mauritanienne n° 2017-020. Vos données professionnelles ne sont jamais vendues."}
            </p>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-3">
              <Link href="/privacy" className="text-sky-600 hover:underline font-semibold">
                {isAr ? "سياسة الخصوصية" : "Politique de Confidentialité"}
              </Link>
              <span>•</span>
              <Link href="/terms" className="text-sky-600 hover:underline font-semibold">
                {isAr ? "الشروط العامة (CGU)" : "Conditions Générales"}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={handleAcceptAll}
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm shadow-sky-500/20 hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={13} className="stroke-[2.5]" />
                <span>{isAr ? "قبول الكل" : "Tout accepter"}</span>
              </button>

              <button
                onClick={() => setShowCustomModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal size={13} />
                <span>{isAr ? "تخصيص" : "Personnaliser"}</span>
              </button>

              <button
                onClick={handleRefuseNonEssential}
                className="text-slate-500 hover:text-slate-700 text-xs font-medium px-2 py-2 transition-colors cursor-pointer"
              >
                {isAr ? "متابعة بدون قبول" : "Continuer sans accepter"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE DE PERSONNALISATION */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Cookie size={18} className="text-sky-600" />
                <span>{isAr ? "تفضيلات ملفات تعريف الارتباط" : "Préférences des traceurs"}</span>
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    {isAr ? "ملفات تقنية أساسية (إلزامية)" : "Cookies techniques essentiels"}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {isAr ? "دائماً نشط" : "Toujours actif"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {isAr
                    ? "ضرورية لتأمين جلسات العمل وحفظ الفواتير والتوافق مع معايير الضرائب."
                    : "Nécessaires à l'authentification sécurisée, à la persistance du panier fiscal et aux sessions."}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    {isAr ? "تحسين الأداء وقياس الاستخدام" : "Mesure d'audience & Performance"}
                  </span>
                  <input
                    type="checkbox"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {isAr
                    ? "تساعدنا على قياس سرعة إصدار الفواتير وتحسين التوافق مع الهواتف الذكية."
                    : "Permet d'analyser anonymement la rapidité de génération des factures et l'ergonomie mobile."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                {isAr ? "إلغاء" : "Annuler"}
              </button>
              <button
                onClick={handleSaveCustom}
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                {isAr ? "حفظ خياراتي" : "Enregistrer mes choix"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
