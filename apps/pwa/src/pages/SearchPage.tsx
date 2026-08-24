import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Vehicle } from "@car-marketplace/types";
import { api } from "../api";
import { PageHeader } from "../components/BackButton";
import { SearchBar } from "../components/SearchBar";
import { EmptyState, VehicleCardSkeleton } from "../components/EmptyState";
import { VehicleCard } from "../components/VehicleCard";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low" },
  { value: "price_desc", label: "Price: High" },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    setQ(params.get("q") || "");
    if (params.get("sort")) setSort(params.get("sort") || "newest");
  }, [params]);

  useEffect(() => {
    setLoading(true);
    api
      .getVehicles({
        q: q || params.get("q") || undefined,
        category: params.get("category") || undefined,
        brand: params.get("brand") || undefined,
        sort,
        limit: 20,
      })
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [q, params, sort]);

  return (
    <div className="screen">
      <PageHeader title="Explore" subtitle="Browse verified cars across Ethiopia." />
      <SearchBar value={q} onChange={setQ} />
      <div className="hscroll sort-row">
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`chip${sort === s.value ? " active" : ""}`}
            onClick={() => setSort(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {loading ? (
        <>
          <VehicleCardSkeleton />
          <VehicleCardSkeleton />
        </>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No cars found"
          description="Try changing your search or filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setQ("");
            setSort("newest");
            navigate("/search");
          }}
        />
      ) : (
        vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)
      )}
    </div>
  );
}
