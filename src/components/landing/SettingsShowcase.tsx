"use client";

import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export default function SettingsShowcase() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-100" id="parametres">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Détails et Arguments Textuels */}
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
              {t.landing.settingsShowcase.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t.landing.settingsShowcase.title}
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              {t.landing.settingsShowcase.subtitle}
            </p>

            <div className="space-y-3.5 pt-2">
              {t.landing.settingsShowcase.highlights.map((item, index) => (
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
              {/* Entête du Terminal */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 pl-2">
                    {t.nav.settings} • FACTURIM
                  </span>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
                  {t.landing.settingsShowcase.connected} • Nouakchott, MR
                </span>
              </div>

              {/* Grille de champs de paramètres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {/* Champ 1 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    {t.landing.settingsShowcase.companyNameLabel}
                  </span>
                  <div className="text-sm font-semibold text-white">MAURI TECH SARL</div>
                </div>

                {/* Champ 2 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    {t.landing.settingsShowcase.nifLabel}
                  </span>
                  <div className="text-sm font-semibold text-white">NIF 00987654 / RC NKTT-2025</div>
                </div>

                {/* Champ 3 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    {t.landing.settingsShowcase.currencyLabel}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Ouguiya (MRU)</span>
                    <span className="text-xs bg-sky-600/30 text-sky-400 px-2 py-0.5 rounded font-bold">
                      {t.countryName}
                    </span>
                  </div>
                </div>

                {/* Champ 4 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    {t.landing.settingsShowcase.vatLabel}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">16% ({t.landing.settingsShowcase.vatDesc})</span>
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
                    <div className="text-xs font-bold text-white">
                      {t.landing.settingsShowcase.bankilyTitle}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t.landing.settingsShowcase.bankilyDesc}
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                  {t.landing.settingsShowcase.connected}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
