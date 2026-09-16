"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PartnerMarquee() {
  const { currentLanguage } = useLanguage();

  const isAr = currentLanguage === "ar";

  const partners = [
    {
      id: "bankily",
      name: "Bankily",
      colorClass: "text-emerald-600",
      prefix: <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shrink-0" />,
      weight: "font-black text-2xl tracking-tight",
    },
    {
      id: "seddap",
      name: "Seddap",
      colorClass: "text-sky-600",
      prefix: <span className="w-3.5 h-3.5 rounded-md bg-sky-500 inline-block shrink-0" />,
      weight: "font-black text-xl tracking-tight",
    },
    {
      id: "bpm",
      name: "BPM",
      colorClass: "text-blue-900",
      weight: "font-black text-xl tracking-widest uppercase",
    },
    {
      id: "masrvi",
      name: "Masrvi",
      colorClass: "text-emerald-700",
      prefix: <span className="w-3 h-3 bg-emerald-600 inline-block shrink-0 rounded-xs" />,
      weight: "font-bold text-xl tracking-tight",
    },
    {
      id: "bmci",
      name: "BMCI Mauritanie",
      colorClass: "text-slate-900",
      weight: "font-extrabold text-lg tracking-wide",
    },
    {
      id: "bnm",
      name: "BNM",
      colorClass: "text-amber-700",
      weight: "font-black text-xl tracking-widest",
    },
    {
      id: "mauritel",
      name: "Mauritel",
      colorClass: "text-blue-700",
      weight: "font-extrabold text-xl tracking-tight",
    },
    {
      id: "chinguitel",
      name: "Chinguitel",
      colorClass: "text-red-600",
      weight: "font-bold text-xl tracking-tighter",
    },
    {
      id: "mattel",
      name: "Mattel",
      colorClass: "text-purple-700",
      weight: "font-black text-xl tracking-tight",
    },
    {
      id: "snim",
      name: "SNIM",
      colorClass: "text-slate-800",
      weight: "font-black text-xl tracking-widest",
    },
    {
      id: "visa",
      name: "VISA",
      colorClass: "text-blue-600",
      weight: "font-extrabold text-xl tracking-tight",
    },
  ];

  const badgeText = isAr
    ? "متوافق مع حلول الدفع البنكية والمحافظ الإلكترونية في موريتانيا"
    : "Intégré avec Bankily, Seddap & les banques en Mauritanie";

  return (
    <section
      className="py-4 sm:py-5 bg-white border-y border-slate-100 overflow-hidden shrink-0"
      id="partenaires"
      aria-label="Partenaires et intégrations bancaires"
    >
      {/* Conteneur de défilement continu avec texte intégré directement dans le flux */}
      <div className="mask-fade-edges relative w-full overflow-hidden py-1">
        <div className="animate-marquee-track flex items-center space-x-12 sm:space-x-16">
          {/* Jeu 1 de Partenaires avec badge introductif intégré */}
          <div className="flex items-center space-x-10 sm:space-x-14 shrink-0">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200/90 px-4 py-1.5 rounded-full flex items-center gap-2 shrink-0 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{badgeText}</span>
            </span>

            {partners.map((p) => (
              <span
                key={p.id}
                className={`${p.weight} ${p.colorClass} opacity-75 hover:opacity-100 flex items-center gap-1.5 whitespace-nowrap select-none hover:scale-105 transition-all duration-200`}
              >
                {p.prefix}
                {p.name}
              </span>
            ))}
          </div>

          {/* Jeu 2 pour boucle infinie sans saccade avec badge introductif */}
          <div
            aria-hidden="true"
            className="flex items-center space-x-10 sm:space-x-14 shrink-0"
          >
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200/90 px-4 py-1.5 rounded-full flex items-center gap-2 shrink-0 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{badgeText}</span>
            </span>

            {partners.map((p) => (
              <span
                key={`${p.id}-duplicate`}
                className={`${p.weight} ${p.colorClass} opacity-75 hover:opacity-100 flex items-center gap-1.5 whitespace-nowrap select-none hover:scale-105 transition-all duration-200`}
              >
                {p.prefix}
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
