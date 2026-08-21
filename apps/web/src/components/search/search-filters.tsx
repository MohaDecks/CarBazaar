"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Brand, Category } from "@car-marketplace/types";
import { ETHIOPIA_CITIES } from "@car-marketplace/utils";

interface SearchFiltersProps {
  brands: Brand[];
  categories: Category[];
}

export function SearchFilters({ brands, categories }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clear = () => router.push(pathname);

  const field =
    "mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Filters</h2>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-gray-500 hover:text-accent"
        >
          Clear all
        </button>
      </div>

      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Brand
        <select
          className={field}
          value={searchParams.get("brand") ?? ""}
          onChange={(e) => update("brand", e.target.value)}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Category
        <select
          className={field}
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Condition
        <select
          className={field}
          value={searchParams.get("condition") ?? ""}
          onChange={(e) => update("condition", e.target.value)}
        >
          <option value="">Any</option>
          <option value="NEW">New</option>
          <option value="USED">Used</option>
          <option value="CERTIFIED_USED">Certified</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
          Min price
          <input
            type="number"
            className={field}
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => update("minPrice", e.target.value)}
            placeholder="ETB"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
          Max price
          <input
            type="number"
            className={field}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => update("maxPrice", e.target.value)}
            placeholder="ETB"
          />
        </label>
      </div>

      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Fuel
        <select
          className={field}
          value={searchParams.get("fuel") ?? ""}
          onChange={(e) => update("fuel", e.target.value)}
        >
          <option value="">Any</option>
          <option value="PETROL">Petrol</option>
          <option value="DIESEL">Diesel</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ELECTRIC">Electric</option>
        </select>
      </label>

      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Transmission
        <select
          className={field}
          value={searchParams.get("transmission") ?? ""}
          onChange={(e) => update("transmission", e.target.value)}
        >
          <option value="">Any</option>
          <option value="AUTOMATIC">Automatic</option>
          <option value="MANUAL">Manual</option>
          <option value="CVT">CVT</option>
        </select>
      </label>

      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Location
        <select
          className={field}
          value={searchParams.get("city") ?? ""}
          onChange={(e) => update("city", e.target.value)}
        >
          <option value="">Anywhere</option>
          {ETHIOPIA_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
