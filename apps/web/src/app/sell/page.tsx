"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

export default function SellPage() {
  const { t } = useI18n();

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold text-brand-charcoal">
          {t("sell.title")}
        </h1>
        <p className="mt-4 text-gray-500">{t("sell.sub")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/seller/vehicles/new"
            className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {t("sell.listVehicle")}
          </Link>
          <Link
            href="/register?role=SELLER"
            className="inline-flex h-12 items-center rounded-md border border-gray-300 px-6 text-sm font-medium"
          >
            {t("sell.createSeller")}
          </Link>
        </div>
      </div>
    </div>
  );
}
