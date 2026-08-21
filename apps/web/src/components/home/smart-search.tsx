"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ETHIOPIA_CITIES } from "@car-marketplace/utils";
import type { Brand } from "@car-marketplace/types";
import { useI18n } from "@/i18n/provider";

interface SmartSearchProps {
  brands: Brand[];
  variant?: "hero" | "page";
}

export function SmartSearch({ brands, variant = "hero" }: SmartSearchProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (location) params.set("city", location);
    router.push(`/cars?${params.toString()}`);
  }

  const selectClass =
    "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <form
      onSubmit={onSearch}
      className={
        variant === "hero"
          ? "grid gap-3 rounded-lg bg-white p-4 shadow-lg sm:grid-cols-2 lg:grid-cols-6"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
      }
    >
      <select
        className={selectClass}
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        aria-label={t("home.brand")}
      >
        <option value="">{t("home.brand")}</option>
        {brands.map((b) => (
          <option key={b._id} value={b.slug}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        aria-label={t("home.condition")}
      >
        <option value="">{t("home.condition")}</option>
        <option value="NEW">{t("home.conditionNew")}</option>
        <option value="USED">{t("home.conditionUsed")}</option>
        <option value="CERTIFIED_USED">{t("home.conditionCertified")}</option>
      </select>

      <Input
        type="number"
        placeholder={t("home.minPrice")}
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        aria-label={t("home.minPrice")}
      />
      <Input
        type="number"
        placeholder={t("home.maxPrice")}
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        aria-label={t("home.maxPrice")}
      />

      <select
        className={selectClass}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label={t("home.location")}
      >
        <option value="">{t("home.location")}</option>
        {ETHIOPIA_CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <Button type="submit" className="w-full">
        <Search className="h-4 w-4" />
        {t("home.searchCars")}
      </Button>
    </form>
  );
}
