"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useState } from "react";
import {
  formatCondition,
  formatFuel,
  formatMileage,
  formatTransmission,
} from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn, mediaUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

interface VehicleCardProps {
  vehicle: Vehicle & {
    isFavorited?: boolean;
    brand?: { name: string; slug: string };
  };
  className?: string;
}

function conditionVariant(condition: string) {
  if (condition === "NEW") return "new" as const;
  if (condition === "CERTIFIED_USED") return "certified" as const;
  return "used" as const;
}

function getBrandName(vehicle: VehicleCardProps["vehicle"]) {
  if (vehicle.brand?.name) return vehicle.brand.name;
  if (
    typeof vehicle.brandId === "object" &&
    vehicle.brandId &&
    "name" in (vehicle.brandId as object)
  ) {
    return (vehicle.brandId as { name: string }).name;
  }
  return "";
}

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const { accessToken } = useAuthStore();
  const [favorited, setFavorited] = useState(Boolean(vehicle.isFavorited));
  const [pending, setPending] = useState(false);
  const brandName = getBrandName(vehicle);

  async function onFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }
    setPending(true);
    try {
      await api.toggleFavorite(vehicle._id, accessToken, favorited);
      setFavorited(!favorited);
    } catch {
      // silent
    } finally {
      setPending(false);
    }
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden bg-white transition-shadow hover:shadow-md",
        className
      )}
    >
      <Link href={`/cars/${vehicle.slug}`} className="relative block">
        <div className="relative aspect-vehicle w-full overflow-hidden bg-gray-100">
          <Image
            src={mediaUrl(vehicle.mainImage, "card")}
            alt={`${brandName} ${vehicle.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute left-3 top-3">
            <Badge variant={conditionVariant(vehicle.condition)}>
              {formatCondition(vehicle.condition)}
            </Badge>
          </div>
          <button
            type="button"
            onClick={onFavorite}
            disabled={pending}
            aria-label={favorited ? "Remove favorite" : "Add favorite"}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white",
              favorited && "text-accent"
            )}
          >
            <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {brandName}
          </p>
          <Link href={`/cars/${vehicle.slug}`}>
            <h3 className="font-display text-lg font-semibold text-brand-charcoal hover:text-accent">
              {vehicle.title}
            </h3>
          </Link>
          <p className="mt-0.5 text-sm text-gray-500">{vehicle.year}</p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
          {vehicle.engine && <span>{vehicle.engine}</span>}
          <span>{formatFuel(vehicle.fuel)}</span>
          <span>{formatTransmission(vehicle.transmission)}</span>
          <span>{formatMileage(vehicle.mileage)}</span>
        </div>

        <PriceDisplay
          amount={vehicle.price}
          currency={vehicle.currency}
          negotiable={vehicle.negotiable}
        />

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {vehicle.location.city}, Ethiopia
            </span>
          </p>
          <Link
            href={`/cars/${vehicle.slug}`}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium transition hover:border-brand-charcoal"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <div className="aspect-vehicle animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse bg-gray-200" />
        <div className="h-5 w-3/4 animate-pulse bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse bg-gray-200" />
        <div className="h-6 w-1/3 animate-pulse bg-gray-200" />
      </div>
    </div>
  );
}
