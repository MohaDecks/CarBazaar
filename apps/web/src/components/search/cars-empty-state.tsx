"use client";

import { Car } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/i18n/provider";

export function CarsEmptyState() {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={Car}
      title={t("cars.emptyTitle")}
      description={t("cars.emptyDesc")}
      actionLabel={t("cars.clearAll")}
      actionHref="/cars"
    />
  );
}
