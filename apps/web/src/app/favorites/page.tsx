"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Vehicle } from "@car-marketplace/types";
import Link from "next/link";

export default function FavoritesPage() {
  const { accessToken } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    api
      .getFavorites(accessToken)
      .then((res) => setVehicles(res.data.map((f) => f.vehicle)))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Favorites</h1>
        <p className="mt-2 text-sm text-gray-500">
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>{" "}
          to view your saved vehicles.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">Favorites</h1>
      <p className="mt-1 text-sm text-gray-500">Vehicles you&apos;ve saved</p>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-vehicle animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any vehicle to save it here."
          actionLabel="Browse cars"
          actionHref="/cars"
        />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard key={v._id} vehicle={{ ...v, isFavorited: true }} />
          ))}
        </div>
      )}
    </div>
  );
}
