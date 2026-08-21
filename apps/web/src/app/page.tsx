import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { SmartSearch } from "@/components/home/smart-search";
import { CategoryGrid } from "@/components/home/category-grid";
import { BrandStrip } from "@/components/home/brand-strip";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { DealerCard } from "@/components/dealers/dealer-card";
import { T } from "@/components/i18n/t";

export const dynamic = "force-dynamic";

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [brandsRes, categoriesRes, featuredRes, newestRes, dealersRes] =
    await Promise.all([
      safeFetch(() => api.getBrands(), { success: true, data: [] }),
      safeFetch(() => api.getCategories(), { success: true, data: [] }),
      safeFetch(
        () => api.getVehicles({ featured: true, limit: 4, sort: "featured" }),
        {
          success: true,
          data: [],
          meta: {
            page: 1,
            limit: 4,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      ),
      safeFetch(
        () => api.getVehicles({ limit: 4, sort: "newest" }),
        {
          success: true,
          data: [],
          meta: {
            page: 1,
            limit: 4,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      ),
      safeFetch(
        () => api.getDealers({ limit: 3 }),
        {
          success: true,
          data: [],
          meta: {
            page: 1,
            limit: 3,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      ),
    ]);

  return (
    <>
      <section className="relative min-h-[85vh] overflow-hidden bg-brand-charcoal">
        <Image
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          alt="Premium vehicle"
          fill
          priority
          className="object-cover object-center opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/60 to-transparent" />

        <div className="container-page relative flex min-h-[85vh] flex-col justify-end pb-16 pt-32">
          <p className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Drive<span className="text-accent-muted">ET</span>
          </p>
          <h1 className="mt-4 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
            <T k="home.heroTitle" />
          </h1>
          <p className="mt-3 max-w-md text-base text-gray-300">
            <T k="home.heroSubtitle" />
          </p>

          <div className="mt-8 max-w-5xl">
            <SmartSearch brands={brandsRes.data} />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-charcoal">
              <T k="home.categories" />
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              <T k="home.categoriesSub" />
            </p>
          </div>
        </div>
        <CategoryGrid categories={categoriesRes.data} />
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-brand-charcoal">
                <T k="home.featured" />
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                <T k="home.featuredSub" />
              </p>
            </div>
            <Link
              href="/cars?featured=true"
              className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
            >
              <T k="home.viewAll" /> <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRes.data.map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-charcoal">
              <T k="home.newArrivals" />
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              <T k="home.newArrivalsSub" />
            </p>
          </div>
          <Link
            href="/cars?sort=newest"
            className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
          >
            <T k="home.viewAll" /> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newestRes.data.map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white py-14">
        <div className="container-page">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-brand-charcoal">
            <T k="home.brands" />
          </h2>
          <BrandStrip brands={brandsRes.data} />
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-charcoal">
              <T k="home.dealers" />
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              <T k="home.dealersSub" />
            </p>
          </div>
          <Link
            href="/dealers"
            className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
          >
            <T k="home.viewAll" /> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {dealersRes.data.map((d) => (
            <DealerCard key={d._id} dealer={d} />
          ))}
        </div>
      </section>

      <section className="bg-brand-charcoal py-20">
        <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white">
              <T k="home.ctaTitle" />
            </h2>
            <p className="mt-2 max-w-md text-gray-400">
              <T k="home.ctaSub" />
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <T k="home.ctaButton" /> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
