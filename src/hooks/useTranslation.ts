import { useCallback } from "react";
import { TRANSLATIONS } from "../constants/i18n";
import { Language } from "../types/i18n";

type TranslationType = (typeof TRANSLATIONS)[Language];
type NestedTranslation = TranslationType | string;

export const useTranslation = (language: Language) => {
  const t = useCallback(
    (key: string) => {
      const keys = key.split(".");
      let value: NestedTranslation = TRANSLATIONS[language];

      for (const k of keys) {
        value = (value as unknown as Record<string, NestedTranslation>)?.[k];
      }

      return value || key;
    },
    [language]
  );

  return { t };
};
