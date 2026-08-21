"use client";

import { useI18n } from "@/i18n/provider";
import type { EnKeys } from "@/i18n/en";

type Key = keyof EnKeys;

export function T({ k }: { k: Key }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
