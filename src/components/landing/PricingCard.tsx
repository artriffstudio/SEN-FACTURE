"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export interface PricingCardProps {
  name: string;
  subtitle: string;
  monthlyPrice: number;
  isYearly: boolean;
  features: Array<{ text: string; isBold?: boolean }>;
  ctaText: string;
  ctaHref: string;
  isPopular?: boolean;
}

export default function PricingCard({
  name,
  subtitle,
  monthlyPrice,
  isYearly,
  features,
  ctaText,
  ctaHref,
  isPopular = false,
}: PricingCardProps) {
  // Calcul avec 20% de remise si facturation annuelle
  const displayPrice = isYearly
    ? Math.round(monthlyPrice * 0.8)
    : monthlyPrice;

  return (
    <div
      className={`relative bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 group ${
        isPopular
          ? "border-2 border-sky-500 shadow-xl shadow-sky-500/10 hover:scale-[1.02] ring-4 ring-sky-100"
          : "border-2 border-sky-300 sm:border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1.5 hover:border-sky-400 active:scale-[0.98]"
      }`}
    >
      {/* Badge Top Hype si Populaire */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
          ⭐ Plus Populaire
        </div>
      )}

      <div>
        {/* En-tête de la carte avec micro-animation */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors duration-200">
            {name}
          </h3>
          {isPopular ? (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
              Recommandé
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors duration-200">
              {name === "Starter" ? "Freelance" : "Grand Compte"}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-6 font-normal group-hover:text-slate-600 transition-colors">
          {subtitle}
        </p>

        {/* Montant Tarifaire en FCFA */}
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-slate-950 tabular-nums group-hover:text-sky-950 transition-colors">
              {displayPrice.toLocaleString("fr-FR")}
            </span>
            <span className="text-sm font-semibold text-slate-500 ml-2">FCFA / mois</span>
          </div>
          {isYearly && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Facturé annuellement • 20% d&apos;économie
            </p>
          )}
        </div>

        {/* Liste des Fonctionnalités Incluses */}
        <ul className="space-y-3.5 text-sm text-slate-600 mb-8 border-t border-slate-100 pt-6">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start space-x-3">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-transform duration-200 group-hover:scale-110 ${
                  isPopular
                    ? "bg-sky-100 text-sky-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Check size={13} className="stroke-[3]" />
              </span>
              <span className={feature.isBold ? "font-bold text-slate-900" : "text-slate-700 font-medium"}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bouton d'action CTA */}
      <Link
        href={ctaHref}
        className={`w-full py-3.5 px-4 rounded-full text-center text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center ${
          isPopular
            ? "text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/25"
            : "text-slate-800 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200/80"
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
