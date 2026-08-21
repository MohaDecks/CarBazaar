"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { en, type EnKeys } from "./en";
import { so } from "./so";
import { am } from "./am";
import { ar } from "./ar";
import { LOCALES, type Locale } from "./locales";

const DICTS: Record<Locale, EnKeys> = { en, so, am, ar };

type TranslationKey = keyof EnKeys;

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "driveet-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("so");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && DICTS[saved]) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    const meta = LOCALES.find((l) => l.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta?.dir ?? "ltr";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => DICTS[locale][key] ?? DICTS.en[key] ?? key,
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      dir: LOCALES.find((l) => l.code === locale)?.dir ?? "ltr",
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
