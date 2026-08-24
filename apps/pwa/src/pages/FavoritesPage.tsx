import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "@car-marketplace/types";
import { api } from "../api";
import { useFavoriteStore } from "../store";
import { PageHeader } from "../components/BackButton";
import { EmptyState, VehicleCardSkeleton } from "../components/EmptyState";
import { VehicleCard } from "../components/VehicleCard";

export function FavoritesPage() {
  const navigate = useNavigate();
  const ids = useFavoriteStore((s) => s.ids);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getVehicles({ limit: 50 })
      .then((res) => setVehicles(res.data.filter((v) => ids.includes(v._id))))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="screen">
      <PageHeader title="Favorites" subtitle="Cars you saved for later." />
      {loading ? (
        <>
          <VehicleCardSkeleton />
          <VehicleCardSkeleton />
        </>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Save vehicles from search or detail screens to find them here."
          actionLabel="Explore cars"
          onAction={() => navigate("/search")}
        />
      ) : (
        vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)
      )}
    </div>
  );
}
