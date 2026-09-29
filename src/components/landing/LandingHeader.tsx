"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import FacturimLogo from "@/components/ui/FacturimLogo";

interface LandingHeaderProps {
  onContactClick?: () => void;
}

export default function LandingHeader({ onContactClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentLanguage } = useLanguage();

  const isAr = currentLanguage === "ar";

  const navLinks = isAr
    ? [
        { label: "المميزات", href: "#fonctionnalites" },
        { label: "الأسعار", href: "#tarifs" },
        { label: "الإعدادات", href: "#parametres" },
        { label: "اتصل بنا", href: "#contact" },
      ]
    : [
        { label: "Fonctionnalités", href: "#fonctionnalites" },
        { label: "Tarifs", href: "#tarifs" },
        { label: "Paramètres", href: "#parametres" },
        { label: "Contact", href: "#contact" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 h-20 flex items-center justify-between">
        {/* Brand Logo officiel Facturim */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link href="/" className="flex items-center group">
            <FacturimLogo variant="full" size="md" />
          </Link>
        </div>

        {/* Navigation Links Desktop (Pill Style avec espacement optimisé) */}
        <nav
          className="hidden md:flex items-center justify-center flex-1 max-w-3xl mx-6 lg:mx-10 gap-3.5 lg:gap-6 xl:gap-8"
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-5 lg:px-6 py-2.5 text-xs lg:text-sm font-bold text-slate-700 hover:text-sky-600 bg-slate-50/90 hover:bg-sky-50/80 rounded-full border border-slate-200/80 hover:border-sky-300 transition-all nav-pill-item shadow-2xs hover:scale-105 whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions Desktop : Langue + Connexion */}
        <div className="hidden sm:flex items-center space-x-3 lg:space-x-4 pr-1 shrink-0">
          {/* Multilingual Selector (AR, EN, ZH, FR) */}
          <LanguageSelector />

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 lg:px-7 py-2.5 text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-full shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            {isAr ? "تسجيل الدخول" : "Connexion"}
          </Link>
        </div>

        {/* Mobile Actions: Language + Connexion + Hamburger */}
        <div className="flex sm:hidden items-center space-x-2">
          <LanguageSelector />

          <Link
            href="/login"
            className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-full shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
          >
            {isAr ? "تسجيل" : "Connexion"}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Ouvrir le menu de navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Slide-down with frosted glass) */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 py-6 space-y-4 animate-in fade-in duration-200 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-semibold text-slate-800 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 rounded-2xl border border-slate-200/60 transition-all flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight size={16} className="text-slate-400" />
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-2xl text-center font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-sky-600 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
            >
              {isAr ? "تسجيل الدخول" : "Connexion"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
