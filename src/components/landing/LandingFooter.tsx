"use client";

import React from "react";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Colonne 1 : Marque & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-md shrink-0">
                <svg
                  className="w-full h-full p-1.5"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="40" height="40" rx="8" fill="#0f172a" />
                  <text
                    x="20"
                    y="20"
                    dominantBaseline="central"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="18"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="-0.5px"
                  >
                    SF
                  </text>
                </svg>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SEN <span className="text-sky-500">FACTURE</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              La solution de facturation de nouvelle génération pensée pour propulser les entreprises et créateurs d&apos;Afrique de l&apos;Ouest.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:border-sky-500 transition-all hover:scale-110"
                aria-label="Twitter X"
              >
                𝕏
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:border-sky-500 transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:border-sky-500 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                f
              </a>
            </div>
          </div>

          {/* Colonne 2 : Produit */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#fonctionnalites" className="hover:text-white transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-white transition-colors">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#parametres" className="hover:text-white transition-colors">
                  Paramètres
                </a>
              </li>
              <li>
                <a href="#partenaires" className="hover:text-white transition-colors">
                  Intégrations Wave &amp; OM
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légal & Conformité */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Légal &amp; Conformité</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Normes OHADA
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Réglementation BCEAO
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Protection CDP Sénégal
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Conditions Générales
                </span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Présence Locale */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Présence Locale</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-300 font-medium">🇸🇳 Sénégal :</span> Dakar
              </li>
              <li>
                <span className="text-slate-300 font-medium">🇨🇮 Côte d&apos;Ivoire :</span> Abidjan
              </li>
              <li>
                <span className="text-slate-300 font-medium">🇲🇱 Mali :</span> Bamako
              </li>
              <li>
                <span className="text-slate-300 font-medium">🇧🇯 Bénin :</span> Cotonou
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure de Copyright */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SEN FACTURE. Tous droits réservés. Propulsé pour le dynamisme africain.</p>
          <div className="flex space-x-6">
            <span className="hover:text-white transition-colors cursor-pointer">Confidentialité</span>
            <span className="hover:text-white transition-colors cursor-pointer">Mentions Légales</span>
            <span className="hover:text-white transition-colors cursor-pointer">Sécurité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
