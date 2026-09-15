"use client";

import React from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsShowcase() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const highlights = isAr
    ? [
        "نماذج فواتير قابلة للتخصيص الكامل مع شعار وهوية شركتك",
        "إدارة الرقم الضريبي (NIF)، والسجل التجاري والبيانات الإلزامية",
        "دعم العملات: الأوقية (MRU)، اليورو (€)، والدولار ($)",
      ]
    : [
        "Modèles de factures personnalisables avec votre logo & charte",
        "Gestion du NIF, Registre de Commerce et mentions obligatoires DGI",
        "Devises supportées : Ouguiya (MRU), Euro (€), Dollar US ($)",
      ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-100" id="parametres">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Détails et Arguments Textuels */}
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
              {isAr ? "الإعدادات والتخصيص" : "Paramètres & Personnalisation"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {isAr ? "قم بتهيئة بيانات شركتك في دقيقتين فقط" : "Configurez votre entreprise en 2 minutes chrono"}
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              {isAr
                ? "خصص كل التفاصيل وفقاً لنظامك الضريبي وهوية شركتك: العملة الرسمية (MRU)، الشعار، الرقم الضريبي (NIF)، ومعدلات الضريبة المرنة."
                : "Adaptez chaque détail selon votre régime fiscal et l'image de votre marque : devise (MRU, EUR, USD), logo, mentions NIF, RC et taux de TVA 16%."}
            </p>

            <div className="space-y-3.5 pt-2">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-normal">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup Visuel de Tableau de Bord des Paramètres */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-slate-900/20 border border-slate-800">
              {/* Entête du Terminal / Fenêtre */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 pl-2">
                    Paramètres de l&apos;entreprise • FACTURIM
                  </span>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
                  Actif • Nouakchott, MR
                </span>
              </div>

              {/* Grille de champs de paramètres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {/* Champ 1 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Raison Sociale</span>
                  <div className="text-sm font-semibold text-white">MAURI TECH SARL</div>
                </div>

                {/* Champ 2 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Numéro NIF &amp; RC</span>
                  <div className="text-sm font-semibold text-white">NIF 00987654 / RC NKTT-2025</div>
                </div>

                {/* Champ 3 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Devise par défaut</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Ouguiya (MRU)</span>
                    <span className="text-xs bg-sky-600/30 text-sky-400 px-2 py-0.5 rounded font-bold">
                      Mauritanie
                    </span>
                  </div>
                </div>

                {/* Champ 4 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Taux TVA appliqué</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">16% (Standard Mauritanie)</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      DGI
                    </span>
                  </div>
                </div>
              </div>

              {/* Barre de Statut Portefeuille Mobile Money Bankily Connecté */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-slate-800/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Compte Bankily Marchand connecté</div>
                    <div className="text-[11px] text-slate-400">Encaissements crédités automatiquement</div>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                  Connecté ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
