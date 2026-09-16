"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BankilyLogo,
  MasrviLogo,
  SedadLogo,
  EywaLogo,
  BPMLogo,
  BMCILogo,
} from "@/components/ui/PaymentLogos";

export default function PartnerMarquee() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const partners = [
    {
      id: "bankily",
      component: <BankilyLogo variant="badge" height={28} />,
    },
    {
      id: "masrvi",
      component: <MasrviLogo variant="badge" height={28} />,
    },
    {
      id: "sedad",
      component: <SedadLogo variant="badge" height={28} />,
    },
    {
      id: "eywa",
      component: <EywaLogo variant="badge" height={28} />,
    },
    {
      id: "bpm",
      component: <BPMLogo height={26} />,
    },
    {
      id: "bmci",
      component: <BMCILogo height={26} />,
    },
    {
      id: "bnm",
      component: (
        <div className="inline-flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-amber-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
            BNM
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black text-slate-900 tracking-wider">BNM</span>
            <span className="text-[9px] text-slate-500 font-medium">Banque Nationale</span>
          </div>
        </div>
      ),
    },
    {
      id: "mauritel",
      component: (
        <div className="inline-flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
            M
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black text-slate-900 tracking-tight">Mauritel</span>
            <span className="text-[9px] text-slate-500 font-medium">Télécom</span>
          </div>
        </div>
      ),
    },
    {
      id: "chinguitel",
      component: (
        <div className="inline-flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
            C
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black text-slate-900 tracking-tight">Chinguitel</span>
            <span className="text-[9px] text-slate-500 font-medium">Réseau</span>
          </div>
        </div>
      ),
    },
    {
      id: "snim",
      component: (
        <div className="inline-flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
            SN
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black text-slate-900 tracking-widest uppercase">SNIM</span>
            <span className="text-[9px] text-slate-500 font-medium">Industrie</span>
          </div>
        </div>
      ),
    },
    {
      id: "visa",
      component: (
        <div className="inline-flex items-center gap-1.5 select-none">
          <span className="text-xl font-black italic tracking-tighter text-blue-700">VISA</span>
          <span className="text-[10px] font-bold text-slate-400">/ Mastercard</span>
        </div>
      ),
    },
  ];

  const badgeText = isAr
    ? "ربط مباشر مع حلول الدفع والمحافظ الإلكترونية"
    : "Intégrations bancaires directes & Mobile Money";

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
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 border border-slate-200/90 px-4 py-1.5 rounded-full flex items-center gap-2 shrink-0 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{badgeText}</span>
            </span>

            {partners.map((p) => (
              <div
                key={p.id}
                className="opacity-85 hover:opacity-100 flex items-center gap-1.5 whitespace-nowrap select-none hover:scale-105 transition-all duration-200"
              >
                {p.component}
              </div>
            ))}
          </div>

          {/* Jeu 2 pour boucle infinie sans saccade avec badge introductif */}
          <div
            aria-hidden="true"
            className="flex items-center space-x-10 sm:space-x-14 shrink-0"
          >
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 border border-slate-200/90 px-4 py-1.5 rounded-full flex items-center gap-2 shrink-0 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{badgeText}</span>
            </span>

            {partners.map((p) => (
              <div
                key={`${p.id}-duplicate`}
                className="opacity-85 hover:opacity-100 flex items-center gap-1.5 whitespace-nowrap select-none hover:scale-105 transition-all duration-200"
              >
                {p.component}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
