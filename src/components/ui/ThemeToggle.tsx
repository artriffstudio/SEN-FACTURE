"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={
        isDark
          ? isAr
            ? "التبديل إلى الوضع النهاري"
            : "Passer au mode jour"
          : isAr
          ? "التبديل إلى الوضع الليلي"
          : "Passer au mode nuit"
      }
      title={
        isDark
          ? isAr
            ? "الوضع النهاري"
            : "Mode Jour"
          : isAr
          ? "الوضع الليلي"
          : "Mode Nuit"
      }
      className="relative p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all shadow-2xs hover:shadow-md cursor-pointer flex items-center justify-center shrink-0"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 stroke-[2.2] animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 stroke-[2.2] animate-in -rotate-90 duration-200" />
        )}
      </div>
    </button>
  );
}
