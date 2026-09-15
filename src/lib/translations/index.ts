import { fr } from "./fr";
import { ar } from "./ar";
import { en } from "./en";
import { zh } from "./zh";
import { SupportedLanguage, LanguageConfig, TranslationDictionary } from "./types";

export * from "./types";

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  fr,
  ar,
  en,
  zh,
};

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "fr",
    name: "Français",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabe",
    nativeName: "العربية",
    flag: "🇲🇷",
    dir: "rtl",
  },
  {
    code: "en",
    name: "Anglais",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
  },
  {
    code: "zh",
    name: "Chinois",
    nativeName: "中文",
    flag: "🇨🇳",
    dir: "ltr",
  },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "fr";

export function getTranslation(lang: SupportedLanguage = DEFAULT_LANGUAGE): TranslationDictionary {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}
