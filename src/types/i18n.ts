import { TRANSLATIONS } from "../constants/i18n";

export type Language = "ko" | "en";
export type TranslationKey = keyof typeof TRANSLATIONS.ko;
export type Translation = typeof TRANSLATIONS.ko;

export interface I18nContextType {
  language: Language;
  toggleLanguage: () => void;
}
