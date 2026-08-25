import { Suspense } from "react";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { SearchFilters } from "@/components/search/search-filters";
import type { SortOption } from "@car-marketplace/types";
import Link from "next/link";
import { T } from "@/components/i18n/t";
import { CarsEmptyState } from "@/components/search/cars-empty-state";

export const metadata: Metadata = {
  title: "Browse Cars",
  description: "Search new and used vehicles across Ethiopia. Filter by brand, price, and location.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function CarsPage({ searchParams }: PageProps) {
  const sort = (searchParams.sort as SortOption) || "newest";
  const page = Number(searchParams.page ?? 1);

  const [vehiclesRes, brandsRes, categoriesRes, listingTypesRes] = await Promise.all([
    api
      .getVehicles({
        brand: searchParams.brand,
        category: searchParams.category,
        listingType: searchParams.listingType,
        condition: searchParams.condition,
        minPrice: searchParams.minPrice
          ? Number(searchParams.minPrice)
          : undefined,
        maxPrice: searchParams.maxPrice
          ? Number(searchParams.maxPrice)
          : undefined,
        fuel: searchParams.fuel,
        transmission: searchParams.transmission,
        city: searchParams.city,
        featured: searchParams.featured === "true" ? true : undefined,
        q: searchParams.q,
        sort,
        page,
        limit: 12,
      })
      .catch(() => ({
        success: true as const,
        data: [],
        meta: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      })),
    api.getBrands().catch(() => ({ success: true as const, data: [] })),
    api.getCategories().catch(() => ({ success: true as const, data: [] })),
    api.getListingTypes().catch(() => ({ success: true as const, data: [] })),
  ]);

  const sortOptions: { value: SortOption; labelKey: "cars.newest" | "cars.priceLow" | "cars.priceHigh" | "common.mileage" | "home.featured" }[] = [
    { value: "newest", labelKey: "cars.newest" },
    { value: "price_asc", labelKey: "cars.priceLow" },
    { value: "price_desc", labelKey: "cars.priceHigh" },
    { value: "mileage", labelKey: "common.mileage" },
    { value: "featured", labelKey: "home.featured" },
  ];

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-brand-charcoal">
          <T k="cars.title" />
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {vehiclesRes.meta.total} <T k="cars.found" />
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="hidden w-64 shrink-0 lg:block">
          <Suspense>
            <SearchFilters
              brands={brandsRes.data}
              categories={categoriesRes.data}
              listingTypes={listingTypesRes.data}
            />
          </Suspense>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="#filters"
              className="inline-flex h-10 items-center rounded-md border border-gray-300 px-4 text-sm lg:hidden"
            >
              <T k="cars.filters" />
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                <T k="cars.sort" />:
              </span>
              <div className="flex flex-wrap gap-1">
                {sortOptions.map((opt) => {
                  const params = new URLSearchParams(
                    Object.entries(searchParams).filter(
                      (e): e is [string, string] => Boolean(e[1])
                    )
                  );
                  params.set("sort", opt.value);
                  params.delete("page");
                  return (
                    <Link
                      key={opt.value}
                      href={`/cars?${params.toString()}`}
                      className={
                        sort === opt.value
                          ? "rounded-md bg-brand-charcoal px-3 py-1.5 text-white"
                          : "rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      <T k={opt.labelKey} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-8 lg:hidden" id="filters">
            <Suspense>
              <SearchFilters
                brands={brandsRes.data}
                categories={categoriesRes.data}
                listingTypes={listingTypesRes.data}
              />
            </Suspense>
          </div>

          {vehiclesRes.data.length === 0 ? (
            <CarsEmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {vehiclesRes.data.map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </div>
          )}

          {vehiclesRes.meta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from(
                { length: vehiclesRes.meta.totalPages },
                (_, i) => i + 1
              ).map((p) => {
                const params = new URLSearchParams(
                  Object.entries(searchParams).filter(
                    (e): e is [string, string] => Boolean(e[1])
                  )
                );
                params.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/cars?${params.toString()}`}
                    className={
                      p === vehiclesRes.meta.page
                        ? "flex h-10 w-10 items-center justify-center rounded-md bg-accent text-sm text-white"
                        : "flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-sm hover:border-brand-charcoal"
                    }
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
