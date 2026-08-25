import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "@car-marketplace/types";
import { Cog } from "lucide-react";
import { api } from "../api";
import { PageHeader } from "../components/BackButton";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { VehicleCard } from "../components/VehicleCard";

export function PartsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getVehicles({ q, limit: 20 })
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="screen">
      <PageHeader title="Spare Parts" subtitle="Search listings from the marketplace." />
      <SearchBar value={q} onChange={setQ} />
      {loading ? (
        <div className="center">Loading</div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Cog}
          title="No parts listings yet"
          description="Parts use the same vehicle marketplace API. Try another search or browse cars."
          actionLabel="Explore cars"
          onAction={() => navigate("/search")}
        />
      ) : (
        <div style={{ marginTop: 16 }}>
          {vehicles.map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
