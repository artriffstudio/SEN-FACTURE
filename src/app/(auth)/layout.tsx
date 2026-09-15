"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useTranslation } from "@/contexts/LanguageContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden">
      {/* Halo lumineux d'arrière-plan subtil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-100/50 via-sky-50/20 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Barre supérieure discrète */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
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
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-sm tracking-tight">
                {t.brandName.toUpperCase()}
              </span>
              <span className="bg-sky-100 text-sky-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                {t.countryName}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {t.brandTagline}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 font-semibold text-[11px]">
            <CheckCircle2 size={13} />
            DGI Mauritanie & TVA 16% Conforme
          </div>
          <LanguageSelector variant="pill" />
        </div>
      </header>

      {/* Contenu principal (Formulaires Login / Register) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Pied de page d'authentification */}
      <footer className="py-4 px-6 border-t border-slate-200/60 bg-white/50 backdrop-blur-xs text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <p>
          © {new Date().getFullYear()} {t.brandName}. Plateforme certifiée conforme aux normes fiscales de Mauritanie.
        </p>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-sky-600" />
            Chiffrement SSL 256 bits
          </span>
          <Link href="/support" className="hover:text-sky-600 transition-colors">
            Assistance & Hotline Nouakchott
          </Link>
        </div>
      </footer>
    </div>
  );
}
