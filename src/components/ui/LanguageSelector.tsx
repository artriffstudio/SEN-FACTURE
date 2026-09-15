"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/translations";

interface LanguageSelectorProps {
  variant?: "pill" | "compact" | "header";
  className?: string;
}

export default function LanguageSelector({
  variant = "pill",
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage, currentLangConfig } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {variant === "compact" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200/90 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer shadow-2xs"
          title={`Langue: ${currentLangConfig.nativeName}`}
          aria-label="Changer de langue"
        >
          <span className="text-base leading-none">{currentLangConfig.flag}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full transition-all shadow-2xs hover:border-sky-300 cursor-pointer"
          title="Changer de langue"
        >
          <span className="text-sm leading-none">{currentLangConfig.flag}</span>
          <span className="font-bold">{currentLangConfig.code.toUpperCase()}</span>
          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-sky-600" : ""
            }`}
          />
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Globe size={12} className="text-sky-600" />
            <span>Langue / Language</span>
          </div>
          <div className="p-1 space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
