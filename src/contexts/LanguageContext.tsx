"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SupportedLanguage,
  TranslationDictionary,
  LanguageConfig,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getTranslation,
} from "@/lib/translations";

export interface LanguageContextType {
  language: SupportedLanguage;
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: ((path: string, fallback?: string) => string) & TranslationDictionary;
  dir: "ltr" | "rtl";
  currentLangConfig: LanguageConfig;
  formatMoney: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "facturim_preferred_language";

function createTranslateHelper(langDict: TranslationDictionary) {
  // Fonction de recherche par chemin clé pointé ex: "auth.login" ou "common.cancel"
  const translateFn = (path: string, fallback?: string): string => {
    if (!path) return fallback || "";
    const parts = path.split(".");
    let current: any = langDict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current && current[part] !== undefined) {
        current = current[part];
      } else {
        return fallback !== undefined ? fallback : "";
      }
    }
    return typeof current === "string" ? current : (fallback !== undefined ? fallback : "");
  };

  // On assigne également toutes les propriétés de l'objet dictionnaire pour un accès direct t.auth.login
  return Object.assign(translateFn, langDict) as ((path: string, fallback?: string) => string) & TranslationDictionary;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (savedLang && (savedLang === "fr" || savedLang === "ar" || savedLang === "en" || savedLang === "zh")) {
        setLanguageState(savedLang);
      }
    } catch {
      // Ignorer si localStorage n'est pas accessible
    }
    setMounted(true);
  }, []);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      const config = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
        document.documentElement.dir = config?.dir || "ltr";
      }
    } catch {
      // Ignorer
    }
  };

  useEffect(() => {
    if (mounted && typeof document !== "undefined") {
      const config = SUPPORTED_LANGUAGES.find((l) => l.code === language);
      document.documentElement.lang = language;
      document.documentElement.dir = config?.dir || "ltr";
    }
  }, [language, mounted]);

  const currentLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const rawDict = getTranslation(language);
  const t = createTranslateHelper(rawDict);

  const formatMoney = (amount: number): string => {
    const formatted = new Intl.NumberFormat(
      language === "ar" ? "ar-MR" : language === "zh" ? "zh-CN" : "fr-FR"
    ).format(amount || 0);

    if (language === "ar") {
      return `${formatted} أوقية`;
    }
    return `${formatted} MRU`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage: language,
        setLanguage,
        t,
        dir: currentLangConfig.dir,
        currentLangConfig,
        formatMoney,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackDict = getTranslation(DEFAULT_LANGUAGE);
    const fallbackT = createTranslateHelper(fallbackDict);
    return {
      language: DEFAULT_LANGUAGE,
      currentLanguage: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: fallbackT,
      dir: "ltr" as const,
      currentLangConfig: SUPPORTED_LANGUAGES[0],
      formatMoney: (amount: number) => `${new Intl.NumberFormat("fr-FR").format(amount || 0)} MRU`,
    };
  }
  return context;
}

export const useLanguage = useTranslation;
