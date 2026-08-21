import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Share2 } from "lucide-react";
import {
  formatCondition,
  formatFuel,
  formatMileage,
  formatTransmission,
} from "@car-marketplace/utils";
import { api } from "@/lib/api";
import { VehicleGallery } from "@/components/vehicles/vehicle-gallery";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";
import { ContactSeller } from "@/components/vehicles/contact-seller";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string[] };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = params.slug.join("/");
  try {
    const { data: v } = await api.getVehicleBySlug(slug);
    const brand =
      v.brand?.name ??
      (typeof v.brandId === "object" && v.brandId && "name" in v.brandId
        ? (v.brandId as { name: string }).name
        : "");
    const title = `${brand} ${v.title} ${v.year}`;
    return {
      title,
      description: v.description.slice(0, 160),
      openGraph: {
        title,
        description: v.description.slice(0, 160),
        images: [v.mainImage],
        type: "website",
      },
    };
  } catch {
    return { title: "Vehicle not found" };
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const slug = params.slug.join("/");

  let vehicle;
  try {
    const res = await api.getVehicleBySlug(slug);
    vehicle = res.data;
  } catch {
    notFound();
  }

  const similar = await api
    .getSimilar(vehicle._id)
    .then((r) => r.data)
    .catch(() => []);

  const brand =
    vehicle.brand?.name ??
    (typeof vehicle.brandId === "object" &&
    vehicle.brandId &&
    "name" in vehicle.brandId
      ? (vehicle.brandId as { name: string }).name
      : "");

  const specs = [
    { label: "Brand", value: brand },
    { label: "Model", value: vehicle.title },
    { label: "Year", value: String(vehicle.year) },
    { label: "Mileage", value: formatMileage(vehicle.mileage) },
    { label: "Fuel", value: formatFuel(vehicle.fuel) },
    {
      label: "Transmission",
      value: formatTransmission(vehicle.transmission),
    },
    { label: "Engine", value: vehicle.engine },
    { label: "Drive", value: vehicle.drive?.replace("_", "-") },
    { label: "Color", value: vehicle.color },
    { label: "Body Type", value: vehicle.bodyType },
  ].filter((s) => s.value);

  const featureGroups = [
    { label: "Safety", items: vehicle.features?.safety ?? [] },
    { label: "Comfort", items: vehicle.features?.comfort ?? [] },
    { label: "Technology", items: vehicle.features?.technology ?? [] },
    { label: "Exterior", items: vehicle.features?.exterior ?? [] },
    { label: "Interior", items: vehicle.features?.interior ?? [] },
  ].filter((g) => g.items.length > 0);

  const conditionVariant =
    vehicle.condition === "NEW"
      ? "new"
      : vehicle.condition === "CERTIFIED_USED"
        ? "certified"
        : "used";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${brand} ${vehicle.title}`,
    model: vehicle.title,
    brand: brand,
    vehicleModelDate: vehicle.year,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    },
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: vehicle.currency || "ETB",
      availability: "https://schema.org/InStock",
    },
    image: vehicle.mainImage,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page py-6 lg:py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-accent">
            Cars
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-charcoal">
            {brand} {vehicle.title}
          </span>
        </nav>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={conditionVariant}>
                {formatCondition(vehicle.condition)}
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-semibold text-brand-charcoal lg:text-4xl">
              {brand} {vehicle.title}
            </h1>
            <p className="mt-1 text-gray-500">{vehicle.year}</p>
            <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {vehicle.location.city}, {vehicle.location.region}, Ethiopia
            </p>
          </div>
          <div className="flex items-start gap-4">
            <PriceDisplay
              amount={vehicle.price}
              currency={vehicle.currency}
              size="lg"
              negotiable={vehicle.negotiable}
            />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:border-brand-charcoal"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <VehicleGallery vehicle={vehicle} />

          <div className="space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold">
                Specifications
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                {specs.map((s) => (
                  <div key={s.label} className="border-b border-gray-200 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-gray-500">
                      {s.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-brand-charcoal">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <ContactSeller vehicle={vehicle} />
          </div>
        </div>

        {featureGroups.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold">Features</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureGroups.map((g) => (
                <div key={g.label}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {g.label}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {g.items.map((item) => (
                      <li key={item} className="text-sm text-brand-charcoal">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-semibold">Description</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {vehicle.description}
          </p>
        </section>

        {vehicle.dealer && (
          <section className="mt-12 border border-gray-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Dealer</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/dealers/${(vehicle.dealer as { slug: string }).slug}`}
                  className="font-medium text-accent hover:underline"
                >
                  {(vehicle.dealer as { companyName: string }).companyName}
                </Link>
                <p className="text-sm text-gray-500">
                  {(vehicle.dealer as { location: { city: string } }).location
                    ?.city}
                </p>
              </div>
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-semibold">
              Similar Vehicles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
