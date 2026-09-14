"use client";

import React from "react";

export interface FeatureCardProps {
  icon: React.ReactNode;
  badgeText: string;
  badgeColorClass: string;
  iconBgClass: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  badgeText,
  badgeColorClass,
  iconBgClass,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/80 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
      <div>
        {/* Conteneur d'icône avec micro-zoom et élévation au survol */}
        <div
          className={`w-14 h-14 rounded-2xl ${iconBgClass} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xs`}
        >
          {icon}
        </div>

        {/* Badge de statut pilule */}
        <span
          className={`inline-block px-3 py-1 rounded-full ${badgeColorClass} text-[11px] font-bold uppercase tracking-wider mb-3`}
        >
          {badgeText}
        </span>

        {/* Titre */}
        <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-sky-950 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
