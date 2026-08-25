import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ListingType, Vehicle } from "@car-marketplace/types";
import { api } from "../api";
import { BackButton } from "../components/BackButton";
import { SearchBar } from "../components/SearchBar";
import { EmptyState, VehicleCardSkeleton } from "../components/EmptyState";
import { VehicleCard } from "../components/VehicleCard";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price" },
  { value: "price_desc", label: "Year" },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [q, setQ] = useState(params.get("q") || "");
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const listingType = params.get("listingType") || "";

  useEffect(() => {
    api.getListingTypes().then((res) => setListingTypes(res.data ?? [])).catch(() => setListingTypes([]));
  }, []);

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
        listingType: params.get("listingType") || undefined,
        sort,
        limit: 20,
      })
      .then((res) => {
        setVehicles(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .catch(() => {
        setVehicles([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [q, params, sort]);

  return (
    <div className="screen">
      <div className="row between" style={{ marginBottom: 12 }}>
        <BackButton label={false} />
        <div style={{ flex: 1, margin: "0 10px" }}>
          <SearchBar value={q} onChange={setQ} />
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label="Favorites"
          onClick={() => navigate("/favorites")}
        >
          <Heart size={18} />
        </button>
      </div>
      <div className="hscroll sort-row">
        <button type="button" className="chip" onClick={() => navigate("/search")}>
          Filters
        </button>
        {listingTypes.map((t) => (
          <button
            key={t._id}
            type="button"
            className={`chip${listingType === t.slug ? " active" : ""}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (listingType === t.slug) next.delete("listingType");
              else next.set("listingType", t.slug);
              navigate(`/search?${next.toString()}`);
            }}
          >
            {t.name}
          </button>
        ))}
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
      <p className="results-count">{total.toLocaleString()} Cars Found</p>
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
