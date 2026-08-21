import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";
import { VehicleCard } from "@/components/vehicles/vehicle-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { data } = await api.getDealer(params.slug);
    return {
      title: data.companyName,
      description: data.description?.slice(0, 160),
    };
  } catch {
    return { title: "Dealer" };
  }
}

export default async function DealerProfilePage({ params }: PageProps) {
  let dealer;
  try {
    const res = await api.getDealer(params.slug);
    dealer = res.data;
  } catch {
    notFound();
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-8 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-charcoal font-display text-2xl font-bold text-white">
          {dealer.companyName.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-semibold">
              {dealer.companyName}
            </h1>
            {dealer.verified && <BadgeCheck className="h-5 w-5 text-accent" />}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {dealer.location.city}, {dealer.location.region}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          {dealer.description && (
            <p className="text-sm leading-relaxed text-gray-600">
              {dealer.description}
            </p>
          )}

          <h2 className="mt-10 font-display text-xl font-semibold">
            Vehicles
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {(dealer.vehicles ?? []).map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        </div>

        <aside className="h-fit space-y-4 border border-gray-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold">Contact</h3>
          <p className="text-sm text-gray-600">{dealer.phone}</p>
          <p className="text-sm text-gray-600">{dealer.email}</p>
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-center">
            <div>
              <p className="font-display text-xl font-semibold">
                {dealer.stats.vehicles}
              </p>
              <p className="text-xs text-gray-500">Vehicles</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold">
                {dealer.stats.sold}
              </p>
              <p className="text-xs text-gray-500">Sold</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold">
                {dealer.stats.yearsActive}
              </p>
              <p className="text-xs text-gray-500">Years</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
