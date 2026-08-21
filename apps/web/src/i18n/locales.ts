export type Locale = "en" | "so" | "am" | "ar";

export const LOCALES: { code: Locale; label: string; native: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "so", label: "Somali", native: "Soomaali", dir: "ltr" },
  { code: "am", label: "Amharic", native: "አማርኛ", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
];

export type TranslationKey = keyof typeof import("./en").en;
