"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingFooter() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

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
                    FI
                  </text>
                </svg>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                FACTU<span className="text-sky-500">RIM</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {isAr
                ? "الحل الرائد للفوترة الإلكترونية والامتثال الضريبي والمحاسبي المخصص للشركات والمؤسسات في موريتانيا."
                : "La solution de facturation électronique de référence pensée pour propulser les entreprises et entrepreneurs en Mauritanie."}
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
            <h4 className="text-white font-semibold text-sm mb-4">
              {isAr ? "المنتج" : "Produit"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#fonctionnalites" className="hover:text-white transition-colors">
                  {isAr ? "المميزات" : "Fonctionnalités"}
                </a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-white transition-colors">
                  {isAr ? "الأسعار" : "Tarifs"}
                </a>
              </li>
              <li>
                <a href="#parametres" className="hover:text-white transition-colors">
                  {isAr ? "الإعدادات" : "Paramètres"}
                </a>
              </li>
              <li>
                <a href="#partenaires" className="hover:text-white transition-colors">
                  {isAr ? "تكامل بنكيلي وسداد" : "Intégrations Bankily & Seddap"}
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légal & Conformité */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              {isAr ? "القانونية والامتثال" : "Légal & Conformité"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isAr ? "معايير الضرائب (DGI)" : "Conformité DGI Mauritanie"}
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isAr ? "ضريبة القيمة المضافة 16%" : "TVA 16% & NIF Légal"}
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isAr ? "أنظمة البنك المركزي (BCM)" : "Réglementation BCM"}
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isAr ? "الشروط والأحكام" : "Conditions Générales"}
                </span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Présence Locale */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              {isAr ? "التواجد في موريتانيا" : "Présence en Mauritanie"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-300 font-medium">🇲🇷 Nouakchott :</span> Tevragh-Zeina
              </li>
              <li>
                <span className="text-slate-300 font-medium">🇲🇷 Nouadhibou :</span> Centre Ville
              </li>
              <li>
                <span className="text-slate-300 font-medium">🇲🇷 Kiffa :</span> Assaba
              </li>
              <li>
                <span className="text-slate-300 font-medium">🇲🇷 Rosso :</span> Trarza
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure de Copyright */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            {isAr
              ? "© 2026 FACTURIM. جميع الحقوق محفوظة. صُمم خصيصاً للنمو الاقتصادي في موريتانيا."
              : "© 2026 FACTURIM. Tous droits réservés. Conçu pour le dynamisme en Mauritanie."}
          </p>
          <div className="flex space-x-6">
            <span className="hover:text-white transition-colors cursor-pointer">
              {isAr ? "الخصوصية" : "Confidentialité"}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {isAr ? "إشعارات قانونية" : "Mentions Légales"}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {isAr ? "الأمان" : "Sécurité"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
