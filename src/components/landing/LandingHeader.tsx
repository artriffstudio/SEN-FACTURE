"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";

interface LandingHeaderProps {
  onContactClick?: () => void;
}

export default function LandingHeader({ onContactClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({
    code: "SN",
    label: "Sénégal (FCFA)",
    flag: "🇸🇳",
  });

  const navLinks = [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Paramètres", href: "#parametres" },
    { label: "Contact", href: "#contact" },
  ];

  const countries = [
    { code: "SN", label: "Sénégal (FCFA)", flag: "🇸🇳" },
    { code: "CI", label: "Côte d'Ivoire (FCFA)", flag: "🇨🇮" },
    { code: "ML", label: "Mali (FCFA)", flag: "🇲🇱" },
    { code: "BJ", label: "Bénin (FCFA)", flag: "🇧🇯" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo officiel SF avec centrage absolu */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/15 group-hover:scale-105 transition-transform shrink-0">
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
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              SEN <span className="text-sky-600">FACTURE</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links Desktop (Pill Style) */}
        <nav className="hidden md:flex items-center space-x-1.5" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-50/80 hover:bg-slate-100 rounded-full border border-slate-200/60 transition-all nav-pill-item shadow-2xs"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions Desktop : Connexion décalé vers la gauche avec dégradé bleu ciel & Sélecteur de pays */}
        <div className="hidden sm:flex items-center space-x-3.5 pr-1">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-full shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 hover:-translate-y-0.5 active:scale-95 transition-all mr-1.5"
          >
            Connexion
          </Link>

          {/* Language / Region Pill Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200/90 rounded-full hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
              title="Sélectionner votre pays / devise"
            >
              <span className="text-base leading-none">{selectedLang.flag}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Zone UEMOA / OHADA
                </div>
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedLang(c);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedLang.code === c.code
                        ? "bg-sky-50 text-sky-700 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex sm:hidden items-center space-x-2.5">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-full shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
          >
            Connexion
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Ouvrir le menu de navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
              Connexion
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
