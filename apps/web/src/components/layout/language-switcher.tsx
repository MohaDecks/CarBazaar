"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { LOCALES, type Locale } from "@/i18n/locales";
import { useI18n } from "@/i18n/provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm text-gray-600 hover:bg-gray-100"
        aria-label={t("common.language")}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden uppercase sm:inline">{locale}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-50 mt-1 min-w-[160px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-md">
            {LOCALES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLocale(item.code as Locale);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-gray-50 ${
                  locale === item.code
                    ? "bg-accent-light font-medium text-accent"
                    : "text-brand-charcoal"
                }`}
              >
                <span>{item.native}</span>
                <span className="text-xs uppercase text-gray-400">
                  {item.code}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
