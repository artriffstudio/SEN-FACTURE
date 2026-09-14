"use client";

import React from "react";
import { Check } from "lucide-react";

export default function SettingsShowcase() {
  const highlights = [
    "Modèles de factures personnalisables avec votre logo & charte",
    "Gestion du NINEA, RCCM, COFEB et mentions obligatoires",
    "Devises multiples : FCFA (XOF/XAF), Euro, Dollar US",
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-100" id="parametres">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Détails et Arguments Textuels */}
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
              Paramètres &amp; Personnalisation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Configurez votre entreprise en 2 minutes chrono
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Adaptez chaque détail selon votre régime fiscal et l&apos;image de votre marque : devise (XOF, EUR, USD), logo, mentions NINEA, RCCM et taux de taxes modulables.
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
                    Paramètres de l&apos;entreprise • SEN FACTURE
                  </span>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
                  Actif • Dakar, SN
                </span>
              </div>

              {/* Grille de champs de paramètres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {/* Champ 1 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Raison Sociale</span>
                  <div className="text-sm font-semibold text-white">TERANGA DIGITAL SARL</div>
                </div>

                {/* Champ 2 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Numéro NINEA / RCCM</span>
                  <div className="text-sm font-semibold text-white">SN-DKR-2024-B-8910</div>
                </div>

                {/* Champ 3 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Devise par défaut</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Franc CFA (FCFA / XOF)</span>
                    <span className="text-xs bg-sky-600/30 text-sky-400 px-2 py-0.5 rounded font-bold">
                      UEMOA
                    </span>
                  </div>
                </div>

                {/* Champ 4 */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Taux TVA appliqué</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">18% (Standard Sénégal)</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      Modifiable
                    </span>
                  </div>
                </div>
              </div>

              {/* Barre de Statut Portefeuille Mobile Money Wave Connecté */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-950/50 to-slate-800/80 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    W
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Compte Wave Marchand connecté</div>
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
