"use client";

import React from "react";

export default function PartnerMarquee() {
  const partners = [
    {
      id: "wave",
      name: "wave",
      colorClass: "text-sky-500",
      prefix: <span className="w-3 h-3 rounded-full bg-sky-400 inline-block shrink-0" />,
      weight: "font-black text-2xl tracking-tighter",
    },
    {
      id: "orange-money",
      name: "orange money",
      colorClass: "text-orange-500",
      prefix: <span className="w-4 h-4 rounded-md bg-orange-500 inline-block shrink-0" />,
      weight: "font-black text-xl tracking-tight",
    },
    {
      id: "ecobank",
      name: "Ecobank",
      colorClass: "text-emerald-700",
      weight: "font-extrabold text-xl tracking-widest uppercase",
    },
    {
      id: "sg",
      name: "SOCIÉTÉ GÉNÉRALE",
      colorClass: "text-red-600",
      prefix: <span className="w-3.5 h-3.5 bg-red-600 inline-block shrink-0" />,
      weight: "font-bold text-lg tracking-tight",
    },
    {
      id: "coris",
      name: "CORIS BANK",
      colorClass: "text-amber-600",
      weight: "font-black text-xl tracking-wide",
    },
    {
      id: "free-money",
      name: "Free Money",
      colorClass: "text-emerald-600",
      weight: "font-extrabold text-xl tracking-tight",
    },
    {
      id: "cbao",
      name: "CBAO Attijariwafa",
      colorClass: "text-blue-900",
      weight: "font-bold text-xl tracking-tighter",
    },
    {
      id: "uba",
      name: "UBA",
      colorClass: "text-red-700",
      weight: "font-black text-xl tracking-widest",
    },
    {
      id: "stripe",
      name: "Stripe",
      colorClass: "text-indigo-700",
      weight: "font-bold text-xl tracking-tight",
    },
    {
      id: "visa",
      name: "VISA",
      colorClass: "text-blue-600",
      weight: "font-extrabold text-xl tracking-tight",
    },
  ];

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
              <span>Intégré avec vos solutions de paiement &amp; banques</span>
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
              <span>Intégré avec vos solutions de paiement &amp; banques</span>
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
